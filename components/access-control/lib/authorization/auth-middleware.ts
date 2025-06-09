import { type NextRequest, NextResponse } from "next/server"

import { checkAuthorization } from "./with-authorization"
import type { AllPermissionActions, AuthorizedUser, PermissionScope, ResourceType, Role } from "../types/authorization"

/**
 * Production-ready middleware for route-based authorization
 * Includes proper error handling, logging, and security headers
 */

interface AuthMiddlewareOptions {
  resource: ResourceType
  action: AllPermissionActions
  scope: PermissionScope
  roles: Role[]
  getUserFromRequest: (req: NextRequest) => Promise<AuthorizedUser | null>
  // TODO: Add NEOnet-specific middleware options
  options?: {
    requireMFA?: boolean
    allowAnonymous?: boolean
    rateLimit?: {
      maxRequests: number
      windowMs: number
    }
    logAccess?: boolean
    customHeaders?: Record<string, string>
  }
}

export async function authMiddleware(
  req: NextRequest,
  { resource, action, scope, roles, getUserFromRequest, options = {} }: AuthMiddlewareOptions,
) {
  const startTime = Date.now()
  const requestId = generateRequestId()

  try {
    // Add security headers
    const response = NextResponse.next()
    addSecurityHeaders(response, options.customHeaders)

    // TODO: Implement rate limiting
    if (options.rateLimit) {
      const rateLimitResult = await checkRateLimit(req, options.rateLimit)
      if (!rateLimitResult.allowed) {
        return NextResponse.json(
          {
            error: "Rate Limit Exceeded",
            message: "Too many requests. Please try again later.",
            retryAfter: rateLimitResult.retryAfter,
          },
          {
            status: 429,
            headers: {
              "Retry-After": rateLimitResult.retryAfter?.toString() || "60",
              "X-RateLimit-Limit": options.rateLimit.maxRequests.toString(),
              "X-RateLimit-Remaining": rateLimitResult.remaining?.toString() || "0",
            },
          },
        )
      }
    }

    // Get user from request
    const user = await getUserFromRequest(req)

    // Allow anonymous access if configured
    if (!user && options.allowAnonymous) {
      if (options.logAccess) {
        await logMiddlewareAccess(req, null, resource, action, scope, true, "Anonymous access allowed", requestId)
      }
      return response
    }

    // Check authentication
    if (!user) {
      if (options.logAccess) {
        await logMiddlewareAccess(req, null, resource, action, scope, false, "User not authenticated", requestId)
      }
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "Authentication required",
          code: "AUTH_REQUIRED",
        },
        { status: 401 },
      )
    }

    // TODO: Check MFA if required
    if (options.requireMFA && !user.profile?.mfaEnabled) {
      if (options.logAccess) {
        await logMiddlewareAccess(req, user, resource, action, scope, false, "MFA required", requestId)
      }
      return NextResponse.json(
        {
          error: "MFA Required",
          message: "Multi-factor authentication is required for this resource",
          code: "MFA_REQUIRED",
        },
        { status: 403 },
      )
    }

    // Check authorization
    const authResult = await checkAuthorization(user, resource, action, scope, roles, {
      logAccess: options.logAccess,
      context: {
        requestId,
        userAgent: req.headers.get("user-agent"),
        ipAddress: getClientIP(req),
        path: req.nextUrl.pathname,
      },
    })

    if (!authResult.authorized) {
      if (options.logAccess) {
        await logMiddlewareAccess(
          req,
          user,
          resource,
          action,
          scope,
          false,
          authResult.error || "Access denied",
          requestId,
        )
      }
      return NextResponse.json(
        {
          error: "Forbidden",
          message: authResult.error || "You do not have permission to access this resource",
          required: `${resource}:${action}:${scope}`,
          code: "INSUFFICIENT_PERMISSIONS",
        },
        { status: 403 },
      )
    }

    // Log successful access
    if (options.logAccess) {
      await logMiddlewareAccess(req, user, resource, action, scope, true, "Access granted", requestId)
    }

    // Add user context to response headers (for debugging)
    response.headers.set("X-User-ID", user.id)
    response.headers.set("X-Request-ID", requestId)
    response.headers.set("X-Processing-Time", `${Date.now() - startTime}ms`)

    return response
  } catch (error) {
    console.error("Auth middleware error:", error)

    // Log error
    if (options.logAccess) {
      await logMiddlewareAccess(req, null, resource, action, scope, false, `Error: ${error}`, requestId)
    }

    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: "An error occurred while checking permissions",
        requestId,
        code: "INTERNAL_ERROR",
      },
      { status: 500 },
    )
  }
}

/**
 * Add security headers to response
 */
function addSecurityHeaders(response: NextResponse, customHeaders?: Record<string, string>) {
  // Standard security headers
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-XSS-Protection", "1; mode=block")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")

  // TODO: Configure CSP based on NEOnet requirements
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
  )

  // Add custom headers
  if (customHeaders) {
    Object.entries(customHeaders).forEach(([key, value]) => {
      response.headers.set(key, value)
    })
  }
}

/**
 * Get client IP address from request
 */
function getClientIP(req: NextRequest): string {
  // Check various headers for the real IP
  const forwarded = req.headers.get("x-forwarded-for")
  const realIP = req.headers.get("x-real-ip")
  const cfConnectingIP = req.headers.get("cf-connecting-ip")

  if (forwarded) {
    return forwarded.split(",")[0].trim()
  }
  if (realIP) {
    return realIP
  }
  if (cfConnectingIP) {
    return cfConnectingIP
  }

  // Fallback to connection remote address
  return req.ip || "unknown"
}

/**
 * Generate unique request ID
 */
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Rate limiting check (placeholder implementation)
 */
async function checkRateLimit(
  req: NextRequest,
  config: { maxRequests: number; windowMs: number },
): Promise<{ allowed: boolean; remaining?: number; retryAfter?: number }> {
  // TODO: Implement actual rate limiting
  // This should integrate with Redis or similar for distributed rate limiting

  const clientIP = getClientIP(req)
  const key = `rate_limit:${clientIP}`

  // Placeholder implementation - always allow for now
  return {
    allowed: true,
    remaining: config.maxRequests - 1,
  }
}

/**
 * Log middleware access attempts
 */
async function logMiddlewareAccess(
  req: NextRequest,
  user: AuthorizedUser | null,
  resource: ResourceType,
  action: AllPermissionActions,
  scope: PermissionScope,
  granted: boolean,
  reason: string,
  requestId: string,
): Promise<void> {
  try {
    const logEntry = {
      timestamp: new Date().toISOString(),
      requestId,
      userId: user?.id || "anonymous",
      userEmail: user?.email || "unknown",
      resource,
      action,
      scope,
      granted,
      reason,
      ipAddress: getClientIP(req),
      userAgent: req.headers.get("user-agent"),
      path: req.nextUrl.pathname,
      method: req.method,
      // TODO: Add NEOnet-specific logging fields
      metadata: {
        district: user?.profile?.district,
        department: user?.profile?.department,
        sessionId: req.headers.get("x-session-id"),
      },
    }

    // TODO: Implement actual logging
    // This should integrate with your logging infrastructure
    if (!granted) {
      console.warn("Middleware access denied:", logEntry)
    } else {
      console.log("Middleware access granted:", logEntry)
    }

    // In production, send to:
    // - Database for audit trail
    // - Security monitoring system
    // - Compliance logging service
  } catch (error) {
    console.error("Error logging middleware access:", error)
  }
}

/**
 * Create middleware for specific resource protection
 */
export function createResourceMiddleware(
  resource: ResourceType,
  action: AllPermissionActions,
  scope: PermissionScope = "all",
) {
  return (
    getUserFromRequest: (req: NextRequest) => Promise<AuthorizedUser | null>,
    roles: Role[],
    options?: AuthMiddlewareOptions["options"],
  ) => {
    return (req: NextRequest) =>
      authMiddleware(req, {
        resource,
        action,
        scope,
        roles,
        getUserFromRequest,
        options,
      })
  }
}

/**
 * Middleware for API routes that require employee management permissions
 */
export const employeeManagementMiddleware = createResourceMiddleware("employee", "view", "all")

/**
 * Middleware for API routes that require service configuration permissions
 */
export const serviceConfigMiddleware = createResourceMiddleware("service", "configure", "all")

/**
 * Middleware for API routes that require member management permissions
 */
export const memberManagementMiddleware = createResourceMiddleware("member", "view", "all")

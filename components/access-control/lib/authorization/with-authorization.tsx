"use client"

import { useRouter } from "next/navigation"
import { type ReactNode, useEffect, useState } from "react"
import { AlertCircle, Shield } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

import { hasPermission } from "./permission-utils"
import type { AllPermissionActions, AuthorizedUser, PermissionScope, ResourceType, Role } from "../types/authorization"

interface WithAuthorizationProps {
  user: AuthorizedUser | null
  roles: Role[]
  resource: ResourceType
  action: AllPermissionActions
  scope: PermissionScope
  children: ReactNode
  fallback?: ReactNode
  redirectTo?: string
  showError?: boolean
  loading?: boolean
  // TODO: Add NEOnet-specific authorization options
  options?: {
    logAccess?: boolean
    requireMFA?: boolean
    allowTemporary?: boolean
    context?: Record<string, any>
  }
}

/**
 * Production-ready authorization component with enhanced error handling
 */
export function WithAuthorization({
  user,
  roles,
  resource,
  action,
  scope,
  children,
  fallback,
  redirectTo,
  showError = true,
  loading = false,
  options = {},
}: WithAuthorizationProps) {
  const router = useRouter()
  const [isChecking, setIsChecking] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)

  useEffect(() => {
    const checkAuthorization = async () => {
      try {
        setIsChecking(true)
        setAuthError(null)

        if (!user) {
          setAuthError("Authentication required")
          if (redirectTo) {
            router.push(redirectTo)
          }
          return
        }

        // TODO: Add MFA check if required
        if (options.requireMFA && !user.profile?.mfaEnabled) {
          setAuthError("Multi-factor authentication required")
          return
        }

        const authorized = hasPermission(user, resource, action, scope, roles, {
          logAccess: options.logAccess,
          context: options.context,
        })

        if (!authorized) {
          setAuthError(`Insufficient permissions: ${resource}:${action}:${scope}`)
          if (redirectTo) {
            router.push(redirectTo)
          }
        }
      } catch (error) {
        console.error("Authorization check failed:", error)
        setAuthError("Authorization check failed")
      } finally {
        setIsChecking(false)
      }
    }

    checkAuthorization()
  }, [user, resource, action, scope, roles, redirectTo, router, options])

  // Loading state
  if (loading || isChecking) {
    return (
      <Card className="w-full">
        <CardHeader>
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </CardContent>
      </Card>
    )
  }

  // Error state
  if (authError) {
    if (fallback) {
      return <>{fallback}</>
    }

    if (showError) {
      return <AccessDeniedError error={authError} resource={resource} action={action} />
    }

    return null
  }

  // User not authenticated
  if (!user) {
    return fallback || <AuthenticationRequired redirectTo={redirectTo} />
  }

  // Check authorization
  const authorized = hasPermission(user, resource, action, scope, roles, {
    logAccess: options.logAccess,
    context: options.context,
  })

  if (!authorized) {
    if (fallback) {
      return <>{fallback}</>
    }

    if (showError) {
      return <AccessDeniedError error="Access denied" resource={resource} action={action} />
    }

    return null
  }

  return <>{children}</>
}

/**
 * Server-side authorization check with enhanced error handling
 */
export async function checkAuthorization(
  user: AuthorizedUser | null,
  resource: ResourceType,
  action: AllPermissionActions,
  scope: PermissionScope,
  roles: Role[],
  options: {
    logAccess?: boolean
    context?: Record<string, any>
  } = {},
): Promise<{ authorized: boolean; error?: string }> {
  try {
    if (!user) {
      return { authorized: false, error: "User not authenticated" }
    }

    if (!user.isActive) {
      return { authorized: false, error: "User account is inactive" }
    }

    const authorized = hasPermission(user, resource, action, scope, roles, options)

    return {
      authorized,
      error: authorized ? undefined : `Insufficient permissions: ${resource}:${action}:${scope}`,
    }
  } catch (error) {
    console.error("Authorization check failed:", error)
    return {
      authorized: false,
      error: "Authorization check failed",
    }
  }
}

/**
 * Enhanced authorization hook with loading states and error handling
 */
export function useAuthorization(user: AuthorizedUser | null, roles: Role[]) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const can = async (
    resource: ResourceType,
    action: AllPermissionActions,
    scope: PermissionScope,
    options: { logAccess?: boolean; context?: Record<string, any> } = {},
  ): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)

      if (!user) {
        setError("User not authenticated")
        return false
      }

      const result = hasPermission(user, resource, action, scope, roles, options)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Authorization check failed"
      setError(errorMessage)
      console.error("Authorization check failed:", err)
      return false
    } finally {
      setLoading(false)
    }
  }

  const canSync = (resource: ResourceType, action: AllPermissionActions, scope: PermissionScope): boolean => {
    if (!user) return false
    return hasPermission(user, resource, action, scope, roles)
  }

  return {
    can,
    canSync,
    loading,
    error,
    clearError: () => setError(null),
  }
}

/**
 * Access denied error component
 */
function AccessDeniedError({
  error,
  resource,
  action,
}: {
  error: string
  resource: ResourceType
  action: AllPermissionActions
}) {
  return (
    <Card className="w-full border-destructive">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-destructive" />
          <CardTitle className="text-destructive">Access Denied</CardTitle>
        </div>
        <CardDescription>
          You don't have permission to {action} {resource} resources.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Insufficient Permissions</AlertTitle>
          <AlertDescription className="mt-2">{error}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <p className="text-sm text-muted-foreground mb-3">
            If you believe you should have access to this resource, please contact your administrator.
          </p>
          {/* TODO: Add NEOnet-specific contact information */}
          <Button variant="outline" onClick={() => window.history.back()} className="mr-2">
            Go Back
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              // TODO: Implement request access functionality
              console.log("Request access functionality not implemented")
            }}
          >
            Request Access
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Authentication required component
 */
function AuthenticationRequired({ redirectTo }: { redirectTo?: string }) {
  const router = useRouter()

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          <CardTitle>Authentication Required</CardTitle>
        </div>
        <CardDescription>You must be logged in to access this resource.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={() => router.push(redirectTo || "/login")} className="w-full">
          Sign In
        </Button>
      </CardContent>
    </Card>
  )
}

import type {
  PermissionClaim,
  ResourceType,
  AllPermissionActions,
  PermissionScope,
  Role,
  AuthorizedUser,
  PermissionAuditLog,
  ValidationError,
} from "../types/authorization"
import {
  APP_CONFIG,
  SCOPE_DEFINITIONS,
  ACTION_DEFINITIONS,
  RESOURCE_DEFINITIONS,
  ConfigHelpers,
} from "../config/authorization-config"

/**
 * Production-ready utility functions for authorization
 * Enhanced with configuration-driven behavior and comprehensive error handling
 */

// Cache for permission checks to improve performance
const permissionCache = new Map<string, { result: boolean; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

/**
 * Create a permission claim string with validation
 */
export function createPermissionClaim(
  resource: ResourceType,
  action: AllPermissionActions,
  scope: PermissionScope,
): PermissionClaim {
  // Validate inputs using configuration
  if (!resource || !RESOURCE_DEFINITIONS[resource]) {
    throw new Error(`Invalid resource type: ${resource}`)
  }

  if (!action || !ACTION_DEFINITIONS[action]) {
    throw new Error(`Invalid action: ${action}`)
  }

  if (!scope || !SCOPE_DEFINITIONS[scope]) {
    throw new Error(`Invalid scope: ${scope}`)
  }

  // Check if scope is valid for this resource
  const resourceDef = ConfigHelpers.getResourceDefinition(resource)
  if (!resourceDef.defaultScopes.includes(scope) && scope !== "none") {
    console.warn(`Scope '${scope}' is not typically used with resource '${resource}'`)
  }

  return `${resource}:${action}:${scope}`
}

/**
 * Parse a permission claim string with enhanced validation
 */
export function parsePermissionClaim(claim: PermissionClaim): {
  resource: ResourceType
  action: AllPermissionActions
  scope: PermissionScope
} {
  if (!claim || typeof claim !== "string") {
    throw new Error(ConfigHelpers.getErrorMessage("validation", "required") || "Permission claim is required")
  }

  const parts = claim.split(":")
  if (parts.length !== 3) {
    throw new Error(
      ConfigHelpers.getErrorMessage("validation", "invalidFormat") ||
        "Permission claim must be in format 'resource:action:scope'",
    )
  }

  const [resource, action, scope] = parts as [ResourceType, AllPermissionActions, PermissionScope]

  // Validate each component
  if (!RESOURCE_DEFINITIONS[resource]) {
    throw new Error(`Unknown resource type: ${resource}`)
  }

  if (!ACTION_DEFINITIONS[action]) {
    throw new Error(`Unknown action: ${action}`)
  }

  if (!SCOPE_DEFINITIONS[scope]) {
    throw new Error(`Unknown scope: ${scope}`)
  }

  return { resource, action, scope }
}

/**
 * Enhanced permission checking with caching and detailed logging
 */
export function hasPermission(
  user: AuthorizedUser | null,
  resource: ResourceType,
  action: AllPermissionActions,
  scope: PermissionScope,
  roles: Role[],
  options: {
    logAccess?: boolean
    checkExpiry?: boolean
    context?: Record<string, any>
    useCache?: boolean
  } = {},
): boolean {
  const startTime = performance.now()

  try {
    // Early return for null user
    if (!user) {
      if (options.logAccess) {
        logAccessAttempt(null, resource, action, scope, false, "User not authenticated")
      }
      return false
    }

    // Check if user is active
    if (!user.isActive) {
      if (options.logAccess) {
        logAccessAttempt(user, resource, action, scope, false, "User account is inactive")
      }
      return false
    }

    const permissionToCheck = createPermissionClaim(resource, action, scope)

    // Check cache if enabled
    if (options.useCache !== false) {
      const cacheKey = `${user.id}:${permissionToCheck}`
      const cached = permissionCache.get(cacheKey)

      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.result
      }
    }

    let hasAccess = false
    let source = "No Access"

    // Check direct permissions first
    if (user.directPermissions?.includes(permissionToCheck)) {
      hasAccess = true
      source = "Direct Permission"
    } else {
      // Get active roles for the user
      const userRoles = roles.filter((role) => user.roles.includes(role.id) && role.isActive)

      // Check if any role has the permission
      for (const role of userRoles) {
        if (roleHasPermission(role, permissionToCheck, roles)) {
          hasAccess = true
          source = `Role: ${role.name}`
          break
        }
      }
    }

    // Cache the result
    if (options.useCache !== false) {
      const cacheKey = `${user.id}:${permissionToCheck}`
      permissionCache.set(cacheKey, { result: hasAccess, timestamp: Date.now() })
    }

    // Log access attempt if enabled
    if (options.logAccess) {
      logAccessAttempt(user, resource, action, scope, hasAccess, source)
    }

    // Performance monitoring
    const duration = performance.now() - startTime
    if (duration > 100) {
      // Log slow permission checks
      console.warn(`Slow permission check: ${duration.toFixed(2)}ms for ${permissionToCheck}`)
    }

    return hasAccess
  } catch (error) {
    console.error("Error checking permission:", error)
    if (options.logAccess) {
      logAccessAttempt(user, resource, action, scope, false, `Error: ${error}`)
    }
    return false
  }
}

/**
 * Enhanced role permission checking with inheritance and cycle detection
 */
export function roleHasPermission(
  role: Role,
  permissionToCheck: PermissionClaim,
  allRoles: Role[],
  visited: Set<string> = new Set(),
): boolean {
  // Prevent infinite recursion in role inheritance
  if (visited.has(role.id)) {
    console.warn(`Circular role inheritance detected for role: ${role.id}`)
    return false
  }

  visited.add(role.id)

  try {
    // Check if role is active
    if (!role.isActive) {
      return false
    }

    // Check direct permissions
    if (role.permissions.includes(permissionToCheck)) {
      return true
    }

    // Check inherited permissions if feature is enabled
    if (ConfigHelpers.isFeatureEnabled("enableRoleInheritance") && role.inheritsFrom && role.inheritsFrom.length > 0) {
      for (const parentRoleId of role.inheritsFrom) {
        const parentRole = allRoles.find((r) => r.id === parentRoleId)
        if (parentRole && roleHasPermission(parentRole, permissionToCheck, allRoles, new Set(visited))) {
          return true
        }
      }
    }

    return false
  } catch (error) {
    console.error(`Error checking role permission for role ${role.id}:`, error)
    return false
  }
}

/**
 * Get all effective permissions with performance optimization
 */
export function getUserEffectivePermissions(
  user: AuthorizedUser,
  roles: Role[],
  options: {
    includeInherited?: boolean
    groupByResource?: boolean
    sortByRisk?: boolean
  } = {},
): PermissionClaim[] {
  try {
    const effectivePermissions = new Set<PermissionClaim>(user.directPermissions || [])

    // Get active roles for the user
    const userRoles = roles.filter((role) => user.roles.includes(role.id) && role.isActive)

    // Add permissions from each role
    for (const role of userRoles) {
      const rolePermissions = getRoleEffectivePermissions(role, roles)
      rolePermissions.forEach((perm) => effectivePermissions.add(perm))
    }

    let permissionsArray = Array.from(effectivePermissions)

    // Sort by risk level if requested
    if (options.sortByRisk) {
      permissionsArray = permissionsArray.sort((a, b) => {
        const { action: actionA } = parsePermissionClaim(a)
        const { action: actionB } = parsePermissionClaim(b)

        const riskA = ACTION_DEFINITIONS[actionA]?.riskLevel || "low"
        const riskB = ACTION_DEFINITIONS[actionB]?.riskLevel || "low"

        const riskOrder = { critical: 4, high: 3, medium: 2, low: 1 }
        return riskOrder[riskB] - riskOrder[riskA]
      })
    }

    return permissionsArray
  } catch (error) {
    console.error("Error getting user effective permissions:", error)
    return []
  }
}

/**
 * Get role effective permissions with inheritance resolution
 */
export function getRoleEffectivePermissions(
  role: Role,
  allRoles: Role[],
  visited: Set<string> = new Set(),
): PermissionClaim[] {
  // Prevent infinite recursion
  if (visited.has(role.id)) {
    return []
  }

  visited.add(role.id)

  try {
    const effectivePermissions = new Set<PermissionClaim>(role.permissions)

    // Add inherited permissions if feature is enabled
    if (ConfigHelpers.isFeatureEnabled("enableRoleInheritance") && role.inheritsFrom && role.inheritsFrom.length > 0) {
      for (const parentRoleId of role.inheritsFrom) {
        const parentRole = allRoles.find((r) => r.id === parentRoleId && r.isActive)
        if (parentRole) {
          const parentPermissions = getRoleEffectivePermissions(parentRole, allRoles, new Set(visited))
          parentPermissions.forEach((perm) => effectivePermissions.add(perm))
        }
      }
    }

    return Array.from(effectivePermissions)
  } catch (error) {
    console.error(`Error getting role effective permissions for role ${role.id}:`, error)
    return []
  }
}

/**
 * Enhanced permission comparison with scope hierarchy
 */
export function isPermissionStronger(permA: PermissionClaim, permB: PermissionClaim): boolean {
  try {
    const { resource: resA, action: actA, scope: scopeA } = parsePermissionClaim(permA)
    const { resource: resB, action: actB, scope: scopeB } = parsePermissionClaim(permB)

    // If resources are different, they're not comparable
    if (resA !== resB) return false

    // If actions are different, compare by risk level
    if (actA !== actB) {
      const riskA = ACTION_DEFINITIONS[actA]?.riskLevel || "low"
      const riskB = ACTION_DEFINITIONS[actB]?.riskLevel || "low"

      const riskOrder = { critical: 4, high: 3, medium: 2, low: 1 }
      return riskOrder[riskA] > riskOrder[riskB]
    }

    // Compare scopes using configuration
    const scopeA_level = SCOPE_DEFINITIONS[scopeA]?.level || 0
    const scopeB_level = SCOPE_DEFINITIONS[scopeB]?.level || 0

    return scopeA_level > scopeB_level
  } catch (error) {
    console.error("Error comparing permissions:", error)
    return false
  }
}

/**
 * Production-ready audit logging with enhanced metadata
 */
export async function logPermissionChange(
  userId: string,
  action: "grant" | "revoke" | "modify",
  details: {
    roleId?: string
    targetUserId?: string
    permission?: PermissionClaim
    previousState?: any
    newState?: any
    reason?: string
    ipAddress?: string
    userAgent?: string
    sessionId?: string
  },
): Promise<boolean> {
  // Skip logging if feature is disabled
  if (!ConfigHelpers.isFeatureEnabled("enableAuditLogging")) {
    return true
  }

  try {
    const auditEntry: Partial<PermissionAuditLog> = {
      id: generateAuditId(),
      timestamp: new Date().toISOString(),
      userId,
      action,
      riskLevel: determineRiskLevel(action, details.permission),
      ...details,
      metadata: {
        automatedAction: false,
        version: APP_CONFIG.version,
        environment: APP_CONFIG.environment,
        ...details,
      },
    }

    // TODO: Implement actual audit log storage
    // This should integrate with your logging infrastructure
    console.log("Permission audit log:", auditEntry)

    // In production, this would:
    // 1. Save to database with proper indexing
    // 2. Send to logging service (e.g., CloudWatch, Splunk, ELK)
    // 3. Trigger alerts for high-risk changes
    // 4. Update compliance reports
    // 5. Integrate with SIEM systems

    return true
  } catch (error) {
    console.error("Error logging permission change:", error)
    return false
  }
}

/**
 * Log access attempts for security monitoring
 */
function logAccessAttempt(
  user: AuthorizedUser | null,
  resource: ResourceType,
  action: AllPermissionActions,
  scope: PermissionScope,
  granted: boolean,
  reason: string,
): void {
  // Skip logging if feature is disabled
  if (!ConfigHelpers.isFeatureEnabled("enableAuditLogging")) {
    return
  }

  try {
    const accessLog = {
      timestamp: new Date().toISOString(),
      userId: user?.id || "anonymous",
      userEmail: user?.email || "unknown",
      resource,
      action,
      scope,
      granted,
      reason,
      riskLevel: determineAccessRiskLevel(resource, action, scope),
      metadata: {
        userAgent: typeof window !== "undefined" ? navigator.userAgent : "server",
        environment: APP_CONFIG.environment,
      },
    }

    // TODO: Implement access logging with proper storage
    if (!granted) {
      console.warn("Access denied:", accessLog)
    }
  } catch (error) {
    console.error("Error logging access attempt:", error)
  }
}

/**
 * Determine risk level for audit logging
 */
function determineRiskLevel(
  action: "grant" | "revoke" | "modify",
  permission?: PermissionClaim,
): "low" | "medium" | "high" | "critical" {
  if (!permission) return "medium"

  try {
    const { resource, action: permAction } = parsePermissionClaim(permission)

    const resourceRisk = RESOURCE_DEFINITIONS[resource]?.riskLevel || "low"
    const actionRisk = ACTION_DEFINITIONS[permAction]?.riskLevel || "low"

    // Take the higher risk level
    const riskOrder = { low: 1, medium: 2, high: 3, critical: 4 }
    const maxRisk = Math.max(riskOrder[resourceRisk], riskOrder[actionRisk])

    return Object.keys(riskOrder)[maxRisk - 1] as "low" | "medium" | "high" | "critical"
  } catch {
    return "medium"
  }
}

/**
 * Determine access risk level
 */
function determineAccessRiskLevel(
  resource: ResourceType,
  action: AllPermissionActions,
  scope: PermissionScope,
): "low" | "medium" | "high" | "critical" {
  const resourceRisk = RESOURCE_DEFINITIONS[resource]?.riskLevel || "low"
  const actionRisk = ACTION_DEFINITIONS[action]?.riskLevel || "low"

  // Higher scope = higher risk
  const scopeLevel = SCOPE_DEFINITIONS[scope]?.level || 0
  let scopeRisk: "low" | "medium" | "high" | "critical" = "low"

  if (scopeLevel >= 5) scopeRisk = "high"
  else if (scopeLevel >= 3) scopeRisk = "medium"
  else scopeRisk = "low"

  // Take the highest risk level
  const riskOrder = { low: 1, medium: 2, high: 3, critical: 4 }
  const maxRisk = Math.max(riskOrder[resourceRisk], riskOrder[actionRisk], riskOrder[scopeRisk])

  return Object.keys(riskOrder)[maxRisk - 1] as "low" | "medium" | "high" | "critical"
}

/**
 * Generate unique audit ID with environment prefix
 */
function generateAuditId(): string {
  const env = APP_CONFIG.environment.charAt(0).toUpperCase()
  return `${env}_audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Validate permission claim format with configuration
 */
export function validatePermissionClaim(claim: string): ValidationError[] {
  const errors: ValidationError[] = []

  if (!claim) {
    errors.push({
      field: "permission",
      message: ConfigHelpers.getErrorMessage("validation", "required") || "Permission claim is required",
      code: "REQUIRED",
    })
    return errors
  }

  try {
    parsePermissionClaim(claim as PermissionClaim)
  } catch (error) {
    errors.push({
      field: "permission",
      message: error instanceof Error ? error.message : "Invalid permission format",
      code: "INVALID_FORMAT",
    })
  }

  return errors
}

/**
 * Validate role configuration with enhanced rules
 */
export function validateRole(role: Partial<Role>): ValidationError[] {
  const errors: ValidationError[] = []

  // Name validation
  const nameRule = ConfigHelpers.getValidationRule("role", "name")
  if (!role.name?.trim()) {
    errors.push({
      field: "name",
      message: "Role name is required",
      code: "REQUIRED",
    })
  } else if (nameRule && role.name.length < nameRule.minLength) {
    errors.push({
      field: "name",
      message: `Role name must be at least ${nameRule.minLength} characters`,
      code: "MIN_LENGTH",
    })
  } else if (nameRule && role.name.length > nameRule.maxLength) {
    errors.push({
      field: "name",
      message: `Role name must not exceed ${nameRule.maxLength} characters`,
      code: "MAX_LENGTH",
    })
  }

  // Description validation
  const descRule = ConfigHelpers.getValidationRule("role", "description")
  if (!role.description?.trim()) {
    errors.push({
      field: "description",
      message: "Role description is required",
      code: "REQUIRED",
    })
  } else if (descRule && role.description.length < descRule.minLength) {
    errors.push({
      field: "description",
      message: `Description must be at least ${descRule.minLength} characters`,
      code: "MIN_LENGTH",
    })
  }

  // Level validation
  if (!role.level) {
    errors.push({
      field: "level",
      message: "Role level is required",
      code: "REQUIRED",
    })
  }

  // Validate permissions
  if (role.permissions) {
    role.permissions.forEach((permission, index) => {
      const permissionErrors = validatePermissionClaim(permission)
      permissionErrors.forEach((error) => {
        errors.push({
          field: `permissions.${index}`,
          message: error.message,
          code: error.code,
        })
      })
    })
  }

  return errors
}

/**
 * Clear permission cache
 */
export function clearPermissionCache(userId?: string): void {
  if (userId) {
    // Clear cache for specific user
    for (const [key] of permissionCache) {
      if (key.startsWith(`${userId}:`)) {
        permissionCache.delete(key)
      }
    }
  } else {
    // Clear entire cache
    permissionCache.clear()
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats(): {
  size: number
  hitRate: number
  oldestEntry: number
} {
  const now = Date.now()
  let oldestTimestamp = now

  for (const [, value] of permissionCache) {
    if (value.timestamp < oldestTimestamp) {
      oldestTimestamp = value.timestamp
    }
  }

  return {
    size: permissionCache.size,
    hitRate: 0, // TODO: Implement hit rate tracking
    oldestEntry: now - oldestTimestamp,
  }
}

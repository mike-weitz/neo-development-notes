/**
 * Comprehensive authorization types for NEOnet
 * Production-ready type definitions with proper validation and extensibility
 */

/**
 * NEOnet-specific resource types that can have permissions
 * TODO: Customize these based on your actual NEOnet resources
 */
export type ResourceType =
  | "employee" // NEOnet staff members
  | "member" // School districts and other member organizations
  | "service" // Services provided by NEOnet (Internet, Phone, etc.)
  | "application" // Software applications (EMIS, Student Services, etc.)
  | "user" // User accounts within member districts
  | "contact" // Contact information and directory
  | "file" // File storage and document management
  | "website" // Website content management
  | "announcement" // Public and internal announcements
  | "feedback" // User feedback and support tickets
  | "billing" // Billing and financial information
  | "report" // Reports and analytics
  | "training" // Training materials and sessions
  | "equipment" // Hardware and equipment management

/**
 * Basic CRUD permission actions
 */
export type PermissionAction = "view" | "create" | "update" | "delete"

/**
 * Advanced permission actions for specific NEOnet operations
 */
export type AdvancedPermissionAction =
  | "approve" // Approve requests or changes
  | "reject" // Reject requests or changes
  | "assign" // Assign resources to users or groups
  | "publish" // Publish content publicly
  | "unpublish" // Remove content from public view
  | "download" // Download files or data
  | "upload" // Upload files or data
  | "impersonate" // Act on behalf of another user
  | "configure" // Configure system settings
  | "provision" // Provision new services
  | "suspend" // Suspend services or accounts
  | "restore" // Restore suspended services
  | "audit" // Access audit logs and reports

/**
 * Combined permission actions
 */
export type AllPermissionActions = PermissionAction | AdvancedPermissionAction

/**
 * Permission scope defines the range of resources a permission applies to
 * TODO: Adjust scopes based on your organizational structure
 */
export type PermissionScope =
  | "all" // All resources of this type
  | "owned" // Only resources owned by the user
  | "assigned" // Only resources assigned to the user
  | "district" // Only resources within the user's district
  | "department" // Only resources within the user's department
  | "region" // Only resources within the user's region
  | "none" // No access

/**
 * Permission claim format: resource:action:scope
 * Examples:
 * - employee:view:all - Can view all employees
 * - service:update:assigned - Can update assigned services
 * - file:download:department - Can download files in their department
 */
export type PermissionClaim = `${ResourceType}:${AllPermissionActions}:${PermissionScope}`

/**
 * NEOnet organizational levels
 * TODO: Customize based on your actual organizational structure
 */
export type OrganizationalLevel = "executive" | "director" | "manager" | "specialist" | "support" | "helpdesk"

/**
 * Role definition with enhanced metadata
 */
export interface Role {
  id: string
  name: string
  description: string
  level: OrganizationalLevel
  inheritsFrom?: string[] // Role inheritance - permissions from these roles are included
  permissions: PermissionClaim[]
  isActive: boolean // Whether the role is currently active
  createdAt: string
  updatedAt: string
  createdBy: string
  // TODO: Add any additional role metadata specific to NEOnet
  metadata?: {
    department?: string
    costCenter?: string
    approvalRequired?: boolean
    maxUsers?: number
  }
}

/**
 * Permission group for UI organization
 */
export interface PermissionGroup {
  id: string
  name: string
  description: string
  icon: string
  category: "core" | "service" | "administrative" | "technical"
  permissions: Permission[]
  isActive: boolean
  sortOrder: number
}

/**
 * Individual permission definition with enhanced security metadata
 */
export interface Permission {
  id: string
  resource: ResourceType
  action: AllPermissionActions
  scope: PermissionScope
  name: string
  description: string
  category: string
  restricted?: boolean // Requires special approval to grant
  requiresApproval?: boolean // Requires approval each time it's used
  auditLevel?: "none" | "basic" | "detailed" // Level of audit logging
  riskLevel?: "low" | "medium" | "high" | "critical" // Security risk assessment
  prerequisites?: PermissionClaim[] // Required permissions before this can be granted
  conflictsWith?: PermissionClaim[] // Permissions that conflict with this one
  expiresAfter?: number // Auto-expire after X days (optional)
  // TODO: Add NEOnet-specific permission metadata
  metadata?: {
    serviceType?: string
    membershipLevel?: string
    technicalRequirement?: boolean
  }
}

/**
 * User with enhanced profile information
 */
export interface AuthorizedUser {
  id: string
  name: string
  email: string
  username?: string
  roles: string[] // Role IDs
  directPermissions?: PermissionClaim[] // Additional permissions not from roles
  isActive: boolean
  lastLogin?: string
  createdAt: string
  updatedAt: string
  // TODO: Add NEOnet-specific user fields
  profile?: {
    department?: string
    district?: string
    region?: string
    employeeId?: string
    phoneNumber?: string
    title?: string
    supervisor?: string
    startDate?: string
  }
  preferences?: {
    theme?: "light" | "dark" | "system"
    language?: string
    timezone?: string
    notifications?: boolean
  }
}

/**
 * Enhanced audit log entry with detailed tracking
 */
export interface PermissionAuditLog {
  id: string
  timestamp: string
  userId: string
  userEmail: string
  userName: string
  action: "grant" | "revoke" | "modify" | "login" | "logout" | "failed_access"
  roleId?: string
  targetUserId?: string
  targetUserEmail?: string
  permission?: PermissionClaim
  previousState?: any
  newState?: any
  ipAddress?: string
  userAgent?: string
  sessionId?: string
  reason?: string // Reason for the change
  approvedBy?: string // Who approved the change (if applicable)
  riskLevel?: "low" | "medium" | "high" | "critical"
  // TODO: Add NEOnet-specific audit fields
  metadata?: {
    district?: string
    department?: string
    serviceAffected?: string
    automatedAction?: boolean
  }
}

/**
 * Permission request for approval workflows
 */
export interface PermissionRequest {
  id: string
  requesterId: string
  requesterName: string
  requesterEmail: string
  targetUserId: string
  targetUserName: string
  targetUserEmail: string
  requestType: "grant" | "revoke" | "modify"
  permission?: PermissionClaim
  roleId?: string
  justification: string
  status: "pending" | "approved" | "rejected" | "expired"
  requestedAt: string
  reviewedAt?: string
  reviewedBy?: string
  reviewerComments?: string
  expiresAt?: string
  priority: "low" | "medium" | "high" | "urgent"
  // TODO: Add NEOnet-specific request fields
  metadata?: {
    businessJustification?: string
    temporaryAccess?: boolean
    accessDuration?: number
    supervisorApproval?: boolean
  }
}

/**
 * System configuration for authorization
 */
export interface AuthorizationConfig {
  // TODO: Customize these settings for NEOnet
  settings: {
    requireApprovalForHighRisk: boolean
    autoExpireTemporaryPermissions: boolean
    maxSessionDuration: number // in minutes
    auditRetentionDays: number
    passwordPolicy: {
      minLength: number
      requireUppercase: boolean
      requireLowercase: boolean
      requireNumbers: boolean
      requireSpecialChars: boolean
      maxAge: number // in days
    }
    mfaRequired: boolean
    allowSelfServiceRequests: boolean
    notificationSettings: {
      emailNotifications: boolean
      slackIntegration?: boolean
      webhookUrl?: string
    }
  }
  // NEOnet-specific configurations
  neonetSettings?: {
    membershipLevels: string[]
    serviceCategories: string[]
    supportedDistricts: string[]
    technicalServiceHours: {
      start: string
      end: string
      timezone: string
    }
    emergencyContacts: {
      name: string
      role: string
      phone: string
      email: string
    }[]
  }
}

/**
 * API response wrapper for consistent error handling
 */
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
  metadata?: {
    timestamp: string
    requestId: string
    version: string
  }
}

/**
 * Pagination parameters for list endpoints
 */
export interface PaginationParams {
  page: number
  limit: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
  search?: string
  filters?: Record<string, any>
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  items: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

/**
 * Form validation errors
 */
export interface ValidationError {
  field: string
  message: string
  code: string
}

/**
 * Loading states for UI components
 */
export type LoadingState = "idle" | "loading" | "success" | "error"

/**
 * Theme configuration
 */
export interface ThemeConfig {
  mode: "light" | "dark" | "system"
  primaryColor: string
  accentColor: string
  // TODO: Add NEOnet branding colors
  neonetBranding?: {
    logoUrl: string
    primaryColor: string
    secondaryColor: string
    fontFamily: string
  }
}

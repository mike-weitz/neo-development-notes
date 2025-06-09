/**
 * Centralized configuration for the NEOnet Authorization System
 *
 * This file contains all configurable aspects of the authorization system,
 * making it easy to customize for different applications and environments.
 *
 * TODO: Move sensitive configurations to environment variables
 * TODO: Add validation for configuration values
 * TODO: Consider using a configuration schema validation library like Zod
 */

import type {
  ResourceType,
  AllPermissionActions,
  PermissionScope,
  OrganizationalLevel,
  Role,
  PermissionGroup,
  AuthorizationConfig,
} from "../types/authorization"

/**
 * Application-specific configuration
 * TODO: Customize these values for your specific NEOnet deployment
 */
export const APP_CONFIG = {
  // Application metadata
  name: "NEOnet Authorization System",
  version: "1.0.0",
  environment: process.env.NODE_ENV || "development",

  // API configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || "/api",
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
    retryDelay: 1000, // 1 second
  },

  // UI configuration
  ui: {
    defaultTheme: "light" as const,
    itemsPerPage: 25,
    maxItemsPerPage: 100,
    debounceDelay: 300, // milliseconds
    toastDuration: 5000, // milliseconds
  },

  // Security configuration
  security: {
    sessionTimeout: 8 * 60 * 60 * 1000, // 8 hours in milliseconds
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes
    passwordMinLength: 12,
    requireMFA: false, // TODO: Enable for production
    auditLogRetention: 90, // days
  },

  // Feature flags
  features: {
    enableAuditLogging: true,
    enableRealTimeUpdates: false, // TODO: Implement WebSocket support
    enableAdvancedPermissions: true,
    enableRoleInheritance: true,
    enableTemporaryPermissions: false, // TODO: Implement temporary access
    enableApprovalWorkflow: false, // TODO: Implement approval system
  },
} as const

/**
 * Resource type definitions with metadata
 * TODO: Customize these resources based on your NEOnet services
 */
export const RESOURCE_DEFINITIONS: Record<
  ResourceType,
  {
    label: string
    description: string
    category: "core" | "service" | "administrative" | "technical"
    icon: string
    defaultScopes: PermissionScope[]
    riskLevel: "low" | "medium" | "high" | "critical"
  }
> = {
  employee: {
    label: "Employee Management",
    description: "NEOnet staff and employee records",
    category: "core",
    icon: "Users",
    defaultScopes: ["all", "department", "assigned", "owned"],
    riskLevel: "high",
  },
  member: {
    label: "Member Districts",
    description: "School districts and member organizations",
    category: "core",
    icon: "Building",
    defaultScopes: ["all", "region", "assigned"],
    riskLevel: "medium",
  },
  service: {
    label: "NEOnet Services",
    description: "Internet, phone, networking, and technical services",
    category: "service",
    icon: "Server",
    defaultScopes: ["all", "assigned"],
    riskLevel: "high",
  },
  application: {
    label: "Software Applications",
    description: "EMIS, Student Services, Educational Technology apps",
    category: "technical",
    icon: "Monitor",
    defaultScopes: ["all", "assigned"],
    riskLevel: "medium",
  },
  user: {
    label: "User Accounts",
    description: "End user accounts within member districts",
    category: "administrative",
    icon: "User",
    defaultScopes: ["all", "district", "assigned"],
    riskLevel: "medium",
  },
  contact: {
    label: "Contact Directory",
    description: "Contact information and organizational directory",
    category: "administrative",
    icon: "Phone",
    defaultScopes: ["all", "district"],
    riskLevel: "low",
  },
  file: {
    label: "File Management",
    description: "Document storage and file sharing systems",
    category: "technical",
    icon: "FileText",
    defaultScopes: ["all", "department", "assigned", "owned"],
    riskLevel: "medium",
  },
  website: {
    label: "Website Content",
    description: "Public and internal website management",
    category: "administrative",
    icon: "Globe",
    defaultScopes: ["all"],
    riskLevel: "medium",
  },
  announcement: {
    label: "Announcements",
    description: "Public and internal announcements",
    category: "administrative",
    icon: "Megaphone",
    defaultScopes: ["all", "district"],
    riskLevel: "low",
  },
  feedback: {
    label: "Support Tickets",
    description: "User feedback and support ticket system",
    category: "service",
    icon: "MessageSquare",
    defaultScopes: ["all", "assigned"],
    riskLevel: "low",
  },
  billing: {
    label: "Billing & Finance",
    description: "Financial records and billing information",
    category: "administrative",
    icon: "CreditCard",
    defaultScopes: ["all", "district"],
    riskLevel: "critical",
  },
  report: {
    label: "Reports & Analytics",
    description: "System reports and data analytics",
    category: "administrative",
    icon: "BarChart",
    defaultScopes: ["all", "department", "assigned"],
    riskLevel: "medium",
  },
  training: {
    label: "Training Materials",
    description: "Educational content and training resources",
    category: "service",
    icon: "GraduationCap",
    defaultScopes: ["all"],
    riskLevel: "low",
  },
  equipment: {
    label: "Equipment Management",
    description: "Hardware inventory and equipment tracking",
    category: "technical",
    icon: "HardDrive",
    defaultScopes: ["all", "assigned"],
    riskLevel: "medium",
  },
} as const

/**
 * Permission action definitions with metadata
 */
export const ACTION_DEFINITIONS: Record<
  AllPermissionActions,
  {
    label: string
    description: string
    riskLevel: "low" | "medium" | "high" | "critical"
    category: "read" | "write" | "admin" | "special"
  }
> = {
  // Basic CRUD operations
  view: {
    label: "View",
    description: "Read access to view information",
    riskLevel: "low",
    category: "read",
  },
  create: {
    label: "Create",
    description: "Create new records or resources",
    riskLevel: "medium",
    category: "write",
  },
  update: {
    label: "Update",
    description: "Modify existing records or resources",
    riskLevel: "medium",
    category: "write",
  },
  delete: {
    label: "Delete",
    description: "Remove records or resources permanently",
    riskLevel: "critical",
    category: "admin",
  },

  // Advanced operations
  approve: {
    label: "Approve",
    description: "Approve requests or changes",
    riskLevel: "high",
    category: "admin",
  },
  reject: {
    label: "Reject",
    description: "Reject requests or changes",
    riskLevel: "medium",
    category: "admin",
  },
  assign: {
    label: "Assign",
    description: "Assign resources to users or groups",
    riskLevel: "medium",
    category: "admin",
  },
  publish: {
    label: "Publish",
    description: "Make content publicly available",
    riskLevel: "medium",
    category: "write",
  },
  unpublish: {
    label: "Unpublish",
    description: "Remove content from public view",
    riskLevel: "medium",
    category: "write",
  },
  download: {
    label: "Download",
    description: "Download files or export data",
    riskLevel: "low",
    category: "read",
  },
  upload: {
    label: "Upload",
    description: "Upload files or import data",
    riskLevel: "medium",
    category: "write",
  },
  impersonate: {
    label: "Impersonate",
    description: "Act on behalf of another user",
    riskLevel: "critical",
    category: "special",
  },
  configure: {
    label: "Configure",
    description: "Modify system settings and configurations",
    riskLevel: "high",
    category: "admin",
  },
  provision: {
    label: "Provision",
    description: "Deploy or provision new services",
    riskLevel: "high",
    category: "admin",
  },
  suspend: {
    label: "Suspend",
    description: "Temporarily disable services or accounts",
    riskLevel: "high",
    category: "admin",
  },
  restore: {
    label: "Restore",
    description: "Restore suspended services or accounts",
    riskLevel: "high",
    category: "admin",
  },
  audit: {
    label: "Audit",
    description: "Access audit logs and security reports",
    riskLevel: "medium",
    category: "read",
  },
} as const

/**
 * Permission scope definitions with hierarchy
 */
export const SCOPE_DEFINITIONS: Record<
  PermissionScope,
  {
    label: string
    description: string
    level: number // Higher number = broader scope
    icon: string
  }
> = {
  none: {
    label: "No Access",
    description: "No access to any resources",
    level: 0,
    icon: "X",
  },
  owned: {
    label: "Owned Only",
    description: "Only resources owned by the user",
    level: 1,
    icon: "User",
  },
  assigned: {
    label: "Assigned",
    description: "Only resources assigned to the user",
    level: 2,
    icon: "UserCheck",
  },
  district: {
    label: "District",
    description: "Resources within the user's district",
    level: 3,
    icon: "Building",
  },
  department: {
    label: "Department",
    description: "Resources within the user's department",
    level: 4,
    icon: "Users",
  },
  region: {
    label: "Region",
    description: "Resources within the user's region",
    level: 5,
    icon: "Map",
  },
  all: {
    label: "All",
    description: "All resources of this type",
    level: 6,
    icon: "Globe",
  },
} as const

/**
 * Organizational level definitions
 * TODO: Customize these levels based on your organizational structure
 */
export const ORGANIZATIONAL_LEVELS: Record<
  OrganizationalLevel,
  {
    label: string
    description: string
    hierarchy: number // Higher number = higher authority
    color: string
  }
> = {
  helpdesk: {
    label: "Help Desk",
    description: "First-line support and basic assistance",
    hierarchy: 1,
    color: "gray",
  },
  support: {
    label: "Support Staff",
    description: "Technical support and user assistance",
    hierarchy: 2,
    color: "blue",
  },
  specialist: {
    label: "Specialist",
    description: "Subject matter experts and service specialists",
    hierarchy: 3,
    color: "green",
  },
  manager: {
    label: "Manager",
    description: "Team and department managers",
    hierarchy: 4,
    color: "yellow",
  },
  director: {
    label: "Director",
    description: "Department directors and senior leadership",
    hierarchy: 5,
    color: "orange",
  },
  executive: {
    label: "Executive",
    description: "Executive leadership and administration",
    hierarchy: 6,
    color: "purple",
  },
} as const

/**
 * Default role templates
 * TODO: Customize these roles based on your organizational needs
 */
export const DEFAULT_ROLES: Omit<Role, "createdAt" | "updatedAt" | "createdBy">[] = [
  {
    id: "executive-director",
    name: "Executive Director",
    description: "Full administrative access to all NEOnet systems and services",
    level: "executive",
    permissions: [
      "employee:view:all",
      "employee:create:all",
      "employee:update:all",
      "employee:delete:all",
      "member:view:all",
      "member:create:all",
      "member:update:all",
      "member:delete:all",
      "service:view:all",
      "service:create:all",
      "service:update:all",
      "service:configure:all",
      "service:provision:all",
      "application:view:all",
      "application:create:all",
      "application:update:all",
      "application:configure:all",
      "billing:view:all",
      "billing:update:all",
      "report:view:all",
      "report:create:all",
      "equipment:view:all",
      "equipment:update:all",
      "audit:view:all",
    ],
    isActive: true,
  },
  {
    id: "technology-director",
    name: "Technology Director",
    description: "Manages technical services and infrastructure",
    level: "director",
    permissions: [
      "employee:view:department",
      "employee:update:department",
      "member:view:all",
      "member:update:assigned",
      "service:view:all",
      "service:update:all",
      "service:configure:all",
      "service:provision:assigned",
      "application:view:all",
      "application:update:all",
      "application:configure:assigned",
      "equipment:view:all",
      "equipment:update:assigned",
      "report:view:department",
    ],
    isActive: true,
  },
  {
    id: "service-specialist",
    name: "Service Specialist",
    description: "Handles specific service areas and member support",
    level: "specialist",
    permissions: [
      "member:view:assigned",
      "member:update:assigned",
      "service:view:assigned",
      "service:update:assigned",
      "application:view:assigned",
      "application:update:assigned",
      "user:view:assigned",
      "feedback:view:all",
      "feedback:update:assigned",
      "equipment:view:assigned",
    ],
    isActive: true,
  },
  {
    id: "support-staff",
    name: "Support Staff",
    description: "Provides technical support and assistance",
    level: "support",
    permissions: [
      "member:view:assigned",
      "user:view:assigned",
      "feedback:view:all",
      "feedback:update:all",
      "service:view:assigned",
      "application:view:assigned",
    ],
    isActive: true,
  },
  {
    id: "helpdesk-specialist",
    name: "Help Desk Specialist",
    description: "First-line support and ticket management",
    level: "helpdesk",
    permissions: ["user:view:all", "feedback:view:all", "feedback:update:all", "service:view:assigned"],
    isActive: true,
  },
] as const

/**
 * Permission groups for UI organization
 */
export const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    id: "core-management",
    name: "Core Management",
    description: "Essential system management functions",
    icon: "Shield",
    category: "core",
    permissions: [], // Will be populated dynamically
    isActive: true,
    sortOrder: 1,
  },
  {
    id: "service-operations",
    name: "Service Operations",
    description: "NEOnet service management and provisioning",
    icon: "Server",
    category: "service",
    permissions: [], // Will be populated dynamically
    isActive: true,
    sortOrder: 2,
  },
  {
    id: "administrative",
    name: "Administrative Functions",
    description: "Administrative and business operations",
    icon: "FileText",
    category: "administrative",
    permissions: [], // Will be populated dynamically
    isActive: true,
    sortOrder: 3,
  },
  {
    id: "technical-services",
    name: "Technical Services",
    description: "Technical infrastructure and support",
    icon: "Settings",
    category: "technical",
    permissions: [], // Will be populated dynamically
    isActive: true,
    sortOrder: 4,
  },
] as const

/**
 * System-wide authorization configuration
 */
export const AUTHORIZATION_CONFIG: AuthorizationConfig = {
  settings: {
    requireApprovalForHighRisk: true,
    autoExpireTemporaryPermissions: true,
    maxSessionDuration: APP_CONFIG.security.sessionTimeout / (1000 * 60), // Convert to minutes
    auditRetentionDays: APP_CONFIG.security.auditLogRetention,
    passwordPolicy: {
      minLength: APP_CONFIG.security.passwordMinLength,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      maxAge: 90, // days
    },
    mfaRequired: APP_CONFIG.security.requireMFA,
    allowSelfServiceRequests: false,
    notificationSettings: {
      emailNotifications: true,
      slackIntegration: false,
      webhookUrl: process.env.WEBHOOK_URL,
    },
  },
  // TODO: Customize these NEOnet-specific settings
  neonetSettings: {
    membershipLevels: ["Basic Member", "Premium Member", "Enterprise Member", "Consortium Member"],
    serviceCategories: [
      "EMIS Services",
      "Student Services",
      "Fiscal Services",
      "Educational Technology",
      "Technical Services",
      "Library Services",
      "Internet Services",
      "Phone Services",
      "Networking Services",
    ],
    supportedDistricts: [
      // TODO: Add your actual member districts
      "Sample School District",
      "Example City Schools",
      "Demo Township Schools",
    ],
    technicalServiceHours: {
      start: "07:00",
      end: "17:00",
      timezone: "America/New_York",
    },
    emergencyContacts: [
      // TODO: Add your actual emergency contacts
      {
        name: "Emergency Support",
        role: "24/7 Technical Support",
        phone: "(330) 555-HELP",
        email: "emergency@neonet.org",
      },
      {
        name: "Security Team",
        role: "Security Incidents",
        phone: "(330) 555-SEC1",
        email: "security@neonet.org",
      },
    ],
  },
} as const

/**
 * UI Theme and styling configuration
 */
export const UI_CONFIG = {
  themes: {
    light: {
      primary: "hsl(222.2 84% 4.9%)",
      secondary: "hsl(210 40% 96%)",
      accent: "hsl(210 40% 94%)",
      muted: "hsl(210 40% 96%)",
    },
    dark: {
      primary: "hsl(210 40% 98%)",
      secondary: "hsl(222.2 84% 4.9%)",
      accent: "hsl(217.2 32.6% 17.5%)",
      muted: "hsl(217.2 32.6% 17.5%)",
    },
  },
  animations: {
    duration: {
      fast: "150ms",
      normal: "300ms",
      slow: "500ms",
    },
    easing: {
      default: "cubic-bezier(0.4, 0, 0.2, 1)",
      bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
    },
  },
  breakpoints: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },
} as const

/**
 * Validation rules for different entities
 */
export const VALIDATION_RULES = {
  user: {
    name: {
      minLength: 2,
      maxLength: 100,
      pattern: /^[a-zA-Z\s\-'.]+$/,
    },
    email: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    username: {
      minLength: 3,
      maxLength: 50,
      pattern: /^[a-zA-Z0-9_\-.]+$/,
    },
  },
  role: {
    name: {
      minLength: 3,
      maxLength: 100,
    },
    description: {
      minLength: 10,
      maxLength: 500,
    },
  },
  permission: {
    justification: {
      minLength: 20,
      maxLength: 1000,
    },
  },
} as const

/**
 * Error messages for consistent user experience
 */
export const ERROR_MESSAGES = {
  auth: {
    unauthorized: "You are not authorized to access this resource.",
    sessionExpired: "Your session has expired. Please log in again.",
    invalidCredentials: "Invalid username or password.",
    accountLocked: "Your account has been locked due to too many failed login attempts.",
    mfaRequired: "Multi-factor authentication is required.",
  },
  validation: {
    required: "This field is required.",
    invalidEmail: "Please enter a valid email address.",
    passwordTooShort: `Password must be at least ${APP_CONFIG.security.passwordMinLength} characters long.`,
    invalidFormat: "Invalid format. Please check your input.",
  },
  system: {
    networkError: "Network error. Please check your connection and try again.",
    serverError: "Server error. Please try again later.",
    notFound: "The requested resource was not found.",
    rateLimited: "Too many requests. Please wait before trying again.",
  },
} as const

/**
 * Helper functions for configuration
 */
export const ConfigHelpers = {
  /**
   * Get resource definition by type
   */
  getResourceDefinition: (resource: ResourceType) => RESOURCE_DEFINITIONS[resource],

  /**
   * Get action definition by action
   */
  getActionDefinition: (action: AllPermissionActions) => ACTION_DEFINITIONS[action],

  /**
   * Get scope definition by scope
   */
  getScopeDefinition: (scope: PermissionScope) => SCOPE_DEFINITIONS[scope],

  /**
   * Get organizational level definition
   */
  getOrganizationalLevel: (level: OrganizationalLevel) => ORGANIZATIONAL_LEVELS[level],

  /**
   * Check if a feature is enabled
   */
  isFeatureEnabled: (feature: keyof typeof APP_CONFIG.features) => APP_CONFIG.features[feature],

  /**
   * Get validation rule for a field
   */
  getValidationRule: (entity: keyof typeof VALIDATION_RULES, field: string) =>
    VALIDATION_RULES[entity]?.[field as keyof (typeof VALIDATION_RULES)[typeof entity]],

  /**
   * Get error message by key
   */
  getErrorMessage: (category: keyof typeof ERROR_MESSAGES, key: string) =>
    ERROR_MESSAGES[category]?.[key as keyof (typeof ERROR_MESSAGES)[typeof category]],
} as const

/**
 * Environment-specific overrides
 * TODO: Implement environment-specific configuration loading
 */
export const getEnvironmentConfig = () => {
  const env = APP_CONFIG.environment

  switch (env) {
    case "development":
      return {
        ...APP_CONFIG,
        security: {
          ...APP_CONFIG.security,
          requireMFA: false,
          maxLoginAttempts: 10, // More lenient for development
        },
        features: {
          ...APP_CONFIG.features,
          enableAuditLogging: false, // Reduce noise in development
        },
      }

    case "staging":
      return {
        ...APP_CONFIG,
        security: {
          ...APP_CONFIG.security,
          requireMFA: true,
        },
      }

    case "production":
      return {
        ...APP_CONFIG,
        security: {
          ...APP_CONFIG.security,
          requireMFA: true,
          maxLoginAttempts: 3, // Stricter for production
        },
        features: {
          ...APP_CONFIG.features,
          enableAuditLogging: true,
        },
      }

    default:
      return APP_CONFIG
  }
}

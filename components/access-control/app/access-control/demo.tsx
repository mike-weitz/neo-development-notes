"use client"

import { useState } from "react"
import { Check, Lock, Shield, User, X } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

import { hasPermission, getUserEffectivePermissions } from "@/lib/authorization/permission-utils"
import { useAuthorization } from "@/lib/authorization/with-authorization"
import type {
  AuthorizedUser,
  Role,
  ResourceType,
  AllPermissionActions,
  PermissionScope,
} from "@/lib/types/authorization"

// Demo data - NEOnet users with different roles and permissions
const demoUsers: AuthorizedUser[] = [
  {
    id: "user-exec-001",
    name: "Dr. Sarah Mitchell",
    email: "sarah.mitchell@neonet.org",
    username: "smitchell",
    roles: ["executive-director"],
    directPermissions: [],
    isActive: true,
    lastLogin: "2024-01-15T09:30:00Z",
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2024-01-15T09:30:00Z",
    profile: {
      department: "Executive",
      district: "NEOnet Central",
      region: "Northeast Ohio",
      employeeId: "EMP-001",
      phoneNumber: "(330) 555-0001",
      title: "Executive Director",
      supervisor: "Board of Directors",
      startDate: "2020-01-01",
    },
    preferences: {
      theme: "light",
      language: "en",
      timezone: "America/New_York",
      notifications: true,
    },
  },
  {
    id: "user-tech-002",
    name: "Michael Rodriguez",
    email: "michael.rodriguez@neonet.org",
    username: "mrodriguez",
    roles: ["tech-director"],
    directPermissions: ["application:configure:all"],
    isActive: true,
    lastLogin: "2024-01-15T08:45:00Z",
    createdAt: "2023-02-01T00:00:00Z",
    updatedAt: "2024-01-15T08:45:00Z",
    profile: {
      department: "Technology Services",
      district: "NEOnet Central",
      region: "Northeast Ohio",
      employeeId: "EMP-002",
      phoneNumber: "(330) 555-0002",
      title: "Technology Director",
      supervisor: "Dr. Sarah Mitchell",
      startDate: "2021-03-15",
    },
    preferences: {
      theme: "dark",
      language: "en",
      timezone: "America/New_York",
      notifications: true,
    },
  },
  {
    id: "user-spec-003",
    name: "Jennifer Chen",
    email: "jennifer.chen@neonet.org",
    username: "jchen",
    roles: ["service-specialist"],
    directPermissions: ["member:view:assigned", "feedback:update:all"],
    isActive: true,
    lastLogin: "2024-01-15T10:15:00Z",
    createdAt: "2023-03-01T00:00:00Z",
    updatedAt: "2024-01-15T10:15:00Z",
    profile: {
      department: "Member Services",
      district: "NEOnet Central",
      region: "Northeast Ohio",
      employeeId: "EMP-003",
      phoneNumber: "(330) 555-0003",
      title: "Service Specialist",
      supervisor: "Michael Rodriguez",
      startDate: "2022-06-01",
    },
    preferences: {
      theme: "system",
      language: "en",
      timezone: "America/New_York",
      notifications: false,
    },
  },
  {
    id: "user-supp-004",
    name: "David Thompson",
    email: "david.thompson@neonet.org",
    username: "dthompson",
    roles: ["support-staff"],
    directPermissions: [],
    isActive: true,
    lastLogin: "2024-01-15T07:30:00Z",
    createdAt: "2023-04-01T00:00:00Z",
    updatedAt: "2024-01-15T07:30:00Z",
    profile: {
      department: "Technical Support",
      district: "NEOnet Central",
      region: "Northeast Ohio",
      employeeId: "EMP-004",
      phoneNumber: "(330) 555-0004",
      title: "Support Technician",
      supervisor: "Jennifer Chen",
      startDate: "2023-01-15",
    },
    preferences: {
      theme: "light",
      language: "en",
      timezone: "America/New_York",
      notifications: true,
    },
  },
  {
    id: "user-help-005",
    name: "Amanda Foster",
    email: "amanda.foster@neonet.org",
    username: "afoster",
    roles: ["helpdesk"],
    directPermissions: ["user:view:all"],
    isActive: true,
    lastLogin: "2024-01-15T11:00:00Z",
    createdAt: "2023-05-01T00:00:00Z",
    updatedAt: "2024-01-15T11:00:00Z",
    profile: {
      department: "Help Desk",
      district: "NEOnet Central",
      region: "Northeast Ohio",
      employeeId: "EMP-005",
      phoneNumber: "(330) 555-0005",
      title: "Help Desk Specialist",
      supervisor: "David Thompson",
      startDate: "2023-08-01",
    },
    preferences: {
      theme: "light",
      language: "en",
      timezone: "America/New_York",
      notifications: true,
    },
  },
  {
    id: "user-inact-006",
    name: "Robert Wilson",
    email: "robert.wilson@neonet.org",
    username: "rwilson",
    roles: ["service-specialist"],
    directPermissions: [],
    isActive: false, // Inactive user for testing
    lastLogin: "2023-12-01T16:00:00Z",
    createdAt: "2022-01-01T00:00:00Z",
    updatedAt: "2023-12-01T16:00:00Z",
    profile: {
      department: "Member Services",
      district: "NEOnet Central",
      region: "Northeast Ohio",
      employeeId: "EMP-006",
      phoneNumber: "(330) 555-0006",
      title: "Former Service Specialist",
      supervisor: "Michael Rodriguez",
      startDate: "2022-01-01",
    },
    preferences: {
      theme: "light",
      language: "en",
      timezone: "America/New_York",
      notifications: false,
    },
  },
]

// Demo roles with realistic NEOnet permissions
const demoRoles: Role[] = [
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
    ],
    isActive: true,
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    createdBy: "system",
  },
  {
    id: "tech-director",
    name: "Technology Director",
    description: "Manages technical services and infrastructure for member districts",
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
      "equipment:view:all",
      "equipment:update:assigned",
      "report:view:department",
    ],
    isActive: true,
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    createdBy: "system",
  },
  {
    id: "service-specialist",
    name: "Service Specialist",
    description: "Handles specific service areas and provides support to assigned member districts",
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
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    createdBy: "system",
  },
  {
    id: "support-staff",
    name: "Support Staff",
    description: "Provides general technical support and assistance to member districts",
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
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    createdBy: "system",
  },
  {
    id: "helpdesk",
    name: "Help Desk",
    description: "First-line support and ticket management for member districts",
    level: "helpdesk",
    permissions: ["user:view:all", "feedback:view:all", "feedback:update:all", "service:view:assigned"],
    isActive: true,
    createdAt: "2023-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
    createdBy: "system",
  },
]

// Demo resources and actions for testing
const demoResources: Array<{
  resource: ResourceType
  actions: Array<{
    action: AllPermissionActions
    scope: PermissionScope
    label: string
    description: string
    riskLevel: "low" | "medium" | "high" | "critical"
  }>
}> = [
  {
    resource: "employee",
    actions: [
      {
        action: "view",
        scope: "all",
        label: "View All Employees",
        description: "Access to view all NEOnet staff information",
        riskLevel: "medium",
      },
      {
        action: "create",
        scope: "all",
        label: "Create Employees",
        description: "Add new staff members to the system",
        riskLevel: "high",
      },
      {
        action: "update",
        scope: "department",
        label: "Update Dept. Employees",
        description: "Modify staff information within department",
        riskLevel: "medium",
      },
      {
        action: "delete",
        scope: "all",
        label: "Delete Employees",
        description: "Remove staff members from the system",
        riskLevel: "critical",
      },
    ],
  },
  {
    resource: "member",
    actions: [
      {
        action: "view",
        scope: "all",
        label: "View All Members",
        description: "Access to view all member district information",
        riskLevel: "low",
      },
      {
        action: "create",
        scope: "all",
        label: "Create Members",
        description: "Add new member districts to NEOnet",
        riskLevel: "high",
      },
      {
        action: "update",
        scope: "assigned",
        label: "Update Assigned Members",
        description: "Modify assigned member district information",
        riskLevel: "medium",
      },
      {
        action: "delete",
        scope: "all",
        label: "Delete Members",
        description: "Remove member districts from NEOnet",
        riskLevel: "critical",
      },
    ],
  },
  {
    resource: "service",
    actions: [
      {
        action: "view",
        scope: "all",
        label: "View All Services",
        description: "Access to view all NEOnet services",
        riskLevel: "low",
      },
      {
        action: "configure",
        scope: "all",
        label: "Configure Services",
        description: "Modify service configurations and settings",
        riskLevel: "high",
      },
      {
        action: "provision",
        scope: "assigned",
        label: "Provision Services",
        description: "Deploy services to assigned districts",
        riskLevel: "high",
      },
      {
        action: "update",
        scope: "assigned",
        label: "Update Assigned Services",
        description: "Modify assigned service configurations",
        riskLevel: "medium",
      },
    ],
  },
  {
    resource: "application",
    actions: [
      {
        action: "view",
        scope: "all",
        label: "View All Applications",
        description: "Access to view all software applications",
        riskLevel: "low",
      },
      {
        action: "configure",
        scope: "all",
        label: "Configure Applications",
        description: "Modify application settings and configurations",
        riskLevel: "high",
      },
      {
        action: "update",
        scope: "assigned",
        label: "Update Assigned Apps",
        description: "Modify assigned application configurations",
        riskLevel: "medium",
      },
      {
        action: "create",
        scope: "all",
        label: "Create Applications",
        description: "Deploy new applications to the system",
        riskLevel: "high",
      },
    ],
  },
  {
    resource: "billing",
    actions: [
      {
        action: "view",
        scope: "all",
        label: "View All Billing",
        description: "Access to view all billing and financial information",
        riskLevel: "high",
      },
      {
        action: "update",
        scope: "all",
        label: "Update Billing",
        description: "Modify billing information and invoices",
        riskLevel: "critical",
      },
      {
        action: "create",
        scope: "all",
        label: "Create Billing",
        description: "Generate new invoices and billing records",
        riskLevel: "high",
      },
    ],
  },
  {
    resource: "equipment",
    actions: [
      {
        action: "view",
        scope: "all",
        label: "View All Equipment",
        description: "Access to view all hardware and equipment",
        riskLevel: "low",
      },
      {
        action: "update",
        scope: "assigned",
        label: "Update Assigned Equipment",
        description: "Modify assigned equipment information",
        riskLevel: "medium",
      },
      {
        action: "create",
        scope: "all",
        label: "Create Equipment",
        description: "Add new equipment to inventory",
        riskLevel: "medium",
      },
    ],
  },
]

export default function AuthorizationDemo() {
  const [selectedUser, setSelectedUser] = useState<AuthorizedUser>(demoUsers[0])
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid")
  const { canSync } = useAuthorization(selectedUser, demoRoles)

  const handleUserChange = (userId: string) => {
    const user = demoUsers.find((u) => u.id === userId)
    if (user) {
      setSelectedUser(user)
    }
  }

  const getAccessLevel = (
    resource: ResourceType,
    action: AllPermissionActions,
    scope: PermissionScope,
  ): {
    hasAccess: boolean
    source: string
    riskLevel: "low" | "medium" | "high" | "critical"
  } => {
    if (!selectedUser.isActive) {
      return { hasAccess: false, source: "User Inactive", riskLevel: "critical" }
    }

    const hasAccess = hasPermission(selectedUser, resource, action, scope, demoRoles)

    // Determine source of permission
    let source = "No Access"
    if (hasAccess) {
      const directPermission = selectedUser.directPermissions?.includes(`${resource}:${action}:${scope}`)
      if (directPermission) {
        source = "Direct Permission"
      } else {
        // Check which role provides this permission
        const userRoles = demoRoles.filter((role) => selectedUser.roles.includes(role.id))
        for (const role of userRoles) {
          if (role.permissions.includes(`${resource}:${action}:${scope}`)) {
            source = `Role: ${role.name}`
            break
          }
        }
      }
    }

    // Get risk level from demo data
    const resourceData = demoResources.find((r) => r.resource === resource)
    const actionData = resourceData?.actions.find((a) => a.action === action && a.scope === scope)
    const riskLevel = actionData?.riskLevel || "low"

    return { hasAccess, source, riskLevel }
  }

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "low":
        return "text-green-600 bg-green-50 border-green-200"
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "high":
        return "text-orange-600 bg-orange-50 border-orange-200"
      case "critical":
        return "text-red-600 bg-red-50 border-red-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  const getEffectivePermissions = () => {
    return getUserEffectivePermissions(selectedUser, demoRoles)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold">Authorization System Demo</h2>
          <p className="text-muted-foreground mt-1">
            Interactive demonstration of NEOnet's role-based access control system
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={viewMode} onValueChange={(value: "grid" | "table") => setViewMode(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="grid">Grid View</SelectItem>
              <SelectItem value="table">Table View</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* User Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Select User to Test
          </CardTitle>
          <CardDescription>Choose a NEOnet employee to see their permissions and access levels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {demoUsers.map((user) => (
              <Card
                key={user.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedUser.id === user.id ? "ring-2 ring-primary" : ""
                } ${!user.isActive ? "opacity-50" : ""}`}
                onClick={() => handleUserChange(user.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={`/placeholder.svg?height=48&width=48&text=${user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}`}
                        alt={user.name}
                      />
                      <AvatarFallback>
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm truncate">{user.name}</h3>
                        {!user.isActive && (
                          <Badge variant="destructive" className="text-xs">
                            Inactive
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{user.profile?.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.profile?.department}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {user.roles.map((roleId) => {
                          const role = demoRoles.find((r) => r.id === roleId)
                          return role ? (
                            <Badge key={roleId} variant="secondary" className="text-xs">
                              {role.name}
                            </Badge>
                          ) : null
                        })}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selected User Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Current User: {selectedUser.name}
          </CardTitle>
          <CardDescription>
            {selectedUser.profile?.title} - {selectedUser.profile?.department}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold mb-2">User Information</h4>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-medium">Email:</span> {selectedUser.email}
                </p>
                <p>
                  <span className="font-medium">Employee ID:</span> {selectedUser.profile?.employeeId}
                </p>
                <p>
                  <span className="font-medium">Department:</span> {selectedUser.profile?.department}
                </p>
                <p>
                  <span className="font-medium">Status:</span>
                  <Badge variant={selectedUser.isActive ? "default" : "destructive"} className="ml-2">
                    {selectedUser.isActive ? "Active" : "Inactive"}
                  </Badge>
                </p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Assigned Roles</h4>
              <div className="space-y-1">
                {selectedUser.roles.map((roleId) => {
                  const role = demoRoles.find((r) => r.id === roleId)
                  return role ? (
                    <Badge key={roleId} variant="outline" className="mr-1 mb-1">
                      {role.name}
                    </Badge>
                  ) : null
                })}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Direct Permissions</h4>
              <div className="space-y-1">
                {selectedUser.directPermissions && selectedUser.directPermissions.length > 0 ? (
                  selectedUser.directPermissions.map((permission) => (
                    <Badge key={permission} variant="secondary" className="mr-1 mb-1 text-xs">
                      {permission}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No direct permissions</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Access Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>Resource Access Matrix</CardTitle>
          <CardDescription>
            View what resources and actions this user can access based on their roles and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="matrix" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="matrix">Access Matrix</TabsTrigger>
              <TabsTrigger value="permissions">All Permissions</TabsTrigger>
            </TabsList>

            <TabsContent value="matrix" className="space-y-4">
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {demoResources.map((resourceGroup) => (
                    <Card key={resourceGroup.resource} className="h-fit">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg capitalize">{resourceGroup.resource}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {resourceGroup.actions.map((actionData) => {
                          const access = getAccessLevel(resourceGroup.resource, actionData.action, actionData.scope)
                          return (
                            <TooltipProvider key={`${actionData.action}-${actionData.scope}`}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div
                                    className={`flex items-center justify-between p-2 rounded-md border ${
                                      access.hasAccess ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      {access.hasAccess ? (
                                        <Check className="h-4 w-4 text-green-600" />
                                      ) : (
                                        <X className="h-4 w-4 text-red-600" />
                                      )}
                                      <span className="text-sm font-medium">{actionData.label}</span>
                                    </div>
                                    <Badge
                                      variant="outline"
                                      className={`text-xs ${getRiskLevelColor(actionData.riskLevel)}`}
                                    >
                                      {actionData.riskLevel}
                                    </Badge>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-xs">
                                  <div className="space-y-1">
                                    <p className="font-medium">{actionData.description}</p>
                                    <p className="text-xs">Source: {access.source}</p>
                                    <p className="text-xs">Risk Level: {actionData.riskLevel}</p>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )
                        })}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Resource</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Scope</TableHead>
                      <TableHead>Access</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Risk Level</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {demoResources.flatMap((resourceGroup) =>
                      resourceGroup.actions.map((actionData) => {
                        const access = getAccessLevel(resourceGroup.resource, actionData.action, actionData.scope)
                        return (
                          <TableRow key={`${resourceGroup.resource}-${actionData.action}-${actionData.scope}`}>
                            <TableCell className="font-medium capitalize">{resourceGroup.resource}</TableCell>
                            <TableCell>{actionData.action}</TableCell>
                            <TableCell>{actionData.scope}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {access.hasAccess ? (
                                  <Check className="h-4 w-4 text-green-600" />
                                ) : (
                                  <X className="h-4 w-4 text-red-600" />
                                )}
                                <span className={access.hasAccess ? "text-green-600" : "text-red-600"}>
                                  {access.hasAccess ? "Granted" : "Denied"}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm">{access.source}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={`text-xs ${getRiskLevelColor(actionData.riskLevel)}`}>
                                {actionData.riskLevel}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        )
                      }),
                    )}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            <TabsContent value="permissions" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">All Effective Permissions</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Complete list of permissions this user has access to (including inherited from roles)
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {getEffectivePermissions().map((permission) => (
                      <Badge key={permission} variant="outline" className="justify-start p-2 text-xs font-mono">
                        {permission}
                      </Badge>
                    ))}
                  </div>
                  {getEffectivePermissions().length === 0 && (
                    <div className="text-center py-8">
                      <Lock className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">No permissions available</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedUser.isActive
                          ? "User has no assigned roles or permissions"
                          : "User account is inactive"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Demo Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">Demo Instructions</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-700">
          <div className="space-y-2 text-sm">
            <p>
              <strong>How to use this demo:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Select different users above to see how their permissions change</li>
              <li>Green checkmarks indicate granted access, red X's indicate denied access</li>
              <li>Hover over actions to see detailed descriptions and permission sources</li>
              <li>Risk levels indicate the security impact of each permission</li>
              <li>Try the inactive user (Robert Wilson) to see how inactive accounts are handled</li>
              <li>Switch between Grid and Table view to see different perspectives</li>
              <li>Check the "All Permissions" tab to see the complete permission list</li>
            </ul>
            <p className="mt-4">
              <strong>Key Features Demonstrated:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Role-based access control with inheritance</li>
              <li>Direct permission assignments</li>
              <li>Permission scoping (all, department, assigned, etc.)</li>
              <li>Risk level assessment</li>
              <li>User status validation (active/inactive)</li>
              <li>Real-time permission checking</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

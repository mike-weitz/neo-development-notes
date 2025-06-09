"use client"

import React from "react"

import { useState } from "react"
import { Check, ChevronDown, Filter, Info, Save, Search } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/components/ui/use-toast"
import type { PermissionGroup, Role } from "@/lib/types/authorization"

// Sample permission groups
const permissionGroups: PermissionGroup[] = [
  {
    id: "employee-management",
    name: "Employee Management",
    description: "Manage NEOnet staff and employees",
    icon: "Users",
    permissions: [
      {
        id: "employee-view",
        resource: "employee",
        action: "view",
        scope: "all",
        name: "View Employees",
        description: "View employee information",
      },
      {
        id: "employee-create",
        resource: "employee",
        action: "create",
        scope: "all",
        name: "Create Employees",
        description: "Create new employee accounts",
        restricted: true,
      },
      {
        id: "employee-update",
        resource: "employee",
        action: "update",
        scope: "all",
        name: "Update Employees",
        description: "Update employee information",
      },
      {
        id: "employee-delete",
        resource: "employee",
        action: "delete",
        scope: "all",
        name: "Delete Employees",
        description: "Remove employee accounts",
        restricted: true,
        requiresApproval: true,
        auditLevel: "detailed",
      },
    ],
  },
  {
    id: "member-management",
    name: "Member Management",
    description: "Manage school districts and other members",
    icon: "Building",
    permissions: [
      {
        id: "member-view",
        resource: "member",
        action: "view",
        scope: "all",
        name: "View Members",
        description: "View member information",
      },
      {
        id: "member-create",
        resource: "member",
        action: "create",
        scope: "all",
        name: "Create Members",
        description: "Create new member accounts",
        restricted: true,
      },
      {
        id: "member-update",
        resource: "member",
        action: "update",
        scope: "all",
        name: "Update Members",
        description: "Update member information",
      },
      {
        id: "member-delete",
        resource: "member",
        action: "delete",
        scope: "all",
        name: "Delete Members",
        description: "Remove member accounts",
        restricted: true,
        requiresApproval: true,
        auditLevel: "detailed",
      },
    ],
  },
  {
    id: "service-management",
    name: "Service Management",
    description: "Manage NEOnet services",
    icon: "Server",
    permissions: [
      {
        id: "service-view",
        resource: "service",
        action: "view",
        scope: "all",
        name: "View Services",
        description: "View service information",
      },
      {
        id: "service-create",
        resource: "service",
        action: "create",
        scope: "all",
        name: "Create Services",
        description: "Create new services",
        restricted: true,
      },
      {
        id: "service-update",
        resource: "service",
        action: "update",
        scope: "all",
        name: "Update Services",
        description: "Update service information",
      },
      {
        id: "service-configure",
        resource: "service",
        action: "configure",
        scope: "all",
        name: "Configure Services",
        description: "Configure service settings",
        restricted: true,
      },
    ],
  },
]

// Sample roles
const roles: Role[] = [
  {
    id: "executive-director",
    name: "Executive Director",
    description: "Full administrative access",
    level: "executive",
    permissions: [],
  },
  {
    id: "tech-director",
    name: "Technology Director",
    description: "Manages technical services",
    level: "director",
    permissions: [],
  },
  {
    id: "service-specialist",
    name: "Service Specialist",
    description: "Handles specific services",
    level: "specialist",
    permissions: [],
  },
  {
    id: "support-staff",
    name: "Support Staff",
    description: "Provides technical support",
    level: "support",
    permissions: [],
  },
  {
    id: "helpdesk",
    name: "Help Desk",
    description: "First-line support",
    level: "helpdesk",
    permissions: [],
  },
]

// Initial permission matrix
const initialMatrix: Record<string, Record<string, string>> = {
  "employee-view": {
    "executive-director": "all",
    "tech-director": "department",
    "service-specialist": "department",
    "support-staff": "assigned",
    helpdesk: "none",
  },
  "employee-create": {
    "executive-director": "all",
    "tech-director": "department",
    "service-specialist": "none",
    "support-staff": "none",
    helpdesk: "none",
  },
  "employee-update": {
    "executive-director": "all",
    "tech-director": "department",
    "service-specialist": "assigned",
    "support-staff": "none",
    helpdesk: "none",
  },
  "employee-delete": {
    "executive-director": "all",
    "tech-director": "none",
    "service-specialist": "none",
    "support-staff": "none",
    helpdesk: "none",
  },
  "member-view": {
    "executive-director": "all",
    "tech-director": "all",
    "service-specialist": "assigned",
    "support-staff": "assigned",
    helpdesk: "assigned",
  },
  "member-create": {
    "executive-director": "all",
    "tech-director": "all",
    "service-specialist": "none",
    "support-staff": "none",
    helpdesk: "none",
  },
  "member-update": {
    "executive-director": "all",
    "tech-director": "all",
    "service-specialist": "assigned",
    "support-staff": "none",
    helpdesk: "none",
  },
  "service-view": {
    "executive-director": "all",
    "tech-director": "all",
    "service-specialist": "assigned",
    "support-staff": "assigned",
    helpdesk: "all",
  },
  "service-create": {
    "executive-director": "all",
    "tech-director": "all",
    "service-specialist": "none",
    "support-staff": "none",
    helpdesk: "none",
  },
  "service-update": {
    "executive-director": "all",
    "tech-director": "all",
    "service-specialist": "assigned",
    "support-staff": "none",
    helpdesk: "none",
  },
  "service-configure": {
    "executive-director": "all",
    "tech-director": "all",
    "service-specialist": "assigned",
    "support-staff": "none",
    helpdesk: "none",
  },
}

export default function PermissionMatrix() {
  const { toast } = useToast()
  const [matrix, setMatrix] = useState(initialMatrix)
  const [searchTerm, setSearchTerm] = useState("")
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set([permissionGroups[0].id]))
  const [visibleScopes, setVisibleScopes] = useState<Set<string>>(
    new Set(["all", "department", "assigned", "owned", "none"]),
  )

  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) => {
      const newOpen = new Set(prev)
      if (newOpen.has(groupId)) {
        newOpen.delete(groupId)
      } else {
        newOpen.add(groupId)
      }
      return newOpen
    })
  }

  const toggleScope = (scope: string) => {
    setVisibleScopes((prev) => {
      const newScopes = new Set(prev)
      if (newScopes.has(scope)) {
        newScopes.delete(scope)
      } else {
        newScopes.add(scope)
      }
      return newScopes
    })
  }

  const handlePermissionChange = (permissionId: string, roleId: string, scope: string) => {
    setMatrix((prev) => ({
      ...prev,
      [permissionId]: {
        ...prev[permissionId],
        [roleId]: scope,
      },
    }))
  }

  const handleSaveMatrix = () => {
    // Here you would save the matrix to your backend
    toast({
      title: "Permissions Saved",
      description: "The permission matrix has been updated successfully.",
    })
  }

  const filteredGroups = permissionGroups.filter(
    (group) =>
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.permissions.some(
        (perm) =>
          perm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          perm.description.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold">Permission Matrix</h2>
          <p className="text-muted-foreground mt-1">Configure detailed permissions for each role</p>
        </div>
        <Button onClick={handleSaveMatrix} size="lg">
          <Save className="mr-2 size-4" />
          Save Changes
        </Button>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search permissions..."
            className="pl-9 h-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-10">
              <Filter className="mr-2 size-4" />
              Filter Scopes
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Visible Scopes</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem checked={visibleScopes.has("all")} onCheckedChange={() => toggleScope("all")}>
              All
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={visibleScopes.has("department")}
              onCheckedChange={() => toggleScope("department")}
            >
              Department
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={visibleScopes.has("assigned")}
              onCheckedChange={() => toggleScope("assigned")}
            >
              Assigned
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked={visibleScopes.has("owned")} onCheckedChange={() => toggleScope("owned")}>
              Owned
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem checked={visibleScopes.has("none")} onCheckedChange={() => toggleScope("none")}>
              None
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50 sticky top-0">
              <TableRow>
                <TableHead className="w-[300px] font-medium">Permission</TableHead>
                {roles.map((role) => (
                  <TableHead key={role.id} className="text-center font-medium">
                    {role.name}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGroups.map((group) => (
                <React.Fragment key={group.id}>
                  <TableRow className="group hover:bg-muted/50">
                    <TableCell
                      colSpan={roles.length + 1}
                      className="cursor-pointer py-3 bg-muted/30"
                      onClick={() => toggleGroup(group.id)}
                    >
                      <div className="flex items-center gap-2">
                        <ChevronDown
                          className={`size-4 transition-transform ${openGroups.has(group.id) ? "rotate-180" : ""}`}
                        />
                        <span className="font-medium">{group.name}</span>
                        <span className="text-sm text-muted-foreground">- {group.description}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                  {openGroups.has(group.id) &&
                    group.permissions.map((permission) => (
                      <TableRow key={permission.id} className="hover:bg-muted/20">
                        <TableCell className="pl-10 py-3">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <span>{permission.name}</span>
                              {permission.restricted && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Badge variant="secondary" className="font-normal">
                                        Restricted
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      This permission is restricted and requires additional approval
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                              {permission.requiresApproval && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Info className="size-4 text-amber-500" />
                                    </TooltipTrigger>
                                    <TooltipContent>Requires approval for each use</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground">{permission.description}</span>
                          </div>
                        </TableCell>
                        {roles.map((role) => (
                          <TableCell key={role.id} className="text-center py-3">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm" className="min-w-24">
                                  {matrix[permission.id]?.[role.id] || "none"}
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="center" className="w-40">
                                <DropdownMenuLabel>Select Scope</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {visibleScopes.has("all") && (
                                  <DropdownMenuCheckboxItem
                                    checked={matrix[permission.id]?.[role.id] === "all"}
                                    onCheckedChange={() => handlePermissionChange(permission.id, role.id, "all")}
                                  >
                                    All
                                    {matrix[permission.id]?.[role.id] === "all" && <Check className="ml-auto size-4" />}
                                  </DropdownMenuCheckboxItem>
                                )}
                                {visibleScopes.has("department") && (
                                  <DropdownMenuCheckboxItem
                                    checked={matrix[permission.id]?.[role.id] === "department"}
                                    onCheckedChange={() => handlePermissionChange(permission.id, role.id, "department")}
                                  >
                                    Department
                                    {matrix[permission.id]?.[role.id] === "department" && (
                                      <Check className="ml-auto size-4" />
                                    )}
                                  </DropdownMenuCheckboxItem>
                                )}
                                {visibleScopes.has("assigned") && (
                                  <DropdownMenuCheckboxItem
                                    checked={matrix[permission.id]?.[role.id] === "assigned"}
                                    onCheckedChange={() => handlePermissionChange(permission.id, role.id, "assigned")}
                                  >
                                    Assigned
                                    {matrix[permission.id]?.[role.id] === "assigned" && (
                                      <Check className="ml-auto size-4" />
                                    )}
                                  </DropdownMenuCheckboxItem>
                                )}
                                {visibleScopes.has("owned") && (
                                  <DropdownMenuCheckboxItem
                                    checked={matrix[permission.id]?.[role.id] === "owned"}
                                    onCheckedChange={() => handlePermissionChange(permission.id, role.id, "owned")}
                                  >
                                    Owned
                                    {matrix[permission.id]?.[role.id] === "owned" && (
                                      <Check className="ml-auto size-4" />
                                    )}
                                  </DropdownMenuCheckboxItem>
                                )}
                                {visibleScopes.has("none") && (
                                  <DropdownMenuCheckboxItem
                                    checked={matrix[permission.id]?.[role.id] === "none"}
                                    onCheckedChange={() => handlePermissionChange(permission.id, role.id, "none")}
                                  >
                                    None
                                    {matrix[permission.id]?.[role.id] === "none" && (
                                      <Check className="ml-auto size-4" />
                                    )}
                                  </DropdownMenuCheckboxItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

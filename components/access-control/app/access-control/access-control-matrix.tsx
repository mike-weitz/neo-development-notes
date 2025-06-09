"use client"

import type React from "react"

import { useState } from "react"
import { ChevronDown, Info, Save, Shield, Users } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/components/ui/use-toast"

// Define types for our data structures
type Permission = {
  id: string
  name: string
  description: string
  restricted?: boolean
}

type ServiceCategory = {
  id: string
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  permissions: Permission[]
}

type Role = {
  id: string
  name: string
  description: string
  level: "executive" | "director" | "specialist" | "support" | "helpdesk"
}

// Sample data
const roles: Role[] = [
  {
    id: "executive",
    name: "Executive Director",
    description: "Full administrative access to all NEOnet systems and services",
    level: "executive",
  },
  {
    id: "tech-director",
    name: "Technology Director",
    description: "Manages technical services and infrastructure",
    level: "director",
  },
  {
    id: "service-specialist",
    name: "Service Specialist",
    description: "Handles specific service areas and member support",
    level: "specialist",
  },
  {
    id: "support-staff",
    name: "Support Staff",
    description: "Provides general technical support and assistance",
    level: "support",
  },
  {
    id: "helpdesk",
    name: "Help Desk",
    description: "First-line support and ticket management",
    level: "helpdesk",
  },
]

const serviceCategories: ServiceCategory[] = [
  {
    id: "member-management",
    name: "Member Management",
    description: "Control over member district accounts and services",
    icon: Users,
    permissions: [
      {
        id: "member-view",
        name: "View Member Information",
        description: "Access to view member district details and status",
      },
      {
        id: "member-edit",
        name: "Edit Member Details",
        description: "Modify member information and service subscriptions",
        restricted: true,
      },
      {
        id: "member-billing",
        name: "Billing Management",
        description: "Access to billing and invoicing features",
        restricted: true,
      },
    ],
  },
  {
    id: "service-provisioning",
    name: "Service Provisioning",
    description: "Management of NEOnet service deployment and configuration",
    icon: Shield,
    permissions: [
      {
        id: "service-deploy",
        name: "Deploy Services",
        description: "Ability to deploy and configure services for members",
        restricted: true,
      },
      {
        id: "service-monitor",
        name: "Monitor Services",
        description: "View service status and performance metrics",
      },
      {
        id: "service-maintain",
        name: "Maintenance Access",
        description: "Perform service maintenance and updates",
        restricted: true,
      },
    ],
  },
  {
    id: "support",
    name: "Support & Ticketing",
    description: "Help desk and support ticket management",
    icon: Info,
    permissions: [
      {
        id: "ticket-create",
        name: "Create Tickets",
        description: "Create support tickets for members",
      },
      {
        id: "ticket-assign",
        name: "Assign Tickets",
        description: "Assign tickets to support staff",
      },
      {
        id: "ticket-resolve",
        name: "Resolve Tickets",
        description: "Mark tickets as resolved and manage ticket lifecycle",
      },
    ],
  },
]

export default function AccessControlMatrix() {
  const { toast } = useToast()
  const [selectedRole, setSelectedRole] = useState<string>(roles[0].id)
  const [permissions, setPermissions] = useState<Set<string>>(new Set())
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set([serviceCategories[0].id]))

  const togglePermission = (permissionId: string) => {
    setPermissions((prev) => {
      const newPermissions = new Set(prev)
      if (newPermissions.has(permissionId)) {
        newPermissions.delete(permissionId)
      } else {
        newPermissions.add(permissionId)
      }
      return newPermissions
    })
  }

  const toggleCategory = (categoryId: string) => {
    setOpenCategories((prev) => {
      const newOpen = new Set(prev)
      if (newOpen.has(categoryId)) {
        newOpen.delete(categoryId)
      } else {
        newOpen.add(categoryId)
      }
      return newOpen
    })
  }

  const handleSave = () => {
    toast({
      title: "Permissions Updated",
      description: `Updated permissions for ${roles.find((r) => r.id === selectedRole)?.name}`,
    })
  }

  const selectedRoleData = roles.find((r) => r.id === selectedRole)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle>Role Configuration</CardTitle>
              <CardDescription>Select a staff role to manage their permissions</CardDescription>
            </div>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-[240px]">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>
                    <span className="flex items-center gap-2">{role.name}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          <div className="mb-6 rounded-lg bg-muted p-4">
            <div className="flex items-start gap-4">
              <Users className="mt-0.5 size-5 text-muted-foreground" />
              <div>
                <h3 className="font-semibold">{selectedRoleData?.name}</h3>
                <p className="text-sm text-muted-foreground">{selectedRoleData?.description}</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {serviceCategories.map((category) => (
              <Collapsible
                key={category.id}
                open={openCategories.has(category.id)}
                onOpenChange={() => toggleCategory(category.id)}
                className="rounded-lg border"
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex w-full items-center justify-between rounded-t-lg p-4 hover:bg-accent hover:no-underline"
                  >
                    <div className="flex items-center gap-3">
                      <category.icon className="size-5" />
                      <div className="flex flex-col items-start gap-1">
                        <h3 className="text-base font-semibold">{category.name}</h3>
                        <p className="text-sm text-muted-foreground">{category.description}</p>
                      </div>
                    </div>
                    <ChevronDown
                      className={`size-5 transition-transform duration-200 ${
                        openCategories.has(category.id) ? "rotate-180" : ""
                      }`}
                    />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <Separator />
                  <div className="divide-y">
                    {category.permissions.map((permission) => (
                      <div key={permission.id} className="flex items-center justify-between p-4">
                        <div className="flex flex-1 gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium leading-none">{permission.name}</p>
                              {permission.restricted && (
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Badge variant="secondary" className="font-normal">
                                        Restricted
                                      </Badge>
                                    </TooltipTrigger>
                                    <TooltipContent>This permission requires additional approval</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{permission.description}</p>
                          </div>
                        </div>
                        <Switch
                          checked={permissions.has(permission.id)}
                          onCheckedChange={() => togglePermission(permission.id)}
                          aria-label={`Toggle ${permission.name} permission`}
                        />
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} size="lg">
          <Save className="mr-2 size-4" />
          Save Permission Changes
        </Button>
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import { ChevronDown, Edit, Plus, Shield, Trash2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import type { Role } from "@/lib/types/authorization"

// Sample roles data
const initialRoles: Role[] = [
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
      "service:view:all",
      "service:create:all",
      "service:update:all",
      "service:configure:all",
    ],
  },
  {
    id: "tech-director",
    name: "Technology Director",
    description: "Manages technical services and infrastructure",
    level: "director",
    inheritsFrom: [],
    permissions: [
      "employee:view:department",
      "employee:update:department",
      "service:view:all",
      "service:update:all",
      "service:configure:all",
      "application:view:all",
      "application:update:all",
      "application:configure:all",
    ],
  },
  {
    id: "service-specialist",
    name: "Service Specialist",
    description: "Handles specific service areas and member support",
    level: "specialist",
    inheritsFrom: [],
    permissions: [
      "member:view:assigned",
      "service:view:assigned",
      "service:update:assigned",
      "application:view:assigned",
      "application:update:assigned",
    ],
  },
  {
    id: "support-staff",
    name: "Support Staff",
    description: "Provides general technical support and assistance",
    level: "support",
    inheritsFrom: [],
    permissions: ["member:view:assigned", "user:view:assigned", "feedback:view:all", "feedback:update:all"],
  },
  {
    id: "helpdesk",
    name: "Help Desk",
    description: "First-line support and ticket management",
    level: "helpdesk",
    inheritsFrom: [],
    permissions: ["user:view:all", "feedback:view:all", "feedback:update:all"],
  },
]

export default function RoleManagement() {
  const { toast } = useToast()
  const [roles, setRoles] = useState<Role[]>(initialRoles)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [newRole, setNewRole] = useState<Partial<Role>>({
    name: "",
    description: "",
    level: "specialist",
    permissions: [],
  })
  const [openRoles, setOpenRoles] = useState<Set<string>>(new Set([roles[0].id]))

  const toggleRole = (roleId: string) => {
    setOpenRoles((prev) => {
      const newOpen = new Set(prev)
      if (newOpen.has(roleId)) {
        newOpen.delete(roleId)
      } else {
        newOpen.add(roleId)
      }
      return newOpen
    })
  }

  const handleEditRole = (role: Role) => {
    setSelectedRole(role)
    setNewRole({
      id: role.id,
      name: role.name,
      description: role.description,
      level: role.level,
      inheritsFrom: role.inheritsFrom,
      permissions: role.permissions,
    })
    setEditMode(true)
  }

  const handleCreateRole = () => {
    setSelectedRole(null)
    setNewRole({
      name: "",
      description: "",
      level: "specialist",
      permissions: [],
    })
    setEditMode(true)
  }

  const handleSaveRole = () => {
    if (!newRole.name || !newRole.description || !newRole.level) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    if (editMode && selectedRole) {
      // Update existing role
      setRoles((prev) => prev.map((role) => (role.id === selectedRole.id ? { ...role, ...(newRole as Role) } : role)))
      toast({
        title: "Role Updated",
        description: `The role "${newRole.name}" has been updated successfully.`,
      })
    } else {
      // Create new role
      const roleId = newRole.name?.toLowerCase().replace(/\s+/g, "-") || `role-${Date.now()}`
      const newRoleComplete: Role = {
        id: roleId,
        name: newRole.name || "New Role",
        description: newRole.description || "Role description",
        level: newRole.level || "specialist",
        permissions: newRole.permissions || [],
      }
      setRoles((prev) => [...prev, newRoleComplete])
      toast({
        title: "Role Created",
        description: `The role "${newRoleComplete.name}" has been created successfully.`,
      })
    }
    setEditMode(false)
  }

  const handleDeleteRole = (roleId: string) => {
    setRoles((prev) => prev.filter((role) => role.id !== roleId))
    toast({
      title: "Role Deleted",
      description: "The role has been deleted successfully.",
    })
  }

  const getLevelBadge = (level: string) => {
    const levelColors: Record<string, string> = {
      executive: "bg-purple-100 text-purple-800",
      director: "bg-blue-100 text-blue-800",
      specialist: "bg-green-100 text-green-800",
      support: "bg-amber-100 text-amber-800",
      helpdesk: "bg-gray-100 text-gray-800",
    }

    return (
      <Badge className={`${levelColors[level]} font-normal`}>{level.charAt(0).toUpperCase() + level.slice(1)}</Badge>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold">Role Management</h2>
          <p className="text-muted-foreground mt-1">Define and manage staff roles and their base permissions</p>
        </div>
        <Dialog open={editMode} onOpenChange={setEditMode}>
          <DialogTrigger asChild>
            <Button onClick={handleCreateRole} size="lg">
              <Plus className="mr-2 size-4" />
              Create New Role
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>{selectedRole ? "Edit Role" : "Create New Role"}</DialogTitle>
              <DialogDescription>
                {selectedRole ? "Update the details for this role" : "Define a new role with specific permissions"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-5 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Role Name</Label>
                <Input
                  id="name"
                  value={newRole.name || ""}
                  onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                  placeholder="e.g. Service Manager"
                  className="h-10"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newRole.description || ""}
                  onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                  placeholder="Describe the role's responsibilities"
                  className="min-h-[80px] resize-none"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="level">Access Level</Label>
                <Select value={newRole.level} onValueChange={(value: any) => setNewRole({ ...newRole, level: value })}>
                  <SelectTrigger id="level" className="h-10">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="executive">Executive</SelectItem>
                    <SelectItem value="director">Director</SelectItem>
                    <SelectItem value="specialist">Specialist</SelectItem>
                    <SelectItem value="support">Support</SelectItem>
                    <SelectItem value="helpdesk">Help Desk</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Inherits From (Optional)</Label>
                <p className="text-sm text-muted-foreground">
                  Role inheritance will be configured in the permission matrix
                </p>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setEditMode(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveRole}>Save Role</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {roles.map((role) => (
          <Collapsible
            key={role.id}
            open={openRoles.has(role.id)}
            onOpenChange={() => toggleRole(role.id)}
            className="rounded-lg border shadow-sm mb-4 overflow-hidden"
          >
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="flex w-full items-center justify-between rounded-t-lg p-5 hover:bg-accent hover:no-underline"
              >
                <div className="flex items-center gap-4">
                  <Shield className="size-5 text-primary/80" />
                  <div className="flex flex-col items-start gap-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold">{role.name}</h3>
                      {getLevelBadge(role.level)}
                    </div>
                    <p className="text-sm text-muted-foreground">{role.description}</p>
                  </div>
                </div>
                <ChevronDown
                  className={`size-5 transition-transform duration-200 ${openRoles.has(role.id) ? "rotate-180" : ""}`}
                />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <Separator />
              <div className="p-5">
                <div className="mb-5">
                  <h4 className="text-sm font-semibold mb-2">Base Permissions</h4>
                  <p className="text-xs text-muted-foreground mb-3">
                    These are the core permissions assigned to this role. Additional permissions can be assigned in the
                    Permission Matrix.
                  </p>
                </div>
                <div className="mb-5 flex flex-wrap gap-2">
                  {role.permissions.length > 0 ? (
                    role.permissions.map((permission) => (
                      <Badge key={permission} variant="secondary" className="px-2 py-1">
                        {permission}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No base permissions assigned</p>
                  )}
                </div>
                {role.inheritsFrom && role.inheritsFrom.length > 0 && (
                  <div className="mb-5">
                    <h4 className="text-sm font-semibold mb-2">Inherits From</h4>
                    <div className="flex flex-wrap gap-2">
                      {role.inheritsFrom.map((parentId) => {
                        const parentRole = roles.find((r) => r.id === parentId)
                        return parentRole ? (
                          <Badge key={parentId} variant="outline" className="px-2 py-1">
                            {parentRole.name}
                          </Badge>
                        ) : null
                      })}
                    </div>
                  </div>
                )}
                <div className="flex justify-end gap-3">
                  <Button variant="outline" size="sm" onClick={() => handleDeleteRole(role.id)}>
                    <Trash2 className="mr-2 size-4" />
                    Delete
                  </Button>
                  <Button size="sm" onClick={() => handleEditRole(role)}>
                    <Edit className="mr-2 size-4" />
                    Edit Role
                  </Button>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    </div>
  )
}

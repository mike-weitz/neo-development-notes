"use client"

import { useState } from "react"
import { Check, ChevronDown, Plus, Search, Shield, User } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import type { AuthorizedUser, PermissionClaim, Role } from "@/lib/types/authorization"

// Sample users
const users: AuthorizedUser[] = [
  {
    id: "user1",
    name: "John Smith",
    email: "john.smith@neonet.org",
    roles: ["executive-director"],
    directPermissions: ["service:configure:all"],
  },
  {
    id: "user2",
    name: "Sarah Johnson",
    email: "sarah.johnson@neonet.org",
    roles: ["tech-director"],
    directPermissions: ["employee:view:all"],
  },
  {
    id: "user3",
    name: "Michael Brown",
    email: "michael.brown@neonet.org",
    roles: ["service-specialist"],
    directPermissions: [],
  },
  {
    id: "user4",
    name: "Emily Davis",
    email: "emily.davis@neonet.org",
    roles: ["support-staff"],
    directPermissions: ["feedback:view:all"],
  },
  {
    id: "user5",
    name: "David Wilson",
    email: "david.wilson@neonet.org",
    roles: ["helpdesk"],
    directPermissions: [],
  },
]

// Sample roles
const roles: Role[] = [
  {
    id: "executive-director",
    name: "Executive Director",
    description: "Full administrative access",
    level: "executive",
    permissions: ["employee:view:all", "employee:create:all", "employee:update:all", "employee:delete:all"],
  },
  {
    id: "tech-director",
    name: "Technology Director",
    description: "Manages technical services",
    level: "director",
    permissions: ["service:view:all", "service:update:all", "service:configure:all"],
  },
  {
    id: "service-specialist",
    name: "Service Specialist",
    description: "Handles specific services",
    level: "specialist",
    permissions: ["service:view:assigned", "service:update:assigned"],
  },
  {
    id: "support-staff",
    name: "Support Staff",
    description: "Provides technical support",
    level: "support",
    permissions: ["feedback:view:all", "feedback:update:all"],
  },
  {
    id: "helpdesk",
    name: "Help Desk",
    description: "First-line support",
    level: "helpdesk",
    permissions: ["user:view:all"],
  },
]

// Sample permissions
const availablePermissions: PermissionClaim[] = [
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
  "application:view:all",
  "application:create:all",
  "application:update:all",
  "application:configure:all",
  "user:view:all",
  "user:create:all",
  "user:update:all",
  "user:delete:all",
  "feedback:view:all",
  "feedback:update:all",
]

export default function UserPermissions() {
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState<AuthorizedUser | null>(null)
  const [openRoleSelector, setOpenRoleSelector] = useState(false)
  const [openPermissionSelector, setOpenPermissionSelector] = useState(false)
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [selectedPermissions, setSelectedPermissions] = useState<PermissionClaim[]>([])
  const [editMode, setEditMode] = useState(false)

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleSelectUser = (user: AuthorizedUser) => {
    setSelectedUser(user)
    setSelectedRoles(user.roles)
    setSelectedPermissions(user.directPermissions || [])
  }

  const handleSaveUserPermissions = () => {
    if (!selectedUser) return

    // Here you would save the changes to your backend
    toast({
      title: "User Permissions Updated",
      description: `Updated permissions for ${selectedUser.name}`,
    })

    setEditMode(false)
  }

  const toggleRole = (roleId: string) => {
    setSelectedRoles((prev) => {
      if (prev.includes(roleId)) {
        return prev.filter((id) => id !== roleId)
      } else {
        return [...prev, roleId]
      }
    })
  }

  const togglePermission = (permission: PermissionClaim) => {
    setSelectedPermissions((prev) => {
      if (prev.includes(permission)) {
        return prev.filter((p) => p !== permission)
      } else {
        return [...prev, permission]
      }
    })
  }

  // Get all effective permissions for the selected user
  const getEffectivePermissions = (): PermissionClaim[] => {
    if (!selectedUser) return []

    const effectivePermissions = new Set<PermissionClaim>(selectedPermissions)

    // Add permissions from roles
    for (const roleId of selectedRoles) {
      const role = roles.find((r) => r.id === roleId)
      if (role) {
        role.permissions.forEach((perm) => effectivePermissions.add(perm))
      }
    }

    return Array.from(effectivePermissions)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold">User Permissions</h2>
          <p className="text-muted-foreground mt-1">Manage permissions for individual users</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <Card className="md:col-span-1 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle>Users</CardTitle>
            <CardDescription>Select a user to manage their permissions</CardDescription>
            <div className="relative mt-3">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search users..."
                className="pl-9 h-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filteredUsers.map((user) => (
                <Button
                  key={user.id}
                  variant={selectedUser?.id === user.id ? "default" : "outline"}
                  className="w-full justify-start h-auto py-3"
                  onClick={() => handleSelectUser(user)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 border">
                      <AvatarImage
                        src={`/abstract-geometric-shapes.png?height=36&width=36&query=${user.name}`}
                        alt={user.name}
                      />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium">{user.name}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 shadow-sm">
          {selectedUser ? (
            <>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 border">
                      <AvatarImage
                        src={`/abstract-geometric-shapes.png?height=48&width=48&query=${selectedUser.name}`}
                        alt={selectedUser.name}
                      />
                      <AvatarFallback>{selectedUser.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle>{selectedUser.name}</CardTitle>
                      <CardDescription>{selectedUser.email}</CardDescription>
                    </div>
                  </div>
                  {!editMode ? (
                    <Button onClick={() => setEditMode(true)}>Edit Permissions</Button>
                  ) : (
                    <div className="flex gap-3">
                      <Button variant="outline" onClick={() => setEditMode(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSaveUserPermissions}>Save Changes</Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="roles">
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="roles">Roles</TabsTrigger>
                    <TabsTrigger value="direct">Direct Permissions</TabsTrigger>
                    <TabsTrigger value="effective">Effective Permissions</TabsTrigger>
                  </TabsList>
                  <TabsContent value="roles" className="space-y-5 pt-2">
                    {editMode ? (
                      <div className="space-y-5">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium">Assigned Roles</h3>
                          <Popover open={openRoleSelector} onOpenChange={setOpenRoleSelector}>
                            <PopoverTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Plus className="mr-2 size-4" />
                                Add Role
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="p-0 w-64" align="end">
                              <Command>
                                <CommandInput placeholder="Search roles..." />
                                <CommandList className="max-h-[300px]">
                                  <CommandEmpty>No roles found.</CommandEmpty>
                                  <CommandGroup>
                                    {roles.map((role) => (
                                      <CommandItem
                                        key={role.id}
                                        onSelect={() => {
                                          toggleRole(role.id)
                                          setOpenRoleSelector(false)
                                        }}
                                        className="flex items-center justify-between"
                                      >
                                        <div className="flex items-center gap-2">
                                          <Shield className="size-4" />
                                          <span>{role.name}</span>
                                        </div>
                                        {selectedRoles.includes(role.id) && <Check className="size-4" />}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div className="space-y-3">
                          {selectedRoles.length === 0 ? (
                            <p className="text-sm text-muted-foreground py-3 text-center bg-muted/20 rounded-md">
                              No roles assigned.
                            </p>
                          ) : (
                            selectedRoles.map((roleId) => {
                              const role = roles.find((r) => r.id === roleId)
                              return role ? (
                                <div
                                  key={role.id}
                                  className="flex items-center justify-between rounded-md border p-4 shadow-sm"
                                >
                                  <div className="flex items-center gap-3">
                                    <Shield className="size-5 text-primary/70" />
                                    <div>
                                      <p className="font-medium">{role.name}</p>
                                      <p className="text-xs text-muted-foreground">{role.description}</p>
                                    </div>
                                  </div>
                                  <Button variant="ghost" size="icon" onClick={() => toggleRole(role.id)}>
                                    <ChevronDown className="size-4 rotate-90" />
                                  </Button>
                                </div>
                              ) : null
                            })
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-5">
                        <h3 className="text-sm font-medium">Assigned Roles</h3>
                        <div className="space-y-3">
                          {selectedUser.roles.length === 0 ? (
                            <p className="text-sm text-muted-foreground py-3 text-center bg-muted/20 rounded-md">
                              No roles assigned.
                            </p>
                          ) : (
                            selectedUser.roles.map((roleId) => {
                              const role = roles.find((r) => r.id === roleId)
                              return role ? (
                                <div key={role.id} className="flex items-center gap-3 rounded-md border p-4 shadow-sm">
                                  <Shield className="size-5 text-primary/70" />
                                  <div>
                                    <p className="font-medium">{role.name}</p>
                                    <p className="text-xs text-muted-foreground">{role.description}</p>
                                  </div>
                                </div>
                              ) : null
                            })
                          )}
                        </div>
                      </div>
                    )}
                  </TabsContent>
                  <TabsContent value="direct" className="space-y-4 pt-4">
                    {editMode ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium">Direct Permissions</h3>
                          <Popover open={openPermissionSelector} onOpenChange={setOpenPermissionSelector}>
                            <PopoverTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Plus className="mr-2 size-4" />
                                Add Permission
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="p-0" align="end">
                              <Command>
                                <CommandInput placeholder="Search permissions..." />
                                <CommandList>
                                  <CommandEmpty>No permissions found.</CommandEmpty>
                                  <CommandGroup>
                                    {availablePermissions.map((permission) => (
                                      <CommandItem
                                        key={permission}
                                        onSelect={() => {
                                          togglePermission(permission)
                                          setOpenPermissionSelector(false)
                                        }}
                                      >
                                        <span>{permission}</span>
                                        {selectedPermissions.includes(permission) && (
                                          <Check className="ml-auto size-4" />
                                        )}
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div className="space-y-2">
                          {selectedPermissions.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No direct permissions assigned.</p>
                          ) : (
                            selectedPermissions.map((permission) => (
                              <div key={permission} className="flex items-center justify-between rounded-md border p-3">
                                <Badge variant="outline">{permission}</Badge>
                                <Button variant="ghost" size="icon" onClick={() => togglePermission(permission)}>
                                  <ChevronDown className="size-4 rotate-90" />
                                </Button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <h3 className="text-sm font-medium">Direct Permissions</h3>
                        <div className="space-y-2">
                          {!selectedUser.directPermissions || selectedUser.directPermissions.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No direct permissions assigned.</p>
                          ) : (
                            selectedUser.directPermissions.map((permission) => (
                              <Badge key={permission} variant="outline" className="mr-2 px-2 py-1">
                                {permission}
                              </Badge>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </TabsContent>
                  <TabsContent value="effective" className="space-y-5 pt-2">
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Effective Permissions</h3>
                      <p className="text-sm text-muted-foreground">
                        These are all permissions the user has access to, including those from assigned roles.
                      </p>
                      <div className="rounded-md border shadow-sm overflow-hidden">
                        <Table>
                          <TableHeader className="bg-muted/50">
                            <TableRow>
                              <TableHead className="font-medium">Permission</TableHead>
                              <TableHead className="font-medium">Source</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {getEffectivePermissions().map((permission) => {
                              // Determine the source of the permission
                              const isDirect = selectedPermissions.includes(permission)
                              const roleSource = roles.find(
                                (role) => selectedRoles.includes(role.id) && role.permissions.includes(permission),
                              )

                              return (
                                <TableRow key={permission}>
                                  <TableCell>
                                    <code className="rounded bg-muted px-2 py-1 text-sm">{permission}</code>
                                  </TableCell>
                                  <TableCell>
                                    {isDirect ? (
                                      <Badge variant="outline" className="bg-primary/5">
                                        Direct
                                      </Badge>
                                    ) : roleSource ? (
                                      <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="bg-muted/50">
                                          {roleSource.name}
                                        </Badge>
                                      </div>
                                    ) : (
                                      <span className="text-muted-foreground">Unknown</span>
                                    )}
                                  </TableCell>
                                </TableRow>
                              )
                            })}
                            {getEffectivePermissions().length === 0 && (
                              <TableRow>
                                <TableCell colSpan={2} className="h-24 text-center text-muted-foreground">
                                  No permissions found
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex h-[400px] items-center justify-center p-6">
              <div className="text-center">
                <User className="mx-auto size-16 text-muted-foreground opacity-40" />
                <h3 className="mt-4 text-lg font-medium">No User Selected</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Select a user from the list to view and manage their permissions
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  )
}

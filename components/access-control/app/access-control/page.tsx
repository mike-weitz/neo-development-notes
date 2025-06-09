import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import RoleManagement from "./role-management"
import PermissionMatrix from "./permission-matrix"
import UserPermissions from "./user-permissions"
import AuditLog from "./audit-log"
import AuthorizationDemo from "./demo"

export default function AccessControlPage() {
  return (
    <div className="container py-10">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Authorization Management</h1>
          <p className="mt-2 text-muted-foreground">
            Comprehensive security controls for NEOnet resources and services
          </p>
        </div>
        <Separator />

        <Tabs defaultValue="demo" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="demo">Live Demo</TabsTrigger>
            <TabsTrigger value="roles">Role Management</TabsTrigger>
            <TabsTrigger value="permissions">Permission Matrix</TabsTrigger>
            <TabsTrigger value="users">User Permissions</TabsTrigger>
            <TabsTrigger value="audit">Audit Log</TabsTrigger>
          </TabsList>
          <TabsContent value="demo">
            <AuthorizationDemo />
          </TabsContent>
          <TabsContent value="roles">
            <RoleManagement />
          </TabsContent>
          <TabsContent value="permissions">
            <PermissionMatrix />
          </TabsContent>
          <TabsContent value="users">
            <UserPermissions />
          </TabsContent>
          <TabsContent value="audit">
            <AuditLog />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

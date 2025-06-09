"use client"

import { useState } from "react"
import { Calendar, Download, Filter, Search, Shield, User } from "lucide-react"

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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { PermissionAuditLog } from "@/lib/types/authorization"

// Sample audit log data
const auditLogs: PermissionAuditLog[] = [
  {
    id: "log1",
    timestamp: "2023-06-15T14:32:45Z",
    userId: "admin1",
    action: "grant",
    roleId: "tech-director",
    targetUserId: "user2",
    permission: "service:configure:all",
    previousState: null,
    newState: { granted: true },
  },
  {
    id: "log2",
    timestamp: "2023-06-14T09:15:22Z",
    userId: "admin1",
    action: "revoke",
    targetUserId: "user3",
    permission: "member:update:all",
    previousState: { granted: true },
    newState: null,
  },
  {
    id: "log3",
    timestamp: "2023-06-13T16:45:10Z",
    userId: "admin2",
    action: "modify",
    roleId: "service-specialist",
    permission: "service:view:all",
    previousState: { scope: "assigned" },
    newState: { scope: "all" },
  },
  {
    id: "log4",
    timestamp: "2023-06-12T11:22:33Z",
    userId: "admin1",
    action: "grant",
    roleId: "helpdesk",
    permission: "feedback:view:all",
    previousState: null,
    newState: { granted: true },
  },
  {
    id: "log5",
    timestamp: "2023-06-10T08:12:19Z",
    userId: "admin2",
    action: "revoke",
    targetUserId: "user4",
    permission: "application:configure:all",
    previousState: { granted: true },
    newState: null,
  },
]

export default function AuditLog() {
  const [searchTerm, setSearchTerm] = useState("")
  const [actionFilter, setActionFilter] = useState<Set<string>>(new Set(["grant", "revoke", "modify"]))

  const toggleActionFilter = (action: string) => {
    setActionFilter((prev) => {
      const newFilter = new Set(prev)
      if (newFilter.has(action)) {
        newFilter.delete(action)
      } else {
        newFilter.add(action)
      }
      return newFilter
    })
  }

  const filteredLogs = auditLogs.filter(
    (log) =>
      actionFilter.has(log.action) &&
      (searchTerm === "" ||
        log.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.targetUserId && log.targetUserId.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (log.permission && log.permission.toLowerCase().includes(searchTerm.toLowerCase()))),
  )

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const getActionBadge = (action: "grant" | "revoke" | "modify") => {
    const actionColors: Record<string, string> = {
      grant: "bg-green-100 text-green-800 border-green-200",
      revoke: "bg-red-100 text-red-800 border-red-200",
      modify: "bg-blue-100 text-blue-800 border-blue-200",
    }

    return (
      <Badge className={`${actionColors[action]} font-normal px-2 py-0.5 border`}>
        {action.charAt(0).toUpperCase() + action.slice(1)}
      </Badge>
    )
  }

  const handleExportLogs = () => {
    // In a real implementation, this would generate a CSV or JSON file
    console.log("Exporting logs:", filteredLogs)
    alert("Logs would be exported in a real implementation")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold">Audit Log</h2>
          <p className="text-muted-foreground mt-1">Track permission changes and security events</p>
        </div>
        <Button onClick={handleExportLogs} size="lg">
          <Download className="mr-2 size-4" />
          Export Logs
        </Button>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search logs..."
            className="pl-9 h-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-10">
              <Filter className="mr-2 size-4" />
              Filter Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Action Types</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={actionFilter.has("grant")}
              onCheckedChange={() => toggleActionFilter("grant")}
            >
              Grant
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={actionFilter.has("revoke")}
              onCheckedChange={() => toggleActionFilter("revoke")}
            >
              Revoke
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={actionFilter.has("modify")}
              onCheckedChange={() => toggleActionFilter("modify")}
            >
              Modify
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50 sticky top-0">
              <TableRow>
                <TableHead className="w-[180px] font-medium">Timestamp</TableHead>
                <TableHead className="font-medium">Action</TableHead>
                <TableHead className="font-medium">User</TableHead>
                <TableHead className="font-medium">Target</TableHead>
                <TableHead className="font-medium">Permission</TableHead>
                <TableHead className="text-right font-medium">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id} className="hover:bg-muted/20">
                  <TableCell className="font-mono text-xs py-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="size-3.5 text-muted-foreground" />
                      {formatDate(log.timestamp)}
                    </div>
                  </TableCell>
                  <TableCell className="py-3">{getActionBadge(log.action)}</TableCell>
                  <TableCell className="py-3">{log.userId}</TableCell>
                  <TableCell className="py-3">
                    {log.targetUserId ? (
                      <span className="flex items-center gap-1">
                        <User className="size-3.5 text-muted-foreground" />
                        {log.targetUserId}
                      </span>
                    ) : log.roleId ? (
                      <span className="flex items-center gap-1">
                        <Shield className="size-3.5 text-muted-foreground" />
                        {log.roleId}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="py-3">
                    {log.permission ? (
                      <code className="rounded bg-muted px-2 py-1 text-xs">{log.permission}</code>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right py-3">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent align="end" className="w-[350px]">
                        <div className="space-y-3">
                          <h4 className="font-medium">Change Details</h4>
                          <div className="rounded-md bg-muted p-3">
                            <pre className="text-xs overflow-auto max-h-[200px]">
                              {JSON.stringify(
                                {
                                  previous: log.previousState,
                                  new: log.newState,
                                },
                                null,
                                2,
                              )}
                            </pre>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </TableCell>
                </TableRow>
              ))}
              {filteredLogs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Calendar className="size-10 mb-2 opacity-20" />
                      <p>No audit logs found</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

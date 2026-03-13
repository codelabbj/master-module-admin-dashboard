"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { useApi } from "@/lib/useApi"
import { useLanguage } from "@/components/providers/language-provider"
import { 
  Search, 
  ArrowUpDown, 
  ShieldCheck, 

  
  Filter,
  RefreshCw
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ErrorDisplay, extractErrorMessages } from "@/components/ui/error-display"
import { Badge } from "@/components/ui/badge"

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""

export default function DeviceAuthorizationsPage() {
  const [authorizations, setAuthorizations] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const apiFetch = useApi()
  const { t } = useLanguage()
  const { toast } = useToast();

  useEffect(() => {
    const fetchAuthorizations = async () => {
      setLoading(true)
      setError("")
      try {
        const data = await apiFetch(`${baseUrl}/api/device-authorizations/`)
        const authorizationsData = Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : []
        setAuthorizations(authorizationsData)
        toast({
          title: t("deviceAuthorizations.loaded") || "Device authorizations loaded",
          description: t("deviceAuthorizations.loadedSuccessfully") || "Device authorization list loaded successfully",
        })
      } catch (err: any) {
        const errorMessage = extractErrorMessages(err) || t("deviceAuthorizations.failedToLoad") || "Failed to load device authorizations"
        setError(errorMessage)
        toast({
          title: t("deviceAuthorizations.failedToLoad") || "Failed to load",
          description: errorMessage,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchAuthorizations()
  }, [searchTerm, statusFilter, apiFetch, t, toast])

  const filteredAuthorizations = useMemo(() => {
    let filtered = authorizations

    if (searchTerm) {
      filtered = filtered.filter(auth =>
        auth.device_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        auth.user_name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(auth => 
        statusFilter === "active" ? auth.status === "active" : auth.status !== "active"
      )
    }

    return filtered
  }, [authorizations, searchTerm, statusFilter])

  const handleRefresh = async () => {
    setLoading(true)
    setError("")
    try {
      const data = await apiFetch(`${baseUrl}/api/device-authorizations/`)
      const authorizationsData = Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : []
      setAuthorizations(authorizationsData)
      toast({
        title: t("deviceAuthorizations.loaded") || "Device authorizations refreshed",
        description: t("deviceAuthorizations.loadedSuccessfully") || "Device authorization list refreshed successfully",
      })
    } catch (err: any) {
      const errorMessage = extractErrorMessages(err) || t("deviceAuthorizations.failedToLoad") || "Failed to load device authorizations"
      setError(errorMessage)
      toast({
        title: t("deviceAuthorizations.failedToLoad") || "Failed to load",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Device Authorizations
          </h1>
          <p className="text-muted-foreground">
            Manage device access to the system
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-accent rounded-lg">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">
              {filteredAuthorizations.length} authorizations
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search an authorization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                variant="minimal"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Advanced filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Device Authorizations Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Device Authorizations
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="text-muted-foreground">Loading device authorizations...</span>
              </div>
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <ErrorDisplay error={error} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">Device</TableHead>
                    <TableHead className="font-semibold">User</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Expires At</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAuthorizations.map((auth) => (
                    <TableRow key={auth.id} className="hover:bg-accent/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <ShieldCheck className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium text-foreground">
                              {auth.device_id || "N/A"}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              ID: {auth.id || "N/A"}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {auth.user_name || "N/A"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={auth.status === "active" ? "default" : auth.status === "expired" ? "destructive" : "secondary"}
                        >
                          {auth.status || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {auth.expires_at ? new Date(auth.expires_at).toLocaleDateString() : "N/A"}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/dashboard/device-authorizations/${auth.id}`}>
                            <Button variant="ghost" size="sm">
                              View
                            </Button>
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Empty State */}
      {!loading && filteredAuthorizations.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="space-y-4">
              <div className="h-16 w-16 rounded-full bg-accent mx-auto flex items-center justify-center">
                <ShieldCheck className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">No device authorizations found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== "all" 
                    ? "No device authorizations match your search criteria."
                    : "Start by authorizing your first device."
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

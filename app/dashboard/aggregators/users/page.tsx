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
  Share2, 
  Filter,
  RefreshCw,
  Users,
  Eye,
  Shield,
  MoreHorizontal,
  TrendingUp,
  Download
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ErrorDisplay, extractErrorMessages } from "@/components/ui/error-display"
import { Badge } from "@/components/ui/badge"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { AggregatorListResponse, AggregatorUser } from "@/lib/aggregator-api"
import { formatApiDateTime } from "@/lib/utils"

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""

export default function AggregatorUsersPage() {
  const [data, setData] = useState<AggregatorListResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  
  const apiFetch = useApi()
  const { t } = useLanguage()
  const { toast } = useToast();

  const fetchUsers = async () => {
    setLoading(true)
    setError("")
    try {
      const endpoint = `${baseUrl}/api/auth/admin/users/aggregators/?page=${page}&ordering=-created_at`
      const result = await apiFetch(endpoint)
      setData(result)
    } catch (err: any) {
      const errorMessage = extractErrorMessages(err) || t("aggregators.users.failedToLoad") || "Failed to load aggregator users"
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [page, apiFetch])

  const handleToggleStatus = async (uid: string, currentStatus: boolean) => {
    const confirmMsg = currentStatus
        ? t("aggregators.confirmDeactivate") || "Are you sure you want to deactivate this aggregator?"
        : t("aggregators.confirmActivate") || "Are you sure you want to activate this aggregator?"

    if (!confirm(confirmMsg)) return

    try {
        await apiFetch(`${baseUrl}/api/auth/admin/users/aggregators/${uid}/`, {
            method: 'PATCH',
            body: JSON.stringify({ is_active: !currentStatus })
        })
        toast({
            title: t("common.success") || "Success",
            description: t("aggregators.successToggle") || "Aggregator status updated successfully"
        })
        fetchUsers()
    } catch (err: any) {
        toast({
            title: t("common.error") || "Error",
            description: extractErrorMessages(err) || t("aggregators.failedToggle") || "Failed to update status",
            variant: "destructive"
        })
    }
  }

  const filteredAggregators = useMemo(() => {
    if (!data?.aggregators) return []
    let filtered = data.aggregators

    if (searchTerm) {
      filtered = filtered.filter(agg =>
        agg.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agg.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(agg => 
        statusFilter === "active" ? agg.is_active : !agg.is_active
      )
    }

    return filtered
  }, [data, searchTerm, statusFilter])

  const handleRefresh = () => {
    fetchUsers()
    toast({
      title: t("common.refreshed") || "Refreshed",
      description: t("aggregators.users.refreshed") || "Aggregator user list refreshed",
    })
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            {t("aggregators.usersTitle") || "Aggregator Users"}
          </h1>
          <p className="text-muted-foreground">
            {t("aggregators.usersSub") || "Manage and monitor aggregator accounts"}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-accent rounded-lg">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">
              {data?.pagination?.total_count || 0} users
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {t("common.refresh") || "Refresh"}
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      {data?.stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">{t("aggregators.totalAggregators") || "Total Aggregators"}</p>
                  <p className="text-2xl font-bold text-foreground">{data.stats.total_aggregators}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">{t("aggregators.activeAggregators") || "Active"}</p>
                  <p className="text-2xl font-bold text-green-600">{data.stats.active_aggregators}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">{t("aggregators.inactiveAggregators") || "Inactive"}</p>
                  <p className="text-2xl font-bold text-slate-400">{data.stats.inactive_aggregators}</p>
                </div>
                <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-slate-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("aggregators.searchPlaceholder") || "Search by name or email..."}
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
              </SelectContent>
            </Select>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                {t("common.export") || "Export CSV"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Aggregator Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" />
            {t("aggregators.usersTitle") || "Aggregator Users"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading && !data ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="text-muted-foreground">Loading aggregator users...</span>
              </div>
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <ErrorDisplay error={error} onRetry={fetchUsers} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">{t("common.user") || "User"}</TableHead>
                    <TableHead className="font-semibold">{t("common.contact") || "Contact"}</TableHead>
                    <TableHead className="font-semibold">{t("common.balance") || "Balance"}</TableHead>
                    <TableHead className="font-semibold">{t("common.status") || "Status"}</TableHead>
                    <TableHead className="font-semibold">{t("common.createdAt") || "Created At"}</TableHead>
                    <TableHead className="font-semibold text-right">{t("common.actions") || "Actions"}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAggregators.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                        {t("aggregators.noAggregatorsFound") || "No aggregator users found"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAggregators.map((agg) => (
                      <TableRow key={agg.uid} className="hover:bg-accent/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <Users className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium text-foreground">
                                {agg.display_name || "N/A"}
                              </div>
                              <div className="text-xs text-muted-foreground font-mono">
                                UID: {agg.uid.substring(0, 8)}...
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-foreground">
                            {agg.email || "N/A"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {agg.phone || t("aggregators.hasNoPhone") || "No phone"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-semibold text-primary">
                            {agg.account_balance?.toLocaleString("en-GB")} {agg.account_currency}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={agg.is_active ? "default" : "secondary"}
                          >
                            {agg.is_active ? (t("common.active") || 'Active') : (t("common.inactive") || 'Inactive')}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {formatApiDateTime(agg.created_at)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>{t("common.actions") || "Actions"}</DropdownMenuLabel>
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/aggregators/users/${agg.uid}/stats`} className="flex items-center gap-2">
                                  <Eye size={14} className="mr-2" /> {t("common.viewDetails") || "View Details"}
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className={agg.is_active ? "text-red-600 focus:text-red-600" : "text-green-600 focus:text-green-600"}
                                onClick={() => handleToggleStatus(agg.uid, agg.is_active)}
                              >
                                <Shield size={14} className="mr-2" /> {agg.is_active ? (t("aggregators.deactivateAggregator") || "Deactivate") : (t("aggregators.activateAggregator") || "Activate")}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {data?.pagination && data.pagination.total_pages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-muted-foreground">
            {t("aggregators.showingXofY") || "Showing {start} to {end} of {total}"
              .replace("{start}", data.pagination.start_index.toString())
              .replace("{end}", data.pagination.end_index.toString())
              .replace("{total}", data.pagination.total_count.toString())}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!data.pagination.has_previous}
              onClick={() => setPage(page - 1)}
            >
              {t("common.previous") || "Previous"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!data.pagination.has_next}
              onClick={() => setPage(page + 1)}
            >
              {t("common.next") || "Next"}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}


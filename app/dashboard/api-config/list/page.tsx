"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { useApi } from "@/lib/useApi"
import { useLanguage } from "@/components/providers/language-provider"
import { 
  Search, 
  ArrowUpDown, 
  Settings, 
  Plus, 
  Filter,
  RefreshCw,
  MoreHorizontal,
  Copy,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ErrorDisplay, extractErrorMessages } from "@/components/ui/error-display"
import { Badge } from "@/components/ui/badge"
import { formatApiDateTime } from "@/lib/utils"

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""

export default function ApiConfigListPage() {
  const [configs, setConfigs] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [sortField, setSortField] = useState<"name" | "updated_at" | "created_at" | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  
  const apiFetch = useApi()
  const { t } = useLanguage()
  const { toast } = useToast()
  const itemsPerPage = 20

  // Modal states
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedConfig, setSelectedConfig] = useState<any | null>(null)

  const fetchConfigs = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        page_size: itemsPerPage.toString(),
      })

      if (searchTerm.trim() !== "") {
        params.append("search", searchTerm)
      }

      if (statusFilter !== "all") {
        params.append("is_active", statusFilter === "active" ? "true" : "false")
      }

      // Add sorting
      let ordering = ""
      if (sortField === "name") {
        ordering = `${sortDirection === "asc" ? "" : "-"}name`
      } else if (sortField === "updated_at") {
        ordering = `${sortDirection === "asc" ? "" : "-"}updated_at`
      } else if (sortField === "created_at") {
        ordering = `${sortDirection === "asc" ? "" : "-"}created_at`
      }
      
      if (ordering) {
        params.append("ordering", ordering)
      }

      const endpoint = `${baseUrl}/api/payments/betting/admin/api-config/?${params.toString()}`
      const data = await apiFetch(endpoint)
      
      setConfigs(data.results || [])
      setTotalCount(data.count || 0)
      setTotalPages(Math.ceil((data.count || 0) / itemsPerPage))
      
      toast({
        title: t("apiConfig.apiConfigurationsLoaded"),
        description: t("apiConfig.apiConfigurationsLoadedSuccessfully"),
      })
    } catch (err: any) {
      const errorMessage = extractErrorMessages(err) || t("apiConfig.failedToLoadApiConfigurations")
      setError(errorMessage)
      setConfigs([])
      setTotalCount(0)
      setTotalPages(1)
      toast({
        title: t("apiConfig.failedToLoadApiConfigurations"),
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [searchTerm, statusFilter, currentPage, sortField, sortDirection, apiFetch, t, toast])

  useEffect(() => {
    fetchConfigs()
  }, [fetchConfigs])

  const handleSort = (field: "name" | "updated_at" | "created_at") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  const handleRefresh = () => {
    fetchConfigs()
  }

  const handleOpenDetail = (config: any) => {
    setSelectedConfig(config)
    setDetailModalOpen(true)
  }

  const maskSecretKey = (key: string) => {
    if (!key) return t("apiConfig.notSet")
    if (key.length <= 8) return "••••••••"
    return `${key.slice(0, 4)}${'•'.repeat(key.length - 8)}${key.slice(-4)}`
  }

  const maskPublicKey = (key: string) => {
    if (!key) return t("apiConfig.notSet")
    if (key.length <= 12) return "••••••••••••"
    return `${key.slice(0, 8)}${'•'.repeat(key.length - 12)}${key.slice(-4)}`
  }

  const startIndex = (currentPage - 1) * itemsPerPage

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            {t("apiConfig.apiConfigurationManagement")}
          </h1>
          <p className="text-muted-foreground">
            {t("apiConfig.apiConfigurationsDescription") || "Manage and configure API endpoints and keys"}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-accent rounded-lg">
            <Settings className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">
              {totalCount} {t("apiConfig.configs") || "configs"}
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {t("common.refresh") || "Refresh"}
          </Button>
          <Link href="/dashboard/api-config/create">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              {t("apiConfig.createApiConfiguration")}
            </Button>
          </Link>
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
                placeholder={t("apiConfig.searchApiConfigurations")}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-10"
                variant="minimal"
              />
            </div>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={(val) => {
              setStatusFilter(val)
              setCurrentPage(1)
            }}>
              <SelectTrigger>
                <SelectValue placeholder={t("apiConfig.status") || "Filter by status"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("common.allStatuses") || "All statuses"}</SelectItem>
                <SelectItem value="active">{t("common.active") || "Active"}</SelectItem>
                <SelectItem value="inactive">{t("common.inactive") || "Inactive"}</SelectItem>
              </SelectContent>
            </Select>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                {t("common.advancedFilters") || "Advanced filters"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Config Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            {t("apiConfig.apiConfigurationManagement")}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading && configs.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="text-muted-foreground">{t("common.loading") || "Loading API configs..."}</span>
              </div>
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <ErrorDisplay error={error} onRetry={handleRefresh} />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">{t("apiConfig.name")}</TableHead>
                    <TableHead className="font-semibold">{t("apiConfig.baseUrlTable")}</TableHead>
                    <TableHead className="font-semibold">{t("apiConfig.status")}</TableHead>
                    <TableHead className="font-semibold">
                      <Button variant="ghost" onClick={() => handleSort("updated_at")} className="h-auto p-0 font-semibold text-xs">
                        {t("apiConfig.lastUpdatedTable")}
                        <ArrowUpDown className="ml-1 h-3 w-3" />
                      </Button>
                    </TableHead>
                    <TableHead className="font-semibold text-right">{t("apiConfig.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {configs.map((config) => (
                    <TableRow key={config.uid} className="hover:bg-accent/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Settings className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium text-foreground">
                              {config.name || "N/A"}
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1 group">
                              UID: {config.uid?.slice(0, 8)}...
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => {
                                  navigator.clipboard.writeText(config.uid)
                                  toast({ title: t("common.uidCopied") || "UID Copied!" })
                                }}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-sm bg-muted px-1 py-0.5 rounded max-w-[200px] truncate block">
                          {config.base_url || "N/A"}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={config.is_active ? "default" : "secondary"}
                        >
                          {config.is_active ? t("common.active") : t("common.inactive")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs text-muted-foreground">
                          {config.updated_at ? formatApiDateTime(config.updated_at) : "-"}
                          {config.updated_by_name && (
                            <div className="mt-1 font-medium">{config.updated_by_name}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenDetail(config)}>
                              <Eye className="h-4 w-4 mr-2" />
                              {t("apiConfig.viewDetails")}
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/api-config/edit/${config.uid}`}>
                                <Pencil className="h-4 w-4 mr-2" />
                                {t("apiConfig.editConfiguration")}
                              </Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {configs.length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        {t("common.noResults") || "No API configurations found."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {t("apiConfig.showing")}: {startIndex + 1}-{Math.min(startIndex + itemsPerPage, totalCount)} {t("common.of") || "of"} {totalCount}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || loading}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              {t("common.previous") || t("apiConfig.previous")}
            </Button>
            <div className="text-sm font-medium">
              {t("common.page") || t("apiConfig.page")} {currentPage} / {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || loading}
            >
              {t("common.next") || t("apiConfig.next")}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("apiConfig.configurationInformation")}</DialogTitle>
          </DialogHeader>
          {selectedConfig ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase">{t("apiConfig.name")}</span>
                  <div className="font-semibold">{selectedConfig.name}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase">{t("apiConfig.status")}</span>
                  <div>
                    <Badge variant={selectedConfig.is_active ? "default" : "secondary"}>
                      {selectedConfig.is_active ? t("common.active") : t("common.inactive")}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground uppercase">{t("apiConfig.baseUrl")}</span>
                <div className="bg-muted p-2 rounded flex items-center justify-between">
                  <code className="text-sm break-all">{selectedConfig.base_url}</code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 ml-2 flex-shrink-0"
                    onClick={() => {
                      navigator.clipboard.writeText(selectedConfig.base_url)
                      toast({ title: t("common.copied") || "Copied!" })
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase">{t("apiConfig.publicKey")}</span>
                  <div className="bg-muted p-2 rounded flex items-center justify-between">
                    <code className="text-sm break-all">{maskPublicKey(selectedConfig.public_key)}</code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 ml-2 flex-shrink-0"
                      onClick={() => {
                        navigator.clipboard.writeText(selectedConfig.public_key)
                        toast({ title: t("apiConfig.publicKeyCopied") })
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase">{t("apiConfig.secretKey")}</span>
                  <div className="bg-muted p-2 rounded flex items-center justify-between">
                    <code className="text-sm break-all">{maskSecretKey(selectedConfig.secret_key)}</code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 ml-2 flex-shrink-0"
                      onClick={() => {
                        navigator.clipboard.writeText(selectedConfig.secret_key)
                        toast({ title: t("apiConfig.secretKeyCopied") })
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase">{t("apiConfig.timeout")}</span>
                  <div className="text-sm font-medium">{selectedConfig.timeout_seconds} {t("apiConfig.seconds")}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase">{t("apiConfig.created")}</span>
                  <div className="text-sm">{selectedConfig.created_at ? formatApiDateTime(selectedConfig.created_at) : t("platforms.unknown")}</div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase">{t("apiConfig.lastUpdated")}</span>
                  <div className="text-sm">{selectedConfig.updated_at ? formatApiDateTime(selectedConfig.updated_at) : t("platforms.unknown")}</div>
                </div>
              </div>

              {selectedConfig.updated_by_name && (
                <div className="space-y-1 border-t pt-4">
                  <span className="text-xs font-medium text-muted-foreground uppercase">{t("apiConfig.updatedBy")}</span>
                  <div className="text-sm font-medium">{selectedConfig.updated_by_name}</div>
                </div>
              )}
            </div>
          ) : null}
          <div className="flex justify-end mt-6 gap-3">
            <Button variant="outline" onClick={() => setDetailModalOpen(false)}>
              {t("common.close") || "Close"}
            </Button>
            {selectedConfig && (
              <Button asChild>
                <Link href={`/dashboard/api-config/edit/${selectedConfig.uid}`}>
                  <Pencil className="h-4 w-4 mr-2" />
                  {t("apiConfig.editConfiguration")}
                </Link>
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}


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
  DollarSign, 
  Plus, 
  Filter, 
  CheckCircle, 
  XCircle,
  Pencil,
  Download,
  RefreshCw
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ErrorDisplay, extractErrorMessages } from "@/components/ui/error-display"
import { Badge } from "@/components/ui/badge"

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""

export default function CommissionConfigListPage() {
  const [configs, setConfigs] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortField, setSortField] = useState<"name" | "rate" | null>(null)
  const [sortDirection, setSortDirection] = useState<"+" | "-">("-")
  const apiFetch = useApi()
  const { t } = useLanguage()
  const { toast } = useToast();

  useEffect(() => {
    const fetchConfigs = async () => {
      setLoading(true)
      setError("")
      try {
        const data = await apiFetch(`${baseUrl}/api/commission-configs/`)
        const configsData = Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : []
        setConfigs(configsData)
        toast({
          title: t("commissionConfig.loaded") || "Commission configs loaded",
          description: t("commissionConfig.loadedSuccessfully") || "Commission config list loaded successfully",
        })
      } catch (err: any) {
        const errorMessage = extractErrorMessages(err) || t("commissionConfig.failedToLoad") || "Failed to load commission configs"
        setError(errorMessage)
        toast({
          title: t("commissionConfig.failedToLoad") || "Failed to load",
          description: errorMessage,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchConfigs()
  }, [searchTerm, statusFilter, currentPage, sortField, sortDirection])

  const filteredConfigs = useMemo(() => {
    let filtered = configs

    if (searchTerm) {
      filtered = filtered.filter(config =>
        config.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        config.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(config => 
        statusFilter === "active" ? config.is_active : !config.is_active
      )
    }

    return filtered
  }, [configs, searchTerm, statusFilter])

  const handleSort = (field: "name" | "rate") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "+" ? "-" : "+")
    } else {
      setSortField(field)
      setSortDirection("-")
    }
  }

  const handleRefresh = async () => {
    setLoading(true)
    setError("")
    try {
      const data = await apiFetch(`${baseUrl}/api/commission-configs/`)
      const configsData = Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : []
      setConfigs(configsData)
      toast({
        title: t("commissionConfig.loaded") || "Commission configs refreshed",
        description: t("commissionConfig.loadedSuccessfully") || "Commission config list refreshed successfully",
      })
    } catch (err: any) {
      const errorMessage = extractErrorMessages(err) || t("commissionConfig.failedToLoad") || "Failed to load commission configs"
      setError(errorMessage)
      toast({
        title: t("commissionConfig.failedToLoad") || "Failed to load",
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
            Commission Config
          </h1>
          <p className="text-muted-foreground">
            Manage commission configurations
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-accent rounded-lg">
            <DollarSign className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">
              {filteredConfigs.length} configs
            </span>
          </div>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Link href="/dashboard/commission-config/create">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Create Config
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
                placeholder="Search a commission config..."
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
                <Filter className="h-4 w-4 mr-2" />
                Advanced filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Commission Config Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Commission Config List
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="text-muted-foreground">Loading commission configs...</span>
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
                    <TableHead className="font-semibold">Config Name</TableHead>
                    <TableHead className="font-semibold">Rate</TableHead>
                    <TableHead className="font-semibold">Min Amount</TableHead>
                    <TableHead className="font-semibold">Max Amount</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredConfigs.map((config) => (
                    <TableRow key={config.id} className="hover:bg-accent/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <DollarSign className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium text-foreground">
                              {config.name || "N/A"}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              ID: {config.id || "N/A"}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {config.rate ? `${config.rate}%` : "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {config.min_amount !== undefined ? `$${config.min_amount}` : "N/A"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {config.max_amount !== undefined ? `$${config.max_amount}` : "N/A"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={config.is_active ? "default" : "secondary"}
                        >
                          {config.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/dashboard/commission-config/edit/${config.id}`}>
                            <Button variant="ghost" size="sm">
                              <Pencil className="h-4 w-4" />
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
      {!loading && filteredConfigs.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="space-y-4">
              <div className="h-16 w-16 rounded-full bg-accent mx-auto flex items-center justify-center">
                <DollarSign className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">No commission configs found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== "all" 
                    ? "No commission configs match your search criteria."
                    : "Start by creating your first commission config."
                  }
                </p>
              </div>
              {(!searchTerm && statusFilter === "all") && (
                <Link href="/dashboard/commission-config/create">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Config
                  </Button>
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

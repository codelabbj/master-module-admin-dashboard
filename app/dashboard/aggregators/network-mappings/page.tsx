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
  RefreshCw
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ErrorDisplay, extractErrorMessages } from "@/components/ui/error-display"
import { Badge } from "@/components/ui/badge"

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""

export default function AggregatorNetworkMappingsPage() {
  const [mappings, setMappings] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const apiFetch = useApi()
  const { t } = useLanguage()
  const { toast } = useToast();

  useEffect(() => {
    const fetchMappings = async () => {
      setLoading(true)
      setError("")
      try {
        const data = await apiFetch(`${baseUrl}/api/aggregators/network-mappings/`)
        const mappingsData = Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : []
        setMappings(mappingsData)
        toast({
          title: t("aggregators.mappings.loaded") || "Aggregator network mappings loaded",
          description: t("aggregators.mappings.loadedSuccessfully") || "Aggregator network mapping list loaded successfully",
        })
      } catch (err: any) {
        const errorMessage = extractErrorMessages(err) || t("aggregators.mappings.failedToLoad") || "Failed to load aggregator network mappings"
        setError(errorMessage)
        toast({
          title: t("aggregators.mappings.failedToLoad") || "Failed to load",
          description: errorMessage,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchMappings()
  }, [searchTerm, statusFilter, apiFetch, t, toast])

  const filteredMappings = useMemo(() => {
    let filtered = mappings

    if (searchTerm) {
      filtered = filtered.filter(mapping =>
        mapping.network_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        mapping.aggregator_name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(mapping => 
        statusFilter === "active" ? mapping.is_active : !mapping.is_active
      )
    }

    return filtered
  }, [mappings, searchTerm, statusFilter])

  const handleRefresh = async () => {
    setLoading(true)
    setError("")
    try {
      const data = await apiFetch(`${baseUrl}/api/aggregators/network-mappings/`)
      const mappingsData = Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : []
      setMappings(mappingsData)
      toast({
        title: t("aggregators.mappings.loaded") || "Aggregator network mappings refreshed",
        description: t("aggregators.mappings.loadedSuccessfully") || "Aggregator network mapping list refreshed successfully",
      })
    } catch (err: any) {
      const errorMessage = extractErrorMessages(err) || t("aggregators.mappings.failedToLoad") || "Failed to load aggregator network mappings"
      setError(errorMessage)
      toast({
        title: t("aggregators.mappings.failedToLoad") || "Failed to load",
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
            Aggregator Network Mappings
          </h1>
          <p className="text-muted-foreground">
            Manage aggregator network mappings
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-accent rounded-lg">
            <Share2 className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">
              {filteredMappings.length} mappings
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
                placeholder="Search a mapping..."
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

      {/* Aggregator Network Mappings Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" />
            Aggregator Network Mappings
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="text-muted-foreground">Loading aggregator network mappings...</span>
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
                    <TableHead className="font-semibold">Network</TableHead>
                    <TableHead className="font-semibold">Aggregator</TableHead>
                    <TableHead className="font-semibold">Code</TableHead>
                    <TableHead className="font-semibold">Description</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMappings.map((mapping) => (
                    <TableRow key={mapping.id} className="hover:bg-accent/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Share2 className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium text-foreground">
                              {mapping.network_name || "N/A"}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              ID: {mapping.id || "N/A"}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {mapping.aggregator_name || "N/A"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">
                          {mapping.code || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {mapping.description || "N/A"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={mapping.is_active ? "default" : "secondary"}
                        >
                          {mapping.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/dashboard/aggregators/network-mappings/${mapping.id}`}>
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
      {!loading && filteredMappings.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="space-y-4">
              <div className="h-16 w-16 rounded-full bg-accent mx-auto flex items-center justify-center">
                <Share2 className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">No aggregator network mappings found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || statusFilter !== "all" 
                    ? "No aggregator network mappings match your search criteria."
                    : "Start by creating your first aggregator network mapping."
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

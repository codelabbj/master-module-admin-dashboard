"use client"
import { useEffect, useState, useMemo } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Copy, Search, ArrowUpDown, ChevronLeft, ChevronRight, Bell, Filter, CheckCircle, XCircle, Clock, Smartphone, RefreshCw, Download } from "lucide-react"
import { useApi } from "@/lib/useApi"
import { useLanguage } from "@/components/providers/language-provider"
import { useToast } from "@/hooks/use-toast"
import { ErrorDisplay, extractErrorMessages } from "@/components/ui/error-display"
import { Badge } from "@/components/ui/badge"

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""

interface PaginationInfo {
  count: number
  next: string | null
  previous: string | null
  results: any[]
}

export default function FcmLogsListPage() {
  const [paginationData, setPaginationData] = useState<PaginationInfo>({
    count: 0,
    next: null,
    previous: null,
    results: []
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState<string | null>(null)

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(id)
      toast({
        title: "Copié !",
        description: "L'identifiant a été copié dans le presse-papiers.",
      })
      setTimeout(() => setCopied(null), 2000)
    })
  }
  const [searchTerm, setSearchTerm] = useState("")
  const [deviceFilter, setDeviceFilter] = useState("all")
  const [sortField, setSortField] = useState<"created_at" | "device_id" | null>(null)
  const [sortDirection, setSortDirection] = useState<"+" | "-">("-")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const apiFetch = useApi()
  const { t } = useLanguage()
  const { toast } = useToast()

  // Calculate pagination info
  const totalPages = Math.ceil(paginationData.count / pageSize)
  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, paginationData.count)

  useEffect(() => {
    const fetchFcmLogs = async () => {
      setLoading(true)
      setError("")
      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          page_size: pageSize.toString(),
        })

        if (searchTerm.trim() !== "") {
          params.append("search", searchTerm)
        }
        if (deviceFilter !== "all") {
          params.append("device_id", deviceFilter)
        }
        if (sortField) {
          params.append("ordering", `${sortDirection}${sortField}`)
        }

        const query = params.toString().replace(/ordering=%2B/g, "ordering=+")
        const endpoint = `${baseUrl.replace(/\/$/, "")}/api/payments/fcm-logs/?${query}`

        const data = await apiFetch(endpoint)

        // Handle both paginated and non-paginated responses
        if (data.results) {
          setPaginationData(data)
        } else {
          // Fallback for non-paginated response
          setPaginationData({
            count: Array.isArray(data) ? data.length : 0,
            next: null,
            previous: null,
            results: Array.isArray(data) ? data : []
          })
        }

        toast({
          title: t("fcmLogs.success"),
          description: t("fcmLogs.loadedSuccessfully"),
        })
      } catch (err: any) {
        const errorMessage = extractErrorMessages(err) || t("fcmLogs.failedToLoad")
        setError(errorMessage)
        setPaginationData({
          count: 0,
          next: null,
          previous: null,
          results: []
        })
        toast({
          title: t("fcmLogs.failedToLoad"),
          description: errorMessage,
          variant: "destructive",
        })
        console.error('FCM logs fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchFcmLogs()
  }, [searchTerm, deviceFilter, sortField, sortDirection, currentPage, pageSize])

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(text)
      toast({
        title: t("common.copied"),
        description: t("common.copiedToClipboard"),
      })
      setTimeout(() => setCopied(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleSort = (field: "created_at" | "device_id") => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "+" ? "-" : "+"))
      setSortField(field)
    } else {
      setSortField(field)
      setSortDirection("-")
    }
  }

  const handleRefresh = async () => {
    setLoading(true)
    setError("")
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        page_size: pageSize.toString(),
      })

      if (searchTerm.trim() !== "") {
        params.append("search", searchTerm)
      }
      if (deviceFilter !== "all") {
        params.append("device_id", deviceFilter)
      }
      if (sortField) {
        params.append("ordering", `${sortDirection}${sortField}`)
      }

      const query = params.toString().replace(/ordering=%2B/g, "ordering=+")
      const endpoint = `${baseUrl}/api/payments/fcm-logs/?${query}`

      const data = await apiFetch(endpoint)

      if (data.results) {
        setPaginationData(data)
      } else {
        setPaginationData({
          count: Array.isArray(data) ? data.length : 0,
          next: null,
          previous: null,
          results: Array.isArray(data) ? data : []
        })
      }

      toast({
        title: t("fcmLogs.success") || "Logs FCM actualisés",
        description: t("fcmLogs.loadedSuccessfully") || "Liste des logs FCM actualisée avec succès",
      })
    } catch (err: any) {
      const errorMessage = extractErrorMessages(err) || t("fcmLogs.failedToLoad") || "Échec du chargement des logs FCM"
      setError(errorMessage)
      toast({
        title: t("fcmLogs.failedToLoad") || "Échec du chargement",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const renderFcmData = (data: any) => {
    if (!data || typeof data !== 'object') return <span className="text-muted-foreground italic">N/A</span>

    const entries = Object.entries(data).filter(([key]) =>
      !['raw_fcm', 'ai_confidence_score', 'confidence', 'wave_payment_data'].includes(key.toLowerCase())
    )

    if (entries.length === 0) return <span className="text-muted-foreground italic">N/A</span>

    return (
      <div className="flex flex-col gap-1.5 py-1">
        {entries.map(([key, value]: [string, any]) => (
          <div key={key} className="flex flex-col">
            <span className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wider">
              {key.replace(/_/g, ' ')}
            </span>
            <div className="flex items-center gap-1 group/val">
              <span className="text-xs font-medium text-foreground break-all leading-tight">
                {typeof value === 'object' ? JSON.stringify(value) : String(value)}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-3 w-3 opacity-0 group-hover/val:opacity-100 transition-opacity"
                onClick={() => copyToClipboard(typeof value === 'object' ? JSON.stringify(value) : String(value), `val-${key}`)}
              >
                <Copy className="h-2 w-2" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            {t("fcmLogs.list") || "Logs FCM"}
          </h1>
          <p className="text-muted-foreground">
            Surveiller les journaux Firebase Cloud Messaging
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-accent rounded-lg">
            <Bell className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">
              {paginationData.count} notifications
            </span>
          </div>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher dans les journaux FCM..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Device Filter */}
            <Select value={deviceFilter} onValueChange={setDeviceFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrer par appareil" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les appareils</SelectItem>
                {/* Add device options here if available */}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select
              value={sortField || ""}
              onValueChange={(value) => setSortField(value as "created_at" | "device_id" | null)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Date</SelectItem>
                <SelectItem value="device_id">Appareil</SelectItem>
              </SelectContent>
            </Select>

            {/* Page Size */}
            <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(parseInt(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Taille de page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="20">20 par page</SelectItem>
                <SelectItem value="50">50 par page</SelectItem>
                <SelectItem value="100">100 par page</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* FCM Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Journaux FCM
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="text-muted-foreground">Chargement des journaux FCM...</span>
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
                    <TableHead className="font-semibold">UID</TableHead>
                    <TableHead className="font-semibold">Package Name</TableHead>
                    <TableHead className="font-semibold">ID Appareil</TableHead>
                    <TableHead className="font-semibold">Body</TableHead>
                    <TableHead className="font-semibold">Statut</TableHead>
                    <TableHead className="font-semibold">Data</TableHead>
                    <TableHead className="font-semibold">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginationData.results.map((log, index) => (
                    <TableRow key={log.id || log.uid || index} className="hover:bg-accent/50">
                      <TableCell>
                        <div className="flex items-center gap-1 group">
                          <span className="font-mono text-xs text-muted-foreground">
                            {log.uid || log.id || "N/A"}
                          </span>
                          {(log.uid || log.id) && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => copyToClipboard(log.uid || log.id, `uid-${log.id || index}`)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 group">
                          <span className="text-xs font-medium text-foreground">
                            {log.package_name || "N/A"}
                          </span>
                          {log.package_name && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => copyToClipboard(log.package_name, `pkg-${log.id || index}`)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 group">
                          <Smartphone className="h-3 w-3 text-muted-foreground" />
                          <span className="font-mono text-xs text-muted-foreground">
                            {log.device_id || "N/A"}
                          </span>
                          {log.device_id && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => copyToClipboard(log.device_id, `device-${log.id || index}`)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[300px]">
                        <div className="flex items-start gap-1 group">
                          <p className="text-sm text-foreground whitespace-normal break-words leading-relaxed">
                            {log.body || log.message || log.content || "N/A"}
                          </p>
                          {(log.body || log.message || log.content) && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                              onClick={() => copyToClipboard(log.body || log.message || log.content || "", `body-${log.id || index}`)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge
                            variant={
                              log.status === 'success' || log.status === 'delivered' ? "default" :
                                log.status === 'failed' || log.status === 'error' ? "destructive" :
                                  "secondary"
                            }
                          >
                            <div className="flex items-center gap-1">
                              {log.status === 'success' || log.status === 'delivered' ? (
                                <CheckCircle className="h-3 w-3" />
                              ) : log.status === 'failed' || log.status === 'error' ? (
                                <XCircle className="h-3 w-3" />
                              ) : (
                                <Clock className="h-3 w-3" />
                              )}
                              <span>{log.status || 'Inconnu'}</span>
                            </div>
                          </Badge>
                          {log.status_display && log.status_display !== log.status && (
                            <span className="text-[10px] text-muted-foreground leading-tight italic">
                              {log.status_display}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[220px] align-top">
                        <div className="flex items-start gap-1 group">
                          {renderFcmData(log.data)}
                          {log.data && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 mt-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                              onClick={() => copyToClipboard(JSON.stringify(log.data, null, 2), `data-${log.id || index}`)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 whitespace-nowrap">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {log.created_at ? new Date(log.created_at).toLocaleString() :
                              log.timestamp ? new Date(log.timestamp).toLocaleString() : "N/A"}
                          </span>
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Affichage de {startItem} à {endItem} sur {paginationData.count} résultats
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Précédent
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let page;
                if (totalPages <= 5) {
                  page = i + 1;
                } else if (currentPage <= 3) {
                  page = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  page = totalPages - 4 + i;
                } else {
                  page = currentPage - 2 + i;
                }
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                );
              })}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Suivant
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && paginationData.results.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="space-y-4">
              <div className="h-16 w-16 rounded-full bg-accent mx-auto flex items-center justify-center">
                <Bell className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Aucun journal FCM trouvé</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? `Aucun journal FCM ne correspond à "${searchTerm}"` : "Aucun journal FCM n'a encore été enregistré."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
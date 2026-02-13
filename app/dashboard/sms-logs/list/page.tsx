"use client"

import { useEffect, useState, useMemo } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Copy,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Phone,
  Download,
  RefreshCw,
  Eye
} from "lucide-react"
import { useApi } from "@/lib/useApi"
import { useLanguage } from "@/components/providers/language-provider"
import { useToast } from "@/hooks/use-toast"
import { ErrorDisplay, extractErrorMessages } from "@/components/ui/error-display"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""

interface PaginationInfo {
  count: number
  next: string | null
  previous: string | null
  results: any[]
}

export default function SmsLogsListPage() {
  const [paginationData, setPaginationData] = useState<PaginationInfo>({
    count: 0,
    next: null,
    previous: null,
    results: []
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<"created_at" | "phone_number" | null>(null)
  const [sortDirection, setSortDirection] = useState<"+" | "-">("-")
  const apiFetch = useApi()
  const { t } = useLanguage()
  const { toast } = useToast()

  useEffect(() => {
    const fetchSmsLogs = async () => {
      setLoading(true)
      setError("")
      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          page_size: "20",
        })

        if (searchTerm.trim() !== "") {
          params.append("search", searchTerm)
        }
        if (typeFilter !== "all") {
          params.append("type", typeFilter)
        }
        if (statusFilter !== "all") {
          params.append("status", statusFilter)
        }
        if (sortField) {
          params.append("ordering", `${sortDirection}${sortField}`)
        }

        const query = params.toString().replace(/ordering=%2B/g, "ordering=+")
        const endpoint = `${baseUrl}/api/payments/sms-logs/?${query}`

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
          title: t("smsLogs.success") || "Logs SMS chargés",
          description: t("smsLogs.loadedSuccessfully") || "Liste des logs SMS chargée avec succès",
        })
      } catch (err: any) {
        const errorMessage = extractErrorMessages(err) || t("smsLogs.failedToLoad") || "Échec du chargement des logs SMS"
        setError(errorMessage)
        setPaginationData({
          count: 0,
          next: null,
          previous: null,
          results: []
        })
        toast({
          title: t("smsLogs.failedToLoad") || "Échec du chargement",
          description: errorMessage,
          variant: "destructive",
        })
        console.error('SMS logs fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchSmsLogs()
  }, [searchTerm, typeFilter, statusFilter, currentPage, sortField, sortDirection])

  const filteredLogs = useMemo(() => {
    let filtered = paginationData.results

    if (searchTerm) {
      filtered = filtered.filter(log =>
        Object.values(log).some(value =>
          value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter(log => log.type === typeFilter)
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(log => log.status === statusFilter)
    }

    return filtered
  }, [paginationData.results, searchTerm, typeFilter, statusFilter])

  const handleSort = (field: "created_at" | "phone_number") => {
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
      const params = new URLSearchParams({
        page: currentPage.toString(),
        page_size: "20",
      })

      if (searchTerm.trim() !== "") {
        params.append("search", searchTerm)
      }
      if (typeFilter !== "all") {
        params.append("type", typeFilter)
      }
      if (statusFilter !== "all") {
        params.append("status", statusFilter)
      }
      if (sortField) {
        params.append("ordering", `${sortDirection}${sortField}`)
      }

      const query = params.toString().replace(/ordering=%2B/g, "ordering=+")
      const endpoint = `${baseUrl}/api/payments/sms-logs/?${query}`

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
        title: t("smsLogs.success") || "Logs SMS actualisés",
        description: t("smsLogs.loadedSuccessfully") || "Liste des logs SMS actualisée avec succès",
      })
    } catch (err: any) {
      const errorMessage = extractErrorMessages(err) || t("smsLogs.failedToLoad") || "Échec du chargement des logs SMS"
      setError(errorMessage)
      toast({
        title: t("smsLogs.failedToLoad") || "Échec du chargement",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      sent: "default",
      delivered: "success",
      failed: "destructive",
      pending: "warning"
    } as const

    return <Badge variant={variants[status as keyof typeof variants]}>{status}</Badge>
  }

  const getTypeBadge = (type: string) => {
    const variants = {
      verification: "info",
      notification: "default",
      error: "destructive",
      welcome: "success"
    } as const

    return <Badge variant={variants[type as keyof typeof variants]}>{type}</Badge>
  }

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(id)
      toast({
        title: "Copié!",
        description: "Le texte a été copié dans le presse-papiers",
      })
      setTimeout(() => setCopied(null), 2000)
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible de copier le texte",
        variant: "destructive",
      })
    }
  }

  const renderExtractedData = (data: any) => {
    if (!data || typeof data !== 'object') return <span className="text-muted-foreground italic">N/A</span>

    const entries = Object.entries(data).filter(([key]) =>
      !['raw_sms', 'ai_confidence_score', 'confidence'].includes(key.toLowerCase())
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
            Logs SMS
          </h1>
          <p className="text-muted-foreground">
            Surveiller et analyser les messages SMS envoyés
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-accent rounded-lg">
            <MessageSquare className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">
              {paginationData.count.toLocaleString()} messages
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-950/20 rounded-lg">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium text-green-600 dark:text-green-400">
              {filteredLogs.filter(log => log.status === 'delivered').length} livrés
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

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un SMS..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                variant="minimal"
              />
            </div>

            {/* Type Filter */}
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrer par type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="verification">Vérification</SelectItem>
                <SelectItem value="notification">Notification</SelectItem>
                <SelectItem value="error">Erreur</SelectItem>
                <SelectItem value="welcome">Bienvenue</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="sent">Envoyé</SelectItem>
                <SelectItem value="delivered">Livré</SelectItem>
                <SelectItem value="failed">Échoué</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
              </SelectContent>
            </Select>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtres avancés
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SMS Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Liste des logs SMS
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="text-muted-foreground">Chargement des logs SMS...</span>
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
                    <TableHead className="font-semibold">UID</TableHead>
                    <TableHead className="font-semibold">Expéditeur</TableHead>
                    <TableHead className="font-semibold">ID Appareil</TableHead>
                    <TableHead className="font-semibold">Contenu</TableHead>
                    <TableHead className="font-semibold">Données extraites</TableHead>
                    <TableHead className="font-semibold">Statut</TableHead>
                    <TableHead className="font-semibold">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log, index) => (
                    <TableRow key={log.id || index} className="hover:bg-accent/50">
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
                          <span className="font-mono text-xs text-foreground">
                            {log.sender || "N/A"}
                          </span>
                          {log.sender && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => copyToClipboard(log.sender, `sender-${log.id || index}`)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 group">
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
                            {log.content || "N/A"}
                          </p>
                          {log.content && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                              onClick={() => copyToClipboard(log.content, `msg-${log.id || index}`)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[220px] align-top">
                        <div className="flex items-start gap-1 group">
                          {renderExtractedData(log.extracted_data)}
                          {log.extracted_data && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-4 w-4 mt-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                              onClick={() => copyToClipboard(JSON.stringify(log.extracted_data, null, 2), `ext-${log.id || index}`)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {getStatusBadge(log.status || "unknown")}
                          {log.status_display && log.status_display !== log.status && (
                            <span className="text-[10px] text-muted-foreground leading-tight italic">
                              {log.status_display}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 whitespace-nowrap">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {log.created_at ? new Date(log.created_at).toLocaleString() : "N/A"}
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
      {paginationData.count > 20 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Affichage de {((currentPage - 1) * 20) + 1} à {Math.min(currentPage * 20, paginationData.count)} sur {paginationData.count} résultats
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
              {(() => {
                const totalPages = Math.ceil(paginationData.count / 20);
                const pages = [];
                const startPage = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
                const endPage = Math.min(totalPages, Math.max(currentPage + 2, 5));

                for (let i = startPage; i <= endPage; i++) {
                  pages.push(
                    <Button
                      key={i}
                      variant={currentPage === i ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(i)}
                    >
                      {i}
                    </Button>
                  );
                }
                return pages;
              })()}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(Math.ceil(paginationData.count / 20), currentPage + 1))}
              disabled={currentPage === Math.ceil(paginationData.count / 20)}
            >
              Suivant
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredLogs.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="space-y-4">
              <div className="h-16 w-16 rounded-full bg-accent mx-auto flex items-center justify-center">
                <MessageSquare className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Aucun log SMS trouvé</h3>
                <p className="text-muted-foreground">
                  {searchTerm || typeFilter !== "all" || statusFilter !== "all"
                    ? "Aucun log SMS ne correspond à vos critères de recherche."
                    : "Aucun message SMS n'a été envoyé récemment."
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
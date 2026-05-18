"use client"
import { Suspense } from "react"

import { useState, useEffect, useCallback } from "react"
import { useSearchParams, usePathname, useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLanguage } from "@/components/providers/language-provider"
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, MoreHorizontal, DollarSign, AlertTriangle, CheckCircle, XCircle, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useApi } from "@/lib/useApi"
import { ErrorDisplay, extractErrorMessages } from "@/components/ui/error-display"
import Link from "next/link"
import { CopyIcon } from "lucide-react"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

import { formatApiDateTime } from "@/lib/utils";

function BettingTransactionsPageContent() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "")
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "all")
  const [transactionTypeFilter, setTransactionTypeFilter] = useState(searchParams.get("type") || "all")
  const [platformFilter, setPlatformFilter] = useState(searchParams.get("platform") || "all")
  const [commissionPaidFilter, setCommissionPaidFilter] = useState(searchParams.get("commission_paid") || "all")
  const [startDate, setStartDate] = useState(searchParams.get("start_date") || "")
  const [endDate, setEndDate] = useState(searchParams.get("end_date") || "")
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get("page")) || 1)
  const [transactions, setTransactions] = useState<any[]>([])
  const [platforms, setPlatforms] = useState<any[]>([])
  const [stats, setStats] = useState<any | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [platformsLoading, setPlatformsLoading] = useState(false)
  const [statsLoading, setStatsLoading] = useState(false)
  const [error, setError] = useState("")
  const [sortField, setSortField] = useState<"created_at" | "amount" | "partner_name" | null>((searchParams.get("sort") as any) || null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">((searchParams.get("direction") as "asc" | "desc") || "desc")
  
  const itemsPerPage = 20
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""
  const { toast } = useToast()
  const { t } = useLanguage()
  const apiFetch = useApi()

  const updateUrl = useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "all" || value === "") {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    })
    router.push(`${pathname}?${params.toString()}`)
  }, [searchParams, pathname, router])
  
  // Modal states
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null)
  const [cancellationModalOpen, setCancellationModalOpen] = useState(false)
  const [processingCancellation, setProcessingCancellation] = useState(false)
  const [cancellationNotes, setCancellationNotes] = useState("")

  // Success modal state
  const [successModalOpen, setSuccessModalOpen] = useState(false)
  const [successReason, setSuccessReason] = useState("")
  const [successLoading, setSuccessLoading] = useState(false)
  const [successError, setSuccessError] = useState("")
  const [successTransaction, setSuccessTransaction] = useState<any | null>(null)

  // Refund modal state
  const [refundModalOpen, setRefundModalOpen] = useState(false)
  const [refundReason, setRefundReason] = useState("")
  const [refundError, setRefundError] = useState("")
  const [refundTransaction, setRefundTransaction] = useState<any | null>(null)

  // Failed modal state
  const [failedModalOpen, setFailedModalOpen] = useState(false)
  const [failedReason, setFailedReason] = useState("Tentative de relance après timeout")
  const [failedLoading, setFailedLoading] = useState(false)
  const [failedError, setFailedError] = useState("")
  const [failedTransaction, setFailedTransaction] = useState<any | null>(null)

  // Fetch platforms for filtering
  useEffect(() => {
    const fetchPlatforms = async () => {
      setPlatformsLoading(true)
      try {
        const endpoint = `${baseUrl}/api/payments/betting/admin/platforms/?is_active=true&page_size=100`
        const data = await apiFetch(endpoint)
        setPlatforms(data.results || [])
      } catch (err) {
        console.warn("Could not fetch platforms:", err)
      } finally {
        setPlatformsLoading(false)
      }
    }
    fetchPlatforms()
  }, [])

  // Fetch transactions from API
  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true)
      setError("")
      try {
        const currentSearch = searchParams.get("search") || ""
        const currentStatus = searchParams.get("status") || "all"
        const currentType = searchParams.get("type") || "all"
        const currentPlatform = searchParams.get("platform") || "all"
        const currentCommission = searchParams.get("commission_paid") || "all"
        const currentStart = searchParams.get("start_date") || ""
        const currentEnd = searchParams.get("end_date") || ""
        const currentPageVal = Number(searchParams.get("page")) || 1
        const currentSort = searchParams.get("sort") || ""
        const currentDirection = searchParams.get("direction") || "desc"

        const params = new URLSearchParams({
          page: currentPageVal.toString(),
          page_size: itemsPerPage.toString(),
        })

        if (currentSearch.trim() !== "") {
          params.append("search", currentSearch)
        }

        if (currentStatus !== "all") {
          params.append("status", currentStatus)
        }

        if (currentType !== "all") {
          params.append("transaction_type", currentType)
        }

        if (currentPlatform !== "all") {
          params.append("platform", currentPlatform)
        }

        if (currentCommission !== "all") {
          params.append("commission_paid", currentCommission === "paid" ? "true" : "false")
        }

        if (currentStart) {
          params.append("created_at__gte", `${currentStart}T00:00:00Z`)
        }
        if (currentEnd) {
          params.append("created_at__lt", `${currentEnd}T23:59:59Z`)
        }

        let ordering = ""
        if (currentSort === "amount") {
          ordering = `${currentDirection === "asc" ? "" : "-"}amount`
        } else if (currentSort === "partner_name") {
          ordering = `${currentDirection === "asc" ? "" : "-"}partner_name`
        } else if (currentSort === "created_at") {
          ordering = `${currentDirection === "asc" ? "" : "-"}created_at`
        } else {
          ordering = "-created_at"
        }
        
        params.append("ordering", ordering)

        const endpoint = `${baseUrl}/api/payments/betting/admin/transactions/?${params.toString()}`
        const data = await apiFetch(endpoint)
        
        setTransactions(data.results || [])
        setTotalCount(data.count || 0)
        setTotalPages(Math.ceil((data.count || 0) / itemsPerPage))
      } catch (err: any) {
        const errorMessage = extractErrorMessages(err)
        setError(errorMessage)
        setTransactions([])
        setTotalCount(0)
        setTotalPages(1)
        toast({
          title: t("bettingTransactions.failedToLoadTransactions"),
          description: errorMessage,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    // Sync state from URL
    setSearchTerm(searchParams.get("search") || "")
    setStatusFilter(searchParams.get("status") || "all")
    setTransactionTypeFilter(searchParams.get("type") || "all")
    setPlatformFilter(searchParams.get("platform") || "all")
    setCommissionPaidFilter(searchParams.get("commission_paid") || "all")
    setStartDate(searchParams.get("start_date") || "")
    setEndDate(searchParams.get("end_date") || "")
    setCurrentPage(Number(searchParams.get("page")) || 1)
    setSortField((searchParams.get("sort") as any) || null)
    setSortDirection((searchParams.get("direction") as "asc" | "desc") || "desc")

    fetchTransactions()
  }, [searchParams, itemsPerPage, baseUrl, t, toast, apiFetch])

  // Fetch statistics
  useEffect(() => {
    const fetchStats = async () => {
      setStatsLoading(true)
      try {
        const params = new URLSearchParams()
        if (startDate) params.append("date_from", startDate)
        if (endDate) params.append("date_to", endDate)
        
        const queryString = params.size > 0 ? `?${params.toString()}` : ""
        const endpoint = `${baseUrl}/api/payments/betting/admin/transactions/stats/${queryString}`
        const data = await apiFetch(endpoint)
        setStats(data)
      } catch (err) {
        console.warn("Could not fetch statistics:", err)
      } finally {
        setStatsLoading(false)
      }
    }
    fetchStats()
  }, [startDate, endDate])

  const handleSort = (field: "created_at" | "amount" | "partner_name") => {
    const isAsc = sortField === field && sortDirection === "asc"
    updateUrl({
      sort: field,
      direction: isAsc ? "desc" : "asc",
      page: "1"
    })
  }

  const handleOpenDetail = async (transaction: any) => {
    setDetailModalOpen(true)
    setSelectedTransaction(transaction)
    
    try {
      const endpoint = `${baseUrl}/api/payments/betting/admin/transactions/${transaction.uid}/`
      const detailedTransaction = await apiFetch(endpoint)
      setSelectedTransaction(detailedTransaction)
    } catch (err) {
      toast({
        title: t("common.warning") || "Warning",
        description: t("bettingTransactions.couldNotLoadTransactionDetails"),
        variant: "destructive",
      })
    }
  }

  const handleProcessCancellation = async (success: boolean) => {
    if (!selectedTransaction) return
    
    setProcessingCancellation(true)
    try {
      const payload = {
        success: success,
        admin_notes: cancellationNotes || (success ? "Cancellation approved by admin" : "Cancellation rejected by admin")
      }
      
      await apiFetch(`${baseUrl}/api/payments/betting/admin/transactions/${selectedTransaction.uid}/process_cancellation/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      
      toast({
        title: t("bettingTransactions.cancellationProcessed"),
        description: success ? t("bettingTransactions.cancellationProcessedSuccessfully") : t("bettingTransactions.cancellationRejectedSuccessfully"),
      })

      setCancellationModalOpen(false)
      setCancellationNotes("")
      window.location.reload()
    } catch (err: any) {
      const errorMessage = extractErrorMessages(err)
      toast({
        title: t("bettingTransactions.cancellationFailed"),
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setProcessingCancellation(false)
    }
  }

  // Action Handlers
  const openSuccessModal = (tx: any) => {
    setSuccessTransaction(tx)
    setSuccessReason("")
    setSuccessError("")
    setSuccessModalOpen(true)
  }

  const handleSuccessSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!successTransaction) return

    setSuccessLoading(true)
    setSuccessError("")
    try {
      const endpoint = `${baseUrl}/api/payments/betting/admin/transactions/${successTransaction.uid}/mark-as-success/`
      await apiFetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: (successReason.trim() || "Aucune raison fournie") }),
      })
      setSuccessModalOpen(false)
      setSuccessTransaction(null)
      setSuccessReason("")
      window.location.reload()
    } catch (err: any) {
      const errMsg = extractErrorMessages(err)
      setSuccessError(errMsg)
      toast({ title: t("common.error") || "Error", description: errMsg, variant: "destructive" })
    } finally {
      setSuccessLoading(false)
    }
  }

  const openRefundModal = (tx: any) => {
    setRefundTransaction(tx)
    setRefundReason("")
    setRefundError("")
    setRefundModalOpen(true)
  }

  const handleRefundSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!refundTransaction) return

    setProcessingCancellation(true)
    setRefundError("")
    try {
      const payload = {
        reason: (refundReason || "Autre raison").trim(),
        admin_notes: (refundReason || "Aucune note fournie").trim(),
      }

      const endpoint = `${baseUrl}/api/payments/betting/admin/transactions/${refundTransaction.uid}/refund-partner/`
      await apiFetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      setRefundModalOpen(false)
      setRefundReason("")
      window.location.reload()
    } catch (err: any) {
      const errMsg = extractErrorMessages(err)
      setRefundError(errMsg)
      toast({ title: t("common.error") || "Error", description: errMsg, variant: "destructive" })
    } finally {
      setProcessingCancellation(false)
    }
  }

  const openFailedModal = (tx: any) => {
    setFailedTransaction(tx)
    setFailedReason("Tentative de relance après timeout")
    setFailedError("")
    setFailedModalOpen(true)
  }

  const handleFailedSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!failedTransaction) return

    setFailedLoading(true)
    setFailedError("")
    try {
      const endpoint = `${baseUrl}/api/payments/betting/admin/transactions/${failedTransaction.uid}/mark-as-failed/`
      await apiFetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: (failedReason.trim() || "Aucune raison fournie") }),
      })
      setFailedModalOpen(false)
      setFailedTransaction(null)
      setFailedReason("Tentative de relance après timeout")
      window.location.reload()
    } catch (err: any) {
      const errMsg = extractErrorMessages(err)
      setFailedError(errMsg)
      toast({ title: t("common.error") || "Error", description: errMsg, variant: "destructive" })
    } finally {
      setFailedLoading(false)
    }
  }

  const startIndex = (currentPage - 1) * itemsPerPage

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "destructive" | "outline" | "secondary"> = {
      success: "default",
      failed: "destructive",
      pending: "outline",
      cancelled: "secondary",
      cancellation_requested: "secondary"
    }
    return <Badge variant={variants[status] || "outline"}>{status.replace(/_/g, " ").toUpperCase()}</Badge>
  }

  const getTypeBadge = (type: string) => {
    const variants: Record<string, "default" | "destructive" | "outline"> = {
      deposit: "default",
      withdraw: "destructive",
      withdrawal: "destructive"
    }
    return <Badge variant={variants[type] || "outline"}>{type.toUpperCase()}</Badge>
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            {t("bettingTransactions.title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {statsLoading ? (
            <div className="text-center py-4">{t("common.loading")}</div>
          ) : stats ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-sm font-medium text-blue-600 mb-1">{t("bettingTransactions.totalTransactions")}</div>
                <div className="text-2xl font-bold text-blue-600">{stats.total_transactions}</div>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-sm font-medium text-green-600 mb-1">{t("bettingTransactions.successful")}</div>
                <div className="text-2xl font-bold text-green-600">{stats.successful_transactions}</div>
              </div>
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="text-sm font-medium text-red-600 mb-1">{t("bettingTransactions.failed")}</div>
                <div className="text-2xl font-bold text-red-600">{stats.failed_transactions}</div>
              </div>
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="text-sm font-medium text-orange-600 mb-1">{t("bettingTransactions.totalVolume")}</div>
                <div className="text-2xl font-bold text-orange-600">{stats.total_volume}</div>
              </div>
            </div>
          ) : null}

          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder={t("bettingTransactions.search")}
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    updateUrl({ search: e.target.value, page: "1" })
                  }}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <Select value={statusFilter} onValueChange={(val) => updateUrl({ status: val, page: "1" })}>
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder={t("bettingTransactions.filterByStatus")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("bettingTransactions.allStatus")}</SelectItem>
                  <SelectItem value="success">{t("bettingTransactions.successful")}</SelectItem>
                  <SelectItem value="failed">{t("bettingTransactions.failed")}</SelectItem>
                  <SelectItem value="pending">{t("bettingTransactions.pending") || "Pending"}</SelectItem>
                  <SelectItem value="cancelled">{t("bettingTransactions.cancelled")}</SelectItem>
                  <SelectItem value="cancellation_requested">{t("bettingTransactions.cancellationRequested")}</SelectItem>
                  <SelectItem value="processing">{t("bettingTransactions.processing") || "Processing"}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={transactionTypeFilter} onValueChange={(val) => updateUrl({ type: val, page: "1" })}>
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder={t("bettingTransactions.filterByType")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("bettingTransactions.allTypes")}</SelectItem>
                  <SelectItem value="deposit">{t("bettingTransactions.deposit")}</SelectItem>
                  <SelectItem value="withdraw">{t("bettingTransactions.withdraw")}</SelectItem>
                </SelectContent>
              </Select>

              <Select value={platformFilter} onValueChange={(val) => updateUrl({ platform: val, page: "1" })}>
                <SelectTrigger className="w-full lg:w-48">
                  <SelectValue placeholder={t("bettingTransactions.filterByPlatform")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("bettingTransactions.allPlatforms")}</SelectItem>
                  {platforms.map((platform) => (
                    <SelectItem key={platform.uid} value={platform.uid}>
                      {platform.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">{t("common.startDate")}</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => updateUrl({ start_date: e.target.value, page: "1" })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">{t("common.endDate")}</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => updateUrl({ end_date: e.target.value, page: "1" })}
              />
            </div>
          </div>

          <div className="rounded-md border">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">{t("common.loading")}</div>
            ) : error ? (
              <ErrorDisplay
                error={error}
                onRetry={() => {
                  setCurrentPage(1)
                  setError("")
                }}
                variant="full"
                showDismiss={false}
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("bettingTransactions.uid")}</TableHead>
                    <TableHead>{t("bettingTransactions.reference")}</TableHead>
                    <TableHead>
                      <Button variant="ghost" onClick={() => handleSort("partner_name")} className="h-auto p-0 font-semibold">
                        {t("bettingTransactions.partner")}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>{t("bettingTransactions.platform")}</TableHead>
                    <TableHead>{t("bettingTransactions.type")}</TableHead>
                    <TableHead>
                      <Button variant="ghost" onClick={() => handleSort("amount")} className="h-auto p-0 font-semibold">
                        {t("bettingTransactions.amount")}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>{t("bettingTransactions.status")}</TableHead>
                    <TableHead>{t("bettingTransactions.bettingUserId")}</TableHead>
                    <TableHead>
                      <Button variant="ghost" onClick={() => handleSort("created_at")} className="h-auto p-0 font-semibold">
                        {t("bettingTransactions.createdAt")}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>{t("bettingTransactions.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.uid}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                           <code className="px-1 py-0.5 bg-muted rounded text-xs">
                            {transaction.uid.slice(0, 8)}...
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            onClick={() => {
                              navigator.clipboard.writeText(transaction.uid)
                              toast({ title: t("common.uidCopied") })
                            }}
                          >
                            <CopyIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell><code className="text-xs">{transaction.reference}</code></TableCell>
                      <TableCell className="font-medium">{transaction.partner_name}</TableCell>
                      <TableCell>{transaction.platform_name}</TableCell>
                      <TableCell>{getTypeBadge(transaction.transaction_type)}</TableCell>
                      <TableCell className="font-medium">{transaction.amount} XOF</TableCell>
                      <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                      <TableCell><code className="text-xs">{transaction.betting_user_id || "-"}</code></TableCell>
                      <TableCell>{formatApiDateTime(transaction.created_at)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {transaction.status === "cancellation_requested" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-orange-600 border-orange-200 hover:bg-orange-50 h-8 gap-1 px-2"
                              onClick={() => {
                                setSelectedTransaction(transaction)
                                setCancellationModalOpen(true)
                              }}
                            >
                              <AlertTriangle className="h-3.5 w-3.5" />
                              <span className="text-xs">{t("bettingTransactions.process") || "Process"}</span>
                            </Button>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleOpenDetail(transaction)}>
                                {t("bettingTransactions.viewDetails")}
                              </DropdownMenuItem>

                              <DropdownMenuItem onClick={() => openSuccessModal(transaction)}>
                                <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                <span>Marquer comme Succès</span>
                              </DropdownMenuItem>

                              <DropdownMenuItem onClick={() => openFailedModal(transaction)}>
                                <XCircle className="h-4 w-4 mr-2 text-red-600" />
                                <span>Marquer comme Échec</span>
                              </DropdownMenuItem>

                              <DropdownMenuItem onClick={() => openRefundModal(transaction)}>
                                <RefreshCw className="h-4 w-4 mr-2 text-orange-600" />
                                <span>Rembourser</span>
                              </DropdownMenuItem>
                              {transaction.status === "cancellation_requested" && (
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedTransaction(transaction)
                                    setCancellationModalOpen(true)
                                  }}
                                  className="text-orange-600"
                                >
                                  {t("bettingTransactions.processCancellation")}
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-muted-foreground">
              {t("bettingTransactions.showing")}: {startIndex + 1}-{Math.min(startIndex + itemsPerPage, totalCount)} {t("bettingTransactions.of")} {totalCount}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateUrl({ page: Math.max(currentPage - 1, 1).toString() })}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                {t("bettingTransactions.previous")}
              </Button>
              <div className="text-sm mx-2">
                {t("bettingTransactions.page")} {currentPage} {t("bettingTransactions.of")} {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateUrl({ page: Math.min(currentPage + 1, totalPages).toString() })}
                disabled={currentPage === totalPages}
              >
                {t("bettingTransactions.next")}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("bettingTransactions.transactionDetailsTitle")}</DialogTitle>
          </DialogHeader>
          {selectedTransaction ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <strong>UID:</strong> {selectedTransaction.uid}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      onClick={() => {
                        navigator.clipboard.writeText(selectedTransaction.uid)
                        toast({ title: t("common.uidCopied") })
                      }}
                    >
                      <CopyIcon className="h-4 w-4" />
                    </Button>
                  </div>
                  <div><strong>{t("bettingTransactions.reference")}:</strong> {selectedTransaction.reference}</div>
                  <div><strong>{t("bettingTransactions.transactionType")}:</strong> {selectedTransaction.transaction_type?.toUpperCase()}</div>
                  <div><strong>{t("bettingTransactions.amount")}:</strong> {selectedTransaction.amount} XOF</div>
                  <div><strong>{t("bettingTransactions.status")}:</strong> {getStatusBadge(selectedTransaction.status)}</div>
                </div>
                <div className="space-y-2">
                  <div><strong>{t("bettingTransactions.partnerName")}:</strong> {selectedTransaction.partner_name}</div>
                  <div><strong>{t("bettingTransactions.platformName")}:</strong> {selectedTransaction.platform_name}</div>
                  <div><strong>{t("bettingTransactions.bettingUserId")}:</strong> {selectedTransaction.betting_user_id || "N/A"}</div>
                  <div><strong>{t("bettingTransactions.externalTransactionId")}:</strong> {selectedTransaction.external_transaction_id || "N/A"}</div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">{t("bettingTransactions.commissionInformation")}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><strong>{t("bettingTransactions.commissionRate")}:</strong> {selectedTransaction.commission_rate}%</div>
                  <div><strong>{t("bettingTransactions.commissionAmountDetail")}:</strong> {selectedTransaction.commission_amount} XOF</div>
                  <div><strong>{t("bettingTransactions.commissionPaid")}:</strong> {selectedTransaction.commission_paid ? t("common.yes") : t("common.no")}</div>
                  <div><strong>{t("bettingTransactions.paidAt")}:</strong> {selectedTransaction.commission_paid_at ? formatApiDateTime(selectedTransaction.commission_paid_at) : t("bettingTransactions.notPaid")}</div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">{t("bettingTransactions.partnerBalanceImpact")}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><strong>{t("bettingTransactions.balanceBeforeDetail")}:</strong> {selectedTransaction.partner_balance_before} XOF</div>
                  <div><strong>{t("bettingTransactions.balanceAfterDetail")}:</strong> {selectedTransaction.partner_balance_after} XOF</div>
                </div>
              </div>

              {selectedTransaction.external_response && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">{t("bettingTransactions.externalPlatformResponse")}</h4>
                  <div className="bg-muted p-3 rounded">
                    <pre className="text-xs overflow-auto">
                      {JSON.stringify(selectedTransaction.external_response, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          ) : null}
          <div className="flex justify-end mt-4">
             <Button onClick={() => setDetailModalOpen(false)}>{t("common.close")}</Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={cancellationModalOpen} onOpenChange={setCancellationModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("bettingTransactions.processTransactionCancellation")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("bettingTransactions.cancellationApprovalDescription")?.replace("{reference}", selectedTransaction?.reference || "")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">{t("bettingTransactions.adminNotesOptional")}</label>
              <textarea
                value={cancellationNotes}
                onChange={(e) => setCancellationNotes(e.target.value)}
                placeholder={t("bettingTransactions.cancellationNotesPlaceholder")}
                className="w-full p-2 border rounded mt-1"
                rows={3}
              />
            </div>
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={() => handleProcessCancellation(false)}
              disabled={processingCancellation}
            >
              {processingCancellation ? t("bettingTransactions.processing") : t("bettingTransactions.rejectCancellation")}
            </Button>
            <Button
              onClick={() => handleProcessCancellation(true)}
              disabled={processingCancellation}
              className="bg-green-600 hover:bg-green-700"
            >
              {processingCancellation ? t("bettingTransactions.processing") : t("bettingTransactions.approveCancellation")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Success Modal */}
      <Dialog open={successModalOpen} onOpenChange={setSuccessModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Marquer comme Succès</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSuccessSubmit} className="space-y-4">
            {successError && <ErrorDisplay error={successError} />}
            <div className="space-y-2">
              <label className="text-sm font-medium">Raison</label>
              <Input
                value={successReason}
                onChange={(e) => setSuccessReason(e.target.value)}
                placeholder="Ex: Confirmation manuelle..."
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setSuccessModalOpen(false)}>Annuler</Button>
              <Button type="submit" disabled={successLoading} className="bg-green-600 hover:bg-green-700 text-white">
                {successLoading ? "Traitement..." : "Confirmer"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Failed Modal */}
      <Dialog open={failedModalOpen} onOpenChange={setFailedModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Marquer comme Échec</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFailedSubmit} className="space-y-4">
            {failedError && <ErrorDisplay error={failedError} />}
            <div className="space-y-2">
              <label className="text-sm font-medium">Raison de l'échec</label>
              <Input
                value={failedReason}
                onChange={(e) => setFailedReason(e.target.value)}
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setFailedModalOpen(false)}>Annuler</Button>
              <Button type="submit" variant="destructive" disabled={failedLoading}>
                {failedLoading ? "Traitement..." : "Confirmer"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Refund Modal */}
      <Dialog open={refundModalOpen} onOpenChange={setRefundModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rembourser la transaction</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleRefundSubmit} className="space-y-4">
            {refundError && <ErrorDisplay error={refundError} />}
            <div className="space-y-2">
              <label className="text-sm font-medium">Raison du remboursement</label>
              <Input
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="Raison..."
                required
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setRefundModalOpen(false)}>Annuler</Button>
              <Button type="submit" disabled={processingCancellation} className="bg-orange-600 hover:bg-orange-700 text-white">
                {processingCancellation ? "Traitement..." : "Rembourser"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}



export default function BettingTransactionsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Chargement...</div>}>
      <BettingTransactionsPageContent />
    </Suspense>
  )
}

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useLanguage } from "@/components/providers/language-provider"
import { useApi } from "@/lib/useApi"
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, Eye, MoreHorizontal, Copy } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Label } from "@/components/ui/label"
import { ErrorDisplay, extractErrorMessages } from "@/components/ui/error-display"

import { formatApiDateTime } from "@/lib/utils";

export default function TransfersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [senderFilter, setSenderFilter] = useState("")
  const [receiverFilter, setReceiverFilter] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<"amount" | "date" | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [transfers, setTransfers] = useState<any[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [statistics, setStatistics] = useState<any>(null)
  const [statsLoading, setStatsLoading] = useState(false)
  const { t } = useLanguage()
  const itemsPerPage = 20
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""
  const apiFetch = useApi()
  const { toast } = useToast()
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedTransfer, setSelectedTransfer] = useState<any | null>(null)

  const fetchTransfers = async () => {
    setLoading(true)
    setError("")
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        page_size: itemsPerPage.toString(),
        ordering: "-created_at"
      })
      
      if (searchTerm.trim() !== "") params.append("search", searchTerm)
      if (statusFilter !== "all") params.append("status", statusFilter)
      if (senderFilter.trim() !== "") params.append("sender", senderFilter)
      if (receiverFilter.trim() !== "") params.append("receiver", receiverFilter)
      if (startDate) params.append("created_at__gte", `${startDate}T00:00:00Z`)
      if (endDate) params.append("created_at__lt", `${endDate}T23:59:59Z`)
      
      const endpoint = `${baseUrl}/api/payments/betting/admin/partner-transfers/?${params.toString()}`
      const data = await apiFetch(endpoint)
      setTransfers(data.results || [])
      setTotalCount(data.count || 0)
    } catch (err: any) {
      const errorMessage = extractErrorMessages(err)
      setError(errorMessage)
      setTransfers([])
      setTotalCount(0)
      toast({
        title: t("transfers.failedToLoad"),
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchStatistics = async () => {
    setStatsLoading(true)
    try {
      const params = new URLSearchParams()
      if (startDate) params.append("created_at__gte", `${startDate}T00:00:00Z`)
      if (endDate) params.append("created_at__lt", `${endDate}T23:59:59Z`)
      
      const queryString = params.size > 0 ? `?${params.toString()}` : ""
      const endpoint = `${baseUrl}/api/payments/betting/admin/partner-transfers/statistics/${queryString}`
      const data = await apiFetch(endpoint)
      setStatistics(data)
    } catch (err: any) {
      console.error('Statistics fetch error:', err)
    } finally {
      setStatsLoading(false)
    }
  }

  useEffect(() => {
    fetchTransfers()
  }, [currentPage, itemsPerPage, searchTerm, statusFilter, senderFilter, receiverFilter, startDate, endDate, sortField, sortDirection])

  useEffect(() => {
    fetchStatistics()
  }, [startDate, endDate])

  const totalPages = Math.ceil(totalCount / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage

  const handleSort = (field: "amount" | "date") => {
    setCurrentPage(1)
    setSortDirection((prevDir) => (sortField === field ? (prevDir === "desc" ? "asc" : "desc") : "desc"))
    setSortField(field)
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "destructive" | "outline" | "secondary"> = {
      completed: "default",
      failed: "destructive",
      pending: "outline",
      cancelled: "secondary",
    }
    return <Badge variant={variants[status] || "outline"}>{status.toUpperCase()}</Badge>
  }

  return (
    <div className="space-y-6">
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Transfers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.global_stats?.total_transfers || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{statistics.global_stats?.completed_transfers || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{parseFloat(statistics.global_stats?.total_amount || 0).toLocaleString()} XOF</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Average Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{parseFloat(statistics.global_stats?.average_amount || 0).toLocaleString()} XOF</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t("transfers.title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={t("common.search")}
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setCurrentPage(1); }}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 mb-6 text-sm">
            <div className="flex flex-col gap-1 w-full lg:w-48">
              <Label>{t("transfers.sender")}</Label>
              <Input
                placeholder="Sender UID"
                value={senderFilter}
                onChange={(e) => { setSenderFilter(e.target.value); setCurrentPage(1); }}
              />
            </div>
            <div className="flex flex-col gap-1 w-full lg:w-48">
              <Label>{t("transfers.receiver")}</Label>
              <Input
                placeholder="Receiver UID"
                value={receiverFilter}
                onChange={(e) => { setReceiverFilter(e.target.value); setCurrentPage(1); }}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label>{t("common.startDate")}</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label>{t("common.endDate")}</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
              />
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={() => { setStartDate(""); setEndDate(""); setCurrentPage(1); }}>
                {t("common.clearDates")}
              </Button>
            </div>
          </div>

          <div className="rounded-md border">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">{t("common.loading")}</div>
            ) : error ? (
               <ErrorDisplay error={error} onRetry={fetchTransfers} variant="full" showDismiss={false} />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("transfers.reference")}</TableHead>
                    <TableHead>{t("transfers.sender")}</TableHead>
                    <TableHead>{t("transfers.receiver")}</TableHead>
                    <TableHead>
                      <Button variant="ghost" onClick={() => handleSort("amount")} className="h-auto p-0 font-semibold">
                        {t("transfers.amount")}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>{t("transfers.fees")}</TableHead>
                    <TableHead>{t("transfers.createdAt")}</TableHead>
                    <TableHead>{t("transfers.status")}</TableHead>
                    <TableHead>{t("bettingTransactions.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transfers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground">No transfers found</TableCell>
                    </TableRow>
                  ) : (
                    transfers.map((transfer) => (
                      <TableRow key={transfer.uid}>
                        <TableCell><code className="text-xs">{transfer.reference}</code></TableCell>
                        <TableCell>
                          <div className="text-xs">
                             <div className="font-medium">{transfer.sender_name}</div>
                             <div className="text-muted-foreground truncate w-24">{transfer.sender_email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs">
                             <div className="font-medium">{transfer.receiver_name}</div>
                             <div className="text-muted-foreground truncate w-24">{transfer.receiver_email}</div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{parseFloat(transfer.amount).toLocaleString()} XOF</TableCell>
                        <TableCell>{parseFloat(transfer.fees).toLocaleString()} XOF</TableCell>
                        <TableCell>{formatApiDateTime(transfer.created_at)}</TableCell>
                        <TableCell>{getStatusBadge(transfer.status)}</TableCell>
                        <TableCell>
                           <Button variant="ghost" size="icon" onClick={() => { setSelectedTransfer(transfer); setDetailModalOpen(true); }}>
                             <Eye className="h-4 w-4" />
                           </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </div>

          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-muted-foreground">
               {t("common.showing")}: {startIndex + 1}-{Math.min(startIndex + itemsPerPage, totalCount)} {t("common.of")} {totalCount}
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                {t("common.previous")}
              </Button>
              <div className="text-sm">
                {t("common.page")} {currentPage} {t("common.of")} {totalPages}
              </div>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>
                {t("common.next")}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("transfers.details")}</DialogTitle>
          </DialogHeader>
          {selectedTransfer && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-3 text-sm flex items-center gap-2"><Eye className="h-4 w-4" /> {t("transfers.senderInfo")}</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>UID:</strong> {selectedTransfer.sender}</div>
                    <div><strong>{t("commissionPayments.name")}:</strong> {selectedTransfer.sender_name}</div>
                    <div><strong>{t("commissionPayments.email")}:</strong> {selectedTransfer.sender_email}</div>
                    <div><strong>{t("transfers.balanceBefore")}:</strong> {parseFloat(selectedTransfer.sender_balance_before).toLocaleString()} XOF</div>
                    <div><strong>{t("transfers.balanceAfter")}:</strong> {parseFloat(selectedTransfer.sender_balance_after).toLocaleString()} XOF</div>
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-3 text-sm flex items-center gap-2"><Eye className="h-4 w-4" /> {t("transfers.receiverInfo")}</h4>
                  <div className="space-y-2 text-sm">
                    <div><strong>UID:</strong> {selectedTransfer.receiver}</div>
                    <div><strong>{t("commissionPayments.name")}:</strong> {selectedTransfer.receiver_name}</div>
                    <div><strong>{t("commissionPayments.email")}:</strong> {selectedTransfer.receiver_email}</div>
                    <div><strong>{t("transfers.balanceBefore")}:</strong> {parseFloat(selectedTransfer.receiver_balance_before).toLocaleString()} XOF</div>
                    <div><strong>{t("transfers.balanceAfter")}:</strong> {parseFloat(selectedTransfer.receiver_balance_after).toLocaleString()} XOF</div>
                  </div>
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-3 text-sm">{t("transfers.transferInfo")}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                  <div><strong>UID:</strong> {selectedTransfer.uid}</div>
                  <div><strong>{t("transfers.reference")}:</strong> {selectedTransfer.reference}</div>
                  <div><strong>{t("transfers.amount")}:</strong> {parseFloat(selectedTransfer.amount).toLocaleString()} XOF</div>
                  <div><strong>{t("transfers.fees")}:</strong> {parseFloat(selectedTransfer.fees).toLocaleString()} XOF</div>
                  <div><strong>{t("transfers.status")}:</strong> {getStatusBadge(selectedTransfer.status)}</div>
                  <div><strong>{t("transfers.createdAt")}:</strong> {formatApiDateTime(selectedTransfer.created_at)}</div>
                  {selectedTransfer.completed_at && <div><strong>Completed At:</strong> {formatApiDateTime(selectedTransfer.completed_at)}</div>}
                  {selectedTransfer.description && <div className="col-span-2"><strong>Description:</strong> {selectedTransfer.description}</div>}
                  {selectedTransfer.failed_reason && <div className="col-span-2 text-red-600"><strong>Failed Reason:</strong> {selectedTransfer.failed_reason}</div>}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailModalOpen(false)}>{t("common.close")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


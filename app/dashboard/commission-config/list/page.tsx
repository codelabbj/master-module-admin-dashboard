"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { useLanguage } from "@/components/providers/language-provider"
import { Search, ChevronLeft, ChevronRight, ArrowUpDown, MoreHorizontal, Percent , Copy} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ErrorDisplay, extractErrorMessages } from "@/components/ui/error-display"
import { useApi } from "@/lib/useApi"
import Link from "next/link"

import { formatApiDateTime } from "@/lib/utils";

export default function CommissionConfigListPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [configs, setConfigs] = useState<any[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | false>(false)
  const [sortField, setSortField] = useState<"partner_name" | "updated_at" | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const { t } = useLanguage()
  const itemsPerPage = 20
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""
  const { toast } = useToast()
  const apiFetch = useApi()
  
  // Modal states
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedConfig, setSelectedConfig] = useState<any | null>(null)

  // Fetch commission configs from API
  useEffect(() => {
    const fetchConfigs = async () => {
      setLoading(true)
      setError(false)
      try {
        const params = new URLSearchParams({
          page: currentPage.toString(),
          page_size: itemsPerPage.toString(),
        })

        if (searchTerm.trim() !== "") {
          params.append("search", searchTerm)
        }

        let ordering = ""
        if (sortField === "partner_name") {
          ordering = `${sortDirection === "asc" ? "" : "-"}partner_name`
        } else if (sortField === "updated_at") {
          ordering = `${sortDirection === "asc" ? "" : "-"}updated_at`
        }
        
        if (ordering) {
          params.append("ordering", ordering)
        }

        const endpoint = `${baseUrl}/api/payments/betting/admin/commission-configs/?${params.toString()}`
        const data = await apiFetch(endpoint)
        
        setConfigs(data.results || [])
        setTotalCount(data.count || 0)
        setTotalPages(Math.ceil((data.count || 0) / itemsPerPage))
        
        toast({
          title: t("common.success") || "Success",
          description: t("commission.loaded"),
        })
      } catch (err: any) {
        const errorMessage = extractErrorMessages(err)
        setError(errorMessage)
        setConfigs([])
        setTotalCount(0)
        setTotalPages(1)
        toast({
          title: t("common.error") || "Error",
          description: errorMessage,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    fetchConfigs()
  }, [searchTerm, currentPage, sortField, sortDirection])

  const handleSort = (field: "partner_name" | "updated_at") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("desc")
    }
  }

  const handleOpenDetail = (config: any) => {
    setDetailModalOpen(true)
    setSelectedConfig(config)
  }

  const startIndex = (currentPage - 1) * itemsPerPage

  const getRateBadge = (rate: string, type: string) => {
    const rateNum = parseFloat(rate)
    let variant: "default" | "secondary" | "destructive" | "outline" = "outline"
    
    if (type === "deposit") {
      variant = rateNum >= 3 ? "destructive" : rateNum >= 2 ? "default" : "secondary"
    } else {
      variant = rateNum >= 4 ? "destructive" : rateNum >= 3 ? "default" : "secondary"
    }
    
    return <Badge variant={variant}>{rate}%</Badge>
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="h-5 w-5" />
            {t("commission.title")}
          </CardTitle>
          <Link href="/dashboard/commission-config/create">
            <Button className="mt-2">{t("commission.create")}</Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={t("commission.search")}
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-10"
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
                  setError(false)
                }}
                variant="full"
                showDismiss={false}
              />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("common.uid") || "UID"}</TableHead>
                      <TableHead>
                      <Button variant="ghost" onClick={() => handleSort("partner_name")} className="h-auto p-0 font-semibold">
                        {t("commission.partner")}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>{t("commission.depositRate")}</TableHead>
                    <TableHead>{t("commission.withdrawRate")}</TableHead>
                    <TableHead>
                      <Button variant="ghost" onClick={() => handleSort("updated_at")} className="h-auto p-0 font-semibold">
                        {t("commission.lastUpdated")}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                      </Button>
                    </TableHead>
                    <TableHead>{t("commission.updatedBy")}</TableHead>
                    <TableHead>{t("commission.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {configs.map((config) => (
                    <TableRow key={config.uid}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="px-1 py-0.5 bg-muted rounded text-xs">
                            {config.uid.slice(0, 8)}...
                          </code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            onClick={() => {
                              navigator.clipboard.writeText(config.uid)
                              toast({ title: t("common.uidCopied") || "UID copied!" })
                            }}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <div className="font-medium">{config.partner_name}</div>
                          <code className="text-xs text-muted-foreground">{config.partner.slice(0, 8)}...</code>
                        </div>
                      </TableCell>
                      <TableCell>{getRateBadge(config.deposit_commission_rate, "deposit")}</TableCell>
                      <TableCell>{getRateBadge(config.withdrawal_commission_rate, "withdrawal")}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {config.updated_at ? formatApiDateTime(config.updated_at) : "-"}
                        </div>
                      </TableCell>
                      <TableCell>{config.updated_by_name || "-"}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenDetail(config)}>
                              {t("commission.viewDetails")}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Link href={`/dashboard/commission-config/edit/${config.partner}`}>
                                {t("commission.edit")}
                              </Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-muted-foreground">
              {t("common.showing") || "Showing"}: {startIndex + 1}-{Math.min(startIndex + itemsPerPage, totalCount)} {t("common.of") || "of"} {totalCount}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                {t("common.previous") || "Previous"}
              </Button>
              <div className="text-sm">
                {t("common.page") || "Page"} {currentPage} {t("common.of") || "of"} {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                {t("common.next") || "Next"}
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("commission.details")}</DialogTitle>
          </DialogHeader>
          {selectedConfig ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <strong>{t("common.uid") || "UID"}:</strong> {selectedConfig.uid}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    onClick={() => {
                      navigator.clipboard.writeText(selectedConfig.uid)
                      toast({ title: t("common.uidCopied") || "UID copied!" })
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div><strong>{t("commission.partner")}:</strong> {selectedConfig.partner_name}</div>
                <div><strong>{t("permissions.partnerId") || "Partner ID"}:</strong> {selectedConfig.partner}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">{t("commission.depositRate")}</Label>
                  <div className="flex items-center gap-2">
                    {getRateBadge(selectedConfig.deposit_commission_rate, "deposit")}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">{t("commission.withdrawRate")}</Label>
                  <div className="flex items-center gap-2">
                    {getRateBadge(selectedConfig.withdrawal_commission_rate, "withdrawal")}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div><strong>{t("platforms.createdAtLabel") || "Created"}:</strong> {selectedConfig.created_at ? formatApiDateTime(selectedConfig.created_at) : t("platforms.unknown")}</div>
                <div><strong>{t("platforms.updatedAt") || "Updated"}:</strong> {selectedConfig.updated_at ? formatApiDateTime(selectedConfig.updated_at) : t("platforms.unknown")}</div>
                <div><strong>{t("commission.updatedBy")}:</strong> {selectedConfig.updated_by_name || t("platforms.unknown")}</div>
              </div>
            </div>
          ) : null}
          <div className="flex justify-end mt-4">
            <Button onClick={() => setDetailModalOpen(false)}>
              {t("common.close")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}


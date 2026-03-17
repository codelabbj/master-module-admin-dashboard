"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useLanguage } from "@/components/providers/language-provider"
import { Search, Users, PieChart, TrendingUp, DollarSign } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useApi } from "@/lib/useApi"
import { ErrorDisplay, extractErrorMessages } from "@/components/ui/error-display"
import Link from "next/link"

export default function PartnersPermissionsSummaryPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [partners, setPartners] = useState<any[]>([])
  const [totalPartners, setTotalPartners] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [selectedPartner, setSelectedPartner] = useState<any | null>(null)
  
  const { t } = useLanguage()
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""
  const { toast } = useToast()
  const apiFetch = useApi()
  
  const [detailModalOpen, setDetailModalOpen] = useState(false)

  useEffect(() => {
    const fetchPartnersSummary = async () => {
      setLoading(true)
      setError("")
      try {
        const endpoint = `${baseUrl}/api/payments/betting/admin/permissions/user_platforms_summary/`
        const data = await apiFetch(endpoint)
        
        let filteredPartners = data.partners || []
        
        if (searchTerm.trim() !== "") {
          filteredPartners = filteredPartners.filter((partner: any) =>
            (partner.display_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (partner.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (partner.first_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (partner.last_name || "").toLowerCase().includes(searchTerm.toLowerCase())
          )
        }
        
        setPartners(filteredPartners)
        setTotalPartners(data.total_partners || 0)
      } catch (err: any) {
        const errorMessage = extractErrorMessages(err)
        setError(errorMessage)
        setPartners([])
        setTotalPartners(0)
        toast({
          title: t("permissions.failedToLoadPartnersSummary"),
          description: errorMessage,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchPartnersSummary()
  }, [searchTerm])

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge variant={isActive ? "default" : "secondary"}>
        {isActive ? t("common.active") : t("common.inactive")}
      </Badge>
    )
  }

  const getPermissionBadge = (totalPermissions: number, activePermissions: number) => {
    const ratio = totalPermissions > 0 ? activePermissions / totalPermissions : 0
    if (ratio === 0) return <Badge variant="secondary">{t("permissions.noPermissions")}</Badge>
    if (ratio === 1) return <Badge variant="default">{t("permissions.allActive")}</Badge>
    return <Badge variant="outline">{t("permissions.partial")}</Badge>
  }

  const getCommissionBadge = (totalCommission: number, unpaidCommission: number) => {
    if (unpaidCommission === 0) return <Badge variant="default">{t("permissions.allPaid")}</Badge>
    if (unpaidCommission === totalCommission && totalCommission > 0) return <Badge variant="destructive">{t("permissions.allUnpaid")}</Badge>
    return <Badge variant="outline">{t("permissions.partialUnpaid")}</Badge>
  }

  const formatCurrency = (amount: number) => {
    return `${(amount || 0).toLocaleString()} XOF`
  }

  const calculateCommissionPercentage = (totalCommission: number, unpaidCommission: number) => {
    if (totalCommission === 0) return "0%"
    return `${((unpaidCommission / totalCommission) * 100).toFixed(1)}%`
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t("permissions.partnersSummary")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">{t("permissions.summaryStatistics")}</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">{t("permissions.totalPartners")}</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">{totalPartners}</div>
              </div>
              
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">{t("permissions.activePartners")}</span>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {partners.filter(p => p.is_active).length}
                </div>
              </div>
              
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <PieChart className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium">{t("permissions.partnerPermissions")}</span>
                </div>
                <div className="text-2xl font-bold text-orange-600">
                  {partners.reduce((sum, p) => sum + (p.permission_summary?.total_permissions || 0), 0)}
                </div>
              </div>
              
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium">{t("permissions.unpaidCommission")}</span>
                </div>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(partners.reduce((sum, p) => sum + (p.transaction_summary?.unpaid_commission || 0), 0))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={t("permissions.searchPartners")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="rounded-md border">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">{t("common.loading")}</div>
            ) : error ? (
              <ErrorDisplay error={error} onRetry={() => setSearchTerm("")} variant="full" showDismiss={false} />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("permissions.partner")}</TableHead>
                    <TableHead>{t("permissions.status")}</TableHead>
                    <TableHead>{t("permissions.permissionsLabel")}</TableHead>
                    <TableHead>{t("permissions.transactionStats")}</TableHead>
                    <TableHead>{t("permissions.commissionStatus")}</TableHead>
                    <TableHead>{t("common.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {partners.map((partner) => (
                    <TableRow key={partner.user_uid}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{partner.display_name}</div>
                          <div className="text-sm text-muted-foreground">{partner.email || t("permissions.noEmail")}</div>
                          <div className="text-xs text-muted-foreground">{t("common.uid")}: {partner.user_uid?.slice(0, 8)}...</div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(partner.is_active)}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div>{getPermissionBadge(partner.permission_summary?.total_permissions || 0, partner.permission_summary?.active_permissions || 0)}</div>
                          <div className="text-xs text-muted-foreground">
                            {partner.permission_summary?.total_permissions || 0} {t("permissions.total")}, {partner.permission_summary?.active_permissions || 0} {t("common.active")?.toLowerCase()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm font-medium">
                            {partner.transaction_summary?.total_transactions || 0} {t("permissions.transactions")}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {formatCurrency(partner.transaction_summary?.total_commission || 0)} total
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div>{getCommissionBadge(partner.transaction_summary?.total_commission || 0, partner.transaction_summary?.unpaid_commission || 0)}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatCurrency(partner.transaction_summary?.unpaid_commission || 0)} {t("permissions.unpaid")}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => { setSelectedPartner(partner); setDetailModalOpen(true); }}
                        >
                          {t("permissions.viewDetails")}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("permissions.partnerDetailedInformation")}</DialogTitle>
          </DialogHeader>
          {selectedPartner ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 text-sm">
                  <div><strong>{t("permissions.displayName")}:</strong> {selectedPartner.display_name}</div>
                  <div><strong>{t("commissionPayments.email")}:</strong> {selectedPartner.email || t("permissions.notProvided")}</div>
                </div>
                <div className="space-y-2 text-sm">
                  <div><strong>{t("common.uid")}:</strong> <code>{selectedPartner.user_uid}</code></div>
                  <div><strong>{t("permissions.status")}:</strong> {getStatusBadge(selectedPartner.is_active)}</div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">{t("permissions.permissionSummary")}</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                    <div className="text-xs font-medium text-blue-600">{t("permissions.totalPermissions")}</div>
                    <div className="text-lg font-bold text-blue-600">{selectedPartner.permission_summary?.total_permissions || 0}</div>
                  </div>
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                    <div className="text-xs font-medium text-green-600">{t("permissions.activePermissions")}</div>
                    <div className="text-lg font-bold text-green-600">{selectedPartner.permission_summary?.active_permissions || 0}</div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button asChild>
                  <Link href={`/dashboard/permissions/user-platforms/${selectedPartner.user_uid}`}>
                    {t("permissions.viewPlatformPermissions")}
                  </Link>
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  )
}


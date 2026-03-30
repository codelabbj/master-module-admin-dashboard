"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/components/providers/language-provider"
import { DollarSign, TrendingUp, TrendingDown, Users, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { extractErrorMessages } from "@/components/ui/error-display"
import { useApi } from "@/lib/useApi"

// Shape from /api/payments/betting/admin/commissions/unpaid_by_partner/
interface UnpaidPartnerCommission {
  partner_id: string
  partner_name: string
  partner_email: string
  partner_phone: string | null
  total_unpaid_commission: number
  total_unpaid_transaction_count: number
  payable_commission: number
  payable_transaction_count: number
  current_month_commission: number
  current_month_transaction_count: number
}

// Shape from /api/auth/admin/users/partners/
interface Partner {
  uid: string
  email: string | null
  phone: string | null
  first_name: string
  last_name: string
  display_name: string
  is_active: boolean
  account_balance: number
  account_currency: string
}

export default function CommissionPaymentsPage() {
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [partners, setPartners] = useState<Partner[]>([])
  const [unpaidCommissions, setUnpaidCommissions] = useState<UnpaidPartnerCommission[]>([])
  const [totalPartners, setTotalPartners] = useState(0)
  const [globalStats, setGlobalStats] = useState<any | null>(null)
  const [selectedPartner, setSelectedPartner] = useState("")
  const [paymentNotes, setPaymentNotes] = useState("")
  const [paying, setPaying] = useState(false)
  const [statsLoading, setStatsLoading] = useState(false)
  const { t } = useLanguage()
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""
  const { toast } = useToast()
  const apiFetch = useApi()

  // Fetch unpaid commissions by partner
  const fetchUnpaidCommissions = async () => {
    try {
      const endpoint = `${baseUrl}/api/payments/betting/admin/commissions/unpaid_by_partner/`
      const data = await apiFetch(endpoint)
      // Response shape: { partners: [...], total_partners: N, note: "..." }
      const list: UnpaidPartnerCommission[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.partners)
        ? data.partners
        : []
      setUnpaidCommissions(list)
      if (data?.total_partners !== undefined) setTotalPartners(data.total_partners)
    } catch (err: any) {
      console.error("Failed to load unpaid commissions:", err)
      setUnpaidCommissions([])
    }
  }

  useEffect(() => {
    fetchUnpaidCommissions()
  }, [])

  // Fetch global statistics
  useEffect(() => {
    const fetchGlobalStats = async () => {
      setStatsLoading(true)
      try {
        const params = new URLSearchParams()
        if (startDate) params.append("date_from", startDate)
        if (endDate) params.append("date_to", endDate)
        const queryString = params.size > 0 ? `?${params.toString()}` : ""
        const endpoint = `${baseUrl}/api/payments/betting/admin/commissions/global_stats/${queryString}`
        const data = await apiFetch(endpoint)
        setGlobalStats(data)
      } catch (err: any) {
        console.error("Failed to load global stats:", err)
      } finally {
        setStatsLoading(false)
      }
    }
    fetchGlobalStats()
  }, [startDate, endDate])

  // Fetch partners list for the payment dropdown
  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const params = new URLSearchParams({ page_size: "100", is_active: "true" })
        const endpoint = `${baseUrl}/api/auth/admin/users/partners/?${params.toString()}`
        const data = await apiFetch(endpoint)
        // Response shape: { partners: [...], pagination: {...}, ... }
        setPartners(Array.isArray(data?.partners) ? data.partners : [])
      } catch (err) {
        console.warn("Could not fetch partners:", err)
      }
    }
    fetchPartners()
  }, [])

  const handlePayCommission = async () => {
    if (!selectedPartner) {
      toast({
        title: t("commissionPayments.validationError"),
        description: t("commissionPayments.pleaseSelectPartner"),
        variant: "destructive",
      })
      return
    }

    setPaying(true)
    try {
      await apiFetch(`${baseUrl}/api/payments/betting/admin/commissions/pay_commissions/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          partner_uid: selectedPartner,
          transaction_ids: null,
          admin_notes: paymentNotes || "Commission payment",
        }),
      })

      toast({
        title: t("commissionPayments.paymentSuccessful"),
        description: t("commissionPayments.paymentCompletedSuccessfully"),
      })

      await fetchUnpaidCommissions()
      setSelectedPartner("")
      setPaymentNotes("")
    } catch (err: any) {
      toast({
        title: t("commissionPayments.paymentFailed"),
        description: extractErrorMessages(err),
        variant: "destructive",
      })
    } finally {
      setPaying(false)
    }
  }

  const selectedPartnerData = partners.find((p) => p.uid === selectedPartner)
  // Match by partner_id (from unpaid commissions) to the selected partner uid
  const selectedPartnerUnpaid = unpaidCommissions.find((u) => u.partner_id === selectedPartner)

  // Totals derived from unpaid list
  const totalPayableCommission = unpaidCommissions.reduce((s, u) => s + u.payable_commission, 0)
  const totalCurrentMonth = unpaidCommissions.reduce((s, u) => s + u.current_month_commission, 0)
  const totalUnpaid = unpaidCommissions.reduce((s, u) => s + u.total_unpaid_commission, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          {t("commissionPayments.paymentTitle")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* ── Summary cards ─────────────────────────────────────── */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">{t("commissionPayments.commissionStatistics")}</h3>

          {statsLoading ? (
            <div className="text-center py-4">{t("common.loading") || "Loading..."}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Partners with unpaid commissions (from unpaid endpoint) */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">
                    {t("commissionPayments.partnersWithUnpaid") || "Partners w/ Unpaid"}
                  </span>
                </div>
                <div className="text-2xl font-bold text-blue-600">{totalPartners}</div>
              </div>

              {/* Total unpaid (all time) */}
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium">
                    {t("commissionPayments.unpaidCommissionLabel")}
                  </span>
                </div>
                <div className="text-2xl font-bold text-red-600">
                  {totalUnpaid.toLocaleString()} XOF
                </div>
              </div>

              {/* Payable now (excludes current month) */}
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">
                    {t("commissionPayments.payableNow") || "Payable Now"}
                  </span>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {totalPayableCommission.toLocaleString()} XOF
                </div>
              </div>

              {/* Current month (not yet payable) */}
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium">
                    {t("commissionPayments.currentMonthCommission") || "Current Month"}
                  </span>
                </div>
                <div className="text-2xl font-bold text-orange-600">
                  {totalCurrentMonth.toLocaleString()} XOF
                </div>
              </div>
            </div>
          )}

          {/* Global stats (if endpoint exists) */}
          {globalStats && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              {globalStats.total_transactions !== undefined && (
                <div className="p-3 bg-muted rounded-lg text-sm">
                  <span className="font-medium">{t("commissionPayments.totalTransactions")}: </span>
                  {globalStats.total_transactions}
                </div>
              )}
              {globalStats.total_commission !== undefined && (
                <div className="p-3 bg-muted rounded-lg text-sm">
                  <span className="font-medium">{t("commissionPayments.totalCommission")}: </span>
                  {Number(globalStats.total_commission).toLocaleString()} XOF
                </div>
              )}
              {globalStats.paid_commission !== undefined && (
                <div className="p-3 bg-muted rounded-lg text-sm">
                  <span className="font-medium">{t("commissionPayments.paidCommissionLabel")}: </span>
                  {Number(globalStats.paid_commission).toLocaleString()} XOF
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Date filter ────────────────────────────────────────── */}
        <div className="mb-6 p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-3">{t("commissionPayments.filterStatisticsByDate")}</h4>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex flex-col gap-2">
              <Label>{t("common.startDate")}</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full sm:w-48"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>{t("common.endDate")}</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full sm:w-48"
              />
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => { setStartDate(""); setEndDate("") }}
                className="h-10"
              >
                {t("common.clearDates")}
              </Button>
            </div>
          </div>
        </div>

        {/* ── Pay commission form ────────────────────────────────── */}
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 className="font-medium mb-3 text-blue-900 dark:text-blue-100">
            {t("commissionPayments.payCommissionToPartner")}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <Label>{t("commissionPayments.selectPartner")}</Label>
              <Select value={selectedPartner} onValueChange={setSelectedPartner}>
                <SelectTrigger>
                  <SelectValue placeholder={t("commissionPayments.choosePartnerToPay")} />
                </SelectTrigger>
                <SelectContent>
                  {partners.map((partner) => (
                    <SelectItem key={partner.uid} value={partner.uid}>
                      <div className="flex flex-col text-left">
                        <span>{partner.display_name || `${partner.first_name || ""} ${partner.last_name || ""}`}</span>
                        <span className="text-xs text-muted-foreground">{partner.email || partner.phone}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{t("commissionPayments.paymentNotes")}</Label>
              <Input
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                placeholder={t("commissionPayments.paymentNotesPlaceholder")}
              />
            </div>
          </div>

          {/* Selected partner info */}
          {selectedPartnerData && (
            <div className="mb-4 p-3 bg-white dark:bg-gray-800 rounded border">
              <h5 className="font-medium mb-2">{t("commissionPayments.selectedPartnerInformation")}:</h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <div>
                  <strong>{t("commissionPayments.name")}:</strong>{" "}
                  {selectedPartnerData.display_name ||
                    `${selectedPartnerData.first_name || ""} ${selectedPartnerData.last_name || ""}`}
                </div>
                <div>
                  <strong>{t("commissionPayments.email")}:</strong>{" "}
                  {selectedPartnerData.email || selectedPartnerData.phone || "—"}
                </div>
                <div>
                  <strong>{t("commissionPayments.uid")}:</strong> {selectedPartnerData.uid}
                </div>
                {selectedPartnerUnpaid ? (
                  <>
                    <div>
                      <strong>{t("commissionPayments.unpaidAmount") || "Total Unpaid"}:</strong>{" "}
                      <span className="text-red-600 font-medium">
                        {selectedPartnerUnpaid.total_unpaid_commission.toLocaleString()} XOF
                      </span>
                    </div>
                    <div>
                      <strong>{"Payable Now"}:</strong>{" "}
                      <span className="text-green-600 font-medium">
                        {selectedPartnerUnpaid.payable_commission.toLocaleString()} XOF
                      </span>{" "}
                      <span className="text-xs text-muted-foreground">
                        ({selectedPartnerUnpaid.payable_transaction_count} txns)
                      </span>
                    </div>
                    {selectedPartnerUnpaid.current_month_commission > 0 && (
                      <div className="flex items-start gap-1 col-span-2">
                        <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5 shrink-0" />
                        <span className="text-xs text-orange-600 dark:text-orange-400">
                          {selectedPartnerUnpaid.current_month_commission.toLocaleString()} XOF (
                          {selectedPartnerUnpaid.current_month_transaction_count} txns) are from the
                          current month and will not be included in this payment.
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-muted-foreground text-xs col-span-2">
                    No unpaid commissions for this partner.
                  </div>
                )}
              </div>
            </div>
          )}

          <Button
            onClick={handlePayCommission}
            disabled={!selectedPartner || paying || (selectedPartnerUnpaid?.payable_commission ?? 0) === 0}
            className="flex items-center gap-2"
          >
            {paying ? t("commissionPayments.processingPayment") : t("commissionPayments.payCommission")}
          </Button>
          {selectedPartnerUnpaid && selectedPartnerUnpaid.payable_commission === 0 && (
            <p className="mt-2 text-xs text-muted-foreground">
              Nothing to pay right now — all unpaid commission is from the current month.
            </p>
          )}
        </div>

        {/* ── Unpaid commissions table ──────────────────────────── */}
        <div className="mb-6">
          <h4 className="font-medium mb-3">{t("commissionPayments.unpaidCommissionsByPartner")}</h4>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("commissionPayments.partner")}</TableHead>
                  <TableHead>{t("commissionPayments.partnerUid")}</TableHead>
                  <TableHead>Total Unpaid</TableHead>
                  <TableHead>Payable Now</TableHead>
                  <TableHead>Current Month</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unpaidCommissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      {t("commissionPayments.noUnpaidCommissionsFound")}
                    </TableCell>
                  </TableRow>
                ) : (
                  unpaidCommissions.map((item) => (
                    <TableRow key={item.partner_id}>
                      <TableCell>
                        <div className="font-medium">{item.partner_name}</div>
                        <div className="text-xs text-muted-foreground">{item.partner_email || item.partner_phone || "—"}</div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs">{item.partner_id?.slice(0, 8)}...</code>
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.total_unpaid_commission === 0 ? "secondary" : "destructive"}>
                          {item.total_unpaid_commission.toLocaleString()} XOF
                        </Badge>
                        <div className="text-xs text-muted-foreground mt-1">
                          {item.total_unpaid_transaction_count} txns
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.payable_commission === 0 ? "secondary" : "default"}>
                          {item.payable_commission.toLocaleString()} XOF
                        </Badge>
                        <div className="text-xs text-muted-foreground mt-1">
                          {item.payable_transaction_count} txns
                        </div>
                      </TableCell>
                      <TableCell>
                        {item.current_month_commission > 0 ? (
                          <>
                            <span className="text-orange-600 font-medium">
                              {item.current_month_commission.toLocaleString()} XOF
                            </span>
                            <div className="text-xs text-muted-foreground mt-1">
                              {item.current_month_transaction_count} txns
                            </div>
                          </>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {unpaidCommissions.length > 0 && (
            <p className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Payable amounts exclude commissions from the current month.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

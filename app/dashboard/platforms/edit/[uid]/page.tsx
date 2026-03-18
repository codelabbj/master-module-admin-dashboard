"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useApi } from "@/lib/useApi"
import { useLanguage } from "@/components/providers/language-provider"
import { useToast } from "@/hooks/use-toast"
import { ErrorDisplay, extractErrorMessages } from "@/components/ui/error-display"
import { Image as ImageIcon } from "lucide-react"
import { getImageUrl } from "@/lib/utils"

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""

export default function PlatformEditPage() {
  const params = useParams()
  const router = useRouter()
  const apiFetch = useApi()
  const { t } = useLanguage()
  const { toast } = useToast()
  
  const uid = params.uid as string
  
  const [name, setName] = useState("")
  const [externalId, setExternalId] = useState("")
  const [minDepositAmount, setMinDepositAmount] = useState("")
  const [maxDepositAmount, setMaxDepositAmount] = useState("")
  const [minWithdrawalAmount, setMinWithdrawalAmount] = useState("")
  const [maxWithdrawalAmount, setMaxWithdrawalAmount] = useState("")
  const [description, setDescription] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState("")
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [existingLogo, setExistingLogo] = useState<string | null>(null)

  // Fetch platform details
  useEffect(() => {
    const fetchPlatform = async () => {
      if (!uid) return
      
      setFetching(true)
      setError("")
      
      try {
        const data = await apiFetch(`${baseUrl}/api/payments/betting/admin/platforms/${uid}/`)
        
        setName(data.name || "")
        setExternalId(data.external_id || "")
        setMinDepositAmount(data.min_deposit_amount?.toString() || "")
        setMaxDepositAmount(data.max_deposit_amount?.toString() || "")
        setMinWithdrawalAmount(data.min_withdrawal_amount?.toString() || "")
        setMaxWithdrawalAmount(data.max_withdrawal_amount?.toString() || "")
        setDescription(data.description || "")
        setIsActive(data.is_active ?? true)
        setExistingLogo(data.logo || null)
        // GET requests don't show success toasts automatically
      } catch (err: any) {
        const errorMessage = extractErrorMessages(err)
        setError(errorMessage)
        toast({
          title: t("platforms.failedToLoadPlatform"),
          description: errorMessage,
          variant: "destructive",
        })
      } finally {
        setFetching(false)
      }
    }
    
    fetchPlatform()
  }, [uid])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    
    try {
      const payload = {
        name: name.trim(),
        min_deposit_amount: parseFloat(minDepositAmount) || 0,
        max_deposit_amount: parseFloat(maxDepositAmount) || 0,
        min_withdrawal_amount: parseFloat(minWithdrawalAmount) || 0,
        max_withdrawal_amount: parseFloat(maxWithdrawalAmount) || 0,
        description: description.trim(),
        is_active: isActive,
      }

      let body
      const headers: Record<string, string> = {}
      
      if (logoFile) {
        const formData = new FormData()
        formData.append("name", name.trim())
        formData.append("min_deposit_amount", String(parseFloat(minDepositAmount) || 0))
        formData.append("max_deposit_amount", String(parseFloat(maxDepositAmount) || 0))
        formData.append("min_withdrawal_amount", String(parseFloat(minWithdrawalAmount) || 0))
        formData.append("max_withdrawal_amount", String(parseFloat(maxWithdrawalAmount) || 0))
        formData.append("description", description.trim())
        formData.append("is_active", String(isActive))
        formData.append("logo", logoFile)
        body = formData
      } else {
        body = JSON.stringify(payload)
        headers["Content-Type"] = "application/json"
      }

      await apiFetch(`${baseUrl}/api/payments/betting/admin/platforms/${uid}/`, {
        method: "PATCH",
        headers,
        body
      })
      // Success toast is automatically shown by useApi hook for non-GET requests
      
      router.push("/dashboard/platforms/list")
    } catch (err: any) {
      const errorMessage = extractErrorMessages(err)
      setError(errorMessage)
      toast({
        title: t("platforms.failedToUpdatePlatform"),
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-96">
        <span className="text-lg font-semibold">{t("platforms.loadingPlatform")}</span>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("platforms.editPlatform")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Platform UID (Read-only) */}
          <div className="space-y-2">
            <Label htmlFor="uid">{t("platforms.uid") || "UID"}</Label>
            <Input
              id="uid"
              value={uid}
              disabled
              className="bg-muted"
            />
          </div>

          {/* External ID (Read-only) */}
          <div className="space-y-2">
            <Label htmlFor="external_id">{t("platforms.externalId")}</Label>
            <Input
              id="external_id"
              value={externalId}
              disabled
              className="bg-muted"
            />
          </div>

          {/* Platform Name */}
          <div className="space-y-2">
            <Label htmlFor="name">{t("platforms.platformName")} *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("platforms.platformNamePlaceholder")}
              required
            />
          </div>

          {/* Deposit Limits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min_deposit">{t("platforms.minimumDepositAmount")}</Label>
              <Input
                id="min_deposit"
                type="number"
                step="0.01"
                min="0"
                value={minDepositAmount}
                onChange={(e) => setMinDepositAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_deposit">{t("platforms.maximumDepositAmount")}</Label>
              <Input
                id="max_deposit"
                type="number"
                step="0.01"
                min="0"
                value={maxDepositAmount}
                onChange={(e) => setMaxDepositAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Withdrawal Limits */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min_withdrawal">{t("platforms.minimumWithdrawalAmount")}</Label>
              <Input
                id="min_withdrawal"
                type="number"
                step="0.01"
                min="0"
                value={minWithdrawalAmount}
                onChange={(e) => setMinWithdrawalAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_withdrawal">{t("platforms.maximumWithdrawalAmount")}</Label>
              <Input
                id="max_withdrawal"
                type="number"
                step="0.01"
                min="0"
                value={maxWithdrawalAmount}
                onChange={(e) => setMaxWithdrawalAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">{t("platforms.description")}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("platforms.descriptionPlaceholder")}
              rows={3}
            />
          </div>

          {/* Platform Logo */}
          <div className="space-y-4">
            <Label htmlFor="logo" className="text-sm font-medium text-foreground">
              {t("platforms.logo") || "Platform Logo"}
            </Label>
            <div className="flex items-center gap-6">
              <div className="relative h-28 w-28 rounded-xl border-2 border-dashed border-muted-foreground/20 bg-muted/30 flex items-center justify-center overflow-hidden transition-all hover:border-primary/50">
                {(logoFile || existingLogo) ? (
                  <img 
                    src={logoFile ? URL.createObjectURL(logoFile) : getImageUrl(existingLogo) || ""} 
                    alt="Logo preview" 
                    className="h-full w-full object-contain p-2"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        const fallback = document.createElement('div');
                        fallback.className = "flex items-center justify-center w-full h-full bg-primary/10 text-primary font-bold text-xl";
                        fallback.innerText = name ? name[0].toUpperCase() : "P";
                        parent.appendChild(fallback);
                      }
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <ImageIcon className="h-8 w-8 opacity-20" />
                    <span className="text-[10px] font-medium uppercase tracking-wider">No Image</span>
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-3">
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                  className="minimal-input h-10 cursor-pointer"
                />
                <p className="text-xs text-muted-foreground">
                  PNG, JPG or SVG formats accepted. Selectionnera une nouvelle image remplacera l'actuelle.
                </p>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
            <Label htmlFor="is_active">{t("platforms.activePlatform")}</Label>
          </div>

          {error && (
            <ErrorDisplay
              error={error}
              variant="inline"
              showRetry={false}
              className="mb-4"
            />
          )}

          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? t("platforms.updating") : t("platforms.updatePlatform")}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push("/dashboard/platforms/list")}>
              {t("common.cancel")}
            </Button>
            <Button 
              type="button" 
              variant="destructive" 
              onClick={() => {
                if (confirm(t("platforms.deletePlatformConfirm"))) {
                  // Note: The API docs mention that deletion is not allowed for security reasons
                  toast({
                    title: t("platforms.deletionNotAllowed"),
                    description: t("platforms.deletionNotAllowedReason"),
                    variant: "destructive",
                  })
                }
              }}
            >
              {t("platforms.deletePlatform")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

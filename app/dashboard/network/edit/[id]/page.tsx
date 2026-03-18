"use client"
import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useApi } from "@/lib/useApi"
import { useLanguage } from "@/components/providers/language-provider"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ErrorDisplay, extractErrorMessages } from "@/components/ui/error-display"
import { ArrowLeft, Save, Loader2, Globe, Settings, Image as ImageIcon } from "lucide-react"
import { getImageUrl } from "@/lib/utils"

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""

// Theme colors are managed via CSS variables and Tailwind classes

export default function NetworkEditPage() {
  const router = useRouter()
  const params = useParams()
  const { id } = params
  const [nom, setNom] = useState("")
  const [code, setCode] = useState("")
  const [country, setCountry] = useState("")
  const [ussdBaseCode, setUssdBaseCode] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [sentDepositToModule, setSentDepositToModule] = useState(false)
  const [sentWithdrawalToModule, setSentWithdrawalToModule] = useState(false)
  const [countries, setCountries] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [existingLogo, setExistingLogo] = useState<string | null>(null)
  const apiFetch = useApi()
  const { t } = useLanguage()
  const { toast } = useToast();

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const data = await apiFetch(`${baseUrl}/api/payments/countries/`)
        setCountries(Array.isArray(data) ? data : data.results || [])
        toast({
          title: t("network.countriesLoaded"),
          description: t("network.countriesLoadedSuccessfully"),
        })
      } catch (err: any) {
        const errorMessage = extractErrorMessages(err) || t("network.failedToLoadCountries")
        setCountries([])
        toast({
          title: t("network.countriesFailedToLoad"),
          description: errorMessage,
          variant: "destructive",
        })
      }
    }
    
    fetchCountries()
  }, [])

  useEffect(() => {
    if (!id) return
    
    const fetchNetwork = async () => {
      setLoading(true)
      setError("")
      try {
        const data = await apiFetch(`${baseUrl}/api/payments/networks/${id}/`)
        setNom(data.nom || "")
        setCode(data.code || "")
        setCountry(data.country || "")
        setUssdBaseCode(data.ussd_base_code || "")
        setIsActive(data.is_active)
        setSentDepositToModule(!!data.sent_deposit_to_module)
        setSentWithdrawalToModule(!!data.sent_withdrawal_to_module)
        setExistingLogo(data.image || null)
        toast({
          title: t("network.loaded"),
          description: t("network.loadedSuccessfully"),
        })
      } catch (err: any) {
        const errorMessage = extractErrorMessages(err) || t("network.failedToLoad")
        setError(errorMessage)
        toast({
          title: t("network.failedToLoad"),
          description: errorMessage,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchNetwork()
  }, [id])

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setSaving(true)
    setError("")
    try {
      let body
      const headers: Record<string, string> = {}
      
      if (logoFile) {
        const formData = new FormData()
        formData.append("nom", nom)
        formData.append("code", code)
        formData.append("country", country)
        formData.append("ussd_base_code", ussdBaseCode)
        formData.append("is_active", String(isActive))
        formData.append("sent_deposit_to_module", String(sentDepositToModule))
        formData.append("sent_withdrawal_to_module", String(sentWithdrawalToModule))
        formData.append("image", logoFile)
        body = formData
      } else {
        body = JSON.stringify({ 
          nom, 
          code, 
          country, 
          ussd_base_code: ussdBaseCode, 
          is_active: isActive,
          sent_deposit_to_module: sentDepositToModule,
          sent_withdrawal_to_module: sentWithdrawalToModule
        })
        headers["Content-Type"] = "application/json"
      }

      await apiFetch(`${baseUrl}/api/payments/networks/${id}/`, {
        method: "PATCH",
        headers,
        body
      })
      toast({
        title: t("network.updated"),
        description: t("network.updatedSuccessfully"),
      })
      router.push("/dashboard/network/list")
    } catch (err: any) {
      const errorMessage = extractErrorMessages(err) || t("network.failedToUpdate")
      setError(errorMessage)
      toast({
        title: t("network.failedToUpdate"),
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="h-8 w-48 bg-neutral-200 dark:bg-neutral-800 rounded-lg animate-pulse" />
            <div className="h-4 w-64 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
          </div>
          <div className="h-6 w-32 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse" />
        </div>
        
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-4 w-24 bg-neutral-200 dark:bg-neutral-800 rounded mb-2" />
            <div className="h-8 w-16 bg-neutral-200 dark:bg-neutral-800 rounded mb-2" />
            <div className="h-3 w-32 bg-neutral-200 dark:bg-neutral-800 rounded" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            {t("network.edit") || "Edit Network"}
          </h1>
          <p className="text-muted-foreground">
            Mettre à jour la configuration du réseau
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-accent rounded-lg">
            <Settings className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">
              ID: {id}
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </div>
      </div>

      {error && (
        <ErrorDisplay error={error} />
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Informations de base
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nom">Nom du réseau</Label>
                <Input
                  id="nom"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                  placeholder="ex: MTN, Orange, Airtel"
                  required
                />
              </div>
              <div>
                <Label htmlFor="code">Code du réseau</Label>
                <Input
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="ex: MTN, ORG, AIR"
                  required
                />
              </div>
              <div>
                <Label htmlFor="country">Pays</Label>
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner le pays" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.id || country.uid} value={country.id || country.uid}>
                        {country.nom}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="ussdBaseCode">Code de base USSD</Label>
                <Input
                  id="ussdBaseCode"
                  value={ussdBaseCode}
                  onChange={(e) => setUssdBaseCode(e.target.value)}
                  placeholder="ex: *123#"
                />
              </div>
              <div className="md:col-span-2">
                <Label htmlFor="logo">Logo du réseau</Label>
                <div className="mt-2 flex items-center gap-4">
                  {(logoFile || existingLogo) ? (
                    <div className="relative h-24 w-24 border rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                      <img 
                        src={logoFile ? URL.createObjectURL(logoFile) : getImageUrl(existingLogo) || ""} 
                        alt="Preview" 
                        className="max-h-full max-w-full object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            const fallback = document.createElement('div');
                            fallback.className = "flex items-center justify-center w-full h-full bg-primary/10 text-primary font-bold text-xl";
                            fallback.innerText = nom ? nom[0].toUpperCase() : "N";
                            parent.appendChild(fallback);
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <div className="h-24 w-24 border border-dashed rounded-lg flex flex-col items-center justify-center bg-muted/50 text-muted-foreground">
                      <ImageIcon className="h-8 w-8 mb-1 opacity-20" />
                      <span className="text-[10px]">No Logo</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <Input
                      id="logo"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Sélectionnez une nouvelle image pour remplacer l'actuelle
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              Paramètres
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
                <Label htmlFor="isActive">Actif</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="sentDepositToModule"
                  checked={sentDepositToModule}
                  onCheckedChange={setSentDepositToModule}
                />
                <Label htmlFor="sentDepositToModule">Envoyer le dépôt au module</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="sentWithdrawalToModule"
                  checked={sentWithdrawalToModule}
                  onCheckedChange={setSentWithdrawalToModule}
                />
                <Label htmlFor="sentWithdrawalToModule">Envoyer le retrait au module</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.back()}
          >
            Annuler
          </Button>
          <Button 
            type="submit" 
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sauvegarde...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Sauvegarder les modifications
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
} 
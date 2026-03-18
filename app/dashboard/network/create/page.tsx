"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
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
import { ArrowLeft, Save, Loader2, Globe, Settings } from "lucide-react"

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""

export default function NetworkCreatePage() {
  const router = useRouter()
  const [nom, setNom] = useState("")
  const [code, setCode] = useState("")
  const [country, setCountry] = useState("")
  const [ussdBaseCode, setUssdBaseCode] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [sentDepositToModule, setSentDepositToModule] = useState(false)
  const [sentWithdrawalToModule, setSentWithdrawalToModule] = useState(false)
  const [countries, setCountries] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const apiFetch = useApi()
  const { t } = useLanguage()
  const { toast } = useToast();

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const data = await apiFetch(`${baseUrl}/api/payments/countries/`)
        setCountries(Array.isArray(data) ? data : data.results || [])
      } catch (err: any) {
        console.error('Failed to load countries:', err)
      }
    }
    
    fetchCountries()
  }, [])

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)
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
        // Note: Do NOT set "Content-Type" manually when using FormData
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

      await apiFetch(`${baseUrl}/api/payments/networks/`, {
        method: "POST",
        headers,
        body
      })
      toast({
        title: t("network.created") || "Réseau créé",
        description: t("network.createdSuccessfully") || "Le réseau a été créé avec succès",
      })
      router.push("/dashboard/network/list")
    } catch (err: any) {
      const errorMessage = extractErrorMessages(err) || t("network.failedToCreate") || "Échec de la création du réseau"
      setError(errorMessage)
      toast({
        title: t("network.failedToCreate") || "Échec de la création",
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
            Créer un réseau
          </h1>
          <p className="text-muted-foreground">
            Ajouter un nouveau réseau mobile au système
          </p>
        </div>
        
        <div className="flex items-center gap-3">
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
                    {countries.map((c) => (
                      <SelectItem key={c.id || c.uid} value={c.id || c.uid}>
                        {c.nom}
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
                  {logoFile && (
                    <div className="relative h-24 w-24 border rounded-lg overflow-hidden bg-muted">
                      <img 
                        src={URL.createObjectURL(logoFile)} 
                        alt="Preview" 
                        className="h-full w-full object-contain"
                      />
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
                      Privilégiez une image carrée (PNG ou JPG)
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
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Création...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Créer le réseau
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}


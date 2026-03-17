"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useApi } from "@/lib/useApi"
import { useLanguage } from "@/components/providers/language-provider"
import { useToast } from "@/hooks/use-toast"
import { ErrorDisplay, extractErrorMessages } from "@/components/ui/error-display"
import { ArrowLeft, Save, Loader2, Settings, CheckCircle, Plus } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""

export default function ApiConfigEditPage() {
  const [name, setName] = useState("")
  const [configBaseUrl, setConfigBaseUrl] = useState("")
  const [apiKey, setApiKey] = useState("")
  const [description, setDescription] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const params = useParams()
  const apiFetch = useApi()
  const { t } = useLanguage()
  const { toast } = useToast();

  const configId = params.uid as string

  useEffect(() => {
    const fetchConfig = async () => {
      setLoading(true)
      setError("")
      try {
        const data = await apiFetch(`${baseUrl}/api/api-configs/${configId}/`)
        setName(data.name || "")
        setConfigBaseUrl(data.base_url || "")
        setApiKey(data.api_key || "")
        setDescription(data.description || "")
        setIsActive(data.is_active ?? true)
      } catch (err: any) {
        const errorMessage = extractErrorMessages(err) || t("apiConfig.failedToLoad")
        setError(errorMessage)
        toast({
          title: t("apiConfig.failedToLoad"),
          description: errorMessage,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    if (configId) {
      fetchConfig()
    }
  }, [configId, apiFetch, t, toast])

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setSaving(true)
    setError("")
    try {
      await apiFetch(`${baseUrl}/api/api-configs/${configId}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, base_url: configBaseUrl, api_key: apiKey, description, is_active: isActive })
      })
      toast({
        title: t("apiConfig.updated"),
        description: t("apiConfig.updatedSuccessfully"),
      })
      router.push("/dashboard/api-config/list")
    } catch (err: any) {
      const errorMessage = extractErrorMessages(err) || t("apiConfig.failedToUpdate")
      setError(errorMessage)
      toast({
        title: t("apiConfig.failedToUpdate"),
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="text-muted-foreground">Loading API config...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            className="flex items-center gap-2 hover-lift"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-4xl font-bold text-gradient">
              Edit API Config
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Update API configuration
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 px-3 py-2 bg-accent rounded-lg">
          <Settings className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">
            {name || "API Config"}
          </span>
        </div>
      </div>

      {error && (
        <Card className="minimal-card">
          <CardContent className="p-6">
            <ErrorDisplay error={error} />
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* API Config Information */}
        <Card className="minimal-card hover-lift">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="flex items-center gap-3 text-xl font-semibold">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Settings className="h-5 w-5 text-primary" />
              </div>
              <span>API Config Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-foreground">
                Config Name *
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ex: Payment Gateway, SMS Service"
                className="minimal-input"
                variant="minimal"
                required
              />
              <p className="text-xs text-muted-foreground">
                The display name of the API configuration
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="baseUrl" className="text-sm font-medium text-foreground">
                Base URL *
              </Label>
              <Input
                id="baseUrl"
                value={configBaseUrl}
                onChange={(e) => setConfigBaseUrl(e.target.value)}
                placeholder="https://api.example.com"
                className="minimal-input"
                variant="minimal"
                required
              />
              <p className="text-xs text-muted-foreground">
                The base URL for the API endpoint
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="apiKey" className="text-sm font-medium text-foreground">
                API Key
              </Label>
              <Input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter API key..."
                className="minimal-input font-mono"
                variant="minimal"
              />
              <p className="text-xs text-muted-foreground">
                API key for authentication (optional)
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-foreground">
                Description
              </Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="API config description..."
                className="minimal-input"
                variant="minimal"
              />
              <p className="text-xs text-muted-foreground">
                Optional description of the API config
              </p>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-accent/30 rounded-lg">
              <div className="space-y-1">
                <Label htmlFor="isActive" className="text-sm font-medium text-foreground">
                  Config Status
                </Label>
                <p className="text-xs text-muted-foreground">
                  Enable this config so it's available in the system
                </p>
              </div>
              <Switch
                id="isActive"
                checked={isActive}
                onCheckedChange={setIsActive}
              />
            </div>
          </CardContent>
        </Card>

        {/* Preview Card */}
        {(name || configBaseUrl) && (
          <Card className="minimal-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center gap-4 p-4 bg-accent/20 rounded-lg">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Settings className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">
                    {name || "API Config"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    URL: {configBaseUrl || "https://api.example.com"}
                  </p>
                  {apiKey && (
                    <p className="text-sm text-muted-foreground mt-1">
                      API Key: {apiKey}
                    </p>
                  )}
                </div>
                <Badge variant={isActive ? "default" : "secondary"}>
                  {isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-border/50">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.back()}
            className="hover-lift"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={saving || !name || !configBaseUrl}
            className="min-w-[140px] hover-lift"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

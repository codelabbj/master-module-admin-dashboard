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
import { ArrowLeft, Save, Loader2, DollarSign, CheckCircle, Plus } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""

export default function CommissionConfigEditPage() {
  const [name, setName] = useState("")
  const [rate, setRate] = useState("")
  const [minAmount, setMinAmount] = useState("")
  const [maxAmount, setMaxAmount] = useState("")
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

  const configId = params.id as string

  useEffect(() => {
    const fetchConfig = async () => {
      setLoading(true)
      setError("")
      try {
        const data = await apiFetch(`${baseUrl}/api/commission-configs/${configId}/`)
        setName(data.name || "")
        setRate(data.rate ? data.rate.toString() : "")
        setMinAmount(data.min_amount ? data.min_amount.toString() : "")
        setMaxAmount(data.max_amount ? data.max_amount.toString() : "")
        setDescription(data.description || "")
        setIsActive(data.is_active ?? true)
      } catch (err: any) {
        const errorMessage = extractErrorMessages(err) || t("commissionConfig.failedToLoad")
        setError(errorMessage)
        toast({
          title: t("commissionConfig.failedToLoad"),
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
      await apiFetch(`${baseUrl}/api/commission-configs/${configId}/`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name, 
          rate: parseFloat(rate) || 0, 
          min_amount: parseFloat(minAmount) || 0, 
          max_amount: parseFloat(maxAmount) || 0,
          description,
          is_active: isActive 
        })
      })
      toast({
        title: t("commissionConfig.updated"),
        description: t("commissionConfig.updatedSuccessfully"),
      })
      router.push("/dashboard/commission-config/list")
    } catch (err: any) {
      const errorMessage = extractErrorMessages(err) || t("commissionConfig.failedToUpdate")
      setError(errorMessage)
      toast({
        title: t("commissionConfig.failedToUpdate"),
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
          <span className="text-muted-foreground">Loading commission config...</span>
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
              Edit Commission Config
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Update commission configuration
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 px-3 py-2 bg-accent rounded-lg">
          <DollarSign className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">
            {name || "Commission Config"}
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
        {/* Commission Config Information */}
        <Card className="minimal-card hover-lift">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="flex items-center gap-3 text-xl font-semibold">
              <div className="p-2 bg-primary/10 rounded-lg">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <span>Commission Config Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-foreground">
                  Config Name *
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ex: Standard Commission, Premium Commission"
                  className="minimal-input"
                  variant="minimal"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  The display name of the commission configuration
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="rate" className="text-sm font-medium text-foreground">
                  Commission Rate (%) *
                </Label>
                <Input
                  id="rate"
                  type="number"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  placeholder="ex: 5.5"
                  className="minimal-input"
                  variant="minimal"
                  min="0"
                  max="100"
                  step="0.01"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Commission rate as a percentage (0-100)
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="minAmount" className="text-sm font-medium text-foreground">
                  Minimum Amount ($)
                </Label>
                <Input
                  id="minAmount"
                  type="number"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                  placeholder="ex: 100"
                  className="minimal-input"
                  variant="minimal"
                  min="0"
                  step="0.01"
                />
                <p className="text-xs text-muted-foreground">
                  Minimum transaction amount for this config
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxAmount" className="text-sm font-medium text-foreground">
                  Maximum Amount ($)
                </Label>
                <Input
                  id="maxAmount"
                  type="number"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                  placeholder="ex: 10000"
                  className="minimal-input"
                  variant="minimal"
                  min="0"
                  step="0.01"
                />
                <p className="text-xs text-muted-foreground">
                  Maximum transaction amount for this config
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-foreground">
                Description
              </Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Commission config description..."
                className="minimal-input"
                variant="minimal"
              />
              <p className="text-xs text-muted-foreground">
                Optional description of the commission config
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
        {(name || rate) && (
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
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">
                    {name || "Commission Config"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Rate: {rate ? `${rate}%` : "0%"}
                  </p>
                  {(minAmount || maxAmount) && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Range: ${minAmount || 0} - ${maxAmount || 0}
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
            disabled={saving || !name || !rate}
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

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useApi } from "@/lib/useApi"
import { useLanguage } from "@/components/providers/language-provider"
import { useToast } from "@/hooks/use-toast"
import { ErrorDisplay, extractErrorMessages } from "@/components/ui/error-display"
import { ArrowLeft, Save, Loader2, Gamepad2, CheckCircle, Plus, Image as ImageIcon } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""

export default function PlatformCreatePage() {
  const [name, setName] = useState("")
  const [code, setCode] = useState("")
  const [description, setDescription] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const router = useRouter()
  const apiFetch = useApi()
  const { t } = useLanguage()
  const { toast } = useToast();

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      let body
      const headers: Record<string, string> = {}
      
      if (logoFile) {
        const formData = new FormData()
        formData.append("name", name)
        formData.append("code", code)
        formData.append("description", description)
        formData.append("is_active", String(isActive))
        formData.append("logo", logoFile)
        body = formData
      } else {
        body = JSON.stringify({ name, code, description, is_active: isActive })
        headers["Content-Type"] = "application/json"
      }

      await apiFetch(`${baseUrl}/api/platforms/`, {
        method: "POST",
        headers,
        body
      })
      toast({
        title: t("platforms.created"),
        description: t("platforms.createdSuccessfully"),
      })
      router.push("/dashboard/platforms/list")
    } catch (err: any) {
      const errorMessage = extractErrorMessages(err) || t("platforms.failedToCreate")
      setError(errorMessage)
      toast({
        title: t("platforms.failedToCreate"),
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
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
              Create Platform
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Add a new platform configuration to the system
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 px-3 py-2 bg-accent rounded-lg">
          <Gamepad2 className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">
            New Platform
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
        {/* Platform Information */}
        <Card className="minimal-card hover-lift">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="flex items-center gap-3 text-xl font-semibold">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Gamepad2 className="h-5 w-5 text-primary" />
              </div>
              <span>Platform Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-foreground">
                  Platform Name *
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ex: Gaming Platform, Betting System"
                  className="minimal-input"
                  variant="minimal"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  The display name of the platform as it will appear in the interface
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="code" className="text-sm font-medium text-foreground">
                  Platform Code *
                </Label>
                <Input
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="ex: GP, BS"
                  className="minimal-input font-mono"
                  variant="minimal"
                  maxLength={10}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Unique code to identify the platform in the system
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
                placeholder="Platform description..."
                className="minimal-input"
                variant="minimal"
              />
              <p className="text-xs text-muted-foreground">
                Optional description of the platform
              </p>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-accent/30 rounded-lg">
              <div className="space-y-1">
                <Label htmlFor="isActive" className="text-sm font-medium text-foreground">
                  Platform Status
                </Label>
                <p className="text-xs text-muted-foreground">
                  Enable this platform so it's available in the system
                </p>
              </div>
              <Switch
                onCheckedChange={setIsActive}
              />
            </div>
            
            <div className="space-y-4 pt-4 border-t border-border/50">
              <Label htmlFor="logo" className="text-sm font-medium text-foreground">
                Platform Logo
              </Label>
              <div className="flex items-center gap-6">
                <div className="relative h-28 w-28 rounded-xl border-2 border-dashed border-muted-foreground/20 bg-muted/30 flex items-center justify-center overflow-hidden transition-all hover:border-primary/50">
                  {logoFile ? (
                    <img 
                      src={URL.createObjectURL(logoFile)} 
                      alt="Logo preview" 
                      className="h-full w-full object-contain p-2"
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
                    variant="minimal"
                  />
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG or SVG formats accepted. Max size 2MB.
                    </p>
                    <p className="text-xs font-medium text-primary/70">
                      Recommendation: 512x512px with transparent background.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preview Card */}
        {(name || code) && (
          <Card className="minimal-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center gap-4 p-4 bg-accent/20 rounded-lg">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden border border-primary/20">
                  {logoFile ? (
                    <img 
                      src={URL.createObjectURL(logoFile)} 
                      alt="Logo preview" 
                      className="h-full w-full object-contain p-1"
                    />
                  ) : (
                    <Gamepad2 className="h-6 w-6 text-primary" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">
                    {name || "Platform Name"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Code: {code || "CODE"}
                  </p>
                  {description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {description}
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
            disabled={loading || !name || !code}
            className="min-w-[140px] hover-lift"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Create Platform
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}


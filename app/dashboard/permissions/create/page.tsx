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
import { ArrowLeft, Save, Loader2, Shield, CheckCircle, Plus } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""

export default function PermissionCreatePage() {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const apiFetch = useApi()
  const { t } = useLanguage()
  const { toast } = useToast();

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      await apiFetch(`${baseUrl}/api/permissions/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description })
      })
      toast({
        title: t("permissions.created"),
        description: t("permissions.createdSuccessfully"),
      })
      router.push("/dashboard/permissions/list")
    } catch (err: any) {
      const errorMessage = extractErrorMessages(err) || t("permissions.failedToCreate")
      setError(errorMessage)
      toast({
        title: t("permissions.failedToCreate"),
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
              Grant Permission
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Create a new permission for the system
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 px-3 py-2 bg-accent rounded-lg">
          <Shield className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">
            New Permission
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
        {/* Permission Information */}
        <Card className="minimal-card hover-lift">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="flex items-center gap-3 text-xl font-semibold">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <span>Permission Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-foreground">
                Permission Name *
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ex: manage_users, view_reports"
                className="minimal-input"
                variant="minimal"
                required
              />
              <p className="text-xs text-muted-foreground">
                Unique name for the permission (e.g., manage_users, view_reports)
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
                placeholder="Permission description..."
                className="minimal-input"
                variant="minimal"
              />
              <p className="text-xs text-muted-foreground">
                Description of what this permission allows
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Preview Card */}
        {(name) && (
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
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">
                    {name}
                  </h3>
                  {description && (
                    <p className="text-sm text-muted-foreground">
                      {description}
                    </p>
                  )}
                </div>
                <Badge variant="default">
                  New
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
            disabled={loading || !name}
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
                Create Permission
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}


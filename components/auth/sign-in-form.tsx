"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { LanguageSwitcher } from "@/components/ui/language-switcher"
import { useLanguage } from "@/components/providers/language-provider"
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  Shield, 
  ArrowRight, 
  Sparkles,
  LogIn,
  User,
  CheckCircle
} from "lucide-react"
import { useApi } from "@/lib/useApi"
import { useToast } from "@/hooks/use-toast"
import { ErrorDisplay, extractErrorMessages } from "@/components/ui/error-display"

export function SignInForm() {
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { t } = useLanguage()
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ""
  const [showPassword, setShowPassword] = useState(false)
  const apiFetch = useApi();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const data = await apiFetch(`${baseUrl}/api/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      })
      if (!data || !data.access || !data.refresh || !data.user) {
        const backendError = extractErrorMessages(data) || t("auth.loginFailed")
        setError(backendError)
        toast({
          title: t("auth.loginFailed"),
          description: backendError,
          variant: "destructive",
        })
        setLoading(false)
        return
      }
      // Enforce staff/superuser-only access
      const user = data.user
      const isStaff = Boolean(user?.is_staff)
      const isSuperuser = Boolean(user?.is_superuser)
      if (!isStaff && !isSuperuser) {
        const notAllowedMsg = t("auth.notAllowed") || "User is not allowed to access this dashboard."
        setError(notAllowedMsg)
        toast({
          title: t("auth.loginFailed"),
          description: notAllowedMsg,
          variant: "destructive",
        })
        setLoading(false)
        return
      }
      localStorage.setItem("accessToken", data.access)
      localStorage.setItem("refreshToken", data.refresh)
      localStorage.setItem("user", JSON.stringify(data.user))
      if (rememberMe) {
        localStorage.setItem("rememberMe", "true")
        document.cookie = `accessToken=${data.access}; path=/; max-age=86400; secure; samesite=strict`;
      } else {
        localStorage.removeItem("rememberMe")
        document.cookie = `accessToken=${data.access}; path=/; secure; samesite=strict`;
      }
      toast({
        title: t("auth.loginSuccess"),
        description: t("auth.loggedInSuccessfully"),
      })
      router.push("/dashboard")
    } catch (err: any) {
      let backendError = t("auth.networkError");
      // Try to extract error message from API response
      if (err && err.message) {
        try {
          // Try to parse JSON from the error message if possible
          const parsed = JSON.parse(err.message);
          backendError = extractErrorMessages(parsed) || backendError;
        } catch {
          // If not JSON, try to extract from err.message directly
          backendError = extractErrorMessages(err.message) || backendError;
        }
      } else if (err) {
        backendError = extractErrorMessages(err) || backendError;
      }
      setError(backendError);
      toast({
        title: t("auth.networkError"),
        description: backendError,
        variant: "destructive",
      });
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-8">
        
        {/* Header Section */}
        <div className="text-center space-y-6">
          {/* <div className="flex justify-center items-center mb-6">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img src="/logo.png" alt="Flashpay Module Logo" className="h-12 w-12" />
                <div className="absolute -top-1 -right-1">
                  <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <Sparkles className="h-3 w-3 text-white" />
                  </div>
                </div>
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-bold text-gradient">
                  Flashpay Module
                </h1>
                <p className="text-sm text-muted-foreground">
                  Admin Dashboard
                </p>
              </div>
            </div>
          </div> */}
          
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-gradient">
              Bienvenue
            </h2>
            <p className="text-muted-foreground text-lg">
              Accédez à votre tableau de bord administrateur
            </p>
          </div>
        </div>

        {/* Login Form Card */}
        <Card className="minimal-card hover-lift">
          <CardHeader className="space-y-4 pb-6">
            <div className="flex items-center justify-center">
              <div className="p-3 bg-primary/10 rounded-full">
                <LogIn className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <CardTitle className="text-2xl font-bold text-foreground">
              Flashpay Module
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Connectez-vous avec vos identifiants administrateur
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Email Input */}
              <div className="space-y-3">
                <Label htmlFor="email" className="text-sm font-medium text-foreground flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-primary" />
                  <span>Email ou identifiant</span>
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                    className="minimal-input pl-12"
                    variant="minimal"
                  />
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-3">
                <Label htmlFor="password" className="text-sm font-medium text-foreground flex items-center space-x-2">
                  <Lock className="h-4 w-4 text-primary" />
                  <span>Mot de passe</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="minimal-input pl-12 pr-12"
                    variant="minimal"
                  />
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-200"
                    onClick={() => setShowPassword((v) => !v)}
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  />
                  <Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                    Se souvenir de moi
                  </Label>
                </div>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full py-3 hover-lift" 
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Connexion...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span>Se connecter</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </Button>

              {/* Error Display */}
              {error && (
                <div className="mt-4">
                  <ErrorDisplay
                    error={error}
                    variant="inline"
                    showRetry={false}
                    className="bg-destructive/10 border border-destructive/20 rounded-lg p-4"
                  />
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        {/* <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" />
            <span>Connexion sécurisée par chiffrement SSL</span>
          </div>
          <div className="text-xs text-muted-foreground">
            © 2025 Flashpay Module. Tous droits réservés.
          </div>
        </div> */}
      </div>
    </div>
  )
}
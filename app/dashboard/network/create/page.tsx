"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/components/providers/language-provider"

export default function NetworkCreateRedirectPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { t } = useLanguage()

  useEffect(() => {
    toast({
      title: t("feature.disabled") || "Feature Disabled",
      description: t("network.disabled") || "The network feature has been disabled",
      variant: "destructive",
    })
    router.push("/dashboard")
  }, [router, toast, t])

  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="text-muted-foreground">Redirecting...</span>
      </div>
    </div>
  )
}

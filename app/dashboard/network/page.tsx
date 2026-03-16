"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function NetworkIndexPage() {
  const router = useRouter()

  useEffect(() => {
    router.push("/dashboard/network/list")
  }, [router])

  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="text-muted-foreground">Redirecting...</span>
      </div>
    </div>
  )
}

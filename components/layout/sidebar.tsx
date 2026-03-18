"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useLanguage } from "@/components/providers/language-provider"
import {
  BarChart3, Users, CreditCard, LogOut, Menu, X,
  ChevronDown, ChevronUp, Globe, Share2, Phone,
  Monitor, MessageCircle, Bell, Settings, User,
  Home, DollarSign, Waves, Smartphone, Zap
} from "lucide-react"
import { clearTokens } from "@/lib/api"
import { CONFIG } from "@/lib/config"
import { navItems } from "@/lib/navigation"

const appName = CONFIG.APP_NAME
const appShortName = CONFIG.APP_SHORT_NAME

interface SidebarProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function Sidebar({ open: sidebarOpen, setOpen: setSidebarOpen }: SidebarProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const router = useRouter()
  const pathname = usePathname()
  const { t } = useLanguage()

  const toggleExpanded = (item: string) => {
    setExpandedItems(prev =>
      prev.includes(item)
        ? prev.filter(i => i !== item)
        : [...prev, item]
    )
  }

  const handleLogout = () => {
    clearTokens();
    if (typeof document !== 'undefined') {
      document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict';
    }
    localStorage.removeItem("isAuthenticated");
    router.push("/");
  }

  // Filter navigation items based on feature flags
  const filteredNavigationItems = navItems.filter(item => {
    if (item.feature === null) return true
    return CONFIG.FEATURES[item.feature]
  }).map(item => ({
    name: t(item.label),
    href: item.href,
    icon: item.icon,
    current: item.href === "/dashboard" ? pathname === "/dashboard" : (pathname === item.href || pathname.startsWith(item.href + "/")),
    children: item.children?.filter(child => {
      if (child.feature === null) return true
      return CONFIG.FEATURES[child.feature]
    }).map(child => ({
      name: t(child.label),
      href: child.href,
    })),
  }))

  const renderNavItem = (item: any) => {
    const isExpanded = expandedItems.includes(item.name)
    const hasChildren = item.children && item.children.length > 0

    if (hasChildren) {
      return (
        <div key={item.name} className="space-y-1">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              toggleExpanded(item.name);
            }}
            className={cn(
              "minimal-nav-item w-full justify-between focus:outline-none",
              item.current && "minimal-nav-item-active"
            )}
          >
            <div className="flex items-center gap-3">
              <item.icon className="h-4 w-4" />
              <span>{item.name}</span>
            </div>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
          <div
            className={cn(
              "overflow-hidden transition-all duration-300 ease-in-out",
              isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
            )}
          >
            <div className="pl-7 space-y-1">
              {item.children.map((child: any) => (
                <Link
                  key={child.href}
                  href={child.href}
                  prefetch={false}
                  className={cn(
                    "minimal-nav-item text-sm",
                    pathname === child.href && "minimal-nav-item-active"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  {child.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )
    }

    return (
      <Link
        key={item.href}
        href={item.href}
        prefetch={false}
        className={cn(
          "minimal-nav-item",
          item.current && "minimal-nav-item-active"
        )}
        onClick={() => setSidebarOpen(false)}
      >
        <item.icon className="h-4 w-4" />
        <span>{item.name}</span>
      </Link>
    )
  }

  return (
    <>
      {/* Mobile sidebar */}
      <div className={cn("fixed inset-0 z-50 lg:hidden", sidebarOpen ? "block" : "hidden")}>
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-80 flex-col bg-background border-r border-border/50 shadow-elevated">
          <div className="flex-shrink-0 h-16 flex items-center justify-between px-6 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">{appShortName}</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">{appName}</h1>
                <p className="text-xs text-muted-foreground">{t("nav.adminDashboard")}</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <nav className="flex-1 min-h-0 space-y-2 p-4 overflow-y-auto">
            {filteredNavigationItems.map((item) => renderNavItem(item))}
          </nav>

          <div className="flex-shrink-0 p-4 border-t border-border/50">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-4 w-4" />
              {t("nav.logout")}
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex flex-col h-screen bg-background border-r border-border/50 shadow-elevated">
          <div className="flex-shrink-0 h-16 flex items-center px-6 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">{appShortName}</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">{appName}</h1>
                <p className="text-xs text-muted-foreground">{t("nav.adminDashboard")}</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 min-h-0 space-y-2 p-4 overflow-y-auto">
            {filteredNavigationItems.map((item) => renderNavItem(item))}
          </nav>

          <div className="flex-shrink-0 p-4 border-t border-border/50">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-4 w-4" />
              {t("nav.logout")}
            </Button>
          </div>
        </div>
      </div>

    </>
  )
}
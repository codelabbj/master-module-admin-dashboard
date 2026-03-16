import {
  Home,
  Users,
  CreditCard,
  Globe,
  Settings,
  Zap,
  MessageCircle,
  Bell,
  User,
  DollarSign,
  Gamepad2,
  Shield,
  Receipt,
  ArrowRightLeft,
  Smartphone,
  Waves,
  type LucideIcon,
} from "lucide-react"

import { CONFIG } from "./config"

export type NavFeature = keyof typeof CONFIG.FEATURES | null

export interface NavItem {
  href: string
  label: string
  icon: LucideIcon
  feature: NavFeature
  children?: NavItem[]
}

export const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: Home, feature: null },
  {
    href: "/dashboard/users",
    label: "Users",
    icon: Users,
    feature: "USERS",
    children: [
      { href: "/dashboard/users/register", label: "Register", icon: Users, feature: "USERS" },
      { href: "/dashboard/users/list", label: "User List", icon: Users, feature: "USERS" },
    ],
  },
  {
    href: "/dashboard/country",
    label: "Country",
    icon: Globe,
    feature: "COUNTRY",
    children: [
      { href: "/dashboard/country/list", label: "Country List", icon: Globe, feature: "COUNTRY" },
      { href: "/dashboard/country/create", label: "Create Country", icon: Globe, feature: "COUNTRY" },
    ],
  },
  {
    href: "/dashboard/network",
    label: "Networks",
    icon: Smartphone,
    feature: "NETWORK",
    children: [
      { href: "/dashboard/network/list", label: "Network List", icon: Smartphone, feature: "NETWORK" },
      { href: "/dashboard/network/create", label: "Create Network", icon: Smartphone, feature: "NETWORK" },
    ],
  },
  {
    href: "/dashboard/network-config",
    label: "Network Config",
    icon: Settings,
    feature: "NETWORK_CONFIG",
    children: [
      { href: "/dashboard/network-config/list", label: "Config List", icon: Settings, feature: "NETWORK_CONFIG" },
      { href: "/dashboard/network-config/create", label: "Create Config", icon: Settings, feature: "NETWORK_CONFIG" },
    ],
  },
  {
    href: "/dashboard/platforms",
    label: "Platforms",
    icon: Gamepad2,
    feature: "PLATFORMS",
    children: [
      { href: "/dashboard/platforms/list", label: "List Platforms", icon: Gamepad2, feature: "PLATFORMS" },
      { href: "/dashboard/platforms/create", label: "Create Platform", icon: Gamepad2, feature: "PLATFORMS" },
    ],
  },
  {
    href: "/dashboard/permissions",
    label: "Permissions",
    icon: Shield,
    feature: "PERMISSIONS",
    children: [
      { href: "/dashboard/permissions/list", label: "List Permissions", icon: Shield, feature: "PERMISSIONS" },
      { href: "/dashboard/permissions/create", label: "Grant Permission", icon: Shield, feature: "PERMISSIONS" },
      { href: "/dashboard/permissions/partners-summary", label: "Permissions Summary", icon: Shield, feature: "PERMISSIONS" },
    ],
  },
  {
    href: "/dashboard/commission",
    label: "Commission",
    icon: DollarSign,
    feature: "COMMISSION_CONFIG",
    children: [
      { href: "/dashboard/commission-config/list", label: "Config Management", icon: DollarSign, feature: "COMMISSION_CONFIG" },
      { href: "/dashboard/commission-payments", label: "Payments", icon: DollarSign, feature: "COMMISSION_PAYMENTS" },
    ],
  },
  { href: "/dashboard/betting-transactions", label: "Betting Transactions", icon: Receipt, feature: "BETTING_TRANSACTIONS" },
  { href: "/dashboard/transfers", label: "Partner Transfers", icon: ArrowRightLeft, feature: "PARTNER_TRANSFERS" },
  {
    href: "/dashboard/auto-recharge",
    label: "Auto Recharge",
    icon: Zap,
    feature: "AUTO_RECHARGE",
    children: [
      { href: "/dashboard/auto-recharge/mappings", label: "Mappings", icon: Zap, feature: "AUTO_RECHARGE_MAPPINGS" },
      { href: "/dashboard/auto-recharge/aggregators", label: "Aggregators", icon: Zap, feature: "AUTO_RECHARGE_AGGREGATORS" },
      { href: "/dashboard/auto-recharge/transactions", label: "Transactions", icon: Zap, feature: "AUTO_RECHARGE_TRANSACTIONS" },
    ],
  },
  {
    href: "/dashboard/api-config",
    label: "API Config",
    icon: Settings,
    feature: "API_CONFIG",
    children: [
      { href: "/dashboard/api-config/list", label: "Configuration List", icon: Settings, feature: "API_CONFIG" },
      { href: "/dashboard/api-config/create", label: "Create Config", icon: Settings, feature: "API_CONFIG" },
    ],
  },
  { href: "/dashboard/device-authorizations", label: "Device Authorizations", icon: Shield, feature: "DEVICE_AUTHORIZATIONS" },
  {
    href: "/dashboard/aggregators",
    label: "Aggregators",
    icon: Globe,
    feature: "AGGREGATORS",
    children: [
      { href: "/dashboard/aggregators/users", label: "Aggregator Users", icon: Globe, feature: "AGGREGATORS" },
      { href: "/dashboard/aggregators/transactions", label: "Transactions", icon: Globe, feature: "AGGREGATORS" },
      { href: "/dashboard/aggregators/network-mappings", label: "Network Mappings", icon: Globe, feature: "AGGREGATORS" },
      { href: "/dashboard/aggregators/authorizations", label: "Authorizations", icon: Globe, feature: "AGGREGATORS" },
    ],
  },
  {
    href: "/dashboard/transactions",
    label: "Transactions",
    icon: CreditCard,
    feature: "TRANSACTIONS",
    children: [
      { href: "/dashboard/transactions", label: "All Transactions", icon: CreditCard, feature: "TRANSACTIONS" },
      { href: "/dashboard/transactions/withdraw", label: "Withdraw", icon: CreditCard, feature: "WITHDRAW" },
    ],
  },
  {
    href: "/dashboard/devices",
    label: "Devices",
    icon: Users,
    feature: "DEVICES",
    children: [
      { href: "/dashboard/devices/list", label: "Devices List", icon: Users, feature: "DEVICES" },
    ],
  },
  { href: "/dashboard/sms-logs/list", label: "SMS Logs", icon: MessageCircle, feature: "SMS_LOGS" },
  { href: "/dashboard/fcm-logs/list", label: "FCM Logs", icon: Bell, feature: "FCM_LOGS" },
  { href: "/dashboard/partner", label: "Partner", icon: User, feature: "PARTNER" },
  { href: "/dashboard/topup", label: "Topup", icon: DollarSign, feature: "TOPUP" },
  { href: "/dashboard/earning-management", label: "Earning Management", icon: CreditCard, feature: "EARNING_MANAGEMENT" },
  { href: "/dashboard/momo-pay", label: "MoMo Pay", icon: Users, feature: "MOMO_PAY" },
  { href: "/dashboard/wave-business-transaction", label: "Wave Business", icon: CreditCard, feature: "WAVE_BUSINESS" },
  { href: "/dashboard/profile", label: "Profile", icon: User, feature: "PROFILE" },
]

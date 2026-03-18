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
  Share2,
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
  { href: "/dashboard", label: "nav.dashboard", icon: Home, feature: null },
  {
    href: "/dashboard/users",
    label: "nav.users",
    icon: Users,
    feature: "USERS",
    children: [
      { href: "/dashboard/users/register", label: "nav.register", icon: Users, feature: "USERS" },
      { href: "/dashboard/users/list", label: "nav.userList", icon: Users, feature: "USERS" },
    ],
  },
  {
    href: "/dashboard/country",
    label: "nav.country",
    icon: Globe,
    feature: "COUNTRY",
    children: [
      { href: "/dashboard/country/list", label: "nav.countryList", icon: Globe, feature: "COUNTRY" },
      { href: "/dashboard/country/create", label: "nav.countryCreate", icon: Globe, feature: "COUNTRY" },
    ],
  },
  {
    href: "/dashboard/network",
    label: "nav.networks",
    icon: Smartphone,
    feature: "NETWORK",
    children: [
      { href: "/dashboard/network/list", label: "nav.networkList", icon: Smartphone, feature: "NETWORK" },
      { href: "/dashboard/network/create", label: "nav.networkCreate", icon: Smartphone, feature: "NETWORK" },
    ],
  },
  {
    href: "/dashboard/network-config",
    label: "nav.networkConfig",
    icon: Settings,
    feature: "NETWORK_CONFIG",
    children: [
      { href: "/dashboard/network-config/list", label: "nav.networkConfigList", icon: Settings, feature: "NETWORK_CONFIG" },
      { href: "/dashboard/network-config/create", label: "nav.networkConfigCreate", icon: Settings, feature: "NETWORK_CONFIG" },
    ],
  },
  {
    href: "/dashboard/devices",
    label: "nav.devices",
    icon: Users,
    feature: "DEVICES",
    children: [
      { href: "/dashboard/devices/list", label: "nav.devicesList", icon: Users, feature: "DEVICES" },
    ],
  },
  { href: "/dashboard/topup", label: "nav.topup", icon: DollarSign, feature: "TOPUP" },
  {
    href: "/dashboard/transactions",
    label: "nav.transactions",
    icon: CreditCard,
    feature: "TRANSACTIONS",
    children: [
      { href: "/dashboard/transactions", label: "nav.allTransactions", icon: CreditCard, feature: "TRANSACTIONS" },
      { href: "/dashboard/transactions/withdraw", label: "nav.withdraw", icon: CreditCard, feature: "WITHDRAW" },
      { href: "/dashboard/transaction-logs", label: "nav.transactionLogs", icon: Receipt, feature: "TRANSACTION_LOGS" },
    ],
  },
  {
    href: "/dashboard/momo-pay",
    label: "nav.momoPay",
    icon: Users,
    feature: "MOMO_PAY",
  },
  { href: "/dashboard/wave-business-transaction", label: "nav.waveBusiness", icon: CreditCard, feature: "WAVE_BUSINESS" },
  { href: "/dashboard/sms-logs/list", label: "nav.smsLogs", icon: MessageCircle, feature: "SMS_LOGS" },
  { href: "/dashboard/fcm-logs/list", label: "nav.fcmLogs", icon: Bell, feature: "FCM_LOGS" },
  { href: "/dashboard/phone-number/list", label: "nav.phoneNumbers", icon: Smartphone, feature: "PHONE_NUMBERS" },
  { href: "/dashboard/partner", label: "nav.partner", icon: User, feature: "PARTNER" },
  {
    href: "/dashboard/platforms",
    label: "nav.platforms",
    icon: Gamepad2,
    feature: "PLATFORMS",
    children: [
      { href: "/dashboard/platforms/list", label: "nav.platformsList", icon: Gamepad2, feature: "PLATFORMS" },
      { href: "/dashboard/platforms/create", label: "nav.createPlatform", icon: Gamepad2, feature: "PLATFORMS" },
    ],
  },
  {
    href: "/dashboard/permissions",
    label: "nav.permissions",
    icon: Shield,
    feature: "PERMISSIONS",
    children: [
      { href: "/dashboard/permissions/list", label: "nav.permissionsList", icon: Shield, feature: "PERMISSIONS" },
      { href: "/dashboard/permissions/create", label: "nav.grantPermission", icon: Shield, feature: "PERMISSIONS" },
      { href: "/dashboard/permissions/partners-summary", label: "nav.permissionsSummary", icon: Shield, feature: "PERMISSIONS" },
    ],
  },
  { href: "/dashboard/betting-transactions", label: "nav.bettingTransactions", icon: Receipt, feature: "BETTING_TRANSACTIONS" },
  {
    href: "/dashboard/commission",
    label: "nav.commission",
    icon: DollarSign,
    feature: "COMMISSION_CONFIG",
    children: [
      { href: "/dashboard/commission-config/list", label: "nav.commissionConfig", icon: DollarSign, feature: "COMMISSION_CONFIG" },
      { href: "/dashboard/commission-payments", label: "nav.commissionPayments", icon: DollarSign, feature: "COMMISSION_PAYMENTS" },
    ],
  },
  { href: "/dashboard/transfers", label: "nav.partnerTransfers", icon: ArrowRightLeft, feature: "PARTNER_TRANSFERS" },
  {
    href: "/dashboard/bulk-deposit-networks",
    label: "nav.bulkDepositNetworks",
    icon: Share2,
    feature: "BULK_DEPOSIT_NETWORKS",
  },
  { href: "/dashboard/device-authorizations", label: "nav.deviceAuthorizations", icon: Shield, feature: "DEVICE_AUTHORIZATIONS" },
  { href: "/dashboard/remote-command/create", label: "nav.remoteCommand", icon: Smartphone, feature: "REMOTE_COMMAND" },
  { href: "/dashboard/earning-management", label: "nav.earningManagement", icon: CreditCard, feature: "EARNING_MANAGEMENT" },
  {
    href: "/dashboard/aggregators",
    label: "nav.aggregators",
    icon: Globe,
    feature: "AGGREGATORS",
    children: [
      { href: "/dashboard/aggregators/users", label: "nav.aggregatorsUsers", icon: Globe, feature: "AGGREGATORS" },
      { href: "/dashboard/aggregators/transactions", label: "nav.transactions", icon: Globe, feature: "AGGREGATORS" },
      { href: "/dashboard/aggregators/network-mappings", label: "nav.aggregatorsNetworkMappings", icon: Globe, feature: "AGGREGATORS" },
      { href: "/dashboard/aggregators/authorizations", label: "nav.aggregatorsAuthorizations", icon: Globe, feature: "AGGREGATORS" },
    ],
  },
  {
    href: "/dashboard/auto-recharge",
    label: "nav.autoRecharge",
    icon: Zap,
    feature: "AUTO_RECHARGE",
    children: [
      { href: "/dashboard/auto-recharge/mappings", label: "nav.autoRechargeMappings", icon: Zap, feature: "AUTO_RECHARGE_MAPPINGS" },
      { href: "/dashboard/auto-recharge/aggregators", label: "nav.autoRechargeAggregators", icon: Zap, feature: "AUTO_RECHARGE_AGGREGATORS" },
      { href: "/dashboard/auto-recharge/transactions", label: "nav.autoRechargeTransactions", icon: Zap, feature: "AUTO_RECHARGE_TRANSACTIONS" },
    ],
  },
  { href: "/dashboard/profile", label: "nav.profile", icon: User, feature: "PROFILE" },
  {
    href: "/dashboard/api-config",
    label: "nav.apiConfig",
    icon: Settings,
    feature: "API_CONFIG",
    children: [
      { href: "/dashboard/api-config/list", label: "nav.apiConfigList", icon: Settings, feature: "API_CONFIG" },
      { href: "/dashboard/api-config/create", label: "nav.createApiConfig", icon: Settings, feature: "API_CONFIG" },
    ],
  },
]

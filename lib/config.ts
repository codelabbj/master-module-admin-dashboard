export const CONFIG = {
  // Application Branding
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || "Flashpay Module",
  APP_SHORT_NAME: process.env.NEXT_PUBLIC_APP_SHORT_NAME || "BP",
  APP_TITLE: process.env.NEXT_PUBLIC_APP_TITLE || "Flashpay Module - Admin Dashboard",
  APP_DESCRIPTION: process.env.NEXT_PUBLIC_APP_DESCRIPTION || "Professional admin dashboard for Flashpay Module",
  APP_LOGO_URL: process.env.NEXT_PUBLIC_APP_LOGO_URL || "/logo.png",

  // API Configuration
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "https://connect.yapson.net",

  // WebSocket Configuration
  WEBSOCKET_BASE_URL: process.env.NEXT_PUBLIC_WEBSOCKET_BASE_URL || "wss://connect.yapson.net",

  // Theme Colors (HSL format for Tailwind)
  PRIMARY_COLOR: process.env.NEXT_PUBLIC_PRIMARY_COLOR || "142 100% 33%",

  // Stat Card Colors
  STAT_CARD_RUST: process.env.NEXT_PUBLIC_STAT_CARD_RUST || "#772014",
  STAT_CARD_ORANGE: process.env.NEXT_PUBLIC_STAT_CARD_ORANGE || "#D97706",
  STAT_CARD_DARK: process.env.NEXT_PUBLIC_STAT_CARD_DARK || "#0F110C",
  STAT_CARD_AMBER: process.env.NEXT_PUBLIC_STAT_CARD_AMBER || "#F59E0B",
  STAT_CARD_EMERALD: process.env.NEXT_PUBLIC_STAT_CARD_EMERALD || "#047857",
  STAT_CARD_PURPLE: process.env.NEXT_PUBLIC_STAT_CARD_PURPLE || "#7C3AED",
  STAT_CARD_ROSE: process.env.NEXT_PUBLIC_STAT_CARD_ROSE || "#E11D48",
  STAT_CARD_CYAN: process.env.NEXT_PUBLIC_STAT_CARD_CYAN || "#0891B2",

  // Chart Colors (HSL format)
  CHART_1: process.env.NEXT_PUBLIC_CHART_1 || "142 100% 33%",
  CHART_2: process.env.NEXT_PUBLIC_CHART_2 || "160 84% 39%",
  CHART_3: process.env.NEXT_PUBLIC_CHART_3 || "173 58% 39%",
  CHART_4: process.env.NEXT_PUBLIC_CHART_4 || "197 37% 24%",
  CHART_5: process.env.NEXT_PUBLIC_CHART_5 || "220 9% 46%",

  // Feature Flags - Enable/Disable Pages
  FEATURES: {
    USERS: process.env.NEXT_PUBLIC_ENABLE_USERS !== "false",
    TRANSACTIONS: process.env.NEXT_PUBLIC_ENABLE_TRANSACTIONS !== "false",
    COUNTRY: process.env.NEXT_PUBLIC_ENABLE_COUNTRY !== "false",
    NETWORK: process.env.NEXT_PUBLIC_ENABLE_NETWORK !== "false",
    NETWORK_CONFIG: process.env.NEXT_PUBLIC_ENABLE_NETWORK_CONFIG !== "false",
    PHONE_NUMBERS: process.env.NEXT_PUBLIC_ENABLE_PHONE_NUMBERS !== "false",
    DEVICES: process.env.NEXT_PUBLIC_ENABLE_DEVICES !== "false",
    SMS_LOGS: process.env.NEXT_PUBLIC_ENABLE_SMS_LOGS !== "false",
    FCM_LOGS: process.env.NEXT_PUBLIC_ENABLE_FCM_LOGS !== "false",
    PARTNER: process.env.NEXT_PUBLIC_ENABLE_PARTNER !== "false",
    TOPUP: process.env.NEXT_PUBLIC_ENABLE_TOPUP !== "false",
    EARNING_MANAGEMENT: process.env.NEXT_PUBLIC_ENABLE_EARNING_MANAGEMENT !== "false",
    WAVE_BUSINESS: process.env.NEXT_PUBLIC_ENABLE_WAVE_BUSINESS !== "false",
    MOMO_PAY: process.env.NEXT_PUBLIC_ENABLE_MOMO_PAY !== "false",
    REMOTE_COMMAND: process.env.NEXT_PUBLIC_ENABLE_REMOTE_COMMAND !== "false",
    TRANSACTION_LOGS: process.env.NEXT_PUBLIC_ENABLE_TRANSACTION_LOGS !== "false",
    PROFILE: process.env.NEXT_PUBLIC_ENABLE_PROFILE !== "false",
    // New features from connect-pro
    PLATFORMS: process.env.NEXT_PUBLIC_ENABLE_PLATFORMS !== "false",
    PERMISSIONS: process.env.NEXT_PUBLIC_ENABLE_PERMISSIONS !== "false",
    COMMISSION_CONFIG: process.env.NEXT_PUBLIC_ENABLE_COMMISSION_CONFIG !== "false",
    BETTING_TRANSACTIONS: process.env.NEXT_PUBLIC_ENABLE_BETTING_TRANSACTIONS !== "false",
    PARTNER_TRANSFERS: process.env.NEXT_PUBLIC_ENABLE_PARTNER_TRANSFERS !== "false",
    AUTO_RECHARGE: process.env.NEXT_PUBLIC_ENABLE_AUTO_RECHARGE !== "false",
    AUTO_RECHARGE_MAPPINGS: process.env.NEXT_PUBLIC_ENABLE_AUTO_RECHARGE_MAPPINGS !== "false",
    AUTO_RECHARGE_AGGREGATORS: process.env.NEXT_PUBLIC_ENABLE_AUTO_RECHARGE_AGGREGATORS !== "false",
    AUTO_RECHARGE_TRANSACTIONS: process.env.NEXT_PUBLIC_ENABLE_AUTO_RECHARGE_TRANSACTIONS !== "false",
    COMMISSION_PAYMENTS: process.env.NEXT_PUBLIC_ENABLE_COMMISSION_PAYMENTS !== "false",
    API_CONFIG: process.env.NEXT_PUBLIC_ENABLE_API_CONFIG !== "false",
    DEVICE_AUTHORIZATIONS: process.env.NEXT_PUBLIC_ENABLE_DEVICE_AUTHORIZATIONS !== "false",
    AGGREGATORS: process.env.NEXT_PUBLIC_ENABLE_AGGREGATORS !== "false",
    WITHDRAW: process.env.NEXT_PUBLIC_ENABLE_WITHDRAW !== "false",
  },
};

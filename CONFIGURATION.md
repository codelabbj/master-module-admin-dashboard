# Configuration Multi-Projets

Ce projet utilise un système de configuration centralisé qui permet de réutiliser la même base de code pour différents projets en changeant simplement les variables d'environnement.

## 🎯 Architecture

### Fichiers Clés

1. **`lib/config.ts`** - Configuration centralisée qui importe toutes les variables d'environnement
2. **`env.template`** - Template avec toutes les configurations disponibles
3. **`lib/navigation.ts`** - Définition de la navigation avec feature flags
4. **`.env.local`** - Votre fichier de configuration local (non versionné)

## 🚀 Démarrage Rapide

### 1. Créer votre fichier de configuration

```bash
cp env.template .env.local
```

### 2. Choisir votre projet

Dans `.env.local`, décommentez la section du projet souhaité et commentez les autres :

```bash
# CASHIKA MODULE (ACTIVE)
NEXT_PUBLIC_API_BASE_URL=https://connect.cashika.net/
NEXT_PUBLIC_APP_NAME="Cashika Module"
NEXT_PUBLIC_APP_SHORT_NAME="C"
NEXT_PUBLIC_APP_TITLE="Cashika Module - Admin Dashboard"
NEXT_PUBLIC_APP_DESCRIPTION="Professional admin dashboard for Cashika Module"
NEXT_PUBLIC_PRIMARY_COLOR="221 83% 53%"
NEXT_PUBLIC_APP_LOGO_URL="/cashika.png"
```

### 3. Ajouter le logo

Placez le logo correspondant dans le dossier `/public` avec le nom spécifié dans `NEXT_PUBLIC_APP_LOGO_URL`.

### 4. Lancer le projet

```bash
npm run dev
```

## 📋 Projets Disponibles

Le système supporte les projets suivants (configurés dans `env.template`) :

- **Flashpay Module** - `https://connect.yapson.net`
- **Icash Module** - `https://connect.i-cashci.net/`
- **Supercash Module** - `https://connect.supercash.net`
- **1xstore Module** - `https://connect.1xstore.org`
- **Africash Module** - `https://connect.africash.io`
- **Cenof Module** - `https://connect.cenof.finance`
- **Fastxof Module** - `https://connect.fastxof.com`
- **Slater Module** - `https://connect.slaterci.net`
- **Zefast Module** - `https://connect.zefast.net`
- **Turaincash Module** - `https://connect.turaincash.com`
- **Cashika Module** - `https://connect.cashika.net/`

## ⚙️ Variables de Configuration

### Branding

| Variable | Description | Exemple |
|----------|-------------|---------|
| `NEXT_PUBLIC_APP_NAME` | Nom de l'application | "Cashika Module" |
| `NEXT_PUBLIC_APP_SHORT_NAME` | Initiales (pour le logo) | "C" |
| `NEXT_PUBLIC_APP_TITLE` | Titre de la page | "Cashika Module - Admin Dashboard" |
| `NEXT_PUBLIC_APP_DESCRIPTION` | Description | "Professional admin dashboard..." |
| `NEXT_PUBLIC_APP_LOGO_URL` | Chemin du logo | "/cashika.png" |

### API

| Variable | Description | Exemple |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | URL de l'API backend | "https://connect.cashika.net/" |

### Couleurs

| Variable | Description | Format |
|----------|-------------|--------|
| `NEXT_PUBLIC_PRIMARY_COLOR` | Couleur principale | HSL: "221 83% 53%" |
| `NEXT_PUBLIC_STAT_CARD_*` | Couleurs des cartes statistiques | HEX: "#772014" |
| `NEXT_PUBLIC_CHART_*` | Couleurs des graphiques | HSL: "142 100% 33%" |

### Feature Flags

Activez ou désactivez des fonctionnalités entières :

```bash
NEXT_PUBLIC_ENABLE_USERS="true"
NEXT_PUBLIC_ENABLE_TRANSACTIONS="true"
NEXT_PUBLIC_ENABLE_COUNTRY="true"
NEXT_PUBLIC_ENABLE_NETWORK="true"
NEXT_PUBLIC_ENABLE_NETWORK_CONFIG="true"
NEXT_PUBLIC_ENABLE_PHONE_NUMBERS="true"
NEXT_PUBLIC_ENABLE_DEVICES="true"
NEXT_PUBLIC_ENABLE_SMS_LOGS="true"
NEXT_PUBLIC_ENABLE_FCM_LOGS="true"
NEXT_PUBLIC_ENABLE_PARTNER="true"
NEXT_PUBLIC_ENABLE_TOPUP="true"
NEXT_PUBLIC_ENABLE_EARNING_MANAGEMENT="true"
NEXT_PUBLIC_ENABLE_WAVE_BUSINESS="true"
NEXT_PUBLIC_ENABLE_MOMO_PAY="true"
NEXT_PUBLIC_ENABLE_REMOTE_COMMAND="true"
NEXT_PUBLIC_ENABLE_TRANSACTION_LOGS="true"
NEXT_PUBLIC_ENABLE_PROFILE="true"
```

## 🔧 Comment ça fonctionne

### 1. Configuration Centralisée (`lib/config.ts`)

Toutes les variables d'environnement sont importées et centralisées :

```typescript
export const CONFIG = {
  APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || "Flashpay Module",
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "https://connect.yapson.net",
  FEATURES: {
    USERS: process.env.NEXT_PUBLIC_ENABLE_USERS !== "false",
    // ...
  }
}
```

### 2. Navigation avec Feature Flags (`lib/navigation.ts`)

Chaque élément de navigation est associé à un feature flag :

```typescript
export const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: Home, feature: null },
  { href: "/dashboard/users", label: "Users", icon: Users, feature: "USERS" },
  // ...
]
```

### 3. Filtrage Automatique

Le sidebar filtre automatiquement les éléments selon les feature flags :

```typescript
const filteredNavigationItems = navItems.filter(item => {
  if (item.feature === null) return true
  return CONFIG.FEATURES[item.feature]
})
```

### 4. Protection des Routes

Le layout du dashboard empêche l'accès aux pages désactivées :

```typescript
useEffect(() => {
  const currentItem = navItems.find(item => pathname === item.href)
  if (currentItem?.feature && !CONFIG.FEATURES[currentItem.feature]) {
    router.push("/dashboard")
  }
}, [pathname])
```

### 5. Injection Dynamique des Couleurs

Les couleurs sont injectées dans les variables CSS au runtime :

```typescript
<style dangerouslySetInnerHTML={{
  __html: `
    :root {
      --primary: ${CONFIG.PRIMARY_COLOR};
      --chart-1: ${CONFIG.CHART_1};
      // ...
    }
  `
}} />
```

## 🎨 Personnalisation des Couleurs

### Format HSL pour Tailwind

Les couleurs principales utilisent le format HSL pour Tailwind :

```bash
NEXT_PUBLIC_PRIMARY_COLOR="221 83% 53%"  # Bleu
```

### Format HEX pour les cartes

Les couleurs des cartes statistiques utilisent le format HEX :

```bash
NEXT_PUBLIC_STAT_CARD_RUST="#772014"
NEXT_PUBLIC_STAT_CARD_ORANGE="#D97706"
```

## 📦 Déploiement

### Pour un nouveau projet

1. Créer un nouveau fichier `.env.production`
2. Copier la configuration du projet depuis `env.template`
3. Ajouter le logo dans `/public`
4. Build et déployer :

```bash
npm run build
npm start
```

### Variables d'environnement sur Vercel/Netlify

Ajoutez toutes les variables `NEXT_PUBLIC_*` dans les paramètres de votre plateforme de déploiement.

## ✨ Avantages

✅ **Une seule base de code** pour tous les projets  
✅ **Personnalisation facile** via variables d'environnement  
✅ **Feature flags** pour activer/désactiver des fonctionnalités  
✅ **Branding dynamique** (couleurs, logos, noms)  
✅ **Maintenance simplifiée** - un bug fix profite à tous les projets  
✅ **Protection des routes** automatique  
✅ **Type-safe** avec TypeScript  

## 🔍 Utilisation dans le Code

### Importer la configuration

```typescript
import { CONFIG } from "@/lib/config"

// Utiliser les valeurs
const appName = CONFIG.APP_NAME
const apiUrl = CONFIG.API_BASE_URL
```

### Vérifier un feature flag

```typescript
if (CONFIG.FEATURES.USERS) {
  // Afficher la fonctionnalité utilisateurs
}
```

### Utiliser les couleurs

Les couleurs sont automatiquement disponibles via les variables CSS :

```css
.my-element {
  background-color: hsl(var(--primary));
  color: var(--stat-card-rust);
}
```

## 🐛 Dépannage

### Les couleurs ne s'appliquent pas

Vérifiez que les variables sont bien définies dans `.env.local` et que le serveur a été redémarré.

### Une page n'apparaît pas dans le menu

Vérifiez que le feature flag correspondant est activé dans `.env.local`.

### Le logo ne s'affiche pas

Vérifiez que :
1. Le fichier existe dans `/public`
2. Le chemin dans `NEXT_PUBLIC_APP_LOGO_URL` est correct
3. Le nom du fichier correspond exactement

## 📝 Notes

- Les variables `NEXT_PUBLIC_*` sont exposées côté client
- Redémarrez le serveur après modification des variables d'environnement
- Le fichier `.env.local` ne doit jamais être versionné (déjà dans `.gitignore`)

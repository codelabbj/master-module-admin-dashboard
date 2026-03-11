# Master Module Admin Dashboard 🚀

> Tableau de bord administrateur multi-projets avec système de configuration centralisé

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8)](https://tailwindcss.com/)

## ✨ Caractéristiques

- 🎨 **Multi-Projets** : Une seule base de code pour 11 projets différents
- 🔧 **Configuration Centralisée** : Changez de projet en modifiant simplement `.env.local`
- 🎯 **Feature Flags** : Activez/désactivez des fonctionnalités entières
- 🌈 **Branding Dynamique** : Couleurs, logos et noms personnalisables
- 🛡️ **Protection des Routes** : Contrôle d'accès automatique basé sur les feature flags
- 📱 **Responsive** : Interface adaptée mobile et desktop
- 🌙 **Dark Mode** : Support du mode sombre
- 🌍 **Multi-Langue** : Support Français/Anglais
- ⚡ **Performance** : Optimisé avec Next.js 14

## 🚀 Démarrage Rapide

```bash
# 1. Cloner le projet
git clone <repository-url>
cd master-module-admin-dashboard

# 2. Installer les dépendances
npm install

# 3. Créer le fichier de configuration
cp .env.local.example .env.local

# 4. Lancer le serveur de développement
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) 🎉

**📖 Guide détaillé** : Voir [QUICK_START.md](./QUICK_START.md)

## 📋 Projets Supportés

| Projet | URL | Statut |
|--------|-----|--------|
| 🔵 Cashika | `connect.cashika.net` | ✅ Actif par défaut |
| 🟢 Zefast | `connect.zefast.net` | ✅ Disponible |
| 🟡 Icash | `connect.i-cashci.net` | ✅ Disponible |
| 🟠 Supercash | `connect.supercash.net` | ✅ Disponible |
| 🔴 1xstore | `connect.1xstore.org` | ✅ Disponible |
| 🟣 Africash | `connect.africash.io` | ✅ Disponible |
| 🟢 Cenof | `connect.cenof.finance` | ✅ Disponible |
| 🟡 Fastxof | `connect.fastxof.com` | ✅ Disponible |
| 🔵 Slater | `connect.slaterci.net` | ✅ Disponible |
| 🟠 Turaincash | `connect.turaincash.com` | ✅ Disponible |
| ⚪ Flashpay | `connect.yapson.net` | ✅ Disponible |

## 🎯 Fonctionnalités

### Gestion Complète
- 👥 **Utilisateurs** : Inscription, liste, gestion
- 💳 **Transactions** : Suivi et gestion des transactions
- 🌍 **Pays** : Configuration des pays supportés
- 🔗 **Réseaux** : Gestion des réseaux de paiement
- ⚙️ **Configuration Réseau** : Paramètres avancés
- 📱 **Numéros de Téléphone** : Gestion des numéros
- 💻 **Appareils** : Suivi des appareils connectés
- 📨 **Logs SMS** : Historique des SMS
- 🔔 **Logs FCM** : Notifications push
- 🤝 **Partenaires** : Gestion des partenaires
- 💰 **Recharge** : Système de recharge
- 📊 **Gestion des Gains** : Suivi des revenus
- 🌊 **Wave Business** : Intégration Wave
- 📱 **MoMo Pay** : Intégration Mobile Money
- ⚡ **Commandes à Distance** : Contrôle à distance
- 📝 **Logs de Transactions** : Historique détaillé
- 👤 **Profil** : Gestion du profil utilisateur

### Chaque fonctionnalité peut être activée/désactivée individuellement ! 🎛️

## 🔧 Configuration

### Variables Principales

```bash
# Branding
NEXT_PUBLIC_APP_NAME="Cashika Module"
NEXT_PUBLIC_APP_SHORT_NAME="C"
NEXT_PUBLIC_APP_LOGO_URL="/cashika.png"

# API
NEXT_PUBLIC_API_BASE_URL=https://connect.cashika.net/

# Couleurs (HSL)
NEXT_PUBLIC_PRIMARY_COLOR="221 83% 53%"
```

### Feature Flags

```bash
# Activer/Désactiver des fonctionnalités
NEXT_PUBLIC_ENABLE_USERS="true"
NEXT_PUBLIC_ENABLE_TRANSACTIONS="true"
NEXT_PUBLIC_ENABLE_COUNTRY="true"
# ... et 14 autres !
```

**📖 Documentation complète** : Voir [CONFIGURATION.md](./CONFIGURATION.md)

## 📁 Structure du Projet

```
master-module-admin-dashboard/
├── app/                          # Pages Next.js
│   ├── dashboard/               # Pages du dashboard
│   ├── layout.tsx               # Layout principal (injection couleurs)
│   └── page.tsx                 # Page d'accueil
├── components/                   # Composants React
│   ├── auth/                    # Composants d'authentification
│   ├── layout/                  # Layout (Sidebar, Header)
│   ├── providers/               # Context providers
│   └── ui/                      # Composants UI réutilisables
├── lib/                         # Utilitaires et configuration
│   ├── config.ts               # ⭐ Configuration centralisée
│   ├── navigation.ts           # ⭐ Navigation avec feature flags
│   ├── useApi.ts               # Hook API
│   └── utils.ts                # Utilitaires
├── public/                      # Assets statiques (logos)
├── env.template                 # ⭐ Template de configuration
├── .env.local.example          # Exemple de configuration
├── CONFIGURATION.md            # 📖 Documentation complète
├── QUICK_START.md              # 🚀 Guide de démarrage
├── IMPLEMENTATION_SUMMARY.md   # 📊 Résumé technique
└── README.md                   # Ce fichier
```

## 🛠️ Technologies

- **Framework** : [Next.js 14](https://nextjs.org/) (App Router)
- **Language** : [TypeScript](https://www.typescriptlang.org/)
- **Styling** : [Tailwind CSS](https://tailwindcss.com/)
- **UI Components** : [shadcn/ui](https://ui.shadcn.com/)
- **Icons** : [Lucide React](https://lucide.dev/)
- **State Management** : React Hooks
- **API Client** : Fetch API avec refresh token automatique

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [QUICK_START.md](./QUICK_START.md) | Guide de démarrage rapide (3 minutes) |
| [CONFIGURATION.md](./CONFIGURATION.md) | Documentation complète de configuration |
| [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) | Résumé technique de l'implémentation |
| [env.template](./env.template) | Template avec toutes les configurations |

## 🎨 Personnalisation

### Changer de Projet

1. Ouvrir `.env.local`
2. Commenter le projet actuel
3. Décommenter le projet souhaité
4. Redémarrer le serveur

### Personnaliser les Couleurs

Utilisez [HSL Picker](https://hslpicker.com/) pour choisir vos couleurs :

```bash
NEXT_PUBLIC_PRIMARY_COLOR="221 83% 53%"  # Format: "H S% L%"
```

### Désactiver une Fonctionnalité

```bash
NEXT_PUBLIC_ENABLE_WAVE_BUSINESS="false"
```

La fonctionnalité disparaît automatiquement du menu ! ✨

## 🚀 Déploiement

### Vercel (Recommandé)

```bash
# 1. Push sur GitHub
git push origin main

# 2. Importer sur Vercel
# 3. Ajouter les variables d'environnement
# 4. Deploy !
```

### Build Local

```bash
npm run build
npm start
```

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 Scripts Disponibles

```bash
npm run dev          # Démarrer en développement
npm run build        # Build pour production
npm start            # Démarrer en production
npm run lint         # Linter le code
```

## 🐛 Dépannage

### Les couleurs ne s'appliquent pas
- Redémarrez le serveur après modification de `.env.local`
- Videz le cache du navigateur (`Ctrl+Shift+R`)

### Une page n'apparaît pas
- Vérifiez que le feature flag est activé dans `.env.local`
- Exemple : `NEXT_PUBLIC_ENABLE_USERS="true"`

### Le logo ne s'affiche pas
- Vérifiez que le fichier existe dans `/public`
- Vérifiez le chemin dans `NEXT_PUBLIC_APP_LOGO_URL`

**Plus d'aide** : Voir [CONFIGURATION.md](./CONFIGURATION.md)

## 📄 Licence

Ce projet est sous licence privée.

## 👥 Auteurs

Développé avec ❤️ pour gérer plusieurs projets avec une seule base de code.

---

## 🎯 Avantages du Système

✅ **Une seule base de code** pour tous les projets  
✅ **Maintenance simplifiée** - un bug fix profite à tous  
✅ **Déploiement rapide** de nouveaux projets  
✅ **Personnalisation facile** via variables d'environnement  
✅ **Type-safe** avec TypeScript  
✅ **Feature flags** pour contrôler les fonctionnalités  
✅ **Protection automatique** des routes  

---

**🚀 Prêt à démarrer ?** Consultez le [QUICK_START.md](./QUICK_START.md) !

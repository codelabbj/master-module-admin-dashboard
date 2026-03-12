# 🚀 Guide de Démarrage Rapide

## En 3 Minutes Chrono ⏱️

### 1. Créer votre fichier de configuration

```bash
cp .env.local.example .env.local
```

### 2. C'est tout ! 🎉

Le projet est déjà configuré pour **Cashika Module**. Lancez simplement :

```bash
npm install
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

---

## Changer de Projet en 30 Secondes ⚡

### Option 1 : Édition Manuelle

1. Ouvrez `.env.local`
2. Commentez la section Cashika (ajoutez `#` devant chaque ligne)
3. Décommentez le projet souhaité (retirez `#`)
4. Redémarrez le serveur (`Ctrl+C` puis `npm run dev`)

### Option 2 : Copier-Coller Rapide

Ouvrez `env.template`, copiez la section du projet souhaité, et collez-la dans `.env.local`.

---

## Exemples de Configuration Rapide

### Zefast Module 🚀

```bash
NEXT_PUBLIC_API_BASE_URL=https://connect.zefast.net
NEXT_PUBLIC_APP_NAME="Zefast Module"
NEXT_PUBLIC_APP_SHORT_NAME="ZM"
NEXT_PUBLIC_APP_TITLE="Zefast Module - Admin Dashboard"
NEXT_PUBLIC_APP_DESCRIPTION="Professional admin dashboard for Zefast Module"
NEXT_PUBLIC_PRIMARY_COLOR="25 95% 53%"
NEXT_PUBLIC_APP_LOGO_URL="/zefast.png"
```

### Icash Module 💰

```bash
NEXT_PUBLIC_API_BASE_URL=https://connect.i-cashci.net/
NEXT_PUBLIC_APP_NAME="Icash Module"
NEXT_PUBLIC_APP_SHORT_NAME="I"
NEXT_PUBLIC_APP_TITLE="Icash Module - Admin Dashboard"
NEXT_PUBLIC_APP_DESCRIPTION="Professional admin dashboard for Icash Module"
NEXT_PUBLIC_PRIMARY_COLOR="50 100% 40%"
NEXT_PUBLIC_APP_LOGO_URL="/icash.png"
```

### Africash Module 🌍

```bash
NEXT_PUBLIC_API_BASE_URL=https://connect.africash.io
NEXT_PUBLIC_APP_NAME="Africash Module"
NEXT_PUBLIC_APP_SHORT_NAME="A"
NEXT_PUBLIC_APP_TITLE="Africash Module - Admin Dashboard"
NEXT_PUBLIC_APP_DESCRIPTION="Professional admin dashboard for Africash Module"
NEXT_PUBLIC_PRIMARY_COLOR="270 70% 55%"
NEXT_PUBLIC_APP_LOGO_URL="/africash.png"
```

---

## Désactiver une Fonctionnalité en 5 Secondes 🔧

Dans `.env.local`, changez `"true"` en `"false"` :

```bash
# Désactiver la gestion des utilisateurs
NEXT_PUBLIC_ENABLE_USERS="false"

# Désactiver les transactions
NEXT_PUBLIC_ENABLE_TRANSACTIONS="false"

# Désactiver Wave Business
NEXT_PUBLIC_ENABLE_WAVE_BUSINESS="false"
```

Redémarrez le serveur et la fonctionnalité disparaît du menu ! ✨

---

## Personnaliser les Couleurs en 10 Secondes 🎨

### Couleur Principale (format HSL)

```bash
# Bleu
NEXT_PUBLIC_PRIMARY_COLOR="221 83% 53%"

# Vert
NEXT_PUBLIC_PRIMARY_COLOR="142 100% 33%"

# Orange
NEXT_PUBLIC_PRIMARY_COLOR="25 95% 53%"

# Violet
NEXT_PUBLIC_PRIMARY_COLOR="270 70% 55%"
```

### Trouver une Couleur HSL

1. Allez sur [https://hslpicker.com/](https://hslpicker.com/)
2. Choisissez votre couleur
3. Copiez les valeurs H, S, L (sans les unités)
4. Format : `"H S% L%"` → Exemple : `"221 83% 53%"`

---

## Ajouter un Logo en 20 Secondes 🖼️

1. Placez votre logo dans `/public/mon-logo.png`
2. Dans `.env.local` :

```bash
NEXT_PUBLIC_APP_LOGO_URL="/mon-logo.png"
```

3. Redémarrez le serveur

---

## Checklist de Démarrage ✅

- [ ] Fichier `.env.local` créé
- [ ] Projet sélectionné dans `.env.local`
- [ ] Logo ajouté dans `/public` (si nécessaire)
- [ ] Serveur lancé avec `npm run dev`
- [ ] Page ouverte sur [http://localhost:3000](http://localhost:3000)
- [ ] Connexion testée

---

## Projets Disponibles 📋

| Projet | URL API | Logo |
|--------|---------|------|
| Flashpay | `https://connect.yapson.net` | `/logo.png` |
| Icash | `https://connect.i-cashci.net/` | `/icash.png` |
| Supercash | `https://connect.supercash.net` | `/supercash.png` |
| 1xstore | `https://connect.1xstore.org` | `/1xstore.png` |
| Africash | `https://connect.africash.io` | `/africash.png` |
| Cenof | `https://connect.cenof.finance` | `/cenof.png` |
| Fastxof | `https://connect.fastxof.com` | `/fastxof.png` |
| Slater | `https://connect.slaterci.net` | `/slater.png` |
| Zefast | `https://connect.zefast.net` | `/zefast.png` |
| Turaincash | `https://connect.turaincash.com` | `/turaincash.png` |
| Cashika | `https://connect.cashika.net/` | `/cashika.png` |

---

## Problèmes Courants 🔧

### Le serveur ne démarre pas

```bash
# Réinstaller les dépendances
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Les couleurs ne changent pas

1. Vérifiez que `.env.local` contient bien la variable
2. Redémarrez le serveur (important !)
3. Videz le cache du navigateur (`Ctrl+Shift+R`)

### Le logo ne s'affiche pas

1. Vérifiez que le fichier existe dans `/public`
2. Vérifiez le nom exact (sensible à la casse)
3. Redémarrez le serveur

### Une page n'apparaît pas dans le menu

Vérifiez que le feature flag est activé dans `.env.local` :

```bash
NEXT_PUBLIC_ENABLE_USERS="true"  # ✅ Activé
NEXT_PUBLIC_ENABLE_USERS="false" # ❌ Désactivé
```

---

## Commandes Utiles 💻

```bash
# Démarrer en développement
npm run dev

# Build pour production
npm run build

# Démarrer en production
npm start

# Linter
npm run lint

# Vérifier les types TypeScript
npx tsc --noEmit
```

---

## Besoin d'Aide ? 📚

- **Documentation complète** : Voir `CONFIGURATION.md`
- **Résumé technique** : Voir `IMPLEMENTATION_SUMMARY.md`
- **Template complet** : Voir `env.template`

---

## Déploiement Rapide 🚀

### Vercel

1. Push votre code sur GitHub
2. Connectez votre repo sur [vercel.com](https://vercel.com)
3. Ajoutez les variables d'environnement dans les settings
4. Deploy !

### Netlify

1. Push votre code sur GitHub
2. Connectez votre repo sur [netlify.com](https://netlify.com)
3. Build command : `npm run build`
4. Publish directory : `.next`
5. Ajoutez les variables d'environnement
6. Deploy !

---

## C'est Parti ! 🎉

Vous êtes prêt à utiliser le système multi-projets. Bon développement ! 💪

**Astuce** : Gardez `env.template` comme référence pour voir toutes les configurations disponibles.

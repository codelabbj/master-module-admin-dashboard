# Guide de Migration

## 🔄 Migrer un Nouveau Projet vers ce Système

Ce guide vous aide à intégrer un nouveau projet dans le système multi-projets.

---

## 📋 Checklist de Migration

- [ ] Obtenir les informations du projet
- [ ] Ajouter la configuration dans `env.template`
- [ ] Ajouter le logo dans `/public`
- [ ] Tester la configuration
- [ ] Documenter les spécificités

---

## 1️⃣ Collecter les Informations

Avant de commencer, rassemblez ces informations :

### Informations Requises

| Information | Exemple | Où la trouver ? |
|-------------|---------|-----------------|
| URL de l'API | `https://connect.monprojet.com` | Backend team |
| Nom du projet | "MonProjet Module" | Product owner |
| Nom court | "MP" | Créer des initiales |
| Couleur principale | `#3B82F6` | Design team |
| Logo | `logo.png` | Design team |

### Informations Optionnelles

- Titre de la page
- Description
- Couleurs des cartes statistiques
- Couleurs des graphiques
- Feature flags spécifiques

---

## 2️⃣ Convertir les Couleurs

### De HEX vers HSL

Si vous avez une couleur en HEX (ex: `#3B82F6`), convertissez-la en HSL :

#### Méthode 1 : Outil en Ligne
1. Allez sur [https://hslpicker.com/](https://hslpicker.com/)
2. Entrez votre couleur HEX
3. Copiez les valeurs H, S, L
4. Format : `"H S% L%"` → Exemple : `"221 83% 53%"`

#### Méthode 2 : DevTools
1. Ouvrez les DevTools du navigateur (F12)
2. Allez dans l'onglet "Elements"
3. Cliquez sur un carré de couleur
4. Changez le format en HSL
5. Copiez les valeurs

#### Méthode 3 : Calculateur
```javascript
// Convertir HEX en HSL
function hexToHSL(hex) {
  // Retirer le #
  hex = hex.replace('#', '');
  
  // Convertir en RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  
  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  
  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);
  
  return `${h} ${s}% ${l}%`;
}

// Exemple
console.log(hexToHSL('#3B82F6')); // "221 83% 53%"
```

---

## 3️⃣ Ajouter la Configuration

### Dans `env.template`

Ajoutez votre configuration à la fin du fichier :

```bash
# MONPROJET MODULE
# NEXT_PUBLIC_API_BASE_URL=https://connect.monprojet.com
# NEXT_PUBLIC_APP_NAME="MonProjet Module"
# NEXT_PUBLIC_APP_SHORT_NAME="MP"
# NEXT_PUBLIC_APP_TITLE="MonProjet Module - Admin Dashboard"
# NEXT_PUBLIC_APP_DESCRIPTION="Professional admin dashboard for MonProjet Module"
# NEXT_PUBLIC_PRIMARY_COLOR="221 83% 53%"
# NEXT_PUBLIC_APP_LOGO_URL="/monprojet.png"
```

### Ordre Recommandé

Gardez l'ordre alphabétique pour faciliter la recherche :
1. 1xstore
2. Africash
3. Cashika
4. Cenof
5. Fastxof
6. Flashpay
7. Icash
8. **MonProjet** ← Votre nouveau projet
9. Slater
10. Supercash
11. Turaincash
12. Zefast

---

## 4️⃣ Préparer le Logo

### Format Recommandé

- **Format** : PNG avec fond transparent
- **Taille** : 512x512px minimum
- **Poids** : < 100KB
- **Nom** : `monprojet.png` (minuscules, sans espaces)

### Optimiser le Logo

```bash
# Avec ImageMagick
convert logo-original.png -resize 512x512 -quality 85 monprojet.png

# Avec pngquant (compression)
pngquant --quality=80-95 monprojet.png
```

### Placer le Logo

```bash
cp monprojet.png master-module-admin-dashboard/public/
```

---

## 5️⃣ Tester la Configuration

### Créer un Fichier de Test

```bash
# Créer .env.local avec votre configuration
cat > .env.local << 'EOF'
NEXT_PUBLIC_API_BASE_URL=https://connect.monprojet.com
NEXT_PUBLIC_APP_NAME="MonProjet Module"
NEXT_PUBLIC_APP_SHORT_NAME="MP"
NEXT_PUBLIC_APP_TITLE="MonProjet Module - Admin Dashboard"
NEXT_PUBLIC_APP_DESCRIPTION="Professional admin dashboard for MonProjet Module"
NEXT_PUBLIC_PRIMARY_COLOR="221 83% 53%"
NEXT_PUBLIC_APP_LOGO_URL="/monprojet.png"

# Feature flags (tous activés par défaut)
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

# Couleurs des cartes
NEXT_PUBLIC_STAT_CARD_RUST="#772014"
NEXT_PUBLIC_STAT_CARD_ORANGE="#D97706"
NEXT_PUBLIC_STAT_CARD_DARK="#0F110C"
NEXT_PUBLIC_STAT_CARD_AMBER="#F59E0B"
NEXT_PUBLIC_STAT_CARD_EMERALD="#047857"
NEXT_PUBLIC_STAT_CARD_PURPLE="#7C3AED"
NEXT_PUBLIC_STAT_CARD_ROSE="#E11D48"
NEXT_PUBLIC_STAT_CARD_CYAN="#0891B2"

# Couleurs des graphiques
NEXT_PUBLIC_CHART_1="221 83% 53%"
NEXT_PUBLIC_CHART_2="160 84% 39%"
NEXT_PUBLIC_CHART_3="173 58% 39%"
NEXT_PUBLIC_CHART_4="197 37% 24%"
NEXT_PUBLIC_CHART_5="220 9% 46%"
EOF
```

### Lancer le Serveur

```bash
npm run dev
```

### Vérifications

- [ ] Le nom du projet s'affiche correctement
- [ ] Le logo s'affiche dans le sidebar
- [ ] La couleur principale est appliquée
- [ ] Les initiales apparaissent dans l'icône
- [ ] Le titre de la page est correct
- [ ] L'API se connecte (tester la connexion)

---

## 6️⃣ Personnaliser les Feature Flags

### Identifier les Fonctionnalités Nécessaires

Demandez-vous pour chaque fonctionnalité :
- Est-elle utilisée dans ce projet ?
- Est-elle prête côté backend ?
- Doit-elle être visible pour les utilisateurs ?

### Désactiver les Fonctionnalités Inutiles

```bash
# Exemple : Désactiver Wave Business et MoMo Pay
NEXT_PUBLIC_ENABLE_WAVE_BUSINESS="false"
NEXT_PUBLIC_ENABLE_MOMO_PAY="false"
```

### Créer un Profil de Configuration

Documentez les feature flags spécifiques à votre projet :

```markdown
## MonProjet - Feature Flags

### Activés
- Users
- Transactions
- Country
- Network
- Phone Numbers
- Devices

### Désactivés
- Wave Business (non supporté)
- MoMo Pay (non supporté)
- Remote Command (pas encore implémenté)
```

---

## 7️⃣ Personnaliser les Couleurs (Optionnel)

### Couleurs des Cartes Statistiques

Si votre projet a une charte graphique spécifique :

```bash
# Couleurs personnalisées
NEXT_PUBLIC_STAT_CARD_RUST="#8B0000"    # Rouge foncé
NEXT_PUBLIC_STAT_CARD_ORANGE="#FF8C00"  # Orange vif
NEXT_PUBLIC_STAT_CARD_EMERALD="#00A86B" # Vert émeraude
```

### Couleurs des Graphiques

Harmonisez avec votre couleur principale :

```bash
# Variations de la couleur principale
NEXT_PUBLIC_CHART_1="221 83% 53%"  # Couleur principale
NEXT_PUBLIC_CHART_2="221 83% 63%"  # Plus clair
NEXT_PUBLIC_CHART_3="221 83% 43%"  # Plus foncé
NEXT_PUBLIC_CHART_4="221 70% 53%"  # Moins saturé
NEXT_PUBLIC_CHART_5="221 95% 53%"  # Plus saturé
```

---

## 8️⃣ Documenter le Projet

### Créer une Fiche Projet

Créez un fichier `docs/projects/monprojet.md` :

```markdown
# MonProjet Module

## Informations

- **URL API** : https://connect.monprojet.com
- **Environnement** : Production
- **Contact Backend** : backend@monprojet.com
- **Contact Design** : design@monprojet.com

## Configuration

### Couleurs
- **Principale** : #3B82F6 (Bleu)
- **HSL** : 221 83% 53%

### Feature Flags
- Wave Business : ❌ Désactivé
- MoMo Pay : ❌ Désactivé
- Autres : ✅ Activés

## Notes Spécifiques

- Le logo doit avoir un fond transparent
- La couleur principale est utilisée pour tous les boutons
- Les graphiques utilisent des variations de bleu

## Déploiement

- **URL Production** : https://admin.monprojet.com
- **URL Staging** : https://staging-admin.monprojet.com
```

---

## 9️⃣ Déployer

### Variables d'Environnement

Sur votre plateforme de déploiement (Vercel, Netlify, etc.), ajoutez toutes les variables :

```bash
NEXT_PUBLIC_API_BASE_URL=https://connect.monprojet.com
NEXT_PUBLIC_APP_NAME="MonProjet Module"
NEXT_PUBLIC_APP_SHORT_NAME="MP"
NEXT_PUBLIC_APP_TITLE="MonProjet Module - Admin Dashboard"
NEXT_PUBLIC_APP_DESCRIPTION="Professional admin dashboard for MonProjet Module"
NEXT_PUBLIC_PRIMARY_COLOR="221 83% 53%"
NEXT_PUBLIC_APP_LOGO_URL="/monprojet.png"

# + Toutes les autres variables (feature flags, couleurs)
```

### Build et Test

```bash
# Build local
npm run build

# Test du build
npm start

# Vérifier que tout fonctionne
```

---

## 🔟 Maintenance

### Mettre à Jour la Configuration

Quand vous devez changer quelque chose :

1. Modifier `.env.local` (local)
2. Tester les changements
3. Mettre à jour `env.template` (pour la documentation)
4. Déployer avec les nouvelles variables

### Ajouter une Nouvelle Fonctionnalité

1. Ajouter le feature flag dans `lib/config.ts`
2. Ajouter l'élément dans `lib/navigation.ts`
3. Ajouter la variable dans `env.template`
4. Documenter dans `CONFIGURATION.md`

---

## ✅ Checklist Finale

Avant de considérer la migration terminée :

- [ ] Configuration ajoutée dans `env.template`
- [ ] Logo ajouté dans `/public`
- [ ] Couleurs converties en HSL
- [ ] Feature flags configurés
- [ ] Tests effectués en local
- [ ] Documentation créée
- [ ] Variables ajoutées sur la plateforme de déploiement
- [ ] Build réussi
- [ ] Déploiement effectué
- [ ] Tests en production

---

## 🆘 Problèmes Courants

### Le logo ne s'affiche pas

```bash
# Vérifier que le fichier existe
ls -la public/monprojet.png

# Vérifier les permissions
chmod 644 public/monprojet.png

# Vérifier le chemin dans .env.local
echo $NEXT_PUBLIC_APP_LOGO_URL
```

### Les couleurs ne s'appliquent pas

```bash
# Redémarrer le serveur
# Ctrl+C puis npm run dev

# Vider le cache du navigateur
# Ctrl+Shift+R
```

### L'API ne se connecte pas

```bash
# Vérifier l'URL
curl https://connect.monprojet.com/api/health

# Vérifier les CORS
# Demander au backend d'ajouter votre domaine
```

---

## 📞 Support

Si vous rencontrez des problèmes :

1. Consultez `CONFIGURATION.md`
2. Vérifiez `QUICK_START.md`
3. Comparez avec un projet existant
4. Contactez l'équipe technique

---

## 🎉 Félicitations !

Votre nouveau projet est maintenant intégré au système multi-projets ! 🚀

**Prochaines étapes** :
- Former l'équipe sur le système
- Documenter les spécificités du projet
- Planifier les prochaines fonctionnalités

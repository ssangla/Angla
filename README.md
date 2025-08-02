# Expanse - Application de Gestion des Dépenses pour Couple

Expanse est une application mobile moderne développée avec React Native (Expo) pour aider les couples à gérer leurs dépenses partagées de manière équitable basée sur leurs revenus.

## 🚀 Fonctionnalités

### Fonctionnalités Essentielles
- **Authentification simple** : Local, Google ou compte invité
- **Paramétrage des contributeurs** : Calcul automatique des taux de contribution basés sur les revenus
- **Ajout de dépenses** : Formulaire complet avec description, montant, catégorie et calcul instantané du partage
- **Historique des transactions** : Liste complète avec filtres par catégorie, date ou contributeur
- **Solde en temps réel** : Affichage des dettes et créances entre utilisateurs
- **Rapports visuels** : Graphiques de répartition des dépenses par catégorie
- **Gestion des remboursements** : Marquage des dépenses comme réglées

### Architecture Technique
- **Stack** : React Native avec Expo
- **Navigation** : React Navigation avec onglets
- **UI/UX** : Design moderne Fintech 2025 avec palette de couleurs soft
- **Pattern** : MVVM pour la maintenabilité
- **Tests** : Jest pour les tests unitaires

## 📱 Captures d'écran

L'application affiche "Expanse ready!" au premier lancement, puis présente :
- **Écran d'accueil** : Solde actuel, statistiques du mois, boutons d'action
- **Ajout de dépense** : Formulaire intuitif avec calcul automatique des parts
- **Historique** : Liste des dépenses avec statuts et actions
- **Navigation** : Onglets "Accueil", "Ajouter", "Historique"

## 🛠 Installation et Configuration

### Prérequis
- Node.js (version 16 ou supérieure)
- npm ou yarn
- Expo CLI
- Android Studio (pour Android) ou Xcode (pour iOS)

### Installation

1. **Cloner le repository**
```bash
git clone https://github.com/votre-username/expanse.git
cd expanse
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Lancer l'application**
```bash
# Démarrer le serveur de développement
npm start

# Ou directement sur une plateforme spécifique
npm run android
npm run ios
npm run web
```

### Structure du Projet
```
src/
├── components/          # Composants réutilisables
│   ├── BalanceCard.tsx
│   ├── ExpenseForm.tsx
│   └── ExpenseList.tsx
├── screens/            # Écrans de l'application
│   ├── HomeScreen.tsx
│   ├── AddExpenseScreen.tsx
│   └── HistoryScreen.tsx
├── services/           # Logique métier
│   └── ExpenseService.ts
├── models/             # Types et interfaces
│   └── types.ts
├── utils/              # Utilitaires et helpers
│   ├── calculations.ts
│   ├── colors.ts
│   └── __tests__/
└── assets/             # Images et ressources
```

## 🧪 Tests

### Lancer les tests
```bash
# Tests unitaires
npm test

# Tests en mode watch
npm run test:watch

# Tests avec couverture
npm test -- --coverage
```

### Exemple de test
```typescript
// Test du calcul de partage basé sur les revenus
const users = [
  { id: '1', name: 'Simon', income: 3000, contributionRate: 0 },
  { id: '2', name: 'André', income: 1250, contributionRate: 0 }
];

const result = calculateContributionRates(users);
// Simon: 70.59%, André: 29.41%
```

## 📊 Exemple de Calcul

Basé sur les revenus (selon Angla.xlsx) :
- **Simon** : 3000€ (70.65%)
- **André** : 1250€ (29.35%)

**Dépense** : Courses Carrefour - 150€ payé par Simon

**Résultat** :
- Simon doit : 105.98€ (70.65%)
- André doit : 44.02€ (29.35%)
- André doit à Simon : 44.02€

## 🎨 Design System

### Palette de Couleurs
- **Primaire** : Bleu foncé (#1a365d) avec dégradés
- **Secondaire** : Gris moderne (#37474f)
- **Catégories** : Couleurs pastels pour chaque type de dépense
- **Statuts** : Vert (succès), Orange (warning), Rouge (erreur)

### Composants UI
- **BalanceCard** : Affichage du solde avec dégradé
- **ExpenseForm** : Formulaire avec validation
- **ExpenseList** : Liste avec badges de catégorie
- **Navigation** : Onglets avec icônes Ionicons

## 📦 Publication

### Build pour Production
```bash
# Build pour Android
expo build:android

# Build pour iOS
expo build:ios

# Build pour Web
expo build:web
```

### Déploiement sur Firebase Hosting
```bash
# Installer Firebase CLI
npm install -g firebase-tools

# Login et initialisation
firebase login
firebase init hosting

# Build et déployer
npm run build
firebase deploy
```

### Déploiement sur GitHub Pages
```bash
# Build pour production
npm run build

# Déployer sur GitHub Pages
# Configurer dans Settings > Pages
```

## 🔧 Configuration

### Variables d'environnement
Créer un fichier `.env` :
```env
EXPO_PUBLIC_API_URL=your_api_url
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

### Configuration Expo
Le fichier `app.json` contient :
- Nom de l'application : "Expanse"
- Bundle ID : com.expanse.app
- Version : 1.0.0
- Orientation : Portrait
- Splash screen personnalisé

## 📈 Roadmap

### Version 1.1
- [ ] Synchronisation cloud avec Firebase
- [ ] Export PDF des rapports
- [ ] Notifications push
- [ ] Mode hors ligne

### Version 1.2
- [ ] Graphiques avancés avec Chart.js
- [ ] Import/Export CSV
- [ ] Rapports mensuels automatiques
- [ ] Partage de dépenses par WhatsApp

### Version 2.0
- [ ] Support multi-devices
- [ ] API REST complète
- [ ] Intégration bancaire
- [ ] Intelligence artificielle pour catégorisation

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👥 Auteurs

- **Votre Nom** - *Développement initial* - [VotreGitHub](https://github.com/votre-username)

## 🙏 Remerciements

- Expo pour l'écosystème React Native
- React Navigation pour la navigation
- Ionicons pour les icônes
- Date-fns pour la gestion des dates

---

**Expanse ready!** 🚀

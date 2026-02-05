export const APP_METADATA = {
  name: 'Expanse',
  version: '1.0.0',
  description: 'Application mobile de gestion des dépenses pour couple',
  author: 'Votre Nom',
  repository: 'https://github.com/votre-username/expanse',
  license: 'MIT',
  keywords: [
    'react-native',
    'expo',
    'expenses',
    'couple',
    'finance',
    'mobile-app'
  ],
  features: [
    'Gestion des dépenses partagées',
    'Calcul automatique des parts basé sur les revenus',
    'Historique des transactions',
    'Solde en temps réel',
    'Rapports visuels',
    'Gestion des remboursements'
  ],
  supportedPlatforms: ['ios', 'android', 'web'],
  minimumReactNativeVersion: '0.73.0',
  minimumExpoVersion: '50.0.0'
};

export const CALCULATION_EXAMPLE = {
  title: 'Exemple de calcul basé sur Angla.xlsx',
  description: 'Simon (3000€) et André (1250€) partagent une dépense de 150€',
  users: [
    { name: 'Simon', income: 3000, rate: 70.65 },
    { name: 'André', income: 1250, rate: 29.35 }
  ],
  expense: {
    description: 'Courses Carrefour',
    amount: 150,
    paidBy: 'Simon'
  },
  result: {
    simonShare: 105.98,
    andreShare: 44.02,
    balance: 'André doit 44.02€ à Simon'
  }
};
import { getExampleCalculation, calculateContributionRates, calculateExpenseShares } from './calculations';
import { User, ExpenseCategory } from '@/models/types';

/**
 * Exemple de calcul de partage des dépenses basé sur les revenus
 * Selon le fichier Angla.xlsx fourni
 */

export const demonstrateCalculation = () => {
  console.log('=== EXEMPLE DE CALCUL EXPANSE ===\n');

  // 1. Configuration des utilisateurs avec leurs revenus
  const users: User[] = [
    {
      id: '1',
      name: 'Simon',
      email: 'simon@example.com',
      income: 3000,
      contributionRate: 0
    },
    {
      id: '2',
      name: 'André',
      email: 'andre@example.com',
      income: 1250,
      contributionRate: 0
    }
  ];

  console.log('📊 REVENUS DES UTILISATEURS:');
  users.forEach(user => {
    console.log(`${user.name}: ${user.income}€`);
  });

  // 2. Calcul des taux de contribution
  const contributionSettings = calculateContributionRates(users);
  
  console.log('\n💰 TAUX DE CONTRIBUTION CALCULÉS:');
  contributionSettings.users.forEach(user => {
    console.log(`${user.name}: ${user.contributionRate.toFixed(2)}%`);
  });

  // 3. Exemple de dépense
  const expense = {
    description: 'Courses Carrefour',
    amount: 150,
    category: ExpenseCategory.COURSES,
    date: new Date('2024-01-15'),
    paidBy: '1', // Simon a payé
    sharedBy: ['1', '2'] // Les deux partagent
  };

  console.log('\n🛒 DÉPENSE EXEMPLE:');
  console.log(`Description: ${expense.description}`);
  console.log(`Montant: ${expense.amount}€`);
  console.log(`Payé par: ${users.find(u => u.id === expense.paidBy)?.name}`);
  console.log(`Partagé par: ${expense.sharedBy.map(id => users.find(u => u.id === id)?.name).join(', ')}`);

  // 4. Calcul des parts
  const shares = calculateExpenseShares(expense, contributionSettings.users);
  
  console.log('\n📋 RÉPARTITION DES PARTS:');
  shares.forEach(share => {
    const userName = users.find(u => u.id === share.userId)?.name;
    console.log(`${userName}: ${share.amount.toFixed(2)}€ (${share.percentage.toFixed(2)}%)`);
  });

  // 5. Calcul du solde
  const paidByUser = users.find(u => u.id === expense.paidBy);
  const andreShare = shares.find(s => s.userId === '2');
  
  console.log('\n💳 CALCUL DU SOLDE:');
  console.log(`${paidByUser?.name} a payé: ${expense.amount}€`);
  console.log(`${paidByUser?.name} doit: ${shares.find(s => s.userId === '1')?.amount.toFixed(2)}€`);
  console.log(`André doit: ${andreShare?.amount.toFixed(2)}€`);
  
  const balance = expense.amount - (shares.find(s => s.userId === '1')?.amount || 0);
  console.log(`\n🎯 RÉSULTAT: André doit ${balance.toFixed(2)}€ à Simon`);

  // 6. Utilisation de la fonction d'exemple
  console.log('\n🔧 UTILISATION DE LA FONCTION D\'EXEMPLE:');
  const example = getExampleCalculation();
  console.log(`Total revenus: ${example.totalIncome}€`);
  console.log(`Part Simon: ${example.simonShare.toFixed(2)}€`);
  console.log(`Part André: ${example.andreShare.toFixed(2)}€`);

  console.log('\n✅ CALCUL TERMINÉ - Expanse ready!');
};

// Exemple d'utilisation avec plusieurs dépenses
export const demonstrateMultipleExpenses = () => {
  console.log('\n=== EXEMPLE AVEC PLUSIEURS DÉPENSES ===\n');

  const users: User[] = [
    { id: '1', name: 'Simon', email: 'simon@example.com', income: 3000, contributionRate: 70.65 },
    { id: '2', name: 'André', email: 'andre@example.com', income: 1250, contributionRate: 29.35 }
  ];

  const expenses = [
    {
      description: 'Courses Carrefour',
      amount: 150,
      paidBy: '1'
    },
    {
      description: 'Restaurant Le Petit Bistrot',
      amount: 85,
      paidBy: '2'
    },
    {
      description: 'Essence',
      amount: 65,
      paidBy: '1'
    }
  ];

  console.log('📊 DÉPENSES DU MOIS:');
  expenses.forEach((expense, index) => {
    const paidBy = users.find(u => u.id === expense.paidBy)?.name;
    console.log(`${index + 1}. ${expense.description}: ${expense.amount}€ (payé par ${paidBy})`);
  });

  // Calcul des parts pour chaque dépense
  expenses.forEach(expense => {
    const shares = calculateExpenseShares({
      ...expense,
      category: ExpenseCategory.COURSES,
      date: new Date(),
      sharedBy: ['1', '2']
    }, users);

    console.log(`\n💰 ${expense.description}:`);
    shares.forEach(share => {
      const userName = users.find(u => u.id === share.userId)?.name;
      console.log(`  ${userName}: ${share.amount.toFixed(2)}€`);
    });
  });

  console.log('\n🎯 SOLDE FINAL:');
  console.log('Simon doit à André: 24.95€ (restaurant)');
  console.log('André doit à Simon: 44.02€ (courses) + 19.08€ (essence) = 63.10€');
  console.log('Résultat: André doit 38.15€ à Simon');
};

// Export pour utilisation dans l'application
export default {
  demonstrateCalculation,
  demonstrateMultipleExpenses
};
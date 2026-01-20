# CLAUDE.md - AI Assistant Guide for Expanse

> **Last Updated**: 2026-01-20
> **Project**: Expanse - Couple Expense Sharing App
> **Stack**: React Native (Expo SDK 50) + TypeScript

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Quick Start](#quick-start)
3. [Architecture Overview](#architecture-overview)
4. [Directory Structure](#directory-structure)
5. [Development Workflows](#development-workflows)
6. [Key Conventions](#key-conventions)
7. [Testing Guidelines](#testing-guidelines)
8. [Common Tasks](#common-tasks)
9. [Critical Notes for AI Assistants](#critical-notes-for-ai-assistants)

---

## 📱 Project Overview

**Expanse** is a React Native mobile application for couples to manage shared expenses fairly based on income ratios.

### Core Business Logic

The app calculates expense sharing using **income-based contribution rates**:

```typescript
// Example:
// Simon: 3000€ income (70.65%)
// André: 1250€ income (29.35%)
// Total: 4250€

// Expense: 150€ Courses paid by Simon
// → Simon owes: 105.98€ (70.65%)
// → André owes: 44.02€ (29.35%)
// → Balance: André owes Simon 44.02€
```

**Formula**:
```typescript
contributionRate = (userIncome / totalIncome) * 100
userShare = expenseAmount * (contributionRate / 100)
balance = amountPaid - userShare
```

### Tech Stack

- **Runtime**: Expo SDK 50 (React Native 0.73.6)
- **Language**: TypeScript 5.1.3 (strict mode enabled)
- **Navigation**: React Navigation v6 (nested tabs + stacks)
- **UI Components**: React Native Paper + Expo Linear Gradient
- **State Management**: Singleton Service Pattern (no Redux)
- **Data Layer**: In-memory storage (no persistence yet)
- **Testing**: Jest + jest-expo
- **Linting**: ESLint + Prettier

### Key Features

- Income-based contribution calculation
- Expense tracking with categories
- Real-time balance display
- Transaction history
- Settlement tracking
- French language UI

---

## 🚀 Quick Start

### Prerequisites

- Node.js 16+
- npm or yarn
- Expo CLI
- Android Studio (Android) or Xcode (iOS)

### Installation & Running

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on specific platform
npm run android
npm run ios
npm run web

# Run tests
npm test
npm run test:watch

# Linting
npm run lint
npm run lint:fix
```

### First-Time Setup

The app initializes with sample data on first load (see `ExpenseService.initializeWithSampleData()`).

---

## 🏗 Architecture Overview

### Pattern: MVVM-Inspired with Service Layer

```
┌─────────────────────────────────────────────────┐
│              App.tsx (Navigation)                │
│    NavigationContainer → Tab → Stack            │
└────────────────┬────────────────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
┌───────▼──────┐  ┌──────▼────────┐
│   Screens    │  │  Components   │
│ (UI Layer)   │◄─┤ (Reusable UI) │
└───────┬──────┘  └───────────────┘
        │
        │ Calls methods
        │
┌───────▼──────────────────────────┐
│    ExpenseService.ts             │
│    (Singleton Service)           │
│  - CRUD operations               │
│  - Business logic                │
│  - In-memory state               │
└───────┬──────────────────────────┘
        │
        │ Uses
        │
┌───────▼──────────────────────────┐
│    Utils (Pure Functions)        │
│  - calculations.ts               │
│  - colors.ts                     │
└──────────────────────────────────┘
```

### Navigation Structure

```
NavigationContainer
└── Tab.Navigator (Bottom Tabs)
    ├── HomeTab → Stack.Navigator
    │   ├── Home (HomeScreen)
    │   └── AddExpense (Modal)
    ├── AddTab → AddExpenseScreen
    └── HistoryTab → Stack.Navigator
        └── History (HistoryScreen)
```

### Data Flow

1. **Screens** import `ExpenseService` singleton
2. **Screens** call service methods (e.g., `addExpense()`, `getAllExpenses()`)
3. **Service** updates internal state arrays
4. **Screens** re-fetch data with `loadData()` pattern
5. **Service** uses **utils/calculations.ts** for business logic

### State Management

**No Redux/MobX** - Uses:
- `ExpenseService` singleton for data
- `useState` + `useEffect` in screens
- React Navigation state for navigation

---

## 📁 Directory Structure

```
/home/user/Angla/
├── App.tsx                  # Entry point, navigation setup
├── package.json             # Dependencies & scripts
├── tsconfig.json            # TypeScript config (strict mode)
├── app.json                 # Expo configuration
├── babel.config.js          # Babel + module resolver
├── jest.config.js           # Jest testing config
├── jest.setup.js            # Test mocks setup
├── .eslintrc.js             # ESLint rules
├── .prettierrc              # Code formatting rules
│
├── src/
│   ├── screens/             # App screens (3 files)
│   │   ├── HomeScreen.tsx           # Dashboard with balance
│   │   ├── AddExpenseScreen.tsx     # Add expense form
│   │   └── HistoryScreen.tsx        # Transaction history
│   │
│   ├── components/          # Reusable components (3 files)
│   │   ├── BalanceCard.tsx          # Balance display with gradient
│   │   ├── ExpenseForm.tsx          # Form with validation
│   │   └── ExpenseList.tsx          # Scrollable expense list
│   │
│   ├── services/            # Business logic
│   │   └── ExpenseService.ts        # Singleton CRUD service
│   │
│   ├── models/              # TypeScript types
│   │   └── types.ts                 # All interfaces & enums
│   │
│   ├── utils/               # Helper functions
│   │   ├── calculations.ts          # Core business logic (pure functions)
│   │   ├── colors.ts                # Design system colors
│   │   ├── example-calculation.ts   # Demo calculations
│   │   └── __tests__/
│   │       └── calculations.test.ts # Unit tests
│   │
│   ├── assets/              # Static resources
│   │   ├── metadata.ts              # App constants & sample data
│   │   ├── icon.png
│   │   ├── splash.png
│   │   └── adaptive-icon.png
│   │
│   └── pages/               # ⚠️ IGNORE - Astro static site (unrelated)
│
├── public/                  # ⚠️ IGNORE - Astro assets (unrelated)
└── netlify/                 # ⚠️ IGNORE - Netlify config (unrelated)
```

### ⚠️ Important: Dual Repository Nature

This repo contains **TWO separate apps**:
1. **Primary**: React Native Expo app (everything in `src/screens`, `src/components`, `src/services`, `App.tsx`)
2. **Secondary**: Astro static site (`src/pages/*.astro`, `public/`, `astro.config.mjs`)

**For React Native development, IGNORE all Astro files.**

---

## 🔧 Development Workflows

### Adding a New Screen

1. Create `src/screens/NewScreen.tsx`
2. Define props interface with navigation typing
3. Import using `@/` alias
4. Register in `App.tsx` navigation structure
5. Add to bottom tabs or stack navigator

**Template**:
```typescript
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '@/utils/colors';

interface NewScreenProps {
  navigation: any; // TODO: Use proper navigation types
}

const NewScreen: React.FC<NewScreenProps> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Content */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
});

export default NewScreen;
```

### Adding a New Component

1. Create `src/components/ComponentName.tsx`
2. Define props interface
3. Use StyleSheet.create() for styles
4. Import colors from `@/utils/colors`
5. Export as default

**Template**:
```typescript
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '@/utils/colors';

interface ComponentNameProps {
  // Props
}

const ComponentName: React.FC<ComponentNameProps> = (props) => {
  return (
    <View style={styles.container}>
      {/* Content */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Styles
  },
});

export default ComponentName;
```

### Adding Business Logic

1. For **pure calculations**: Add to `src/utils/calculations.ts`
2. For **data operations**: Add method to `ExpenseService`
3. Write unit tests in `src/utils/__tests__/`
4. Update TypeScript interfaces in `src/models/types.ts`

### Adding a New Expense Category

1. Update enum in `src/models/types.ts`:
   ```typescript
   export enum ExpenseCategory {
     LOGEMENT = 'logement',
     NEW_CATEGORY = 'new_category', // Add here
   }
   ```

2. Add color in `src/utils/colors.ts`:
   ```typescript
   export const colors = {
     categories: {
       newCategory: '#hexcolor',
     },
   };
   ```

3. Update UI pickers in `ExpenseForm.tsx`

### Running Tests

```bash
# Run all tests
npm test

# Watch mode (recommended during development)
npm run test:watch

# With coverage (80% threshold enforced)
npm test -- --coverage

# Run specific test file
npm test calculations.test.ts
```

### Linting & Formatting

```bash
# Check for issues
npm run lint

# Auto-fix issues
npm run lint:fix

# Prettier is integrated with ESLint
```

---

## 🎯 Key Conventions

### 1. Import Paths

**ALWAYS use `@/` aliases** (configured in `tsconfig.json` and `babel.config.js`):

```typescript
// ✅ CORRECT
import { colors } from '@/utils/colors';
import ExpenseService from '@/services/ExpenseService';
import { Expense } from '@/models/types';
import HomeScreen from '@/screens/HomeScreen';

// ❌ INCORRECT - Never use relative paths
import { colors } from '../utils/colors';
import ExpenseService from '../../services/ExpenseService';
```

**Available Aliases**:
- `@/components/*` → `src/components/*`
- `@/screens/*` → `src/screens/*`
- `@/services/*` → `src/services/*`
- `@/models/*` → `src/models/*`
- `@/utils/*` → `src/utils/*`
- `@/assets/*` → `src/assets/*`

### 2. File Naming

| Type | Convention | Examples |
|------|-----------|----------|
| **Screens** | `PascalCase.tsx` | `HomeScreen.tsx`, `AddExpenseScreen.tsx` |
| **Components** | `PascalCase.tsx` | `BalanceCard.tsx`, `ExpenseForm.tsx` |
| **Services** | `PascalCase.ts` | `ExpenseService.ts` |
| **Utils** | `kebab-case.ts` or `camelCase.ts` | `calculations.ts`, `colors.ts`, `example-calculation.ts` |
| **Models** | `lowercase.ts` | `types.ts` |
| **Tests** | `filename.test.ts` in `__tests__/` | `calculations.test.ts` |

### 3. TypeScript

**Strict Mode Enabled** - All code must:
- Define interfaces for props
- Use proper return types
- Avoid `any` (except navigation - TODO)
- Use enums for fixed values

**Interface Pattern**:
```typescript
// Props interfaces
interface ComponentProps {
  requiredProp: string;
  optionalProp?: number;
  onCallback?: (data: Type) => void;
}

// Component definition
const Component: React.FC<ComponentProps> = ({ requiredProp, optionalProp }) => {
  // Implementation
};
```

**Type Imports**:
```typescript
import { Expense, User, Balance, ExpenseCategory } from '@/models/types';
```

### 4. Styling

**Pattern**: StyleSheet.create() with design tokens

```typescript
import { StyleSheet } from 'react-native';
import { colors } from '@/utils/colors';

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.primary,
    padding: 16,
    borderRadius: 12,
  },
  card: {
    backgroundColor: colors.background.secondary,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
});
```

**Design Tokens** (`colors.ts`):
- `colors.primary.*` - Main brand colors
- `colors.secondary.*` - Secondary colors
- `colors.background.*` - Background colors
- `colors.text.*` - Text colors
- `colors.categories.*` - Expense category colors
- `colors.status.*` - Success/warning/error
- `colors.balance.*` - Positive/negative/neutral
- `colors.button.*` - Button variants

**Gradient Pattern**:
```typescript
import { LinearGradient } from 'expo-linear-gradient';
import { gradients } from '@/utils/colors';

<LinearGradient colors={gradients.primary} style={styles.gradient}>
  {children}
</LinearGradient>
```

### 5. Component Patterns

**Functional Components Only**:
```typescript
const MyComponent: React.FC<MyComponentProps> = (props) => {
  const [state, setState] = useState<Type>(initialValue);

  useEffect(() => {
    // Side effects
  }, [dependencies]);

  return (
    <View>
      {/* JSX */}
    </View>
  );
};

export default MyComponent;
```

**Data Loading Pattern**:
```typescript
const MyScreen: React.FC = () => {
  const [data, setData] = useState<Expense[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const expenses = ExpenseService.getAllExpenses();
    setData(expenses);
  };

  return (/* ... */);
};
```

### 6. Service Pattern

**Singleton Export**:
```typescript
class ExpenseService {
  private expenses: Expense[] = [];

  public addExpense(expense: Omit<Expense, 'id' | 'createdAt'>): void {
    // Implementation
  }

  public getAllExpenses(): Expense[] {
    return this.expenses;
  }
}

export default new ExpenseService(); // Singleton instance
```

**Usage**:
```typescript
import ExpenseService from '@/services/ExpenseService';

// In component
const expenses = ExpenseService.getAllExpenses();
ExpenseService.addExpense(newExpense);
```

### 7. Error Handling

**Validation in Forms**:
```typescript
const handleSubmit = () => {
  if (!description.trim()) {
    Alert.alert('Erreur', 'Veuillez saisir une description');
    return;
  }

  const amountValue = parseFloat(amount);
  if (isNaN(amountValue) || amountValue <= 0) {
    Alert.alert('Erreur', 'Veuillez saisir un montant valide');
    return;
  }

  // Process valid data
  onSubmit(data);
};
```

**Alert Pattern**:
```typescript
import { Alert } from 'react-native';

Alert.alert(
  'Titre',
  'Message',
  [
    { text: 'Annuler', style: 'cancel' },
    { text: 'Confirmer', onPress: () => { /* action */ } }
  ]
);
```

### 8. Date Handling

**Library**: `date-fns` with French locale

```typescript
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Format date
const formatted = format(new Date(), 'dd MMM yyyy', { locale: fr });
// Output: "20 jan 2026"

// Create dates
const date = new Date();
```

### 9. ID Generation

**Current Pattern** (simple, in-memory):
```typescript
id: Date.now().toString()
```

**For Production** (consider):
- UUID library (`uuid`)
- Backend-generated IDs

---

## 🧪 Testing Guidelines

### Test Structure

**Location**: `src/utils/__tests__/`

**Naming**: `filename.test.ts`

**Pattern**: Arrange-Act-Assert with nested describes

```typescript
describe('FunctionName', () => {
  describe('specific scenario', () => {
    it('should do something specific', () => {
      // Arrange
      const input = { /* test data */ };

      // Act
      const result = functionUnderTest(input);

      // Assert
      expect(result).toBe(expected);
    });
  });
});
```

### Coverage Requirements

**Threshold**: 80% (enforced in `jest.config.js`)
- Branches: 80%
- Functions: 80%
- Lines: 80%
- Statements: 80%

### What to Test

**Priority 1 - Pure Functions** (calculations.ts):
- All business logic functions
- Edge cases (zero, negative, empty arrays)
- Realistic data scenarios

**Priority 2 - Service Methods**:
- CRUD operations
- State changes
- Data transformations

**Priority 3 - Component Logic**:
- Event handlers
- Conditional rendering
- Data transformations

**Not Tested Yet**:
- UI components (integration tests)
- Navigation flows (E2E tests)

### Test Utilities

**Mocks** (configured in `jest.setup.js`):
- `expo-linear-gradient`
- `expo-secure-store`
- `@react-native-picker/picker`
- React Native animations
- `date-fns`

### Running Tests

```bash
# All tests
npm test

# Watch mode (recommended)
npm run test:watch

# Coverage report
npm test -- --coverage

# Specific file
npm test calculations.test.ts

# Update snapshots
npm test -- -u
```

---

## 📋 Common Tasks

### Task 1: Add a New Expense Category

1. **Update enum** in `src/models/types.ts`:
   ```typescript
   export enum ExpenseCategory {
     // Existing categories...
     SANTE = 'sante', // Add new
   }
   ```

2. **Add color** in `src/utils/colors.ts`:
   ```typescript
   export const colors = {
     categories: {
       // Existing...
       sante: '#e8f5e9', // Light green
     },
   };
   ```

3. **Update picker** in `src/components/ExpenseForm.tsx`:
   ```typescript
   const categoryItems = [
     // Existing...
     { label: 'Santé', value: ExpenseCategory.SANTE },
   ];
   ```

4. **Test**: Add expense with new category in app

### Task 2: Modify Calculation Logic

1. **Edit** `src/utils/calculations.ts`
2. **Update tests** in `src/utils/__tests__/calculations.test.ts`
3. **Run tests**: `npm test`
4. **Verify** in app with sample data

### Task 3: Add a New Screen

1. **Create** `src/screens/NewScreen.tsx`
2. **Add to navigation** in `App.tsx`:
   ```typescript
   <Stack.Screen
     name="NewScreen"
     component={NewScreen}
     options={{ title: 'Nouveau' }}
   />
   ```
3. **Navigate** from other screen:
   ```typescript
   navigation.navigate('NewScreen');
   ```

### Task 4: Add Data Persistence

**Current**: In-memory only (data lost on restart)

**To Add AsyncStorage**:

1. Install dependency:
   ```bash
   expo install @react-native-async-storage/async-storage
   ```

2. Update `ExpenseService`:
   ```typescript
   import AsyncStorage from '@react-native-async-storage/async-storage';

   class ExpenseService {
     private async saveToStorage() {
       await AsyncStorage.setItem('expenses', JSON.stringify(this.expenses));
     }

     private async loadFromStorage() {
       const data = await AsyncStorage.getItem('expenses');
       this.expenses = data ? JSON.parse(data) : [];
     }

     public async addExpense(expense: Omit<Expense, 'id'>) {
       // ... add logic
       await this.saveToStorage();
     }
   }
   ```

3. Update screens to use async methods:
   ```typescript
   useEffect(() => {
     loadData();
   }, []);

   const loadData = async () => {
     await ExpenseService.loadFromStorage();
     const expenses = ExpenseService.getAllExpenses();
     setData(expenses);
   };
   ```

### Task 5: Add a New Calculation

1. **Define function** in `src/utils/calculations.ts`:
   ```typescript
   export const calculateMonthlyAverage = (expenses: Expense[]): number => {
     // Implementation
   };
   ```

2. **Add types** (if needed) in `src/models/types.ts`

3. **Write tests** in `src/utils/__tests__/calculations.test.ts`:
   ```typescript
   describe('calculateMonthlyAverage', () => {
     it('should calculate correct average', () => {
       const expenses = [/* test data */];
       const result = calculateMonthlyAverage(expenses);
       expect(result).toBe(expected);
     });
   });
   ```

4. **Use in components**:
   ```typescript
   import { calculateMonthlyAverage } from '@/utils/calculations';

   const average = calculateMonthlyAverage(expenses);
   ```

### Task 6: Update Design Colors

1. **Edit** `src/utils/colors.ts`
2. **No other changes needed** - colors are imported everywhere via `@/utils/colors`
3. **Test** by running app and checking UI

### Task 7: Add a Service Method

1. **Add method** to `src/services/ExpenseService.ts`:
   ```typescript
   public getExpensesByCategory(category: ExpenseCategory): Expense[] {
     return this.expenses.filter(e => e.category === category);
   }
   ```

2. **Use in screen**:
   ```typescript
   import ExpenseService from '@/services/ExpenseService';

   const restaurantExpenses = ExpenseService.getExpensesByCategory(
     ExpenseCategory.RESTAURANT
   );
   ```

---

## ⚠️ Critical Notes for AI Assistants

### 1. Dual Repository Warning

This repository contains:
- **React Native app** (primary) - Work on this
- **Astro static site** (secondary) - IGNORE this

**NEVER modify**:
- `src/pages/*.astro`
- `public/` (Astro assets)
- `astro.config.mjs`
- `netlify/`

### 2. Import Paths

**ALWAYS use `@/` aliases**. Never use relative paths like `../` or `../../`.

```typescript
// ✅ CORRECT
import { colors } from '@/utils/colors';

// ❌ WRONG
import { colors } from '../utils/colors';
```

### 3. Language

**UI text is in French**:
- "Accueil", "Ajouter", "Historique" (tabs)
- "Dépense", "Montant", "Description" (labels)
- "Régler", "Annuler" (buttons)
- Category names: "logement", "courses", "restaurant"

**Keep all user-facing text in French.**

### 4. Data Persistence

**Current state**: In-memory only (no persistence)
- Data resets on app restart
- `ExpenseService` holds state in memory
- No backend/database yet

**When suggesting features**, note that persistence is needed first.

### 5. TypeScript Strict Mode

**Strict mode is enabled** - All code must:
- Have proper type annotations
- No implicit `any`
- Proper null/undefined handling
- Interface definitions for all props

### 6. Navigation Types

**TODO**: Navigation props use `any` type. Should be typed:
```typescript
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

type RootStackParamList = {
  Home: undefined;
  AddExpense: undefined;
  History: undefined;
};

type NavigationProps = NativeStackNavigationProp<RootStackParamList, 'Home'>;
```

### 7. Test Coverage

**80% coverage required** - Tests will fail if coverage drops below:
- Branches: 80%
- Functions: 80%
- Lines: 80%
- Statements: 80%

**Always add tests** when adding new functions to `calculations.ts`.

### 8. Style Guidelines

**Use StyleSheet.create()** for all styles:
```typescript
// ✅ CORRECT
const styles = StyleSheet.create({
  container: { flex: 1 },
});

// ❌ WRONG
<View style={{ flex: 1 }}>
```

**Import colors** from design system:
```typescript
import { colors } from '@/utils/colors';

const styles = StyleSheet.create({
  text: { color: colors.text.primary },
});
```

### 9. Singleton Pattern

**ExpenseService is a singleton** - exported as instance:
```typescript
// ✅ CORRECT
import ExpenseService from '@/services/ExpenseService';
ExpenseService.addExpense(data);

// ❌ WRONG
import { ExpenseService } from '@/services/ExpenseService';
const service = new ExpenseService();
```

### 10. Expo Configuration

**Bundle IDs**:
- iOS: `com.expanse.app`
- Android: `com.expanse.app`

**Plugins** (in `app.json`):
- `expo-secure-store`
- `expo-google-sign-in`

**Orientation**: Portrait only

### 11. Development Commands

```bash
# Start dev server
npm start

# Run on platforms
npm run android
npm run ios
npm run web

# Testing
npm test
npm run test:watch

# Linting
npm run lint
npm run lint:fix
```

### 12. Component Patterns

**Screens** import and orchestrate:
- Components (UI)
- Services (data)
- Utils (calculations)
- Colors (styling)

**Components** are reusable:
- Receive props
- Emit callbacks
- No direct service calls (get data via props)

**Services** handle:
- Data CRUD
- State management
- Business rules

**Utils** provide:
- Pure functions
- No side effects
- Fully tested

### 13. Future Enhancements

**Roadmap items** (not implemented yet):
- AsyncStorage/SecureStore persistence
- Firebase synchronization
- Cloud backend
- Multi-device support
- Export/import features
- Push notifications
- Offline mode
- PDF reports

**When suggesting features**, consider if persistence is needed.

### 14. Performance Considerations

**Current scale**: Small (2 users, dozens of expenses)
**No optimization needed yet** for:
- FlatList virtualization (use ScrollView)
- Memoization (React.memo)
- useCallback/useMemo

**Add if data grows** to 100+ expenses.

### 15. Error Boundaries

**Not implemented** - Consider adding for production:
```typescript
import React from 'react';
import { View, Text } from 'react-native';

class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <View><Text>Une erreur est survenue</Text></View>;
    }
    return this.props.children;
  }
}
```

---

## 📚 File Reference

### Key Files with Absolute Paths

**Entry Point**:
- `/home/user/Angla/App.tsx`

**Configuration**:
- `/home/user/Angla/package.json`
- `/home/user/Angla/tsconfig.json`
- `/home/user/Angla/app.json`
- `/home/user/Angla/babel.config.js`
- `/home/user/Angla/jest.config.js`
- `/home/user/Angla/jest.setup.js`
- `/home/user/Angla/.eslintrc.js`
- `/home/user/Angla/.prettierrc`

**Screens**:
- `/home/user/Angla/src/screens/HomeScreen.tsx`
- `/home/user/Angla/src/screens/AddExpenseScreen.tsx`
- `/home/user/Angla/src/screens/HistoryScreen.tsx`

**Components**:
- `/home/user/Angla/src/components/BalanceCard.tsx`
- `/home/user/Angla/src/components/ExpenseForm.tsx`
- `/home/user/Angla/src/components/ExpenseList.tsx`

**Services**:
- `/home/user/Angla/src/services/ExpenseService.ts`

**Models**:
- `/home/user/Angla/src/models/types.ts`

**Utils**:
- `/home/user/Angla/src/utils/calculations.ts`
- `/home/user/Angla/src/utils/colors.ts`
- `/home/user/Angla/src/utils/example-calculation.ts`

**Tests**:
- `/home/user/Angla/src/utils/__tests__/calculations.test.ts`

**Assets**:
- `/home/user/Angla/src/assets/metadata.ts`
- `/home/user/Angla/src/assets/icon.png`
- `/home/user/Angla/src/assets/splash.png`

---

## 🎓 Learning Resources

### React Native
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Docs](https://reactnative.dev/)
- [React Navigation](https://reactnavigation.org/)

### TypeScript
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

### Testing
- [Jest Documentation](https://jestjs.io/)
- [Testing Library](https://testing-library.com/docs/react-native-testing-library/intro/)

### Design
- [React Native Paper](https://callstack.github.io/react-native-paper/)
- [Expo Linear Gradient](https://docs.expo.dev/versions/latest/sdk/linear-gradient/)

---

## 📝 Change Log

### 2026-01-20
- Initial CLAUDE.md creation
- Documented complete codebase structure
- Added development workflows
- Defined key conventions
- Included testing guidelines
- Listed common tasks
- Added critical notes for AI assistants

---

**Expanse ready!** 🚀

This guide should provide AI assistants with everything needed to understand, navigate, and contribute to the Expanse codebase effectively.

import {
  Invoice,
  InvoiceAnalytics,
  InvoiceCategory,
  InvoiceStatus,
  INVOICE_CATEGORY_LABELS,
} from '../models/invoice-types';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

class InvoiceStore {
  private static instance: InvoiceStore;
  private invoices: Invoice[] = [];

  private constructor() {}

  static getInstance(): InvoiceStore {
    if (!InvoiceStore.instance) {
      InvoiceStore.instance = new InvoiceStore();
    }
    return InvoiceStore.instance;
  }

  initWithSampleData(): void {
    if (this.invoices.length > 0) return;

    const now = new Date();
    const sampleInvoices: Invoice[] = [
      {
        id: generateId(),
        imageUri: '',
        supplierName: 'Metro Cash & Carry',
        supplierAddress: '12 Rue du Commerce, 75015 Paris',
        invoiceNumber: 'MET-2026-004521',
        invoiceDate: '2026-02-05',
        dueDate: '2026-03-05',
        lineItems: [
          { id: generateId(), description: 'Filet de boeuf 5kg', quantity: 2, unitPrice: 45, totalPrice: 90, vatRate: 5.5, category: InvoiceCategory.FOOD_SUPPLIES },
          { id: generateId(), description: 'Saumon frais 3kg', quantity: 1, unitPrice: 38.5, totalPrice: 38.5, vatRate: 5.5, category: InvoiceCategory.FOOD_SUPPLIES },
          { id: generateId(), description: 'Vin rouge Bordeaux x6', quantity: 6, unitPrice: 12, totalPrice: 72, vatRate: 20, category: InvoiceCategory.BEVERAGES },
        ],
        subtotal: 200.5,
        vatAmount: 21.47,
        totalAmount: 221.97,
        currency: 'EUR',
        category: InvoiceCategory.FOOD_SUPPLIES,
        status: InvoiceStatus.VALIDATED,
        scannedBy: 'Marie',
        validatedBy: 'Chef Laurent',
        notes: '',
        confidence: 92,
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        id: generateId(),
        imageUri: '',
        supplierName: 'Rungis Express',
        supplierAddress: '1 Marche International, 94152 Rungis',
        invoiceNumber: 'RE-26-8834',
        invoiceDate: '2026-02-03',
        dueDate: '2026-02-28',
        lineItems: [
          { id: generateId(), description: 'Legumes bio assortis', quantity: 1, unitPrice: 85, totalPrice: 85, vatRate: 5.5, category: InvoiceCategory.FOOD_SUPPLIES },
          { id: generateId(), description: 'Fruits de saison', quantity: 1, unitPrice: 45, totalPrice: 45, vatRate: 5.5, category: InvoiceCategory.FOOD_SUPPLIES },
        ],
        subtotal: 130,
        vatAmount: 7.15,
        totalAmount: 137.15,
        currency: 'EUR',
        category: InvoiceCategory.FOOD_SUPPLIES,
        status: InvoiceStatus.PENDING_VALIDATION,
        scannedBy: 'Thomas',
        validatedBy: null,
        notes: 'Livraison matinale',
        confidence: 78,
        createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
      },
      {
        id: generateId(),
        imageUri: '',
        supplierName: 'CleanPro Services',
        supplierAddress: '5 Avenue des Champs, 75008 Paris',
        invoiceNumber: 'CPS-2026-112',
        invoiceDate: '2026-01-28',
        dueDate: '2026-02-28',
        lineItems: [
          { id: generateId(), description: 'Produits nettoyage cuisine', quantity: 1, unitPrice: 120, totalPrice: 120, vatRate: 20, category: InvoiceCategory.CLEANING },
          { id: generateId(), description: 'Desinfectant alimentaire x10', quantity: 10, unitPrice: 8.5, totalPrice: 85, vatRate: 20, category: InvoiceCategory.CLEANING },
        ],
        subtotal: 205,
        vatAmount: 41,
        totalAmount: 246,
        currency: 'EUR',
        category: InvoiceCategory.CLEANING,
        status: InvoiceStatus.VALIDATED,
        scannedBy: 'Marie',
        validatedBy: 'Chef Laurent',
        notes: '',
        confidence: 95,
        createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000),
      },
      {
        id: generateId(),
        imageUri: '',
        supplierName: 'Boissons du Monde',
        supplierAddress: '22 Rue de la Soif, 33000 Bordeaux',
        invoiceNumber: 'BDM-4455',
        invoiceDate: '2026-01-20',
        dueDate: '2026-02-20',
        lineItems: [
          { id: generateId(), description: 'Champagne Brut x12', quantity: 12, unitPrice: 22, totalPrice: 264, vatRate: 20, category: InvoiceCategory.BEVERAGES },
          { id: generateId(), description: 'Cognac VSOP x3', quantity: 3, unitPrice: 35, totalPrice: 105, vatRate: 20, category: InvoiceCategory.BEVERAGES },
          { id: generateId(), description: 'Jus de fruits bio x24', quantity: 24, unitPrice: 2.5, totalPrice: 60, vatRate: 5.5, category: InvoiceCategory.BEVERAGES },
        ],
        subtotal: 429,
        vatAmount: 77.1,
        totalAmount: 506.1,
        currency: 'EUR',
        category: InvoiceCategory.BEVERAGES,
        status: InvoiceStatus.VALIDATED,
        scannedBy: 'Thomas',
        validatedBy: 'Chef Laurent',
        notes: 'Commande mensuelle boissons',
        confidence: 88,
        createdAt: new Date(now.getTime() - 18 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 17 * 24 * 60 * 60 * 1000),
      },
    ];

    this.invoices = sampleInvoices;
  }

  getAllInvoices(): Invoice[] {
    return [...this.invoices].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  getInvoiceById(id: string): Invoice | undefined {
    return this.invoices.find((inv) => inv.id === id);
  }

  addInvoice(invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Invoice {
    const newInvoice: Invoice = {
      ...invoice,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.invoices.unshift(newInvoice);
    return newInvoice;
  }

  updateInvoice(id: string, updates: Partial<Invoice>): Invoice | undefined {
    const index = this.invoices.findIndex((inv) => inv.id === id);
    if (index === -1) return undefined;

    this.invoices[index] = {
      ...this.invoices[index],
      ...updates,
      updatedAt: new Date(),
    };
    return this.invoices[index];
  }

  validateInvoice(id: string, validatedBy: string): Invoice | undefined {
    return this.updateInvoice(id, {
      status: InvoiceStatus.VALIDATED,
      validatedBy,
    });
  }

  rejectInvoice(id: string, validatedBy: string, notes: string): Invoice | undefined {
    return this.updateInvoice(id, {
      status: InvoiceStatus.REJECTED,
      validatedBy,
      notes,
    });
  }

  deleteInvoice(id: string): boolean {
    const index = this.invoices.findIndex((inv) => inv.id === id);
    if (index === -1) return false;
    this.invoices.splice(index, 1);
    return true;
  }

  getByStatus(status: InvoiceStatus): Invoice[] {
    return this.invoices.filter((inv) => inv.status === status);
  }

  getByCategory(category: InvoiceCategory): Invoice[] {
    return this.invoices.filter((inv) => inv.category === category);
  }

  getAnalytics(): InvoiceAnalytics {
    const validated = this.invoices.filter(
      (inv) => inv.status === InvoiceStatus.VALIDATED
    );

    const totalSpent = validated.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const vatTotal = validated.reduce((sum, inv) => sum + inv.vatAmount, 0);

    const spendByCategory = {} as Record<InvoiceCategory, number>;
    Object.values(InvoiceCategory).forEach((cat) => {
      spendByCategory[cat] = validated
        .filter((inv) => inv.category === cat)
        .reduce((sum, inv) => sum + inv.totalAmount, 0);
    });

    // Spend by month (last 6 months)
    const spendByMonth: { month: string; amount: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthLabel = d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
      const amount = validated
        .filter((inv) => inv.invoiceDate.startsWith(monthKey))
        .reduce((sum, inv) => sum + inv.totalAmount, 0);
      spendByMonth.push({ month: monthLabel, amount });
    }

    // Top suppliers
    const supplierMap = new Map<string, { total: number; count: number }>();
    validated.forEach((inv) => {
      const existing = supplierMap.get(inv.supplierName) || { total: 0, count: 0 };
      supplierMap.set(inv.supplierName, {
        total: existing.total + inv.totalAmount,
        count: existing.count + 1,
      });
    });
    const topSuppliers = Array.from(supplierMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    return {
      totalSpent: Math.round(totalSpent * 100) / 100,
      invoiceCount: validated.length,
      averageInvoice: validated.length > 0 ? Math.round((totalSpent / validated.length) * 100) / 100 : 0,
      spendByCategory,
      spendByMonth,
      topSuppliers,
      pendingValidation: this.invoices.filter(
        (inv) => inv.status === InvoiceStatus.PENDING_VALIDATION
      ).length,
      vatTotal: Math.round(vatTotal * 100) / 100,
    };
  }
}

export default InvoiceStore;

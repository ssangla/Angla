export enum InvoiceStatus {
  PENDING_SCAN = 'pending_scan',
  PROCESSING = 'processing',
  PENDING_VALIDATION = 'pending_validation',
  VALIDATED = 'validated',
  REJECTED = 'rejected',
}

export enum InvoiceCategory {
  FOOD_SUPPLIES = 'food_supplies',
  BEVERAGES = 'beverages',
  EQUIPMENT = 'equipment',
  CLEANING = 'cleaning',
  UTILITIES = 'utilities',
  MAINTENANCE = 'maintenance',
  OTHER = 'other',
}

export const INVOICE_CATEGORY_LABELS: Record<InvoiceCategory, string> = {
  [InvoiceCategory.FOOD_SUPPLIES]: 'Alimentaire',
  [InvoiceCategory.BEVERAGES]: 'Boissons',
  [InvoiceCategory.EQUIPMENT]: 'Equipement',
  [InvoiceCategory.CLEANING]: 'Nettoyage',
  [InvoiceCategory.UTILITIES]: 'Services',
  [InvoiceCategory.MAINTENANCE]: 'Maintenance',
  [InvoiceCategory.OTHER]: 'Autre',
};

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  [InvoiceStatus.PENDING_SCAN]: 'En attente de scan',
  [InvoiceStatus.PROCESSING]: 'Traitement en cours',
  [InvoiceStatus.PENDING_VALIDATION]: 'A valider',
  [InvoiceStatus.VALIDATED]: 'Validee',
  [InvoiceStatus.REJECTED]: 'Rejetee',
};

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  vatRate: number;
  category: InvoiceCategory;
}

export interface Invoice {
  id: string;
  imageUri: string;
  supplierName: string;
  supplierAddress: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  lineItems: LineItem[];
  subtotal: number;
  vatAmount: number;
  totalAmount: number;
  currency: string;
  category: InvoiceCategory;
  status: InvoiceStatus;
  scannedBy: string;
  validatedBy: string | null;
  notes: string;
  confidence: number; // 0-100 LLM confidence score
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceAnalytics {
  totalSpent: number;
  invoiceCount: number;
  averageInvoice: number;
  spendByCategory: Record<InvoiceCategory, number>;
  spendByMonth: { month: string; amount: number }[];
  topSuppliers: { name: string; total: number; count: number }[];
  pendingValidation: number;
  vatTotal: number;
}

export interface LLMExtractionResult {
  success: boolean;
  confidence: number;
  data: Partial<Invoice>;
  rawText: string;
  errors: string[];
}

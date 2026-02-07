import {
  Invoice,
  InvoiceCategory,
  InvoiceStatus,
  LineItem,
  LLMExtractionResult,
} from '../models/invoice-types';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

// In production, store this securely via expo-secure-store or a backend proxy
let apiKey = '';

export function setAnthropicApiKey(key: string) {
  apiKey = key;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

const EXTRACTION_PROMPT = `You are an invoice data extraction system for a restaurant. Analyze this invoice/receipt image and extract structured data.

Return ONLY valid JSON with this exact structure (no markdown, no explanation):
{
  "supplierName": "string",
  "supplierAddress": "string or empty",
  "invoiceNumber": "string or empty",
  "invoiceDate": "YYYY-MM-DD",
  "dueDate": "YYYY-MM-DD or empty",
  "currency": "EUR",
  "lineItems": [
    {
      "description": "item name",
      "quantity": number,
      "unitPrice": number,
      "totalPrice": number,
      "vatRate": number (e.g. 20 for 20%),
      "category": "food_supplies|beverages|equipment|cleaning|utilities|maintenance|other"
    }
  ],
  "subtotal": number,
  "vatAmount": number,
  "totalAmount": number,
  "category": "food_supplies|beverages|equipment|cleaning|utilities|maintenance|other",
  "confidence": number between 0 and 100,
  "notes": "any relevant notes about the extraction"
}

Rules:
- All monetary values as numbers (no currency symbols)
- If a field is unclear, make your best guess and lower the confidence score
- Category should reflect the majority of items
- If the image is not an invoice/receipt, set confidence to 0`;

export async function extractInvoiceFromImage(
  imageBase64: string,
  mimeType: string = 'image/jpeg'
): Promise<LLMExtractionResult> {
  if (!apiKey) {
    // Return mock data for demo/development when no API key is set
    return getMockExtractionResult();
  }

  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 2048,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mimeType,
                  data: imageBase64,
                },
              },
              {
                type: 'text',
                text: EXTRACTION_PROMPT,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        confidence: 0,
        data: {},
        rawText: '',
        errors: [`API error ${response.status}: ${errorText}`],
      };
    }

    const result = await response.json();
    const content = result.content?.[0]?.text || '';

    const parsed = JSON.parse(content);
    const lineItems: LineItem[] = (parsed.lineItems || []).map(
      (item: any) => ({
        id: generateId(),
        description: item.description || '',
        quantity: Number(item.quantity) || 1,
        unitPrice: Number(item.unitPrice) || 0,
        totalPrice: Number(item.totalPrice) || 0,
        vatRate: Number(item.vatRate) || 20,
        category: item.category || InvoiceCategory.OTHER,
      })
    );

    return {
      success: true,
      confidence: parsed.confidence || 50,
      data: {
        supplierName: parsed.supplierName || '',
        supplierAddress: parsed.supplierAddress || '',
        invoiceNumber: parsed.invoiceNumber || '',
        invoiceDate: parsed.invoiceDate || new Date().toISOString().split('T')[0],
        dueDate: parsed.dueDate || '',
        currency: parsed.currency || 'EUR',
        lineItems,
        subtotal: Number(parsed.subtotal) || 0,
        vatAmount: Number(parsed.vatAmount) || 0,
        totalAmount: Number(parsed.totalAmount) || 0,
        category: parsed.category || InvoiceCategory.OTHER,
        notes: parsed.notes || '',
      },
      rawText: content,
      errors: [],
    };
  } catch (error: any) {
    return {
      success: false,
      confidence: 0,
      data: {},
      rawText: '',
      errors: [error.message || 'Unknown error during extraction'],
    };
  }
}

function getMockExtractionResult(): LLMExtractionResult {
  const mockItems: LineItem[] = [
    {
      id: generateId(),
      description: 'Filet de boeuf 5kg',
      quantity: 2,
      unitPrice: 45.0,
      totalPrice: 90.0,
      vatRate: 5.5,
      category: InvoiceCategory.FOOD_SUPPLIES,
    },
    {
      id: generateId(),
      description: 'Saumon frais 3kg',
      quantity: 1,
      unitPrice: 38.5,
      totalPrice: 38.5,
      vatRate: 5.5,
      category: InvoiceCategory.FOOD_SUPPLIES,
    },
    {
      id: generateId(),
      description: 'Legumes saison assortis',
      quantity: 1,
      unitPrice: 65.0,
      totalPrice: 65.0,
      vatRate: 5.5,
      category: InvoiceCategory.FOOD_SUPPLIES,
    },
    {
      id: generateId(),
      description: 'Vin rouge Bordeaux 2022 x6',
      quantity: 6,
      unitPrice: 12.0,
      totalPrice: 72.0,
      vatRate: 20,
      category: InvoiceCategory.BEVERAGES,
    },
    {
      id: generateId(),
      description: 'Eau minerale 24x1.5L',
      quantity: 2,
      unitPrice: 8.5,
      totalPrice: 17.0,
      vatRate: 5.5,
      category: InvoiceCategory.BEVERAGES,
    },
  ];

  const subtotal = mockItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const vatAmount = mockItems.reduce(
    (sum, item) => sum + item.totalPrice * (item.vatRate / 100),
    0
  );

  return {
    success: true,
    confidence: 87,
    data: {
      supplierName: 'Metro Cash & Carry',
      supplierAddress: '12 Rue du Commerce, 75015 Paris',
      invoiceNumber: 'MET-2026-004521',
      invoiceDate: '2026-02-05',
      dueDate: '2026-03-05',
      currency: 'EUR',
      lineItems: mockItems,
      subtotal: Math.round(subtotal * 100) / 100,
      vatAmount: Math.round(vatAmount * 100) / 100,
      totalAmount: Math.round((subtotal + vatAmount) * 100) / 100,
      category: InvoiceCategory.FOOD_SUPPLIES,
      notes: 'Demo data - configure API key for real extraction',
    },
    rawText: 'MOCK_DATA',
    errors: [],
  };
}

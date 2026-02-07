import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../utils/colors';
import InvoiceStore from '../services/InvoiceStore';
import {
  Invoice,
  InvoiceCategory,
  InvoiceStatus,
  INVOICE_CATEGORY_LABELS,
  LineItem,
} from '../models/invoice-types';

interface Props {
  route: any;
  navigation: any;
}

export default function ValidateInvoiceScreen({ route, navigation }: Props) {
  const { invoiceId } = route.params;
  const store = InvoiceStore.getInstance();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [editedFields, setEditedFields] = useState<Partial<Invoice>>({});
  const [editingItem, setEditingItem] = useState<LineItem | null>(null);
  const [showItemModal, setShowItemModal] = useState(false);

  useEffect(() => {
    const inv = store.getInvoiceById(invoiceId);
    if (inv) {
      setInvoice(inv);
      setEditedFields({
        supplierName: inv.supplierName,
        invoiceNumber: inv.invoiceNumber,
        invoiceDate: inv.invoiceDate,
        totalAmount: inv.totalAmount,
        subtotal: inv.subtotal,
        vatAmount: inv.vatAmount,
        notes: inv.notes,
        lineItems: [...inv.lineItems],
      });
    }
  }, [invoiceId]);

  if (!invoice) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Facture introuvable</Text>
      </View>
    );
  }

  const confidence = invoice.confidence;
  const confidenceColor =
    confidence >= 80
      ? colors.status.success
      : confidence >= 50
      ? colors.status.warning
      : colors.status.error;

  const updateField = (field: string, value: any) => {
    setEditedFields((prev) => ({ ...prev, [field]: value }));
  };

  const updateLineItem = (itemId: string, field: string, value: any) => {
    const items = [...(editedFields.lineItems || invoice.lineItems)];
    const index = items.findIndex((i) => i.id === itemId);
    if (index !== -1) {
      items[index] = { ...items[index], [field]: value };
      // Recalculate totalPrice if quantity or unitPrice changed
      if (field === 'quantity' || field === 'unitPrice') {
        items[index].totalPrice = items[index].quantity * items[index].unitPrice;
      }
      updateField('lineItems', items);

      // Recalculate totals
      const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
      const vatAmount = items.reduce(
        (sum, item) => sum + item.totalPrice * (item.vatRate / 100),
        0
      );
      updateField('subtotal', Math.round(subtotal * 100) / 100);
      updateField('vatAmount', Math.round(vatAmount * 100) / 100);
      updateField('totalAmount', Math.round((subtotal + vatAmount) * 100) / 100);
    }
  };

  const handleValidate = () => {
    Alert.alert(
      'Valider la facture',
      `Confirmer la validation de la facture ${editedFields.invoiceNumber || invoice.invoiceNumber} pour ${formatCurrency(editedFields.totalAmount ?? invoice.totalAmount)} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Valider',
          onPress: () => {
            store.updateInvoice(invoiceId, {
              ...editedFields,
              status: InvoiceStatus.VALIDATED,
              validatedBy: 'Gerant',
            });
            Alert.alert('Validee', 'La facture a ete validee avec succes.', [
              { text: 'OK', onPress: () => navigation.navigate('InvoiceList') },
            ]);
          },
        },
      ]
    );
  };

  const handleReject = () => {
    Alert.prompt
      ? Alert.prompt('Rejeter la facture', 'Raison du rejet:', (reason) => {
          store.rejectInvoice(invoiceId, 'Gerant', reason || 'Rejetee par le gerant');
          Alert.alert('Rejetee', 'La facture a ete rejetee.', [
            { text: 'OK', onPress: () => navigation.navigate('InvoiceList') },
          ]);
        })
      : Alert.alert('Rejeter la facture', 'Confirmer le rejet?', [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Rejeter',
            style: 'destructive',
            onPress: () => {
              store.rejectInvoice(invoiceId, 'Gerant', 'Rejetee par le gerant');
              Alert.alert('Rejetee', 'La facture a ete rejetee.', [
                { text: 'OK', onPress: () => navigation.navigate('InvoiceList') },
              ]);
            },
          },
        ]);
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(2)} \u20AC`;
  };

  const lineItems = editedFields.lineItems || invoice.lineItems;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Confidence Banner */}
      <View style={[styles.confidenceBanner, { backgroundColor: confidenceColor + '15' }]}>
        <View style={styles.confidenceRow}>
          <Ionicons
            name={confidence >= 80 ? 'checkmark-circle' : 'warning'}
            size={24}
            color={confidenceColor}
          />
          <View style={styles.confidenceTextContainer}>
            <Text style={[styles.confidenceLabel, { color: confidenceColor }]}>
              Confiance IA: {confidence}%
            </Text>
            <Text style={styles.confidenceHint}>
              {confidence >= 80
                ? 'Extraction fiable - verifiez et validez'
                : 'Confiance moyenne - verifiez attentivement chaque champ'}
            </Text>
          </View>
        </View>
        <View style={[styles.confidenceBar, { backgroundColor: confidenceColor + '30' }]}>
          <View
            style={[
              styles.confidenceFill,
              { width: `${confidence}%`, backgroundColor: confidenceColor },
            ]}
          />
        </View>
      </View>

      {/* Supplier Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informations fournisseur</Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Nom du fournisseur</Text>
          <TextInput
            style={styles.input}
            value={editedFields.supplierName ?? invoice.supplierName}
            onChangeText={(val) => updateField('supplierName', val)}
            placeholder="Nom du fournisseur"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>N de facture</Text>
          <TextInput
            style={styles.input}
            value={editedFields.invoiceNumber ?? invoice.invoiceNumber}
            onChangeText={(val) => updateField('invoiceNumber', val)}
            placeholder="Numero de facture"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Date de facture</Text>
          <TextInput
            style={styles.input}
            value={editedFields.invoiceDate ?? invoice.invoiceDate}
            onChangeText={(val) => updateField('invoiceDate', val)}
            placeholder="AAAA-MM-JJ"
          />
        </View>
      </View>

      {/* Line Items */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Articles ({lineItems.length})</Text>

        {lineItems.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            style={styles.itemCard}
            onPress={() => {
              setEditingItem(item);
              setShowItemModal(true);
            }}
          >
            <View style={styles.itemHeader}>
              <Text style={styles.itemDescription} numberOfLines={1}>
                {item.description}
              </Text>
              <Ionicons name="create-outline" size={18} color={colors.text.secondary} />
            </View>
            <View style={styles.itemDetails}>
              <Text style={styles.itemDetail}>
                {item.quantity} x {formatCurrency(item.unitPrice)}
              </Text>
              <Text style={styles.itemCategory}>
                {INVOICE_CATEGORY_LABELS[item.category as InvoiceCategory] || item.category}
              </Text>
              <Text style={styles.itemTotal}>{formatCurrency(item.totalPrice)}</Text>
            </View>
            <Text style={styles.itemVat}>TVA: {item.vatRate}%</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Totals */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Totaux</Text>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Sous-total HT</Text>
          <Text style={styles.totalValue}>
            {formatCurrency(editedFields.subtotal ?? invoice.subtotal)}
          </Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>TVA</Text>
          <Text style={styles.totalValue}>
            {formatCurrency(editedFields.vatAmount ?? invoice.vatAmount)}
          </Text>
        </View>
        <View style={[styles.totalRow, styles.grandTotalRow]}>
          <Text style={styles.grandTotalLabel}>Total TTC</Text>
          <Text style={styles.grandTotalValue}>
            {formatCurrency(editedFields.totalAmount ?? invoice.totalAmount)}
          </Text>
        </View>
      </View>

      {/* Notes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notes</Text>
        <TextInput
          style={[styles.input, styles.notesInput]}
          value={editedFields.notes ?? invoice.notes}
          onChangeText={(val) => updateField('notes', val)}
          placeholder="Ajouter des notes..."
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Action Buttons */}
      {invoice.status === InvoiceStatus.PENDING_VALIDATION && (
        <View style={styles.actions}>
          <TouchableOpacity style={styles.validateButton} onPress={handleValidate}>
            <Ionicons name="checkmark-circle" size={22} color={colors.text.inverse} />
            <Text style={styles.validateButtonText}>Valider la facture</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.rejectButton} onPress={handleReject}>
            <Ionicons name="close-circle" size={22} color={colors.status.error} />
            <Text style={styles.rejectButtonText}>Rejeter</Text>
          </TouchableOpacity>
        </View>
      )}

      {invoice.status === InvoiceStatus.VALIDATED && (
        <View style={styles.statusBanner}>
          <Ionicons name="checkmark-circle" size={24} color={colors.status.success} />
          <Text style={styles.statusText}>
            Validee par {invoice.validatedBy}
          </Text>
        </View>
      )}

      {/* Line Item Edit Modal */}
      <Modal visible={showItemModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Modifier l'article</Text>
              <TouchableOpacity onPress={() => setShowItemModal(false)}>
                <Ionicons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            {editingItem && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Description</Text>
                  <TextInput
                    style={styles.input}
                    value={editingItem.description}
                    onChangeText={(val) => {
                      setEditingItem({ ...editingItem, description: val });
                      updateLineItem(editingItem.id, 'description', val);
                    }}
                  />
                </View>

                <View style={styles.fieldRow}>
                  <View style={[styles.fieldGroup, { flex: 1 }]}>
                    <Text style={styles.fieldLabel}>Quantite</Text>
                    <TextInput
                      style={styles.input}
                      value={String(editingItem.quantity)}
                      onChangeText={(val) => {
                        const num = Number(val) || 0;
                        setEditingItem({ ...editingItem, quantity: num });
                        updateLineItem(editingItem.id, 'quantity', num);
                      }}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={[styles.fieldGroup, { flex: 1 }]}>
                    <Text style={styles.fieldLabel}>Prix unitaire</Text>
                    <TextInput
                      style={styles.input}
                      value={String(editingItem.unitPrice)}
                      onChangeText={(val) => {
                        const num = Number(val) || 0;
                        setEditingItem({ ...editingItem, unitPrice: num });
                        updateLineItem(editingItem.id, 'unitPrice', num);
                      }}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Taux TVA (%)</Text>
                  <TextInput
                    style={styles.input}
                    value={String(editingItem.vatRate)}
                    onChangeText={(val) => {
                      const num = Number(val) || 0;
                      setEditingItem({ ...editingItem, vatRate: num });
                      updateLineItem(editingItem.id, 'vatRate', num);
                    }}
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Total</Text>
                  <Text style={styles.computedValue}>
                    {formatCurrency(editingItem.quantity * editingItem.unitPrice)}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.modalDoneButton}
                  onPress={() => setShowItemModal(false)}
                >
                  <Text style={styles.modalDoneText}>Terminer</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function formatCurrency(amount: number): string {
  return `${amount.toFixed(2)} \u20AC`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  errorText: {
    fontSize: 16,
    color: colors.status.error,
    textAlign: 'center',
    marginTop: 40,
  },
  confidenceBanner: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 10,
  },
  confidenceTextContainer: {
    flex: 1,
  },
  confidenceLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  confidenceHint: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  confidenceBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 3,
  },
  section: {
    backgroundColor: colors.background.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 14,
  },
  fieldGroup: {
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fieldRow: {
    flexDirection: 'row',
    gap: 12,
  },
  input: {
    backgroundColor: colors.background.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.secondary.soft,
  },
  notesInput: {
    minHeight: 70,
    textAlignVertical: 'top',
  },
  itemCard: {
    backgroundColor: colors.background.primary,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.secondary.soft,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  itemDescription: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
    flex: 1,
    marginRight: 8,
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemDetail: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  itemCategory: {
    fontSize: 11,
    color: colors.primary.main,
    backgroundColor: colors.primary.soft,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
    fontWeight: '600',
  },
  itemTotal: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text.primary,
  },
  itemVat: {
    fontSize: 11,
    color: colors.text.disabled,
    marginTop: 4,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary.soft,
  },
  totalLabel: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  totalValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  grandTotalRow: {
    borderBottomWidth: 0,
    paddingTop: 12,
  },
  grandTotalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  grandTotalValue: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary.main,
  },
  actions: {
    gap: 12,
    marginBottom: 20,
  },
  validateButton: {
    backgroundColor: colors.status.success,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: colors.status.success,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  validateButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text.inverse,
  },
  rejectButton: {
    backgroundColor: colors.background.card,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 2,
    borderColor: colors.status.error,
  },
  rejectButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.status.error,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.status.success + '15',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  statusText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.status.success,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.background.modal,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background.secondary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary.soft,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  modalBody: {
    padding: 20,
  },
  computedValue: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary.main,
    paddingVertical: 10,
  },
  modalDoneButton: {
    backgroundColor: colors.primary.main,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  modalDoneText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.inverse,
  },
});

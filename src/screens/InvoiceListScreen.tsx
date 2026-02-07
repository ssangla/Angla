import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../utils/colors';
import InvoiceStore from '../services/InvoiceStore';
import {
  Invoice,
  InvoiceStatus,
  InvoiceCategory,
  INVOICE_STATUS_LABELS,
  INVOICE_CATEGORY_LABELS,
} from '../models/invoice-types';

interface Props {
  navigation: any;
}

type FilterStatus = 'all' | InvoiceStatus;

export default function InvoiceListScreen({ navigation }: Props) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [refreshing, setRefreshing] = useState(false);

  const store = InvoiceStore.getInstance();

  const loadInvoices = useCallback(() => {
    store.initWithSampleData();
    const all = store.getAllInvoices();
    if (filter === 'all') {
      setInvoices(all);
    } else {
      setInvoices(all.filter((inv) => inv.status === filter));
    }
  }, [filter]);

  useFocusEffect(
    useCallback(() => {
      loadInvoices();
    }, [loadInvoices])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadInvoices();
    setRefreshing(false);
  };

  const statusConfig: Record<
    InvoiceStatus,
    { color: string; icon: keyof typeof Ionicons.glyphMap }
  > = {
    [InvoiceStatus.PENDING_SCAN]: { color: colors.text.disabled, icon: 'time-outline' },
    [InvoiceStatus.PROCESSING]: { color: colors.status.info, icon: 'sync-outline' },
    [InvoiceStatus.PENDING_VALIDATION]: { color: colors.status.warning, icon: 'alert-circle-outline' },
    [InvoiceStatus.VALIDATED]: { color: colors.status.success, icon: 'checkmark-circle' },
    [InvoiceStatus.REJECTED]: { color: colors.status.error, icon: 'close-circle' },
  };

  const formatCurrency = (amount: number) => `${amount.toFixed(2)} \u20AC`;

  const pendingCount = store.getByStatus(InvoiceStatus.PENDING_VALIDATION).length;

  const filters: { key: FilterStatus; label: string }[] = [
    { key: 'all', label: 'Toutes' },
    { key: InvoiceStatus.PENDING_VALIDATION, label: `A valider (${pendingCount})` },
    { key: InvoiceStatus.VALIDATED, label: 'Validees' },
    { key: InvoiceStatus.REJECTED, label: 'Rejetees' },
  ];

  const renderInvoice = ({ item }: { item: Invoice }) => {
    const config = statusConfig[item.status];

    return (
      <TouchableOpacity
        style={styles.invoiceCard}
        onPress={() => navigation.navigate('ValidateInvoice', { invoiceId: item.id })}
      >
        <View style={styles.cardHeader}>
          <View style={styles.supplierInfo}>
            <Text style={styles.supplierName} numberOfLines={1}>
              {item.supplierName}
            </Text>
            <Text style={styles.invoiceNumber}>{item.invoiceNumber}</Text>
          </View>
          <Text style={styles.totalAmount}>{formatCurrency(item.totalAmount)}</Text>
        </View>

        <View style={styles.cardMiddle}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>
              {INVOICE_CATEGORY_LABELS[item.category] || item.category}
            </Text>
          </View>
          <Text style={styles.dateText}>{item.invoiceDate}</Text>
          <Text style={styles.itemCount}>{item.lineItems.length} articles</Text>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.statusContainer}>
            <Ionicons name={config.icon} size={16} color={config.color} />
            <Text style={[styles.statusText, { color: config.color }]}>
              {INVOICE_STATUS_LABELS[item.status]}
            </Text>
          </View>

          <View style={styles.metaInfo}>
            <Ionicons name="person-outline" size={14} color={colors.text.disabled} />
            <Text style={styles.metaText}>{item.scannedBy}</Text>
            {item.confidence > 0 && (
              <>
                <Ionicons name="sparkles" size={14} color={colors.status.info} />
                <Text style={styles.metaText}>{item.confidence}%</Text>
              </>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header Summary */}
      <View style={styles.summaryHeader}>
        <Text style={styles.summaryTitle}>Factures</Text>
        <View style={styles.summaryStats}>
          <Text style={styles.summaryCount}>{invoices.length}</Text>
          <Text style={styles.summaryLabel}>facture{invoices.length !== 1 ? 's' : ''}</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          data={filters}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.filterList}
          renderItem={({ item: f }) => (
            <TouchableOpacity
              style={[styles.filterTab, filter === f.key && styles.filterTabActive]}
              onPress={() => setFilter(f.key)}
            >
              <Text
                style={[styles.filterText, filter === f.key && styles.filterTextActive]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Invoice List */}
      <FlatList
        data={invoices}
        renderItem={renderInvoice}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={48} color={colors.text.disabled} />
            <Text style={styles.emptyText}>Aucune facture</Text>
            <Text style={styles.emptySubtext}>
              Scannez votre premiere facture pour commencer
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  summaryTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text.primary,
  },
  summaryStats: {
    alignItems: 'center',
  },
  summaryCount: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.primary.main,
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  filterContainer: {
    marginBottom: 8,
  },
  filterList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.background.card,
    borderWidth: 1,
    borderColor: colors.secondary.soft,
  },
  filterTabActive: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  filterTextActive: {
    color: colors.text.inverse,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  invoiceCard: {
    backgroundColor: colors.background.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  supplierInfo: {
    flex: 1,
    marginRight: 12,
  },
  supplierName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
  },
  invoiceNumber: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.primary.main,
  },
  cardMiddle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  categoryBadge: {
    backgroundColor: colors.primary.soft,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary.main,
  },
  dateText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  itemCount: {
    fontSize: 12,
    color: colors.text.disabled,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.secondary.soft,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: colors.text.disabled,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.secondary,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.text.disabled,
    marginTop: 6,
  },
});

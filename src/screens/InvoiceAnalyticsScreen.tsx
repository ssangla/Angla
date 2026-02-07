import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../utils/colors';
import InvoiceStore from '../services/InvoiceStore';
import {
  InvoiceAnalytics,
  InvoiceCategory,
  INVOICE_CATEGORY_LABELS,
} from '../models/invoice-types';

const SCREEN_WIDTH = Dimensions.get('window').width;

const CATEGORY_COLORS: Record<InvoiceCategory, string> = {
  [InvoiceCategory.FOOD_SUPPLIES]: '#ff6b6b',
  [InvoiceCategory.BEVERAGES]: '#45b7d1',
  [InvoiceCategory.EQUIPMENT]: '#96ceb4',
  [InvoiceCategory.CLEANING]: '#feca57',
  [InvoiceCategory.UTILITIES]: '#a8e6cf',
  [InvoiceCategory.MAINTENANCE]: '#ff9ff3',
  [InvoiceCategory.OTHER]: '#c7c7c7',
};

export default function InvoiceAnalyticsScreen() {
  const [analytics, setAnalytics] = useState<InvoiceAnalytics | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const store = InvoiceStore.getInstance();

  const loadAnalytics = useCallback(() => {
    store.initWithSampleData();
    setAnalytics(store.getAnalytics());
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAnalytics();
    }, [loadAnalytics])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadAnalytics();
    setRefreshing(false);
  };

  const formatCurrency = (amount: number) => `${amount.toFixed(2)} \u20AC`;

  if (!analytics) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  // Prepare category breakdown (only categories with spending)
  const categoryEntries = Object.entries(analytics.spendByCategory)
    .filter(([, amount]) => amount > 0)
    .sort(([, a], [, b]) => b - a) as [InvoiceCategory, number][];

  const maxCategoryAmount = Math.max(...categoryEntries.map(([, v]) => v), 1);

  // Monthly trend bar chart data
  const maxMonthlyAmount = Math.max(...analytics.spendByMonth.map((m) => m.amount), 1);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.pageTitle}>Tableau de bord</Text>

      {/* KPI Cards */}
      <View style={styles.kpiGrid}>
        <View style={styles.kpiCard}>
          <View style={[styles.kpiIconBg, { backgroundColor: colors.primary.soft }]}>
            <Ionicons name="wallet-outline" size={22} color={colors.primary.main} />
          </View>
          <Text style={styles.kpiValue}>{formatCurrency(analytics.totalSpent)}</Text>
          <Text style={styles.kpiLabel}>Total depenses</Text>
        </View>

        <View style={styles.kpiCard}>
          <View style={[styles.kpiIconBg, { backgroundColor: '#e3fcef' }]}>
            <Ionicons name="document-text-outline" size={22} color={colors.status.success} />
          </View>
          <Text style={styles.kpiValue}>{analytics.invoiceCount}</Text>
          <Text style={styles.kpiLabel}>Factures validees</Text>
        </View>

        <View style={styles.kpiCard}>
          <View style={[styles.kpiIconBg, { backgroundColor: '#fff3e0' }]}>
            <Ionicons name="calculator-outline" size={22} color={colors.status.warning} />
          </View>
          <Text style={styles.kpiValue}>{formatCurrency(analytics.averageInvoice)}</Text>
          <Text style={styles.kpiLabel}>Moyenne / facture</Text>
        </View>

        <View style={styles.kpiCard}>
          <View style={[styles.kpiIconBg, { backgroundColor: '#fce4ec' }]}>
            <Ionicons name="receipt-outline" size={22} color={colors.status.error} />
          </View>
          <Text style={styles.kpiValue}>{formatCurrency(analytics.vatTotal)}</Text>
          <Text style={styles.kpiLabel}>TVA totale</Text>
        </View>
      </View>

      {/* Pending Alert */}
      {analytics.pendingValidation > 0 && (
        <View style={styles.pendingAlert}>
          <Ionicons name="alert-circle" size={22} color={colors.status.warning} />
          <Text style={styles.pendingText}>
            {analytics.pendingValidation} facture{analytics.pendingValidation > 1 ? 's' : ''} en
            attente de validation
          </Text>
        </View>
      )}

      {/* Category Breakdown */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Depenses par categorie</Text>
        {categoryEntries.length === 0 ? (
          <Text style={styles.emptyText}>Aucune donnee</Text>
        ) : (
          categoryEntries.map(([category, amount]) => {
            const pct = analytics.totalSpent > 0 ? (amount / analytics.totalSpent) * 100 : 0;
            const barWidth = (amount / maxCategoryAmount) * 100;
            const barColor = CATEGORY_COLORS[category] || colors.text.disabled;

            return (
              <View key={category} style={styles.categoryRow}>
                <View style={styles.categoryLabelRow}>
                  <View style={[styles.categoryDot, { backgroundColor: barColor }]} />
                  <Text style={styles.categoryLabel}>
                    {INVOICE_CATEGORY_LABELS[category] || category}
                  </Text>
                  <Text style={styles.categoryAmount}>{formatCurrency(amount)}</Text>
                  <Text style={styles.categoryPct}>{pct.toFixed(1)}%</Text>
                </View>
                <View style={styles.barBackground}>
                  <View
                    style={[
                      styles.barFill,
                      { width: `${barWidth}%`, backgroundColor: barColor },
                    ]}
                  />
                </View>
              </View>
            );
          })
        )}
      </View>

      {/* Monthly Trend */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tendance mensuelle</Text>
        <View style={styles.monthlyChart}>
          {analytics.spendByMonth.map((month, index) => {
            const barHeight = maxMonthlyAmount > 0 ? (month.amount / maxMonthlyAmount) * 120 : 0;

            return (
              <View key={index} style={styles.monthColumn}>
                <Text style={styles.monthAmount}>
                  {month.amount > 0 ? `${(month.amount / 1000).toFixed(1)}k` : '-'}
                </Text>
                <View style={styles.monthBarContainer}>
                  <View
                    style={[
                      styles.monthBar,
                      {
                        height: Math.max(barHeight, 4),
                        backgroundColor:
                          month.amount > 0 ? colors.primary.main : colors.secondary.soft,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.monthLabel}>{month.month}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Top Suppliers */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Top fournisseurs</Text>
        {analytics.topSuppliers.length === 0 ? (
          <Text style={styles.emptyText}>Aucune donnee</Text>
        ) : (
          analytics.topSuppliers.map((supplier, index) => (
            <View key={supplier.name} style={styles.supplierRow}>
              <View style={styles.supplierRank}>
                <Text style={styles.supplierRankText}>{index + 1}</Text>
              </View>
              <View style={styles.supplierInfo}>
                <Text style={styles.supplierName}>{supplier.name}</Text>
                <Text style={styles.supplierMeta}>
                  {supplier.count} facture{supplier.count > 1 ? 's' : ''}
                </Text>
              </View>
              <Text style={styles.supplierTotal}>{formatCurrency(supplier.total)}</Text>
            </View>
          ))
        )}
      </View>

      {/* Cash Machine Reconciliation Summary */}
      <View style={styles.section}>
        <View style={styles.reconciliationHeader}>
          <Ionicons name="cash-outline" size={22} color={colors.primary.main} />
          <Text style={styles.sectionTitle}>Rapprochement caisse</Text>
        </View>
        <View style={styles.reconciliationGrid}>
          <View style={styles.reconItem}>
            <Text style={styles.reconLabel}>Total factures TTC</Text>
            <Text style={styles.reconValue}>{formatCurrency(analytics.totalSpent)}</Text>
          </View>
          <View style={styles.reconItem}>
            <Text style={styles.reconLabel}>Total HT</Text>
            <Text style={styles.reconValue}>
              {formatCurrency(analytics.totalSpent - analytics.vatTotal)}
            </Text>
          </View>
          <View style={styles.reconItem}>
            <Text style={styles.reconLabel}>TVA recuperable</Text>
            <Text style={styles.reconValue}>{formatCurrency(analytics.vatTotal)}</Text>
          </View>
          <View style={styles.reconItem}>
            <Text style={styles.reconLabel}>En attente</Text>
            <Text style={[styles.reconValue, { color: colors.status.warning }]}>
              {analytics.pendingValidation}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  loadingText: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: 40,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text.primary,
    marginBottom: 20,
  },
  // KPI Grid
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  kpiCard: {
    backgroundColor: colors.background.card,
    borderRadius: 14,
    padding: 16,
    width: (SCREEN_WIDTH - 44) / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  kpiIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text.primary,
    marginBottom: 2,
  },
  kpiLabel: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  // Pending Alert
  pendingAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.status.warning + '15',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  pendingText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.status.warning,
  },
  // Sections
  section: {
    backgroundColor: colors.background.card,
    borderRadius: 14,
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
  emptyText: {
    fontSize: 14,
    color: colors.text.disabled,
    textAlign: 'center',
    paddingVertical: 12,
  },
  // Category Breakdown
  categoryRow: {
    marginBottom: 14,
  },
  categoryLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.primary,
    flex: 1,
  },
  categoryAmount: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text.primary,
    marginRight: 8,
  },
  categoryPct: {
    fontSize: 12,
    color: colors.text.secondary,
    width: 45,
    textAlign: 'right',
  },
  barBackground: {
    height: 6,
    backgroundColor: colors.secondary.soft,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  // Monthly Chart
  monthlyChart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 170,
    paddingTop: 10,
  },
  monthColumn: {
    alignItems: 'center',
    flex: 1,
  },
  monthAmount: {
    fontSize: 10,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  monthBarContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    width: '100%',
    alignItems: 'center',
  },
  monthBar: {
    width: '60%',
    borderRadius: 4,
    minHeight: 4,
  },
  monthLabel: {
    fontSize: 10,
    color: colors.text.secondary,
    marginTop: 6,
    fontWeight: '600',
  },
  // Top Suppliers
  supplierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary.soft,
  },
  supplierRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary.soft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  supplierRankText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.primary.main,
  },
  supplierInfo: {
    flex: 1,
  },
  supplierName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  supplierMeta: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  supplierTotal: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary.main,
  },
  // Reconciliation
  reconciliationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  reconciliationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  reconItem: {
    width: '47%',
    backgroundColor: colors.background.primary,
    borderRadius: 10,
    padding: 12,
  },
  reconLabel: {
    fontSize: 11,
    color: colors.text.secondary,
    marginBottom: 4,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  reconValue: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text.primary,
  },
});

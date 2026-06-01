import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SalesStackParamList } from '../../navigation/types';
import { Colors, FontSizes, Spacing, Radius, Shadow } from '../../theme';
import { CURRENCY } from '../../data/dummyData';
import { useAuth } from '../../context/AuthContext';
import { getSalesRequest } from '../../api/resources';
import { Transaction } from '../../api/types';

type Props = NativeStackScreenProps<SalesStackParamList, 'SalesList'>;

const STATUS_COLOR: Record<string, string> = {
  paid: Colors.primary,
  unpaid: Colors.warning,
  partial: Colors.info,
};

function formatDate(isoDate: string) {
  return new Date(isoDate).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatStatus(status: Transaction['payment_status']) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export default function SalesListScreen({ navigation }: Props) {
  const { token } = useAuth();
  const [sales, setSales] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadSales = useCallback(async () => {
    if (!token) {
      setSales([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await getSalesRequest(token);
      setSales(response);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Failed to load sales');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadSales();
  }, [loadSales]);

  const total = useMemo(
    () => sales.reduce((sum, sale) => sum + Number(sale.total_amount), 0),
    [sales],
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

      <View style={styles.banner}>
        <View>
          <Text style={styles.bannerLabel}>Total Sales</Text>
          <Text style={styles.bannerValue}>
            {CURRENCY}{total.toLocaleString('en-IN')}
          </Text>
        </View>
        <Text style={styles.bannerCount}>{sales.length} invoices</Text>
      </View>

      {isLoading ? (
        <View style={styles.centerState}>
          <ActivityIndicator color={Colors.primary} />
          <Text style={styles.stateText}>Loading sales...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerState}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadSales} activeOpacity={0.85}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={sales}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
          renderItem={({ item }) => {
            const statusColor = STATUS_COLOR[item.payment_status] ?? Colors.textMuted;

            return (
              <TouchableOpacity style={[styles.row, Shadow.card]} activeOpacity={0.75}>
                <View style={styles.rowLeft}>
                  <View style={styles.iconBox}>
                    <Ionicons name="receipt-outline" size={18} color={Colors.primary} />
                  </View>
                  <View>
                    <Text style={styles.rowParty}>{item.party?.name || 'Walk-in customer'}</Text>
                    <Text style={styles.rowDate}>{formatDate(item.transaction_date)}  ·  #{item.invoice_number || item.id.slice(0, 8)}</Text>
                  </View>
                </View>
                <View style={styles.rowRight}>
                  <Text style={styles.rowAmount}>{CURRENCY}{Number(item.total_amount).toLocaleString('en-IN')}</Text>
                  <View style={[styles.badge, { backgroundColor: statusColor + '22' }]}>
                    <Text style={[styles.badgeText, { color: statusColor }]}>
                      {formatStatus(item.payment_status)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={<Text style={styles.empty}>No sales yet</Text>}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddSale')}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color={Colors.textInverse} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  banner: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: Colors.cardBorder,
  },
  bannerLabel: { fontSize: FontSizes.xs, color: Colors.primary + 'cc' },
  bannerValue: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.primary },
  bannerCount: { fontSize: FontSizes.sm, color: Colors.primary + 'aa' },
  list: { padding: Spacing.lg, paddingBottom: 80 },
  sep: { height: Spacing.sm },
  row: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: Colors.card, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.cardBorder, padding: Spacing.md,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconBox: {
    width: 36, height: 36, borderRadius: Radius.sm,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md,
  },
  rowParty: { fontSize: FontSizes.sm, fontWeight: '600', color: Colors.textPrimary },
  rowDate: { fontSize: FontSizes.xs, color: Colors.textMuted, marginTop: 2 },
  rowRight: { alignItems: 'flex-end' },
  rowAmount: { fontSize: FontSizes.sm, fontWeight: '700', color: Colors.textPrimary },
  badge: { borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 2, marginTop: 4 },
  badgeText: { fontSize: 10, fontWeight: '600' },
  empty: { textAlign: 'center', color: Colors.textMuted, marginTop: 40 },
  centerState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  stateText: { color: Colors.textMuted, marginTop: Spacing.sm },
  errorText: { color: Colors.danger, textAlign: 'center' },
  retryButton: { marginTop: Spacing.md, backgroundColor: Colors.primary, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: Radius.md },
  retryText: { color: Colors.textInverse, fontWeight: '600' },
  fab: {
    position: 'absolute', bottom: 24, right: 24,
    width: 56, height: 56, borderRadius: Radius.full,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
    ...Shadow.card,
  },
});
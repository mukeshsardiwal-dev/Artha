import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, StatusBar, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSizes, Spacing, Radius, Shadow } from '../../theme';
import { CURRENCY } from '../../data/dummyData';
import { useAuth } from '../../context/AuthContext';
import { getCashbookBalanceRequest, getCashbookEntriesRequest } from '../../api/resources';
import { CashbookBalance, CashbookEntry } from '../../api/types';

function formatDate(isoDate: string) {
  return new Date(isoDate).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function CashbookScreen() {
  const { token } = useAuth();
  const [entries, setEntries] = useState<CashbookEntry[]>([]);
  const [balance, setBalance] = useState<CashbookBalance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadCashbook = useCallback(async () => {
    if (!token) {
      setEntries([]);
      setBalance(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const [entriesResponse, balanceResponse] = await Promise.all([
        getCashbookEntriesRequest(token),
        getCashbookBalanceRequest(token),
      ]);

      setEntries(entriesResponse);
      setBalance(balanceResponse);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Failed to load cashbook');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadCashbook();
  }, [loadCashbook]);

  const summary = useMemo(() => {
    return {
      totalIn: Number(balance?.total_receipts ?? 0),
      totalOut: Number(balance?.total_payments ?? 0),
      currentBalance: Number(balance?.current_balance ?? 0),
    };
  }, [balance]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total In</Text>
          <Text style={[styles.summaryValue, { color: Colors.primary }]}>
            {CURRENCY}{summary.totalIn.toLocaleString('en-IN')}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Out</Text>
          <Text style={[styles.summaryValue, { color: Colors.danger }]}>
            {CURRENCY}{summary.totalOut.toLocaleString('en-IN')}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Balance</Text>
          <Text style={[styles.summaryValue, { color: summary.currentBalance >= 0 ? Colors.primary : Colors.danger }]}>
            {CURRENCY}{Math.abs(summary.currentBalance).toLocaleString('en-IN')}
          </Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.centerState}>
          <ActivityIndicator color={Colors.primary} />
          <Text style={styles.stateText}>Loading cashbook...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerState}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadCashbook} activeOpacity={0.85}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={entries}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
          renderItem={({ item }) => {
            const isInflow = item.type === 'receipt' || item.type === 'opening_balance';
            const iconName = isInflow ? 'arrow-down' : 'arrow-up';
            const amountColor = isInflow ? Colors.primary : Colors.danger;

            return (
              <View style={[styles.row, Shadow.card]}>
                <View style={[styles.typeIcon, { backgroundColor: isInflow ? Colors.primaryMuted : '#2d1a1a' }]}>
                  <Ionicons
                    name={iconName}
                    size={16}
                    color={amountColor}
                  />
                </View>
                <View style={styles.info}>
                  <Text style={styles.narration}>{item.description}</Text>
                  <Text style={styles.date}>{formatDate(item.entry_date)}</Text>
                </View>
                <Text style={[styles.amount, { color: amountColor }]}>
                  {isInflow ? '+' : '-'}{CURRENCY}{Number(item.amount).toLocaleString('en-IN')}
                </Text>
              </View>
            );
          }}
          ListEmptyComponent={<Text style={styles.emptyText}>No cashbook entries found.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  summary: { flexDirection: 'row', backgroundColor: Colors.card, borderBottomWidth: 1, borderBottomColor: Colors.cardBorder, padding: Spacing.md },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryLabel: { fontSize: FontSizes.xs, color: Colors.textMuted },
  summaryValue: { fontSize: FontSizes.md, fontWeight: '700', marginTop: 2 },
  divider: { width: 1, backgroundColor: Colors.cardBorder, marginHorizontal: Spacing.xs },
  list: { padding: Spacing.lg, paddingBottom: 30 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.cardBorder, padding: Spacing.md },
  typeIcon: { width: 36, height: 36, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
  info: { flex: 1 },
  narration: { fontSize: FontSizes.sm, fontWeight: '500', color: Colors.textPrimary },
  date: { fontSize: FontSizes.xs, color: Colors.textMuted, marginTop: 2 },
  amount: { fontSize: FontSizes.sm, fontWeight: '700' },
  centerState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  stateText: { color: Colors.textMuted, marginTop: Spacing.sm },
  errorText: { color: Colors.danger, textAlign: 'center' },
  retryButton: { marginTop: Spacing.md, backgroundColor: Colors.primary, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: Radius.md },
  retryText: { color: Colors.textInverse, fontWeight: '600' },
  emptyText: { color: Colors.textMuted, textAlign: 'center', marginTop: Spacing.xl },
});
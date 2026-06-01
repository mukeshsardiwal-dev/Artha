import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PartiesStackParamList } from '../../navigation/types';
import { Colors, FontSizes, Spacing, Radius, Shadow } from '../../theme';
import { CURRENCY } from '../../data/dummyData';
import { useAuth } from '../../context/AuthContext';
import { getPartiesRequest } from '../../api/resources';
import { Party } from '../../api/types';

type Props = NativeStackScreenProps<PartiesStackParamList, 'PartiesList'>;

export default function PartiesListScreen({ navigation }: Props) {
  const { token } = useAuth();
  const [parties, setParties] = useState<Party[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadParties = useCallback(async () => {
    if (!token) {
      setParties([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await getPartiesRequest(token);
      setParties(response);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Failed to load parties');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadParties();
  }, [loadParties]);

  const customerCount = useMemo(
    () => parties.filter((party) => party.type.toLowerCase() === 'customer').length,
    [parties],
  );

  const supplierCount = useMemo(
    () => parties.filter((party) => party.type.toLowerCase() === 'supplier').length,
    [parties],
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

      {isLoading ? (
        <View style={styles.centerState}>
          <ActivityIndicator color={Colors.primary} />
          <Text style={styles.stateText}>Loading parties...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerState}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadParties} activeOpacity={0.85}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={parties}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
          renderItem={({ item }) => {
            const normalizedType = item.type.toLowerCase();
            const displayType = normalizedType === 'customer' ? 'Customer' : 'Supplier';

            return (
              <TouchableOpacity style={[styles.row, Shadow.card]} activeOpacity={0.75}>
                <View
                  style={[
                    styles.avatar,
                    { backgroundColor: normalizedType === 'customer' ? Colors.primaryMuted : '#1a1a3a' },
                  ]}
                >
                  <Text
                    style={[
                      styles.avatarText,
                      { color: normalizedType === 'customer' ? Colors.primary : Colors.info },
                    ]}
                  >
                    {item.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.info}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.phone}>{item.phone || item.state || 'No contact details'}</Text>
                </View>
                <View style={styles.right}>
                  <Text style={styles.typeBadge}>{displayType}</Text>
                  <Text style={styles.balanceMuted}>{CURRENCY}0</Text>
                </View>
              </TouchableOpacity>
            );
          }}
          ListHeaderComponent={
            <View style={styles.summary}>
              <SummaryChip label="Customers" count={customerCount} color={Colors.primary} />
              <SummaryChip label="Suppliers" count={supplierCount} color={Colors.info} />
            </View>
          }
          ListEmptyComponent={<Text style={styles.emptyText}>No parties found yet.</Text>}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddParty')} activeOpacity={0.85}>
        <Ionicons name="add" size={28} color={Colors.textInverse} />
      </TouchableOpacity>
    </View>
  );
}

function SummaryChip({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <View style={[styles.chip, { borderColor: color + '44', backgroundColor: color + '18' }]}>
      <Text style={[styles.chipCount, { color }]}>{count}</Text>
      <Text style={[styles.chipLabel, { color: color + 'cc' }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  list: { padding: Spacing.lg, paddingBottom: 80 },
  summary: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
  chip: { flex: 1, borderRadius: Radius.md, borderWidth: 1, padding: Spacing.md, alignItems: 'center' },
  chipCount: { fontSize: FontSizes.xl, fontWeight: '700' },
  chipLabel: { fontSize: FontSizes.xs, marginTop: 2 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.cardBorder, padding: Spacing.md },
  avatar: { width: 40, height: 40, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
  avatarText: { fontWeight: '700', fontSize: FontSizes.base },
  info: { flex: 1 },
  name: { fontSize: FontSizes.sm, fontWeight: '600', color: Colors.textPrimary },
  phone: { fontSize: FontSizes.xs, color: Colors.textMuted, marginTop: 2 },
  right: { alignItems: 'flex-end' },
  typeBadge: { fontSize: 10, color: Colors.textSecondary },
  balanceMuted: { fontSize: FontSizes.sm, fontWeight: '700', marginTop: 4, color: Colors.textMuted },
  centerState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  stateText: { color: Colors.textMuted, marginTop: Spacing.sm },
  errorText: { color: Colors.danger, textAlign: 'center' },
  retryButton: { marginTop: Spacing.md, backgroundColor: Colors.primary, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: Radius.md },
  retryText: { color: Colors.textInverse, fontWeight: '600' },
  emptyText: { color: Colors.textMuted, textAlign: 'center', marginTop: Spacing.xl },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: Radius.full, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', ...Shadow.card },
});
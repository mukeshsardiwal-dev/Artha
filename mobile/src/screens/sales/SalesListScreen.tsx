import React from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SalesStackParamList } from '../../navigation/types';
import { Colors, FontSizes, Spacing, Radius, Shadow } from '../../theme';
import { SALES_LIST, CURRENCY } from '../../data/dummyData';

type Props = NativeStackScreenProps<SalesStackParamList, 'SalesList'>;

const STATUS_COLOR: Record<string, string> = {
  Paid: Colors.primary,
  Pending: Colors.warning,
  Partial: Colors.info,
};

export default function SalesListScreen({ navigation }: Props) {
  const total = SALES_LIST.reduce((s, i) => s + i.amount, 0);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

      {/* Summary banner */}
      <View style={styles.banner}>
        <View>
          <Text style={styles.bannerLabel}>Total Sales</Text>
          <Text style={styles.bannerValue}>
            {CURRENCY}{total.toLocaleString('en-IN')}
          </Text>
        </View>
        <Text style={styles.bannerCount}>{SALES_LIST.length} invoices</Text>
      </View>

      <FlatList
        data={SALES_LIST}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        renderItem={({ item }) => (
          <TouchableOpacity style={[styles.row, Shadow.card]} activeOpacity={0.75}>
            <View style={styles.rowLeft}>
              <View style={styles.iconBox}>
                <Ionicons name="receipt-outline" size={18} color={Colors.primary} />
              </View>
              <View>
                <Text style={styles.rowParty}>{item.party}</Text>
                <Text style={styles.rowDate}>{item.date}  ·  #{item.id}</Text>
              </View>
            </View>
            <View style={styles.rowRight}>
              <Text style={styles.rowAmount}>{CURRENCY}{item.amount.toLocaleString('en-IN')}</Text>
              <View style={[styles.badge, { backgroundColor: STATUS_COLOR[item.status] + '22' }]}>
                <Text style={[styles.badgeText, { color: STATUS_COLOR[item.status] }]}>
                  {item.status}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No sales yet</Text>
        }
      />

      {/* FAB */}
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
  fab: {
    position: 'absolute', bottom: 24, right: 24,
    width: 56, height: 56, borderRadius: Radius.full,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
    ...Shadow.card,
  },
});
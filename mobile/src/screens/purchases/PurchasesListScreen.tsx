import React from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PurchasesStackParamList } from '../../navigation/types';
import { Colors, FontSizes, Spacing, Radius, Shadow } from '../../theme';
import { PURCHASES_LIST, CURRENCY } from '../../data/dummyData';

type Props = NativeStackScreenProps<PurchasesStackParamList, 'PurchasesList'>;

const STATUS_COLOR: Record<string, string> = {
  Paid: Colors.primary,
  Pending: Colors.warning,
  Partial: Colors.info,
};

export default function PurchasesListScreen({ navigation }: Props) {
  const total = PURCHASES_LIST.reduce((s, i) => s + i.amount, 0);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />
      <View style={styles.banner}>
        <View>
          <Text style={styles.bannerLabel}>Total Purchases</Text>
          <Text style={styles.bannerValue}>{CURRENCY}{total.toLocaleString('en-IN')}</Text>
        </View>
        <Text style={styles.bannerCount}>{PURCHASES_LIST.length} bills</Text>
      </View>
      <FlatList
        data={PURCHASES_LIST}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
        renderItem={({ item }) => (
          <TouchableOpacity style={[styles.row, Shadow.card]} activeOpacity={0.75}>
            <View style={styles.rowLeft}>
              <View style={styles.iconBox}>
                <Ionicons name="cart-outline" size={18} color={Colors.info} />
              </View>
              <View>
                <Text style={styles.rowParty}>{item.party}</Text>
                <Text style={styles.rowDate}>{item.date}  ·  #{item.id}</Text>
              </View>
            </View>
            <View style={styles.rowRight}>
              <Text style={styles.rowAmount}>{CURRENCY}{item.amount.toLocaleString('en-IN')}</Text>
              <View style={[styles.badge, { backgroundColor: STATUS_COLOR[item.status] + '22' }]}>
                <Text style={[styles.badgeText, { color: STATUS_COLOR[item.status] }]}>{item.status}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity style={[styles.fab, { backgroundColor: Colors.info }]} onPress={() => navigation.navigate('AddPurchase')} activeOpacity={0.85}>
        <Ionicons name="add" size={28} color={Colors.textInverse} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  banner: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0e1f3a', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.cardBorder },
  bannerLabel: { fontSize: FontSizes.xs, color: Colors.info + 'cc' },
  bannerValue: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.info },
  bannerCount: { fontSize: FontSizes.sm, color: Colors.info + 'aa' },
  list: { padding: Spacing.lg, paddingBottom: 80 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.cardBorder, padding: Spacing.md },
  rowLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconBox: { width: 36, height: 36, borderRadius: Radius.sm, backgroundColor: '#0e1f3a', alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
  rowParty: { fontSize: FontSizes.sm, fontWeight: '600', color: Colors.textPrimary },
  rowDate: { fontSize: FontSizes.xs, color: Colors.textMuted, marginTop: 2 },
  rowRight: { alignItems: 'flex-end' },
  rowAmount: { fontSize: FontSizes.sm, fontWeight: '700', color: Colors.textPrimary },
  badge: { borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 2, marginTop: 4 },
  badgeText: { fontSize: 10, fontWeight: '600' },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center', ...Shadow.card },
});
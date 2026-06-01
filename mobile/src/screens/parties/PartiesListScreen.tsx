import React from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PartiesStackParamList } from '../../navigation/types';
import { Colors, FontSizes, Spacing, Radius, Shadow } from '../../theme';
import { PARTIES_LIST, CURRENCY } from '../../data/dummyData';

type Props = NativeStackScreenProps<PartiesStackParamList, 'PartiesList'>;

export default function PartiesListScreen({ navigation }: Props) {
  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />
      <FlatList
        data={PARTIES_LIST}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
        renderItem={({ item }) => (
          <TouchableOpacity style={[styles.row, Shadow.card]} activeOpacity={0.75}>
            {/* Avatar initial */}
            <View style={[styles.avatar, { backgroundColor: item.type === 'Customer' ? Colors.primaryMuted : '#1a1a3a' }]}>
              <Text style={[styles.avatarText, { color: item.type === 'Customer' ? Colors.primary : Colors.info }]}>
                {item.name.charAt(0)}
              </Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.phone}>{item.phone}</Text>
            </View>
            <View style={styles.right}>
              <Text style={styles.typeBadge}>{item.type}</Text>
              <Text style={[styles.balance, { color: item.balance >= 0 ? Colors.primary : Colors.danger }]}>
                {item.balance >= 0 ? '+' : ''}{CURRENCY}{Math.abs(item.balance).toLocaleString('en-IN')}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListHeaderComponent={
          <View style={styles.summary}>
            <SummaryChip label="Customers" count={PARTIES_LIST.filter(p => p.type === 'Customer').length} color={Colors.primary} />
            <SummaryChip label="Suppliers" count={PARTIES_LIST.filter(p => p.type === 'Supplier').length} color={Colors.info} />
          </View>
        }
      />
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
  balance: { fontSize: FontSizes.sm, fontWeight: '700', marginTop: 4 },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: Radius.full, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', ...Shadow.card },
});
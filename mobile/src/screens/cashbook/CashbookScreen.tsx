import React from 'react';
import { View, Text, StyleSheet, FlatList, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSizes, Spacing, Radius, Shadow } from '../../theme';
import { CASHBOOK_ENTRIES, CURRENCY } from '../../data/dummyData';

export default function CashbookScreen() {
  const totalIn  = CASHBOOK_ENTRIES.filter(e => e.type === 'In').reduce((s, e) => s + e.amount, 0);
  const totalOut = CASHBOOK_ENTRIES.filter(e => e.type === 'Out').reduce((s, e) => s + e.amount, 0);
  const balance  = totalIn - totalOut;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

      {/* Summary bar */}
      <View style={styles.summary}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total In</Text>
          <Text style={[styles.summaryValue, { color: Colors.primary }]}>
            {CURRENCY}{totalIn.toLocaleString('en-IN')}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Out</Text>
          <Text style={[styles.summaryValue, { color: Colors.danger }]}>
            {CURRENCY}{totalOut.toLocaleString('en-IN')}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Balance</Text>
          <Text style={[styles.summaryValue, { color: balance >= 0 ? Colors.primary : Colors.danger }]}>
            {CURRENCY}{Math.abs(balance).toLocaleString('en-IN')}
          </Text>
        </View>
      </View>

      <FlatList
        data={CASHBOOK_ENTRIES}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
        renderItem={({ item }) => (
          <View style={[styles.row, Shadow.card]}>
            <View style={[styles.typeIcon, { backgroundColor: item.type === 'In' ? Colors.primaryMuted : '#2d1a1a' }]}>
              <Ionicons
                name={item.type === 'In' ? 'arrow-down' : 'arrow-up'}
                size={16}
                color={item.type === 'In' ? Colors.primary : Colors.danger}
              />
            </View>
            <View style={styles.info}>
              <Text style={styles.narration}>{item.narration}</Text>
              <Text style={styles.date}>{item.date}</Text>
            </View>
            <Text style={[styles.amount, { color: item.type === 'In' ? Colors.primary : Colors.danger }]}>
              {item.type === 'In' ? '+' : '-'}{CURRENCY}{item.amount.toLocaleString('en-IN')}
            </Text>
          </View>
        )}
      />
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
});
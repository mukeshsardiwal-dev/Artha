import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSizes, Spacing, Radius, Shadow } from '../../theme';
import { SALES_LIST, PURCHASES_LIST, CASHBOOK_ENTRIES, PARTIES_LIST, CURRENCY } from '../../data/dummyData';

interface ReportCardProps {
  title: string;
  value: string;
  subtext: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

function ReportCard({ title, value, subtext, icon, color }: ReportCardProps) {
  return (
    <View style={[styles.card, Shadow.card]}>
      <View style={styles.cardHeader}>
        <View style={[styles.cardIcon, { backgroundColor: color + '22' }]}>
          <Ionicons name={icon} size={20} color={color} />
        </View>
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      <Text style={[styles.cardValue, { color }]}>{value}</Text>
      <Text style={styles.cardSubtext}>{subtext}</Text>
    </View>
  );
}

export default function ReportsScreen() {
  const totalSales     = SALES_LIST.reduce((s, i) => s + i.amount, 0);
  const totalPurchases = PURCHASES_LIST.reduce((s, i) => s + i.amount, 0);
  const grossProfit    = totalSales - totalPurchases;
  const cashIn         = CASHBOOK_ENTRIES.filter(e => e.type === 'In').reduce((s, e) => s + e.amount, 0);
  const cashOut        = CASHBOOK_ENTRIES.filter(e => e.type === 'Out').reduce((s, e) => s + e.amount, 0);
  const receivable     = PARTIES_LIST.filter(p => p.balance > 0).reduce((s, p) => s + p.balance, 0);
  const payable        = PARTIES_LIST.filter(p => p.balance < 0).reduce((s, p) => s + Math.abs(p.balance), 0);

  const fmt = (n: number) => `${CURRENCY}${n.toLocaleString('en-IN')}`;

  const CARDS: ReportCardProps[] = [
    { title: 'Total Sales',     value: fmt(totalSales),     subtext: `${SALES_LIST.length} invoices`,      icon: 'trending-up',     color: Colors.primary  },
    { title: 'Total Purchases', value: fmt(totalPurchases), subtext: `${PURCHASES_LIST.length} bills`,     icon: 'cart',            color: Colors.info     },
    { title: 'Gross Profit',    value: fmt(grossProfit),    subtext: `${((grossProfit / totalSales) * 100).toFixed(1)}% margin`, icon: 'bar-chart',  color: '#a371f7'       },
    { title: 'Cash Inflow',     value: fmt(cashIn),         subtext: 'Total receipts',                     icon: 'arrow-down-circle', color: Colors.primary  },
    { title: 'Cash Outflow',    value: fmt(cashOut),        subtext: 'Total payments',                     icon: 'arrow-up-circle',   color: Colors.danger   },
    { title: 'Net Cash Flow',   value: fmt(cashIn - cashOut), subtext: 'Cash position',                   icon: 'cash',            color: Colors.warning  },
    { title: 'Total Receivable',value: fmt(receivable),     subtext: `${PARTIES_LIST.filter(p => p.balance > 0).length} parties`, icon: 'people',   color: '#3fb950'       },
    { title: 'Total Payable',   value: fmt(payable),        subtext: `${PARTIES_LIST.filter(p => p.balance < 0).length} parties`, icon: 'business', color: Colors.danger   },
  ];

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.periodBadge}>
          <Ionicons name="calendar-outline" size={14} color={Colors.textSecondary} />
          <Text style={styles.periodText}>All Time Summary</Text>
        </View>

        <View style={styles.grid}>
          {CARDS.map((c) => (
            <ReportCard key={c.title} {...c} />
          ))}
        </View>

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: Spacing.lg },
  periodBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.cardBorder, borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: 6, alignSelf: 'flex-start', marginBottom: Spacing.lg },
  periodText: { fontSize: FontSizes.xs, color: Colors.textSecondary },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  card: { width: '47%', backgroundColor: Colors.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.cardBorder, padding: Spacing.md },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  cardIcon: { width: 32, height: 32, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: FontSizes.xs, color: Colors.textSecondary, flex: 1 },
  cardValue: { fontSize: FontSizes.lg, fontWeight: '700' },
  cardSubtext: { fontSize: FontSizes.xs, color: Colors.textMuted, marginTop: 4 },
});
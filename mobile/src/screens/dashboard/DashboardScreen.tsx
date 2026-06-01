import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Colors, FontSizes, Spacing, Radius, Shadow } from '../../theme';
import {
  DASHBOARD_STATS,
  TOP_ITEMS_TODAY,
  CURRENCY,
  COMPANY_NAME,
} from '../../data/dummyData';
import { AppTabsParamList } from '../../navigation/types';

type TabNav = BottomTabNavigationProp<AppTabsParamList>;

function formatAmount(n: number) {
  if (n >= 100000) return `${CURRENCY}${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `${CURRENCY}${(n / 1000).toFixed(1)}K`;
  return `${CURRENCY}${n.toLocaleString('en-IN')}`;
}

function StatCard({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <View style={[styles.statCard, Shadow.card]}>
      <View style={[styles.statAccent, { backgroundColor: accent }]} />
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color: accent }]}>{formatAmount(value)}</Text>
    </View>
  );
}

interface QuickAction {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  tab: keyof AppTabsParamList;
}

const QUICK_ACTIONS: QuickAction[] = [
  { label: 'Add Sale',     icon: 'add-circle',       tab: 'Sales'     },
  { label: 'Add Purchase', icon: 'cart',              tab: 'Purchases' },
  { label: 'Add Party',    icon: 'people',            tab: 'Parties'   },
  { label: 'Reports',      icon: 'bar-chart',         tab: 'More'      },
];

export default function DashboardScreen() {
  const navigation = useNavigation<TabNav>();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.companyName}>{COMPANY_NAME}</Text>
            <Text style={styles.greeting}>Good morning 👋</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>N</Text>
          </View>
        </View>

        {/* Stat Cards — 2-column grid */}
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.statsGrid}>
          {DASHBOARD_STATS.map((s) => (
            <StatCard key={s.id} label={s.label} value={s.value} accent={s.accent} />
          ))}
        </View>

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsRow}>
          {QUICK_ACTIONS.map((a) => (
            <TouchableOpacity
              key={a.label}
              style={styles.actionBtn}
              onPress={() => navigation.navigate(a.tab)}
              activeOpacity={0.75}
            >
              <View style={styles.actionIcon}>
                <Ionicons name={a.icon} size={22} color={Colors.primary} />
              </View>
              <Text style={styles.actionLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Top Items Today */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Top Items Today</Text>
        </View>
        <View style={[styles.card, Shadow.card]}>
          {TOP_ITEMS_TODAY.map((item, idx) => (
            <View
              key={item.id}
              style={[styles.itemRow, idx < TOP_ITEMS_TODAY.length - 1 && styles.itemRowBorder]}
            >
              <View style={styles.itemRank}>
                <Text style={styles.itemRankText}>{idx + 1}</Text>
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemQty}>
                  {item.qty} {item.unit}s
                </Text>
              </View>
              <Text style={styles.itemAmount}>
                {CURRENCY}{item.amount.toLocaleString('en-IN')}
              </Text>
            </View>
          ))}
        </View>

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  companyName: { fontSize: FontSizes.md, fontWeight: '700', color: Colors.textPrimary },
  greeting: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: 2 },
  avatar: {
    width: 40, height: 40, borderRadius: Radius.full,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: Colors.primary,
  },
  avatarText: { color: Colors.primary, fontWeight: '700', fontSize: FontSizes.base },

  sectionTitle: {
    fontSize: FontSizes.base,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
    marginTop: Spacing.xs,
  },
  sectionHeader: { marginTop: Spacing.xl },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  statCard: {
    width: '47%',
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: Spacing.md,
    overflow: 'hidden',
  },
  statAccent: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, borderRadius: 2 },
  statLabel: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginBottom: 6, marginLeft: 8 },
  statValue: { fontSize: FontSizes.lg, fontWeight: '700', marginLeft: 8 },

  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  actionBtn: { alignItems: 'center', flex: 1 },
  actionIcon: {
    width: 52, height: 52, borderRadius: Radius.lg,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 6,
    borderWidth: 1, borderColor: Colors.primary + '44',
  },
  actionLabel: { fontSize: 10, color: Colors.textSecondary, textAlign: 'center' },

  card: {
    backgroundColor: Colors.card,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    overflow: 'hidden',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  itemRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.cardBorder },
  itemRank: {
    width: 28, height: 28, borderRadius: Radius.full,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center', justifyContent: 'center',
    marginRight: Spacing.md,
  },
  itemRankText: { color: Colors.primary, fontSize: FontSizes.xs, fontWeight: '700' },
  itemInfo: { flex: 1 },
  itemName: { fontSize: FontSizes.sm, fontWeight: '600', color: Colors.textPrimary },
  itemQty: { fontSize: FontSizes.xs, color: Colors.textMuted, marginTop: 2 },
  itemAmount: { fontSize: FontSizes.sm, fontWeight: '600', color: Colors.textPrimary },
});
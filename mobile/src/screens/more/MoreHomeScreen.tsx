import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MoreStackParamList } from '../../navigation/types';
import { Colors, FontSizes, Spacing, Radius, Shadow } from '../../theme';

type Props = NativeStackScreenProps<MoreStackParamList, 'MoreHome'>;

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  sublabel: string;
  color: string;
  onPress: () => void;
}

function MenuItem({ icon, label, sublabel, color, onPress }: MenuItemProps) {
  return (
    <TouchableOpacity style={[styles.menuItem, Shadow.card]} onPress={onPress} activeOpacity={0.75}>
      <View style={[styles.menuIcon, { backgroundColor: color + '22' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.menuInfo}>
        <Text style={styles.menuLabel}>{label}</Text>
        <Text style={styles.menuSublabel}>{sublabel}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
    </TouchableOpacity>
  );
}

export default function MoreHomeScreen({ navigation }: Props) {
  const MENU = [
    { icon: 'cube-outline'          as const, label: 'Items',    sublabel: 'Manage your inventory',        color: Colors.warning, nav: 'Items'    as const },
    { icon: 'book-outline'          as const, label: 'Cashbook', sublabel: 'Cash in / out transactions',   color: Colors.info,    nav: 'Cashbook' as const },
    { icon: 'bar-chart-outline'     as const, label: 'Reports',  sublabel: 'Business summary & analytics', color: '#a371f7',      nav: 'Reports'  as const },
    { icon: 'settings-outline'      as const, label: 'Settings', sublabel: 'App settings & preferences',  color: Colors.textSecondary, nav: 'Settings' as const },
  ];

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>More</Text>
        {MENU.map((m) => (
          <MenuItem
            key={m.label}
            icon={m.icon}
            label={m.label}
            sublabel={m.sublabel}
            color={m.color}
            onPress={() => navigation.navigate(m.nav)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: Spacing.lg },
  heading: { fontSize: FontSizes.xl, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.xl },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.card, borderRadius: Radius.md,
    borderWidth: 1, borderColor: Colors.cardBorder,
    padding: Spacing.md, marginBottom: Spacing.md,
  },
  menuIcon: { width: 48, height: 48, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
  menuInfo: { flex: 1 },
  menuLabel: { fontSize: FontSizes.base, fontWeight: '600', color: Colors.textPrimary },
  menuSublabel: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginTop: 3 },
});
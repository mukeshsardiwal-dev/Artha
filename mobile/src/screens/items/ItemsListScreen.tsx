import React from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MoreStackParamList } from '../../navigation/types';
import { Colors, FontSizes, Spacing, Radius, Shadow } from '../../theme';
import { ITEMS_LIST, CURRENCY } from '../../data/dummyData';

type Props = NativeStackScreenProps<MoreStackParamList, 'Items'>;

export default function ItemsListScreen({ navigation }: Props) {
  return (
    <View style={styles.root}>
      <FlatList
        data={ITEMS_LIST}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
        renderItem={({ item }) => (
          <TouchableOpacity style={[styles.row, Shadow.card]} activeOpacity={0.75}>
            <View style={styles.iconBox}>
              <Ionicons name="cube-outline" size={18} color={Colors.warning} />
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.unit}>per {item.unit}</Text>
            </View>
            <View style={styles.right}>
              <Text style={styles.salePrice}>Sale: {CURRENCY}{item.salePrice}</Text>
              <Text style={styles.purchasePrice}>Purchase: {CURRENCY}{item.purchasePrice}</Text>
              <View style={styles.stockBadge}>
                <Text style={styles.stockText}>Stock: {item.stock}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListHeaderComponent={
          <Text style={styles.countHeader}>{ITEMS_LIST.length} items in inventory</Text>
        }
      />
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: Colors.warning }]}
        onPress={() => navigation.navigate('AddItem')}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color={Colors.textInverse} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  list: { padding: Spacing.lg, paddingBottom: 80 },
  countHeader: { fontSize: FontSizes.xs, color: Colors.textMuted, marginBottom: Spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.cardBorder, padding: Spacing.md },
  iconBox: { width: 36, height: 36, borderRadius: Radius.sm, backgroundColor: '#2a1a00', alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
  info: { flex: 1 },
  name: { fontSize: FontSizes.sm, fontWeight: '600', color: Colors.textPrimary },
  unit: { fontSize: FontSizes.xs, color: Colors.textMuted, marginTop: 2 },
  right: { alignItems: 'flex-end' },
  salePrice: { fontSize: FontSizes.xs, color: Colors.primary, fontWeight: '600' },
  purchasePrice: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginTop: 2 },
  stockBadge: { backgroundColor: Colors.cardBorder, borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 2, marginTop: 4 },
  stockText: { fontSize: 10, color: Colors.textSecondary },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center', ...Shadow.card },
});
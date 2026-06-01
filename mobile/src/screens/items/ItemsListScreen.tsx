import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MoreStackParamList } from '../../navigation/types';
import { Colors, FontSizes, Spacing, Radius, Shadow } from '../../theme';
import { CURRENCY } from '../../data/dummyData';
import { useAuth } from '../../context/AuthContext';
import { getItemsRequest } from '../../api/resources';
import { Item } from '../../api/types';

type Props = NativeStackScreenProps<MoreStackParamList, 'Items'>;

export default function ItemsListScreen({ navigation }: Props) {
  const { token } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadItems = useCallback(async () => {
    if (!token) {
      setItems([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await getItemsRequest(token);
      setItems(response);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Failed to load items');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  return (
    <View style={styles.root}>
      {isLoading ? (
        <View style={styles.centerState}>
          <ActivityIndicator color={Colors.warning} />
          <Text style={styles.stateText}>Loading items...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerState}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadItems} activeOpacity={0.85}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
          renderItem={({ item }) => (
            <TouchableOpacity style={[styles.row, Shadow.card]} activeOpacity={0.75}>
              <View style={styles.iconBox}>
                <Ionicons name="cube-outline" size={18} color={Colors.warning} />
              </View>
              <View style={styles.info}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.unit}>{item.category || `per ${item.unit}`}</Text>
              </View>
              <View style={styles.right}>
                <Text style={styles.salePrice}>GST: {item.gst_rate}%</Text>
                <Text style={styles.purchasePrice}>{item.hsn_code || 'No HSN code'}</Text>
                <View style={styles.stockBadge}>
                  <Text style={styles.stockText}>{CURRENCY} --</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListHeaderComponent={
            <Text style={styles.countHeader}>{items.length} items in inventory</Text>
          }
          ListEmptyComponent={<Text style={styles.emptyText}>No items found yet.</Text>}
        />
      )}
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
  centerState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing.xl },
  stateText: { color: Colors.textMuted, marginTop: Spacing.sm },
  errorText: { color: Colors.danger, textAlign: 'center' },
  retryButton: { marginTop: Spacing.md, backgroundColor: Colors.warning, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: Radius.md },
  retryText: { color: Colors.textInverse, fontWeight: '600' },
  emptyText: { color: Colors.textMuted, textAlign: 'center', marginTop: Spacing.xl },
  fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center', ...Shadow.card },
});
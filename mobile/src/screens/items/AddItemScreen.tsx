import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MoreStackParamList } from '../../navigation/types';
import { Colors, FontSizes, Spacing, Radius } from '../../theme';
import { CURRENCY } from '../../data/dummyData';

type Props = NativeStackScreenProps<MoreStackParamList, 'AddItem'>;

const UNITS = ['kg', 'litre', 'bag', 'bale', 'piece', 'box', 'ton'];

export default function AddItemScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('kg');
  const [salePrice, setSalePrice] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [openingStock, setOpeningStock] = useState('');
  const [description, setDescription] = useState('');

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        <Text style={styles.sectionTitle}>Item Info</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Item Name *</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Cotton Bales" placeholderTextColor={Colors.textMuted} />

          <Text style={styles.label}>Unit</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.unitScroll}>
            {UNITS.map((u) => (
              <TouchableOpacity
                key={u}
                style={[styles.unitChip, unit === u && styles.unitChipActive]}
                onPress={() => setUnit(u)}
              >
                <Text style={[styles.unitChipText, unit === u && styles.unitChipTextActive]}>{u}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <Text style={styles.sectionTitle}>Pricing</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.halfField}>
              <Text style={styles.label}>Sale Price ({CURRENCY})</Text>
              <TextInput style={styles.input} value={salePrice} onChangeText={setSalePrice} keyboardType="numeric" placeholder="0.00" placeholderTextColor={Colors.textMuted} />
            </View>
            <View style={styles.halfField}>
              <Text style={styles.label}>Purchase Price ({CURRENCY})</Text>
              <TextInput style={styles.input} value={purchasePrice} onChangeText={setPurchasePrice} keyboardType="numeric" placeholder="0.00" placeholderTextColor={Colors.textMuted} />
            </View>
          </View>

          <Text style={styles.label}>Opening Stock</Text>
          <TextInput style={styles.input} value={openingStock} onChangeText={setOpeningStock} keyboardType="numeric" placeholder="0" placeholderTextColor={Colors.textMuted} />
        </View>

        <Text style={styles.sectionTitle}>Description</Text>
        <View style={styles.card}>
          <TextInput style={[styles.input, styles.textarea]} value={description} onChangeText={setDescription} placeholder="Optional description…" placeholderTextColor={Colors.textMuted} multiline numberOfLines={2} />
        </View>

        <TouchableOpacity style={[styles.saveBtn, { backgroundColor: Colors.warning }]} onPress={() => navigation.goBack()} activeOpacity={0.85}>
          <Ionicons name="checkmark-circle" size={20} color={Colors.textInverse} />
          <Text style={styles.saveBtnText}>Save Item</Text>
        </TouchableOpacity>

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: Spacing.lg },
  sectionTitle: { fontSize: FontSizes.xs, fontWeight: '600', color: Colors.textSecondary, marginBottom: Spacing.sm, marginTop: Spacing.md, textTransform: 'uppercase', letterSpacing: 0.5 },
  card: { backgroundColor: Colors.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.cardBorder, padding: Spacing.md, marginBottom: Spacing.sm },
  label: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginBottom: Spacing.xs, fontWeight: '500' },
  input: { backgroundColor: Colors.input, borderWidth: 1, borderColor: Colors.inputBorder, borderRadius: Radius.sm, padding: Spacing.sm, color: Colors.textPrimary, fontSize: FontSizes.base, marginBottom: Spacing.sm },
  textarea: { height: 70, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: Spacing.sm },
  halfField: { flex: 1 },
  unitScroll: { marginBottom: Spacing.sm },
  unitChip: { borderRadius: Radius.full, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1, borderColor: Colors.cardBorder, marginRight: Spacing.sm },
  unitChipActive: { backgroundColor: Colors.primaryMuted, borderColor: Colors.primary },
  unitChipText: { fontSize: FontSizes.xs, color: Colors.textSecondary },
  unitChipTextActive: { color: Colors.primary, fontWeight: '600' },
  saveBtn: { borderRadius: Radius.md, padding: Spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  saveBtnText: { color: Colors.textInverse, fontSize: FontSizes.base, fontWeight: '700' },
});
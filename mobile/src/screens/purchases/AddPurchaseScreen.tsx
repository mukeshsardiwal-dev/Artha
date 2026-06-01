import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PurchasesStackParamList } from '../../navigation/types';
import { Colors, FontSizes, Spacing, Radius } from '../../theme';
import { CURRENCY } from '../../data/dummyData';

type Props = NativeStackScreenProps<PurchasesStackParamList, 'AddPurchase'>;

export default function AddPurchaseScreen({ navigation }: Props) {
  const [supplier, setSupplier] = useState('');
  const [item, setItem] = useState('');
  const [qty, setQty] = useState('');
  const [rate, setRate] = useState('');
  const [note, setNote] = useState('');

  const amount = Number(qty) * Number(rate) || 0;

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        <Text style={styles.sectionTitle}>Supplier Details</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Supplier Name</Text>
          <TextInput style={styles.input} value={supplier} onChangeText={setSupplier} placeholder="Select or type supplier" placeholderTextColor={Colors.textMuted} />
        </View>

        <Text style={styles.sectionTitle}>Item Details</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Item</Text>
          <TextInput style={styles.input} value={item} onChangeText={setItem} placeholder="Select item" placeholderTextColor={Colors.textMuted} />
          <View style={styles.row}>
            <View style={styles.halfField}>
              <Text style={styles.label}>Quantity</Text>
              <TextInput style={styles.input} value={qty} onChangeText={setQty} keyboardType="numeric" placeholder="0" placeholderTextColor={Colors.textMuted} />
            </View>
            <View style={styles.halfField}>
              <Text style={styles.label}>Rate ({CURRENCY})</Text>
              <TextInput style={styles.input} value={rate} onChangeText={setRate} keyboardType="numeric" placeholder="0.00" placeholderTextColor={Colors.textMuted} />
            </View>
          </View>
        </View>

        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Total Amount</Text>
          <Text style={[styles.amountValue, { color: Colors.info }]}>{CURRENCY}{amount.toLocaleString('en-IN')}</Text>
        </View>

        <Text style={styles.sectionTitle}>Notes</Text>
        <View style={styles.card}>
          <TextInput style={[styles.input, styles.textarea]} value={note} onChangeText={setNote} placeholder="Optional notes…" placeholderTextColor={Colors.textMuted} multiline numberOfLines={3} />
        </View>

        <TouchableOpacity style={[styles.saveBtn, { backgroundColor: Colors.info }]} onPress={() => navigation.goBack()} activeOpacity={0.85}>
          <Ionicons name="checkmark-circle" size={20} color={Colors.textInverse} />
          <Text style={styles.saveBtnText}>Save Purchase</Text>
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
  textarea: { height: 80, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: Spacing.sm },
  halfField: { flex: 1 },
  amountCard: { backgroundColor: '#0e1f3a', borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.info + '44', padding: Spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.lg },
  amountLabel: { fontSize: FontSizes.sm, color: Colors.info },
  amountValue: { fontSize: FontSizes.xl, fontWeight: '700' },
  saveBtn: { borderRadius: Radius.md, padding: Spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  saveBtnText: { color: Colors.textInverse, fontSize: FontSizes.base, fontWeight: '700' },
});
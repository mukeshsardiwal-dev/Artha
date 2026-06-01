import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SalesStackParamList } from '../../navigation/types';
import { Colors, FontSizes, Spacing, Radius } from '../../theme';
import { PARTIES_LIST, ITEMS_LIST, CURRENCY } from '../../data/dummyData';

type Props = NativeStackScreenProps<SalesStackParamList, 'AddSale'>;

export default function AddSaleScreen({ navigation }: Props) {
  const [party, setParty] = useState('');
  const [item, setItem] = useState('');
  const [qty, setQty] = useState('');
  const [rate, setRate] = useState('');
  const [note, setNote] = useState('');

  const amount = Number(qty) * Number(rate) || 0;

  const handleSave = () => {
    // TODO: POST to API
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        <Text style={styles.sectionTitle}>Party Details</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Party Name</Text>
          <TextInput
            style={styles.input}
            value={party}
            onChangeText={setParty}
            placeholder="Select or type party name"
            placeholderTextColor={Colors.textMuted}
          />
        </View>

        <Text style={styles.sectionTitle}>Item Details</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Item</Text>
          <TextInput
            style={styles.input}
            value={item}
            onChangeText={setItem}
            placeholder="Select item"
            placeholderTextColor={Colors.textMuted}
          />
          <View style={styles.row}>
            <View style={styles.halfField}>
              <Text style={styles.label}>Quantity</Text>
              <TextInput
                style={styles.input}
                value={qty}
                onChangeText={setQty}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={Colors.textMuted}
              />
            </View>
            <View style={styles.halfField}>
              <Text style={styles.label}>Rate ({CURRENCY})</Text>
              <TextInput
                style={styles.input}
                value={rate}
                onChangeText={setRate}
                keyboardType="numeric"
                placeholder="0.00"
                placeholderTextColor={Colors.textMuted}
              />
            </View>
          </View>
        </View>

        {/* Amount preview */}
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Total Amount</Text>
          <Text style={styles.amountValue}>
            {CURRENCY}{amount.toLocaleString('en-IN')}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Notes</Text>
        <View style={styles.card}>
          <TextInput
            style={[styles.input, styles.textarea]}
            value={note}
            onChangeText={setNote}
            placeholder="Optional notes…"
            placeholderTextColor={Colors.textMuted}
            multiline
            numberOfLines={3}
          />
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.85}>
          <Ionicons name="checkmark-circle" size={20} color={Colors.textInverse} />
          <Text style={styles.saveBtnText}>Save Sale</Text>
        </TouchableOpacity>

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: Spacing.lg },
  sectionTitle: { fontSize: FontSizes.sm, fontWeight: '600', color: Colors.textSecondary, marginBottom: Spacing.sm, marginTop: Spacing.md, textTransform: 'uppercase', letterSpacing: 0.5 },
  card: { backgroundColor: Colors.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.cardBorder, padding: Spacing.md, marginBottom: Spacing.sm },
  label: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginBottom: Spacing.xs, fontWeight: '500' },
  input: { backgroundColor: Colors.input, borderWidth: 1, borderColor: Colors.inputBorder, borderRadius: Radius.sm, padding: Spacing.sm, color: Colors.textPrimary, fontSize: FontSizes.base, marginBottom: Spacing.sm },
  textarea: { height: 80, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: Spacing.sm },
  halfField: { flex: 1 },
  amountCard: {
    backgroundColor: Colors.primaryMuted,
    borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.primary + '44',
    padding: Spacing.md, flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: Spacing.lg,
  },
  amountLabel: { fontSize: FontSizes.sm, color: Colors.primary },
  amountValue: { fontSize: FontSizes.xl, fontWeight: '700', color: Colors.primary },
  saveBtn: {
    backgroundColor: Colors.primary, borderRadius: Radius.md, padding: Spacing.md,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm,
  },
  saveBtnText: { color: Colors.textInverse, fontSize: FontSizes.base, fontWeight: '700' },
});
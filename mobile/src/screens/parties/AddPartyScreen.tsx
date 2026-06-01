import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PartiesStackParamList } from '../../navigation/types';
import { Colors, FontSizes, Spacing, Radius } from '../../theme';

type Props = NativeStackScreenProps<PartiesStackParamList, 'AddParty'>;

const TYPES = ['Customer', 'Supplier', 'Both'] as const;

export default function AddPartyScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [gst, setGst] = useState('');
  const [address, setAddress] = useState('');
  const [type, setType] = useState<typeof TYPES[number]>('Customer');

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* Party type selector */}
        <Text style={styles.sectionTitle}>Party Type</Text>
        <View style={styles.typeRow}>
          {TYPES.map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.typeBtn, type === t && styles.typeBtnActive]}
              onPress={() => setType(t)}
            >
              <Text style={[styles.typeBtnText, type === t && styles.typeBtnTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Party Details</Text>
        <View style={styles.card}>
          {[
            { label: 'Full Name *', value: name, setter: setName, placeholder: 'Ram Traders', keyboard: 'default' },
            { label: 'Phone Number', value: phone, setter: setPhone, placeholder: '9812345678', keyboard: 'phone-pad' },
            { label: 'Email', value: email, setter: setEmail, placeholder: 'party@email.com', keyboard: 'email-address' },
            { label: 'GST Number', value: gst, setter: setGst, placeholder: '22ABCDE1234F1Z5', keyboard: 'default' },
          ].map(({ label, value, setter, placeholder, keyboard }) => (
            <View key={label}>
              <Text style={styles.label}>{label}</Text>
              <TextInput
                style={styles.input}
                value={value}
                onChangeText={setter}
                placeholder={placeholder}
                placeholderTextColor={Colors.textMuted}
                keyboardType={keyboard as any}
                autoCapitalize={keyboard === 'email-address' ? 'none' : 'words'}
              />
            </View>
          ))}

          <Text style={styles.label}>Address</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            value={address}
            onChangeText={setAddress}
            placeholder="Street, City, State"
            placeholderTextColor={Colors.textMuted}
            multiline
            numberOfLines={2}
          />
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={() => navigation.goBack()} activeOpacity={0.85}>
          <Ionicons name="checkmark-circle" size={20} color={Colors.textInverse} />
          <Text style={styles.saveBtnText}>Save Party</Text>
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
  typeRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  typeBtn: { flex: 1, padding: Spacing.sm, borderRadius: Radius.sm, borderWidth: 1, borderColor: Colors.cardBorder, alignItems: 'center' },
  typeBtnActive: { backgroundColor: Colors.primaryMuted, borderColor: Colors.primary },
  typeBtnText: { fontSize: FontSizes.sm, color: Colors.textSecondary },
  typeBtnTextActive: { color: Colors.primary, fontWeight: '600' },
  card: { backgroundColor: Colors.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.cardBorder, padding: Spacing.md, marginBottom: Spacing.sm },
  label: { fontSize: FontSizes.xs, color: Colors.textSecondary, marginBottom: Spacing.xs, fontWeight: '500' },
  input: { backgroundColor: Colors.input, borderWidth: 1, borderColor: Colors.inputBorder, borderRadius: Radius.sm, padding: Spacing.sm, color: Colors.textPrimary, fontSize: FontSizes.base, marginBottom: Spacing.sm },
  textarea: { height: 70, textAlignVertical: 'top' },
  saveBtn: { backgroundColor: Colors.primary, borderRadius: Radius.md, padding: Spacing.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  saveBtnText: { color: Colors.textInverse, fontSize: FontSizes.base, fontWeight: '700' },
});
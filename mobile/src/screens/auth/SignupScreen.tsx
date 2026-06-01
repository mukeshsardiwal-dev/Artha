import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { useAuth } from '../../context/AuthContext';
import { Colors, FontSizes, Spacing, Radius } from '../../theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Signup'>;

export default function SignupScreen({ navigation }: Props) {
  const { signup, isLoading } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  const handleSignup = async () => {
    if (!name || !email || !password) {
      setError('All fields are required');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setError('');
    try {
      await signup(name, email, password);
    } catch {
      setError('Failed to create account. Try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Brand */}
        <View style={styles.brand}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoLetter}>A</Text>
          </View>
          <Text style={styles.appName}>Artha</Text>
          <Text style={styles.tagline}>Create your account</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.heading}>Get started</Text>

          {!!error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {[
            { label: 'Full Name',        value: name,     setter: setName,     placeholder: 'Mukesh Sardiwal', secure: false, keyboard: 'default' },
            { label: 'Email',            value: email,    setter: setEmail,    placeholder: 'you@example.com', secure: false, keyboard: 'email-address' },
            { label: 'Password',         value: password, setter: setPassword, placeholder: '••••••••',        secure: true,  keyboard: 'default' },
            { label: 'Confirm Password', value: confirm,  setter: setConfirm,  placeholder: '••••••••',        secure: true,  keyboard: 'default' },
          ].map(({ label, value, setter, placeholder, secure, keyboard }) => (
            <View key={label}>
              <Text style={styles.label}>{label}</Text>
              <TextInput
                style={styles.input}
                value={value}
                onChangeText={setter}
                secureTextEntry={secure}
                autoCapitalize={keyboard === 'email-address' ? 'none' : 'words'}
                keyboardType={keyboard as any}
                placeholder={placeholder}
                placeholderTextColor={Colors.textMuted}
              />
            </View>
          ))}

          <TouchableOpacity
            style={[styles.btn, isLoading && styles.btnDisabled]}
            onPress={handleSignup}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.textInverse} />
            ) : (
              <Text style={styles.btnText}>Create Account</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.footerLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: Spacing.xl, paddingVertical: Spacing.xxl },
  brand: { alignItems: 'center', marginBottom: Spacing.xxl },
  logoCircle: { width: 72, height: 72, borderRadius: Radius.full, backgroundColor: Colors.primaryMuted, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.md, borderWidth: 2, borderColor: Colors.primary },
  logoLetter: { fontSize: 36, fontWeight: '700', color: Colors.primary },
  appName: { fontSize: FontSizes.xxl, fontWeight: '700', color: Colors.textPrimary, letterSpacing: 1 },
  tagline: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: 4 },
  card: { backgroundColor: Colors.card, borderRadius: Radius.lg, borderWidth: 1, borderColor: Colors.cardBorder, padding: Spacing.xl, marginBottom: Spacing.xl },
  heading: { fontSize: FontSizes.lg, fontWeight: '700', color: Colors.textPrimary, marginBottom: Spacing.xl },
  errorBanner: { backgroundColor: '#2d1a1a', borderWidth: 1, borderColor: Colors.danger, borderRadius: Radius.sm, padding: Spacing.sm, marginBottom: Spacing.lg },
  errorText: { color: Colors.danger, fontSize: FontSizes.sm },
  label: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginBottom: Spacing.xs, fontWeight: '500' },
  input: { backgroundColor: Colors.input, borderWidth: 1, borderColor: Colors.inputBorder, borderRadius: Radius.md, padding: Spacing.md, color: Colors.textPrimary, fontSize: FontSizes.base, marginBottom: Spacing.lg },
  btn: { backgroundColor: Colors.primary, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center', marginTop: Spacing.xs },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: Colors.textInverse, fontSize: FontSizes.base, fontWeight: '700' },
  footer: { flexDirection: 'row', justifyContent: 'center' },
  footerText: { color: Colors.textSecondary, fontSize: FontSizes.sm },
  footerLink: { color: Colors.primary, fontSize: FontSizes.sm, fontWeight: '600' },
});
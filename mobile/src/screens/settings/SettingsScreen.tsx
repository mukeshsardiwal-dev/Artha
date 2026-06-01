import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { Colors, FontSizes, Spacing, Radius, Shadow } from '../../theme';

interface SettingRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  label: string;
  sublabel?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  danger?: boolean;
}

function SettingRow({ icon, iconColor, label, sublabel, right, onPress, danger }: SettingRowProps) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      disabled={!onPress && !right}
      activeOpacity={0.7}
    >
      <View style={[styles.rowIcon, { backgroundColor: iconColor + '22' }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <View style={styles.rowContent}>
        <Text style={[styles.rowLabel, danger && { color: Colors.danger }]}>{label}</Text>
        {sublabel ? <Text style={styles.rowSublabel}>{sublabel}</Text> : null}
      </View>
      {right ?? (
        onPress ? <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} /> : null
      )}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const { user, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Profile card */}
        <View style={[styles.profileCard, Shadow.card]}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>
              {user?.name?.charAt(0) ?? 'U'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name ?? 'User'}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
            <Text style={styles.profileCompany}>{user?.company}</Text>
          </View>
        </View>

        {/* Preferences */}
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.section}>
          <SettingRow
            icon="moon"
            iconColor={Colors.info}
            label="Dark Mode"
            sublabel="Dark navy theme"
            right={
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: Colors.cardBorder, true: Colors.primaryMuted }}
                thumbColor={darkMode ? Colors.primary : Colors.textMuted}
              />
            }
          />
          <View style={styles.rowDivider} />
          <SettingRow
            icon="notifications-outline"
            iconColor={Colors.warning}
            label="Notifications"
            sublabel="Transaction alerts"
            right={
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: Colors.cardBorder, true: Colors.primaryMuted }}
                thumbColor={notifications ? Colors.primary : Colors.textMuted}
              />
            }
          />
        </View>

        {/* Business */}
        <Text style={styles.sectionTitle}>Business</Text>
        <View style={styles.section}>
          <SettingRow icon="business-outline"    iconColor={Colors.primary}  label="Company Details"    onPress={() => {}} />
          <View style={styles.rowDivider} />
          <SettingRow icon="cash-outline"         iconColor={Colors.warning}  label="Financial Year"     sublabel="Apr 2026 – Mar 2027" onPress={() => {}} />
          <View style={styles.rowDivider} />
          <SettingRow icon="document-text-outline"iconColor={Colors.info}     label="Invoice Settings"   onPress={() => {}} />
        </View>

        {/* Account */}
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.section}>
          <SettingRow icon="person-outline"       iconColor={Colors.textSecondary} label="Edit Profile"  onPress={() => {}} />
          <View style={styles.rowDivider} />
          <SettingRow icon="lock-closed-outline"  iconColor={Colors.textSecondary} label="Change Password" onPress={() => {}} />
          <View style={styles.rowDivider} />
          <SettingRow icon="help-circle-outline"  iconColor={Colors.textSecondary} label="Help & Support"  onPress={() => {}} />
        </View>

        {/* Logout */}
        <View style={[styles.section, { marginTop: Spacing.lg }]}>
          <SettingRow
            icon="log-out-outline"
            iconColor={Colors.danger}
            label="Logout"
            onPress={handleLogout}
            danger
          />
        </View>

        {/* Version */}
        <Text style={styles.version}>Artha v1.0.0  ·  © 2026 Nanda Cotton Mills</Text>

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: Spacing.lg },
  profileCard: {
    backgroundColor: Colors.card, borderRadius: Radius.lg, borderWidth: 1,
    borderColor: Colors.cardBorder, padding: Spacing.lg,
    flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.xxl,
  },
  profileAvatar: {
    width: 56, height: 56, borderRadius: Radius.full,
    backgroundColor: Colors.primaryMuted, alignItems: 'center', justifyContent: 'center',
    marginRight: Spacing.lg, borderWidth: 2, borderColor: Colors.primary,
  },
  profileAvatarText: { fontSize: FontSizes.xl, fontWeight: '700', color: Colors.primary },
  profileInfo: { flex: 1 },
  profileName: { fontSize: FontSizes.md, fontWeight: '700', color: Colors.textPrimary },
  profileEmail: { fontSize: FontSizes.sm, color: Colors.textSecondary, marginTop: 2 },
  profileCompany: { fontSize: FontSizes.xs, color: Colors.primary, marginTop: 4 },
  sectionTitle: { fontSize: FontSizes.xs, fontWeight: '600', color: Colors.textMuted, marginBottom: Spacing.sm, textTransform: 'uppercase', letterSpacing: 0.8 },
  section: { backgroundColor: Colors.card, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.cardBorder, marginBottom: Spacing.lg, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md },
  rowDivider: { height: 1, backgroundColor: Colors.cardBorder, marginLeft: 52 },
  rowIcon: { width: 36, height: 36, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.md },
  rowContent: { flex: 1 },
  rowLabel: { fontSize: FontSizes.sm, fontWeight: '500', color: Colors.textPrimary },
  rowSublabel: { fontSize: FontSizes.xs, color: Colors.textMuted, marginTop: 2 },
  version: { textAlign: 'center', fontSize: FontSizes.xs, color: Colors.textMuted, marginTop: Spacing.md },
});
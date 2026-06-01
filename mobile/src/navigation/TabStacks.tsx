import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SalesStackParamList, PurchasesStackParamList, PartiesStackParamList } from './types';
import { Colors, FontSizes } from '../theme';

import SalesListScreen     from '../screens/sales/SalesListScreen';
import AddSaleScreen       from '../screens/sales/AddSaleScreen';
import PurchasesListScreen from '../screens/purchases/PurchasesListScreen';
import AddPurchaseScreen   from '../screens/purchases/AddPurchaseScreen';
import PartiesListScreen   from '../screens/parties/PartiesListScreen';
import AddPartyScreen      from '../screens/parties/AddPartyScreen';

const HEADER_STYLE = {
  headerStyle: { backgroundColor: Colors.bg },
  headerTintColor: Colors.textPrimary,
  headerTitleStyle: { fontSize: FontSizes.base, fontWeight: '600' as const },
  contentStyle: { backgroundColor: Colors.bg },
  headerShadowVisible: false,
  headerBackTitleVisible: false,
};

// ─── Sales Stack ────────────────────────────────────────────────────────────
const SalesNav = createNativeStackNavigator<SalesStackParamList>();

export function SalesStack() {
  return (
    <SalesNav.Navigator screenOptions={HEADER_STYLE}>
      <SalesNav.Screen name="SalesList" component={SalesListScreen} options={{ title: 'Sales' }} />
      <SalesNav.Screen name="AddSale"   component={AddSaleScreen}   options={{ title: 'New Sale' }} />
    </SalesNav.Navigator>
  );
}

// ─── Purchases Stack ─────────────────────────────────────────────────────────
const PurchasesNav = createNativeStackNavigator<PurchasesStackParamList>();

export function PurchasesStack() {
  return (
    <PurchasesNav.Navigator screenOptions={HEADER_STYLE}>
      <PurchasesNav.Screen name="PurchasesList" component={PurchasesListScreen} options={{ title: 'Purchases' }} />
      <PurchasesNav.Screen name="AddPurchase"   component={AddPurchaseScreen}   options={{ title: 'New Purchase' }} />
    </PurchasesNav.Navigator>
  );
}

// ─── Parties Stack ────────────────────────────────────────────────────────────
const PartiesNav = createNativeStackNavigator<PartiesStackParamList>();

export function PartiesStack() {
  return (
    <PartiesNav.Navigator screenOptions={HEADER_STYLE}>
      <PartiesNav.Screen name="PartiesList" component={PartiesListScreen} options={{ title: 'Parties' }} />
      <PartiesNav.Screen name="AddParty"    component={AddPartyScreen}    options={{ title: 'New Party' }} />
    </PartiesNav.Navigator>
  );
}
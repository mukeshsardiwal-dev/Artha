import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MoreStackParamList } from './types';
import { Colors, FontSizes } from '../theme';
import MoreHomeScreen  from '../screens/more/MoreHomeScreen';
import ItemsListScreen from '../screens/items/ItemsListScreen';
import AddItemScreen   from '../screens/items/AddItemScreen';
import CashbookScreen  from '../screens/cashbook/CashbookScreen';
import ReportsScreen   from '../screens/reports/ReportsScreen';
import SettingsScreen  from '../screens/settings/SettingsScreen';

const Stack = createNativeStackNavigator<MoreStackParamList>();

const HEADER_STYLE = {
  headerStyle: { backgroundColor: Colors.bg },
  headerTintColor: Colors.textPrimary,
  headerTitleStyle: { fontSize: FontSizes.base, fontWeight: '600' as const },
  contentStyle: { backgroundColor: Colors.bg },
  headerShadowVisible: false,
  headerBackTitleVisible: false,
};

export default function MoreStack() {
  return (
    <Stack.Navigator screenOptions={HEADER_STYLE}>
      <Stack.Screen name="MoreHome" component={MoreHomeScreen}  options={{ headerShown: false }} />
      <Stack.Screen name="Items"    component={ItemsListScreen} options={{ title: 'Items' }} />
      <Stack.Screen name="AddItem"  component={AddItemScreen}   options={{ title: 'New Item' }} />
      <Stack.Screen name="Cashbook" component={CashbookScreen}  options={{ title: 'Cashbook' }} />
      <Stack.Screen name="Reports"  component={ReportsScreen}   options={{ title: 'Reports' }} />
      <Stack.Screen name="Settings" component={SettingsScreen}  options={{ title: 'Settings' }} />
    </Stack.Navigator>
  );
}
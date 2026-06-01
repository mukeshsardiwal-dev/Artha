import React from 'react';
import { Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { AppTabsParamList } from './types';
import { Colors, FontSizes } from '../theme';
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import { SalesStack, PurchasesStack, PartiesStack } from './TabStacks';
import MoreStack from './MoreStack';

const Tab = createBottomTabNavigator<AppTabsParamList>();

type TabIconName = keyof typeof Ionicons.glyphMap;

interface TabConfig {
  name: keyof AppTabsParamList;
  label: string;
  icon: TabIconName;
  iconOutline: TabIconName;
  component: React.ComponentType<any>;
}

const TABS: TabConfig[] = [
  { name: 'Dashboard', label: 'Dashboard', icon: 'grid',    iconOutline: 'grid-outline',    component: DashboardScreen  },
  { name: 'Sales',     label: 'Sales',     icon: 'receipt', iconOutline: 'receipt-outline', component: SalesStack       },
  { name: 'Purchases', label: 'Purchases', icon: 'cart',    iconOutline: 'cart-outline',    component: PurchasesStack   },
  { name: 'Parties',   label: 'Parties',   icon: 'people',  iconOutline: 'people-outline',  component: PartiesStack     },
  { name: 'More',      label: 'More',      icon: 'apps',    iconOutline: 'apps-outline',    component: MoreStack        },
];

export default function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const tab = TABS.find((t) => t.name === route.name)!;
        return {
          headerShown: false,
          tabBarActiveTintColor: Colors.tabActive,
          tabBarInactiveTintColor: Colors.tabInactive,
          tabBarStyle: {
            backgroundColor: Colors.tabBar,
            borderTopColor: Colors.tabBarBorder,
            borderTopWidth: 1,
            height: Platform.OS === 'ios' ? 82 : 62,
            paddingBottom: Platform.OS === 'ios' ? 24 : 8,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '500',
          },
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? tab.icon : tab.iconOutline}
              size={size ?? 22}
              color={color}
            />
          ),
        };
      }}
    >
      {TABS.map((tab) => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={tab.component}
          options={{ tabBarLabel: tab.label }}
        />
      ))}
    </Tab.Navigator>
  );
}
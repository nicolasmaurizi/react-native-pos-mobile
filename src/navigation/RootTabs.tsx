import React from "react";
import { Platform } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Users, Package, ClipboardList, Settings } from "lucide-react-native";

import ClientesScreen from "../screens/ClientesScreen";
import ArticulosScreen from "../screens/ArticulosScreen";
import PedidosScreen from "../screens/PedidosScreen";
import AjustesScreen from "../screens/AjustesScreen";

export type RootTabParamList = {
  clientes: undefined;
  articulos: undefined;
  pedidos: undefined;
  ajustes: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function RootTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: "#2563EB",
        tabBarInactiveTintColor: "#6B7280",
        tabBarLabelStyle: {
          fontSize: 11,
          marginTop: 2,
        },
        tabBarStyle: {
          height: 70,
          paddingTop: 10,
          paddingBottom: 12,
          borderTopWidth: 1,
          borderTopColor: "#E6E8EF",
          backgroundColor: "#FFFFFF",
          ...(Platform.OS === "android"
            ? { elevation: 10 }
            : {
                shadowColor: "#000",
                shadowOpacity: 0.06,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: -6 },
              }),
        },
        tabBarIcon: ({ color, size }) => {
          const s = Math.max(22, Math.min(size ?? 24, 26));
          const props = { color, size: s, strokeWidth: 2 };

          switch (route.name) {
            case "clientes":
              return <Users {...props} />;
            case "articulos":
              return <Package {...props} />;
            case "pedidos":
              return <ClipboardList {...props} />;
            case "ajustes":
              return <Settings {...props} />;
            default:
              return null;
          }
        },
      })}
    >
      <Tab.Screen name="clientes" component={ClientesScreen} options={{ title: "Clientes" }} />
      <Tab.Screen name="articulos" component={ArticulosScreen} options={{ title: "Artículos" }} />
      <Tab.Screen name="pedidos" component={PedidosScreen} options={{ title: "Facturación" }} />
      <Tab.Screen name="ajustes" component={AjustesScreen} options={{ title: "Ajustes" }} />
    </Tab.Navigator>
  );
}

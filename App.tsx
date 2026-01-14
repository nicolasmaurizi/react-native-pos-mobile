import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import "react-native-gesture-handler";
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import RootTabs from "./src/navigation/RootTabs";
import { StatusBar } from "expo-status-bar";

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" translucent={false} />
      <SafeAreaView style={{ flex: 1, backgroundColor: "#F6F7FB" }}>
        <NavigationContainer>
          <RootTabs />
        </NavigationContainer>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

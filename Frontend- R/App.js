// App.js
import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native";
import AppNavigation from "./src/navigation/AppNavigator";
import { AuthProvider } from "./src/contexts/AuthProvider";

export default function App() {
  return (
    <AuthProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
        <AppNavigation />
        <StatusBar style="auto" />
      </SafeAreaView>
    </AuthProvider>
  );
}

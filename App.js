import React from "react";

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginPage from "./pages/login";
import DashboardPage from "./pages/dashboard";
import AbastecimentoPage from "./pages/Abastecimento";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Login" component={LoginPage} />
        <Stack.Screen name="Dashboard" component={DashboardPage} />
        <Stack.Screen name="Abastecimento" component={AbastecimentoPage} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import HomeContratadorScreen from "../screens/Contratador/HomeContratadorScreen";
import HomeTrabajadorScreen from "../screens/Trabajador/HomeTrabajadorScreen";
import CrearTrabajoScreen from "../screens/Contratador/CrearTrabajoScreen";
import MisTrabajosScreen from "../screens/Contratador/MisTrabajosScreen";
import MiPerfilScreen from "../screens/MiPerfilScreen";
import RegistroTrabajadorScreen from "../screens/RegistroTrabajadorScreen";
import PostulacionesContratador from "../screens/Contratador/PostulacionesContratador";
import MisPostulacionesScreen from "../screens/MyPostulationsScreen";

import { useAuth } from "../contexts/AuthProvider";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const ContratadorTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: "#007AFF",
      tabBarInactiveTintColor: "#999",
      tabBarIcon: ({ color, size }) => {
        let iconName;
        if (route.name === "Inicio") iconName = "home-outline";
        else if (route.name === "Nuevo Trabajo") iconName = "add-circle-outline";
        else if (route.name === "Mis Trabajos") iconName = "briefcase-outline";
        else if (route.name === "Perfil") iconName = "person-outline";
        return <Ionicons name={iconName} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Inicio" component={HomeContratadorScreen} />
    <Tab.Screen name="Nuevo Trabajo" component={CrearTrabajoScreen} />
    <Tab.Screen name="Mis Trabajos" component={MisTrabajosScreen} />
    <Tab.Screen name="Perfil" component={MiPerfilScreen} />
  </Tab.Navigator>
);

const ContratadorStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ContratadorTabs" component={ContratadorTabs} />
    <Stack.Screen
      name="PostulacionesContratador"
      component={PostulacionesContratador}
      options={{
        headerShown: true,
        title: "Postulaciones",
      }}
    />
  </Stack.Navigator>
);

const TrabajadorTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: "#007AFF",
      tabBarInactiveTintColor: "#999",
      tabBarIcon: ({ color, size }) => {
        let iconName;
        if (route.name === "Inicio") iconName = "home-outline";
        else if (route.name === "Mis Postulaciones") iconName = "list-outline";
        else if (route.name === "Perfil") iconName = "person-outline";
        return <Ionicons name={iconName} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen name="Inicio" component={HomeTrabajadorScreen} />
    <Tab.Screen name="Mis Postulaciones" component={MisPostulacionesScreen} />
    <Tab.Screen name="Perfil" component={MiPerfilScreen} />
  </Tab.Navigator>
);

const AppNavigation = () => {
  const { firebaseUser, loading, roleActive } = useAuth();

  if (loading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!firebaseUser ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : roleActive === "trabajador" ? (
          <Stack.Screen name="TrabajadorTabs" component={TrabajadorTabs} />
        ) : (
          <Stack.Screen name="ContratadorStack" component={ContratadorStack} />
        )}
        <Stack.Screen
          name="RegistroTrabajador"
          component={RegistroTrabajadorScreen}
          options={{
            headerShown: true,
            title: "Registrar como Trabajador",
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigation;


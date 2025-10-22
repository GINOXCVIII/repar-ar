import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import JobListScreen from '../screens/JobListScreen';
import PublishJobScreen from '../screens/PublishJobScreen';
import MyPostulationsScreen from '../screens/MyPostulationsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import HistoryScreen from '../screens/HistoryScreen';
import { useAuth } from '../services/auth';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  const { role } = useAuth();
  const r = role || 'trabajador';

  return (
    <Tab.Navigator screenOptions={{ headerStyle: { backgroundColor: '#0b9d57' }, headerTintColor: '#fff' }}>
      {r === 'trabajador' && (
        <>
          <Tab.Screen name="Inicio" component={JobListScreen} options={{ tabBarIcon: ({ color }) => <Ionicons name="home" size={20} color={color} /> }} />
          <Tab.Screen name="Historial" component={HistoryScreen} options={{ tabBarIcon: ({ color }) => <Ionicons name="time" size={20} color={color} /> }} />
          <Tab.Screen name="Mi Perfil" component={ProfileScreen} options={{ tabBarIcon: ({ color }) => <Ionicons name="person" size={20} color={color} /> }} />
        </>
      )}
      {r === 'contratador' && (
        <>
          <Tab.Screen name="Inicio" component={JobListScreen} options={{ tabBarIcon: ({ color }) => <Ionicons name="home" size={20} color={color} /> }} />
          <Tab.Screen name="Publicar" component={PublishJobScreen} options={{ tabBarIcon: ({ color }) => <Ionicons name="add-circle" size={20} color={color} /> }} />
          <Tab.Screen name="Historial" component={HistoryScreen} options={{ tabBarIcon: ({ color }) => <Ionicons name="time" size={20} color={color} /> }} />
          <Tab.Screen name="Mi Perfil" component={ProfileScreen} options={{ tabBarIcon: ({ color }) => <Ionicons name="person" size={20} color={color} /> }} />
        </>
      )}
      {r === 'both' && (
        <>
          <Tab.Screen name="Inicio" component={JobListScreen} options={{ tabBarIcon: ({ color }) => <Ionicons name="home" size={20} color={color} /> }} />
          <Tab.Screen name="Publicar" component={PublishJobScreen} options={{ tabBarIcon: ({ color }) => <Ionicons name="add-circle" size={20} color={color} /> }} />
          <Tab.Screen name="Historial" component={HistoryScreen} options={{ tabBarIcon: ({ color }) => <Ionicons name="time" size={20} color={color} /> }} />
          <Tab.Screen name="Mis Postulaciones" component={MyPostulationsScreen} options={{ tabBarIcon: ({ color }) => <Ionicons name="list" size={20} color={color} /> }} />
          <Tab.Screen name="Mi Perfil" component={ProfileScreen} options={{ tabBarIcon: ({ color }) => <Ionicons name="person" size={20} color={color} /> }} />
        </>
      )}
    </Tab.Navigator>
  );
}

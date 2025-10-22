import React from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../services/auth';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const { user, role, saveRole, logout } = useAuth();

  const toggleRole = () => {
    if (role !== 'both') return Alert.alert('No disponible', 'Solo aplicable si sos ambos');
    const newRole = role === 'trabajador' ? 'contratador' : 'trabajador';
    saveRole(newRole);
    Alert.alert('Rol cambiado', 'Role cambiado localmente a ' + newRole);
  };

  return (
    <View style={styles.container}>
      <View style={{alignItems:'center', marginBottom:16}}>
        <Ionicons name="person-circle" size={80} color="#0b9d57" />
      </View>
      <Text style={styles.h1}>Mi Perfil</Text>
      <Text>Email: {user?.email || '—'}</Text>
      <Text>Rol: {role || '—'}</Text>
      <View style={{height:8}} />
      {role === 'both' && <Button title="Cambiar rol" onPress={toggleRole} />}
      <View style={{height:8}} />
      <Button color="#e74c3c" title="Cerrar sesión" onPress={() => logout().catch(e=>Alert.alert('Error', e.message))} />
    </View>
  );
}

const styles = StyleSheet.create({ container:{flex:1,padding:16,backgroundColor:'#f6fbf6'}, h1:{fontSize:20,fontWeight:'700',color:'#0b9d57',marginBottom:8} });

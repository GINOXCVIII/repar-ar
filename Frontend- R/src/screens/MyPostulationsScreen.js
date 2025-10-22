import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function MyPostulationsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Mis Postulaciones</Text>
      <Text>Aquí se verán las postulaciones del trabajador.</Text>
    </View>
  );
}

const styles = StyleSheet.create({container:{flex:1,padding:16,backgroundColor:'#f6fbf6'},h1:{fontSize:18,fontWeight:'700',color:'#0b9d57',marginBottom:8}})

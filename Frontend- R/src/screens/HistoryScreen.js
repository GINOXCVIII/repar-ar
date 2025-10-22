import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function HistoryScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Historial</Text>
      <Text>Aquí va el historial de trabajos y calificaciones.</Text>
    </View>
  );
}

const styles = StyleSheet.create({container:{flex:1,padding:16,backgroundColor:'#f6fbf6'},h1:{fontSize:18,fontWeight:'700',color:'#0b9d57',marginBottom:8}})

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const RegistroTrabajadorScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registro de Trabajador</Text>
      <Text style={styles.message}>
        Próximamente aquí podrás registrarte como trabajador.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    color: '#555',
  },
});

export default RegistroTrabajadorScreen;


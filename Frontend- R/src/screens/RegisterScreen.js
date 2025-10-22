// src/screens/RegisterScreen.js
import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView } from "react-native";
import { useAuth } from "../contexts/AuthProvider";

const RegisterScreen = ({ navigation }) => {
  const { signUp } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // zona geográfica que pide el backend en la vista FirebaseRegisterView
  const [calle, setCalle] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [provincia, setProvincia] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !calle || !ciudad || !provincia) {
      Alert.alert("Faltan datos", "Completá email, contraseña y la zona (calle, ciudad, provincia).");
      return;
    }
    setLoading(true);
    try {
      const zona = { calle, ciudad, provincia };
      await signUp({ email: email.trim(), password, zona_geografica: zona });
      Alert.alert("Cuenta creada", "Usuario creado correctamente. Completá tu perfil si es necesario.");
      // AppNavigation detectará el usuario y mostrará la pantalla correspondiente
    } catch (err) {
      console.error("Error register:", err.response?.data || err);
      const msg = err.response?.data ?? err.message ?? "Error al registrarse";
      Alert.alert("Error al registrarse", JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Crear Cuenta</Text>

      <Text style={styles.label}>Email</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" />

      <Text style={styles.label}>Contraseña</Text>
      <TextInput style={styles.input} secureTextEntry value={password} onChangeText={setPassword} />

      <Text style={[styles.subtitle, { marginTop: 12 }]}>Zona geográfica (se creará en el backend)</Text>
      <Text style={styles.label}>Calle</Text>
      <TextInput style={styles.input} value={calle} onChangeText={setCalle} />

      <Text style={styles.label}>Ciudad</Text>
      <TextInput style={styles.input} value={ciudad} onChangeText={setCiudad} />

      <Text style={styles.label}>Provincia</Text>
      <TextInput style={styles.input} value={provincia} onChangeText={setProvincia} />

      <View style={{ marginTop: 16 }}>
        <Button title={loading ? "Creando..." : "Crear cuenta"} color="#228B22" onPress={handleRegister} disabled={loading} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 26, fontWeight: "700", color: "#228B22", textAlign: "center", marginBottom: 12 },
  subtitle: { color: "#006400", fontWeight: "600" },
  label: { color: "#006400", marginTop: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#006400",
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#F8FFF8",
  },
});

export default RegisterScreen;

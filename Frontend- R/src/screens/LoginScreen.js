// src/screens/LoginScreen.js
import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from "react-native";
import { useAuth } from "../contexts/AuthProvider";

const LoginScreen = ({ navigation }) => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      // AppNavigation redirigirá según firebaseUser/profile
    } catch (err) {
      console.error("Login error:", err);
      const msg = err?.code ? err.code : err.message;
      Alert.alert("Error al iniciar sesión", msg.toString());
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ingresar</Text>

      <Text style={styles.label}>Email</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" />

      <Text style={styles.label}>Contraseña</Text>
      <TextInput style={styles.input} secureTextEntry value={password} onChangeText={setPassword} />

      <View style={{ marginTop: 16 }}>
        <Button title={loading ? "Ingresando..." : "Ingresar"} color="#228B22" onPress={handleLogin} disabled={loading} />
      </View>

      <TouchableOpacity onPress={() => navigation.navigate("Register")} style={{ marginTop: 14 }}>
        <Text style={{ color: "#006400", textAlign: "center" }}>¿No tenés cuenta? Registrate</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#fff", height: "100%" },
  title: { fontSize: 26, fontWeight: "700", color: "#228B22", textAlign: "center", marginBottom: 20 },
  label: { color: "#006400", marginTop: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#006400",
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#F8FFF8",
  },
});

export default LoginScreen;

// src/screens/RegisterScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthProvider";

const RegisterScreen = ({ navigation }) => {
  const { signUp } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // 👈 Nuevo estado para mostrar/ocultar contraseña

  // Requisitos de la contraseña
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasMinLength = password.length >= 6;

  const handleRegister = async () => {
    if (!email || !password) {
      Alert.alert("Faltan datos", "Completá email y contraseña.");
      return;
    }

    if (!hasLowercase || !hasUppercase || !hasNumber || !hasMinLength) {
      Alert.alert("Contraseña inválida", "Tu contraseña no cumple con los requisitos mínimos.");
      return;
    }

    setLoading(true);
    try {
      await signUp({ email: email.trim(), password });
      Alert.alert("Cuenta creada", "Usuario creado correctamente. Completá tu perfil si es necesario.");
    } catch (err) {
      console.error("Error register:", err.response?.data || err);
      const msg = err.response?.data ?? err.message ?? "Error al registrarse";
      Alert.alert("Error al registrarse", JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ padding: 20 }}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Crear Cuenta</Text>

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Contraseña</Text>
      <View style={styles.passwordContainer}>
        <TextInput
          style={[styles.input, { flex: 1, marginRight: 8 }]}
          secureTextEntry={!showPassword} // 👈 Cambia según el estado
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Ionicons
            name={showPassword ? "eye-off-outline" : "eye-outline"}
            size={24}
            color="#006400"
          />
        </TouchableOpacity>
      </View>

      {/* Indicadores visuales de requisitos */}
      <View style={{ marginTop: 10 }}>
        <Text style={[styles.requirement, { color: hasLowercase ? "green" : "red" }]}>
          • Se requiere un carácter en minúscula.
        </Text>
        <Text style={[styles.requirement, { color: hasUppercase ? "green" : "red" }]}>
          • Se requiere un carácter en mayúscula.
        </Text>
        <Text style={[styles.requirement, { color: hasNumber ? "green" : "red" }]}>
          • Se requiere un carácter numérico.
        </Text>
        <Text style={[styles.requirement, { color: hasMinLength ? "green" : "red" }]}>
          • Longitud mínima de la contraseña: 6 caracteres.
        </Text>
      </View>

      <View style={{ marginTop: 20 }}>
        <Button
          title={loading ? "Creando..." : "Crear cuenta"}
          color="#228B22"
          onPress={handleRegister}
          disabled={loading}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: "#fff" },
  title: { fontSize: 26, fontWeight: "700", color: "#228B22", textAlign: "center", marginBottom: 12 },
  label: { color: "#006400", marginTop: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#006400",
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#F8FFF8",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  requirement: {
    fontSize: 14,
    marginBottom: 4,
  },
});

export default RegisterScreen;

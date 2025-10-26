import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthProvider";

const LoginScreen = ({ navigation }) => {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await signIn(email.trim(), password);
    } catch (err) {
      console.error("Login error:", err);
      setErrorModalVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ingresar</Text>

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
          secureTextEntry={!showPassword}
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

      {/* Botón moderno */}
      <TouchableOpacity
        style={[styles.loginButton, loading && { opacity: 0.6 }]}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.loginButtonText}>
          {loading ? "Ingresando..." : "Ingresar"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate("Register")}
        style={{ marginTop: 14 }}
      >
        <Text style={{ color: "#006400", textAlign: "center" }}>
          ¿No tenés cuenta? Registrate
        </Text>
      </TouchableOpacity>

      {/* MODAL DE ERROR */}
      <Modal visible={errorModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Ionicons name="alert-circle-outline" size={48} color="#B22222" />
            <Text style={styles.modalTitle}>
              Por favor revise mail o contraseña
            </Text>
            <Pressable
              style={styles.modalButton}
              onPress={() => setErrorModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#fff", height: "100%" },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#228B22",
    textAlign: "center",
    marginBottom: 20,
  },
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
  loginButton: {
    backgroundColor: "#228B22",
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  loginButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#fde8e8",
    padding: 25,
    borderRadius: 14,
    width: "80%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 4,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#B22222",
    textAlign: "center",
    marginTop: 12,
    marginBottom: 18,
  },
  modalButton: {
    backgroundColor: "#B22222",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  modalButtonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});

export default LoginScreen;

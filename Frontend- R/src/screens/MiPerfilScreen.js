import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Modal,
  Pressable,
} from "react-native";
import axios from "axios";
import { useAuth } from "../contexts/AuthProvider";

const BASE_URL = "http://127.0.0.1:8000/api";

const MiPerfilScreen = ({ navigation }) => {
  const { firebaseUser, profile, setProfile, signOutUser, roleActive, workerProfile, toggleRole } =
    useAuth();

  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    email_contratador: "",
    telefono_contratador: "",
    dni: "",
    calle: "",
    ciudad: "",
    provincia: "",
  });

  const [saving, setSaving] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        nombre: profile.nombre ?? "",
        apellido: profile.apellido ?? "",
        email_contratador: profile.email_contratador ?? firebaseUser?.email ?? "",
        telefono_contratador: profile.telefono_contratador ?? "",
        dni: profile.dni ?? "",
        calle: profile.zona_geografica_contratador?.calle ?? "",
        ciudad: profile.zona_geografica_contratador?.ciudad ?? "",
        provincia: profile.zona_geografica_contratador?.provincia ?? "",
      });
    }
  }, [profile, firebaseUser]);

  const handleChange = (field, value) => setForm((p) => ({ ...p, [field]: value }));

  const saveProfile = async () => {
    setSaving(true);
    try {
      const payloadZona = {
        calle: form.calle,
        ciudad: form.ciudad,
        provincia: form.provincia,
      };

      if (profile?.id_contratador) {
        const payloadContratador = {
          nombre: form.nombre,
          apellido: form.apellido,
          email_contratador: form.email_contratador,
          telefono_contratador: form.telefono_contratador,
          dni: form.dni,
        };

        if (profile.zona_geografica_contratador?.id_zona_geografica) {
          try {
            await axios.patch(
              `${BASE_URL}/zonas-geograficas/${profile.zona_geografica_contratador.id_zona_geografica}/`,
              payloadZona
            );
          } catch (e) {
            console.warn("No se pudo patch zona:", e.response?.data || e);
          }

          const res = await axios.patch(
            `${BASE_URL}/contratadores/${profile.id_contratador}/`,
            payloadContratador
          );
          const p = { ...profile, ...res.data };
          setProfile(p);
          setSuccessModalVisible(true);
        } else {
          const zonaRes = await axios.post(`${BASE_URL}/zonas-geograficas/`, payloadZona);
          const zonaId =
            zonaRes.data.id_zona_geografica ?? zonaRes.data.id ?? zonaRes.data;
          const res = await axios.patch(
            `${BASE_URL}/contratadores/${profile.id_contratador}/`,
            {
              ...payloadContratador,
              id_zona_geografica_contratador: zonaId,
            }
          );
          const p = normalizeAndMergeProfile(profile, res.data, zonaRes.data);
          setProfile(p);
          setSuccessModalVisible(true);
        }
      } else {
        const zonaRes = await axios.post(`${BASE_URL}/zonas-geograficas/`, payloadZona);
        const zonaId =
          zonaRes.data.id_zona_geografica ?? zonaRes.data.id ?? zonaRes.data;
        const payloadContratador = {
          nombre: form.nombre,
          apellido: form.apellido,
          email_contratador: form.email_contratador,
          telefono_contratador: form.telefono_contratador,
          dni: form.dni,
          id_zona_geografica_contratador: zonaId,
          uid_firebase: firebaseUser?.uid ?? null,
        };
        const res = await axios.post(`${BASE_URL}/contratadores/`, payloadContratador);
        const created = {
          raw: res.data,
          id_contratador: res.data.id_contratador ?? res.data.id ?? null,
          nombre: res.data.nombre ?? "",
          apellido: res.data.apellido ?? "",
          email_contratador: res.data.email_contratador ?? "",
          telefono_contratador: res.data.telefono_contratador ?? "",
          dni: res.data.dni ?? "",
          id_zona_geografica_contratador: zonaId,
          zona_geografica_contratador: zonaRes.data,
        };
        setProfile(created);
        setSuccessModalVisible(true);
      }
    } catch (err) {
      console.error("Error guardando perfil:", err.response?.data || err);
      setErrorModalVisible(true);
    } finally {
      setSaving(false);
    }
  };

  const normalizeAndMergeProfile = (oldProfile, contratadorData, zonaData) => ({
    raw: contratadorData,
    id_contratador:
      contratadorData.id_contratador ?? contratadorData.id ?? oldProfile.id_contratador,
    nombre: contratadorData.nombre ?? oldProfile.nombre,
    apellido: contratadorData.apellido ?? oldProfile.apellido,
    email_contratador:
      contratadorData.email_contratador ?? oldProfile.email_contratador,
    telefono_contratador:
      contratadorData.telefono_contratador ?? oldProfile.telefono_contratador,
    dni: contratadorData.dni ?? oldProfile.dni,
    id_zona_geografica_contratador:
      zonaData.id_zona_geografica ?? zonaData.id ?? oldProfile.id_zona_geografica_contratador,
    zona_geografica_contratador: zonaData,
  });

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Mi Perfil</Text>
      <Text style={styles.roleIndicator}>
        Perfil Activo: {roleActive === "contratador" ? "Contratador" : "Trabajador"}
      </Text>

      <Text style={styles.label}>Nombre</Text>
      <TextInput
        style={styles.input}
        value={form.nombre}
        onChangeText={(v) => handleChange("nombre", v)}
      />

      <Text style={styles.label}>Apellido</Text>
      <TextInput
        style={styles.input}
        value={form.apellido}
        onChangeText={(v) => handleChange("apellido", v)}
      />

      <Text style={styles.label}>Email de contacto</Text>
      <TextInput
        style={styles.input}
        value={form.email_contratador}
        onChangeText={(v) => handleChange("email_contratador", v)}
      />

      <Text style={styles.label}>Teléfono</Text>
      <TextInput
        style={styles.input}
        value={form.telefono_contratador}
        onChangeText={(v) => handleChange("telefono_contratador", v)}
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>DNI</Text>
      <TextInput
        style={[styles.input, { backgroundColor: form.dni ? "#eee" : "#fff" }]}
        value={form.dni?.toString() ?? ""}
        onChangeText={(v) => handleChange("dni", v)}
        keyboardType="numeric"
      />

      <Text style={[styles.subtitle, { marginTop: 12 }]}>Dirección</Text>

      <Text style={styles.label}>Calle</Text>
      <TextInput
        style={styles.input}
        value={form.calle}
        onChangeText={(v) => handleChange("calle", v)}
      />

      <Text style={styles.label}>Ciudad</Text>
      <TextInput
        style={styles.input}
        value={form.ciudad}
        onChangeText={(v) => handleChange("ciudad", v)}
      />

      <Text style={styles.label}>Provincia</Text>
      <TextInput
        style={styles.input}
        value={form.provincia}
        onChangeText={(v) => handleChange("provincia", v)}
      />

      <View style={{ marginTop: 20 }}>
        {saving ? (
          <ActivityIndicator />
        ) : (
          <Pressable style={styles.saveButton} onPress={saveProfile}>
            <Text style={styles.saveButtonText}>Guardar Perfil</Text>
          </Pressable>
        )}
      </View>

      {workerProfile?.id_trabajador ? (
        <Pressable style={styles.switchButton} onPress={toggleRole}>
          <Text style={styles.switchText}>
            {roleActive === "contratador"
              ? "Cambiar a Perfil Trabajador"
              : "Cambiar a Perfil Contratador"}
          </Text>
        </Pressable>
      ) : (
        <Pressable
          style={styles.workerButton}
          onPress={() => navigation.navigate("RegistroTrabajador")}
        >
          <Text style={styles.workerButtonText}>Registrarme como Trabajador</Text>
        </Pressable>
      )}

      <Pressable
        style={styles.logoutButton}
        onPress={async () => {
          await signOutUser();
          navigation.navigate("Login");
        }}
      >
        <Text style={styles.logoutText}>Cerrar sesión</Text>
      </Pressable>

      {/* MODAL ÉXITO */}
      <Modal visible={successModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBoxSuccess}>
            <Text style={styles.modalTitle}>¡Información guardada con éxito!</Text>
            <Pressable
              style={styles.modalButton}
              onPress={() => setSuccessModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Aceptar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* MODAL ERROR */}
      <Modal visible={errorModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBoxError}>
            <Text style={styles.modalTitle}>Por favor revise la información ingresada</Text>
            <Pressable
              style={styles.modalButtonError}
              onPress={() => setErrorModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#fff", height: "100%" },
  title: { fontSize: 24, fontWeight: "700", color: "#228B22", textAlign: "center", marginBottom: 12 },
  roleIndicator: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginBottom: 15,
    backgroundColor: "#f0f0f0",
    padding: 8,
    borderRadius: 8,
  },
  label: { color: "#006400", marginTop: 8 },
  input: { borderWidth: 1, borderColor: "#006400", padding: 8, borderRadius: 8, backgroundColor: "#F8FFF8" },
  subtitle: { color: "#006400", fontWeight: "600", marginTop: 6 },
  saveButton: {
    backgroundColor: "#228B22",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  switchButton: { backgroundColor: "#007AFF", padding: 12, borderRadius: 8, marginTop: 12, alignItems: "center" },
  switchText: { color: "#fff", fontWeight: "700" },
  workerButton: { backgroundColor: "#006400", padding: 12, borderRadius: 8, marginTop: 12, alignItems: "center" },
  workerButtonText: { color: "#fff", fontWeight: "700" },
  logoutButton: { backgroundColor: "#B22222", padding: 12, borderRadius: 8, marginTop: 16, alignItems: "center", marginBottom: 40 },
  logoutText: { color: "#fff", fontWeight: "700" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" },
  modalBoxSuccess: { backgroundColor: "#e9fbe9", padding: 25, borderRadius: 14, width: "80%", alignItems: "center" },
  modalBoxError: { backgroundColor: "#fde8e8", padding: 25, borderRadius: 14, width: "80%", alignItems: "center" },
  modalTitle: { fontSize: 18, fontWeight: "700", color: "#333", textAlign: "center", marginBottom: 15 },
  modalButton: { backgroundColor: "#228B22", paddingVertical: 10, paddingHorizontal: 30, borderRadius: 8 },
  modalButtonError: { backgroundColor: "#B22222", paddingVertical: 10, paddingHorizontal: 30, borderRadius: 8 },
  modalButtonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});

export default MiPerfilScreen;

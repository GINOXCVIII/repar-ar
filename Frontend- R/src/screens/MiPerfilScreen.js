import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Alert, ActivityIndicator } from "react-native";
import axios from "axios";
import { useAuth } from "../contexts/AuthProvider";

const BASE_URL = "http://127.0.0.1:8000/api";

const MiPerfilScreen = ({ navigation }) => {
  const { firebaseUser, profile, setProfile, signOutUser, roleActive, workerProfile, toggleRole } = useAuth();
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
  const [loadingProfile, setLoadingProfile] = useState(false);

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
            await axios.patch(`${BASE_URL}/zonas-geograficas/${profile.zona_geografica_contratador.id_zona_geografica}/`, payloadZona);
          } catch (e) {
            console.warn("No se pudo patch zona:", e.response?.data || e);
          }
          const res = await axios.patch(`${BASE_URL}/contratadores/${profile.id_contratador}/`, payloadContratador);
          const p = { ...profile, ...res.data };
          setProfile(p);
          Alert.alert("Perfil actualizado");
        } else {
          const zonaRes = await axios.post(`${BASE_URL}/zonas-geograficas/`, payloadZona);
          const zonaId = zonaRes.data.id_zona_geografica ?? zonaRes.data.id ?? zonaRes.data;
          const res = await axios.patch(`${BASE_URL}/contratadores/${profile.id_contratador}/`, {
            ...payloadContratador,
            id_zona_geografica_contratador: zonaId,
          });
          const p = normalizeAndMergeProfile(profile, res.data, zonaRes.data);
          setProfile(p);
          Alert.alert("Perfil actualizado");
        }
      } else {
        const zonaRes = await axios.post(`${BASE_URL}/zonas-geograficas/`, payloadZona);
        const zonaId = zonaRes.data.id_zona_geografica ?? zonaRes.data.id ?? zonaRes.data;
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
        Alert.alert("Perfil creado correctamente");
      }
    } catch (err) {
      console.error("Error guardando perfil:", err.response?.data || err);
      Alert.alert("Error guardando perfil", JSON.stringify(err.response?.data ?? err.message ?? err));
    } finally {
      setSaving(false);
    }
  };

  const normalizeAndMergeProfile = (oldProfile, contratadorData, zonaData) => {
    return {
      raw: contratadorData,
      id_contratador: contratadorData.id_contratador ?? contratadorData.id ?? oldProfile.id_contratador,
      nombre: contratadorData.nombre ?? oldProfile.nombre,
      apellido: contratadorData.apellido ?? oldProfile.apellido,
      email_contratador: contratadorData.email_contratador ?? oldProfile.email_contratador,
      telefono_contratador: contratadorData.telefono_contratador ?? oldProfile.telefono_contratador,
      dni: contratadorData.dni ?? oldProfile.dni,
      id_zona_geografica_contratador: zonaData.id_zona_geografica ?? zonaData.id ?? oldProfile.id_zona_geografica_contratador,
      zona_geografica_contratador: zonaData,
    };
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Mi Perfil</Text>

      <Text style={styles.roleIndicator}>
        Perfil Activo: {roleActive === 'contratador' ? 'Contratador' : 'Trabajador'}
      </Text>

      <Text style={styles.label}>Nombre</Text>
      <TextInput style={styles.input} value={form.nombre} onChangeText={(v) => handleChange("nombre", v)} />

      <Text style={styles.label}>Apellido</Text>
      <TextInput style={styles.input} value={form.apellido} onChangeText={(v) => handleChange("apellido", v)} />

      <Text style={styles.label}>Email de contacto</Text>
      <TextInput style={styles.input} value={form.email_contratador} onChangeText={(v) => handleChange("email_contratador", v)} />

      <Text style={styles.label}>Teléfono</Text>
      <TextInput style={styles.input} value={form.telefono_contratador} onChangeText={(v) => handleChange("telefono_contratador", v)} keyboardType="phone-pad" />

      <Text style={styles.label}>DNI</Text>
      <TextInput style={[styles.input, { backgroundColor: "#eee" }]} value={form.dni} editable={false} onChangeText={(v) => handleChange("dni", v)} keyboardType="numeric" />

      <Text style={[styles.subtitle, { marginTop: 12 }]}>Dirección (zona geográfica)</Text>
      <Text style={styles.label}>Calle</Text>
      <TextInput style={styles.input} value={form.calle} onChangeText={(v) => handleChange("calle", v)} />

      <Text style={styles.label}>Ciudad</Text>
      <TextInput style={styles.input} value={form.ciudad} onChangeText={(v) => handleChange("ciudad", v)} />

      <Text style={styles.label}>Provincia</Text>
      <TextInput style={styles.input} value={form.provincia} onChangeText={(v) => handleChange("provincia", v)} />

      <View style={{ marginTop: 14 }}>
        {saving ? <ActivityIndicator /> : <Button title="Guardar perfil" color="#228B22" onPress={saveProfile} />}
      </View>

      {workerProfile ? (
        <View style={{ marginTop: 10 }}>
          <Button 
            title={roleActive === 'contratador' ? "Cambiar a Perfil Trabajador" : "Cambiar a Perfil Contratador"}
            color="#007AFF"
            onPress={toggleRole} 
          />
        </View>
      ) : (
        <View style={{ marginTop: 10 }}>
          <Button 
            title="Registrarme como Trabajador" 
            color="#006400" 
            onPress={() => navigation.navigate('RegistroTrabajador')} 
          />
        </View>
      )}

      <View style={{ marginTop: 10, marginBottom: 40 }}>
        <Button title="Cerrar sesión" color="#B22222" onPress={async () => { await signOutUser(); navigation.navigate("Login"); }} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#fff", height: "100%" },
  title: { fontSize: 22, fontWeight: "700", color: "#228B22", textAlign: "center", marginBottom: 12 },
  roleIndicator: {
    fontSize: 18,
    fontWeight: '600',
   color: '#333',
    textAlign: 'center',
    marginBottom: 15,
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 8
  },
  label: { color: "#006400", marginTop: 8 },
  input: { borderWidth: 1, borderColor: "#006400", padding: 8, borderRadius: 8, backgroundColor: "#F8FFF8" },
  subtitle: { color: "#006400", fontWeight: "600", marginTop: 6 },
});

export default MiPerfilScreen;


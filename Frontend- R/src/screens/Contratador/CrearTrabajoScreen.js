// src/screens/Contratador/CrearTrabajoScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  ScrollView,
  StyleSheet,
  Modal,
  Pressable,
} from "react-native";
import axios from "axios";
import { useAuth } from "../../contexts/AuthProvider";

const BASE_URL = "http://127.0.0.1:8000/api";

const CrearTrabajoScreen = ({ navigation }) => {
  const { firebaseUser, profile } = useAuth();
  const [profesiones, setProfesiones] = useState([]);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [profesionId, setProfesionId] = useState("");

  const [calleTrabajo, setCalleTrabajo] = useState("");
  const [ciudadTrabajo, setCiudadTrabajo] = useState("");
  const [provinciaTrabajo, setProvinciaTrabajo] = useState("");

  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);

  useEffect(() => {
    const loadProf = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/profesiones/`);
        setProfesiones(res.data);
      } catch (err) {
        console.error("Error cargando profesiones:", err.response?.data || err);
      }
    };
    loadProf();
  }, []);

  const validarPerfilCompleto = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/contratadores/${profile.id_contratador}/`);
      const data = res.data;
      const camposIncompletos =
        !data.nombre || !data.apellido || !data.email_contratador || !data.telefono_contratador;

      return !camposIncompletos;
    } catch (err) {
      console.error("Error al validar contratador:", err.response?.data || err);
      return false;
    }
  };

  const handleCrearTrabajo = async () => {
    if (!profile || !profile.id_contratador) {
      setModalVisible(true);
      return;
    }

    const perfilCompleto = await validarPerfilCompleto();
    if (!perfilCompleto) {
      setModalVisible(true);
      return;
    }

    if (!titulo || !descripcion || !profesionId) {
      alert("Completá título, descripción y profesión requerida.");
      return;
    }

    const zonaTrabajoVacia = !calleTrabajo && !ciudadTrabajo && !provinciaTrabajo;
    const idZonaContratador =
      profile.id_zona_geografica_contratador ??
      profile.zona_geografica_contratador?.id_zona_geografica;

    if (zonaTrabajoVacia && !idZonaContratador) {
      alert(
        "Debes especificar la zona del trabajo o asegurarte de que tu perfil de contratador tenga una zona definida."
      );
      return;
    }

    setLoading(true);
    try {
      const payload = {
        id_contratador: profile.id_contratador,
        id_profesion_requerida: profesionId,
        id_zona_geografica_trabajo:
          profile.id_zona_geografica_contratador ??
          profile.zona_geografica_contratador?.id_zona_geografica ??
          null,
        id_estado: 1,
        titulo: titulo,
        descripcion: descripcion,
        fecha_creacion: new Date().toISOString(),
      };

      if (!zonaTrabajoVacia) {
        payload.zona_geografica_trabajo_data = {
          calle: calleTrabajo,
          ciudad: ciudadTrabajo,
          provincia: provinciaTrabajo,
        };
      } else if (idZonaContratador) {
        payload.id_zona_geografica_trabajo = idZonaContratador;
      }

      if (profile.id_trabajador) {
        payload.id_trabajador = profile.id_trabajador;
      }

      await axios.post(`${BASE_URL}/trabajos/`, payload);

      setSuccessModalVisible(true);
    } catch (err) {
      console.error("Error creando trabajo:", err.response?.data || err);
      alert("Error al crear el trabajo.");
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setSuccessModalVisible(false);
    // redirigir al usuario
    navigation.navigate("Mis Trabajos");
    // limpiar form
    setTitulo("");
    setDescripcion("");
    setProfesionId("");
    setCalleTrabajo("");
    setCiudadTrabajo("");
    setProvinciaTrabajo("");
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Crear Trabajo</Text>

      <Text style={styles.label}>Título</Text>
      <TextInput style={styles.input} value={titulo} onChangeText={setTitulo} />

      <Text style={styles.label}>Descripción</Text>
      <TextInput
        style={[styles.input, { height: 100 }]}
        multiline
        value={descripcion}
        onChangeText={setDescripcion}
      />

      <Text style={styles.label}>Profesión requerida</Text>
      <View style={styles.selectWrap}>
        <select
          value={profesionId}
          onChange={(e) => setProfesionId(e.target.value)}
          style={styles.select}
        >
          <option value="">Seleccionar profesión</option>
          {profesiones.map((p) => (
            <option key={p.id_profesion ?? p.id} value={p.id_profesion ?? p.id}>
              {p.nombre_profesion ?? p.nombre}
            </option>
          ))}
        </select>
      </View>

      <Text style={[styles.label, { marginTop: 20, fontWeight: "bold" }]}>
        Zona Geográfica del Trabajo
      </Text>
      <Text style={[styles.label, { fontSize: 12 }]}>
        Dejar vacío para usar su dirección de perfíl
      </Text>

      <Text style={styles.label}>Calle</Text>
      <TextInput
        style={styles.input}
        value={calleTrabajo}
        onChangeText={setCalleTrabajo}
        placeholder="Ej: Av. Principal 123"
      />

      <Text style={styles.label}>Ciudad</Text>
      <TextInput
        style={styles.input}
        value={ciudadTrabajo}
        onChangeText={setCiudadTrabajo}
        placeholder="Ej: Morón"
      />

      <Text style={styles.label}>Provincia</Text>
      <TextInput
        style={styles.input}
        value={provinciaTrabajo}
        onChangeText={setProvinciaTrabajo}
        placeholder="Ej: Buenos Aires"
      />

      <View style={{ marginTop: 16 }}>
        <Button
          title={loading ? "Guardando..." : "Crear Trabajo"}
          color="#228B22"
          onPress={handleCrearTrabajo}
          disabled={loading}
        />
      </View>

      <Modal transparent visible={modalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>¡Atención!</Text>
            <Text style={styles.modalText}>
              ¡POR FAVOR COMPLETAR DATOS DE SU PERFIL PARA PODER CREAR UN TRABAJO!
            </Text>
            <Pressable
              style={styles.modalButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>Entendido</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={successModalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { borderColor: "#16a34a", borderWidth: 2 }]}>
            <Text style={[styles.modalTitle, { color: "#16a34a" }]}>🎉 FELICITACIONES</Text>
            <Text style={styles.modalText}>¡Trabajo creado con éxito!</Text>
            <Pressable
              style={[styles.modalButton, { backgroundColor: "#16a34a" }]}
              onPress={handleSuccessClose}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>Aceptar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#fff", height: "100%" },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#228B22",
    textAlign: "center",
    marginBottom: 12,
  },
  label: { color: "#006400", marginTop: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#006400",
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#F8FFF8",
  },
  selectWrap: { marginTop: 8 },
  select: {
    width: "100%",
    padding: 8,
    borderRadius: 8,
    borderColor: "#006400",
    borderWidth: 1,
    backgroundColor: "#F8FFF8",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    width: "85%",
    alignItems: "center",
  },
  modalTitle: { fontSize: 20, fontWeight: "800", color: "#b91c1c" },
  modalText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginTop: 10,
  },
  modalButton: {
    marginTop: 20,
    backgroundColor: "#228B22",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
});

export default CrearTrabajoScreen;

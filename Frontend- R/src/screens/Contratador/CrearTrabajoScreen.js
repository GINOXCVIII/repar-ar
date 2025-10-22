// src/screens/Contratador/CrearTrabajoScreen.js
import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, ScrollView, Alert, StyleSheet } from "react-native";
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

  const handleCrearTrabajo = async () => {
    // Validaciones básicas
    if (!profile || !profile.id_contratador) {
      Alert.alert("Perfil incompleto", "Completá tu perfil antes de crear un trabajo.");
      navigation.navigate("MiPerfil");
      return;
    }
    if (!titulo || !descripcion || !profesionId) {
      Alert.alert("Faltan datos", "Completá título, descripción y profesión requerida.");
      return;
    }

    const zonaTrabajoVacia = !calleTrabajo && !ciudadTrabajo && !provinciaTrabajo;
    const idZonaContratador = profile.id_zona_geografica_contratador ?? profile.zona_geografica_contratador?.id_zona_geografica;

    if (zonaTrabajoVacia && !idZonaContratador) {
       Alert.alert("Zona Geográfica Requerida", "Debes especificar la zona del trabajo o asegurarte de que tu perfil de contratador tenga una zona definida.");
       return;
    }

    setLoading(true);
    try {
      // Construyo payload según serializers.py / models.py que tienes en backend
      const payload = {
        id_contratador: profile.id_contratador,
        // id_trabajador: null,
        id_profesion_requerida: profesionId,
        id_zona_geografica_trabajo: profile.id_zona_geografica_contratador ?? profile.zona_geografica_contratador?.id_zona_geografica ?? null,
        id_estado: 1, // asumimos estado por defecto (1). Ajustar si tu backend requiere otro id.
        descripcion: descripcion,
        fecha_creacion: new Date().toISOString(),
        // fecha_inicio: null,
        // fecha_fin: null,
        // otros campos que tu serializer acepte pueden agregarse
      };

      /*if (profile.id_zona_geografica_contratador ?? profile.zona_geografica_contratador?.id_zona_geografica) {
        payload.id_zona_geografica_trabajo =
        profile.id_zona_geografica_contratador ?? profile.zona_geografica_contratador.id_zona_geografica;
      }
      */

      if (!zonaTrabajoVacia) {
        // Enviar datos de zona nueva para que el backend la busque/cree
        payload.zona_geografica_trabajo_data = {
          calle: calleTrabajo,
          ciudad: ciudadTrabajo,
          provincia: provinciaTrabajo,
        };
      } else if (idZonaContratador) {
         // Usar la zona del contratador (se envía el ID directamente)
         payload.id_zona_geografica_trabajo = idZonaContratador;
      }

      // Si no hay trabajador asignado todavía, no lo agregamos:
      if (profile.id_trabajador) {
        payload.id_trabajador = profile.id_trabajador;
      }

      console.log("Contenido de payload: ", payload)

      const res = await axios.post(`${BASE_URL}/trabajos/`, payload);
      Alert.alert("Trabajo creado", "El trabajo fue creado correctamente.");
      // limpiar form
      setTitulo("");
      setDescripcion("");
      setProfesionId("");
      setCalleTrabajo("");
      setCiudadTrabajo("");
      setProvinciaTrabajo("");
      // opcional: navegación a MisTrabajos
      navigation.navigate("Mis Trabajos");
    } catch (err) {
      console.error("Error creando trabajo:", err.response?.data || err);
      Alert.alert("Error", JSON.stringify(err.response?.data ?? err.message ?? err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Crear Trabajo</Text>

      <Text style={styles.label}>Título</Text>
      <TextInput style={styles.input} value={titulo} onChangeText={setTitulo} />

      <Text style={styles.label}>Descripción</Text>
      <TextInput style={[styles.input, { height: 100 }]} multiline value={descripcion} onChangeText={setDescripcion} />

      <Text style={styles.label}>Profesión requerida</Text>
      {/* Usamos un select web-friendly para expo web; en móvil podés reemplazar por Picker */}
      <View style={styles.selectWrap}>
        <select value={profesionId} onChange={(e) => setProfesionId(e.target.value)} style={styles.select}>
          <option value="">Seleccionar profesión</option>
          {profesiones.map((p) => (
            <option key={p.id_profesion ?? p.id} value={p.id_profesion ?? p.id}>
              {p.nombre_profesion ?? p.nombre}
            </option>
          ))}
        </select>
      </View>

      {/* CAMPOS DE ZONA GEOGRAFICA DEL TRABAJO */}
      <Text style={[styles.label, {marginTop: 20, fontWeight: 'bold'}]}>Zona Geográfica del Trabajo</Text>
      <Text style={[styles.label, {fontSize: 12}]}>Dejar vacío para usar su dirección de perfíl</Text>
      <Text style={styles.label}>Calle</Text>
      <TextInput style={styles.input} value={calleTrabajo} onChangeText={setCalleTrabajo} placeholder="Ej: Av. Principal 123" />

      <Text style={styles.label}>Ciudad</Text>
      <TextInput style={styles.input} value={ciudadTrabajo} onChangeText={setCiudadTrabajo} placeholder="Ej: Morón" />

      <Text style={styles.label}>Provincia</Text>
      <TextInput style={styles.input} value={provinciaTrabajo} onChangeText={setProvinciaTrabajo} placeholder="Ej: Buenos Aires" />

      <View style={{ marginTop: 16 }}>
        <Button title={loading ? "Guardando..." : "Crear Trabajo"} color="#228B22" onPress={handleCrearTrabajo} disabled={loading} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#fff", height: "100%" },
  title: { fontSize: 22, fontWeight: "700", color: "#228B22", textAlign: "center", marginBottom: 12 },
  label: { color: "#006400", marginTop: 8 },
  input: { borderWidth: 1, borderColor: "#006400", padding: 8, borderRadius: 8, backgroundColor: "#F8FFF8" },
  selectWrap: { marginTop: 8 },
  select: { width: "100%", padding: 8, borderRadius: 8, borderColor: "#006400", borderWidth: 1, backgroundColor: "#F8FFF8" },
});

export default CrearTrabajoScreen;

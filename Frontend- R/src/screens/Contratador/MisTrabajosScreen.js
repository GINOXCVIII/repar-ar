// src/screens/Contratador/MisTrabajosScreen.js
// Muestra TODOS los trabajos cuyo campo id_contratador coincide con el id_contratador
// del contratador asociado al firebase UID del usuario logueado.
//
// Flujo:
// 1) Obtener contratador por firebase_uid
// 2) Extraer id_contratador
// 3) Intentar GET /trabajos/?id_contratador=<id>
// 4) Si no hay resultados o falla, GET /trabajos/ y filtrar localmente por id_contratador
//
// Comentarios en español para facilitar mantenimiento.

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Alert,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import api from "../../api/api"; // usa tu instancia axios ya configurada
import { useAuth } from "../../contexts/AuthProvider";
import { useIsFocused, useNavigation } from "@react-navigation/native";

export default function MisTrabajosScreen() {
  const { firebaseUser } = useAuth();
  const [contratador, setContratador] = useState(null); // objeto contratador desde backend
  const [trabajos, setTrabajos] = useState([]);
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused();
  const navigation = useNavigation();

  useEffect(() => {
    if (isFocused) {
      cargarMisTrabajos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocused, firebaseUser]);

  const cargarMisTrabajos = async () => {
    setLoading(true);
    setTrabajos([]);
    try {
      if (!firebaseUser || !firebaseUser.uid) {
        console.warn("MisTrabajosScreen: no hay firebaseUser disponible");
        setLoading(false);
        return;
      }

      // 1) Obtener contratador por firebase_uid
      const respContr = await api.get(`/contratadores/?firebase_uid=${firebaseUser.uid}`);
      const contratadores = Array.isArray(respContr.data) ? respContr.data : [];

      if (contratadores.length === 0) {
        // No hay contratador asociado: avisar y salir
        console.warn("MisTrabajosScreen: no se encontró contratador para uid:", firebaseUser.uid);
        setContratador(null);
        setTrabajos([]);
        setLoading(false);
        return;
      }

      const miContratador = contratadores[0];
      setContratador(miContratador);

      // 2) Extraer id_contratador (campo exacto del backend)
      const idContratador = miContratador.id_contratador ?? miContratador.id ?? null;

      if (!idContratador && idContratador !== 0) {
        console.warn("MisTrabajosScreen: id_contratador inválido en contratador:", miContratador);
        setTrabajos([]);
        setLoading(false);
        return;
      }

      // 3) Intentar pedir trabajos filtrados por backend (si soporta query param)
      try {
        const respTrabajosFiltro = await api.get(`/trabajos/?id_contratador=${idContratador}`);
        const trabajosFiltradosPorBackend = Array.isArray(respTrabajosFiltro.data)
          ? respTrabajosFiltro.data
          : [];

        // Si el backend devolvió una lista (incluso vacía), la usamos:
        if (Array.isArray(trabajosFiltradosPorBackend)) {
          // Aunque el backend filtre, por seguridad comprobamos y normalizamos tipos.
          const normalized = trabajosFiltradosPorBackend.filter((t) =>
            compararIdContratador(t, idContratador)
          );
          setTrabajos(normalized);
          setLoading(false);
          return;
        }
      } catch (errFilter) {
        // Si falla (endpoint no soporta el filtro o error), seguimos al fallback.
        console.warn("MisTrabajosScreen: petición filtrada por backend falló (fallback):", errFilter?.response?.data || errFilter.message || errFilter);
      }

      // 4) FALLBACK: traer todos los trabajos y filtrar localmente por id_contratador exacto
      try {
        const respAll = await api.get("/trabajos/");
        const todos = Array.isArray(respAll.data) ? respAll.data : [];

        const trabajosFiltrados = todos.filter((t) => compararIdContratador(t, idContratador));
        setTrabajos(trabajosFiltrados);
      } catch (errAll) {
        console.error("MisTrabajosScreen: error al obtener todos los trabajos:", errAll?.response?.data || errAll.message || errAll);
        Alert.alert("Error", "No se pudieron obtener los trabajos. Revisá la conexión al backend.");
        setTrabajos([]);
      }
    } catch (err) {
      console.error("MisTrabajosScreen - error general:", err?.response?.data || err.message || err);
      Alert.alert("Error", "Ocurrió un error al cargar tus trabajos.");
      setTrabajos([]);
    } finally {
      setLoading(false);
    }
  };

  // Función que compara el id_contratador esperado con el trabajo,
  // usando el campo exacto que usa tu backend: t.id_contratador
  // Hacemos conversión segura a string para evitar problemas de tipo.
  const compararIdContratador = (trabajo, idContratadorEsperado) => {
    // Si el trabajo trae exactamente id_contratador en la raíz, usamos eso (es lo que pediste)
    if (trabajo == null) return false;

    // Primer preferido: campo tal como está en tu backend
    if (trabajo.id_contratador !== undefined && trabajo.id_contratador !== null) {
      return String(trabajo.id_contratador) === String(idContratadorEsperado);
    }

    // Si por alguna razón vino anidado en 'contratador' (defensivo), lo cubrimos:
    if (trabajo.contratador && (trabajo.contratador.id_contratador !== undefined || trabajo.contratador.id !== undefined)) {
      const nested = trabajo.contratador.id_contratador ?? trabajo.contratador.id;
      return String(nested) === String(idContratadorEsperado);
    }

    // No se encontró campo, entonces no es del contratador
    return false;
  };

  const renderItem = ({ item }) => {
    const titulo = item.titulo ?? item.title ?? "Sin título";
    const descripcion = item.descripcion ?? "";
    const profesion = item.profesion_requerida?.nombre_profesion ?? item.profesion_requerida?.nombre ?? "No especificada";
    const ciudad = item.zona_geografica_trabajo?.ciudad ?? item.zona_geografica_trabajo?.nombre ?? "-";
    const provincia = item.zona_geografica_trabajo?.provincia ?? "-";
    const estado = item.estado?.nombre_estado ?? "-";

    return (
      <View style={styles.card}>
        <Text style={styles.titulo}>{titulo}</Text>
        <Text style={styles.descripcion}>{descripcion}</Text>

        <View style={styles.row}>
          <Text style={styles.info}>{profesion}</Text>
          <Text style={styles.info}>{ciudad}{provincia ? `, ${provincia}` : ""}</Text>
        </View>

        <View style={styles.rowBottom}>
          <Text style={styles.estado}>Estado: {estado}</Text>
          <TouchableOpacity onPress={() => navigation.navigate && navigation.navigate("JobDetail", { job: item })}>
            <Text style={styles.link}>Ver postulantes</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Mis Trabajos</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#0b9d57" style={{ marginTop: 20 }} />
      ) : trabajos.length === 0 ? (
        <View style={{ padding: 20 }}>
          <Text style={{ textAlign: "center", color: "#666" }}>No tenés trabajos publicados todavía.</Text>
        </View>
      ) : (
        <FlatList
          data={trabajos}
          keyExtractor={(item, idx) => String(item.id_trabajo ?? item.id ?? idx)}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 12 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0fff4" },
  header: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0b9d57",
    marginTop: 12,
    marginBottom: 8,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  titulo: { fontSize: 16, fontWeight: "700", color: "#006400" },
  descripcion: { marginTop: 8, color: "#333" },
  row: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  info: { color: "#0b9d57", fontWeight: "600" },
  rowBottom: { marginTop: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  estado: { color: "#006400", fontWeight: "600" },
  link: { color: "#0b9d57", fontWeight: "700" },
});

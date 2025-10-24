// src/screens/Contratador/PostulacionesContratador.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Pressable,
  Alert,
  ScrollView,
} from "react-native";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../contexts/AuthProvider"; // 🔹 usamos tu AuthProvider

const BASE_URL = "http://127.0.0.1:8000/api"; // ajustá si cambia tu backend

export default function PostulacionesContratador({ route, navigation }) {
  const { trabajoId } = route.params || {};
  const { firebaseUser } = useAuth(); // 🔹 accedemos si se necesitara el user
  const [loading, setLoading] = useState(true);
  const [postulantes, setPostulantes] = useState([]);
  const [selectedComments, setSelectedComments] = useState([]);
  const [commentsModalVisible, setCommentsModalVisible] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [chosenTrabajador, setChosenTrabajador] = useState(null);
  const [processingChoice, setProcessingChoice] = useState(false);

  useEffect(() => {
    if (!trabajoId) {
      Alert.alert("Error", "No se recibió el id del trabajo.");
      navigation.goBack();
      return;
    }
    fetchPostulantes();
  }, [trabajoId]);

  const fetchPostulantes = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/postulaciones/`, {
        params: { id_trabajo: trabajoId },
      });
      const postulaciones = Array.isArray(res.data) ? res.data : [];

      const idsTrabajadores = Array.from(new Set(postulaciones.map((p) => p.id_trabajador)));

      const detallesPromises = idsTrabajadores.map(async (id_trabajador) => {
        let trabajadorData = null;
        try {
          const tRes = await axios.get(`${BASE_URL}/trabajadores/${id_trabajador}/`);
          trabajadorData = tRes.data;
        } catch (err) {
          console.warn("No se pudo obtener trabajador", id_trabajador, err.response?.data || err);
        }

        let califs = [];
        try {
          const cRes = await axios.get(`${BASE_URL}/calificaciones/calificaciones-trabajadores/`, {
            params: { id_trabajador },
          });
          califs = Array.isArray(cRes.data) ? cRes.data : [];
        } catch (err) {
          console.warn("No se pudieron traer calificaciones para trabajador", id_trabajador);
        }

        const comentarios = califs.map((c) => c.comentario).filter(Boolean);
        const numeros = califs.map((c) => Number(c.calificacion)).filter((n) => !isNaN(n));
        const promedio = numeros.length ? numeros.reduce((a, b) => a + b, 0) / numeros.length : null;

        return {
          id_trabajador,
          nombre: trabajadorData?.nombre ?? "",
          apellido: trabajadorData?.apellido ?? "",
          promedio,
          comentarios,
        };
      });

      const detalles = await Promise.all(detallesPromises);
      setPostulantes(detalles);
    } catch (err) {
      console.error("Error al traer postulantes:", err.response?.data || err);
      Alert.alert("Error", "No se pudieron cargar los postulantes.");
      setPostulantes([]);
    } finally {
      setLoading(false);
    }
  };

  const openComments = (comentarios) => {
    setSelectedComments(comentarios || []);
    setCommentsModalVisible(true);
  };

  const openConfirm = (trabajador) => {
    setChosenTrabajador(trabajador);
    setConfirmModalVisible(true);
  };

  const confirmChooseTrabajador = async () => {
    if (!chosenTrabajador) return;
    setProcessingChoice(true);
    try {
      const payload = { id_trabajador: chosenTrabajador.id_trabajador };
      await axios.patch(`${BASE_URL}/trabajos/${trabajoId}/`, payload);
      Alert.alert("Confirmado", "El trabajador fue seleccionado correctamente.");
      setConfirmModalVisible(false);
      navigation.goBack();
    } catch (err) {
      console.error("Error confirmando trabajador:", err.response?.data || err);
      Alert.alert("Error", "No se pudo seleccionar al trabajador.");
    } finally {
      setProcessingChoice(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.title}>{item.apellido || "Sin apellido"}</Text>
        <Ionicons name="person-circle-outline" size={28} color="#2d6a4f" />
      </View>
      <Text style={styles.subtitle}>
        {item.promedio !== null ? `Promedio: ${item.promedio.toFixed(1)}` : "Sin calificaciones"}
      </Text>
      <Text style={styles.description}>{item.nombre}</Text>
      <View style={styles.row}>
        <TouchableOpacity style={styles.linkButton} onPress={() => openComments(item.comentarios)}>
          <Text style={styles.linkText}>Ver comentarios</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.chooseButton} onPress={() => openConfirm(item)}>
          <Text style={styles.chooseText}>ELEGIR TRABAJADOR</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2d6a4f" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>Postulantes</Text>

      {postulantes.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No hay postulantes todavía.</Text>
        </View>
      ) : (
        <FlatList
          data={postulantes}
          keyExtractor={(it) => String(it.id_trabajador)}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 32 }}
        />
      )}

      {/* Modal comentarios */}
      <Modal visible={commentsModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Comentarios</Text>
            <ScrollView>
              {selectedComments.length === 0 ? (
                <Text>No hay comentarios.</Text>
              ) : (
                selectedComments.map((c, i) => (
                  <Text key={i} style={{ marginBottom: 6 }}>
                    - {c}
                  </Text>
                ))
              )}
            </ScrollView>
            <Pressable style={styles.modalClose} onPress={() => setCommentsModalVisible(false)}>
              <Text style={{ color: "#fff" }}>Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Modal confirmar */}
      <Modal visible={confirmModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.confirmBox}>
            <Text style={styles.confirmTitle}>¿Confirmar este trabajador?</Text>
            <View style={{ flexDirection: "row", marginTop: 20 }}>
              <TouchableOpacity
                style={[styles.btnConfirm, { backgroundColor: "#e11d48", marginRight: 8 }]}
                onPress={() => setConfirmModalVisible(false)}
              >
                <Text style={{ color: "#fff" }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btnConfirm, { backgroundColor: "#2d6a4f" }]}
                onPress={confirmChooseTrabajador}
              >
                <Text style={{ color: "#fff" }}>
                  {processingChoice ? "Procesando..." : "Confirmar"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  screenTitle: { fontSize: 20, fontWeight: "700", color: "#2d6a4f", marginBottom: 12 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  card: {
    backgroundColor: "#f7fff7",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    elevation: 1,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { color: "#14532d", fontSize: 16, fontWeight: "700" },
  subtitle: { color: "#2d6a4f", fontSize: 13, marginTop: 6, fontWeight: "600" },
  description: { color: "#264a3b", fontSize: 13, marginTop: 6 },
  row: { flexDirection: "row", justifyContent: "space-between", marginTop: 12, alignItems: "center" },
  linkButton: { paddingVertical: 6, paddingHorizontal: 10 },
  linkText: { color: "#2d6a4f", fontWeight: "700" },
  chooseButton: {
    backgroundColor: "#2d6a4f",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  chooseText: { color: "#fff", fontWeight: "800" },
  empty: { alignItems: "center", marginTop: 40 },
  emptyText: { color: "#2d6a4f", fontSize: 15 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" },
  modalContent: { width: "90%", backgroundColor: "#fff", borderRadius: 12, padding: 16 },
  modalTitle: { fontWeight: "700", fontSize: 18, color: "#14532d" },
  modalClose: { marginTop: 12, backgroundColor: "#2d6a4f", padding: 10, borderRadius: 8, alignItems: "center" },
  confirmBox: { width: "85%", backgroundColor: "#fff", padding: 18, borderRadius: 12, alignItems: "center" },
  confirmTitle: { fontSize: 16, fontWeight: "700", color: "#14532d", textAlign: "center" },
  btnConfirm: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: "center" },
});

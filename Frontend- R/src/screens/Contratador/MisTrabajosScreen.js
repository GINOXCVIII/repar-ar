// src/screens/Contratador/MisTrabajosScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Alert,
  StyleSheet,
  TouchableOpacity,
  Button,
  Modal,
  TextInput,
  ScrollView,
  Pressable,
} from "react-native";
import api from "../../api/api";
import { useAuth } from "../../contexts/AuthProvider";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

export default function MisTrabajosScreen() {
  const { firebaseUser, profile } = useAuth();
  const [trabajos, setTrabajos] = useState([]);
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused();
  const navigation = useNavigation();

  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [selectedJobToRate, setSelectedJobToRate] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [selectedJobToCancel, setSelectedJobToCancel] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (isFocused && firebaseUser) {
      cargarMisTrabajos();
    }
  }, [isFocused, firebaseUser, profile]);

  const cargarMisTrabajos = async () => {
    setLoading(true);
    setTrabajos([]);
    try {
      if (!profile || !profile.id_contratador) {
        console.warn("MisTrabajosScreen: no hay perfil de contratador disponible");
        setLoading(false);
        return;
      }
      const idContratador = profile.id_contratador;
      const respTrabajosFiltro = await api.get(`/trabajos/?id_contratador=${idContratador}`);
      setTrabajos(Array.isArray(respTrabajosFiltro.data) ? respTrabajosFiltro.data : []);
    } catch (err) {
      console.error("MisTrabajosScreen - error general:", err?.response?.data || err.message || err);
      Alert.alert("Error", "Ocurrió un error al cargar tus trabajos.");
      setTrabajos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChatPress = (item) => {
    const chatId = item.id_trabajo;
    if (!chatId) {
      Alert.alert("Error", "No se encontró el id del trabajo para abrir el chat.");
      return;
    }
    navigation.navigate("Chat", { chatId: chatId });
  };

  const openRatingModal = (job) => {
    setSelectedJobToRate(job);
    setRating(0);
    setComment("");
    setRatingModalVisible(true);
  };

  const closeRatingModal = () => {
    setRatingModalVisible(false);
    setSelectedJobToRate(null);
  };

  const handleRatingSubmit = async () => {
    if (rating === 0) {
      Alert.alert("Calificación requerida", "Por favor, selecciona de 1 a 5 estrellas.");
      return;
    }
    if (!selectedJobToRate || !profile) return;

    setIsSubmittingRating(true);
    const id_trabajo = selectedJobToRate.id_trabajo;
    const id_trabajador = selectedJobToRate.trabajador?.id_trabajador;
    const id_contratador = profile.id_contratador;
    const current_estado = selectedJobToRate.estado?.id_estado;

    if (!id_trabajador) {
      Alert.alert("Error", "No se pudo identificar al trabajador de este trabajo.");
      setIsSubmittingRating(false);
      return;
    }

    let newEstadoId;
    if (current_estado === 3) newEstadoId = 4;
    else if (current_estado === 4) newEstadoId = 5;
    else {
      Alert.alert("Error", "Este trabajo no se puede calificar en este estado.");
      setIsSubmittingRating(false);
      return;
    }

    try {
      const ratingPayload = {
        id_contratador,
        id_trabajador,
        id_trabajo,
        calificacion: rating,
        comentario: comment,
      };

      await api.post("/calificaciones/calificaciones-trabajadores/", ratingPayload);
      await api.patch(`/trabajos/${id_trabajo}/`, { id_estado: newEstadoId });

      Alert.alert("Éxito", "Trabajo finalizado y trabajador calificado.");
      closeRatingModal();
      cargarMisTrabajos();
    } catch (err) {
      console.error("Error al guardar calificación:", err.response?.data || err);
      Alert.alert("Error", "No se pudo guardar la calificación.");
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const openCancelModal = (job) => {
    setSelectedJobToCancel(job);
    setCancelModalVisible(true);
  };

  const handleCancelJob = async () => {
    if (!selectedJobToCancel) return;
    setIsCancelling(true);
    try {
      await api.patch(`/trabajos/${selectedJobToCancel.id_trabajo}/`, { id_estado: 6 });
      setCancelModalVisible(false);
      Alert.alert("Trabajo cancelado", "El trabajo fue cancelado exitosamente.");
      cargarMisTrabajos();
    } catch (err) {
      console.error("Error al cancelar trabajo:", err.response?.data || err);
      Alert.alert("Error", "No se pudo cancelar el trabajo.");
    } finally {
      setIsCancelling(false);
    }
  };

  const renderStars = () => (
    <View style={styles.starsContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Pressable key={star} onPress={() => setRating(star)}>
          <Ionicons name={rating >= star ? "star" : "star-outline"} size={36} color="#f1c40f" />
        </Pressable>
      ))}
    </View>
  );

  const renderItem = ({ item }) => {
    const titulo = item.titulo ?? "Sin título";
    const descripcion = item.descripcion ?? "";
    const profesion = item.profesion_requerida?.nombre_profesion ?? "No especificada";
    const ciudad = item.zona_geografica_trabajo?.ciudad ?? "-";
    const provincia = item.zona_geografica_trabajo?.provincia ?? "-";
    const estado = item.estado?.descripcion ?? "-";
    const idEstado = item.estado?.id_estado ?? null;
    const isActivo = idEstado === 3;
    const idTrabajo = item.id_trabajo;

    return (
      <View style={styles.card}>
        <Text style={styles.profesion}>{profesion}</Text>
        <Text style={styles.titulo}>{titulo}</Text>
        <Text style={styles.descripcion}>{descripcion}</Text>
        <Text style={styles.ubicacion}>
          {ciudad}
          {provincia ? `, ${provincia}` : ""}
        </Text>
        <Text style={styles.estadoTexto}>Estado: {estado}</Text>

        {(idEstado === 1 || idEstado === 2) && (
          <TouchableOpacity
            onPress={() => navigation.navigate("PostulacionesContratador", { trabajoId: idTrabajo })}
          >
            <Text style={styles.link}>Ver postulantes</Text>
          </TouchableOpacity>
        )}

        <View style={styles.rowBottom}>
          {isActivo ? (
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.chatButton} onPress={() => handleChatPress(item)}>
                <Ionicons name="chatbubble-ellipses-outline" size={20} color="#fff" />
                <Text style={styles.buttonText}>Chat</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.finishButton} onPress={() => openRatingModal(item)}>
                <Ionicons name="star-outline" size={20} color="#fff" />
                <Text style={styles.buttonText}>Finalizar</Text>
              </TouchableOpacity>
            </View>
          ) : (idEstado === 1 || idEstado === 2) ? (
            <View style={styles.buttonRightRow}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => openCancelModal(item)}>
                <Ionicons name="close-circle-outline" size={20} color="#fff" />
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Mis Trabajos Publicados</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#0b9d57" style={{ marginTop: 20 }} />
      ) : trabajos.length === 0 ? (
        <View style={{ padding: 20 }}>
          <Text style={{ textAlign: "center", color: "#666", fontSize: 18 }}>
            No tenés trabajos publicados todavía.
          </Text>
        </View>
      ) : (
        <FlatList
          data={trabajos}
          keyExtractor={(item, idx) => String(item.id_trabajo ?? idx)}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16 }}
          extraData={trabajos}
        />
      )}

      {/* MODAL DE CANCELAR */}
      <Modal transparent visible={cancelModalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.cancelModalBox}>
            <Text style={styles.modalTitle}>¿Estás seguro?</Text>
            <Text style={styles.modalSubtitle}>
              ¿Deseas cancelar el trabajo "{selectedJobToCancel?.titulo}"?
            </Text>
            <View style={styles.cancelModalButtons}>
              <Pressable
                style={[styles.modalButtonConfirm, { backgroundColor: "#dc2626" }]}
                onPress={handleCancelJob}
              >
                {isCancelling ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: "#fff", fontWeight: "700" }}>Confirmar</Text>
                )}
              </Pressable>
              <Pressable
                style={[styles.modalButtonConfirm, { backgroundColor: "#6b7280" }]}
                onPress={() => setCancelModalVisible(false)}
              >
                <Text style={{ color: "#fff", fontWeight: "700" }}>Cancelar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0fff4" },
  header: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0b9d57",
    marginTop: 16,
    marginBottom: 12,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 14,
    marginBottom: 14,
    marginHorizontal: 6,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  profesion: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "800",
    color: "#0b9d57",
    marginBottom: 8,
  },
  titulo: { fontSize: 18, fontWeight: "700", color: "#006400", marginBottom: 6 },
  descripcion: { fontSize: 16, color: "#333", marginBottom: 6 },
  ubicacion: { fontSize: 16, color: "#333", marginBottom: 6 },
  estadoTexto: { fontSize: 16, color: "#333", fontWeight: "600", marginBottom: 10 },
  link: {
    color: "#007AFF",
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 10,
    alignSelf: "flex-start",
  },
  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#dc2626",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  cancelText: { color: "#fff", marginLeft: 6, fontWeight: "700", fontSize: 14 },
  buttonRightRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  buttonRow: { flexDirection: "row", justifyContent: "center", gap: 10 },
  chatButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#007AFF",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  finishButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1c40f",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  buttonText: { color: "#fff", marginLeft: 5, fontWeight: "bold", fontSize: 15 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  cancelModalBox: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    width: "85%",
    alignItems: "center",
  },
  modalTitle: { fontSize: 20, fontWeight: "800", color: "#111827", textAlign: "center" },
  modalSubtitle: { fontSize: 16, color: "#333", textAlign: "center", marginTop: 10 },
  cancelModalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    width: "100%",
  },
  modalButtonConfirm: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
});

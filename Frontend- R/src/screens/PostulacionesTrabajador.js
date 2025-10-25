import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, Button, Alert, Modal, ScrollView, TextInput, Pressable } from "react-native";
import api from "../api/api";
import { useAuth } from "../contexts/AuthProvider";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const BASE_URL = "http://127.0.0.1:8000/api";

export default function MisPostulacionesScreen() {
  const { workerProfile } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused();
  const nav = useNavigation();

  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [selectedJobToRate, setSelectedJobToRate] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  useEffect(() => {
    if (!isFocused || !workerProfile || !workerProfile.id_trabajador) {
      if (isFocused && !workerProfile) {
        setLoading(false);
      }
      return;
    }
    loadMyJobs();
  }, [isFocused, workerProfile]);

  const loadMyJobs = async () => {
    setLoading(true);
    try {
      const resp = await api.get(`${BASE_URL}/postulaciones/?id_trabajador=${workerProfile.id_trabajador}`);
      setJobs(resp.data || []);
    } catch (e) {
      console.error("Error cargando mis postulacioness:", e);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChatPress = (jobId) => {
    if (!jobId) {
      Alert.alert("Error", "No se encontró el id del trabajo para abrir el chat.");
      return;
    }
    nav.navigate("Chat", { trabajoId: jobId });
  };

  const openRatingModal = (trabajo) => {
    setSelectedJobToRate(trabajo);
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
    if (!selectedJobToRate || !workerProfile) return;

    setIsSubmittingRating(true);
    
    const id_trabajo = selectedJobToRate.id_trabajo;
    const id_trabajador = workerProfile.id_trabajador;
    const id_contratador = selectedJobToRate.contratador?.id_contratador;

    if (!id_contratador) {
       Alert.alert("Error", "No se pudo identificar al contratador para calificar.");
       setIsSubmittingRating(false);
       return;
    }

    try {
      const ratingPayload = {
        id_contratador: id_contratador,
        id_trabajador: id_trabajador,
        id_trabajo: id_trabajo,
        calificacion: rating,
        comentario: comment,
      };
      
      await api.post(`${BASE_URL}/calificaciones/calificaciones-contratadores/`, ratingPayload);

      const jobUpdatePayload = {
        id_estado: 5
      };
      await api.patch(`${BASE_URL}/trabajos/${id_trabajo}/`, jobUpdatePayload);

      Alert.alert("Éxito", "Trabajo finalizado y contratador calificado.");
      closeRatingModal();
      loadMyJobs();

    } catch (err) {
      console.error("Error al guardar calificación:", err.response?.data || err);
      Alert.alert("Error", "No se pudo guardar la calificación.");
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Pressable key={star} onPress={() => setRating(star)}>
            <Ionicons
              name={rating >= star ? "star" : "star-outline"}
              size={32}
              color="#f1c40f"
            />
          </Pressable>
        ))}
      </View>
    );
  };


  const renderJob = ({ item }) => {
    const trabajo = item.trabajo;
    if (!trabajo) return null;

    const zona = trabajo.zona_geografica_trabajo;
    const ubicacion = zona ? `${zona.ciudad || ""}${zona.provincia ? ", " + zona.provincia : ""}` : "Sin ubicación";
    
    const isActivo = trabajo.estado?.id_estado === 3;
    const isEsperandoValoracion = trabajo.estado?.id_estado === 4;

    const estadoTexto = trabajo.estado?.descripcion ?? "No definido";

    return (
      <View style={styles.jobCard}>
        <Text style={styles.jobTitle}>{trabajo.titulo || "S/Titulo"}</Text>
        <Text style={styles.jobProf}>{trabajo.profesion_requerida?.nombre_profesion || "S/Profesion"}</Text>

        {isActivo || isEsperandoValoracion ? (
          <Text style={[styles.jobState, styles.acceptedState]}>{isActivo ? "Trabajo Activo" : "Esperando Calificación"}</Text>
        ) : (
          <Text style={styles.jobState}>Estado: {estadoTexto}</Text>
        )}

        <Text numberOfLines={2} style={styles.jobDescription}>{trabajo.descripcion ?? ""}</Text>
        <Text style={styles.jobLocation}>Ubicación: {ubicacion}</Text>

        {(isActivo || isEsperandoValoracion) ? (
          <View style={styles.buttonRow}>
            {isActivo && (
              <TouchableOpacity style={styles.chatButton} onPress={() => handleChatPress(trabajo.id_trabajo)}>
                <Ionicons name="chatbubble-ellipses-outline" size={18} color="#fff" />
                <Text style={styles.buttonText}>Chat</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.finishButton} onPress={() => openRatingModal(trabajo)}>
              <Ionicons name="star-outline" size={18} color="#fff" />
              <Text style={styles.buttonText}>Finalizar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={() => nav.navigate("JobDetail", { job: trabajo })}>
             <Text style={styles.jobDetailText}>Ver detalles del trabajo</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Mis Postulaciones</Text>
      {loading ? (
      <ActivityIndicator color="#009879" size="large" style={{marginTop: 20}}/>
      ) : (
      <FlatList
        data={jobs}
        keyExtractor={(j, idx) => String(j.trabajo?.id_trabajo ?? j.id ?? idx)}
        renderItem={renderJob}
        ListEmptyComponent={<Text style={styles.emptyText}>Aún no te postulaste a ningún trabajo.</Text>}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
      )}

      <Modal
        visible={ratingModalVisible}
        transparent
        animationType="slide"
        onRequestClose={closeRatingModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>Finalizar y Calificar</Text>
              <Text style={styles.modalSubtitle}>
                Vas a finalizar el trabajo: {selectedJobToRate?.titulo}
              </Text>
              <Text style={styles.modalLabel}>Califica al Contratador:</Text>
              {renderStars()}
              <Text style={styles.modalLabel}>Añade un comentario (opcional):</Text>
              <TextInput
                style={styles.commentInput}
                value={comment}
                onChangeText={setComment}
                placeholder="Escribe tu reseña aquí..."
                multiline
              />
              <View style={styles.modalButtonContainer}>
                {isSubmittingRating ? (
                  <ActivityIndicator size="small" color="#0b9d57" />
                ) : (
                  <Button title="Enviar Calificación" onPress={handleRatingSubmit} color="#0b9d57" />
                )}
                <View style={{marginTop: 10}}>
                  <Button title="Cancelar" onPress={closeRatingModal} color="#888" />
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f3fbf7"
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#009879",
    marginBottom: 12,
    textAlign: 'center'
  },
  jobCard: {
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  jobTitle: {
    fontWeight: "700",
    color: "#009879",
    fontSize: 16
  },
  jobProf: {
    fontWeight: "700",
    color: "#005c49ff",
    fontSize: 14
  },
  jobState: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888',
    marginTop: 4,
  },
  acceptedState: { 
     color: '#28a745', 
     fontWeight: 'bold',
  },
  jobDescription: {
    marginTop: 6,
    color: '#333'
  },
  jobLocation: {
    color: "#666",
    marginTop: 10,
    fontSize: 12
  },
  jobDetailText: {
    color: "#007AFF",
    marginTop: 8,
    fontWeight: '600'
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 10,
    alignSelf: 'flex-start'
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666'
  },
  chatButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007AFF",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 10,
  },
  finishButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f1c40f",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  chatText: { color: "#fff", marginLeft: 6, fontWeight: "700" },
  buttonText: { color: "#fff", marginLeft: 5, fontWeight: "700" },
  modalOverlay: { 
    flex: 1, 
    backgroundColor: "rgba(0,0,0,0.5)", 
    justifyContent: "center", 
    alignItems: "center" 
  },
  modalContent: { 
    width: "90%", 
    maxHeight: '80%',
    backgroundColor: "#fff", 
    borderRadius: 12, 
    padding: 20
  },
  modalTitle: { 
    fontSize: 18, 
    fontWeight: "700", 
    color: "#0b9d57", 
    textAlign: 'center' 
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    marginTop: 5,
    marginBottom: 15,
  },
  modalLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginTop: 10,
    marginBottom: 5,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    minHeight: 100,
    textAlignVertical: 'top',
    backgroundColor: '#f9f9f9',
  },
  modalButtonContainer: {
    marginTop: 20,
  }
});


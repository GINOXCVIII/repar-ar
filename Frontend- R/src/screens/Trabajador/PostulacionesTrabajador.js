import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, Button, Alert, Modal, ScrollView, TextInput, Pressable } from "react-native";
import api from "../../api/api";
import { useAuth } from "../../contexts/AuthProvider";
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
      const postulaciones = resp.data || [];
      
      postulaciones.sort((a, b) => new Date(b.fecha_postulacion) - new Date(a.fecha_postulacion));
      
      setJobs(postulaciones);
    } catch (e) {
      console.error("Error cargando mis postulacioness:", e);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleChatPress = (id_chat) => {
    if (!id_chat) {
      Alert.alert("Error", "No se encontró el id del trabajo para abrir el chat.");
      return;
    }
    console.log("id_chat en contratador: ", id_chat);
    nav.navigate("Chat", { chatId: id_chat });
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
    const current_estado = selectedJobToRate.estado?.id_estado;

    if (!id_contratador) {
       Alert.alert("Error", "No se pudo identificar al contratador para calificar.");
       setIsSubmittingRating(false);
       return;
    }
    
    let newEstadoId;
    if (current_estado === 3) {
      newEstadoId = 4;
    } else if (current_estado === 4) {
      newEstadoId = 5;
    } else {
      Alert.alert("Error", "Este trabajo no se puede calificar en este estado.");
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

      // console.log(newEstadoId, "es el nuevo estado que vamos a meter");

      let jobUpdatePayload;

      if (newEstadoId === 5) {
        jobUpdatePayload = {
          id_estado: newEstadoId,
          fecha_fin: new Date().toISOString(),
        }
      } else {
          jobUpdatePayload = {
          id_estado: newEstadoId,
        }
      }

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
    
    const idEstado = trabajo.estado?.id_estado;
    const isActivo = idEstado === 3;
    const isEsperandoValoracion = idEstado === 4;
    const isFinalizado = idEstado === 5;

    const fechaCreacionTrabajo = trabajo.fecha_creacion;
    const fechaInicoTrabajo = trabajo.fecha_inicio;
    const fechaFinalizacionTrabajo = trabajo.fecha_fin;

    let mostrarMensajeFechaInicio;
    let mostrarMensajeFechaFinalizacion;

    const mostrarMensajeFechaCreacion = fechaCreacionTrabajo.slice(8,10) + "/" + fechaCreacionTrabajo.slice(5,7) + "/" + fechaCreacionTrabajo.slice(0,4) + " - " + fechaCreacionTrabajo.slice(11,13) + ":" + fechaCreacionTrabajo.slice(14,16) + ":" + fechaCreacionTrabajo.slice(17,19)
    
    if (!fechaInicoTrabajo) {
      mostrarMensajeFechaInicio = "Trabajo no iniciado"
    } else {
      mostrarMensajeFechaInicio = fechaInicoTrabajo.slice(8,10) + "/" + fechaInicoTrabajo.slice(5,7) + "/" + fechaInicoTrabajo.slice(0,4) + " - " + fechaInicoTrabajo.slice(11,13) + ":" + fechaInicoTrabajo.slice(14,16) + ":" + fechaInicoTrabajo.slice(17,19)
    };

    if (!fechaFinalizacionTrabajo) {
      mostrarMensajeFechaFinalizacion = "Trabajo no finalizado"
    } else {
      mostrarMensajeFechaFinalizacion = fechaFinalizacionTrabajo.slice(8,10) + "/" + fechaFinalizacionTrabajo.slice(5,7) + "/" + fechaFinalizacionTrabajo.slice(0,4) + " - " + fechaFinalizacionTrabajo.slice(11,13) + ":" + fechaFinalizacionTrabajo.slice(14,16) + ":" + fechaFinalizacionTrabajo.slice(17,19)
    };
  
    const estadoTexto = trabajo.estado?.descripcion ?? "No definido";
    let estadoStyle = styles.jobState;
    if (isActivo || isEsperandoValoracion) estadoStyle = [styles.jobState, styles.acceptedState];
    if (isFinalizado) estadoStyle = [styles.jobState, styles.finishedState];

    // const id_chat = trabajo.id_trabajo;
    const concatenacion = String(trabajo.id_trabajo) + String(trabajo.contratador.id_contratador) + String(trabajo.trabajador?.id_trabajador || '');
    const id_chat = parseInt(concatenacion);

    const isAssignedToMe = trabajo.trabajador?.id_trabajador === workerProfile.id_trabajador;

    // console.log("TRABAJO: ", trabajo)

    return (
      <View style={styles.jobCard}>
        <Text style={styles.jobProf}>{trabajo.profesion_requerida?.nombre_profesion || "S/Profesion"}</Text>
        <Text style={styles.jobTitle}>{trabajo.titulo || "S/Titulo"}</Text>
        <Text numberOfLines={2} style={styles.jobDescription}>{trabajo.descripcion ?? ""}</Text>
        <Text style={styles.jobLocation}>Ubicación: {ubicacion}</Text>
        <Text style={styles.estado}>Estado: {estadoTexto}</Text>

        <Text style={styles.fecha}>Fecha de creación: {mostrarMensajeFechaCreacion}</Text>
        <Text style={styles.fecha}>Fecha de inicio: {mostrarMensajeFechaInicio}</Text>
        <Text style={styles.fecha}>Fecha de finalización: {mostrarMensajeFechaFinalizacion}</Text>        

        {isAssignedToMe && (isActivo || isEsperandoValoracion) ? (
          <View style={styles.buttonRow}>
            {isActivo && (
              <TouchableOpacity style={styles.chatButton} onPress={() => handleChatPress(id_chat)}>
                <Ionicons name="chatbubble-ellipses-outline" size={20} color="#fff" />
                <Text style={styles.buttonText}>Chat</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.finishButton} onPress={() => openRatingModal(trabajo)}>
              <Ionicons name="star-outline" size={20} color="#fff" />
              <Text style={styles.buttonText}>Finalizar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          (trabajo.trabajador?.id_trabajador && !isAssignedToMe) ? (
            <Text style={{ color: "red", fontSize: 16, fontWeight: "bold", textAlign: "center", marginTop: 10 }}>NO FUISTE ESCOGIDO PARA EL TRABAJO</Text>
          ) : null
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
    backgroundColor: "#f0fff4"
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0b9d57",
    marginTop: 16,
    marginBottom: 12,
    textAlign: "center",
  },
  jobCard: {
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
  jobTitle: {
    fontWeight: "700",
    color: "#006400",
    fontSize: 18,
    marginBottom: 6,
  },
  jobProf: {
    textAlign: "center",
    fontSize: 20,
    fontWeight: "800",
    color: "#0b9d57",
    marginBottom: 8,
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
  finishedState: {
    color: '#555',
    fontStyle: 'italic',
  },
  jobDescription: {
    fontSize: 16,
    marginBottom: 6,
    color: '#333'
  },
  jobLocation: {
    color: "#333",
    marginBottom: 6,
    fontSize: 16
  },
  jobDetailText: {
    color: "#007AFF",
    marginTop: 8,
    fontWeight: '600'
  },
  /*
  buttonRow: {
    flexDirection: 'center',
    marginTop: 10,
    alignSelf: 'flex-start'
  },
  */
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666'
  },

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

  chatText: { color: "#fff", marginLeft: 6, fontWeight: "700" },
  buttonText: { color: "#fff", marginLeft: 5, fontWeight: "bold", fontSize: 15 },
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
  },

  estado: { fontSize: 16, color: "#333", fontWeight: "600", marginBottom: 10 },

  fecha: { fontSize: 14, color: "#505050ff", marginBottom: 5 },

  buttonRow: { flexDirection: "row", justifyContent: "center", gap: 10 },
});
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
  Pressable
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

  // No se usa. borrar?
  const compararIdContratador = (trabajo, idContratadorEsperado) => {
    if (trabajo == null) return false;
    if (trabajo.id_contratador !== undefined && trabajo.id_contratador !== null) {
      return String(trabajo.id_contratador) === String(idContratadorEsperado);
    }
    if (trabajo.contratador && (trabajo.contratador.id_contratador !== undefined || trabajo.contratador.id !== undefined)) {
      const nested = trabajo.contratador.id_contratador ?? trabajo.contratador.id;
      return String(nested) === String(idContratadorEsperado);
    }
    return false;
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
      
      await api.post('/calificaciones/calificaciones-trabajadores/', ratingPayload);

      const jobUpdatePayload = {
        id_estado: newEstadoId
      };
      await api.patch(`/trabajos/${id_trabajo}/`, jobUpdatePayload);

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

  const renderItem = ({ item }) => {
    // console.log("contenido de item: ", item, item.id_trabajo);
    const titulo = item.titulo ?? "Sin título";
    const profesion = item.profesion_requerida?.nombre_profesion ?? "No especificada";
    const ciudad = item.zona_geografica_trabajo?.ciudad ?? "-";
    const provincia = item.zona_geografica_trabajo?.provincia ?? "-";
    const estado = item.estado?.descripcion ?? "-";
    const idEstado = item.estado?.id_estado ?? null;
    const isActivo = idEstado === 3;
    const idTrabajo = item.id_trabajo

    return (
      <View style={styles.card}>
        <Text style={styles.titulo}>{titulo}</Text>
        <Text style={styles.info}>{profesion}</Text>
        <Text style={styles.ubicacion}>{ciudad}{provincia ? `, ${provincia}` : ""}</Text>
        
        <View style={styles.rowBottom}>
          <Text style={isActivo ? [styles.estado, styles.estadoActivo] : styles.estado}>Estado: {estado}</Text>

          {isActivo ? (
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.chatButton} onPress={() => handleChatPress(item)}>
                 <Ionicons name="chatbubble-ellipses-outline" size={18} color="#fff" />
                 <Text style={styles.buttonText}>Chat</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.finishButton} onPress={() => openRatingModal(item)}>
                 <Ionicons name="star-outline" size={18} color="#fff" />
                 <Text style={styles.buttonText}>Finalizar</Text>
              </TouchableOpacity>
            </View>
          ) : (idEstado === 1 || idEstado === 2) ? (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("PostulacionesContratador", { trabajoId: idTrabajo })
              }
            >
              <Text style={styles.link}>Ver postulantes</Text>
            </TouchableOpacity>
          ) : (
             null
          )}
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
          <Text style={{ textAlign: "center", color: "#666" }}>No tenés trabajos publicados todavía.</Text>
        </View>
      ) : (
        <FlatList
          data={trabajos}
          keyExtractor={(item, idx) => String(item.id_trabajo ?? idx)}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 12 }}
          extraData={trabajos}
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
              <Text style={styles.modalLabel}>Califica al trabajador:</Text>
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
  descripcion: { marginTop: 8, color: "#333", fontSize: 13, marginBottom: 5 },
  row: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  info: { color: "#0b9d57", fontWeight: "600", fontSize: 13 },
  ubicacion: { fontSize: 13, color: "#444", marginTop: 4 },
  rowBottom: { marginTop: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  estado: { color: "#555", fontWeight: "600", fontSize: 13, flex: 1 },
  estadoActivo: { color: '#28a745', fontWeight: 'bold' },
  link: { color: "#007AFF", fontWeight: "700" },
  buttonRow: {
    flexDirection: 'row',
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  finishButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1c40f',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  buttonText: {
    color: '#fff',
    marginLeft: 5,
    fontWeight: 'bold',
    fontSize: 13,
  },
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


import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, Modal, Button, Alert, ScrollView } from "react-native";
import api from "../../api/api";
import { useIsFocused } from "@react-navigation/native";
import { useAuth } from "../../contexts/AuthProvider"; // Importar useAuth

export default function HomeTrabajadorScreen() {
  const { workerProfile } = useAuth(); // Obtener perfil de trabajador
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isPosting, setIsPosting] = useState(false);
  const isFocused = useIsFocused();

  useEffect(() => {
    if (!isFocused) return;
    loadOpenJobs();
  }, [isFocused]);

  const loadOpenJobs = async () => {
    setLoading(true);
    try {
      const resp = await api.get(`/trabajos/?id_estado=1`);
      setJobs(resp.data || []);
    } catch (e) {
      console.error("Error cargando trabajos abiertos:", e);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (job) => {
    setSelectedJob(job);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedJob(null);
  };

  const handlePostulate = async () => {
    if (!workerProfile || !workerProfile.id_trabajador) {
      Alert.alert("Error", "No se encontró tu perfil de trabajador.");
      return;
    }
    if (!selectedJob) return;

    setIsPosting(true);
    try {
      const payload = {
        id_trabajo: selectedJob.id_trabajo,
        id_trabajador: workerProfile.id_trabajador,
        // fecha_postulacion se maneja en el backend generalmente
      };
      await api.post('/postulaciones/', payload);
      Alert.alert("Éxito", "Te has postulado correctamente.");
      closeModal();
      // Opcional: Recargar trabajos o quitar el trabajo postulado de la lista local
      // loadOpenJobs();
    } catch (e) {
      console.error("Error al postularse:", e.response?.data || e);
      Alert.alert("Error", `No se pudo completar la postulación. ${JSON.stringify(e.response?.data) || e.message}`);
    } finally {
      setIsPosting(false);
    }
  };

  const renderJob = ({ item }) => {
    const zona = item.id_zona_geografica_trabajo;
    const profesion = item.id_profesion_requerida;
    const ubicacion = zona
      ? `${zona.ciudad || ""}${zona.provincia ? ", " + zona.provincia : ""}`
      : "Sin ubicación";

    return (
      // Cambiado onPress para abrir el modal
      <TouchableOpacity
        style={styles.jobCard}
        onPress={() => openModal(item)}
      >
        <Text style={styles.jobTitle}>{profesion?.nombre_profesion || "Profesión no especificada"}</Text>
        <Text numberOfLines={2} style={styles.jobDescription}>{item.descripcion}</Text>
        <Text style={styles.jobLocation}>Ubicación: {ubicacion}</Text>
        <Text style={styles.jobDetailText}>Ver detalles y postularse</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Ofertas de Trabajo Disponibles</Text>
      {loading ? (
        <ActivityIndicator color="#009879" size="large" style={{ marginTop: 20 }}/>
      ) : (
        <FlatList
          data={jobs}
          keyExtractor={(j) => String(j.id_trabajo || j.id)}
          renderItem={renderJob}
          ListEmptyComponent={<Text style={styles.emptyText}>No hay trabajos abiertos disponibles.</Text>}
        />
      )}

      {/* --- MODAL --- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalCenteredView}>
          <View style={styles.modalView}>
            {selectedJob && (
              <ScrollView>
                <Text style={styles.modalJobTitle}>{selectedJob.id_profesion_requerida?.nombre_profesion || "Trabajo"}</Text>
                <Text style={styles.modalLabel}>Descripción Completa:</Text>
                <Text style={styles.modalDescription}>{selectedJob.descripcion}</Text>
                <Text style={styles.modalLabel}>Ubicación:</Text>
                <Text style={styles.modalText}>
                  {selectedJob.id_zona_geografica_trabajo
                    ? `${selectedJob.id_zona_geografica_trabajo.calle || ''}, ${selectedJob.id_zona_geografica_trabajo.ciudad || ''}, ${selectedJob.id_zona_geografica_trabajo.provincia || ''}`
                    : "No especificada"}
                </Text>
                <Text style={styles.modalLabel}>Fecha de Publicación:</Text>
                <Text style={styles.modalText}>{new Date(selectedJob.fecha_creacion).toLocaleDateString()}</Text>

                <View style={styles.modalButtonContainer}>
                  {isPosting ? (
                     <ActivityIndicator color="#007AFF" />
                  ) : (
                    <Button title="Postularse" onPress={handlePostulate} disabled={isPosting}/>
                  )}
                  <View style={{marginTop: 10}}>
                     <Button title="Cancelar" onPress={closeModal} color="#FF3B30" disabled={isPosting}/>
                  </View>
                </View>
              </ScrollView>
            )}
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
    fontSize: 16,
    marginBottom: 4,
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
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666'
  },
  // --- Estilos del Modal ---
  modalCenteredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: 'rgba(0,0,0,0.5)', // Fondo semi-transparente
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "stretch", // Para que los botones ocupen ancho
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%', // Ancho del modal
    maxHeight: '80%', // Altura máxima
  },
  modalJobTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#009879'
  },
  modalLabel: {
    fontWeight: 'bold',
    marginTop: 10,
    color: '#555'
  },
  modalDescription: {
    marginBottom: 10,
    textAlign: 'justify',
    color: '#333'
  },
  modalText: {
    marginBottom: 10,
    color: '#333'
  },
  modalButtonContainer: {
    marginTop: 20,
  }
});


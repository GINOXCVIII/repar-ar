import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, Modal, Button, Alert, ScrollView } from "react-native";
import api from "../../api/api";
import { useIsFocused } from "@react-navigation/native";
import { useAuth } from "../../contexts/AuthProvider";

export default function HomeTrabajadorScreen() {
  const { workerProfile, misPostulaciones, fetchMisPostulaciones } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isPosting, setIsPosting] = useState(false);
  const [postulationUpdateFlag, setPostulationUpdateFlag] = useState(false);
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
      };
      await api.post('/postulaciones/', payload);
      Alert.alert("Éxito", "Te has postulado correctamente.");
      closeModal();
      await fetchMisPostulaciones(workerProfile.id_trabajador);
      setPostulationUpdateFlag(prev => !prev);
    } catch (e) {
      console.error("Error al postularse:", e.response?.data || e.message || e);
      const errorMessage = e.response?.data ? JSON.stringify(e.response.data) : (e.message || "Error desconocido");
      Alert.alert("Error al Postularse", `No se pudo completar la postulación.\nDetalle: ${errorMessage}`);
    } finally {
      setIsPosting(false);
    }
  };

  const handleChatPress = (jobId) => {
    console.log("Abrir chat para trabajo ID:", jobId);
  };

  const renderJob = ({ item }) => {
    const zona = item.zona_geografica_trabajo;
    const profesion = item.profesion_requerida;

    let ubicacion = "Sin ubicación";
    if (zona && typeof zona === 'object' && (zona.ciudad || zona.provincia)) {
       const ciudad = zona.ciudad || "";
       const provincia = zona.provincia || "";
       ubicacion = [ciudad, provincia].filter(Boolean).join(", ");
    }

    const isJobAlreadyApplied = misPostulaciones.some(p => p.trabajo?.id_trabajo === item.id_trabajo);

    return (
      <TouchableOpacity
        style={styles.jobCard}
        onPress={() => openModal(item)}
      >
        <Text style={styles.jobTitle}>{item?.titulo || "Título no especificada"}</Text>
        <Text style={styles.jobProf}>{profesion?.nombre_profesion || "Profesión no especificada"}</Text>
        <Text numberOfLines={2} style={styles.jobDescription}>{item.descripcion}</Text>
        <Text style={styles.jobLocation}>Ubicación: {ubicacion}</Text>
        {isJobAlreadyApplied ? (
            <Text style={styles.appliedJobText}>Ya postulado, esperando devolución.</Text>
        ) : (
            <Text style={styles.jobDetailText}>Ver detalles</Text>
        )}
      </TouchableOpacity>
    );
  };

  const yaPostulado = selectedJob && misPostulaciones.some(p => p.trabajo?.id_trabajo === selectedJob.id_trabajo);
  const isAssignedToMe = selectedJob?.estado?.id_estado === 3 && selectedJob?.id_trabajador === workerProfile?.id_trabajador;
  
  const quienContrata = selectedJob?.contratador?.nombre ? 
    `${selectedJob.contratador.nombre} ${selectedJob.contratador.apellido || ''}, DNI ${selectedJob.contratador.dni || ''}`
    : "No especificado";


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
          extraData={{misPostulaciones, postulationUpdateFlag}}
        />
      )}

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
                <Text style={styles.modalJobTitle}>{selectedJob.titulo || "S/Titulo"}</Text>
                <Text style={styles.modalJobProf}>{selectedJob.profesion_requerida?.nombre_profesion || "S/Profesion"}</Text>
                <Text style={styles.modalLabel}>Descripción Completa:</Text>
                <Text style={styles.modalDescription}>{selectedJob.descripcion}</Text>
                <Text style={styles.modalLabel}>Contrata:</Text>
                <Text style={styles.modalDescription}>{quienContrata}</Text>
                <Text style={styles.modalLabel}>Ubicación:</Text>
                <Text style={styles.modalText}>
                  {selectedJob.zona_geografica_trabajo && typeof selectedJob.zona_geografica_trabajo === 'object'
                    ? `${selectedJob.zona_geografica_trabajo.calle || ''}, ${selectedJob.zona_geografica_trabajo.ciudad || ''}, ${selectedJob.zona_geografica_trabajo.provincia || ''}`
                    : "No especificada"}
                </Text>
                <Text style={styles.modalLabel}>Fecha de Publicación:</Text>
                <Text style={styles.modalText}>{new Date(selectedJob.fecha_creacion).toLocaleDateString()}</Text>

                {isAssignedToMe ? (
                  <>
                    <Text style={[styles.jobState, styles.acceptedState, {textAlign: 'center', marginBottom: 10}]}>Trabajo Asignado</Text>
                    <View style={styles.modalButtonContainer}>
                      <Button title="Chat" onPress={() => handleChatPress(selectedJob.id_trabajo)} color="#007AFF"/>
                      <View style={{marginTop: 10}}>
                        <Button title="Cerrar" onPress={closeModal} color="#666"/>
                      </View>
                    </View>
                  </>
                ) : yaPostulado ? (
                  <>
                    <Text style={styles.alreadyAppliedText}>Ya postulado, esperando devolución.</Text>
                    <View style={{marginTop: 10}}>
                        <Button title="Cerrar" onPress={closeModal} color="#666"/>
                    </View>
                  </>
                ) : (
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
                )}
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
  jobProf: {
    fontWeight: "700",
    color: "#005c49ff",
    fontSize: 14
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
  appliedJobText: {
    color: '#555',
    marginTop: 8,
    fontStyle: 'italic',
    fontWeight: '500'
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666'
  },
  modalCenteredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "stretch",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '90%',
    maxHeight: '80%',
  },
  modalJobTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#009879'
  },
    modalJobProf: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: "#005c49ff"
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
  },
  alreadyAppliedText: {
      marginTop: 20,
      textAlign: 'center',
      fontStyle: 'italic',
      color: '#666'
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
});


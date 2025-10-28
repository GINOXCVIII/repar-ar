import React, { useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, Modal, Button, Alert, ScrollView } from "react-native";
import axios from 'axios';
const BASE_URL = "http://127.0.0.1:8000/api";

import { useIsFocused } from "@react-navigation/native";
import { useAuth } from "../../contexts/AuthProvider";
import api from "../../api/api";

export default function HomeTrabajadorScreen({ navigation }) {
  const { workerProfile, misPostulaciones, fetchMisPostulaciones, misProfesiones } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isPosting, setIsPosting] = useState(false);
  const [hasProfessions, setHasProfessions] = useState(true);
  const isFocused = useIsFocused();

  const loadOpenJobs = useCallback(async () => {
    setLoading(true);
    setJobs([]);
    setHasProfessions(true);

    if (!workerProfile?.id_trabajador) {
        console.log("Perfil de trabajador no cargado aún.");
        setLoading(false);
        return;
    }

    const safeMisProfesiones = Array.isArray(misProfesiones) ? misProfesiones : [];
    const profesionIds = safeMisProfesiones.map(tp => tp.id_profesion).filter(id => id != null);

    if (profesionIds.length === 0) {
        console.log("El trabajador no tiene profesiones seleccionadas.");
        setHasProfessions(false);
        setLoading(false);
        return;
    }

    const profesionIdsString = profesionIds.join(',');
    const trabajosPublOEsCo = "1,2";
    // const url = `${BASE_URL}/trabajos/?id_estado=1&profesiones=${profesionIdsString}`;
    const url = `${BASE_URL}/trabajos/?id_estado=${trabajosPublOEsCo}&profesiones=${profesionIdsString}`;
    console.log("Cargando trabajos desde:", url);

    try {
      const resp = await axios.get(url);
      setJobs(resp.data || []);
    } catch (e) {
      console.error("Error cargando trabajos filtrados:", e.response?.data || e.message || e);
      setJobs([]);
      Alert.alert("Error", "No se pudieron cargar las ofertas de trabajo.");
    } finally {
      setLoading(false);
    }
  }, [workerProfile?.id_trabajador, misProfesiones]);

  useEffect(() => {
    if (isFocused) {
      loadOpenJobs();
    }
  }, [isFocused, loadOpenJobs]);

  const openModal = (job) => {
    setSelectedJob(job);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedJob(null);
  };

  const handlePostulate = async () => {
    if (!workerProfile?.id_trabajador) {
      Alert.alert("Error", "Perfil de trabajador no disponible.");
      return;
    }
    if (!selectedJob?.id_trabajo) return;

    setIsPosting(true);
    try {
      const payload = {
        id_trabajo: selectedJob.id_trabajo,
        id_trabajador: workerProfile.id_trabajador,
      };
      console.log("Intentando postular con payload:", payload);

      await axios.post(`${BASE_URL}/postulaciones/`, payload);

      const nuevoEstadoId = 2;
      await axios.patch(`${BASE_URL}/trabajos/${selectedJob.id_trabajo}/`, { id_estado: nuevoEstadoId });

      Alert.alert("Éxito", "Te has postulado correctamente.");

      await fetchMisPostulaciones(workerProfile.id_trabajador);
      closeModal();

    } catch (e) {
      console.error("Error al postularse o actualizar estado:", e.response?.data || e.message || e);
      let errorMessage = "No se pudo completar la postulación.";
      if (e.response?.data) {
          if (typeof e.response.data === 'string' && e.response.data.includes("UNIQUE constraint failed")) {
               errorMessage = "Ya te has postulado para este trabajo.";
          } else if (typeof e.response.data?.error === 'string' && e.response.data.error.includes("already exists")) { // Otra posible respuesta de error único
               errorMessage = "Ya te has postulado para este trabajo.";
          }
           else {
               errorMessage += `\nDetalle: ${JSON.stringify(e.response.data)}`;
          }
      } else if (e.message) {
          errorMessage += `\nDetalle: ${e.message}`;
      }
      Alert.alert("Error al Postularse", errorMessage);
    } finally {
      setIsPosting(false);
    }
  };

  const handleChatPress = (jobId) => {
    console.log("Abrir chat para trabajo ID:", jobId);
    Alert.alert("Chat", "Funcionalidad de chat aún no implementada.");
  };

  const renderJob = ({ item }) => {
    const zona = item.zona_geografica_trabajo;
    const profesion = item.profesion_requerida;

    let ubicacion = "Sin ubicación especificada";
    if (zona && typeof zona === 'object') {
       const partes = [zona.ciudad, zona.provincia].filter(Boolean);
       if (partes.length > 0) {
           ubicacion = partes.join(", ");
       }
    }

    const isJobAlreadyApplied = Array.isArray(misPostulaciones) && misPostulaciones.some(p => p.trabajo?.id_trabajo === item.id_trabajo);

    return (
      <TouchableOpacity
        style={styles.jobCard}
        onPress={() => openModal(item)}
        activeOpacity={0.7}
        // Deshabilitar si ya está postulado para evitar abrir modal innecesariamente? Opcional.
        // disabled={isJobAlreadyApplied}
      >
        <Text style={styles.jobTitle}>{item?.titulo || "Título no disponible"}</Text>
        <Text style={styles.jobProf}>{profesion?.nombre_profesion || "Profesión no disponible"}</Text>
        <Text numberOfLines={2} style={styles.jobDescription}>{item.descripcion || "Sin descripción."}</Text>
        <Text style={styles.jobLocation}>Ubicación: {ubicacion}</Text>
        {isJobAlreadyApplied ? (
            <Text style={styles.appliedJobText}>Ya postulado</Text>
        ) : (
            <Text style={styles.jobDetailText}>Toca para ver detalles y postularte</Text>
        )}
      </TouchableOpacity>
    );
  };

  const getEstadoActualizadoTrabajo = async (id_trabajo) => {
    const response = await api.get(`${BASE_URL}/trabajos/${id_trabajo}/`);
    console.log("getEstadoActualizadoTrabajo")
    const data = response.data;
    console.log("response: ", data)

    const estadoActualizado = data.estado?.id_estado;

    return estadoActualizado;
  }

  const renderModalContent = () => {
    const [estadoActualizado, setEstadoActualizado] = useState("");

    /* traigo de nuevo el estado del trabajo seleccionado
    no es muy elegante pero funciona
    da error 404 porque intenta hacer una consulta al back /api/trabajos/undefined/
    pero eso pasa porque ese id que se consulta en nulo cuando no se pickea un trabajo
    creo que arruina el funcionamiento de toda la app, pero les va a aparecer ese error
    en consola. no se asusten si queda, capaz lo borro de alguna manera
    */ 
    const idTrabajoActual = selectedJob?.id_trabajo;
    useEffect(() => {
      const fetchEstadoActualizado = async () => {
        const estado_actualizado = await getEstadoActualizadoTrabajo(idTrabajoActual);
        setEstadoActualizado(estado_actualizado);
      };
      fetchEstadoActualizado();
    }, [idTrabajoActual]);

    // trae correctamente el estado actualizado
    // console.log("estadoActualizado: ", estadoActualizado)
     
     if (!selectedJob) return null;
     
     const yaPostulado = Array.isArray(misPostulaciones) && misPostulaciones.some(p => p.trabajo?.id_trabajo === selectedJob.id_trabajo);
     const isAssignedToMe = selectedJob?.estado?.id_estado === 3 && selectedJob?.id_trabajador === workerProfile?.id_trabajador;

     let quienContrata = "No especificado";
     if (selectedJob?.contratador) {
          const c = selectedJob.contratador;
          quienContrata = [c.nombre, c.apellido].filter(Boolean).join(" ");
          if (c.dni) quienContrata += `, DNI ${c.dni}`;
     }
     let ubicacionCompleta = "No especificada";
     if (selectedJob?.zona_geografica_trabajo && typeof selectedJob.zona_geografica_trabajo === 'object') {
          const z = selectedJob.zona_geografica_trabajo;
          ubicacionCompleta = [z.calle, z.ciudad, z.provincia].filter(Boolean).join(", ");
     }
     const fechaPublicacion = selectedJob?.fecha_creacion ? new Date(selectedJob.fecha_creacion).toLocaleDateString() : 'N/A';

     return (
          <ScrollView>
                <Text style={styles.modalJobTitle}>{selectedJob.titulo || "S/Titulo"}</Text>
                <Text style={styles.modalJobProf}>{selectedJob.profesion_requerida?.nombre_profesion || "S/Profesion"}</Text>

                <Text style={styles.modalLabel}>Descripción Completa:</Text>
                <Text style={styles.modalDescription}>{selectedJob.descripcion || "No disponible."}</Text>

                <Text style={styles.modalLabel}>Contratador:</Text>
                <Text style={styles.modalText}>{quienContrata}</Text>

                <Text style={styles.modalLabel}>Ubicación Completa:</Text>
                <Text style={styles.modalText}>{ubicacionCompleta}</Text>

                <Text style={styles.modalLabel}>Fecha de Publicación:</Text>
                <Text style={styles.modalText}>{fechaPublicacion}</Text>

                {estadoActualizado === 6 ? (
                  <>
                    <Text style={[styles.jobState, { color: 'red', textAlign: 'center', marginVertical: 15 }]}>EL TRABAJO HA SIDO CANCELADO POR SU CREADOR</Text>
                    <View style={styles.modalButtonContainer}>
                      <Button title="Cerrar" onPress={closeModal} color="#6c757d" />
                    </View>
                  </>
                ) : isAssignedToMe ? (
                  <>
                    <Text style={[styles.jobState, styles.acceptedState, { textAlign: 'center', marginVertical: 15 }]}>
                      ¡Este trabajo te fue asignado!
                    </Text>
                    <View style={styles.modalButtonContainer}>
                      <Button title="Ir al Chat" onPress={() => handleChatPress(selectedJob.id_trabajo)} color="#007AFF" />
                      <View style={{ marginTop: 10 }}>
                        <Button title="Cerrar" onPress={closeModal} color="#6c757d" />
                      </View>
                    </View>
                  </>
                ) : yaPostulado ? (
                  <>
                    <Text style={styles.alreadyAppliedText}>
                      Ya te has postulado. Esperando confirmación del contratador.
                    </Text>
                    <View style={{ marginTop: 15 }}>
                      <Button title="Cerrar" onPress={closeModal} color="#6c757d" />
                    </View>
                  </>
                ) : (
                  <View style={styles.modalButtonContainer}>
                    {isPosting ? (
                      <ActivityIndicator color="#007AFF" size="large" />
                    ) : (
                      <Button title="Confirmar Postulación" onPress={handlePostulate} color="#28a745" />
                    )}
                    <View style={{ marginTop: 10 }}>
                      <Button title="Cancelar" onPress={closeModal} color="#dc3545" disabled={isPosting} />
                    </View>
                  </View>
                )}
          </ScrollView>
     );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Ofertas de Trabajo para ti</Text>

      {loading ? (
        <ActivityIndicator color="#009879" size="large" style={{ marginTop: 50 }}/>
      ) : (
        !hasProfessions ? (
             <View style={styles.centeredMessageContainer}>
                 <Text style={styles.emptyText}>No has seleccionado ninguna profesión en tu perfil.</Text>
                 <Button
                    title="Ir a Mi Perfil para agregar profesiones"
                    onPress={() => navigation.navigate('MiPerfil')}
                    color="#007AFF"
                 />
             </View>
        ) : (
          <FlatList
            data={jobs}
            keyExtractor={(j) => j.id_trabajo.toString()}
            renderItem={renderJob}
            ListEmptyComponent={
                 <View style={styles.centeredMessageContainer}>
                    <Text style={styles.emptyText}>No hay trabajos disponibles que coincidan con tus profesiones.</Text>
                 </View>
            }
            extraData={misPostulaciones} // Asegura re-render si cambia misPostulaciones
            ListFooterComponent={<View style={{ height: 20 }} />}
          />
        )
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalCenteredView}>
          <View style={styles.modalView}>
              {renderModalContent()}
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
    fontSize: 22,
    fontWeight: "bold",
    color: "#007A5E",
    marginBottom: 16,
    textAlign: 'center'
  },
  jobCard: {
    backgroundColor: "#ffffff",
    padding: 18,
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  jobTitle: {
    fontWeight: "bold",
    color: "#005c49",
    fontSize: 17,
    marginBottom: 5,
  },
  jobProf: {
    fontWeight: "600",
    color: "#007A5E",
    fontSize: 15,
    marginBottom: 8,
  },
  jobDescription: {
    color: '#444',
    fontSize: 14,
    lineHeight: 20,
  },
  jobLocation: {
    color: "#666",
    marginTop: 12,
    fontSize: 13,
    fontStyle: 'italic',
  },
  jobDetailText: {
    color: "#007AFF",
    marginTop: 10,
    fontWeight: '600',
    fontSize: 14,
  },
  appliedJobText: {
    color: '#6c757d',
    marginTop: 10,
    fontStyle: 'italic',
    fontWeight: '500',
    fontSize: 14,
  },
  centeredMessageContainer: {
     flex: 1,
     justifyContent: 'center',
     alignItems: 'center',
     paddingHorizontal: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 30,
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
  },
  modalCenteredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalView: {
    width: '90%',
    maxHeight: '85%',
    backgroundColor: "white",
    borderRadius: 15,
    padding: 25,
    paddingTop: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  modalJobTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#007A5E'
  },
  modalJobProf: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
    color: "#005c49"
  },
  modalLabel: {
    fontWeight: 'bold',
    fontSize: 15,
    marginTop: 12,
    color: '#333',
    marginBottom: 3,
  },
  modalDescription: {
    fontSize: 15,
    marginBottom: 10,
    textAlign: 'left',
    color: '#444',
    lineHeight: 22,
  },
  modalText: {
    fontSize: 15,
    marginBottom: 10,
    color: '#444',
  },
  modalButtonContainer: {
    marginTop: 25,
    paddingTop: 15,
    borderTopColor: '#e0e0e0',
    borderTopWidth: 1,
  },
  alreadyAppliedText: {
      marginTop: 20,
      textAlign: 'center',
      fontStyle: 'italic',
      fontSize: 15,
      color: '#555'
  },
  jobState: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 8,
    borderRadius: 6,
    overflow: 'hidden',
  },
  acceptedState: {
      backgroundColor: '#d4edda',
      color: '#155724',
      borderColor: '#c3e6cb',
      borderWidth: 1,
  },
});


import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, Button } from "react-native";
import api from "../api/api";
import { useAuth } from "../contexts/AuthProvider";
import { useIsFocused, useNavigation } from "@react-navigation/native";

const BASE_URL = "http://127.0.0.1:8000/api";

export default function MisPostulacionesScreen() {
  const { workerProfile } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused(); // pantalla activo o no
  const nav = useNavigation();

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
      // const resp = await api.get(`${BASE_URL}/trabajos/?id_trabajador=${workerProfile.id_trabajador}`);
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
    // Lógica futura para abrir el chat
    console.log("Abrir chat para trabajo ID:", jobId);
  };

  const renderJob = ({ item }) => {
    console.log("Contenido del item actual: ", item)
    const trabajo = item.trabajo
    const zona = trabajo.zona_geografica_trabajo;
    const ubicacion = zona
      ? `${zona.ciudad || ""}${zona.provincia ? ", " + zona.provincia : ""}`
      : "Sin ubicación";
    
    // Verificar si trabajo activo (estado ID 3)
    const isActivo = trabajo.estado?.id_estado === 3;

    console.log("trabajo: ", trabajo, "\nzona: ", zona, "\nubicacion: ", ubicacion, "\ņisActivo", isActivo)

    // <Text style={styles.jobTitle}>{item.id_profesion_requerida?.nombre_profesion || "Trabajo"}</Text>

    return (
      <View style={styles.jobCard}>
        <Text style={styles.jobTitle}>{trabajo.titulo || "S/Titulo"}</Text>

        <Text style={styles.jobProf}>{trabajo.profesion_requerida?.nombre_profesion || "S/Profesion"}</Text>
        
        {isActivo ? (
          <Text style={[styles.jobState, styles.acceptedState]}>Trabajo Activo</Text>
        ) : (
          <Text style={styles.jobState}>Estado: {trabajo.estado?.descripcion || "No definido"}</Text>
        )}

        <Text numberOfLines={2} style={styles.jobDescription}>{item.descripcion}</Text>
        <Text style={styles.jobLocation}>Ubicación: {ubicacion}</Text>

        {isActivo ? (
          <View style={styles.buttonContainer}>
            <Button title="Chat" onPress={() => handleChatPress(trabajo.id_trabajo)} color="#007AFF"/>
          </View>
        ) : (
          <TouchableOpacity onPress={() => nav.navigate("JobDetail", { job: item })}>
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
        keyExtractor={(j) => String(j.id_trabajo || j.id)}
        renderItem={renderJob}
        ListEmptyComponent={<Text style={styles.emptyText}>Aún no te postulaste a ningún trabajo.</Text>}
      />
      )}
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
  buttonContainer: { 
      marginTop: 10,
      alignSelf: 'flex-start', 
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666'
  }
});

import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet, Button } from "react-native";
import api from "../api/api";
import { useAuth } from "../contexts/AuthProvider";
import { useIsFocused, useNavigation } from "@react-navigation/native";

export default function MisPostulacionesScreen() {
  const { workerProfile } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused();
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
      const resp = await api.get(`/trabajos/?id_trabajador=${workerProfile.id_trabajador}`);
      setJobs(resp.data || []);
    } catch (e) {
      console.error("Error cargando mis trabajos:", e);
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
    const zona = item.id_zona_geografica_trabajo;
    const ubicacion = zona
      ? `${zona.ciudad || ""}${zona.provincia ? ", " + zona.provincia : ""}`
      : "Sin ubicación";
    
    // Verificar si el trabajo está aceptado (asumiendo estado ID 3)
    const isAccepted = item.estado?.id_estado === 3; 

    return (
      <View style={styles.jobCard}>
        <Text style={styles.jobTitle}>{item.id_profesion_requerida?.nombre_profesion || "Trabajo"}</Text>
        
        {isAccepted ? (
          <Text style={[styles.jobState, styles.acceptedState]}>Trabajo Aceptado</Text>
        ) : (
          <Text style={styles.jobState}>Estado: {item.estado?.descripcion || "No definido"}</Text>
        )}

        <Text numberOfLines={2} style={styles.jobDescription}>{item.descripcion}</Text>
        <Text style={styles.jobLocation}>Ubicación: {ubicacion}</Text>

        {isAccepted ? (
          <View style={styles.buttonContainer}>
            <Button title="Chat" onPress={() => handleChatPress(item.id_trabajo)} color="#007AFF"/>
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
      <Text style={styles.headerTitle}>Mis Trabajos Asignados</Text>
      {loading ? (
      <ActivityIndicator color="#009879" size="large" style={{marginTop: 20}}/>
      ) : (
      <FlatList
        data={jobs}
        keyExtractor={(j) => String(j.id_trabajo || j.id)}
        renderItem={renderJob}
        ListEmptyComponent={<Text style={styles.emptyText}>Aún no tienes trabajos asignados.</Text>}
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

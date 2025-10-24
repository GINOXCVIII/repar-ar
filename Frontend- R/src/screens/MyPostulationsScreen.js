import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
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

  const renderJob = ({ item }) => {
    const zona = item.zona_geografica_trabajo;
    const ubicacion = zona
      ? `${zona.ciudad || ""}${zona.provincia ? ", " + zona.provincia : ""}`
      : "Sin ubicación";

    return (
      <TouchableOpacity 
        style={styles.jobCard} 
      	onPress={() => nav.navigate("JobDetail", { job: item })}
      >
      	<Text style={styles.jobTitle}>{item.titulo || "Sin título"}</Text>
      	<Text style={styles.jobState}>Estado: {item.estado?.descripcion || "No definido"}</Text>
      	<Text numberOfLines={2} style={styles.jobDescription}>{item.descripcion}</Text>
      	<Text style={styles.jobLocation}>Ubicación: {ubicacion}</Text>
      	<Text style={styles.jobDetailText}>Ver detalles del trabajo</Text>
      </TouchableOpacity>
  	);
  };

  return (
  	<View style={styles.container}>
  	  <Text style={styles.headerTitle}>Mis Trabajos Aceptados</Text>
  	  {loading ? (
  	 	<ActivityIndicator color="#009879" />
  	  ) : (
  	 	<FlatList
  	 	  data={jobs}
  	 	  keyExtractor={(j) => String(j.id_trabajo || j.id)}
  	 	  renderItem={renderJob}
  	 	  ListEmptyComponent={<Text style={styles.emptyText}>Aún no has aceptado ningún trabajo.</Text>}
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
  }
});


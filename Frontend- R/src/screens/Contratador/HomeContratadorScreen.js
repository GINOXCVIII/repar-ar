import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import api from "../../api/api";
import { useAuth } from "../../contexts/AuthProvider";
import { useIsFocused, useNavigation } from "@react-navigation/native";

export default function HomeContratadorScreen() {
  const { profile } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused();
  const nav = useNavigation();

  useEffect(() => {
    if (!isFocused) return;
    loadAllJobs();
  }, [isFocused]);

  const loadAllJobs = async () => {
    setLoading(true);
    try {
      const resp = await api.get(`/trabajos/`);
      setJobs(resp.data || []);
    } catch (e) {
      console.error("Error cargando trabajos:", e);
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
      <View style={{
        backgroundColor: "#fff",
        padding: 12,
        marginBottom: 10,
        borderRadius: 10,
        borderLeftWidth: 4,
        borderLeftColor: "#009879"
      }}>
        <Text style={{ fontWeight: "700", color: "#009879" }}>{item.titulo || "Sin título"}</Text>
        <Text numberOfLines={2} style={{ marginTop: 6 }}>{item.descripcion}</Text>
        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>
          <Text style={{ color: "#666" }}>Ubicación: {ubicacion}</Text>
        
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: "#f3fbf7" }}>
      <View style={{
        marginBottom: 12,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <View style={{ 
  flex: 1, 
  alignItems: 'center',
  justifyContent: 'center' // Esto los centra verticalmente también
}}>
  <Text style={{ fontSize: 20, fontWeight: "800", color: "#009879", textAlign: 'center' }}>
    TODAS LAS OFERTAS DE TRABAJO QUE YA FUERON PUBLICADAS
  </Text>
  <Text style={{ fontSize: 20, fontWeight: "800", color: "#d10c5bff", textAlign: 'center' }}>
    PUBLICA TU OFERTA Y CONSEGUÍ EL TRABAJADOR PERFECTO PARA VOS
  </Text>
</View>
        <TouchableOpacity
          onPress={() => nav.navigate("Nuevo Trabajo")}
          style={{ backgroundColor: "#009879", padding: 8, borderRadius: 8 }}
        >
          <Text style={{ color: "#fff" }}>Publicar</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color="#009879" />
      ) : (
        <FlatList
          data={jobs}
          keyExtractor={(j) => String(j.id_trabajo || j.id)}
          renderItem={renderJob}
          ListEmptyComponent={<Text>No hay trabajos disponibles.</Text>}
        />
      )}
    </View>
  );
}

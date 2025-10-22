// src/screens/Contratador/HomeContratadorScreen.js
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
    loadMyJobs();
  }, [isFocused]);

  const loadMyJobs = async () => {
    setLoading(true);
    try {
      const idC = profile?.contratador?.id_contratador;
      const resp = await api.get(`/trabajos/?id_contratador=${idC}`);
      setJobs(resp.data || []);
    } catch (e) {
      console.error("Error cargando mis trabajos:", e);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const renderJob = ({ item }) => (
    <View style={{ backgroundColor: "#fff", padding: 12, marginBottom: 10, borderRadius: 10 }}>
      <Text style={{ fontWeight: "700", color: "#009879" }}>{item.titulo || "Sin título"}</Text>
      <Text numberOfLines={2} style={{ marginTop: 6 }}>{item.descripcion}</Text>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>
        <Text style={{ color: "#666" }}>Zona: {item.zona_geografica_trabajo?.direccion || item.id_zona_geografica_trabajo || "-"}</Text>
        <TouchableOpacity onPress={() => nav.navigate("JobDetail", { job: item })}>
          <Text style={{ color: "#009879" }}>Ver</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: "#f3fbf7" }}>
      <View style={{ marginBottom: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <Text style={{ fontSize: 20, fontWeight: "800", color: "#009879" }}>Mis Ofertas</Text>
        <TouchableOpacity onPress={() => nav.navigate("Nuevo Trabajo")} style={{ backgroundColor: "#009879", padding: 8, borderRadius: 8 }}>
          <Text style={{ color: "#fff" }}>Publicar</Text>
        </TouchableOpacity>
      </View>

      {loading ? <ActivityIndicator /> :
        <FlatList data={jobs} keyExtractor={j => String(j.id_trabajo || j.id)} renderItem={renderJob} ListEmptyComponent={<Text>No hay ofertas publicadas</Text>} />
      }
    </View>
  );
}

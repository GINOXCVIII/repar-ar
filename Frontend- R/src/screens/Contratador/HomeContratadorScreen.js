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

  let mensajeInicio;
  if (profile.id_contratador) {
    mensajeInicio = "No has publicado ningún trabajo"
  } else {
    mensajeInicio = "Aún no completaste tu perfíl de contratador"
  }

  console.log("isFocused = ", isFocused, "\n!profile = ", !profile, "\nprofile.id_contratador = ", profile.id_contratador)

  useEffect(() => {
    if (!isFocused || !profile.id_contratador) {
      if (isFocused && !profile.id_contratador) {
        console.log("Mari y Riko")
        setLoading(false);
      }
      return;
    }
    loadAllJobs();
  }, [isFocused, profile]);

  const loadAllJobs = async () => {
    if (!profile || !profile.id_contratador) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const resp = await api.get(`/trabajos/?id_contratador=${profile.id_contratador}`);
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
  justifyContent: 'center'
}}>
  <Text style={{ fontSize: 20, fontWeight: "800", color: "#009879", textAlign: 'center' }}>
    MIS OFERTAS DE TRABAJO PUBLICADAS
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
          ListEmptyComponent={<Text>{mensajeInicio}</Text>}
        />
      )}
    </View>
  );
}

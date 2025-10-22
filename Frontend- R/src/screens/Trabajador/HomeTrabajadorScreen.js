// src/screens/Trabajador/HomeTrabajadorScreen.js
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import api from "../../api/api";
import { useAuth } from "../../contexts/AuthProvider";
import { useIsFocused, useNavigation } from "@react-navigation/native";

export default function HomeTrabajadorScreen() {
  const { profile } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused();
  const nav = useNavigation();

  useEffect(() => {
    if (!isFocused) return;
    loadJobs();
  }, [isFocused]);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const zona = profile?.trabajador?.id_zona_geografica_trabajador;
      // si profile trae profesiones múltiples, se puede iterar; acá tomo la primera si existe
      const profesion = profile?.trabajador_profesion?.id_profesion || null;
      // Llamada con filtros: ?zona=&profesion=
      const resp = await api.get(`/trabajos/?zona=${zona || ""}&profesion=${profesion || ""}`);
      setJobs(resp.data || []);
    } catch (e) {
      console.error(e);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const render = ({ item }) => (
    <View style={{ backgroundColor:"#fff", padding:12, borderRadius:10, marginBottom:10 }}>
      <Text style={{ fontWeight:"700", color:"#009879" }}>{item.titulo}</Text>
      <Text numberOfLines={2} style={{ marginTop:6 }}>{item.descripcion}</Text>
      <TouchableOpacity style={{ marginTop:8 }} onPress={() => nav.navigate("JobDetail", { job: item })}>
        <Text style={{ color:"#009879" }}>Ver detalles</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={{ flex:1, padding:12, backgroundColor:"#f3fbf7" }}>
      <Text style={{ fontSize:20, fontWeight:"800", color:"#009879", marginBottom:12 }}>Nuevas ofertas</Text>
      {loading ? <ActivityIndicator /> :
        <FlatList data={jobs} keyExtractor={j=>String(j.id_trabajo || j.id)} renderItem={render} ListEmptyComponent={<Text>No hay ofertas</Text>} />
      }
    </View>
  );
}

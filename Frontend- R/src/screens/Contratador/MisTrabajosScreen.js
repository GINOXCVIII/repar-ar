// src/screens/Contratador/MisTrabajosScreen.js
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import api from "../../api/api";
import { useAuth } from "../../contexts/AuthProvider";
import { useIsFocused, useNavigation } from "@react-navigation/native";

export default function MisTrabajosScreen() {
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
      const idC = profile?.contratador?.id_contratador;
      const resp = await api.get(`/trabajos/?id_contratador=${idC}`);
      setJobs(resp.data || []);
    } catch (e) {
      console.error(e);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={{ backgroundColor:"#fff", padding:12, borderRadius:10, marginBottom:10 }}>
      <Text style={{ fontWeight:"700" }}>{item.titulo || "Oferta"}</Text>
      <Text style={{ marginTop:6 }}>{item.descripcion}</Text>
      <View style={{ flexDirection:"row", justifyContent:"space-between", marginTop:10 }}>
        <Text>{item.id_estado ? "Estado: "+item.id_estado : ""}</Text>
        <TouchableOpacity onPress={() => nav.navigate("JobDetail", { job: item })}>
          <Text style={{ color:"#009879" }}>Postulantes</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={{flex:1, padding:12, backgroundColor:"#f3fbf7"}}>
      <Text style={{fontSize:20,fontWeight:"800",color:"#009879", marginBottom:10}}>Historial y gestión</Text>
      {loading ? <ActivityIndicator /> :
        <FlatList data={jobs} keyExtractor={j=>String(j.id_trabajo||j.id)} renderItem={renderItem} ListEmptyComponent={<Text>No hay trabajos</Text>} />
      }
    </View>
  );
}

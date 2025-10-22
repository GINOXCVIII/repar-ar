// src/screens/JobDetailScreen.js
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Alert, FlatList } from "react-native";
import api from "../api/api";
import { useAuth } from "../contexts/AuthProvider";
import { createChatBetween } from "../services/firebase";

export default function JobDetailScreen({ route, navigation }) {
  const { job } = route.params;
  const { roleActive, profile } = useAuth();
  const [postulaciones, setPostulaciones] = useState([]);

  useEffect(() => {
    if (roleActive === "contratador") loadPostulaciones();
  }, []);

  const loadPostulaciones = async () => {
    try {
      const resp = await api.get(`/postulaciones/?id_trabajo=${job.id_trabajo}`);
      setPostulaciones(resp.data);
    } catch (e) { console.error(e); }
  };

  const handlePostular = async () => {
    try {
      await api.post("/postulaciones/", {
        id_trabajo: job.id_trabajo,
        id_trabajador: profile.trabajador.id_trabajador,
        fecha_postulacion: new Date().toISOString()
      });
      Alert.alert("Listo", "Te postulaste correctamente");
      navigation.goBack();
    } catch (e) { Alert.alert("Error","No se pudo postular"); }
  };

  const aceptarPostulante = async (post) => {
    try {
      // 1) actualizar trabajo en backend (asignar id_trabajador + estado)
      await api.patch(`/trabajos/${job.id_trabajo}/`, {
        id_trabajador: post.trabajador.id_trabajador,
        id_estado: 2
      });

      // 2) crear chat en Firestore (chat entre contratador y trabajador)
      const chatId = await createChatBetween({
        trabajoId: job.id_trabajo,
        contratadorId: profile.contratador.id_contratador,
        trabajadorId: post.trabajador.id_trabajador,
        trabajoTitle: job.titulo || job.descripcion
      });

      Alert.alert("Aceptado", "Seleccionaste al trabajador. Se creó el chat.");
      // 3) redirigir a chat (ChatScreen espera chatId y meta)
      navigation.navigate("Chat", { chatId, trabajoTitle: job.titulo || job.descripcion, otherUserId: post.trabajador.id_trabajador });

    } catch (e) {
      console.error(e);
      Alert.alert("Error", "No se pudo aceptar al postulante");
    }
  };

  return (
    <View style={{flex:1, padding:12}}>
      <Text style={{fontWeight:"700", fontSize:18}}>{job.titulo}</Text>
      <Text style={{marginTop:8}}>{job.descripcion}</Text>

      {roleActive === "trabajador" && (
        <TouchableOpacity style={{backgroundColor:"#009879",padding:12,borderRadius:8,marginTop:12}} onPress={handlePostular}>
          <Text style={{color:"#fff"}}>Postularse</Text>
        </TouchableOpacity>
      )}

      {roleActive === "contratador" && (
        <>
          <Text style={{marginTop:12,fontWeight:"700"}}>Postulantes</Text>
          <FlatList data={postulaciones} keyExtractor={p=>String(p.id_postulacion)} renderItem={({item})=>(
            <View style={{padding:12,marginTop:8,backgroundColor:"#fff",borderRadius:8}}>
              <Text>{item.trabajador?.telefono_trabajador || "Usuario: "+item.trabajador?.id_trabajador}</Text>
              <TouchableOpacity style={{marginTop:8}} onPress={()=>aceptarPostulante(item)}>
                <Text style={{color:"#009879"}}>Aceptar</Text>
              </TouchableOpacity>
            </View>
          )} ListEmptyComponent={<Text>No hay postulantes</Text>} />
        </>
      )}
    </View>
  );
}

import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, StyleSheet, Alert } from 'react-native';
import api from '../api/api';
import { useAuth } from '../services/auth';

export default function JobListScreen({ navigation }) {
  const [jobs, setJobs] = useState([]);
  const { role } = useAuth();

  const load = async () => {
    try {
      const res = await api.get('/trabajos/');
      setJobs(res.data || []);
    } catch (e) { console.warn(e); Alert.alert('Error', 'No se pudieron cargar trabajos'); }
  };

  useEffect(() => { load(); }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Nuevas Ofertas</Text>
      <FlatList data={jobs} keyExtractor={j => String(j.id_trabajo)} renderItem={({item}) => (
        <View style={styles.card}>
          <Text style={styles.title}>{item.descripcion}</Text>
          <Text style={styles.meta}>Rubro: {item.profesion_requerida?.nombre || '—'} | Zona: {item.zona_geografica_trabajo?.direccion || '—'}</Text>
          <View style={{alignItems:'flex-end'}}>
            <Button title={role === 'contratador' ? 'Ver postulantes' : 'Postularse'} color="#0b9d57" onPress={() => {
              if (role === 'contratador') Alert.alert('Postulantes', 'Ver postulantes pendiente de implementar');
              else api.post('/postulaciones/', { id_trabajo: item.id_trabajo, id_trabajador: 0, fecha_postulacion: new Date().toISOString() }).then(()=>Alert.alert('Ok','Postulación enviada')).catch(()=>Alert.alert('Error','No se pudo postular'));
            }} />
          </View>
        </View>
      )} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding:16, backgroundColor:'#f6fbf6' },
  h1: { fontSize:20, fontWeight:'700', color:'#0b9d57', marginBottom:8 },
  card: { backgroundColor:'#fff', padding:12, borderRadius:8, marginVertical:8, borderWidth:1, borderColor:'#e6f4ea' },
  title: { fontWeight:'700' },
  meta: { marginTop:6, color:'#666' }
});

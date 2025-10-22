import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity, ScrollView, Alert, StyleSheet } from 'react-native';
import api from '../api/api';

const PROFESIONES = ['Albañil','Carpintero','Cerrajero','Electricista','Gasista','Jardinero','Pintor','Plomero'];

export default function PublishJobScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [profesion, setProfesion] = useState(null);
  const [zonas, setZonas] = useState([]);
  const [zona, setZona] = useState(null);

  useEffect(() => {
    api.get('/zonas-geograficas/').then(res => setZonas(res.data || [])).catch(e=>console.warn(e));
  }, []);

  const submit = async () => {
    if (!title || !descripcion || !profesion || !zona) return Alert.alert('Completar', 'Completá todos los campos');
    try {
      // backend expects id_profesion numeric; attempt to resolve: fetch profesiones and find id by name
      const profRes = await api.get('/profesiones/');
      const found = (profRes.data || []).find(p => p.nombre.toLowerCase() === profesion.toLowerCase());
      const idProf = found ? found.id_profesion : null;
      await api.post('/trabajos/', {
        id_contratador: 0,
        id_trabajador: null,
        id_profesion_requerida: idProf || profesion,
        id_zona_geografica_trabajo: zona,
        id_estado: 1,
        descripcion: title + ' - ' + descripcion
      });
      Alert.alert('Publicado', 'Tu oferta se creó');
      navigation.navigate('Inicio');
    } catch (e) { Alert.alert('Error', 'No se pudo publicar'); }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.h1}>Publicar Trabajo</Text>
      <TextInput placeholder="Título" value={title} onChangeText={setTitle} style={styles.input} />
      <TextInput placeholder="Descripción" value={descripcion} onChangeText={setDescripcion} style={[styles.input,{height:100}]} multiline />
      <Text style={{marginTop:8}}>Profesión requerida</Text>
      {PROFESIONES.sort().map(p => (
        <TouchableOpacity key={p} onPress={() => setProfesion(p)} style={[styles.opt, profesion===p && styles.optSel]}>
          <Text>{p}</Text>
        </TouchableOpacity>
      ))}
      <Text style={{marginTop:8}}>Zona</Text>
      {zonas.map(z => (
        <TouchableOpacity key={z.id_direccion} onPress={() => setZona(z.id_direccion)} style={[styles.opt, zona===z.id_direccion && styles.optSel]}>
          <Text>{z.direccion}</Text>
        </TouchableOpacity>
      ))}
      <Button color="#0b9d57" title="Publicar" onPress={submit} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding:16, backgroundColor:'#f6fbf6' },
  h1: { fontSize:18, fontWeight:'700', color:'#0b9d57', marginBottom:8 },
  input: { borderWidth:1, borderColor:'#e6f4ea', padding:8, marginBottom:8, borderRadius:8, backgroundColor:'#fff' },
  opt: { padding:8, borderWidth:1, borderColor:'#e6f4ea', marginVertical:4, borderRadius:8, backgroundColor:'#fff' },
  optSel: { backgroundColor:'#eaf6ec', borderColor:'#0b9d57' }
});

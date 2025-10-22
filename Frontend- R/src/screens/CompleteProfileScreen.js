import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useAuth } from '../services/auth';
import api from '../api/api';

export default function CompleteProfileScreen({ route, navigation }) {
  const { email } = route.params || {};
  const { saveRole } = useAuth();
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [role, setRole] = useState('trabajador');
  const [cuit, setCuit] = useState('');
  const [telefono, setTelefono] = useState('');
  const [zones, setZones] = useState([]);
  const [zoneSel, setZoneSel] = useState(null);

  useEffect(() => {
    const loadZones = async () => {
      try {
        const res = await api.get('/zonas-geograficas/');
        setZones(res.data || []);
      } catch (e) { console.warn('No se pudieron cargar zonas', e.message); }
    };
    loadZones();
  }, []);

  const submit = async () => {
    if (!nombre) return Alert.alert('Nombre requerido');
    saveRole(role);
    try {
      if (role === 'contratador' || role === 'both') {
        // payload exacto según models.py: email_contratador, telefono_contratador, nombre, apellido, dni (opcional), id_zona_geografica_contratador
        await api.post('/contratadores/', { nombre, apellido, email_contratador: email, telefono_contratador: telefono, dni: '', id_zona_geografica_contratador: zoneSel || 0 });
      }
      if (role === 'trabajador' || role === 'both') {
        // payload exacto según models.py: id_contratador, id_zona_geografica_trabajador, telefono_trabajador, mail_trabajador
        await api.post('/trabajadores/', { id_contratador: 0, id_zona_geografica_trabajador: zoneSel || 0, telefono_trabajador: telefono, mail_trabajador: email });
      }
      if (role === 'trabajador' && cuit) {
        // si se informa CUIT, intentamos crear en una relación adicional (si el backend la espera)
        try { await api.post('/trabajadoresprofesion/', { id_trabajador: 0, id_profesion: 0, matricula: cuit }); } catch(e){}
      }
    } catch (e) {
      console.warn('No se pudo crear recursos en backend', e.response ? e.response.data : e.message);
      Alert.alert('Aviso', 'Perfil guardado localmente. Si el backend rechaza datos, pedile a tus devs que revisen los campos.');
    }
    Alert.alert('Perfil creado', 'Ya podés usar la app');
    navigation.replace('MainTabs');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>Completar perfil</Text>
      <TextInput placeholder="Nombre" value={nombre} onChangeText={setNombre} style={styles.input} />
      <TextInput placeholder="Apellido" value={apellido} onChangeText={setApellido} style={styles.input} />
      <Text style={{marginTop:8}}>Elegí tu rol</Text>
      <View style={{flexDirection:'row', marginVertical:8}}>
        <TouchableOpacity onPress={() => setRole('contratador')} style={[styles.roleBtn, role==='contratador' && styles.roleSel]}>
          <Text>Contratador</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setRole('trabajador')} style={[styles.roleBtn, role==='trabajador' && styles.roleSel]}>
          <Text>Trabajador</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setRole('both')} style={[styles.roleBtn, role==='both' && styles.roleSel]}>
          <Text>Ambos</Text>
        </TouchableOpacity>
      </View>
      {(role === 'trabajador' || role === 'both') && (
        <TextInput placeholder="CUIT (solo si sos trabajador)" value={cuit} onChangeText={setCuit} style={styles.input} />
      )}
      <TextInput placeholder="Teléfono" value={telefono} onChangeText={setTelefono} style={styles.input} />
      <Text style={{marginTop:8}}>Zona geográfica</Text>
      {zones.map(z => (
        <TouchableOpacity key={z.id_direccion} onPress={() => setZoneSel(z.id_direccion)} style={[styles.zoneBtn, zoneSel===z.id_direccion && styles.zoneSel]}>
          <Text>{z.direccion}</Text>
        </TouchableOpacity>
      ))}
      <View style={{height:10}} />
      <Button color="#0b9d57" title="Guardar y continuar" onPress={submit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding:16, backgroundColor:'#f6fbf6' },
  h1: { fontSize:20, fontWeight:'700', color:'#0b9d57' },
  input: { borderWidth:1, borderColor:'#e6f4ea', padding:8, marginTop:8, borderRadius:8, backgroundColor:'#fff' },
  roleBtn: { padding:8, borderWidth:1, borderColor:'#ddd', marginRight:8, borderRadius:8, backgroundColor:'#fff' },
  roleSel: { backgroundColor:'#eaf6ec', borderColor:'#0b9d57' },
  zoneBtn: { padding:8, borderWidth:1, borderColor:'#eee', marginTop:6, borderRadius:8, backgroundColor:'#fff' },
  zoneSel: { borderColor:'#0b9d57', backgroundColor:'#eaf6ec' }
});

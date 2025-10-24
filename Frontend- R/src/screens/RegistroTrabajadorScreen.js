import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  Button, 
  Alert, 
  ScrollView, 
  ActivityIndicator 
} from 'react-native';
import axios from 'axios';
import { useAuth } from '../contexts/AuthProvider';

const BASE_URL = "http://127.0.0.1:8000/api";

const RegistroTrabajadorScreen = ({ navigation }) => {
  const { profile, convertToWorker } = useAuth(); 
  
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    telefono_trabajador: profile?.telefono_contratador || '',
    mail_trabajador: profile?.email_contratador || '',
    calle: profile?.zona_geografica_contratador?.calle || '',
    ciudad: profile?.zona_geografica_contratador?.ciudad || '',
    provincia: profile?.zona_geografica_contratador?.provincia || '',
  });

  const handleChange = (name, value) => {
    setForm(prevForm => ({ ...prevForm, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!profile || !profile.id_contratador) {
      Alert.alert("Error", "No se pudo cargar tu perfil de contratador. Por favor, reintenta.");
      return;
    }

    if (!form.telefono_trabajador || !form.mail_trabajador || !form.ciudad) {
      Alert.alert("Error", "Por favor, completa al menos teléfono, mail y ciudad.");
      return;
    }

    setLoading(true);
    try {
      const zonaPayload = {
        calle: form.calle,
        ciudad: form.ciudad,
        provincia: form.provincia,
      };
      const zonaRes = await axios.post(`${BASE_URL}/zonas-geograficas/`, zonaPayload);
      const zonaId = zonaRes.data.id_zona_geografica;

      if (!zonaId) {
        throw new Error("No se pudo obtener el ID de la nueva zona geográfica.");
      }

      const trabajadorPayload = {
        id_contratador: profile.id_contratador,
        id_zona_geografica_trabajador: zonaId,
        telefono_trabajador: form.telefono_trabajador,
        mail_trabajador: form.mail_trabajador,
      };

      await axios.post(`${BASE_URL}/trabajadores/`, trabajadorPayload);

      if (convertToWorker) {
        await convertToWorker();
      }

      Alert.alert(
        "¡Registro Exitoso!",
        "Ahora también sos un trabajador. Serás redirigido."
      );

      navigation.navigate("TrabajadorTabs", { screen: "Inicio" });

    } catch (err) {
      console.error("Error al registrar trabajador:", err.response?.data || err.message);
      Alert.alert("Error", "No se pudo completar el registro. " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Registrarme como Trabajador</Text>
      <Text style={styles.subtitle}>
        Tus datos de contratador se usarán para vincular las cuentas.
        Por favor, completá la información de contacto y tu zona de trabajo.
      </Text>

      <Text style={styles.label}>Email de Trabajador</Text>
      <TextInput
        style={styles.input}
        value={form.mail_trabajador}
        onChangeText={(v) => handleChange('mail_trabajador', v)}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Text style={styles.label}>Teléfono de Trabajador</Text>
      <TextInput
        style={styles.input}
        value={String(form.telefono_trabajador)}
        onChangeText={(v) => handleChange('telefono_trabajador', v)}
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>Calle (Tu zona de trabajo)</Text>
      <TextInput
        style={styles.input}
        value={form.calle}
        onChangeText={(v) => handleChange('calle', v)}
      />

      <Text style={styles.label}>Ciudad (Tu zona de trabajo)</Text>
      <TextInput
        style={styles.input}
        value={form.ciudad}
        onChangeText={(v) => handleChange('ciudad', v)}
      />

      <Text style={styles.label}>Provincia (Tu zona de trabajo)</Text>
      <TextInput
        style={styles.input}
        value={form.provincia}
        onChangeText={(v) => handleChange('provincia', v)}
      />

      <View style={styles.buttonContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#006400" />
        ) : (
          <Button
            title="Confirmar Registro como Trabajador"
            onPress={handleSubmit}
            color="#006400"
          />
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#006400',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#555',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  buttonContainer: {
    marginTop: 30,
    marginBottom: 50,
  }
});

export default RegistroTrabajadorScreen;


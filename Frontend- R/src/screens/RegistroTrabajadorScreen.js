import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Button,
  ScrollView,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
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

  const [modalVisible, setModalVisible] = useState(false);

  const handleChange = (name, value) => {
    setForm(prevForm => ({ ...prevForm, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!profile || !profile.id_contratador) {
      alert("No se pudo cargar tu perfil de contratador. Por favor, reintenta.");
      return;
    }

    if (!form.telefono_trabajador || !form.mail_trabajador || !form.ciudad) {
      alert("Por favor, completá al menos teléfono, mail y ciudad.");
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

      if (!zonaId) throw new Error("No se pudo obtener el ID de la nueva zona geográfica.");

      const trabajadorPayload = {
        id_contratador: profile.id_contratador,
        id_zona_geografica_trabajador: zonaId,
        telefono_trabajador: form.telefono_trabajador,
        mail_trabajador: form.mail_trabajador,
      };

      await axios.post(`${BASE_URL}/trabajadores/`, trabajadorPayload);

      if (convertToWorker) await convertToWorker();

      // Mostrar modal elegante
      setModalVisible(true);

    } catch (err) {
      console.error("Error al registrar trabajador:", err.response?.data || err.message);
      alert("Error al registrar trabajador: " + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleAceptar = () => {
    setModalVisible(false);
    // Hacer refresh completo de la app
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Registrarme como Trabajador</Text>
      <Text style={styles.subtitle}>
        Tus datos de contratador se usarán para vincular las cuentas.{"\n"}
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

      {/* MODAL MODERNO */}
      <Modal
        transparent
        animationType="fade"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>✅ TRABAJADOR CARGADO CON ÉXITO</Text>
            <Text style={styles.modalText}>
              Tu perfil fue creado correctamente.{"\n"}Serás redirigido.
            </Text>
            <TouchableOpacity style={styles.modalButton} onPress={handleAceptar}>
              <Text style={styles.modalButtonText}>ACEPTAR</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#006400',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#006400',
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RegistroTrabajadorScreen;

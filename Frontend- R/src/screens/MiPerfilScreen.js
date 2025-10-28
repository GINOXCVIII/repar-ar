import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
  TouchableOpacity,
  Platform, 
} from "react-native";
import axios from "axios";
import { useAuth } from "../contexts/AuthProvider";

const BASE_URL = "http://127.0.0.1:8000/api";

const MiPerfilScreen = ({ navigation }) => {
  const {
    firebaseUser,
    profile,
    setProfile,
    signOutUser,
    roleActive,
    workerProfile,
    toggleRole,
    misProfesiones, 
    fetchMisProfesiones, 
  } = useAuth();

  const [form, setForm] = useState({
    nombre: "",
    apellido: "",
    email_contratador: "",
    telefono_contratador: "",
    dni: "",
    calle: "",
    ciudad: "",
    provincia: "",
  });
  const [saving, setSaving] = useState(false);

  const [formTrabajador, setFormTrabajador] = useState({
    mail_trabajador: "",
    telefono_trabajador: "",
    calle: "",
    ciudad: "",
    provincia: "",
  });
  const [savingTrabajador, setSavingTrabajador] = useState(false);

  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [todasProfesiones, setTodasProfesiones] = useState([]);
  const [selectedProfesiones, setSelectedProfesiones] = useState(new Map());
  const [loadingModal, setLoadingModal] = useState(false);
  const [savingModal, setSavingModal] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        nombre: profile.nombre ?? "",
        apellido: profile.apellido ?? "",
        email_contratador: profile.email_contratador ?? firebaseUser?.email ?? "",
        telefono_contratador: profile.telefono_contratador?.toString() ?? "",
        dni: profile.dni?.toString() ?? "",
        calle: profile.zona_geografica_contratador?.calle ?? "",
        ciudad: profile.zona_geografica_contratador?.ciudad ?? "",
        provincia: profile.zona_geografica_contratador?.provincia ?? "",
      });
    }
  }, [profile, firebaseUser]);

  useEffect(() => {
    if (workerProfile) {
      setFormTrabajador({
        mail_trabajador: workerProfile.mail_trabajador ?? "",
        telefono_trabajador: workerProfile.telefono_trabajador?.toString() ?? "",
        calle: workerProfile.zona_geografica_trabajador?.calle ?? "",
        ciudad: workerProfile.zona_geografica_trabajador?.ciudad ?? "",
        provincia: workerProfile.zona_geografica_trabajador?.provincia ?? "",
      });
    }
  }, [workerProfile]);

  const handleChange = (field, value) => setForm((prevForm) => ({ ...prevForm, [field]: value }));

  const handleChangeTrabajador = (field, value) => setFormTrabajador((prevForm) => ({ ...prevForm, [field]: value }));

  const saveProfile = async () => {
    setSaving(true);
    try {
      const payloadZona = {
        calle: form.calle,
        ciudad: form.ciudad,
        provincia: form.provincia,
      };

      if (profile?.id_contratador) {
        const payloadContratador = {
          nombre: form.nombre,
          apellido: form.apellido,
          email_contratador: form.email_contratador,
          telefono_contratador: form.telefono_contratador,
          dni: form.dni,
        };
        if (profile.zona_geografica_contratador?.id_zona_geografica) {
          try {
            await axios.patch(`${BASE_URL}/zonas-geograficas/${profile.zona_geografica_contratador.id_zona_geografica}/`, payloadZona);
          } catch (e) {
            console.warn("No se pudo patch zona:", e.response?.data || e);
          }
          const res = await axios.patch(`${BASE_URL}/contratadores/${profile.id_contratador}/`, payloadContratador);
          const p = { ...profile, ...res.data };
          setProfile(p);
          setSuccessModalVisible(true);
        } else {
          const zonaRes = await axios.post(`${BASE_URL}/zonas-geograficas/`, payloadZona);
          const zonaId = zonaRes.data.id_zona_geografica ?? zonaRes.data.id ?? zonaRes.data;
          const res = await axios.patch(`${BASE_URL}/contratadores/${profile.id_contratador}/`, {
            ...payloadContratador,
            id_zona_geografica_contratador: zonaId,
          });
          const p = normalizeAndMergeProfile(profile, res.data, zonaRes.data);
          setProfile(p);
          setSuccessModalVisible(true);
        }
      } else {
        const zonaRes = await axios.post(`${BASE_URL}/zonas-geograficas/`, payloadZona);
        const zonaId = zonaRes.data.id_zona_geografica ?? zonaRes.data.id ?? zonaRes.data;
        const payloadContratador = {
          nombre: form.nombre,
          apellido: form.apellido,
          email_contratador: form.email_contratador,
          telefono_contratador: form.telefono_contratador,
          dni: form.dni,
          id_zona_geografica_contratador: zonaId,
          uid_firebase: firebaseUser?.uid ?? null,
        };
        console.log("Nuevo contratador: ", payloadContratador);
        const res = await axios.post(`${BASE_URL}/contratadores/`, payloadContratador);
        const created = {
          raw: res.data,
          id_contratador: res.data.id_contratador ?? res.data.id ?? null,
          nombre: res.data.nombre ?? "",
          apellido: res.data.apellido ?? "",
          email_contratador: res.data.email_contratador ?? "",
          telefono_contratador: res.data.telefono_contratador ?? "",
          dni: res.data.dni ?? "",
          id_zona_geografica_contratador: zonaId,
          zona_geografica_contratador: zonaRes.data,
        };
        setProfile(created);
        setSuccessModalVisible(true);
      }
    } catch (err) {
      console.error("Error guardando perfil:", err.response?.data || err);
      setErrorMessage(JSON.stringify(err.response?.data ?? err.message ?? err));
      setErrorModalVisible(true);
    } finally {
      setSaving(false);
    }
  };

  const saveTrabajadorProfile = async () => {
    if (!workerProfile?.id_trabajador) {
      setErrorMessage("No se encontró el ID del trabajador.");
      setErrorModalVisible(true);
      return;
    }

    setSavingTrabajador(true);
    try {
      const payloadZona = {
        calle: formTrabajador.calle,
        ciudad: formTrabajador.ciudad,
        provincia: formTrabajador.provincia,
      };

      let zonaId = workerProfile.zona_geografica_trabajador?.id_zona_geografica;

      if (zonaId) {
        // actualiza zona existente
        await axios.patch(`${BASE_URL}/zonas-geograficas/${zonaId}/`, payloadZona);
      } else {
        // Crear nueva zona si no existe
        const zonaRes = await axios.post(`${BASE_URL}/zonas-geograficas/`, payloadZona);
        zonaId = zonaRes.data.id_zona_geografica ?? zonaRes.data.id ?? zonaRes.data;
      }

      const payloadTrabajador = {
        mail_trabajador: formTrabajador.mail_trabajador,
        telefono_trabajador: formTrabajador.telefono_trabajador,
        id_zona_geografica_trabajador: zonaId,
      };

      await axios.patch(`${BASE_URL}/trabajadores/${workerProfile.id_trabajador}/`, payloadTrabajador);
      setSuccessModalVisible(true); 
    } catch (err) {
      console.error("Error guardando perfil trabajador:", err.response?.data || err);
      setErrorMessage("No se pudieron guardar los cambios.");
      setErrorModalVisible(true); 
    } finally {
      setSavingTrabajador(false);
    }
  };

  const normalizeAndMergeProfile = (oldProfile, contratadorData, zonaData) => {
     const baseProfile = oldProfile || {};
     const baseZona = baseProfile.zona_geografica_contratador || {};
     const newZona = zonaData || baseZona;

     const contratadorId = contratadorData?.id_contratador ?? contratadorData?.id ?? baseProfile.id_contratador;
     const zonaId = contratadorData?.id_zona_geografica_contratador
                    ?? newZona?.id_zona_geografica
                    ?? newZona?.id
                    ?? baseZona?.id_zona_geografica
                    ?? null;

     return {
       raw: contratadorData || baseProfile.raw,
       id: contratadorId,
       id_contratador: contratadorId,
       nombre: contratadorData?.nombre ?? baseProfile.nombre ?? "",
       apellido: contratadorData?.apellido ?? baseProfile.apellido ?? "",
       email_contratador: contratadorData?.email_contratador ?? baseProfile.email_contratador ?? "",
       telefono_contratador: contratadorData?.telefono_contratador?.toString() ?? baseProfile.telefono_contratador ?? "", // Asegurar string
       dni: contratadorData?.dni?.toString() ?? baseProfile.dni ?? "",
       id_zona_geografica_contratador: zonaId,
       zona_geografica_contratador: newZona,
     };
  };

  const openProfesionModal = async () => {
    if (!workerProfile?.id_trabajador) {
        Alert.alert("Perfil no listo", "Tu perfil de trabajador aún no está completamente cargado.");
        return;
    }
    setLoadingModal(true);
    setModalVisible(true);
    try {
      const resProfesiones = await axios.get(`${BASE_URL}/profesiones/`);
      setTodasProfesiones(resProfesiones.data || []);

      // Crear mapa inicial basado en 'misProfesiones' del contexto (asegurando que es array)
      const initialMap = new Map();
      const currentProfesiones = Array.isArray(misProfesiones) ? misProfesiones : [];
      currentProfesiones.forEach((tp) => {
        if (tp.id_profesion) { 
            initialMap.set(tp.id_profesion, true);
        }
      });
      setSelectedProfesiones(initialMap);

    } catch (err) {
      console.error("Error al abrir/cargar modal de profesiones:", err.response?.data || err.message || err);
      Alert.alert("Error", "No se pudo cargar la lista de profesiones.");
      setModalVisible(false);
    } finally {
      setLoadingModal(false);
    }
  };

  const handleToggleProfesion = (idProfesion) => {
    setSelectedProfesiones((prevMap) => {
      const newMap = new Map(prevMap);
      newMap.set(idProfesion, !newMap.get(idProfesion));
      return newMap;
    });
  };

  const handleSaveProfesiones = async () => {
    setSavingModal(true); 
    const workerId = workerProfile?.id_trabajador;
    if (!workerId) {
        Alert.alert("Error", "ID de trabajador no encontrado.");
        setSavingModal(false);
        return;
    }

    const currentProfesiones = Array.isArray(misProfesiones) ? misProfesiones : [];
    const tasks = [];

    selectedProfesiones.forEach((isSelected, idProfesion) => {
      const alreadyHas = currentProfesiones.some(tp => tp.id_profesion === idProfesion);
      if (isSelected && !alreadyHas) {
        tasks.push(
          axios.post(`${BASE_URL}/profesiones-de-trabajadores/`, {
            id_trabajador: workerId,
            id_profesion: idProfesion,
          }).catch(err => {
            if (err.response?.status === 500 && err.response?.data?.includes && err.response.data.includes("IntegrityError") && err.response.data.includes("Duplicate entry")) {
              console.warn(`Ignorando error de duplicado al añadir profesión ${idProfesion}.`);
              return Promise.resolve({ ignoredDuplicate: true });
            }
            console.error(`Error adding profesion ${idProfesion}:`, err.response?.data || err);
            return Promise.reject(err);
          })
        );
      }
    });

    currentProfesiones.forEach((tp) => {
      if (tp.id_profesion && !selectedProfesiones.get(tp.id_profesion)) {
        tasks.push(
          axios.delete(`${BASE_URL}/profesiones-de-trabajadores/${tp.id_trabajador_profesion}/`)
             .catch(err => {
                 console.error(`Error deleting profesion relation ${tp.id_trabajador_profesion}:`, err.response?.data || err);
                 return Promise.reject(err);
              })
        );
      }
    });

    if (tasks.length === 0) {
        Alert.alert("Información", "No hay cambios para guardar.");
        setModalVisible(false);
        setSavingModal(false);
        return;
    }

    try {
      await Promise.all(tasks);
      Alert.alert("Éxito", "Profesiones actualizadas.");
      await fetchMisProfesiones(workerId);
      setModalVisible(false);

    } catch (err) {
      console.error("Error al guardar/eliminar una o más profesiones:", err);
      Alert.alert("Error", "Algunos cambios no se pudieron guardar. Por favor, revisa e intenta de nuevo.");
      try { await fetchMisProfesiones(workerId); } catch (e) {}

    } finally {
      setSavingModal(false);
    }
  };

  const renderContratadorProfile = () => (
    <>
      {/* Campos del Contratador */}
      <Text style={styles.label}>Nombre</Text>
      <TextInput style={styles.input} value={form.nombre} onChangeText={(v) => handleChange("nombre", v)} />

      <Text style={styles.label}>Apellido</Text>
      <TextInput style={styles.input} value={form.apellido} onChangeText={(v) => handleChange("apellido", v)} />

      <Text style={styles.label}>Email de contacto</Text>
      <TextInput style={styles.input} value={form.email_contratador} onChangeText={(v) => handleChange("email_contratador", v)} keyboardType="email-address" autoCapitalize="none" />

      <Text style={styles.label}>Teléfono</Text>
      <TextInput style={styles.input} value={form.telefono_contratador} onChangeText={(v) => handleChange("telefono_contratador", v)} keyboardType="phone-pad" />

      <Text style={styles.label}>DNI</Text>
      <TextInput style={styles.input} value={form.dni} onChangeText={(v) => handleChange("dni", v)} keyboardType="numeric" />

      {/* Campos de Dirección */}
      <Text style={[styles.subtitle, { marginTop: 12 }]}>Dirección (zona geográfica)</Text>
      <Text style={styles.label}>Calle</Text>
      <TextInput style={styles.input} value={form.calle} onChangeText={(v) => handleChange("calle", v)} />

      <Text style={styles.label}>Ciudad</Text>
      <TextInput style={styles.input} value={form.ciudad} onChangeText={(v) => handleChange("ciudad", v)} />

      <Text style={styles.label}>Provincia</Text>
      <TextInput style={styles.input} value={form.provincia} onChangeText={(v) => handleChange("provincia", v)} />

      {/* Botón Guardar */}
      <View style={{ marginTop: 20 }}> {/* Más espacio */}
        {saving ? <ActivityIndicator color="#228B22" /> : <Button title="Guardar Perfil Contratador" color="#228B22" onPress={saveProfile} />}
      </View>
    </>
  );

  // Componente para renderizar la vista de perfil Trabajador
  const renderTrabajadorProfile = () => {
       const safeMisProfesiones = Array.isArray(misProfesiones) ? misProfesiones : [];

       return (
            <View>
                <Text style={styles.subtitle}>Detalles de Trabajador</Text>
                {/* Nombre y apellidos tomados del perfil de contratador, no son editables aca */}
                <Text style={styles.label}>Nombre</Text>
                <TextInput style={styles.inputDisabled} value={form.nombre} onChangeText={(v) => handleChange("nombre", v)} editable={false}/>

                <Text style={styles.label}>Apellido</Text>
                <TextInput style={styles.inputDisabled} value={form.apellido} onChangeText={(v) => handleChange("apellido", v)} editable={false}/>

                <Text style={styles.label}>Email (Trabajador)</Text>
                <TextInput style={styles.input} value={formTrabajador.mail_trabajador} onChangeText={(v) => handleChangeTrabajador("mail_trabajador", v)} />

                <Text style={styles.label}>Teléfono (Trabajador)</Text>
                <TextInput style={styles.input} value={formTrabajador.telefono_trabajador} onChangeText={(v) => handleChangeTrabajador("telefono_trabajador", v)} />

                <Text style={styles.subtitle}>Dirección (Trabajador)</Text>
                <Text style={styles.label}>Calle</Text>
                <TextInput style={styles.input} value={formTrabajador.calle} onChangeText={(v) => handleChangeTrabajador("calle", v)} />
                <Text style={styles.label}>Ciudad</Text>
                <TextInput style={styles.input} value={formTrabajador.ciudad} onChangeText={(v) => handleChangeTrabajador("ciudad", v)} />
                <Text style={styles.label}>Provincia</Text>
                <TextInput style={styles.input} value={formTrabajador.provincia} onChangeText={(v) => handleChangeTrabajador("provincia", v)} />

                {/* Botón GUARDAR CAMBIOS */}
                <View style={{ marginTop: 20 }}>
                  {savingTrabajador ? <ActivityIndicator color="#228B22" /> : <Button title="GUARDAR CAMBIOS" color="#228B22" onPress={saveTrabajadorProfile} />}
                </View>

                {/* Sección de Profesiones */}
                <Text style={styles.subtitle}>Mis Profesiones</Text>
                {safeMisProfesiones.length > 0 ? (
                    <View style={styles.profesionContainer}>
                    {safeMisProfesiones.map(tp => (
                        tp?.profesion ? (
                        <View key={tp.id_trabajador_profesion} style={styles.profesionTag}>
                            <Text style={styles.profesionText}>{tp.profesion.nombre_profesion}</Text>
                        </View>
                        ) : null
                    ))}
                    </View>
                ) : (
                    <Text style={styles.infoText}>Aún no has agregado profesiones a tu perfil.</Text>
                )}
                <View style={{marginTop: 15}}>
                    <Button title="Editar Mis Profesiones" onPress={openProfesionModal} color="#007AFF" />
                </View>
            </View>
       );
  };

  return (
    <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContentContainer}
        keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Mi Perfil</Text>

      <Text style={styles.roleIndicator}>
        Perfil Activo: {roleActive === "contratador" ? "Contratador" : "Trabajador"}
      </Text>

      {/* Muestra Contratador si el rol es 'contratador' y el perfil está cargado */}
      {roleActive === "contratador" && profile ? renderContratadorProfile() : null}
      {/* Muestra Trabajador si el rol es 'trabajador' y el workerProfile está cargado */}
      {roleActive === "trabajador" && workerProfile ? renderTrabajadorProfile() : null}

      { (roleActive === 'contratador' && !profile) || (roleActive === 'trabajador' && !workerProfile) ? (
            <ActivityIndicator style={{marginTop: 30}} size="large" color="#006400" />
      ) : null}

      {/* Botón para cambiar de rol (solo si existe perfil de trabajador) */}
      {workerProfile?.id_trabajador ? (
        <View style={{ marginTop: 20 }}>
          <Button
            title={roleActive === "contratador" ? "Cambiar a Perfil Trabajador" : "Cambiar a Perfil Contratador"}
            color="#007AFF"
            onPress={toggleRole}
          />
        </View>
      ) : (
        profile?.id_contratador && !workerProfile && (
            <View style={{ marginTop: 20 }}>
            <Button
                title="Registrarme como Trabajador"
                color="#006400"
                onPress={() => navigation.navigate("RegistroTrabajador")}
            />
            </View>
        )
      )}

      {/* Botón de Cerrar Sesión (siempre visible si está logueado en Firebase) */}
      {firebaseUser && (
        <View style={{ marginTop: 15, marginBottom: 40 }}>
            <Button
            title="Cerrar sesión"
            color="#DC3545"
            onPress={async () => {
                try {
                await signOutUser();
                navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
                } catch (error) {
                console.error("Error al cerrar sesión:", error);
                Alert.alert("Error", "No se pudo cerrar la sesión.");
                }
            }}
            />
        </View>
      )}


      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => {
             if (!savingModal) {
                  setModalVisible(false);
             }
        }}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Selecciona tus Profesiones</Text>

          {loadingModal ? (
            <ActivityIndicator size="large" color="#006400" />
          ) : (
            <FlatList
              data={todasProfesiones}
              keyExtractor={(item) => item.id_profesion.toString()}
              renderItem={({ item }) => {
                const isSelected = !!selectedProfesiones.get(item.id_profesion);
                return (
                  <TouchableOpacity
                    style={[
                        styles.modalItem,
                        isSelected && styles.modalItemSelected 
                    ]}
                    onPress={() => handleToggleProfesion(item.id_profesion)}
                    activeOpacity={0.7}
                    disabled={savingModal}
                  >
                    <Text style={[
                        styles.modalItemText,
                        isSelected && styles.modalItemTextSelected
                    ]}>
                      {item.nombre_profesion}
                    </Text>
                  </TouchableOpacity>
                );
              }}
              ListFooterComponent={<View style={{ height: 20 }} />}
              showsVerticalScrollIndicator={false} 
            />
          )}

          {/* Botones fijos al final del Modal */}
          <View style={styles.modalButtons}>
            {savingModal ? (
              <ActivityIndicator size="large" color="#228B22"/>
            ) : (
              <Button title="Guardar Cambios" onPress={handleSaveProfesiones} color="#228B22" />
            )}
            <View style={{marginTop: 10}}>
              <Button title="Cancelar" onPress={() => setModalVisible(false)} color="#B22222" disabled={savingModal} />
            </View>
          </View>
        </View>
      </Modal>

      {/* --- MODAL DE ÉXITO --- */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={successModalVisible}
        onRequestClose={() => setSuccessModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.successModalContent}>
            <Text style={styles.modalSuccessText}>SE HA GUARDADO CON ÉXITO</Text>
            <Button title="Cerrar" color="#228B22" onPress={() => setSuccessModalVisible(false)} />
          </View>
        </View>
      </Modal>

      {/* --- MODAL DE ERROR --- */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={errorModalVisible}
        onRequestClose={() => setErrorModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.errorModalContent}>
            <Text style={styles.modalErrorText}>ERROR: CORROBORE LOS DATOS INGRESADOS</Text>
            <Text style={styles.modalErrorDetail}>{errorMessage}</Text>
            <Button title="Cerrar" color="#B22222" onPress={() => setErrorModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
       flex: 1,
       backgroundColor: "#fff",
  },
  scrollContentContainer: {
       paddingHorizontal: 20, 
       paddingVertical: 15,   
       paddingBottom: 60,
  },
  
  title: {
      fontSize: 24,
      fontWeight: "bold",
      color: "#228B22",
      textAlign: "center",
      marginBottom: 15,
  },

  roleIndicator: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
    backgroundColor: "#f0f0f0",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    overflow: 'hidden',
  },
  
  label: {
      color: "#006400", 
      marginTop: 10,
      marginBottom: 5,
      fontSize: 16,
      fontWeight: '500',
  },
  
  input: {
      borderWidth: 1,
      borderColor: "#006400", 
      paddingVertical: 12,
      paddingHorizontal: 15,
      borderRadius: 8,
      backgroundColor: "#F8FFF8",
      fontSize: 16,
      color: '#333', 
  },
  
  inputDisabled: {
    borderWidth: 1,
    borderColor: "#ccc", 
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: "#f4f4f4",
    color: '#555', 
    fontSize: 16,
  },
  
  subtitle: {
      color: "#006400",
      fontWeight: "bold",
      marginTop: 25,
      fontSize: 19,
      marginBottom: 10,
      borderTopColor: '#e0e0e0',
      borderTopWidth: 1,
      paddingTop: 15,
  },
  
  infoText: {
    fontStyle: 'italic',
    color: '#555',
    textAlign: 'center',
    marginVertical: 15,
    fontSize: 15,
  },
  
  profesionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
    marginTop: 5,
  },
  profesionTag: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 18,
    marginRight: 8,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.20,
    shadowRadius: 1.41,
    elevation: 2,
  },

  profesionText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 15,
  },

  modalContainer: {
    flex: 1, 
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    backgroundColor: 'white',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  
  modalItem: {
    flexDirection: 'row', 
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    borderWidth: 2, 
    borderColor: '#007AFF', 
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
  },
  
  modalItemSelected: {
    backgroundColor: '#2E8B57',
    borderColor: '#236C43',
  },
  
  modalItemText: {
    fontSize: 18,
    color: '#007AFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  
  modalItemTextSelected: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  
  modalButtons: {
    marginTop: 'auto', 
    paddingTop: 15,
    paddingBottom: Platform.OS === 'ios' ? 35 : 25, 
    borderTopColor: '#e0e0e0',
    borderTopWidth: 1,
    backgroundColor: 'white', 
  },

  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  
  successModalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%',
  },
  modalSuccessText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#228B22',
    marginBottom: 15,
    textAlign: 'center',
  },
  
  errorModalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%',
  },
  modalErrorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#B22222',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalErrorDetail: {
    fontSize: 14,
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
});

export default MiPerfilScreen;
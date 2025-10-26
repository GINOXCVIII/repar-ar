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
  Platform, // Import Platform for OS specific adjustments
} from "react-native";
import axios from "axios";
import { useAuth } from "../contexts/AuthProvider";

// Asegúrate que BASE_URL apunte a tu backend correctamente (usa tu IP si pruebas en móvil)
const BASE_URL = "http://127.0.0.1:8000/api";

const MiPerfilScreen = ({ navigation }) => {
  // --- HOOKS DE AUTH ---
  const {
    firebaseUser,
    profile,
    setProfile,
    signOutUser,
    roleActive,
    workerProfile,
    toggleRole,
    misProfesiones, // Ya viene del Context (asegúrate que sea un array)
    fetchMisProfesiones, // Función para recargar las profesiones
  } = useAuth();

  // --- STATE PARA FORM DE CONTRATADOR ---
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
  const [saving, setSaving] = useState(false); // Loader para guardar perfil contratador

  // --- STATE PARA MODAL DE PROFESIONES ---
  const [modalVisible, setModalVisible] = useState(false); // Visibilidad del modal
  const [todasProfesiones, setTodasProfesiones] = useState([]); // Lista completa de profesiones
  const [selectedProfesiones, setSelectedProfesiones] = useState(new Map()); // Map para selecciones en el modal
  const [loadingModal, setLoadingModal] = useState(false); // Loader al abrir modal
  const [savingModal, setSavingModal] = useState(false); // Loader al guardar profesiones

  // Efecto para cargar datos del perfil en el formulario cuando cambian
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
  }, [profile, firebaseUser]); // Dependencias: profile y firebaseUser

  // Handler genérico para cambios en los inputs del formulario
  const handleChange = (field, value) => setForm((prevForm) => ({ ...prevForm, [field]: value }));

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
          Alert.alert("Perfil actualizado");
        } else {
          const zonaRes = await axios.post(`${BASE_URL}/zonas-geograficas/`, payloadZona);
          const zonaId = zonaRes.data.id_zona_geografica ?? zonaRes.data.id ?? zonaRes.data;
          const res = await axios.patch(`${BASE_URL}/contratadores/${profile.id_contratador}/`, {
            ...payloadContratador,
            id_zona_geografica_contratador: zonaId,
          });
          const p = normalizeAndMergeProfile(profile, res.data, zonaRes.data);
          setProfile(p);
          Alert.alert("Perfil actualizado");
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
        Alert.alert("Perfil creado correctamente");
      }
    } catch (err) {
      console.error("Error guardando perfil:", err.response?.data || err);
      Alert.alert("Error guardando perfil", JSON.stringify(err.response?.data ?? err.message ?? err));
    } finally {
      setSaving(false);
    }
  };

  // Función auxiliar para combinar datos del perfil (revisada)
  const normalizeAndMergeProfile = (oldProfile, contratadorData, zonaData) => {
     const baseProfile = oldProfile || {}; // Objeto vacío si no hay perfil antiguo
     const baseZona = baseProfile.zona_geografica_contratador || {}; // Zona antigua o vacía
     const newZona = zonaData || baseZona; // Prioriza zona nueva si existe

     // Obtener IDs de forma segura y consistente
     const contratadorId = contratadorData?.id_contratador ?? contratadorData?.id ?? baseProfile.id_contratador;
     // El ID de zona puede venir en contratadorData (si se hizo PATCH) o en zonaData (si se hizo POST)
     const zonaId = contratadorData?.id_zona_geografica_contratador
                    ?? newZona?.id_zona_geografica
                    ?? newZona?.id
                    ?? baseZona?.id_zona_geografica // Último recurso: ID de zona antigua
                    ?? null; // Default a null si no se encuentra

     return {
       raw: contratadorData || baseProfile.raw, // Mantener 'raw' si es útil
       id: contratadorId, // Usar 'id' como identificador primario localmente?
       id_contratador: contratadorId,
       nombre: contratadorData?.nombre ?? baseProfile.nombre ?? "",
       apellido: contratadorData?.apellido ?? baseProfile.apellido ?? "",
       email_contratador: contratadorData?.email_contratador ?? baseProfile.email_contratador ?? "",
       telefono_contratador: contratadorData?.telefono_contratador?.toString() ?? baseProfile.telefono_contratador ?? "", // Asegurar string
       dni: contratadorData?.dni?.toString() ?? baseProfile.dni ?? "", // Asegurar string
       id_zona_geografica_contratador: zonaId,
       zona_geografica_contratador: newZona, // Guardar el objeto zona completo
     };
  };

  // --- LÓGICA DEL MODAL DE PROFESIONES ---

  // Abre el modal y carga las profesiones
  const openProfesionModal = async () => {
    if (!workerProfile?.id_trabajador) {
        Alert.alert("Perfil no listo", "Tu perfil de trabajador aún no está completamente cargado.");
        return;
    }
    setLoadingModal(true);
    setModalVisible(true);
    try {
      // Cargar TODAS las profesiones disponibles
      const resProfesiones = await axios.get(`${BASE_URL}/profesiones/`);
      setTodasProfesiones(resProfesiones.data || []);

      // Crear mapa inicial basado en 'misProfesiones' del contexto (asegurando que es array)
      const initialMap = new Map();
      const currentProfesiones = Array.isArray(misProfesiones) ? misProfesiones : [];
      currentProfesiones.forEach((tp) => {
        if (tp.id_profesion) { // Usar el ID directo de la profesión
            initialMap.set(tp.id_profesion, true);
        }
      });
      setSelectedProfesiones(initialMap); // Establecer estado inicial del modal

    } catch (err) {
      console.error("Error al abrir/cargar modal de profesiones:", err.response?.data || err.message || err);
      Alert.alert("Error", "No se pudo cargar la lista de profesiones.");
      setModalVisible(false); // Cerrar si falla
    } finally {
      setLoadingModal(false); // Quitar loader
    }
  };

  // Cambia el estado seleccionado de una profesión en el Map del modal
  const handleToggleProfesion = (idProfesion) => {
    setSelectedProfesiones((prevMap) => {
      const newMap = new Map(prevMap); // Copia el mapa anterior
      newMap.set(idProfesion, !newMap.get(idProfesion)); // Invierte el valor booleano
      return newMap; // Devuelve el nuevo mapa
    });
  };

  // Guarda los cambios hechos en el modal (añade/quita profesiones)
  const handleSaveProfesiones = async () => {
    setSavingModal(true); // Activar loader de guardado
    const workerId = workerProfile?.id_trabajador;
    if (!workerId) {
        Alert.alert("Error", "ID de trabajador no encontrado.");
        setSavingModal(false);
        return;
    }

    const currentProfesiones = Array.isArray(misProfesiones) ? misProfesiones : []; // Array seguro
    const tasks = []; // Array para promesas de axios

    // --- Tareas de AÑADIR ---
    selectedProfesiones.forEach((isSelected, idProfesion) => {
      // Buscar si ya la tiene comparando IDs
      const alreadyHas = currentProfesiones.some(tp => tp.id_profesion === idProfesion);
      // Si está marcada en el modal Y NO la tiene actualmente -> Añadir (POST)
      if (isSelected && !alreadyHas) {
        tasks.push(
          axios.post(`${BASE_URL}/profesiones-de-trabajadores/`, {
            id_trabajador: workerId,
            id_profesion: idProfesion,
          }).catch(err => {
            // Manejo específico del error de duplicado (IntegrityError desde Django via 500)
            if (err.response?.status === 500 && err.response?.data?.includes && err.response.data.includes("IntegrityError") && err.response.data.includes("Duplicate entry")) {
              console.warn(`Ignorando error de duplicado al añadir profesión ${idProfesion}.`);
              return Promise.resolve({ ignoredDuplicate: true }); // Resolver para no detener Promise.all
            }
            console.error(`Error adding profesion ${idProfesion}:`, err.response?.data || err);
            return Promise.reject(err); // Rechazar para otros errores
          })
        );
      }
    });

    // --- Tareas de QUITAR ---
    currentProfesiones.forEach((tp) => {
      // Si la profesión actual NO está marcada en el modal -> Quitar (DELETE)
      // Asegurarse que tp.id_profesion existe para la comparación
      if (tp.id_profesion && !selectedProfesiones.get(tp.id_profesion)) {
        tasks.push(
          axios.delete(`${BASE_URL}/profesiones-de-trabajadores/${tp.id_trabajador_profesion}/`)
             .catch(err => {
                 console.error(`Error deleting profesion relation ${tp.id_trabajador_profesion}:`, err.response?.data || err);
                 return Promise.reject(err); // Rechazar si falla el borrado
              })
        );
      }
    });

    // Si no hay tareas, informar y salir
    if (tasks.length === 0) {
        Alert.alert("Información", "No hay cambios para guardar.");
        setModalVisible(false);
        setSavingModal(false);
        return;
    }

    // Ejecutar todas las tareas en paralelo
    try {
      await Promise.all(tasks);
      Alert.alert("Éxito", "Profesiones actualizadas.");
      // Recargar la lista de profesiones en el contexto para reflejar cambios
      await fetchMisProfesiones(workerId);
      setModalVisible(false); // Cerrar modal

    } catch (err) {
      // Si Promise.all rechaza, significa que una tarea (que no fue ignorada) falló
      console.error("Error al guardar/eliminar una o más profesiones:", err);
      Alert.alert("Error", "Algunos cambios no se pudieron guardar. Por favor, revisa e intenta de nuevo.");
      // Opcionalmente, recargar igual para ver si algo sí se guardó
      try { await fetchMisProfesiones(workerId); } catch (e) {}

    } finally {
      setSavingModal(false); // Quitar loader
    }
  };


  // --- RENDERIZADO DE VISTAS ---

  // Componente para renderizar el formulario de perfil Contratador
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
       // Variable segura para 'misProfesiones' (siempre un array)
       const safeMisProfesiones = Array.isArray(misProfesiones) ? misProfesiones : [];

       return (
            <View>
                {/* Detalles básicos (no editables aquí) */}
                <Text style={styles.subtitle}>Detalles de Trabajador</Text>
                <Text style={styles.label}>Email (Trabajador)</Text>
                <TextInput style={styles.input} value={workerProfile?.mail_trabajador ?? 'No disponible'} />

                <Text style={styles.label}>Teléfono (Trabajador)</Text>
                <TextInput style={styles.input} value={workerProfile?.telefono_trabajador?.toString() ?? 'No disponible'} />

                {/* Dirección (no editable aquí) */}
                <Text style={styles.subtitle}>Dirección (Trabajador)</Text>
                <Text style={styles.label}>Calle</Text>
                <TextInput style={styles.input} value={workerProfile?.zona_geografica_trabajador?.calle ?? 'No disponible'} />
                <Text style={styles.label}>Ciudad</Text>
                <TextInput style={styles.input} value={workerProfile?.zona_geografica_trabajador?.ciudad ?? 'No disponible'} />
                <Text style={styles.label}>Provincia</Text>
                <TextInput style={styles.input} value={workerProfile?.zona_geografica_trabajador?.provincia ?? 'No disponible'} />

                {/* Sección de Profesiones */}
                <Text style={styles.subtitle}>Mis Profesiones</Text>
                {safeMisProfesiones.length > 0 ? (
                    <View style={styles.profesionContainer}>
                    {/* Mapear sobre el array seguro */}
                    {safeMisProfesiones.map(tp => (
                        // Renderizar solo si 'tp.profesion' existe
                        tp?.profesion ? (
                        <View key={tp.id_trabajador_profesion} style={styles.profesionTag}>
                            <Text style={styles.profesionText}>{tp.profesion.nombre_profesion}</Text>
                        </View>
                        ) : null // No renderizar si falta el objeto profesion
                    ))}
                    </View>
                ) : (
                    // Mensaje si no hay profesiones
                    <Text style={styles.infoText}>Aún no has agregado profesiones a tu perfil.</Text>
                )}
                {/* Botón para abrir el modal */}
                <View style={{marginTop: 15}}>
                    <Button title="Editar Mis Profesiones" onPress={openProfesionModal} color="#007AFF" />
                </View>
            </View>
       );
  };


  // --- RENDER PRINCIPAL DEL COMPONENTE ---
  return (
    <ScrollView
        style={styles.container} // Estilo del contenedor del ScrollView
        contentContainerStyle={styles.scrollContentContainer} // Estilo del contenido interno
        keyboardShouldPersistTaps="handled" // Cierra teclado al tocar fuera de inputs
    >
      {/* Título de la pantalla */}
      <Text style={styles.title}>Mi Perfil</Text>

      {/* Indicador de Rol Activo */}
      <Text style={styles.roleIndicator}>
        Perfil Activo: {roleActive === "contratador" ? "Contratador" : "Trabajador"}
      </Text>

      {/* --- Renderizado Condicional del Contenido del Perfil --- */}
      {/* Muestra Contratador si el rol es 'contratador' y el perfil está cargado */}
      {roleActive === "contratador" && profile ? renderContratadorProfile() : null}
      {/* Muestra Trabajador si el rol es 'trabajador' y el workerProfile está cargado */}
      {roleActive === "trabajador" && workerProfile ? renderTrabajadorProfile() : null}
      {/* Muestra un loader si el perfil esperado para el rol activo aún no está listo */}
      { (roleActive === 'contratador' && !profile) || (roleActive === 'trabajador' && !workerProfile) ? (
            <ActivityIndicator style={{marginTop: 30}} size="large" color="#006400" />
      ) : null}


      {/* --- BOTONES DE ACCIÓN GLOBALES --- */}
      {/* Botón para cambiar de rol (solo si existe perfil de trabajador) */}
      {workerProfile?.id_trabajador ? (
        <View style={{ marginTop: 20 }}>
          <Button
            title={roleActive === "contratador" ? "Cambiar a Perfil Trabajador" : "Cambiar a Perfil Contratador"}
            color="#007AFF" // Azul
            onPress={toggleRole} // Llama a la función del contexto
          />
        </View>
      ) : (
        // Botón para registrarse como trabajador (si tiene perfil contratador pero no trabajador)
        profile?.id_contratador && !workerProfile && (
            <View style={{ marginTop: 20 }}>
            <Button
                title="Registrarme como Trabajador"
                color="#006400" // Verde oscuro
                onPress={() => navigation.navigate("RegistroTrabajador")} // Navega a la pantalla de registro
            />
            </View>
        )
      )}

      {/* Botón de Cerrar Sesión (siempre visible si está logueado en Firebase) */}
      {firebaseUser && (
        <View style={{ marginTop: 15, marginBottom: 40 }}>
            <Button
            title="Cerrar sesión"
            color="#DC3545" // Rojo
            onPress={async () => {
                try {
                await signOutUser(); // Llama a la función del contexto
                // Resetea la navegación a 'Login' para evitar volver atrás
                navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
                } catch (error) {
                console.error("Error al cerrar sesión:", error);
                Alert.alert("Error", "No se pudo cerrar la sesión.");
                }
            }}
            />
        </View>
      )}


      {/* --- MODAL PARA EDITAR PROFESIONES --- */}
      <Modal
        animationType="slide" // Animación al aparecer/desaparecer
        transparent={false} // No transparente, ocupa toda la pantalla
        visible={modalVisible} // Controlado por el estado modalVisible
        onRequestClose={() => { // Acción al presionar botón "atrás" (Android)
             // Permitir cerrar solo si no se está guardando
             if (!savingModal) {
                  setModalVisible(false);
             }
        }}
      >
        {/* Usar SafeAreaView podría ser mejor para evitar notch/barra de estado */}
        <View style={styles.modalContainer}>
          {/* Título del Modal */}
          <Text style={styles.modalTitle}>Selecciona tus Profesiones</Text>

          {/* Loader mientras cargan las profesiones */}
          {loadingModal ? (
            <ActivityIndicator size="large" color="#006400" />
          ) : (
            // Lista de profesiones disponibles
            <FlatList
              data={todasProfesiones} // Array con todas las profesiones
              keyExtractor={(item) => item.id_profesion.toString()} // Key única para cada item
              renderItem={({ item }) => {
                // Verificar si esta profesión está seleccionada en el Map
                const isSelected = !!selectedProfesiones.get(item.id_profesion);
                return (
                  // Botón táctil para cada profesión
                  <TouchableOpacity
                    style={[
                        styles.modalItem, // Estilo base
                        isSelected && styles.modalItemSelected // Estilo si está seleccionada (verde)
                    ]}
                    onPress={() => handleToggleProfesion(item.id_profesion)} // Llama a la función para cambiar selección
                    activeOpacity={0.7} // Efecto visual al tocar
                    disabled={savingModal} // Deshabilitar si se está guardando
                  >
                    {/* Nombre de la profesión */}
                    <Text style={[
                        styles.modalItemText, // Estilo base del texto
                        isSelected && styles.modalItemTextSelected // Estilo si está seleccionada (blanco)
                    ]}>
                      {item.nombre_profesion}
                    </Text>
                  </TouchableOpacity>
                );
              }}
              ListFooterComponent={<View style={{ height: 20 }} />} // Espacio al final
              showsVerticalScrollIndicator={false} // Ocultar barra de scroll
            />
          )}

          {/* Botones fijos al final del Modal */}
          <View style={styles.modalButtons}>
            {savingModal ? (
              // Loader mientras se guarda
              <ActivityIndicator size="large" color="#228B22"/>
            ) : (
              // Botón Guardar
              <Button title="Guardar Cambios" onPress={handleSaveProfesiones} color="#228B22" />
            )}
            {/* Botón Cancelar (deshabilitado si se está guardando) */}
            <View style={{marginTop: 10}}>
              <Button title="Cancelar" onPress={() => setModalVisible(false)} color="#B22222" disabled={savingModal} />
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

// --- ESTILOS --- (Añadidas mejoras y comentarios)
const styles = StyleSheet.create({
  // Contenedor principal del ScrollView
  container: {
       flex: 1, // Ocupa todo el espacio disponible
       backgroundColor: "#fff", // Fondo blanco
  },
  // Contenedor interno del ScrollView para aplicar padding
  scrollContentContainer: {
       paddingHorizontal: 20, // Padding horizontal
       paddingVertical: 15,   // Padding vertical
       paddingBottom: 60, // Espacio extra al final
  },
  // Título principal
  title: {
      fontSize: 24,
      fontWeight: "bold",
      color: "#228B22", // Verde bosque
      textAlign: "center",
      marginBottom: 15,
  },
  // Indicador de rol activo
  roleIndicator: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333", // Gris oscuro
    textAlign: "center",
    marginBottom: 20, // Más espacio
    backgroundColor: "#f0f0f0", // Fondo gris claro
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    overflow: 'hidden', // Asegura bordes redondeados
  },
  // Etiqueta para los inputs
  label: {
      color: "#006400", // Verde oscuro
      marginTop: 10,
      marginBottom: 5,
      fontSize: 16,
      fontWeight: '500',
  },
  // Estilo para inputs editables
  input: {
      borderWidth: 1,
      borderColor: "#006400", // Borde verde oscuro
      paddingVertical: 12,
      paddingHorizontal: 15,
      borderRadius: 8,
      backgroundColor: "#F8FFF8", // Fondo verde muy claro
      fontSize: 16,
      color: '#333', // Color de texto
  },
  // Estilo para inputs deshabilitados (vista trabajador)
  inputDisabled: {
    borderWidth: 1,
    borderColor: "#ccc", // Borde gris claro
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    backgroundColor: "#f4f4f4", // Fondo gris claro
    color: '#555', // Texto gris oscuro
    fontSize: 16,
  },
  // Subtítulos para separar secciones
  subtitle: {
      color: "#006400", // Verde oscuro
      fontWeight: "bold",
      marginTop: 25, // Más separación
      fontSize: 19,
      marginBottom: 10,
      borderTopColor: '#e0e0e0', // Línea separadora sutil
      borderTopWidth: 1,
      paddingTop: 15, // Espacio sobre el subtítulo
  },
  // Texto informativo (ej. "aún no has agregado...")
  infoText: {
    fontStyle: 'italic',
    color: '#555', // Gris oscuro
    textAlign: 'center',
    marginVertical: 15,
    fontSize: 15,
  },
  // Contenedor para las "píldoras" de profesiones
  profesionContainer: {
    flexDirection: 'row', // Alinear en fila
    flexWrap: 'wrap', // Permitir que bajen de línea
    marginBottom: 10,
    marginTop: 5,
  },
  // Estilo de cada "píldora" de profesión
  profesionTag: {
    backgroundColor: '#007AFF', // Azul
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 18, // Muy redondeado
    marginRight: 8,
    marginBottom: 8,
    // Sombra (puede variar visualmente entre plataformas)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.20,
    shadowRadius: 1.41,
    elevation: 2, // Sombra en Android
  },
  // Texto dentro de la píldora
  profesionText: {
    color: 'white', // Texto blanco
    fontWeight: '600',
    fontSize: 15,
  },

  // --- Estilos del Modal ---
  modalContainer: {
    flex: 1, // Ocupar toda la pantalla
    paddingTop: Platform.OS === 'ios' ? 60 : 40, // Más padding superior (ajuste iOS/Android)
    paddingHorizontal: 20,
    backgroundColor: 'white',
  },
  modalTitle: {
    fontSize: 24, // Título grande
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30, // Más espacio
    color: '#333',
  },
  // Estilo base del botón/item en el modal
  modalItem: {
    flexDirection: 'row', // Alinear horizontalmente (innecesario si solo hay texto)
    justifyContent: 'center', // Centrar contenido (texto)
    alignItems: 'center', // Centrar verticalmente
    paddingVertical: 16, // Más altura
    borderWidth: 2, // Borde más grueso
    borderColor: '#007AFF', // Borde azul por defecto
    borderRadius: 10, // Más redondeado
    paddingHorizontal: 15,
    marginBottom: 12, // Más separación
    backgroundColor: '#f9f9f9', // Fondo claro
    // Transición suave (puede no funcionar en web)
    // transition: 'background-color 0.2s ease-in-out, border-color 0.2s ease-in-out',
  },
  // Estilo cuando el botón está seleccionado (Verde)
  modalItemSelected: {
    backgroundColor: '#2E8B57', // Verde mar oscuro
    borderColor: '#236C43',     // Borde verde más oscuro
  },
  // Estilo del texto por defecto (Azul)
  modalItemText: {
    fontSize: 18,
    color: '#007AFF', // Texto azul
    fontWeight: '600',
    textAlign: 'center', // Asegurar centrado del texto
     // Transición suave del color (puede no funcionar en web)
    // transition: 'color 0.2s ease-in-out',
  },
  // Estilo del texto cuando está seleccionado (Blanco)
  modalItemTextSelected: {
    color: '#FFFFFF', // Texto blanco
    fontWeight: 'bold',
  },
  // Contenedor de botones al final del modal
  modalButtons: {
    marginTop: 'auto', // Empuja al fondo
    paddingTop: 15,
    paddingBottom: Platform.OS === 'ios' ? 35 : 25, // Padding inferior seguro
    borderTopColor: '#e0e0e0',
    borderTopWidth: 1,
    backgroundColor: 'white', // Fondo para tapar contenido detrás si es necesario
  }
});

export default MiPerfilScreen;


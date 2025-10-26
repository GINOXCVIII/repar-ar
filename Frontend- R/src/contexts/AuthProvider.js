import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { onAuthStateChanged, signOut as firebaseSignOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebase"; // Asegúrate que la ruta a firebase config sea correcta

const AuthContext = createContext();
// Asegúrate que BASE_URL apunte a tu backend correctamente (usa tu IP si pruebas en móvil)
const BASE_URL = "http://127.0.0.1:8000/api";

export const AuthProvider = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [profile, setProfile] = useState(null); // Perfil Contratador/Base
  const [workerProfile, setWorkerProfile] = useState(null); // Perfil Trabajador específico
  const [roleActive, setRoleActive] = useState(null); // 'contratador' o 'trabajador'
  const [misPostulaciones, setMisPostulaciones] = useState([]);
  const [misProfesiones, setMisProfesiones] = useState([]); // --- NUEVO ESTADO --- Profesiones del trabajador
  const [loading, setLoading] = useState(true); // Estado inicial de carga

  // Normaliza los datos del perfil de contratador que vienen del backend
  const normalizeProfile = (data) => {
    if (!data) return null;
    const id = data.id_contratador ?? data.id; // Puede venir como 'id' o 'id_contratador'
    const zona = data.zona_geografica_contratador ?? null;
    const zonaId = zona?.id_zona_geografica ?? zona?.id ?? data.id_zona_geografica_contratador ?? null; // ID puede estar anidado o directo
    return {
      raw: data, // Guardar respuesta original por si acaso
      id: id,
      id_contratador: id,
      nombre: data.nombre ?? "",
      apellido: data.apellido ?? "",
      email_contratador: data.email_contratador ?? data.email ?? "",
      telefono_contratador: data.telefono_contratador?.toString() ?? "", // Convertir a string
      dni: data.dni?.toString() ?? "", // Convertir a string
      id_zona_geografica_contratador: zonaId,
      zona_geografica_contratador: zona, // Objeto anidado de la zona
    };
  };

  // Obtiene las postulaciones hechas por un trabajador específico
  const fetchMisPostulaciones = async (workerId) => {
    if (!workerId) return;
    try {
      const postulacionesRes = await axios.get(`${BASE_URL}/postulaciones/?id_trabajador=${workerId}`);
      setMisPostulaciones(postulacionesRes.data || []);
    } catch (err) {
      console.error("Error al cargar mis postulaciones:", err.response?.data || err.message || err);
      setMisPostulaciones([]); // Resetear en caso de error
    }
  };

  // --- NUEVA FUNCIÓN --- Obtiene las profesiones asociadas a un trabajador específico
  const fetchMisProfesiones = async (workerId) => {
    if (!workerId) return;
    try {
      const profesionesRes = await axios.get(`${BASE_URL}/profesiones-de-trabajadores/?id_trabajador=${workerId}`);
      setMisProfesiones(profesionesRes.data || []);
    } catch (err) {
      console.error("Error al cargar mis profesiones:", err.response?.data || err.message || err);
      setMisProfesiones([]); // Resetear en caso de error
    }
  };

  // Obtiene el perfil de trabajador asociado a un contratador (si existe)
  const fetchWorkerProfile = async (contratadorId) => {
    if (!contratadorId) return null;
    try {
      const workerRes = await axios.get(`${BASE_URL}/trabajadores/?id_contratador=${contratadorId}`);
      if (workerRes.data && workerRes.data.length > 0) {
        const workerData = workerRes.data[0]; // Asume que solo hay un perfil de trabajador por contratador
        setWorkerProfile(workerData);
        // Cargar datos asociados al perfil de trabajador
        await fetchMisPostulaciones(workerData.id_trabajador);
        await fetchMisProfesiones(workerData.id_trabajador); // --- LLAMADA AÑADIDA ---
        return workerData;
      } else {
        // No existe perfil de trabajador
        setWorkerProfile(null);
        setMisPostulaciones([]);
        setMisProfesiones([]); // --- RESET AÑADIDO ---
        return null;
      }
    } catch (err) {
      console.error("No se pudo verificar/cargar el perfil de trabajador:", err.response?.data || err.message || err);
      setWorkerProfile(null);
      setMisPostulaciones([]);
      setMisProfesiones([]); // --- RESET AÑADIDO ---
      return null;
    }
  };

  // Verifica el token de Firebase contra el backend y carga/actualiza el perfil local
  const fetchBackendProfileWithToken = async (token) => {
    try {
      const res = await axios.post(`${BASE_URL}/auth/firebase-login/`, { token });
      let contratadorProfile = null;
      let existingWorkerProfile = null;

      if (res.data?.registrado === true) {
        // Usuario ya registrado en backend (tiene perfil contratador)
        contratadorProfile = normalizeProfile(res.data);
      } else if (res.data?.registrado === false) {
        // Usuario autenticado por Firebase pero SIN registro en backend
        const data = {
          uid_firebase: res.data.uid_firebase ?? null,
          email_firebase: res.data.email_firebase ?? null,
        };
        // Establecer un perfil base vacío para que el usuario complete
        setProfile({ raw: data, id: null, nombre: "", apellido: "", email_contratador: data.email_firebase || "" });
        setRoleActive("contratador"); // Forzar rol contratador para completar perfil
        setWorkerProfile(null);
        setMisPostulaciones([]);
        setMisProfesiones([]); // --- RESET AÑADIDO ---
        return { registered: false, profileData: data }; // Devolver datos básicos
      } else {
        // Respuesta inesperada del backend
        throw new Error("Respuesta inesperada del backend al verificar token.");
      }

      if (contratadorProfile && contratadorProfile.id_contratador) {
        setProfile(contratadorProfile);
        // Intentar cargar el perfil de trabajador asociado
        existingWorkerProfile = await fetchWorkerProfile(contratadorProfile.id_contratador);
        // Establecer rol inicial (contratador por defecto si ambos existen)
        setRoleActive("contratador");
        return { registered: true, profile: contratadorProfile, workerProfile: existingWorkerProfile };
      } else if (res.data?.registrado === false) {
          // Ya manejado arriba, pero por si acaso
          return { registered: false, profileData: profile.raw }
      } else {
         // Si no se pudo normalizar el perfil aunque 'registrado' era true
         throw new Error("Perfil registrado pero datos incompletos recibidos.");
      }
    } catch (err) {
      console.error("Error al consultar login backend:", err.response?.data || err.message || err);
      // Resetear todo en caso de error
      setProfile(null);
      setWorkerProfile(null);
      setMisPostulaciones([]);
      setMisProfesiones([]); // --- RESET AÑADIDO ---
      setRoleActive(null);
      return { registered: false, error: err }; // Devolver error
    }
  };

  // Efecto principal que escucha cambios en la autenticación de Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true); // Iniciar carga
      setFirebaseUser(user); // Guardar usuario de Firebase (o null)

      if (user) {
        // Si hay usuario Firebase, obtener token y verificar/cargar perfil del backend
        try {
          const token = await user.getIdToken();
          await fetchBackendProfileWithToken(token);
        } catch (e) {
          console.error("Error obteniendo token o perfil del backend:", e);
          // Resetear si falla la carga del perfil
          setProfile(null);
          setWorkerProfile(null);
          setMisPostulaciones([]);
          setMisProfesiones([]); // --- RESET AÑADIDO ---
          setRoleActive(null);
        }
      } else {
        // Si no hay usuario Firebase (logout), resetear todo
        setProfile(null);
        setWorkerProfile(null);
        setMisPostulaciones([]);
        setMisProfesiones([]); // --- RESET AÑADIDO ---
        setRoleActive(null);
      }
      setLoading(false); // Finalizar carga
    });

    // Limpiar listener al desmontar
    return () => unsubscribe();
  }, []);

  // Función para iniciar sesión (Firebase + Backend)
  const signIn = async (email, password) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const user = cred.user;
      const token = await user.getIdToken();
      // Después de login Firebase, cargar perfil backend (actualizará el estado global)
      const backendResult = await fetchBackendProfileWithToken(token);
      return { firebaseUser: user, backend: backendResult }; // Devolver resultado
    } catch (err) {
      console.error("Error signIn:", err);
      throw err; // Re-lanzar error para que la pantalla lo maneje
    }
  };

  // Función para registrarse (Firebase + Backend)
  const signUp = async ({ email, password, zona_geografica, nombre = "", apellido = "", telefono = "", dni = "" }) => {
    try {
      // 1. Crear usuario en Firebase
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const user = cred.user;
      const uid = user.uid;

      // 2. Crear perfil base (Contratador) en el backend
      const payload = {
        uid_firebase: uid,
        zona_geografica, // Debe ser un objeto { calle, ciudad, provincia }
        nombre,
        apellido,
        email_contratador: email, // Usar el email de registro
        telefono_contratador: telefono,
        dni,
      };

      const res = await axios.post(`${BASE_URL}/auth/firebase-register/`, payload);

      // 3. Actualizar estado local con el perfil recién creado
      if (res.status === 201 && res.data?.contratador) {
        const contratadorData = res.data.contratador;
        const p = normalizeProfile(contratadorData);
        setProfile(p);
        setRoleActive("contratador"); // Rol inicial
        setWorkerProfile(null); // Aún no hay perfil trabajador
        setMisPostulaciones([]);
        setMisProfesiones([]); // --- RESET AÑADIDO ---
        return { user, backend: res.data };
      } else {
        // Si el backend no devolvió el contratador esperado
        throw new Error("Registro exitoso en Firebase pero falló la creación del perfil en backend.");
      }
    } catch (err) {
      console.error("Error signUp:", err.response?.data || err.message || err);
      // Opcional: Si falla el registro backend pero Firebase funcionó, borrar usuario Firebase?
      throw err; // Re-lanzar para que la pantalla de registro lo maneje
    }
  };

  // Función para cerrar sesión (Firebase + Limpieza local por listener)
  const signOutUser = async () => {
    try {
      await firebaseSignOut(auth);
      // El listener onAuthStateChanged se encargará de limpiar los estados locales
    } catch (err) {
      console.error("Error signOut:", err);
      throw err;
    }
  };

  // Cambia el rol activo entre 'contratador' y 'trabajador' (si existe perfil trabajador)
  const toggleRole = () => {
    setRoleActive((prevRole) => {
      if (prevRole === 'contratador' && workerProfile) {
        return 'trabajador';
      } else {
        return 'contratador'; // Vuelve a contratador o se queda si no hay workerProfile
      }
    });
  };

  // Proporcionar el estado y las funciones a los componentes hijos
  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        profile,
        setProfile, // Permitir actualizar perfil desde otras pantallas si es necesario
        workerProfile,
        setWorkerProfile, // Para que RegistroTrabajadorScreen pueda setearlo
        roleActive,
        misPostulaciones,
        // setMisPostulaciones, // Probablemente no necesario exponer el setter directo
        misProfesiones, // --- AÑADIDO --- Exponer profesiones
        // setMisProfesiones, // Probablemente no necesario exponer el setter directo
        loading,
        signIn,
        signUp,
        signOutUser,
        fetchBackendProfileWithToken, // Para revalidar si es necesario
        toggleRole,
        fetchMisPostulaciones, // Para recargar manualmente si es necesario
        fetchMisProfesiones, // --- AÑADIDO --- Exponer función de recarga
        fetchWorkerProfile, // Exponer para poder recargar el perfil trabajador si es necesario
      }}
    >
      {/* Mostrar hijos solo cuando la carga inicial haya terminado */}
      {!loading && children}
      {/* Opcional: Mostrar un loader global mientras loading es true */}
      {/* {loading ? <ActivityIndicator size="large" style={{flex: 1, justifyContent: 'center'}} /> : children} */}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => useContext(AuthContext);


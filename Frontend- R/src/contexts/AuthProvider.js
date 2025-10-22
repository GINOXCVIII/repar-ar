// src/contexts/AuthProvider.js
import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { onAuthStateChanged, signOut as firebaseSignOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
// IMPORT CORRECTO según tu estructura de proyecto:
 import { auth } from "../services/firebase"; // <- revisá que exista este archivo y exporte `auth`

/*
  Contexto de autenticación:
  - Expone: firebaseUser, profile (datos del contratador si existe), userRole ('contratador' o 'trabajador'), loading,
            funciones: signIn, signUp, signOutUser, convertToWorker, setProfile (útil para actualizar desde pantallas).
  - Se integra con los endpoints nuevos:
      POST /api/auth/firebase-login/   { token }
      POST /api/auth/firebase-register/ { uid_firebase, zona_geografica, ...opcional }
*/

const AuthContext = createContext();
const BASE_URL = "http://127.0.0.1:8000/api";

export const AuthProvider = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [profile, setProfile] = useState(null); // perfil del contratador tal cual viene del backend
  const [userRole, setUserRole] = useState(null); // 'contratador' o 'trabajador'
  const [loading, setLoading] = useState(true);

  // Normaliza la respuesta del backend para exponer campos sencillos:
  const normalizeProfile = (data) => {
    if (!data) return null;
    // la API puede devolver "contratador" con llave id_contratador o id
    const id = data.id_contratador ?? data.id ?? data.id_contratador;
    // zona puede venir como id o como objeto zona_geografica
    const zona = data.id_zona_geografica_contratador ?? data.zona_geografica ?? null;
    const zonaId = zona?.id_zona_geografica ?? zona?.id ?? zona ?? null;
    return {
      raw: data,
      id: id,
      id_contratador: id,
      nombre: data.nombre ?? "",
      apellido: data.apellido ?? "",
      email_contratador: data.email_contratador ?? data.email ?? "",
      telefono_contratador: data.telefono_contratador ?? data.telefono ?? "",
      dni: data.dni ?? "",
      // si el backend envía la zona como objeto:
      id_zona_geografica_contratador: zonaId,
      zona_geografica_obj: zona,
    };
  };

  // Llama a /api/auth/firebase-login/ con el token para obtener si el usuario ya está en la DB
  const fetchBackendProfileWithToken = async (token) => {
    try {
      const res = await axios.post(`${BASE_URL}/auth/firebase-login/`, { token });
      // si "registrado" true, res.data será el contratador serializado o incluirá ese dato
      if (res.data?.registrado === true && res.data?.id_contratador) {
        const p = normalizeProfile(res.data);
        setProfile(p);
        setUserRole("contratador");
        return { registered: true, profile: p };
      } else if (res.data?.registrado === false) {
        // usuario autenticado en firebase pero sin profile en backend
        const data = {
          uid_firebase: res.data.uid_firebase ?? null,
          email_firebase: res.data.email_firebase ?? null,
        };
        setProfile({ raw: data, id: null, nombre: "", apellido: "", email_contratador: data.email_firebase || "" });
        setUserRole("contratador"); // por defecto al crear cuenta quedás como contratador (pedido del cliente)
        return { registered: false, profile: data };
      } else if (res.data?.id_contratador) {
        const p = normalizeProfile(res.data);
        setProfile(p);
        setUserRole("contratador");
        return { registered: true, profile: p };
      } else {
        // Caída inesperada: guardamos lo mínimo
        setProfile(null);
        setUserRole(null);
        return { registered: false };
      }
    } catch (err) {
      console.error("Error al consultar login backend:", err.response?.data || err.message || err);
      // fallback: perfil vacío
      setProfile(null);
      setUserRole(null);
      return { registered: false, error: err };
    }
  };

  // Cuando Firebase notifica cambio de sesión
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      setFirebaseUser(user);
      if (user) {
        try {
          const token = await user.getIdToken();
          await fetchBackendProfileWithToken(token);
        } catch (e) {
          console.error("Error en ensureBackendProfile:", e);
        }
      } else {
        setProfile(null);
        setUserRole(null);
      }
      setLoading(false);
    });
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Iniciar sesión con email/password (Firebase) y luego validar en backend
  const signIn = async (email, password) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const user = cred.user;
      const token = await user.getIdToken();
      const backend = await fetchBackendProfileWithToken(token);
      return { firebaseUser: user, backend };
    } catch (err) {
      // devuelve error para la pantalla de login
      console.error("Error signIn:", err);
      throw err;
    }
  };

  // Registrarse: crea usuario en Firebase y llama a tu endpoint /api/auth/firebase-register/
  // zona_geografica: { calle, ciudad, provincia } (según tu backend)
  // opcionales: nombre, apellido, telefono_contratador, dni
  const signUp = async ({ email, password, zona_geografica, nombre = "", apellido = "", telefono = "", dni = "" }) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const user = cred.user;
      const uid = user.uid;

      // Enviamos al backend para que cree zona y contratador (tu vista espera uid_firebase y zona_geografica)
      const payload = {
        uid_firebase: uid,
        zona_geografica,
        nombre,
        apellido,
        email_contratador: email,
        telefono_contratador: telefono,
        dni,
      };

      const res = await axios.post(`${BASE_URL}/auth/firebase-register/`, payload);
      // la vista devuelve contratador y zona
      if (res.status === 201) {
        const contratadorData = res.data?.contratador ?? null;
        const p = normalizeProfile(contratadorData);
        setProfile(p);
        setUserRole("contratador");
        return { user, backend: res.data };
      } else {
        return { user, backend: res.data };
      }
    } catch (err) {
      console.error("Error signUp:", err.response?.data || err);
      // si falla en backend conviene eliminar el usuario de firebase? Lo dejamos al dev decidir.
      throw err;
    }
  };

  // Cerrar sesión: llama firebase signOut y vuelve al login porque AppNavigation se basa en firebaseUser
  const signOutUser = async () => {
    try {
      await firebaseSignOut(auth);
      setFirebaseUser(null);
      setProfile(null);
      setUserRole(null);
    } catch (err) {
      console.error("Error signOut:", err);
      throw err;
    }
  };

  // Convertir a trabajador: llama al endpoint /api/trabajadores/
  // Usa id_contratador y id_zona_geografica_trabajador del profile (si están)
  const convertToWorker = async (extra = {}) => {
    if (!profile || !profile.id_contratador) {
      throw new Error("No hay perfil de contratador válido para convertir.");
    }
    try {
      const payload = {
        id_contratador: profile.id_contratador,
        id_zona_geografica_trabajador: profile.id_zona_geografica_contratador ?? (profile.zona_geografica_obj?.id_zona_geografica ?? null),
        telefono_trabajador: profile.telefono_contratador ?? "",
        mail_trabajador: profile.email_contratador ?? "",
        ...extra,
      };
      const res = await axios.post(`${BASE_URL}/trabajadores/`, payload);
      // si sale bien, marcamos rol trabajador también (ambos)
      setUserRole("trabajador"); // ahora estará activo trabajador por defecto
      // no tocamos profile del contratador (lo mantenemos)
      return res.data;
    } catch (err) {
      console.error("Error al convertir a trabajador:", err.response?.data || err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        profile,
        setProfile,
        userRole,
        loading,
        signIn,
        signUp,
        signOutUser,
        convertToWorker,
        fetchBackendProfileWithToken, // util si querés forzar revalidación
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

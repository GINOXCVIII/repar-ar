import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { onAuthStateChanged, signOut as firebaseSignOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebase"; 

const AuthContext = createContext();
const BASE_URL = "http://127.0.0.1:8000/api";

export const AuthProvider = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [workerProfile, setWorkerProfile] = useState(null);
  const [roleActive, setRoleActive] = useState(null);
  const [loading, setLoading] = useState(true);

  const normalizeProfile = (data) => {
    if (!data) return null;
    const id = data.id_contratador ?? data.id ?? data.id_contratador;
    const zona = data.zona_geografica_contratador ?? data.zona_geografica ?? null;
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
      id_zona_geografica_contratador: zonaId,
      zona_geografica_contratador: zona,
    };
  };

  const fetchWorkerProfile = async (contratadorId) => {
    if (!contratadorId) return null;
    try {
      const workerRes = await axios.get(`${BASE_URL}/trabajadores/?id_contratador=${contratadorId}`);
      if (workerRes.data && workerRes.data.length > 0) {
        setWorkerProfile(workerRes.data[0]);
        return workerRes.data[0];
      } else {
        setWorkerProfile(null);
        return null;
      }
    } catch (err) {
      console.error("No se pudo verificar el perfil de trabajador.", err);
      setWorkerProfile(null);
      return null;
    }
  };

  const fetchBackendProfileWithToken = async (token) => {
    try {
      const res = await axios.post(`${BASE_URL}/auth/firebase-login/`, { token });
      let contratadorProfile = null;

      if (res.data?.registrado === true && res.data?.id_contratador) {
        contratadorProfile = normalizeProfile(res.data);
      } else if (res.data?.id_contratador) {
        contratadorProfile = normalizeProfile(res.data);
      } else if (res.data?.registrado === false) {
        const data = {
          uid_firebase: res.data.uid_firebase ?? null,
          email_firebase: res.data.email_firebase ?? null,
        };
        setProfile({ raw: data, id: null, nombre: "", apellido: "", email_contratador: data.email_firebase || "" });
        setRoleActive("contratador");
        setWorkerProfile(null);
        return { registered: false, profile: data };
      } else {
        setProfile(null);
        setWorkerProfile(null);
        setRoleActive(null);
        return { registered: false };
      }

      if (contratadorProfile && contratadorProfile.id_contratador) {
        setProfile(contratadorProfile);
        setRoleActive("contratador");
        await fetchWorkerProfile(contratadorProfile.id_contratador);
        return { registered: true, profile: contratadorProfile };
      }
    } catch (err) {
      console.error("Error al consultar login backend:", err.response?.data || err.message || err);
      setProfile(null);
      setWorkerProfile(null);
      setRoleActive(null);
      return { registered: false, error: err };
    }
  };

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
        setWorkerProfile(null);
        setRoleActive(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const signIn = async (email, password) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const user = cred.user;
      const token = await user.getIdToken();
      const backend = await fetchBackendProfileWithToken(token);
      return { firebaseUser: user, backend };
    } catch (err) {
      console.error("Error signIn:", err);
      throw err;
    }
  };

  const signUp = async ({ email, password, zona_geografica, nombre = "", apellido = "", telefono = "", dni = "" }) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const user = cred.user;
      const uid = user.uid;

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
      if (res.status === 201) {
        const contratadorData = res.data?.contratador ?? null;
        const p = normalizeProfile(contratadorData);
        setProfile(p);
        setRoleActive("contratador");
        setWorkerProfile(null);
        return { user, backend: res.data };
      } else {
        return { user, backend: res.data };
      }
    } catch (err) {
      console.error("Error signUp:", err.response?.data || err);
      throw err;
    }
  };

  const signOutUser = async () => {
    try {
      await firebaseSignOut(auth);
      setFirebaseUser(null);
      setProfile(null);
      setWorkerProfile(null);
      setRoleActive(null);
    } catch (err) {
      console.error("Error signOut:", err);
      throw err;
    }
  };

  const convertToWorker = async () => {
    console.log("AuthProvider: Actualizando rol a 'trabajador'");
    setRoleActive("trabajador");
    if (profile && profile.id_contratador) {
      await fetchWorkerProfile(profile.id_contratador);
    }
    return Promise.resolve();
  };

  const toggleRole = () => {
    if (roleActive === 'contratador' && workerProfile) {
      setRoleActive('trabajador');
    } else if (roleActive === 'trabajador') {
      setRoleActive('contratador');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        profile,
        setProfile,
        workerProfile,
        roleActive,
        loading,
        signIn,
        signUp,
        signOutUser,
        convertToWorker,
        fetchBackendProfileWithToken,
        toggleRole,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);


import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { onAuthStateChanged, signOut as firebaseSignOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebase"; 

const AuthContext = createContext();
const BASE_URL = "http://127.0.0.1:8000/api";

export const AuthProvider = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [profile, setProfile] = useState(null);
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

  const fetchBackendProfileWithToken = async (token) => {
    try {
      const res = await axios.post(`${BASE_URL}/auth/firebase-login/`, { token });
      if (res.data?.registrado === true && res.data?.id_contratador) {
        const p = normalizeProfile(res.data);
        setProfile(p);
        setRoleActive("contratador");
        return { registered: true, profile: p };
      } else if (res.data?.registrado === false) {
        const data = {
          uid_firebase: res.data.uid_firebase ?? null,
          email_firebase: res.data.email_firebase ?? null,
        };
        setProfile({ raw: data, id: null, nombre: "", apellido: "", email_contratador: data.email_firebase || "" });
        setRoleActive("contratador");
        return { registered: false, profile: data };
      } else if (res.data?.id_contratador) {
        const p = normalizeProfile(res.data);
        setProfile(p);
        setRoleActive("contratador");
        return { registered: true, profile: p };
      } else {
        setProfile(null);
        setRoleActive(null);
        return { registered: false };
      }
    } catch (err) {
      console.error("Error al consultar login backend:", err.response?.data || err.message || err);
      setProfile(null);
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
  S }
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
      setRoleActive(null);
    } catch (err) {
      console.error("Error signOut:", err);
      throw err;
    }
  };

  const convertToWorker = async () => {
    console.log("AuthProvider: Actualizando rol a 'trabajador'");
    setRoleActive("trabajador");
    return Promise.resolve();
  };

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        profile,
        setProfile,
        roleActive,
        loading,
        signIn,
        signUp,
        signOutUser,
        convertToWorker,
        fetchBackendProfileWithToken,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);


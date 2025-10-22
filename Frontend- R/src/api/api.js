// src/api/api.js
import axios from "axios";
import { getAuth } from "firebase/auth";

const API_URL = "http://127.0.0.1:8000/api"; // usa la URL que ya tenés funcionando

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use(
  async (config) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn("No token disponible", e.message);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;

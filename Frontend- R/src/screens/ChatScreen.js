// src/screens/ChatScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import axios from "axios";
import { collection, addDoc, query, orderBy, onSnapshot, where } from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../contexts/AuthProvider";
import { Ionicons } from "@expo/vector-icons";

const BASE_URL = "http://127.0.0.1:8000/api";

export default function ChatScreen({ route }) {
  const { trabajoId } = route.params || {};
  const { firebaseUser } = useAuth();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [chatInfo, setChatInfo] = useState(null);

  useEffect(() => {
    if (!trabajoId) return;
    initChat();
  }, [trabajoId]);

  // 🔹 Carga info del trabajo desde el backend y configura listener de mensajes
  const initChat = async () => {
    try {
      const tRes = await axios.get(`${BASE_URL}/trabajos/${trabajoId}/`);
      const trabajo = tRes.data;

      const id_trabajador = trabajo.id_trabajador;
      const id_contratador = trabajo.id_contratador;

      setChatInfo({ id_trabajador, id_contratador });

      // Escucha en tiempo real los mensajes de este trabajo
      const q = query(
        collection(db, "mensajes"),
        where("id_trabajo", "==", trabajoId),
        orderBy("fecha", "asc")
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const msgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setMessages(msgs);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      console.error("Error cargando datos del trabajo:", err);
      setLoading(false);
    }
  };

  // 🔹 Enviar mensaje
  const handleSend = async () => {
    if (!input.trim()) return;
    try {
      await addDoc(collection(db, "mensajes"), {
        id_trabajo: trabajoId,
        emisor_uid: firebaseUser.uid,
        texto: input.trim(),
        fecha: new Date(),
      });
      setInput("");
    } catch (err) {
      console.error("Error al enviar mensaje:", err);
    }
  };

  const renderMessage = ({ item }) => {
    const isOwn = item.emisor_uid === firebaseUser.uid;
    return (
      <View style={[styles.msgBubble, isOwn ? styles.myMsg : styles.otherMsg]}>
        <Text style={styles.msgText}>{item.texto}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={80}
    >
      <View style={styles.header}>
        <Ionicons name="chatbubbles-outline" size={24} color="#fff" />
        <Text style={styles.headerText}>Chat del trabajo #{trabajoId}</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <Text>Cargando chat...</Text>
        </View>
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={{ padding: 10 }}
        />
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Escribe un mensaje..."
          value={input}
          onChangeText={setInput}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Ionicons name="send" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0fff4" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0b9d57",
    padding: 10,
  },
  headerText: { color: "#fff", fontSize: 18, fontWeight: "700", marginLeft: 8 },
  msgBubble: {
    marginVertical: 6,
    padding: 10,
    borderRadius: 10,
    maxWidth: "80%",
  },
  myMsg: {
    backgroundColor: "#0b9d57",
    alignSelf: "flex-end",
  },
  otherMsg: {
    backgroundColor: "#e0e0e0",
    alignSelf: "flex-start",
  },
  msgText: { color: "#fff" },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 6,
  },
  sendButton: {
    backgroundColor: "#0b9d57",
    borderRadius: 20,
    marginLeft: 10,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});

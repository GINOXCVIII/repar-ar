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
import { collection, addDoc, query, orderBy, onSnapshot, where } from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../contexts/AuthProvider";
import { Ionicons } from "@expo/vector-icons";

import api from "../api/api";

const BASE_URL = "http://127.0.0.1:8000/api";

export default function ChatScreen({ route }) {
  const { chatId } = route.params || {};
  const { firebaseUser } = useAuth();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!chatId) return;
    const unsubscribe = initChat(); 

   
    return () => {
      if (unsubscribe && typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [chatId]);

  const initChat = () => { 
    setLoading(true); 
    let unsubscribe = () => {};


    try {
      const q = query(
        collection(db, "mensajes"),
        where("id_chat", "==", chatId),
        orderBy("fecha", "asc")
      );

      unsubscribe = onSnapshot(q, (snapshot) => {
        const msgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        console.log("Mensajes recibidos de Firestore:", msgs); 
        setMessages(msgs);
        setLoading(false);
      },
      (error) => { 
        console.error("Error al escuchar mensajes de Firestore:", error);
        setLoading(false);
    
      });

    } catch (err) {
       console.error("Error configurando la consulta de Firestore:", err);
       setLoading(false);
    }
    return unsubscribe;
  };

  const handleSend = async () => {
    if (!input.trim() || !firebaseUser) return;
    try {
      await addDoc(collection(db, "mensajes"), {
        id_chat: chatId,
        emisor_uid: firebaseUser.uid, // -> puedo usar esto para recuperar el nombre del emisor ojota
        texto: input.trim(),
        fecha: new Date(),
      });
      setInput("");
    } catch (err) {
      console.error("Error al enviar mensaje:", err);
    }
  };

  /*
  const renderMessage = ({ item }) => {
    const isOwn = item.emisor_uid === firebaseUser?.uid;
    return (
      <View style={[styles.msgBubble, isOwn ? styles.myMsg : styles.otherMsg]}>
        <Text style={[styles.msgText, !isOwn && styles.otherMsgText]}>{item.texto}</Text>
      </View>
    );
  };
  */

  const MessageItem = ({ item }) => {
    const isOwn = item.emisor_uid === firebaseUser?.uid;
    const [nombreApellidoEmisor, setNombreApellidoEmisor] = useState("");

    useEffect(() => {
      const fetchNombreApellidoEmisor = async () => {
        const nombre_apellido = await getNombreApellidoEmisor(item.emisor_uid);
        setNombreApellidoEmisor(nombre_apellido);
        // console.log("isOwn:", isOwn, "nombre_apellido:", nombre_apellido, "\nitem.texto:", item.texto);
      };
      fetchNombreApellidoEmisor();
    }, [item.emisor_uid]);

    return (
      <View style={[styles.msgBubble, isOwn ? styles.myMsg : styles.otherMsg]}>
        <Text style={[styles.senderName]}>{nombreApellidoEmisor}</Text>
        <Text style={[styles.msgText, !isOwn && styles.otherMsgText]}>{item.texto}</Text>
      </View>
    );
  };

  const getNombreApellidoEmisor = async (emisor_uid) => {

    const response = await api.get(`${BASE_URL}/contratadores/?uid_firebase=${emisor_uid}`);

    const data = response.data;

    const nombre_emisor = data.nombre;
    const apellido_emisor = data.apellido;

    return `${nombre_emisor} ${apellido_emisor}`;
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <View style={styles.header}>
        <Ionicons name="chatbubbles-outline" size={24} color="#fff" />
        <Text style={styles.headerText}>Chat del trabajo #{chatId}</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <Text>Cargando chat...</Text>
        </View>
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MessageItem item={item} />}
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
    paddingVertical: 12,
    paddingHorizontal: 15,
    paddingTop: Platform.OS === 'android' ? 25 : 10,
  },
  headerText: { color: "#fff", fontSize: 18, fontWeight: "700", marginLeft: 8 },
  msgBubble: {
    marginVertical: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 15,
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
  msgText: {
    color: "#fff",
    fontSize: 15,
   },
  otherMsgText: {
      color: "#333",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === 'ios' ? 10 : 6,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: "#0b9d57",
    borderRadius: 25,
    padding: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  senderName: {
  fontSize: 12,
  marginBottom: 3,
},
});


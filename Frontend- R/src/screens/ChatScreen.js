// src/screens/ChatScreen.js
import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform } from "react-native";
import { db, sendMessageToChat } from "../services/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { useAuth } from "../contexts/AuthProvider";

export default function ChatScreen({ route }) {
  const { chatId, trabajoTitle, otherUserId } = route.params;
  const { firebaseUser } = useAuth();
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!chatId) return;
    const q = query(collection(db, `chats/${chatId}/messages`), orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setMessages(msgs);
    });
    return () => unsub();
  }, [chatId]);

  const send = async () => {
    if (!text.trim()) return;
    try {
      await sendMessageToChat(chatId, firebaseUser.uid, firebaseUser.email, text.trim());
      setText("");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==="ios"?"padding":"height"}>
      <View style={{flex:1, padding:12}}>
        <Text style={{fontWeight:"700"}}>{trabajoTitle}</Text>
        <FlatList data={messages} keyExtractor={m=>m.id} renderItem={({item})=>(
          <View style={{marginVertical:6, alignSelf: item.authorId === firebaseUser.uid ? "flex-end" : "flex-start", backgroundColor: item.authorId === firebaseUser.uid ? "#d1f5e9" : "#fff", padding:10, borderRadius:8, maxWidth:"80%"}}>
            <Text style={{fontSize:12,color:"#666"}}>{item.authorName}</Text>
            <Text>{item.text}</Text>
          </View>
        )} />
      </View>

      <View style={{flexDirection:"row", padding:8, borderTopWidth:1, borderColor:"#eee"}}>
        <TextInput value={text} onChangeText={setText} placeholder="Escribí..." style={{flex:1,backgroundColor:"#fff",padding:12,borderRadius:8}} />
        <TouchableOpacity onPress={send} style={{marginLeft:8,backgroundColor:"#009879",padding:12,borderRadius:8,justifyContent:"center"}}>
          <Text style={{color:"#fff"}}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

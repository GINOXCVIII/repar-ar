// src/services/firebase.js
import { initializeApp, getApps } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, collection, doc, addDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { firebaseConfig } from "./firebase_credentials";

// Init app only once
if (!getApps().length) {
  initializeApp(firebaseConfig);
}

export const auth = getAuth();
export const db = getFirestore();

// Auth helpers
export const registerUser = (email, password) => createUserWithEmailAndPassword(auth, email, password);
export const loginUser = (email, password) => signInWithEmailAndPassword(auth, email, password);
export const logoutUser = () => signOut(auth);

// Chat helpers (usados por el front)
export const createChatBetween = async (chatIdMetadata) => {
  // chatIdMetadata: { trabajoId, contratadorId, trabajadorId, trabajoTitle }
  // Creamos documento chat con metadata
  const chatsCol = collection(db, "chats");
  const chatDocRef = doc(chatsCol); // id auto
  await setDoc(chatDocRef, {
    trabajoId: chatIdMetadata.trabajoId,
    contratadorId: chatIdMetadata.contratadorId,
    trabajadorId: chatIdMetadata.trabajadorId,
    trabajoTitle: chatIdMetadata.trabajoTitle,
    createdAt: serverTimestamp()
  });
  return chatDocRef.id;
};

export const sendMessageToChat = async (chatId, userId, userName, text) => {
  const messagesCol = collection(db, `chats/${chatId}/messages`);
  const res = await addDoc(messagesCol, {
    authorId: userId,
    authorName: userName,
    text,
    createdAt: serverTimestamp(),
  });
  return res.id;
};

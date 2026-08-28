import { useState, useCallback, useEffect } from 'react';
import { Chat, ChatMessage } from '../types';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, getDoc, doc, addDoc, updateDoc, onSnapshot, orderBy, limit } from 'firebase/firestore';

export function useChat(chatId?: string, userId?: string) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchChats = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, 'chats'),
        where('participants', 'array-contains', userId)
      );
      const snapshot = await getDocs(q);
      const fetchedChats = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Chat[];
      setChats(fetchedChats);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch chats');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const fetchMessages = useCallback(async (cId: string) => {
    try {
      const q = query(
        collection(db, `chats/${cId}/messages`),
        orderBy('timestamp', 'desc'),
        limit(50)
      );
      const snapshot = await getDocs(q);
      const fetchedMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as ChatMessage[];
      setMessages(fetchedMessages.reverse());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch messages');
    }
  }, []);

  const sendMessage = useCallback(async (cId: string, message: Omit<ChatMessage, 'id'>) => {
    try {
      const docRef = await addDoc(collection(db, `chats/${cId}/messages`), {
        ...message,
        timestamp: new Date().toISOString(),
      });
      await updateDoc(doc(db, 'chats', cId), {
        lastMessage: message.message,
        lastMessageTime: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      return docRef.id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
    }
  }, []);

  useEffect(() => {
    if (!chatId) return;
    fetchMessages(chatId);
    const q = query(collection(db, `chats/${chatId}/messages`), orderBy('timestamp'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as ChatMessage[];
      setMessages(fetchedMessages);
    });
    return () => unsubscribe();
  }, [chatId, fetchMessages]);

  return {
    chats,
    currentChat,
    messages,
    loading,
    error,
    fetchChats,
    fetchMessages,
    sendMessage,
  };
}

import { db } from "@/firebaseConfig";
import { router, useLocalSearchParams } from "expo-router";
import {
  onSnapshot,
  query,
  collection,
  orderBy,
  addDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { fetchPlayerNames } from "./chatHelpers";

interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
}

export default function ChatMessages() {
  const { chatId } = useLocalSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const flatListRef = useRef<FlatList>(null);
  const [playerNames, setPlayerNames] = useState<{ [uid: string]: string }>({});

  const { user: currentUser } = useAuth();

  const sendMessage = async () => {
    if (!message.trim()) return;
    if (!currentUser) return;
    if (!chatId || Array.isArray(chatId)) return;
    try {
      await addDoc(collection(db, "chats", chatId, "messages"), {
        senderId: currentUser.uid,
        content: message.trim(),
        timestamp: new Date(),
      });
      await updateDoc(doc(db, "chats", chatId), {
        lastMessage: message.trim(),
        lastMessageTimestamp: new Date(),
        [`lastRead.${currentUser.uid}`]: new Date(),
      });
      setMessage("");
    } catch (error) {
      console.error("Fout bij het verzenden van bericht:", error);
    }
  };

  // Chat markeren als gelezen bij openen
  useEffect(() => {
    if (!chatId || Array.isArray(chatId) || !currentUser) return;
    updateDoc(doc(db, "chats", chatId), {
      [`lastRead.${currentUser.uid}`]: new Date(),
    });
  }, [chatId]);

  useEffect(() => {
    if (!chatId || Array.isArray(chatId)) return;

    const messagesQuery = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("timestamp", "asc"),
    );
    const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const loadedMessages: Message[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        loadedMessages.push({
          id: doc.id,
          senderId: data.senderId,
          content: data.content,
          timestamp: data.timestamp?.toDate() || new Date(),
        });
      });
      setMessages(loadedMessages);
      const uniqueSenderIds = Array.from(
        new Set(loadedMessages.map((msg) => msg.senderId)),
      );
      fetchPlayerNames(uniqueSenderIds, playerNames).then(setPlayerNames);
    });
    return () => unsubscribe();
  }, [chatId]);

  const isEigenBericht = (senderId: string) => senderId === currentUser?.uid;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={0}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color="#8888AA" />
          <Text style={styles.backText}>Terug</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Groepchat</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        style={styles.messageList}
        contentContainerStyle={styles.messageListContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        renderItem={({ item }) => (
          <View>
            {!isEigenBericht(item.senderId) && (
              <Text style={styles.senderName}>
                {playerNames[item.senderId] || "Onbekend"}
              </Text>
            )}
            <View
              style={[
                styles.messageBubble,
                isEigenBericht(item.senderId)
                  ? styles.eigenBericht
                  : styles.anderBericht,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  isEigenBericht(item.senderId)
                    ? styles.eigenBerichtText
                    : styles.anderBerichtText,
                ]}
              >
                {item.content}
              </Text>
              <Text style={styles.messageTime}>
                {item.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            Nog geen berichten. Stuur het eerste!
          </Text>
        }
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type een bericht..."
          placeholderTextColor="#8888AA"
          value={message}
          onChangeText={setMessage}
          onSubmitEditing={sendMessage}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Ionicons name="send" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0B12",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#1E1E30",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  backText: {
    fontSize: 14,
    color: "#8888AA",
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    padding: 16,
    paddingBottom: 8,
  },
  messageBubble: {
    maxWidth: "75%",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  eigenBericht: {
    alignSelf: "flex-end",
    backgroundColor: "#2E6BFF",
    borderBottomRightRadius: 4,
  },
  anderBericht: {
    alignSelf: "flex-start",
    backgroundColor: "#131320",
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: "#1E1E30",
  },
  messageText: {
    fontSize: 14,
  },
  eigenBerichtText: {
    color: "#FFFFFF",
  },
  anderBerichtText: {
    color: "#AAAAAA",
  },
  messageTime: {
    fontSize: 10,
    color: "rgba(255, 255, 255, 0.5)",
    marginTop: 4,
    alignSelf: "flex-end",
  },
  emptyText: {
    fontSize: 14,
    color: "#8888AA",
    textAlign: "center",
    marginTop: 40,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: "#1E1E30",
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: "#131320",
    borderWidth: 1,
    borderColor: "#1E1E30",
    borderRadius: 8,
    padding: 14,
    color: "#FFFFFF",
    fontSize: 14,
  },
  sendButton: {
    backgroundColor: "#2E6BFF",
    borderRadius: 8,
    padding: 14,
  },
  senderName: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#2E6BFF",
    marginBottom: 4,
    marginLeft: 4,
  },
});

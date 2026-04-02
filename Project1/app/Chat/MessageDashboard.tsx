import { db } from "@/firebaseConfig";
import { router } from "expo-router";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { fetchPlayerNames } from "./chatHelpers";

interface Chat {
  id: string;
  players: string[];
  lastMessage?: string;
  mapName?: string;
  sessionType?: "match" | "practice";
  date?: string;
  time?: string;
  isCompetitive?: boolean;
  lastRead?: { [uid: string]: Date };
  lastMessageTimestamp?: Date;
}

export default function MessageDashboard() {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [playerNames, setPlayerNames] = useState<{ [uid: string]: string }>({});

  useFocusEffect(
    useCallback(() => {
      // Namen altijd vers ophalen bij focus
      if (chats.length > 0) {
        const allPlayerUids = Array.from(new Set(chats.flatMap((chat) => chat.players)));
        fetchPlayerNames(allPlayerUids, {}).then(setPlayerNames);
      }
    }, [chats]),
  );

  useEffect(() => {
    if (!user) return;

    const chatsRef = collection(db, "chats");
    const q = query(
      chatsRef,
      where("players", "array-contains", user.uid),
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const chatsData = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          }) as Chat,
      );
      setChats(chatsData);
      const allPlayerUids = Array.from(new Set(chatsData.flatMap((chat) => chat.players)));
      const updatedNames = await fetchPlayerNames(allPlayerUids, playerNames);
      setPlayerNames(updatedNames);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={20} color="#8888AA" />
        <Text style={styles.backText}>Terug</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Berichten</Text>
      <Text style={styles.subtitle}>Jouw groepchats</Text>

      {chats.length === 0 ? (
        <Text style={styles.emptyText}>Geen chats gevonden</Text>
      ) : (
        <FlatList
          data={chats}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                router.push({
                  pathname: "/Chat/ChatMessages",
                  params: { chatId: item.id },
                })
              }
            >
              <View style={styles.cardHeader}>
                {item.lastMessageTimestamp &&
                  user &&
                  (!item.lastRead?.[user.uid] ||
                    (item.lastMessageTimestamp as any).toDate?.() > (item.lastRead[user.uid] as any).toDate?.()) && (
                    <View style={styles.unreadDot} />
                  )}
                <Ionicons
                  name="chatbubbles-outline"
                  size={20}
                  color="#2E6BFF"
                />
                <Text style={styles.cardTitle}> Chat {item.mapName}</Text>
                <View style={styles.badgeContainer}>
                  <View
                    style={[
                      styles.badge,
                      item.sessionType === "practice"
                        ? styles.badgePractice
                        : styles.badgeMatch,
                    ]}
                  >
                    <Text style={styles.badgeText}>
                      {item.sessionType === "practice" ? "Practice" : "Match"}
                    </Text>
                  </View>
                  {item.isCompetitive && (
                    <View style={[styles.badge, styles.badgeCompetitive]}>
                      <Text style={styles.badgeCompetitiveText}>
                        Competitief
                      </Text>
                    </View>
                  )}
                </View>
              </View>
              <View style={styles.divider} />
              <View style={styles.detailRow}>
                <Ionicons name="calendar-outline" size={16} color="#8888AA" />
                <Text style={styles.detailText}>
                  {item.date || "Onbekend"} om {item.time || "Onbekend"}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons name="people-outline" size={16} color="#8888AA" />
                <Text style={styles.detailText}>
                  {item.players
                    .map((uid) => playerNames[uid] || "Onbekend")
                    .join(", ")}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Ionicons
                  name="chatbubble-ellipses-outline"
                  size={16}
                  color="#8888AA"
                />
                <Text style={styles.detailText} numberOfLines={1}>
                  {item.lastMessage || "Nog geen berichten"}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B0B12",
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  subtitle: {
    fontSize: 14,
    color: "#8888AA",
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 14,
    color: "#8888AA",
    textAlign: "center",
    marginTop: 40,
  },
  card: {
    backgroundColor: "#131320",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#1E1E30",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  divider: {
    height: 1,
    backgroundColor: "#1E1E30",
    marginVertical: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#AAAAAA",
    flex: 1,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 16,
  },
  backText: {
    fontSize: 14,
    color: "#8888AA",
  },
  badgeContainer: {
    flexDirection: "row",
    gap: 6,
    marginLeft: "auto",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  badgeMatch: {
    backgroundColor: "rgba(46, 107, 255, 0.15)",
  },
  badgePractice: {
    backgroundColor: "rgba(136, 136, 170, 0.15)",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#2E6BFF",
    textTransform: "uppercase",
  },
  badgeCompetitive: {
    backgroundColor: "rgba(229, 57, 53, 0.15)",
  },
  badgeCompetitiveText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#E53935",
    textTransform: "uppercase",
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#E53935",
  },
});

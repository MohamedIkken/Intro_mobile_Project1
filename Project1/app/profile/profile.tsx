import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { UserProfile } from "../context/AuthContext";
import { useFocusEffect } from "@react-navigation/native";

export default function Profile() {
  const { user } = useAuth();
  const [level, setLevel] = useState<number | null>(null);
  const [profielFoto, setProfielFoto] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      const fetchUserData = async () => {
        if (!user?.uid) return;
        try {
          await user.reload();
          setDisplayName(user.displayName);

          const userDocSnap = await getDoc(doc(db, "users", user.uid));
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data() as UserProfile;
            setLevel(userData.level || 2.0);
            if (userData.photoBase64) {
              setProfielFoto(userData.photoBase64);
            }
          }
        } catch (error) {
          console.error("Fout bij ophalen gebruikersdata:", error);
        }
      };

      fetchUserData();
    }, [user]),
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.glow} />

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        <Text style={styles.backButtonText}>Terug</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.avatarWrap}>
          {profielFoto ? (
            <Image source={{ uri: profielFoto }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={48} color="#8888AA" />
            </View>
          )}
        </View>

        <Text style={styles.displayName}>{displayName ?? "Gebruiker"}</Text>
        <Text style={styles.email}>{user?.email}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ACCOUNT</Text>

          <View style={styles.card}>
            <View style={styles.cardIconWrap}>
              <Ionicons name="person-outline" size={22} color="#FFFFFF" />
            </View>
            <View style={styles.cardTextWrap}>
              <Text style={styles.cardLabel}>Naam</Text>
              <Text style={styles.cardValue}>{displayName ?? "-"}</Text>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardIconWrap}>
              <Ionicons name="mail-outline" size={22} color="#FFFFFF" />
            </View>
            <View style={styles.cardTextWrap}>
              <Text style={styles.cardLabel}>E-mail</Text>
              <Text style={styles.cardValue}>{user?.email ?? "-"}</Text>
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardIconWrap}>
              <Ionicons name="bar-chart-outline" size={22} color="#FFFFFF" />
            </View>
            <View style={styles.cardTextWrap}>
              <Text style={styles.cardLabel}>Game experience Level</Text>
              <Text style={styles.cardValue}>
                {level !== null ? level.toFixed(2) : "Laden..."}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ACTIES</Text>

          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push("/profile/bewerkProfile")}
          >
            <View style={styles.cardIconWrap}>
              <Ionicons name="create-outline" size={22} color="#FFFFFF" />
            </View>
            <View style={styles.cardTextWrap}>
              <Text style={styles.cardTitel}>Profiel bewerken</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#8888AA" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#08080F",
  },
  glow: {
    position: "absolute",
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "#1B6CF2",
    opacity: 0.15,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 40,
    alignItems: "center",
  },
  avatarWrap: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#1B6CF2",
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#1E1E35",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#1B6CF2",
  },
  displayName: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
  },
  email: {
    color: "#8888AA",
    fontSize: 14,
    marginBottom: 32,
  },
  section: {
    width: "100%",
    marginBottom: 24,
  },
  sectionLabel: {
    color: "#8888AA",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#0F0F1C",
    borderWidth: 1,
    borderColor: "#1E1E35",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  cardIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#1E1E35",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  cardTextWrap: {
    flex: 1,
  },
  cardLabel: {
    color: "#8888AA",
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  cardValue: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "500",
  },
  cardTitel: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 2,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 5,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 6,
  },
});

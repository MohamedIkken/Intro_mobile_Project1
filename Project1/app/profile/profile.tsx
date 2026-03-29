import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
} from "react-native";
import { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import { router } from "expo-router";
import { useFonts, Orbitron_700Bold } from "@expo-google-fonts/orbitron";
import { Ionicons } from "@expo/vector-icons";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig"; // Zorg dat het pad klopt
import { UserProfile } from "../AuthContext";

export default function Profile() {
  const { user } = useAuth();
  const [fontsLoaded] = useFonts({ Orbitron_700Bold });
  const [level, setLevel] = useState<number | null>(null);

  // Haal het level op uit Firestore wanneer de user geladen is
  useEffect(() => {
    const fetchUserLevel = async () => {
      if (user?.uid) {
        try {
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);

          const userData = userDocSnap.data() as UserProfile;

          if (userDocSnap.exists()) {
            setLevel(userData.level || 2.0); // Fallback naar 2.0
          }
        } catch (error) {
          console.error("Fout bij ophalen level:", error);
        }
      }
    };

    fetchUserLevel();
  }, [user]);
  const [profielFoto, setProfielFoto] = useState<string | null>(null);

  useEffect(() => {
    const loadPhoto = async () => {
      if (!user?.uid) return;
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists() && snap.data().photoBase64) {
        setProfielFoto(snap.data().photoBase64);
      }
    };
    loadPhoto();
  }, [user?.uid]);

  if (!fontsLoaded) {
    return <ActivityIndicator />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.glow} />

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.push("/dashboard")}
      >
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

        <Text style={styles.displayName}>
          {user?.displayName ?? "Gebruiker"}
        </Text>
        <Text style={styles.email}>{user?.email}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ACCOUNT</Text>

          <View style={styles.card}>
            <View style={styles.cardIconWrap}>
              <Ionicons name="person-outline" size={22} color="#FFFFFF" />
            </View>
            <View style={styles.cardTextWrap}>
              <Text style={styles.cardLabel}>Naam</Text>
              <Text style={styles.cardValue}>{user?.displayName ?? "-"}</Text>
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

          {/* NIEUW: Padel Level Kaartje */}
          <View style={styles.card}>
            <View style={styles.cardIconWrap}>
              <Ionicons name="bar-chart-outline" size={22} color="#FFFFFF" />
            </View>
            <View style={styles.cardTextWrap}>
              <Text style={styles.cardLabel}>Padel Level</Text>
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
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 12,
    backgroundColor: "#0F0F1C",
    borderBottomWidth: 1,
    borderBottomColor: "#1E1E35",
  },
  logo: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 2,
    fontFamily: "Orbitron_700Bold",
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
  cardSub: {
    color: "#8888AA",
    fontSize: 12,
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

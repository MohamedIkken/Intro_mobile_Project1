import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { useFonts, Orbitron_700Bold } from "@expo-google-fonts/orbitron";
import { ActivityIndicator } from "react-native";
import { signOut } from "firebase/auth";
import { auth } from "@/firebaseConfig";
import { useAuth } from "./AuthContext";
import { Ionicons } from "@expo/vector-icons";

export default function DashboardScreen() {
  const [fontsLoaded] = useFonts({
    Orbitron_700Bold,
  });
  const { user } = useAuth();

  if (!fontsLoaded) {
    return <ActivityIndicator />;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.glow} />

      {/* Top bar */}
      <View style={styles.topBar}>
        <Text style={styles.logo}>PLAYNODE</Text>
        <View style={styles.topBarIcons}>
          <TouchableOpacity style={styles.topBarIconBtn}>
            <Ionicons name="chatbubble-outline" size={22} color="#8888AA" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.topBarIconBtn}
            onPress={() => router.push("/profile/profile")}
          >
            <Ionicons name="person-outline" size={22} color="#8888AA" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.topBarIconBtn}
            onPress={() => signOut(auth)}
          >
            <Ionicons name="log-out-outline" size={22} color="#8888AA" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.kaartenRij}>
          <Text style={styles.welcomeText}>Welcome {user?.displayName}!</Text>
          <TouchableOpacity
            style={styles.kaartGroot}
            onPress={() => router.push("/mijnsessies")}
          >
            <View style={styles.kaartIconWrap}>
              <Ionicons name="add-circle-outline" size={28} color="#FFFFFF" />
            </View>
            <View style={styles.kaartTextWrap}>
              <Text style={styles.kaartTitel}>Aanmaken</Text>
              <Text style={styles.kaartSub}>Nieuwe sessie starten</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.kaartGroot}>
            <View style={styles.kaartIconWrap}>
              <Ionicons name="search-outline" size={28} color="#FFFFFF" />
            </View>
            <View style={styles.kaartTextWrap}>
              <Text style={styles.kaartTitel}>Zoeken</Text>
              <Text style={styles.kaartSub}>Vind een bestaande sessie</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.kaartGroot}
            onPress={() => router.push("/boeking/serverBoeken")}
          >
            <View style={styles.kaartIconWrap}>
              <Ionicons name="server-outline" size={28} color="#FFFFFF" />
            </View>
            <View style={styles.kaartTextWrap}>
              <Text style={styles.kaartTitel}>Boeken</Text>
              <Text style={styles.kaartSub}>Server reserveren</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.kaartGroot}
            onPress={() => router.push("/boeking/mijnBoekingen")}
          >
            <View style={styles.kaartIconWrap}>
              <Ionicons name="folder-open-outline" size={28} color="#FFFFFF" />
            </View>
            <View style={styles.kaartTextWrap}>
              <Text style={styles.kaartTitel}>Mijn boekingen</Text>
              <Text style={styles.kaartSub}>Bekijke je boekingen</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
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
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 12,
    backgroundColor: "#0F0F1C",
    borderBottomWidth: 1,
    borderBottomColor: "#1E1E35",
  },
  topBarIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  topBarIconBtn: {
    padding: 4,
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
    paddingTop: 24,
    paddingBottom: 40,
  },
  label: {
    marginTop: 6,
    marginBottom: 28,
    color: "#8888AA",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  welcomeText: {
    marginTop: 12,
    marginBottom: 4,
    color: "#1B6CF2",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  kaartenRij: {
    flexDirection: "column",
    gap: 12,
  },
  kaartGroot: {
    backgroundColor: "#0F0F1C",
    borderWidth: 1,
    borderColor: "#1E1E35",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  kaartIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#1E1E35",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  kaartTextWrap: {
    flex: 1,
  },
  kaartTitel: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  kaartSub: {
    color: "#8888AA",
    fontSize: 12,
  },
});

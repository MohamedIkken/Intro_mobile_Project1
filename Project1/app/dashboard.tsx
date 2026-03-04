import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView } from "react-native";
import { router } from "expo-router";
import { useFonts, Orbitron_700Bold } from "@expo-google-fonts/orbitron";
import { ActivityIndicator } from "react-native";

export default function DashboardScreen() {
  const [fontsLoaded] = useFonts({
    Orbitron_700Bold,
  });

  if (!fontsLoaded) {
    return <ActivityIndicator />;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.glow} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.logo}>Playnode</Text>
        <Text style={styles.label}>Its gaming time! Lets gooooo!</Text>

        <View style={styles.kaartenRij}>
          <TouchableOpacity style={styles.kaartGroot} onPress={() => router.push("/mijnsessies")}>
            <Text style={styles.kaartIcon}>🎮</Text>
            <Text style={styles.kaartTitel}>Aanmaken</Text>
            <Text style={styles.kaartSub}>Nieuwe sessie starten</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.kaartGroot}>
            <Text style={styles.kaartIcon}>🖥️</Text>
            <Text style={styles.kaartTitel}>Boeken</Text>
            <Text style={styles.kaartSub}>Server reserveren</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.kaartGroot}>
            <Text style={styles.kaartIcon}>🔍</Text>
            <Text style={styles.kaartTitel}>Zoeken</Text>
            <Text style={styles.kaartSub}>Vind een bestaande sessie</Text>
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  logo: {
    fontSize: 38,
    textAlign: "left",
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 2,
    fontFamily: "Orbitron_700Bold",
    marginBottom: 6,
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
  kaartenRij: {
    flexDirection: "column",
    gap: 12,
    marginBottom: 12,
  },
  kaartGroot: {
    backgroundColor: "#0F0F1C",
    borderWidth: 1,
    borderColor: "#1E1E35",
    borderRadius: 16,
    padding: 20,
    minHeight: 140,
    justifyContent: "center",
    alignItems: "center",
  },
  kaartIcon: {
    fontSize: 28,
    marginBottom: 6,
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
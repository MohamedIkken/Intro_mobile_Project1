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

        <View style={styles.cirkelRij}>
          <View style={styles.cirkelContainer}>
            <TouchableOpacity style={styles.cirkel} onPress={() => router.push("/maaksessie")}/>
            <Text style={styles.cirkelText}>Aanmaken</Text>
          </View>

          <View style={styles.cirkelContainer}>
            <TouchableOpacity style={styles.cirkel}/>
            <Text style={styles.cirkelText}>Boeken</Text>
          </View>

          <View style={styles.cirkelContainer}>
            <TouchableOpacity style={styles.cirkel}/>
            <Text style={styles.cirkelText}>Zoeken</Text>
          </View>
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
    paddingHorizontal: 28,
    paddingTop: 40,
  },
  logo: {
    fontSize: 45,
    textAlign: "left",
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 2,
    fontFamily: "Orbitron_700Bold",
    marginBottom: 8,
  },
  label: {
    marginTop: 8,
    marginBottom: 20,
    color: "#8888AA",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  cirkelRij: {
    flexDirection: "row",
    justifyContent: "space-around",
    gap: 30, 
    marginBottom: 30,
  },
  cirkelContainer: {
    alignItems: "center",
  },
  cirkel: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#1B6CF2",
    shadowColor: "#1B6CF2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  cirkelText: {
    color: "#FFFFFF",
    fontWeight: "700",
    textAlign: "center",
    fontSize: 14,
    marginTop: 8,
  },
});
import { router } from "expo-router";
import { View, Text, TouchableOpacity, StyleSheet, TextInput, StatusBar } from "react-native";

export default function RegisterScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.glow} />

      <Text style={styles.title}>Sign up</Text>

      <Text style={styles.label}>E-mail</Text>
      <TextInput style={styles.textInput} placeholder="you@example.com" placeholderTextColor="#444466" keyboardType="email-address" autoCapitalize="none" />

      <Text style={styles.label}>Password</Text>
      <TextInput style={styles.textInput} placeholder="••••••••" placeholderTextColor="#444466" secureTextEntry />

      <TouchableOpacity style={styles.primaryButton}>
        <Text style={styles.primaryButtonText}>Sign up</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton} onPress={() => router.back()}>
        <Text style={styles.secondaryButtonText}>Back to sign in</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#08080F",
    paddingHorizontal: 28,
    justifyContent: "center",
  },
  glow: {
    position: "absolute",
    bottom: -100,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "#1B6CF2",
    opacity: 0.12,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 32,
    letterSpacing: 0.5,
  },
  label: {
    marginLeft: 4,
    marginTop: 18,
    marginBottom: 8,
    color: "#8888AA",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  textInput: {
    borderColor: "#1E1E35",
    borderWidth: 1,
    backgroundColor: "#0F0F1C",
    width: "100%",
    padding: 14,
    borderRadius: 10,
    color: "#FFFFFF",
    fontSize: 15,
  },
  primaryButton: {
    marginTop: 32,
    alignSelf: "center",
    width: "100%",
    backgroundColor: "#1B6CF2",
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: "center",
    shadowColor: "#1B6CF2",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  secondaryButton: {
    marginTop: 14,
    alignSelf: "center",
    width: "100%",
    borderWidth: 1,
    borderColor: "#1E1E35",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#8888AA",
    fontSize: 15,
    fontWeight: "600",
  },
});
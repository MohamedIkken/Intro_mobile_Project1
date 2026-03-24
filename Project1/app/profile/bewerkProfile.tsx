import { View, Text, Button, TextInput, TouchableOpacity } from "react-native";
import { Label } from "@react-navigation/elements";
import { StyleSheet } from "react-native";
import { useState } from "react";
import { getAuth, updateProfile } from "firebase/auth";

export default function BewerkProfile() {
  const auth = getAuth();

  const [name, setName] = useState(auth.currentUser?.displayName || "");
  const [profielFoto, setProfielFoto] = useState(
    auth.currentUser?.photoURL || "",
  );

  updateProfile(auth.currentUser!, {
    displayName: name,
    photoURL: profielFoto,
  })
    .then(() => {
      // Profiel bijgewerkt
    })
    .catch((error) => {
      // Fout bij het bijwerken van het profiel
    });

  return (
    <View>
      <Text>Bewerk Profiel</Text>
      <Label>Naam:</Label>
      <TextInput placeholder="Naam" value={name} onChangeText={setName} />
      <Label>Profiel Foto:</Label>
      <TextInput
        placeholder="Profiel Foto"
        value={profielFoto}
        onChangeText={setProfielFoto}
      />
    </View>
  );
}

const styles = StyleSheet.create({
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

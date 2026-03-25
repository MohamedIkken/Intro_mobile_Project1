import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { getAuth, updateProfile } from "firebase/auth";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../firebaseConfig";

export default function BewerkProfile() {
  const auth = getAuth();

  const [name, setName] = useState(auth.currentUser?.displayName || "");
  const [showModal, setShowModal] = useState(false);
  const [profielFoto, setProfielFoto] = useState(
    auth.currentUser?.photoURL || "",
  );
  // image van mobiele telefoon halen
  const [uploading, setUploading] = useState(false);

  const uploadImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0,
    });

    if (!result.canceled) {
      setUploading(true);
      try {
        const uri = result.assets[0].uri;
        const response = await fetch(uri);
        const blob = await response.blob();

        const userId = auth.currentUser?.uid;
        const storageRef = ref(storage, `profilePhotos/${userId}`);
        await uploadBytes(storageRef, blob);
        const downloadURL = await getDownloadURL(storageRef);
        setProfielFoto(downloadURL);
      } catch (error) {
        console.error("Fout bij uploaden van afbeelding:", error);
      } finally {
        setUploading(false);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.glow} />

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.push("/profile/profile")}
      >
        <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        <Text style={styles.backButtonText}>Terug</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Bewerk Profiel</Text>

        <View style={styles.section}>
          <Text style={styles.label}>NAAM</Text>
          <View style={styles.inputCard}>
            <View style={styles.inputIconWrap}>
              <Ionicons name="person-outline" size={22} color="#FFFFFF" />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Naam"
              placeholderTextColor="#8888AA"
              value={name}
              onChangeText={setName}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>PROFIEL FOTO</Text>
          <TouchableOpacity
            style={styles.photoPickerCard}
            onPress={uploadImage}
            disabled={uploading}
          >
            {profielFoto ? (
              <Image source={{ uri: profielFoto }} style={styles.photoPreview} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Ionicons name="camera-outline" size={32} color="#8888AA" />
              </View>
            )}
            <View style={styles.photoTextWrap}>
              {uploading ? (
                <ActivityIndicator color="#1B6CF2" />
              ) : (
                <>
                  <Text style={styles.photoPickerText}>
                    {profielFoto ? "Foto wijzigen" : "Kies een foto"}
                  </Text>
                  <Text style={styles.photoPickerSubtext}>
                    Tik om een foto uit je filmrol te kiezen
                  </Text>
                </>
              )}
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.saveButton, uploading && { opacity: 0.5 }]}
          disabled={uploading}
          onPress={() => {
            updateProfile(auth.currentUser!, {
              displayName: name,
              photoURL: profielFoto,
            }).then(() => setShowModal(true));
          }}
        >
          <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
          <Text style={styles.saveButtonText}>Opslaan</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons name="checkmark-circle" size={48} color="#1B6CF2" />
            <Text style={styles.modalTitle}>Gelukt!</Text>
            <Text style={styles.modalText}>Profiel succesvol bijgewerkt.</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setShowModal(false);
                router.push("/profile/profile");
              }}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 32,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    color: "#8888AA",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  inputCard: {
    backgroundColor: "#0F0F1C",
    borderWidth: 1,
    borderColor: "#1E1E35",
    borderRadius: 16,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  inputIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#1E1E35",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  input: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "500",
  },
  photoPickerCard: {
    backgroundColor: "#0F0F1C",
    borderWidth: 1,
    borderColor: "#1E1E35",
    borderRadius: 16,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  photoPreview: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 14,
  },
  photoPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#1E1E35",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  photoTextWrap: {
    flex: 1,
    justifyContent: "center",
  },
  photoPickerText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "500",
  },
  photoPickerSubtext: {
    color: "#8888AA",
    fontSize: 12,
    marginTop: 2,
  },
  saveButton: {
    backgroundColor: "#1B6CF2",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#0F0F1C",
    borderWidth: 1,
    borderColor: "#1E1E35",
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    marginHorizontal: 40,
  },
  modalTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
    marginTop: 12,
    marginBottom: 4,
  },
  modalText: {
    color: "#8888AA",
    fontSize: 14,
    marginBottom: 24,
  },
  modalButton: {
    backgroundColor: "#1B6CF2",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 40,
  },
  modalButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});

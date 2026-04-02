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
import { useState, useEffect } from "react";
import { updateProfile } from "firebase/auth";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { useAuth } from "../context/AuthContext";

export default function BewerkProfile() {
  const { user } = useAuth();

  const [name, setName] = useState(user?.displayName || "");
  const [showModal, setShowModal] = useState(false);
  const [profielFoto, setProfielFoto] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [errorModal, setErrorModal] = useState<string | null>(null);

  useEffect(() => {
    const loadPhoto = async () => {
      if (!user?.uid) return;
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists() && snap.data().photoBase64) {
        setProfielFoto(snap.data().photoBase64);
      }
    };
    loadPhoto();
  }, [user]);

  const uploadImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0,
      base64: true,
    });

    if (!result.canceled) {
      const base64 = result.assets[0].base64;
      const photoDataUrl = `data:image/jpeg;base64,${base64}`;
      setProfielFoto(photoDataUrl);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      setUploading(true);
      await updateProfile(user, { displayName: name });
      await setDoc(
        doc(db, "users", user.uid),
        { name, photoBase64: profielFoto },
        { merge: true },
      );
      setShowModal(true);
    } catch {
      setErrorModal("Te groot bestand. Kies een foto van minder dan 1MB.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.glow} />

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={22} color="#8888AA" />
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
              <Image
                source={{ uri: profielFoto }}
                style={styles.photoPreview}
              />
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
          onPress={handleSave}
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
                router.back();
              }}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={errorModal !== null} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons name="alert-circle" size={48} color="#FF4C4C" />
            <Text style={styles.modalTitle}>Fout</Text>
            <Text style={styles.modalText}>{errorModal}</Text>
            <TouchableOpacity
              style={styles.errorModalButton}
              onPress={() => setErrorModal(null)}
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
    color: "#8888AA",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
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
  errorModalButton: {
    backgroundColor: "#FF4C4C",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 40,
  },
});

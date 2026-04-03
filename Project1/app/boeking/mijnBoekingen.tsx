import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Modal,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { fetchMijnBoekingen, annuleerBoeking, markeerAfgerond } from "./boekingService";
import { Boeking } from "./boekingTypes";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { formatTijd, formatDatum } from "./formatHelpers";

export default function MijnBoekingen() {
  const { user } = useAuth();

  const [actieveBoekingen, setActieveBoekingen] = useState<Boeking[]>([]);
  const [verlopenBoekingen, setVerlopenBoekingen] = useState<Boeking[]>([]);
  const [loading, setLoading] = useState(true);
  const [annuleerModal, setAnnuleerModal] = useState<string | null>(null);

  const loadBoekingen = async () => {
    if (!user) return;
    try {
      const data = await fetchMijnBoekingen(user.uid);

      // Verlopen boekingen in Firebase als afgerond markeren
      const teMarkeren = data.filter(
        (b) => b.status === "geboekt" && b.eindeTijd < new Date(),
      );
      await Promise.all(teMarkeren.map((b) => markeerAfgerond(b.id)));

      // Status lokaal bijwerken voor net-gemarkeerde boekingen
      const bijgewerkt = data.map((b) => ({
        ...b,
        status:
          b.status === "geboekt" && b.eindeTijd < new Date()
            ? ("afgerond" as const)
            : b.status,
      }));

      // Splits in actief en verlopen
      setActieveBoekingen(
        bijgewerkt
          .filter((b) => b.status === "geboekt")
          .sort((a, b) => a.startTijd.getTime() - b.startTijd.getTime()),
      );
      setVerlopenBoekingen(
        bijgewerkt
          .filter((b) => b.status === "afgerond" || b.status === "geannuleerd")
          .sort((a, b) => b.startTijd.getTime() - a.startTijd.getTime()),
      );
    } catch (error) {
      console.error("Fout bij het laden van boekingen:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBoekingen();

    // Herlaad elke 30 seconden zodat verlopen boekingen live verplaatst worden
    const interval = setInterval(() => {
      loadBoekingen();
    }, 30_000);

    return () => clearInterval(interval);
  }, [user]);

  const handleAnnuleer = async () => {
    if (!annuleerModal) return;
    try {
      await annuleerBoeking(annuleerModal);
      setAnnuleerModal(null);
      await loadBoekingen();
    } catch (error) {
      console.error("Fout bij het annuleren van de boeking:", error);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" />

      <TouchableOpacity
        style={s.backButton}
        onPress={() => router.back()}
      >
        <Ionicons name="chevron-back" size={22} color="#8888AA" />
        <Text style={s.backButtonText}>Terug</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={s.scroll}>
        <View style={s.header}>
          <Text style={s.headerLabel}>Overzicht</Text>
          <Text style={s.headerTitle}>Mijn Boekingen</Text>
        </View>

        {loading ? (
          <ActivityIndicator color="#2E6BFF" style={{ marginVertical: 40 }} />
        ) : actieveBoekingen.length === 0 && verlopenBoekingen.length === 0 ? (
          <Text style={s.leegTekst}>Je hebt geen boekingen.</Text>
        ) : (
          <>
            {actieveBoekingen.length > 0 && (
              <>
                <Text style={s.sectieTitel}>Actief</Text>
                {actieveBoekingen.map((boeking) => (
                  <View key={boeking.id} style={s.kaart}>
                    <View style={s.kaartHeader}>
                      <View style={s.kaartIconWrap}>
                        <Ionicons name="server-outline" size={20} color="#FFFFFF" />
                      </View>
                      <Text style={s.serverNaam}>{boeking.serverNaam}</Text>
                      <View style={s.statusBadge}>
                        <Text style={s.statusTekst}>{boeking.status}</Text>
                      </View>
                    </View>
                    <View style={s.kaartDetails}>
                      <View style={s.detailRij}>
                        <Text style={s.detailLabel}>Datum</Text>
                        <Text style={s.detailWaarde}>
                          {formatDatum(boeking.startTijd)}
                        </Text>
                      </View>
                      <View style={s.detailRij}>
                        <Text style={s.detailLabel}>Tijd</Text>
                        <Text style={s.detailWaarde}>
                          {formatTijd(boeking.startTijd)} –{" "}
                          {formatTijd(boeking.eindeTijd)}
                        </Text>
                      </View>
                      <View style={[s.detailRij, { borderBottomWidth: 0 }]}>
                        <Text style={s.detailLabel}>Doel</Text>
                        <Text style={s.detailWaarde}>{boeking.doel}</Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={s.annuleerKnop}
                      onPress={() => setAnnuleerModal(boeking.id)}
                    >
                      <Text style={s.annuleerTekst}>Boeking annuleren</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </>
            )}

            {verlopenBoekingen.length > 0 && (
              <>
                <Text style={s.sectieTitel}>Geschiedenis</Text>
                {verlopenBoekingen.map((boeking) => (
                  <View key={boeking.id} style={[s.kaart, s.kaartVerlopen]}>
                    <View style={s.kaartHeader}>
                      <View style={[s.kaartIconWrap, s.kaartIconWrapVerlopen]}>
                        <Ionicons name="server-outline" size={20} color="#8888AA" />
                      </View>
                      <Text style={[s.serverNaam, s.serverNaamVerlopen]}>
                        {boeking.serverNaam}
                      </Text>
                      <View
                        style={[
                          s.statusBadge,
                          boeking.status === "geannuleerd" && s.statusGeannuleerd,
                          boeking.status === "afgerond" && s.statusAfgerond,
                        ]}
                      >
                        <Text style={s.statusTekst}>{boeking.status}</Text>
                      </View>
                    </View>
                    <View style={s.kaartDetails}>
                      <View style={s.detailRij}>
                        <Text style={s.detailLabel}>Datum</Text>
                        <Text style={s.detailWaarde}>
                          {formatDatum(boeking.startTijd)}
                        </Text>
                      </View>
                      <View style={s.detailRij}>
                        <Text style={s.detailLabel}>Tijd</Text>
                        <Text style={s.detailWaarde}>
                          {formatTijd(boeking.startTijd)} –{" "}
                          {formatTijd(boeking.eindeTijd)}
                        </Text>
                      </View>
                      <View style={[s.detailRij, { borderBottomWidth: 0 }]}>
                        <Text style={s.detailLabel}>Doel</Text>
                        <Text style={s.detailWaarde}>{boeking.doel}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </>
            )}
          </>
        )}
      </ScrollView>

      <Modal transparent visible={annuleerModal !== null} animationType="fade">
        <View style={s.modalOverlay}>
          <View style={s.modalKaart}>
            <Text style={s.modalTitel}>Boeking annuleren</Text>
            <Text style={s.modalTekst}>
              Weet je zeker dat je deze boeking wilt annuleren?
            </Text>
            <View style={s.modalKnoppen}>
              <TouchableOpacity
                style={s.modalAnnuleer}
                onPress={() => setAnnuleerModal(null)}
              >
                <Text style={s.modalAnnuleerTekst}>Nee, terug</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={s.modalBevestig}
                onPress={handleAnnuleer}
              >
                <Text style={s.modalBevestigTekst}>Ja, annuleren</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0B0B12" },
  scroll: { padding: 20, paddingBottom: 60 },

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

  sectieTitel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#8888AA",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 10,
    marginTop: 8,
  },

  header: { marginBottom: 20 },
  headerLabel: {
    fontSize: 12,
    color: "#8888AA",
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  headerTitle: { fontSize: 28, fontWeight: "bold", color: "#FFFFFF" },

  leegTekst: {
    color: "#8888AA",
    fontSize: 13,
    textAlign: "center",
    paddingVertical: 40,
  },

  kaart: {
    backgroundColor: "#131320",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1E1E30",
    marginBottom: 12,
    overflow: "hidden",
  },
  kaartHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#1E1E30",
  },
  kaartIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#1E1E35",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  serverNaam: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: "rgba(46, 107, 255, 0.15)",
  },
  statusGeannuleerd: {
    backgroundColor: "rgba(255, 76, 76, 0.15)",
  },
  statusAfgerond: {
    backgroundColor: "rgba(74, 222, 128, 0.15)",
  },

  kaartVerlopen: {
    opacity: 0.6,
  },
  kaartIconWrapVerlopen: {
    backgroundColor: "#1A1A28",
  },
  serverNaamVerlopen: {
    color: "#8888AA",
  },
  statusTekst: {
    fontSize: 10,
    fontWeight: "700",
    color: "#8888AA",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  kaartDetails: { padding: 15 },
  detailRij: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#1E1E30",
  },
  detailLabel: { fontSize: 12, color: "#8888AA" },
  detailWaarde: { fontSize: 13, color: "#FFFFFF", fontWeight: "600" },

  annuleerKnop: {
    borderTopWidth: 1,
    borderTopColor: "#1E1E30",
    padding: 14,
    alignItems: "center",
  },
  annuleerTekst: {
    color: "#FF4C4C",
    fontSize: 13,
    fontWeight: "600",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalKaart: {
    backgroundColor: "#131320",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1E1E30",
    padding: 24,
    width: "85%",
    alignItems: "center",
  },
  modalTitel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  modalTekst: {
    fontSize: 13,
    color: "#8888AA",
    textAlign: "center",
    marginBottom: 24,
  },
  modalKnoppen: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  modalAnnuleer: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1E1E30",
    alignItems: "center",
  },
  modalAnnuleerTekst: {
    color: "#8888AA",
    fontWeight: "600",
  },
  modalBevestig: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 8,
    backgroundColor: "#FF4C4C",
    alignItems: "center",
  },
  modalBevestigTekst: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});

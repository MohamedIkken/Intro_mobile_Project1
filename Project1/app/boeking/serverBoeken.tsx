import { router } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { useBooking } from "./boekingContext";
import { StyleSheet } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Server, zoekFilters } from "./boekingTypes";
import { db } from "../../firebaseConfig";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { formatTijd, formatDatum } from "./formatHelpers";

const DUUR_OPTIES = [30, 60, 90, 120];

export default function ServerBoeken() {
  const {
    filters,
    slots,
    selectedSlot,
    loading,
    error,
    setFilters,
    searchAvailability,
    selectSlot,
    reserveSlot,
    clearError,
  } = useBooking();

  const { user } = useAuth();

  const [zoekterm, setZoekterm] = useState("");
  const [toonDatumPicker, setToonDatumPicker] = useState(false);
  const [doelTekst, setDoelTekst] = useState("");
  const [bevestigModal, setBevestigModal] = useState(false);
  const [geboektModal, setGeboektModal] = useState(false);
  const [servers, setServers] = useState<Server[]>([]);
  const [serversLoading, setServersLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      return () => {
        setFilters({ serverNaam: undefined, datum: undefined, duur: 60 });
        setZoekterm("");
        setDoelTekst("");
      };
    }, []),
  );

  useEffect(() => {
    const serversRef = collection(db, "servers");
    const q = query(serversRef, orderBy("naam", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const serverList: Server[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        naam: doc.data().naam,
        specs: doc.data().specs,
      }));
      setServers(serverList);
      setServersLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getServerBeschikbaarheid = (
    serverNaam: string,
  ): "Beschikbaar" | "Vol" => {
    if (!filters.datum) return "Beschikbaar";
    if (filters.serverNaam !== serverNaam) return "Beschikbaar";
    if (loading) return "Beschikbaar";

    const beschikbareSlots = slots.filter(
      (slot) => slot.beschikbaarheid === "beschikbaar",
    );
    return beschikbareSlots.length > 0 ? "Beschikbaar" : "Vol";
  };

  const gekozenServer = servers.find(
    (s: Server) => s.naam === filters.serverNaam,
  );

  const gefilterdeServers = servers.filter((s: Server) =>
    s.naam.toLowerCase().includes(zoekterm.toLowerCase()),
  );

  useEffect(() => {
    if (!filters.serverNaam || !filters.datum) return;
    const unsubscribe = searchAvailability();
    return () => unsubscribe?.();
  }, [filters.serverNaam, filters.datum, filters.duur]);

  const handleReserveer = async () => {
    setBevestigModal(false);
    await reserveSlot(user?.uid ?? "anoniem", doelTekst || "Geen omschrijving");
    setGeboektModal(true);
    setDoelTekst("");
  };

  const navigeerTerug = () => {
    router.back();
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" />

      <TouchableOpacity style={s.backButton} onPress={navigeerTerug}>
        <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        <Text style={s.backButtonText}>Terug</Text>
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={s.header}>
          <Text style={s.headerLabel}>Reservatie</Text>
          <Text style={s.headerTitle}>Server boeken</Text>
        </View>

        <View style={s.sectie}>
          <Text style={s.sectieLabel}>01 — Server</Text>

          <View style={s.zoekRij}>
            <Text style={s.zoekIconTekst}>⌕</Text>
            <TextInput
              style={s.zoekInput}
              placeholder="Zoek server..."
              placeholderTextColor="#8888AA"
              value={zoekterm}
              onChangeText={setZoekterm}
            />
            {zoekterm.length > 0 && (
              <TouchableOpacity onPress={() => setZoekterm("")}>
                <Text style={s.wisTekst}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {serversLoading ? (
            <ActivityIndicator color="#2E6BFF" style={{ marginVertical: 20 }} />
          ) : (
            <>
              {gefilterdeServers.map((srv: Server) => {
                const geselecteerd = filters.serverNaam === srv.naam;
                const beschikbaarheid = getServerBeschikbaarheid(srv.naam);
                const disabled =
                  filters.datum &&
                  !loading &&
                  filters.serverNaam === srv.naam &&
                  beschikbaarheid === "Vol";

                return (
                  <TouchableOpacity
                    key={srv.id}
                    style={[
                      s.serverKaart,
                      geselecteerd && s.serverKaartActief,
                      disabled && s.serverKaartDisabled,
                    ]}
                    onPress={() => {
                      if (geselecteerd) return;
                      const nieuweFilters: Partial<zoekFilters> = { serverNaam: srv.naam };
                      if (!filters.datum) {
                        nieuweFilters.datum = new Date();
                      }
                      setFilters(nieuweFilters);
                    }}
                    activeOpacity={disabled ? 1 : 0.75}
                  >
                    <View
                      style={[
                        s.serverDot,
                        beschikbaarheid === "Beschikbaar"
                          ? s.dotGroen
                          : beschikbaarheid === "Vol"
                            ? s.dotOranje
                            : s.dotGrijs,
                      ]}
                    />
                    <View style={s.serverInfo}>
                      <Text style={[s.serverNaam, disabled && s.dimTekst]}>
                        {srv.naam}
                      </Text>
                      <Text style={s.serverSpecs}>{srv.specs}</Text>
                    </View>
                    {geselecteerd && <Text style={s.checkmark}>✓</Text>}
                    {!geselecteerd && !disabled && (
                      <Text style={s.pijlTekst}>›</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
              {gefilterdeServers.length === 0 && (
                <Text style={s.leegTekst}>Geen servers gevonden</Text>
              )}
            </>
          )}
        </View>

        {gekozenServer && (
          <View style={s.sectie}>
            <Text style={s.sectieLabel}>02 — Datum & Duur</Text>

            <TouchableOpacity
              style={s.datumKnop}
              onPress={() => setToonDatumPicker(true)}
            >
              <Ionicons name="calendar-outline" size={18} color="#8888AA" style={s.datumIcon} />
              <Text style={s.datumTekst}>
                {filters.datum ? formatDatum(filters.datum) : "Kies een datum"}
              </Text>
              <Text style={s.pijlTekst}>›</Text>
            </TouchableOpacity>

            {toonDatumPicker && (
              <DateTimePicker
                value={filters.datum ?? new Date()}
                mode="date"
                minimumDate={new Date()}
                display={Platform.OS === "ios" ? "inline" : "default"}
                onChange={(_, datum) => {
                  setToonDatumPicker(false);
                  if (datum) setFilters({ datum });
                }}
              />
            )}

            <View style={s.duurRij}>
              {DUUR_OPTIES.map((min) => (
                <TouchableOpacity
                  key={min}
                  style={[s.duurKnop, filters.duur === min && s.duurKnopActief]}
                  onPress={() => setFilters({ duur: min })}
                >
                  <Text
                    style={[
                      s.duurTekst,
                      filters.duur === min && s.duurTekstActief,
                    ]}
                  >
                    {min}m
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {gekozenServer && filters.datum && (
          <View style={s.sectie}>
            <Text style={s.sectieLabel}>03 — Tijdslot</Text>

            {loading && (
              <ActivityIndicator
                color="#2E6BFF"
                style={{ marginVertical: 20 }}
              />
            )}

            {!loading && slots.length === 0 && (
              <Text style={s.leegTekst}>
                Geen slots beschikbaar voor deze dag.
              </Text>
            )}

            {!loading && (
              <View style={s.slotsGrid}>
                {slots.map((slot) => {
                  const bezet = slot.beschikbaarheid === "bezet";
                  const actief = selectedSlot?.id === slot.id;
                  const slotVoorbijHuidigeTijd =
                    new Date(slot.startTijd) < new Date();
                  return (
                    <TouchableOpacity
                      key={slot.id}
                      style={[
                        s.slotKnop,
                        actief && s.slotKnopActief,
                        bezet && s.slotKnopBezet && s.slotKnopDisabled,
                        slotVoorbijHuidigeTijd && s.slotKnopDisabled,
                      ]}
                      onPress={() => !bezet && selectSlot(slot)}
                      disabled={bezet || slotVoorbijHuidigeTijd}
                      activeOpacity={bezet ? 1 : 0.75}
                    >
                      <Text
                        style={[
                          s.slotTijd,
                          actief && s.slotTijdActief,
                          bezet && s.dimTekst,
                        ]}
                      >
                        {formatTijd(slot.startTijd)}
                      </Text>
                      <Text style={[s.slotStatus, bezet && s.slotStatusBezet]}>
                        {bezet
                          ? "bezet"
                          : actief
                            ? "gekozen"
                            : slotVoorbijHuidigeTijd
                              ? "voorbij"
                              : "beschikbaar"}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        )}

        {selectedSlot && (
          <View style={s.sectie}>
            <Text style={s.sectieLabel}>04 — Bevestig</Text>

            <View style={s.samenvattingKaart}>
              <Rij label="Server" waarde={gekozenServer?.naam ?? ""} />
              <Rij label="Datum" waarde={formatDatum(selectedSlot.startTijd)} />
              <Rij label="Van" waarde={formatTijd(selectedSlot.startTijd)} />
              <Rij label="Tot" waarde={formatTijd(selectedSlot.eindeTijd)} />
            </View>

            <TextInput
              style={s.doelInput}
              placeholder="Doel / omschrijving (optioneel)"
              placeholderTextColor="#8888AA"
              value={doelTekst}
              onChangeText={setDoelTekst}
              multiline
            />

            <TouchableOpacity
              style={s.boekKnop}
              onPress={() => setBevestigModal(true)}
            >
              <Text style={s.boekKnopTekst}>Reserveer slot</Text>
            </TouchableOpacity>
          </View>
        )}

        {error && (
          <TouchableOpacity style={s.errorBalk} onPress={clearError}>
            <Text style={s.errorTekst}>{error} — tik om te sluiten</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <Modal transparent visible={bevestigModal} animationType="fade">
        <View style={s.modalOverlay}>
          <View style={s.modalKaart}>
            <Text style={s.modalTitel}>Bevestig reservatie</Text>
            <Text style={s.modalTekst}>
              {gekozenServer?.naam} van{" "}
              {selectedSlot ? formatTijd(selectedSlot.startTijd) : ""} tot{" "}
              {selectedSlot ? formatTijd(selectedSlot.eindeTijd) : ""}
            </Text>
            <View style={s.modalKnoppen}>
              <Pressable
                style={s.modalAnnuleer}
                onPress={() => setBevestigModal(false)}
              >
                <Text style={s.modalAnnuleerTekst}>Annuleer</Text>
              </Pressable>
              <Pressable style={s.modalBevestig} onPress={handleReserveer}>
                <Text style={s.modalBevestigTekst}>Bevestig</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={geboektModal} animationType="fade">
        <View style={s.modalOverlay}>
          <View style={s.modalKaart}>
            <Ionicons name="checkmark-circle" size={48} color="#4ade80" />
            <Text style={s.modalTitel}>Geboekt!</Text>
            <Text style={s.modalTekst}>Je reservatie is bevestigd.</Text>
            <Pressable
              style={s.geboektSluitKnop}
              onPress={() => setGeboektModal(false)}
            >
              <Text style={s.geboektSluitTekst}>OK</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function Rij({ label, waarde }: { label: string; waarde: string }) {
  return (
    <View style={s.samenvattingRij}>
      <Text style={s.samenvattingLabel}>{label}</Text>
      <Text style={s.samenvattingWaarde}>{waarde}</Text>
    </View>
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
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 6,
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

  sectie: { marginTop: 20 },
  sectieLabel: {
    fontSize: 12,
    color: "#8888AA",
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 10,
  },

  zoekRij: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#131320",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1E1E30",
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 10,
  },
  zoekIconTekst: { fontSize: 18, color: "#8888AA", marginRight: 8 },
  zoekInput: { flex: 1, fontSize: 16, color: "#FFFFFF" },
  wisTekst: { fontSize: 13, color: "#8888AA", paddingLeft: 8 },

  serverKaart: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#131320",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1E1E30",
    padding: 15,
    marginBottom: 8,
  },
  serverKaartActief: {
    borderColor: "#2E6BFF",
    backgroundColor: "rgba(46, 107, 255, 0.1)",
  },
  serverKaartDisabled: { opacity: 0.35 },
  serverDot: { width: 8, height: 8, borderRadius: 4, marginRight: 12 },
  dotGroen: { backgroundColor: "#4ade80" },
  dotOranje: { backgroundColor: "#fb923c" },
  dotGrijs: { backgroundColor: "#8888AA" },
  serverInfo: { flex: 1 },
  serverNaam: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  serverSpecs: { fontSize: 11, color: "#8888AA" },
  checkmark: { fontSize: 16, color: "#2E6BFF", fontWeight: "bold" },
  pijlTekst: { fontSize: 20, color: "#8888AA" },
  dimTekst: { color: "#8888AA" },
  leegTekst: {
    color: "#8888AA",
    fontSize: 13,
    textAlign: "center",
    paddingVertical: 20,
  },

  datumKnop: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#131320",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1E1E30",
    padding: 15,
    marginBottom: 12,
  },
  datumIcon: { marginRight: 10 },
  datumTekst: { flex: 1, fontSize: 16, color: "#FFFFFF" },

  duurRij: { flexDirection: "row", gap: 10 },
  duurKnop: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1E1E30",
    alignItems: "center",
    backgroundColor: "#131320",
  },
  duurKnopActief: {
    borderColor: "#2E6BFF",
    backgroundColor: "rgba(46, 107, 255, 0.1)",
  },
  duurTekst: { fontSize: 14, color: "#8888AA", fontWeight: "600" },
  duurTekstActief: { color: "#FFFFFF", fontWeight: "bold" },

  slotsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  slotKnop: {
    width: "23%",
    aspectRatio: 1.2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1E1E30",
    backgroundColor: "#131320",
    alignItems: "center",
    justifyContent: "center",
  },
  slotKnopActief: {
    borderColor: "#2E6BFF",
    backgroundColor: "rgba(46, 107, 255, 0.1)",
  },
  slotKnopBezet: {
    backgroundColor: "#0F0F1A",
    borderColor: "#1E1E30",
    opacity: 0.4,
  },
  slotTijd: { fontSize: 13, fontWeight: "bold", color: "#FFFFFF" },
  slotTijdActief: { color: "#FFFFFF" },
  slotStatus: {
    fontSize: 9,
    color: "#2E6BFF",
    marginTop: 3,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  slotStatusBezet: { color: "#8888AA" },

  samenvattingKaart: {
    backgroundColor: "#131320",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1E1E30",
    padding: 16,
    marginBottom: 12,
  },
  samenvattingRij: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#1E1E30",
  },
  samenvattingLabel: { fontSize: 12, color: "#8888AA" },
  samenvattingWaarde: { fontSize: 13, color: "#FFFFFF", fontWeight: "600" },

  doelInput: {
    backgroundColor: "#131320",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1E1E30",
    padding: 15,
    color: "#FFFFFF",
    fontSize: 16,
    minHeight: 60,
    marginBottom: 14,
    textAlignVertical: "top",
  },

  boekKnop: {
    backgroundColor: "#2E6BFF",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  boekKnopTekst: { fontSize: 16, fontWeight: "bold", color: "#FFFFFF" },

  errorBalk: {
    marginTop: 16,
    backgroundColor: "#1A0F0F",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FF4C4C",
    padding: 14,
  },
  errorTekst: { color: "#FF4C4C", fontSize: 12, fontWeight: "bold" },

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
  modalKnoppen: { flexDirection: "row", gap: 10, width: "100%" },
  modalAnnuleer: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1E1E30",
    alignItems: "center",
  },
  modalAnnuleerTekst: { color: "#8888AA", fontWeight: "600" },
  modalBevestig: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 8,
    backgroundColor: "#2E6BFF",
    alignItems: "center",
  },
  modalBevestigTekst: { color: "#FFFFFF", fontWeight: "bold" },
  geboektSluitKnop: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#1E1E30",
    alignItems: "center",
  },
  geboektSluitTekst: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },

  slotKnopDisabled: { opacity: 0.4 },
});

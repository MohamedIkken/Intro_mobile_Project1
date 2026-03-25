import { use, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Modal, Pressable } from "react-native";
import { useSessionContext, Session } from "./SessionContext";
import { router } from "expo-router";
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from "@expo/vector-icons";
import { ScrollView } from "react-native";
import { auth } from "@/firebaseConfig";



const beschikbareMaps = ["Nuketown", "Rust", "Shipment", "Crash"]; // deze zou je eigenlijk uit je context moeten halen, maar voor nu is dit prima

export default function MaakSessie() {
    const { addSession } = useSessionContext();

    const [mapName, setMapName] = useState("");

    const [date, setDate] = useState(new Date());
    const [time, setTime] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    const [minLevel, setMinLevel] = useState("");
    const [maxLevel, setMaxLevel] = useState("");
    const [ongeldigeMinLevel, setOngeldigeMinLevel] = useState(false);
    const [ongeldigeMaxLevel, setOngeldigeMaxLevel] = useState(false);

    const [isCompetitive, setIsCompetitive] = useState(false);

    const [sessionType, setSessionType] = useState("match");
    const [serverKey, setServerKey] = useState("");

    const [toonModal, setToonModal] = useState(false);

    const handleOpslaan = () => {
        if (mapName === "" || minLevel === "" || maxLevel === "") {
            Alert.alert("Fout", "Vul alle velden in.");
            return;
        }

        if (sessionType === "practice" && serverKey === "") {
            Alert.alert("Fout", "Een Practice (Privé) sessie heeft een Server Key nodig.");
            return;
        }

        if (parseFloat(minLevel) > parseFloat(maxLevel)) {
            Alert.alert("Minimum level kan niet hoger zijn dan maximum level.");
            return;
        }
        var nieuweSessieData: any = {
            hostId: auth.currentUser?.uid || "onbekende_host",
            players: [auth.currentUser?.uid || "onbekende_host"], // Bij wijzigen gaan we er even van uit dat de host altijd in de sessie blijft, dit is een vereenvoudiging
            mapName,
            date: date.toISOString().split('T')[0], // Opslaan als YYYY-MM-DD, deze is gevaarlijk omdat het tijdzone issues kan geven, en kan 1 dag terug zetten afhankelijk van de tijdzone van de gebruiker
            time: time.toTimeString().split(' ')[0].slice(0, 5), // Opslaan als HH:MM
            minLevel: parseFloat(minLevel),
            maxLevel: parseFloat(maxLevel),
            isCompetitive,
            sessionType,
        };

        if (sessionType === "practice") {
            nieuweSessieData.serverKey = serverKey;
            nieuweSessieData.status = "open";
            nieuweSessieData.teamA = [auth.currentUser?.uid || "onbekende_host"];
            nieuweSessieData.teamB = [];
        }

        addSession(nieuweSessieData);
        setToonModal(true);
    };

    const navigeerTerug = () => {
        setToonModal(false);
        router.push("/dashboard");
    }

    const onChangeDate = (event: any, selectedDate: Date | undefined) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setDate(selectedDate);
        }
    }

    const onChangeTime = (event: any, selectedTime: Date | undefined) => {
        setShowTimePicker(false);
        if (selectedTime) {
            setTime(selectedTime);
        }
    }

    const verwerkMaxLevelInput = (input: string) => {
        if (input === "" || (parseFloat(input) >= 0.5 && parseFloat(input) <= 7.0)) {
            setOngeldigeMaxLevel(false);
            setMaxLevel(input);
        } else
            setOngeldigeMaxLevel(true);
    }

    const verwerkMinLevelInput = (input: string) => {
        if (input === "" || (parseFloat(input) >= 0.5 && parseFloat(input) <= 7.0)) {
            setOngeldigeMinLevel(false);
            setMinLevel(input);
        } else
            setOngeldigeMinLevel(true);
    }

    // ... [Je bestaande variabelen en functies blijven exact hetzelfde] ...

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>

            <TouchableOpacity style={styles.backButton} onPress={navigeerTerug}>
                <Ionicons name="chevron-back" size={22} color="#8888AA" />
                <Text style={styles.backButtonText}>Terug</Text>
            </TouchableOpacity>

            <Text style={styles.pageTitle}>Nieuwe Sessie</Text>

            <Text style={styles.sectionTitle}>WELKE MAP (CLUB)</Text>
            <View style={styles.row}>
                {beschikbareMaps.map((mapOptie) => (
                    <TouchableOpacity
                        key={mapOptie}
                        style={[styles.choiceButton, mapName === mapOptie && styles.choiceButtonSelected]}
                        onPress={() => setMapName(mapOptie)}
                    >
                        <Text style={[styles.choiceText, mapName === mapOptie && styles.choiceTextSelected]}>
                            {mapOptie}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text style={styles.sectionTitle}>DATUM & TIJD</Text>
            <View style={styles.row}>
                <TouchableOpacity style={styles.inputButton} onPress={() => setShowDatePicker(true)}>
                    <Text style={styles.inputText}>{date.toLocaleDateString()}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.inputButton} onPress={() => setShowTimePicker(true)}>
                    <Text style={styles.inputText}>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                </TouchableOpacity>
            </View>

            {showDatePicker && (
                <DateTimePicker value={date} mode="date" display="inline" onChange={onChangeDate} />
            )}
            {showTimePicker && (
                <DateTimePicker value={time} mode="time" display="spinner" onChange={onChangeTime} />
            )}

            <Text style={styles.sectionTitle}>TYPE WEDSTRIJD</Text>
            <View style={styles.row}>
                <TouchableOpacity
                    style={[styles.choiceButton, isCompetitive === true && styles.choiceButtonSelected, sessionType === "practice" && { opacity: 0.3, borderColor: "#1E1E30" }]}
                    onPress={() => setIsCompetitive(true)}
                    disabled={sessionType === "practice"} // Competitief uitschakelen als practice geselecteerd is
                >
                    <Text style={[styles.choiceText, isCompetitive === true && styles.choiceTextSelected]}>Competitief</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.choiceButton, isCompetitive === false && styles.choiceButtonSelected]}
                    onPress={() => setIsCompetitive(false)}
                >
                    <Text style={[styles.choiceText, isCompetitive === false && styles.choiceTextSelected]}>Vriendschappelijk</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>SOORT SESSIE</Text>
            <View style={styles.row}>
                <TouchableOpacity
                    style={[styles.choiceButton, sessionType === "match" && styles.choiceButtonSelected]}
                    onPress={() => setSessionType("match")}
                >
                    <Text style={[styles.choiceText, sessionType === "match" && styles.choiceTextSelected]}>Match (4p)</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.choiceButton, sessionType === "practice" && styles.choiceButtonSelected]}
                    onPress={() => {
                        setSessionType("practice");
                        setIsCompetitive(false); // Practice sessies zijn altijd vriendschappelijk
                    }}
                >
                    <Text style={[styles.choiceText, sessionType === "practice" && styles.choiceTextSelected]}>Practice (Privé)</Text>
                </TouchableOpacity>
            </View>

            {sessionType === "practice" && (
                <View style={{ marginTop: 10 }}>
                    <Text style={styles.sectionTitle}>SERVER KEY (WACHTWOORD)</Text>
                    <TextInput
                        style={styles.textInput}
                        value={serverKey}
                        placeholder="Vul de game server code in..."
                        placeholderTextColor="#444455"
                        onChangeText={setServerKey}
                    />
                </View>
            )}

            <Text style={styles.sectionTitle}>NIVEAU (0.5 - 7.0)</Text>
            <View style={styles.row}>
                <View style={styles.inputWrapper}>
                    <TextInput
                        style={styles.textInput}
                        value={minLevel}
                        placeholder="Min (bv. 2.0)"
                        placeholderTextColor="#444455"
                        keyboardType="numeric"
                        onChangeText={verwerkMinLevelInput}
                    />
                    {ongeldigeMinLevel && <Text style={styles.errorText}>Ongeldig</Text>}
                </View>

                <View style={styles.inputWrapper}>
                    <TextInput
                        style={styles.textInput}
                        value={maxLevel}
                        placeholder="Max (bv. 5.0)"
                        placeholderTextColor="#444455"
                        keyboardType="numeric"
                        onChangeText={verwerkMaxLevelInput}
                    />
                    {ongeldigeMaxLevel && <Text style={styles.errorText}>Ongeldig</Text>}
                </View>
            </View>

            <TouchableOpacity style={styles.primaryButton} onPress={handleOpslaan}>
                <Text style={styles.primaryButtonText}>Sessie Aanmaken</Text>
            </TouchableOpacity>

            <Modal transparent visible={toonModal} animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalKaart}>
                        <Text style={styles.modalTitel}>Sessie aangemakt</Text>
                        <Text style={styles.modalTekst}>Druk op ok om naar dashboard terug te keren</Text>
                        <View style={styles.modalKnoppen}>
                            <Pressable
                                style={styles.modalAnnuleer}
                                onPress={navigeerTerug}
                            >
                                <Text style={styles.modalAnnuleerTekst}>Ok</Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
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
        backgroundColor: "#2E6BFF",
        alignItems: "center",
    },
    modalBevestigTekst: {
        color: "#FFFFFF",
        fontWeight: "bold",
    },
    container: {
        flex: 1,
        backgroundColor: "#0B0B12", // Donkere Playnode achtergrond
    },
    scrollContent: {
        padding: 20,
        paddingTop: 40,
        paddingBottom: 60,
    },
    backButton: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
    },
    backButtonText: {
        color: "#8888AA",
        fontSize: 16,
        fontWeight: "bold",
        marginLeft: 4,
    },
    pageTitle: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginBottom: 20,
    },
    sectionTitle: {
        color: "#8888AA",
        fontSize: 12,
        fontWeight: "bold",
        letterSpacing: 1,
        marginTop: 20,
        marginBottom: 10,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 10, // Zorgt voor ruimte tussen elementen in een rij
    },
    choiceButton: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: "#131320",
        paddingVertical: 14,
        paddingHorizontal: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#1E1E30",
        alignItems: "center",
    },
    choiceButtonSelected: {
        borderColor: "#2E6BFF",
        backgroundColor: "rgba(46, 107, 255, 0.1)",
    },
    choiceText: {
        color: "#8888AA",
        fontWeight: "600",
        fontSize: 14,
    },
    choiceTextSelected: {
        color: "#FFFFFF",
        fontWeight: "bold",
    },
    inputButton: {
        flex: 1,
        backgroundColor: "#131320",
        padding: 15,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#1E1E30",
        alignItems: "center",
    },
    inputText: {
        color: "#FFFFFF",
        fontSize: 16,
    },
    inputWrapper: {
        flex: 1,
    },
    textInput: {
        backgroundColor: "#131320",
        color: "#FFFFFF",
        padding: 15,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#1E1E30",
        fontSize: 16,
    },
    errorText: {
        color: "#FF4C4C",
        fontSize: 12,
        marginTop: 4,
        fontWeight: "bold",
    },
    primaryButton: {
        backgroundColor: "#2E6BFF", // Playnode blauw
        padding: 16,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 40,
    },
    primaryButtonText: {
        color: "#FFFFFF",
        fontWeight: "bold",
        fontSize: 16,
    }
});
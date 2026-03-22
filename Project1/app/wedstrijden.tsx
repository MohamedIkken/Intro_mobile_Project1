import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal, TextInput } from "react-native";
import { router } from "expo-router";
import { Session, useSessionContext } from "./SessionContext";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import { auth } from "@/firebaseConfig";
import { useState } from "react";

export default function Wedstrijden() {
    const { sessions, joinSession } = useSessionContext();
    const userId = auth.currentUser?.uid;

    const [wachtwoordModalZichtbaar, setWachtwoordModalZichtbaar] = useState(false);
    const [geselecteerdeSessie, setGeselecteerdeSessie] = useState<Session | null>(null);
    const [ingevoerdeKey, setIngevoerdeKey] = useState("");

    // Filter States
    const [actieveLocatie, setActieveLocatie] = useState<string>("Alles");
    const [actiefType, setActiefType] = useState<string>("Alles");
    // Haal dynamisch alle unieke locaties uit de database op
    const uniekeLocaties = ["Alles", ...Array.from(new Set(sessions.map((s: Session) => s.mapName)))];

    const voegSpelerToeAanSessies = (sessionId: string) => {
        if (userId) {
            joinSession(sessionId, userId);
            Alert.alert("Succes", "Je doet nu mee aan deze wedstrijd!");
            router.push("/mijnsessies"); // ik moet nog hier iets checken. Ik denk dat nu de gebruiker de sessie die hij in zit kan zien in zijn sessies en dus ook verwijderen een aanpassen terwijl deze enkel mag door de eigenaar van de seesie.
        }
    };

    const handleJoin = (session: Session) => {
        if (!userId) {
            Alert.alert("Fout", "Je moet ingelogd zijn om mee te doen aan een wedstrijd.");
            return;
        }

        if (session.sessionType === 'practice') {
            setGeselecteerdeSessie(session);
            setIngevoerdeKey("");
            setWachtwoordModalZichtbaar(true);
            return;
        }

        voegSpelerToeAanSessies(session.id);
    };

    const bevestigWachtwoord = () => {
        if (geselecteerdeSessie && ingevoerdeKey === geselecteerdeSessie.serverKey) {
            setWachtwoordModalZichtbaar(false);
            voegSpelerToeAanSessies(geselecteerdeSessie.id);
        } else {
            Alert.alert("Fout", "Onjuist wachtwoord.");
        }
    };

    const navigeerTerug = () => {
        router.push("/dashboard");
    };

    // filter methode: eerst filteren op basis van locatie en type, daarna sorteren op datum en tijd
    const beschikbareSessies = sessions.filter((session: Session) => {
        const zitGebruikerErAlIn = userId ? session.players.includes(userId) : false;
        const isVol = session.players.length >= 4;

        // Basis check: filter eigen en volle sessies eruit
        if (zitGebruikerErAlIn || isVol) return false;

        // Locatie filter
        if (actieveLocatie !== "Alles" && session.mapName !== actieveLocatie) return false;

        // Type filter
        if (actiefType === "Competitief" && !session.isCompetitive) return false;
        if (actiefType === "Vriendschappelijk" && session.isCompetitive) return false;

        return true;
    }).sort((a: Session, b: Session) => {
        // Sorteer op datum en tijd
        return new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime();
    });

    return (
        <View>
            <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
                <TouchableOpacity style={styles.backButton} onPress={navigeerTerug}>
                    <Ionicons name="chevron-back" size={22} color="#8888AA" />
                    <Text style={styles.backButtonText}>Terug</Text>
                </TouchableOpacity>

                <Text style={styles.title}>Zoek Wedstrijden</Text>

                {/* Filters Sectie */}
                <View style={styles.filterSection}>
                    <Text style={styles.filterLabel}>Type:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                        {["Alles", "Competitief", "Vriendschappelijk"].map((type) => (
                            <TouchableOpacity
                                key={type}
                                style={[styles.filterChip, actiefType === type && styles.filterChipActive]}
                                onPress={() => setActiefType(type)}
                            >
                                <Text style={[styles.filterText, actiefType === type && styles.filterTextActive]}>{type}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <Text style={styles.filterLabel}>Locatie:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                        {uniekeLocaties.map((locatie) => (
                            <TouchableOpacity
                                key={locatie as string}
                                style={[styles.filterChip, actieveLocatie === locatie && styles.filterChipActive]}
                                onPress={() => setActieveLocatie(locatie as string)}
                            >
                                <Text style={[styles.filterText, actieveLocatie === locatie && styles.filterTextActive]}>{locatie as string}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <View>
                    {beschikbareSessies.length === 0 ? (
                        <Text style={styles.emptyText}>Er zijn momenteel geen wedstrijden beschikbaar.</Text>
                    ) : (
                        beschikbareSessies.map((session: Session) => (
                            <View key={session.id} style={styles.card}>

                                {/* Header: Map & Badges */}
                                <View style={styles.cardHeader}>
                                    <Text style={styles.gameTitle}>{session.mapName}</Text>
                                    <View style={styles.badgeContainer}>
                                        <View style={[styles.badge, session.sessionType === 'match' ? styles.badgeMatch : styles.badgePractice]}>
                                            <Text style={styles.badgeText}>
                                                {session.sessionType === 'match' ? 'Match' : 'Practice'}
                                            </Text>
                                        </View>
                                        {session.isCompetitive && (
                                            <View style={styles.badgeComp}>
                                                <Text style={styles.badgeTextComp}>Competitief</Text>
                                            </View>
                                        )}
                                    </View>
                                </View>

                                <View style={styles.divider} />

                                {/* Details met iconen */}
                                <View style={styles.detailRow}>
                                    <Ionicons name="calendar-outline" size={16} color="#8888AA" />
                                    <Text style={styles.detailText}>{session.date} om {session.time}</Text>
                                </View>

                                <View style={styles.detailRow}>
                                    <Ionicons name="bar-chart-outline" size={16} color="#8888AA" />
                                    <Text style={styles.detailText}>Level: {session.minLevel} - {session.maxLevel}</Text>
                                </View>

                                <View style={styles.detailRow}>
                                    <Ionicons name="people-outline" size={16} color="#8888AA" />
                                    <Text style={styles.detailText}>Spelers: {session.players.length} / 4</Text>
                                </View>

                                {/* Actieknop */}
                                <TouchableOpacity
                                    style={styles.joinButton}
                                    onPress={() => handleJoin(session)}
                                >
                                    <Text style={styles.joinButtonText}>Meedoen</Text>
                                </TouchableOpacity>
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>


            <Modal visible={wachtwoordModalZichtbaar} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Privé Sessie</Text>
                        <Text style={styles.modalSubtitle}>Voer de Server Key in om mee te doen:</Text>

                        <TextInput
                            style={styles.modalInput}
                            value={ingevoerdeKey}
                            onChangeText={setIngevoerdeKey}
                            placeholder="Wachtwoord..."
                            placeholderTextColor="#444455"
                            autoCapitalize="none"
                        />

                        <View style={styles.modalButtonGroup}>
                            <TouchableOpacity
                                style={styles.modalCancelButton}
                                onPress={() => setWachtwoordModalZichtbaar(false)}
                            >
                                <Text style={styles.modalCancelText}>Annuleren</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.modalSubmitButton}
                                onPress={bevestigWachtwoord}
                            >
                                <Text style={styles.modalSubmitText}>Bevestigen</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    )
}


const styles = StyleSheet.create({
    filterSection: {
        marginBottom: 16,
    },
    filterLabel: {
        color: "#8888AA",
        fontSize: 14,
        fontWeight: "bold",
        marginBottom: 8,
        marginTop: 8,
    },
    filterScroll: {
        flexDirection: "row",
        marginBottom: 8,
    },
    filterChip: {
        backgroundColor: "#131320",
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginRight: 10,
        borderWidth: 1,
        borderColor: "#1E1E30",
    },
    filterChipActive: {
        backgroundColor: "#1B6CF2",
        borderColor: "#1B6CF2",
    },
    filterText: {
        color: "#8888AA",
        fontSize: 14,
        fontWeight: "bold",
    },
    filterTextActive: {
        color: "#FFFFFF",
    },
    container: {
        flex: 1,
        backgroundColor: "#0B0B12",
    },
    scrollContent: {
        padding: 20,
        paddingTop: 60,
        paddingBottom: 40,
    },
    backButton: {
        marginBottom: 20,
        alignSelf: "flex-start",
        flexDirection: "row",
        alignItems: "center",
    },
    backButtonText: {
        color: "#8888AA",
        fontSize: 16,
        fontWeight: "bold",
        marginLeft: 4,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: "#8888AA",
        marginBottom: 24,
    },
    emptyText: {
        color: "#8888AA",
        fontSize: 14,
        textAlign: "center",
        marginTop: 40,
    },
    card: {
        backgroundColor: "#131320",
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#1E1E30",
        padding: 16,
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    gameTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#FFFFFF",
    },
    badgeContainer: {
        flexDirection: "row",
        gap: 6,
    },
    badge: {
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 6,
    },
    badgeMatch: {
        backgroundColor: "rgba(46, 107, 255, 0.15)",
    },
    badgePractice: {
        backgroundColor: "rgba(136, 136, 170, 0.15)",
    },
    badgeText: {
        fontSize: 10,
        fontWeight: "bold",
        color: "#2E6BFF",
        textTransform: "uppercase",
    },
    badgeComp: {
        backgroundColor: "rgba(229, 57, 53, 0.15)",
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 6,
    },
    badgeTextComp: {
        fontSize: 10,
        fontWeight: "bold",
        color: "#E53935",
        textTransform: "uppercase",
    },
    divider: {
        height: 1,
        backgroundColor: "#1E1E30",
        marginBottom: 12,
    },
    detailRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
        gap: 8,
    },
    detailText: {
        fontSize: 14,
        color: "#AAAAAA",
        fontWeight: "500",
    },
    joinButton: {
        backgroundColor: "#2E6BFF",
        padding: 14,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 12,
    },
    joinButtonText: {
        color: "#FFFFFF",
        fontWeight: "bold",
        fontSize: 16,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    modalContent: {
        backgroundColor: "#131320",
        width: "100%",
        borderRadius: 12,
        padding: 24,
        borderWidth: 1,
        borderColor: "#1E1E30",
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginBottom: 8,
    },
    modalSubtitle: {
        fontSize: 14,
        color: "#8888AA",
        marginBottom: 20,
    },
    modalInput: {
        backgroundColor: "#0B0B12",
        color: "#FFFFFF",
        padding: 14,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#1E1E30",
        fontSize: 16,
        marginBottom: 24,
    },
    modalButtonGroup: {
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: 12,
    },
    modalCancelButton: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        justifyContent: "center",
    },
    modalCancelText: {
        color: "#8888AA",
        fontSize: 16,
        fontWeight: "bold",
    },
    modalSubmitButton: {
        backgroundColor: "#2E6BFF",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        justifyContent: "center",
    },
    modalSubmitText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "bold",
    },
});
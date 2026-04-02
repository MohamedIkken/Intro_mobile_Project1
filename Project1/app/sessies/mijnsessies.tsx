import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal, Pressable } from "react-native";
import { router } from "expo-router";
import { Session, useSessionContext } from "./context/SessionContext";
import { Ionicons } from "@expo/vector-icons";
import { auth } from "@/firebaseConfig";
import { useState } from "react";

export default function MijnSessies() {
    const { sessions, deleteSession, leaveSession, endSession, getSessionById } = useSessionContext();
    const userId = auth.currentUser?.uid;
    // const [spelers, setSpelers] = useState<{ id: string, name: string }[]>([]);

    const [filterHost, setFilterHost] = useState(false);
    const [sortDatum, setSortDatum] = useState<"asc" | "desc">("asc");

    const [modalConfig, setModalConfig] = useState({
        zichtbaar: false,
        type: "",
        sessionId: "",
        titel: "",
        tekst: "",
        knopTeskt: "",
    })

    // twee modalen 1 voor verlaten van 2v2, 1 voor 1v1v1v1
    const [teAfsluitenSessieId, setTeAfsluitenSessieId] = useState<string | null>(null);
    const [geselecteerdeWinnaar, setGeselecteerdeWinnaar] = useState<string | null>(null);

    // Test states om ze zichtbaar te maken
    const [practiceModalZichtbaar, setPracticeModalZichtbaar] = useState(false);

    // Ik toon de juste form, wanneer moet ik de toon op false zetten? Wanneer ik bevestig of annuleer, dus in beide gevallen
    // Voeg bovenaan bij je andere states deze toe om het ID te onthouden
    const handleAfsluiten = async (sessionId: string) => {
        const s = getSessionById(sessionId);
        if (!s) return;

        setTeAfsluitenSessieId(sessionId);
        setGeselecteerdeWinnaar(null);
        setPracticeModalZichtbaar(true);

    }

    const bewaarSessieResultaat = async () => {
        if (!teAfsluitenSessieId || !geselecteerdeWinnaar) {
            Alert.alert("Fout", "Selecteer eerst een winnaar.");
            return;
        }

        // Roep de nieuwe Firebase logica aan
        await endSession(teAfsluitenSessieId, geselecteerdeWinnaar);

        setPracticeModalZichtbaar(false);
        setTeAfsluitenSessieId(null);
        setGeselecteerdeWinnaar(null);
    };

    const sluitModal = () => {
        setModalConfig({ ...modalConfig, zichtbaar: false });
    };

    const handleVerlaat = (id: string) => {
        if (!userId) return;

        setModalConfig({
            zichtbaar: true,
            type: "verlaat",
            sessionId: id,
            titel: "Wedstrijd Verlaten",
            tekst: "Weet je zeker dat je deze wedstrijd wilt verlaten?",
            knopTeskt: "Verlaten",
        });
    }

    const handleDelete = (id: string) => {
        if (!userId) return;

        setModalConfig({
            zichtbaar: true,
            type: "verwijder",
            sessionId: id,
            titel: "Wedstrijd Verwijderen",
            tekst: "Weet je zeker dat je deze wedstrijd defenitief wilt verwijderen?",
            knopTeskt: "Verwijderen",
        });
    }

    const handleBevestigModal = () => {
        if (modalConfig.type === "verlaat") {
            leaveSession(modalConfig.sessionId, userId);
        } else if (modalConfig.type === "verwijder") {
            deleteSession(modalConfig.sessionId);
        }
        sluitModal();
    }

    const navigeerTerug = () => {
        router.push("/dashboard");
    }

    const mijnSessies = sessions
        .filter((session: Session) =>
            userId && session.players?.includes(userId) && session.status === "open"
        )
        .filter((session: Session) => filterHost ? session.hostId === userId : true
        )
        .sort((a: Session, b: Session) => {
            const datumA = new Date(`${a.date}T${a.time}`).getTime();
            const datumB = new Date(`${b.date}T${b.time}`).getTime();

            if (sortDatum === "asc") {
                return datumA - datumB;
            } else {
                return datumB - datumA;
            }
        });

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <TouchableOpacity style={styles.backButton} onPress={navigeerTerug}>
                    <Ionicons name="chevron-back" size={22} color="#8888AA" />
                    <Text style={styles.backButtonText}>Terug</Text>
                </TouchableOpacity>

                <Text style={styles.title}>Mijn Games</Text>
                <Text style={styles.subtitle}>Je geplande en aangemaakte sessies</Text>

                <View style={styles.filterBalk}>
                    <TouchableOpacity
                        style={[styles.filterKnop, filterHost && styles.filterKnopActief]}
                        onPress={() => setFilterHost(!filterHost)}
                    >
                        <Ionicons name={filterHost ? "checkbox" : "square-outline"} size={16} color={filterHost ? "#FFFFFF" : "#8888AA"} />
                        <Text style={[styles.filterTekst, filterHost && styles.filterTekstActief]}>
                            Zelf aangemaakt
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.filterKnop}
                        onPress={() => setSortDatum(sortDatum === "asc" ? "desc" : "asc")}
                    >
                        <Ionicons name={sortDatum === "asc" ? "arrow-down-outline" : "arrow-up-outline"} size={16} color="#8888AA" />
                        <Text style={styles.filterTekst}>
                            {sortDatum === "asc" ? "Datum (Oplopend)" : "Datum (Aflopend)"}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View>
                    {mijnSessies.length === 0 ? (
                        <Text style={styles.emptyText}>Geen sessies gevonden.</Text>
                    ) : (
                        mijnSessies.map((session: Session) => (
                            <View key={session.id} style={styles.card}>

                                {/* Header: Map & Badges */}
                                <View style={styles.cardHeader}>
                                    <Text style={styles.gameTitle}>{session.mapName}</Text>
                                    <View style={styles.badgeContainer}>
                                        {session.isCompetitive && session.sessionType === 'match' && (
                                            <View style={styles.badgeComp}>
                                                <Text style={styles.badgeTextComp}>Competitief</Text>
                                            </View>
                                        )}
                                        {session.hostId === userId && (
                                            <View style={styles.badgeHost}>
                                                <Text style={styles.badgeTextHost}>Owner</Text>
                                            </View>
                                        )}

                                        {/* team icoon */}
                                        {userId && (session.teamA?.includes(userId) || session.teamB?.includes(userId)) && (
                                            <View style={styles.badgeTeam}>
                                                <Ionicons name="flag" size={10} color="#E040FB" style={{ marginRight: 4 }} />
                                                <Text style={styles.badgeTextTeam}>
                                                    {session.teamA?.includes(userId) ? "team A" : "team B"}
                                                </Text>
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
                                    <Text style={styles.detailText}>Spelers: {session.players?.length || 0} / 4</Text>
                                </View>

                                {/* Actie Knoppen */}
                                {session.hostId === userId ? (
                                    <View style={styles.buttonGroup}>
                                        <TouchableOpacity
                                            style={styles.editButton}
                                            onPress={() => router.push(`/wijzigsessie?id=${session.id}`)}
                                        >
                                            <Text style={styles.editButtonText}>Wijzigen</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={styles.deleteButton}
                                            onPress={() => handleDelete(session.id)}
                                        >
                                            <Text style={styles.deleteButtonText}>Verwijder</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={styles.deleteButton}
                                            onPress={() => handleAfsluiten(session.id)}
                                        >
                                            <Text style={styles.deleteButtonText}>Afsluiten</Text>
                                        </TouchableOpacity>

                                    </View>

                                ) : (
                                    <TouchableOpacity
                                        style={styles.leaveButton}
                                        onPress={() => handleVerlaat(session.id)}
                                    >
                                        <Text style={styles.leaveButtonText}>Verlaat Match</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        ))
                    )}
                </View>

                <Modal transparent visible={modalConfig.zichtbaar} animationType="fade">
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalKaart}>
                            <Text style={styles.modalTitel}>{modalConfig.titel}</Text>
                            <Text style={styles.modalTekst}>{modalConfig.tekst}</Text>
                            <View style={styles.modalKnoppen}>
                                <Pressable
                                    style={styles.modalAnnuleer}
                                    onPress={sluitModal}
                                >
                                    <Text style={styles.modalAnnuleerTekst}>Annuleer</Text>
                                </Pressable>
                                <Pressable
                                    style={[styles.modalBevestig, { backgroundColor: "#E53E3E" }]}
                                    onPress={handleBevestigModal}
                                >
                                    <Text style={styles.modalBevestigTekst}>{modalConfig.knopTeskt}</Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* Modal 2: Practice Afsluiten (Team A vs Team B) */}
                <Modal transparent visible={practiceModalZichtbaar} animationType="fade">
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalKaart}>
                            <Text style={styles.modalTitel}>Sessie Afsluiten</Text>
                            <Text style={styles.modalTekst}>Welk team heeft gewonnen?</Text>

                            <View style={styles.teamSelectGroup}>
                                <TouchableOpacity
                                    style={[styles.teamSelectBtn, geselecteerdeWinnaar === 'teamA' && styles.teamSelectBtnActief]}
                                    onPress={() => setGeselecteerdeWinnaar('teamA')}
                                >
                                    <Text style={[styles.teamSelectText, geselecteerdeWinnaar === 'teamA' && styles.teamSelectTextActief]}>
                                        Team A
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.teamSelectBtn, geselecteerdeWinnaar === 'teamB' && styles.teamSelectBtnActief]}
                                    onPress={() => setGeselecteerdeWinnaar('teamB')}
                                >
                                    <Text style={[styles.teamSelectText, geselecteerdeWinnaar === 'teamB' && styles.teamSelectTextActief]}>
                                        Team B
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.modalKnoppen}>
                                <Pressable style={styles.modalAnnuleer} onPress={() => setPracticeModalZichtbaar(false)}>
                                    <Text style={styles.modalAnnuleerTekst}>Annuleer</Text>
                                </Pressable>
                                <Pressable style={[styles.modalBevestig, { backgroundColor: "#4CAF50" }]} onPress={bewaarSessieResultaat}>
                                    <Text style={styles.modalBevestigTekst}>Opslaan</Text>
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </Modal>

            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    filterBalk: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 16,
        gap: 10,
    },
    filterKnop: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#131320",
        padding: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#1E1E30",
        gap: 6,
    },
    filterKnopActief: {
        backgroundColor: "rgba(46, 107, 255, 0.15)",
        borderColor: "#2E6BFF",
    },
    filterTekst: {
        color: "#8888AA",
        fontSize: 12,
        fontWeight: "bold",
    },
    filterTekstActief: {
        color: "#FFFFFF",
    },
    gridContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
        width: "100%",
        marginBottom: 16,
    },
    gridBtn: {
        width: "47%", // Zorgt voor 2 blokken naast elkaar (2x2 grid)
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#1E1E30",
        alignItems: "center",
        backgroundColor: "#0B0B12",
    },
    gridBtnActief: {
        backgroundColor: "#2E6BFF",
        borderColor: "#2E6BFF",
    },
    gridText: {
        color: "#8888AA",
        fontWeight: "bold",
    },
    gridTextActief: {
        color: "#FFFFFF",
    },
    teamSelectGroup: {
        flexDirection: "row",
        gap: 10,
        width: "100%",
        marginBottom: 16,
    },
    teamSelectBtn: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#1E1E30",
        alignItems: "center",
        backgroundColor: "#0B0B12",
    },
    teamSelectBtnActief: {
        backgroundColor: "#2E6BFF",
        borderColor: "#2E6BFF",
    },
    teamSelectText: {
        color: "#8888AA",
        fontWeight: "bold",
    },
    teamSelectTextActief: {
        color: "#FFFFFF",
    },
    scoreInput: {
        width: "100%",
        backgroundColor: "#0B0B12",
        borderWidth: 1,
        borderColor: "#1E1E30",
        borderRadius: 8,
        color: "#FFFFFF",
        padding: 14,
        fontSize: 16,
        marginBottom: 20,
    },
    badgeTeam: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(156, 39, 176, 0.15)", // Mooie paarse achtergrond
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 6,
    },
    badgeTextTeam: {
        fontSize: 10,
        fontWeight: "bold",
        color: "#E040FB", // Felle paarse tekst
        textTransform: "uppercase",
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
        backgroundColor: "#2E6BFF",
        alignItems: "center",
    },
    modalBevestigTekst: {
        color: "#FFFFFF",
        fontWeight: "bold",
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
        flexWrap: "wrap",
        gap: 8,
    },
    gameTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#FFFFFF",
    },
    badgeContainer: {
        flexDirection: "row",
        gap: 6,
        flexWrap: "wrap",
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
    badgeHost: {
        backgroundColor: "rgba(255, 165, 0, 0.15)",
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 6,
    },
    badgeTextHost: {
        fontSize: 10,
        fontWeight: "bold",
        color: "#FFA500",
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
    buttonGroup: {
        flexDirection: "row",
        gap: 10,
        marginTop: 12,
    },
    editButton: {
        flex: 1,
        backgroundColor: "#2E6BFF",
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    editButtonText: {
        color: "#FFFFFF",
        fontWeight: "bold",
        fontSize: 14,
    },
    deleteButton: {
        flex: 1,
        backgroundColor: "transparent",
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#E53935",
    },
    deleteButtonText: {
        color: "#E53935",
        fontWeight: "bold",
        fontSize: 14,
    },
    leaveButton: {
        backgroundColor: "transparent",
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
        marginTop: 12,
        borderWidth: 1,
        borderColor: "#E53935",
    },
    leaveButtonText: {
        color: "#E53935",
        fontWeight: "bold",
        fontSize: 14,
    },
    addButton: {
        backgroundColor: "#2E6BFF",
        padding: 16,
        borderRadius: 8,
        marginTop: 20,
        alignItems: "center",
    },
    addButtonText: {
        color: "#FFFFFF",
        fontWeight: "bold",
        fontSize: 16,
    },
});
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { router } from "expo-router";
import { Session, useSessionContext } from "./SessionContext";
import { Ionicons } from "@expo/vector-icons";
import { auth } from "@/firebaseConfig";

export default function Geschiedenis() {
    const { sessions } = useSessionContext();
    const userId = auth.currentUser?.uid;

    const navigeerTerug = () => {
        router.push("/dashboard");
    };

    // Filter en sorteer op afgesloten (voltooid) wedstrijden van deze speler
    const afgeslotenSessies = sessions
        .filter((session: Session) =>
            userId && session.players?.includes(userId) && session.status === "voltooid"
        )
        .sort((a: Session, b: Session) => {
            // Aflopend sorteren (nieuwste eerst)
            const datumA = new Date(`${a.date}T${a.time}`).getTime();
            const datumB = new Date(`${b.date}T${b.time}`).getTime();
            return datumB - datumA;
        });

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <TouchableOpacity style={styles.backButton} onPress={navigeerTerug}>
                    <Ionicons name="chevron-back" size={22} color="#8888AA" />
                    <Text style={styles.backButtonText}>Terug</Text>
                </TouchableOpacity>

                <View style={styles.headerTop}>
                    <Text style={styles.title}>Geschiedenis</Text>
                </View>
                <Text style={styles.subtitle}>Je eerder gespeelde wedstrijden</Text>
            </View>

            <ScrollView contentContainerStyle={styles.listContent}>
                {afgeslotenSessies.length === 0 ? (
                    <Text style={styles.emptyText}>Je hebt nog geen afgesloten wedstrijden.</Text>
                ) : (
                    afgeslotenSessies.map((session: Session) => {

                        // Bepaal of de huidige gebruiker heeft gewonnen
                        const zatInTeamA = session.teamA?.includes(userId || "");
                        const zatInTeamB = session.teamB?.includes(userId || "");
                        const heeftGewonnen =
                            (session.winnaar === "teamA" && zatInTeamA) ||
                            (session.winnaar === "teamB" && zatInTeamB);

                        const winnendTeamTekst = session.winnaar === "teamA" ? "Team A" : "Team B";

                        return (
                            <View key={session.id} style={styles.card}>
                                <View style={styles.cardHeader}>
                                    <Text style={styles.gameTitle}>{session.mapName}</Text>
                                    <View style={styles.badgeContainer}>
                                        {session.isCompetitive ? (
                                            <View style={styles.badgeComp}>
                                                <Text style={styles.badgeTextComp}>Competitief</Text>
                                            </View>
                                        ) : (
                                            <View style={styles.badgeFriendly}>
                                                <Text style={styles.badgeTextFriendly}>Vriendschappelijk</Text>
                                            </View>
                                        )}
                                    </View>
                                </View>

                                <View style={styles.divider} />

                                <View style={styles.detailRow}>
                                    <Ionicons name="calendar-outline" size={16} color="#8888AA" />
                                    <Text style={styles.detailText}>{session.date} om {session.time}</Text>
                                </View>

                                <View style={styles.detailRow}>
                                    <Ionicons name="people-outline" size={16} color="#8888AA" />
                                    <Text style={styles.detailText}>
                                        Gespeeld in: {zatInTeamA ? "Team A" : zatInTeamB ? "Team B" : "Onbekend"}
                                    </Text>
                                </View>

                                {/* Resultaat weergave */}
                                <View style={[
                                    styles.resultaatBalk,
                                    heeftGewonnen ? styles.resultaatWinst : styles.resultaatVerlies,
                                    !session.isCompetitive && styles.resultaatNeutraal
                                ]}>
                                    <Ionicons
                                        name={session.isCompetitive ? "trophy" : "happy-outline"}
                                        size={20}
                                        color={
                                            !session.isCompetitive ? "#8888AA" :
                                                heeftGewonnen ? "#FFD700" : "#E53935"
                                        }
                                    />
                                    <View style={styles.resultaatTekstKolom}>
                                        <Text style={[
                                            styles.resultaatHoofdTekst,
                                            !session.isCompetitive ? { color: "#FFFFFF" } :
                                                heeftGewonnen ? { color: "#FFD700" } : { color: "#E53935" }
                                        ]}>
                                            {session.isCompetitive
                                                ? (heeftGewonnen ? "Gewonnen!" : "Verloren")
                                                : "Wedstrijd Voltooid"}
                                        </Text>
                                        <Text style={styles.resultaatSubTekst}>
                                            Winnaar: {winnendTeamTekst}
                                        </Text>
                                    </View>
                                </View>

                            </View>
                        );
                    })
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#0B0B12",
    },
    headerContainer: {
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: "#0B0B12",
        borderBottomWidth: 1,
        borderBottomColor: "#1E1E30",
        zIndex: 10,
    },
    headerTop: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 4,
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
    },
    subtitle: {
        fontSize: 14,
        color: "#8888AA",
    },
    listContent: {
        padding: 20,
        paddingBottom: 40,
        flexGrow: 1,
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
        opacity: 0.9,
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
    badgeFriendly: {
        backgroundColor: "rgba(136, 136, 170, 0.15)",
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 6,
    },
    badgeTextFriendly: {
        fontSize: 10,
        fontWeight: "bold",
        color: "#8888AA",
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
    resultaatBalk: {
        flexDirection: "row",
        alignItems: "center",
        padding: 12,
        borderRadius: 8,
        marginTop: 12,
        borderWidth: 1,
        gap: 12,
    },
    resultaatWinst: {
        backgroundColor: "rgba(255, 215, 0, 0.1)",
        borderColor: "rgba(255, 215, 0, 0.3)",
    },
    resultaatVerlies: {
        backgroundColor: "rgba(229, 57, 53, 0.1)",
        borderColor: "rgba(229, 57, 53, 0.3)",
    },
    resultaatNeutraal: {
        backgroundColor: "rgba(136, 136, 170, 0.1)",
        borderColor: "rgba(136, 136, 170, 0.3)",
    },
    resultaatTekstKolom: {
        flexDirection: "column",
    },
    resultaatHoofdTekst: {
        fontSize: 16,
        fontWeight: "bold",
    },
    resultaatSubTekst: {
        fontSize: 12,
        color: "#8888AA",
        marginTop: 2,
    }
});
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native";
import { router } from "expo-router";
import { Session, useSessionContext } from "./SessionContext";
import Ionicons from "@expo/vector-icons/build/Ionicons";
import { auth } from "@/firebaseConfig";

export default function MijnSessies() {
    const { sessions, deleteSession, leaveSession } = useSessionContext();
    const userId = auth.currentUser?.uid;

    const handleVerlaat = (id: string) => {
        if (!userId) return;

        Alert.alert(
            "Match Verlaten",
            "Weet je zeker dat je deze wedstrijd wilt verlaten?",
            [
                { text: "Annuleren", style: "cancel" },
                {
                    text: "Verlaten",
                    style: "destructive",
                    onPress: () => leaveSession(id, userId)
                }
            ]
        );
    }

    const handleDelete = (id: string) => {
        Alert.alert(
            "Sessie Verwijderen",
            "Weet je zeker dat je deze sessie definitief wilt verwijderen?",
            [
                { text: "Annuleren", style: "cancel" },
                {
                    text: "Verwijder",
                    style: "destructive",
                    onPress: () => deleteSession(id)
                }
            ]
        );
    }

    const navigeerTerug = () => {
        router.push("/dashboard");
    }

    const mijnSessies = sessions.filter((session: Session) =>
        userId && session.players.includes(userId)
    );

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <TouchableOpacity style={styles.backButton} onPress={navigeerTerug}>
                    <Ionicons name="chevron-back" size={22} color="#8888AA" />
                    <Text style={styles.backButtonText}>Terug</Text>
                </TouchableOpacity>
                
                <Text style={styles.title}>Mijn Games</Text>
                <Text style={styles.subtitle}>Je geplande en aangemaakte sessies</Text>

                <View>
                    {mijnSessies.length === 0 ? (
                        <Text style={styles.emptyText}>Je zit nog niet in een sessie.</Text>
                    ) : (
                        mijnSessies.map((session: Session) => (
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
                                        {session.hostId === userId && (
                                             <View style={styles.badgeHost}>
                                                <Text style={styles.badgeTextHost}>Host</Text>
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

                <TouchableOpacity style={styles.addButton} onPress={() => router.push("/maaksessie")}>
                    <Text style={styles.addButtonText}>+ Nieuwe Sessie</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
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
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { useSessionContext } from "./SessionContext";

export default function GameLijst() {
    const { sessions, deleteSession } = useSessionContext();

    const handleDelete = (id: string) => {
        deleteSession(id);
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Mijn Games</Text>

            <View>
                {sessions.map((item: any) => (
                    <View key={item.id} style={styles.card}>
                        <Text style={styles.gameTitle}>{item.game}</Text>
                        <Text style={styles.details}>{item.time} | Spelers: {item.players} | {item.level}</Text>

                        <View style={styles.buttonGroup}>
                            <TouchableOpacity
                                style={styles.editButton}
                                onPress={() => router.push({ pathname: "/wijzigsessie", params: { id: item.id } })}
                            >
                                <Text style={styles.editButtonText}>Wijzigen</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.deleteButton}
                                onPress={() => handleDelete(item.id)}
                            >
                                <Text style={styles.deleteButtonText}>Verwijder</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}
            </View>

            <TouchableOpacity style={styles.addButton} onPress={() => router.push("/maaksessie")}>
                <Text style={styles.addButtonText}>+ Nieuwe Sessie</Text>
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#08080F",
        padding: 20,
        paddingTop: 60,
    },
    title: {
        fontSize: 26,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginBottom: 20,
    },
    card: {
        backgroundColor: "#0F0F1C",
        padding: 16,
        borderRadius: 12,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: "#1E1E35",
    },
    gameTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginBottom: 4,
    },
    details: {
        fontSize: 14,
        color: "#8888AA",
        marginBottom: 12,
    },
    buttonGroup: {
        flexDirection: "row",
        gap: 10,
    },
    editButton: {
        flex: 1,
        backgroundColor: "#1B6CF2",
        padding: 10,
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
        padding: 10,
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
    addButton: {
        backgroundColor: "#1B6CF2",
        padding: 15,
        borderRadius: 10,
        marginTop: 10,
        alignItems: "center",
    },
    addButtonText: {
        color: "#FFFFFF",
        fontWeight: "bold",
        fontSize: 16,
    },
});
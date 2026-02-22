import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { useSessionContext } from "./SessionContext";



export default function GameLijst() {
    const { sessions } = useSessionContext();
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Beschikbare Games</Text>

            <View>
                {sessions.map((item: any) => (
                    <View key={item.id} style={styles.card}>
                        <Text style={styles.gameTitle}>{item.game}</Text>
                        <Text style={styles.details}>{item.time} | Spelers: {item.players} | {item.level}</Text>
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
        color: "#1B6CF2",
        marginBottom: 6,
    },
    details: {
        fontSize: 14,
        color: "#8888AA",
    },
    addButton: {
        backgroundColor: "#1B6CF2",
        padding: 12,
        borderRadius: 8,
        marginBottom: 20,
        alignItems: "center",
    },
    addButtonText: {
        color: "#FFFFFF",
        fontWeight: "bold",
        fontSize: 16,
    }
})
import { View, Text, StyleSheet } from "react-native";

const DUMMY_SESSIONS = [
    { id: "1", game: "Call of Duty", time: "20:00", players: "2/5", level: "Level 3-5" },
    { id: "2", game: "Rocket League", time: "21:30", players: "1/4", level: "Level 2-4" },
    { id: "3", game: "Valorant", time: "19:00", players: "3/4", level: "Level 5-7" },
];


export default function GameLijst() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Beschikbare Games</Text>

            <View>
                {DUMMY_SESSIONS.map((item) => (
                    <View key={item.id} style={styles.card}>
                        <Text style={styles.gameTitle}>{item.game}</Text>
                        <Text style={styles.details}>{item.time} | Spelers: {item.players} | {item.level}</Text>
                    </View>
                ))}
            </View>
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
    }
})
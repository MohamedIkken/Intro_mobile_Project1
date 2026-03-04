import { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useSessionContext } from "./SessionContext";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function MaakSessie() {
    const { editSession, getSessionById } = useSessionContext();
    const { id } = useLocalSearchParams(); // hier is het string, goed voor nu maar later moet jij dat wss parsen
    const sessie = getSessionById(id);

    const [game, setGame] = useState("");
    const [time, setTime] = useState("");

    useEffect(() => {
        if (sessie) {
            setGame(sessie.game);
            setTime(sessie.time);
        }
    }, [sessie])

    const handleOpslaan = () => {
        if (game !== "" && time !== "") {
            editSession(id, game, time);
            navigeerTerug();
        }
    };

    const navigeerTerug = () => {
        router.push("/mijnsessies");
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={navigeerTerug}>
                <Ionicons name="chevron-back" size={22} color="#8888AA" />
                <Text style={styles.backButtonText}>Terug</Text>
            </TouchableOpacity>

            <Text style={styles.title}>Sessie Wijzigen</Text>

            <Text style={styles.label}>Welke Game?</Text>
            <TextInput
                style={styles.input}
                placeholderTextColor="#8888AA"
                value={game}
                onChangeText={setGame}
            />

            <Text style={styles.label}>Tijdstip?</Text>
            <TextInput
                style={styles.input}
                placeholderTextColor="#8888AA"
                value={time}
                onChangeText={setTime}
            />

            <TouchableOpacity style={styles.button} onPress={handleOpslaan}>
                <Text style={styles.buttonText}>Sessie Aanmaken</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#08080F",
        padding: 20,
        paddingTop: 40
    },
    title: {
        fontSize: 26,
        fontWeight: "bold",
        color: "#FFFFFF",
        marginBottom: 20
    },
    label: {
        color: "#8888AA",
        marginBottom: 8,
        marginTop: 20,
        fontWeight: "bold"
    },
    input: {
        backgroundColor: "#0F0F1C",
        color: "#FFFFFF",
        padding: 15,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#1E1E35"
    },
    button: {
        backgroundColor: "#1B6CF2",
        padding: 15,
        borderRadius: 10,
        marginTop: 40,
        alignItems: "center"
    },
    buttonText: {
        color: "#FFFFFF",
        fontWeight: "bold",
        fontSize: 16
    },
    backButton: {
        marginBottom: 20,
        alignSelf: "flex-start",
        paddingVertical: 10,
        flexDirection: "row",
        alignItems: "center",
    },
    backButtonText: {
        color: "#8888AA",
        fontSize: 16,
        fontWeight: "bold",
        marginLeft: 4,
    },
});
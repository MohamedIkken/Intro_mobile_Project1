import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useSessionContext, Session } from "./SessionContext";
import { router } from "expo-router";
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from "@expo/vector-icons";

const beschikbareMaps = ["Nuketown", "Rust", "Shipment", "Crash"];

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

    const handleOpslaan = () => {
        if (parseFloat(minLevel) > parseFloat(maxLevel)) {
            Alert.alert("Minimum level kan niet hoger zijn dan maximum level.");
            return;
        }
        var nieuweSessieData = {
            mapName,
            date: date.toISOString().split('T')[0], // Opslaan als YYYY-MM-DD, deze is gevaarlijk omdat het tijdzone issues kan geven, en kan 1 dag terug zetten afhankelijk van de tijdzone van de gebruiker
            time: time.toTimeString().split(' ')[0].slice(0, 5), // Opslaan als HH:MM
            minLevel: parseFloat(minLevel),
            maxLevel: parseFloat(maxLevel),
            isCompetitive,
            sessionType
        };
        addSession(nieuweSessieData);
        navigeerTerug();
    };

    const navigeerTerug = () => {
        router.push("/mijnsessies");
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
        // Voeg validatie toe als nodig
        if (input === "" || (parseFloat(input) >= 0.5 && parseFloat(input) <= 7.0)) {
            setOngeldigeMaxLevel(false);
            setMaxLevel(input);
        } else
            setOngeldigeMaxLevel(true);
    }

    const verwerkMinLevelInput = (input: string) => {
        // Voeg validatie toe als nodig
        if (input === "" || (parseFloat(input) >= 0.5 && parseFloat(input) <= 7.0)) {
            setOngeldigeMinLevel(false);
            setMinLevel(input);
        } else
            setOngeldigeMinLevel(true);
    }

    return (
        <View>
            <Text>Welke Map (Club):</Text>
            <Text>Kies een Map:</Text>
            {beschikbareMaps.map((mapOptie) => (
                <TouchableOpacity key={mapOptie} onPress={() => setMapName(mapOptie)}>
                    <Text>{mapOptie} {mapName === mapOptie ? "(Gekozen)" : ""}</Text>
                </TouchableOpacity>
            ))}

            <Text>Datum:</Text>
            <TouchableOpacity onPress={() => { setShowDatePicker(true) }}>
                <Text>Gekozen datum: {date.toLocaleDateString()}</Text>
            </TouchableOpacity>

            {showDatePicker && (
                <DateTimePicker
                    value={date}
                    mode="date"
                    display="default"
                    onChange={onChangeDate}
                />
            )}

            <Text>Tijd:</Text>
            <TouchableOpacity onPress={() => { setShowTimePicker(true) }}>
                <Text>Gekozen tijd: {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
            </TouchableOpacity>

            {showTimePicker && (
                <DateTimePicker
                    value={time}
                    mode="time"
                    display="default"
                    onChange={onChangeTime}
                />
            )}

            {  /*competitief of vriendschappelijk*/}
            <Text>Type Wedstrijd:</Text>
            <TouchableOpacity onPress={() => setIsCompetitive(true)}>
                <Text>Competitief {isCompetitive ? "(Gekozen)" : ""}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsCompetitive(false)}>
                <Text>Vriendschappelijk {isCompetitive ? "" : "(Gekozen)"}</Text>
            </TouchableOpacity>

            {    /*match of practice*/}
            <Text>Soort Sessie:</Text>
            <TouchableOpacity onPress={() => setSessionType("match")}>
                <Text>Match {sessionType === "match" ? "(Gekozen)" : ""}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setSessionType("practice")}>
                <Text>Practice {sessionType === "practice" ? "(Gekozen)" : ""}</Text>
            </TouchableOpacity>

            { /*min en max level*/}
            <Text>Minimum Level (0.5 - 7.0):</Text>
            <TextInput
                value={minLevel}
                placeholder="Bijv. 2.0"
                keyboardType="numeric"
                onChangeText={verwerkMinLevelInput}
            />
            {ongeldigeMinLevel && <Text>Ongeldig level. Voer een waarde in tussen 0.5 en 7.0.</Text>}

            <Text>Maximum Level (0.5 - 7.0):</Text>
            <TextInput
                value={maxLevel}
                placeholder="Bijv. 5.0"
                keyboardType="numeric"
                onChangeText={verwerkMaxLevelInput}
            />
            {ongeldigeMaxLevel && <Text>Ongeldig level. Voer een waarde in tussen 0.5 en 7.0.</Text>}
        </View>
    );
}

const styles = StyleSheet.create({


});
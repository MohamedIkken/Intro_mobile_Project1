import { createContext, ReactNode, useContext, useState } from "react";

// 1. Definieer het datatype (Voorbereiding op Firebase)
export interface Session {
    id: string;
    mapName: string;          // Verving 'game' (bijv. "Nuketown")
    date: string;             // YYYY-MM-DD
    time: string;             // HH:MM
    minLevel: number;         // 0.5 tot 7.0
    maxLevel: number;         // 0.5 tot 7.0
    isCompetitive: boolean;   // true = levels aanpassen na match, false = vriendschappelijk
    sessionType: 'match' | 'practice'; // 'match' = open voor 4, 'practice' = privé booking
    players: string[];        // Array met speler-ID's of namen (max 4)
    hostId: string;           // Degene die de match aanmaakte
}

// 2. Dummy Data afgestemd op de CoD/Padel regels
const DUMMY_SESSIONS: Session[] = [
    {
        id: "1",
        mapName: "Nuketown",
        date: "2026-03-10",
        time: "20:00",
        minLevel: 2.0,
        maxLevel: 4.5,
        isCompetitive: true,
        sessionType: 'match',
        players: ["speler_1", "speler_2"], // Nog 2 plekken vrij
        hostId: "speler_1"
    },
    {
        id: "2",
        mapName: "Rust",
        date: "2026-03-11",
        time: "19:30",
        minLevel: 5.0,
        maxLevel: 7.0,
        isCompetitive: true,
        sessionType: 'match',
        players: ["speler_3", "speler_4", "speler_5", "speler_6"], // Vol (4/4) -> match bevestigd
        hostId: "speler_3"
    },
    {
        id: "3",
        mapName: "Shipment",
        date: "2026-03-12",
        time: "14:00",
        minLevel: 1.5,
        maxLevel: 7.0,
        isCompetitive: false,
        sessionType: 'practice',
        players: ["speler_7"], // Alleen de host, want het is een privé boeking (Punt 2)
        hostId: "speler_7"
    }
];

export const SessionContext = createContext<any>(null);

export const SessionProvider = ({ children }: { children: ReactNode }) => {
    const [sessions, setSessions] = useState<Session[]>(DUMMY_SESSIONS);

    // Verwijder sessie
    const deleteSession = (id: string) => {
        setSessions(sessions.filter(s => s.id !== id));
    };

    // Nieuwe sessie aanmaken (zoals in jouw formulier)
    const addSession = (newSessionData: Omit<Session, 'id' | 'players' | 'hostId'>) => {
        const newSession: Session = {
            ...newSessionData,
            id: Math.random().toString(), // Wordt later een Firebase ID
            players: ["huidige_gebruiker"], // Host is direct de eerste speler
            hostId: "huidige_gebruiker"
        };
        setSessions([...sessions, newSession]);
    };

    // Haal specifieke sessie op
    const getSessionById = (id: string) => {
        return sessions.find(s => s.id === id);
    };

    // Speler toevoegen aan bestaande match (Punt 3 uit de opdracht)
    const joinSession = (sessionId: string, playerId: string) => {
        setSessions(sessions.map(s => {
            if (s.id === sessionId && s.players.length < 4 && s.sessionType === 'match') {
                return { ...s, players: [...s.players, playerId] };
            }
            return s;
        }));
    };

    const editSession = (id: string, updatedData: Partial<Session>) => {
        setSessions(sessions.map(sessie =>
            sessie.id === id ? { ...sessie, ...updatedData } : sessie
        ));
    };

    return (
        <SessionContext.Provider value={{ sessions, addSession, deleteSession, getSessionById, joinSession, editSession }}>
            {children}
        </SessionContext.Provider>
    );
};

export const useSessionContext = () => useContext(SessionContext);
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { collection, addDoc, deleteDoc, doc, updateDoc, onSnapshot, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from "../firebaseConfig";

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
    serverKey?: string;     // Alleen relevant voor practice sessies, optioneel veld
}

export const SessionContext = createContext<any>(null);

export const SessionProvider = ({ children }: { children: ReactNode }) => {
    const [sessions, setSessions] = useState<Session[]>([]);

    // sessions synchroniseren met Firebase (Realtime updates)
    useEffect(() => {
        // wanneer je een nieuwe sessie toevoegt, verwijdert of bijwerkt, zou je deze veranderingen moeten synchroniseren met Firebase. Dit betekent dat je een listener moet instellen die luistert naar veranderingen in de 'sessions' collectie in Firebase. Wanneer er een verandering plaatsvindt (zoals een nieuwe sessie toegevoegd, een sessie verwijderd of bijgewerkt), zou deze listener automatisch de lokale state van 'sessions' moeten bijwerken zodat deze altijd up-to-date is met de gegevens in Firebase. Zonder deze realtime synchronisatie zou je handmatig de state moeten bijwerken na elke bewerking, wat foutgevoelig kan zijn en niet schaalbaar is.
        const unsubscribe = onSnapshot(collection(db, "sessions"), (snapshot) => {
            const geladenSessions: Session[] = [];
            snapshot.forEach((doc) => {
                geladenSessions.push({ id: doc.id, ...doc.data() } as Session);
            });
            setSessions(geladenSessions);
        });

        return () => unsubscribe();
    }, []);

    // Verwijder sessie
    const deleteSession = async (id: string) => {
        try {
            await deleteDoc(doc(db, "sessions", id));
        } catch (error) {
            console.error("Fout bij het verwijderen van sessie:", error);
        }
    };

    // Nieuwe sessie aanmaken (zoals in jouw formulier)
    const addSession = async (newSessionData: Omit<Session, 'id'>) => {
        try {
            await addDoc(collection(db, "sessions"), newSessionData);
        } catch (error) {
            console.error("Fout bij het aanmaken van sessie:", error);
        }
    };

    // wijzigen van een sessie
    const editSession = async (id: string, updatedData: Partial<Session>) => {
        try {
            await updateDoc(doc(db, "sessions", id), updatedData);
        } catch (error) {
            console.error("Fout bij het bijwerken van sessie:", error);
        }
    };

    // Haal specifieke sessie op, hoeft niet async omdat we al realtime updates hebben via onSnapshot, dus de sessies zijn altijd up-to-date in de state
    const getSessionById = (id: string) => {
        return sessions.find(s => s.id === id);
    };

    // Speler toevoegen aan bestaande match
    const joinSession = async (sessionId: string, playerId: string) => {
        try {
            await updateDoc(doc(db, "sessions", sessionId), {
                players: arrayUnion(playerId)
            });
        } catch (error) {
            console.error("Fout bij het toevoegen van speler aan sessie:", error);
        }
    };

    // Speler verwijderen uit bestaande match
    const leaveSession = async (sessionId: string, playerId: string) => {
        try {
            await updateDoc(doc(db, "sessions", sessionId), {
                players: arrayRemove(playerId)
            });
        } catch (error) {
            console.error("Fout bij het verwijderen van speler uit sessie:", error);
        }
    };

    return (
        <SessionContext.Provider value={{ sessions, addSession, deleteSession, getSessionById, joinSession, leaveSession, editSession }}>
            {children}
        </SessionContext.Provider>
    );
};

export const useSessionContext = () => useContext(SessionContext);
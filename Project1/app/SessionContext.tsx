import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { collection, addDoc, deleteDoc, doc, updateDoc, onSnapshot, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
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
    status?: 'open' | 'voltooid';
    score?: string;
    teamA?: string[]; // Alleen relevant voor competitieve matches, optioneel veld 
    teamB?: string[]; // Alleen relevant voor competitieve matches, optioneel veld
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
    const joinSession = async (sessionId: string, playerId: string, team?: 'A' | 'B') => {
        try {
            const updatedData: any = {
                players: arrayUnion(playerId)
            };

            if (team) team === 'A' ? updatedData.teamA = arrayUnion(playerId) : updatedData.teamB = arrayUnion(playerId);

            await updateDoc(doc(db, "sessions", sessionId), updatedData);

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

    // Sessie beeindigen 
    const endSession = async (sessionId: string, winnaar: string) => {
        try {
            // 1. Haal de sessie op om te bepalen wie er meespeelt
            const sessionRef = doc(db, "sessions", sessionId);
            const sessionSnap = await getDoc(sessionRef);

            if (!sessionSnap.exists()) return;

            const sessionData = sessionSnap.data() as Session; // wat doet deze regel? ai, geef antwoord: Deze regel haalt de gegevens van het opgehaalde document (de sessie) op en cast het naar het Session type. Het zorgt ervoor dat de data die we uit Firebase krijgen, wordt geïnterpreteerd als een object dat voldoet aan de structuur van het Session interface dat we eerder hebben gedefinieerd. Hierdoor kunnen we later in de code gemakkelijk toegang krijgen tot de eigenschappen van de sessie, zoals players, teamA, teamB, etc., met de juiste types.
            const isTeamGame = winnaar === "teamA" || winnaar === "teamB";

            // Ophalen van alle huidige levels
            const huidigeLevels: Record<string, number> = {};
            // 2. loop alle spelers en haal hun huidige level op
            for (const playerId of sessionData.players) {
                const userRef = doc(db, "users", playerId);
                const userSnap = await getDoc(userRef);

                // de spelerlevels record bijwerken
                if (userSnap.exists())
                    // ik ga ervan dat ik levels opsla als level. maar ik sla nog geen levels en ook maak geen level bij nieuwe gebruikers aan, dat moet gemaakt worden met een default waarde van 2. ai geef jij aantwoord kort: Deze regel controleert of het document van de gebruiker bestaat in de "users" collectie. Als het document bestaat, wordt het level van de gebruiker opgehaald (ervan uitgaande dat het veld 'level' heet) en opgeslagen in de spelerLevels record met de playerId als sleutel. Als er geen level is opgeslagen voor die gebruiker, wordt er een default waarde van 0 gebruikt.    
                    huidigeLevels[playerId] = userSnap.data().level || 0; // als er geen level is, default naar 0
            }

            // Berekenen van nieuwe levels op basis van wie er gewonnen heeft
            // STAP 2: Berekenen van de nieuwe levels in het geheugen
            const nieuweLevels: Record<string, number> = {};
            for (const playerId of sessionData.players) {
                let isWinner = false;

                if (isTeamGame) {
                    const isInWinningTeamA = winnaar === 'teamA' && sessionData.teamA?.includes(playerId);
                    const isInWinningTeamB = winnaar === 'teamB' && sessionData.teamB?.includes(playerId);
                    isWinner = Boolean(isInWinningTeamA || isInWinningTeamB);
                } else {
                    isWinner = winnaar === playerId;
                }

                // Bepaal de punten (+0.15 winst, -0.10 verlies 2v2, -0.05 verlies 1v1v1v1)
                const levelAanpassing = isWinner ? 0.15 : (isTeamGame ? -0.10 : -0.05);
                let berekendLevel = huidigeLevels[playerId] + levelAanpassing;

                // Zorg dat het tussen 0.5 en 7.0 blijft en rond af op 2 decimalen
                berekendLevel = Math.max(0.5, Math.min(7.0, berekendLevel));
                nieuweLevels[playerId] = Math.round(berekendLevel * 100) / 100;
            }

            // STAP 3: Opslaan van alle nieuwe data in Firebase
            for (const playerId of sessionData.players) {
                await updateDoc(doc(db, "users", playerId), { level: nieuweLevels[playerId] });
            }

            await updateDoc(sessionRef, { status: 'voltooid', winnaar: winnaar });


        } catch (error) {
            console.error("Fout bij het beëindigen van sessie:", error);
        }
    };

    return (
        <SessionContext.Provider value={{ sessions, addSession, deleteSession, getSessionById, joinSession, leaveSession, editSession, endSession }}>
            {children}
        </SessionContext.Provider>
    );
};

export const useSessionContext = () => useContext(SessionContext);
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  onSnapshot,
  arrayUnion,
  arrayRemove,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";

export interface Session {
  id: string;
  mapName: string; 
  date: string; 
  time: string; 
  minLevel: number; 
  maxLevel: number;
  isCompetitive: boolean;
  sessionType: "match" | "practice"; // nu werken we alleen met matches, maar kan later uitgebreid worden met practice sessies
  players: string[];
  hostId: string;
  winnaar?: string;
  status?: "open" | "voltooid";
  score?: string;
  teamA?: string[]; 
  teamB?: string[];
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

      // Chat ook verwijderen
      const chatsRef = collection(db, "chats");
      const q = query(chatsRef, where("sessionId", "==", id));
      const chatSnapshot = await getDocs(q);
      if (!chatSnapshot.empty) await deleteDoc(chatSnapshot.docs[0].ref);
    } catch (error) {
      console.error("Fout bij het verwijderen van sessie:", error);
    }
  };

  // Nieuwe sessie aanmaken (zoals in jouw formulier)
  const addSession = async (newSessionData: Omit<Session, "id">) => {
    try {
      const docRef = await addDoc(collection(db, "sessions"), newSessionData);
      return docRef.id; // retourneer het ID van de nieuw aangemaakte sessie
    } catch (error) {
      console.error("Fout bij het aanmaken van sessie:", error);
    }
  };

  // wijzigen van een sessie
  const editSession = async (id: string, updatedData: Partial<Session>) => {
    try {
      await updateDoc(doc(db, "sessions", id), updatedData);
      // Als de mapName is bijgewerkt, moet je ook de bijbehorende chat updaten
      const chatsRef = collection(db, "chats");
      const q = query(chatsRef, where("sessionId", "==", id)); // sessionId moet hier id zijn, ik pas het aan
      const chatSnapshots = await getDocs(q);
      if (!chatSnapshots.empty) {
        await updateDoc(chatSnapshots.docs[0].ref, {
          mapName: updatedData.mapName,
          date: updatedData.date,
          time: updatedData.time,
          isCompetitive: updatedData.isCompetitive,
          sessionType: updatedData.sessionType,
        });
      }
    } catch (error) {
      console.error("Fout bij het bijwerken van sessie:", error);
    }
  };

  // Haal specifieke sessie op, hoeft niet async omdat we al realtime updates hebben via onSnapshot, dus de sessies zijn altijd up-to-date in de state
  const getSessionById = (id: string) => {
    return sessions.find((s) => s.id === id);
  };

  // Speler toevoegen aan bestaande match
  const joinSession = async (
    sessionId: string,
    playerId: string,
    team?: "A" | "B",
  ) => {
    try {
      const updatedData: any = {
        players: arrayUnion(playerId),
      };

      if (team)
        team === "A"
          ? (updatedData.teamA = arrayUnion(playerId))
          : (updatedData.teamB = arrayUnion(playerId));

      await updateDoc(doc(db, "sessions", sessionId), updatedData);

      // Ook speler toevoegen aan de bijbehorende chat in Firebase
      // We moeten de chat vinden die gekoppeld is aan deze sessie en de speler toevoegen aan het 'players' veld van die chat
      const chatsRef = collection(db, "chats");
      const q = query(chatsRef, where("sessionId", "==", sessionId));
      const chatSnapshots = await getDocs(q);
      if (!chatSnapshots.empty) {
        await updateDoc(chatSnapshots.docs[0].ref, {
          players: arrayUnion(playerId),
        });
      }
    } catch (error) {
      console.error("Fout bij het toevoegen van speler aan sessie:", error);
    }
  };

  // Speler verwijderen uit bestaande match
  const leaveSession = async (sessionId: string, playerId: string) => {
    try {
      await updateDoc(doc(db, "sessions", sessionId), {
        players: arrayRemove(playerId),
      });
    } catch (error) {
      console.error("Fout bij het verwijderen van speler uit sessie:", error);
    }
  };

  const endSession = async (sessionId: string, winnaar: string) => {
    try {
      const sessionRef = doc(db, "sessions", sessionId);
      const sessionSnap = await getDoc(sessionRef);

      if (!sessionSnap.exists()) return;

      const sessionData = sessionSnap.data() as Session;

      if (sessionData.isCompetitive) {
        const huidigeLevels: Record<string, number> = {};

        for (const playerId of sessionData.players) {
          const userRef = doc(db, "users", playerId);
          const userSnap = await getDoc(userRef);
          // Default naar 2.0 voor nieuwe spelers
          huidigeLevels[playerId] = userSnap.exists() ? userSnap.data().level || 2.0 : 2.0;
        }

        const nieuweLevels: Record<string, number> = {};
        for (const playerId of sessionData.players) {
          let isWinner = false;

          // Pure 2v2 logica
          const isInWinningTeamA = winnaar === "teamA" && sessionData.teamA?.includes(playerId);
          const isInWinningTeamB = winnaar === "teamB" && sessionData.teamB?.includes(playerId);
          isWinner = Boolean(isInWinningTeamA || isInWinningTeamB);

          // +0.15 voor winst, -0.10 voor verlies
          const levelAanpassing = isWinner ? 0.15 : -0.10;
          let berekendLevel = huidigeLevels[playerId] + levelAanpassing;

          // Zorg dat het tussen 0.5 en 7.0 blijft
          berekendLevel = Math.max(0.5, Math.min(7.0, berekendLevel));
          nieuweLevels[playerId] = Math.round(berekendLevel * 100) / 100;
        }

        for (const playerId of sessionData.players) {
          await updateDoc(doc(db, "users", playerId), {
            level: nieuweLevels[playerId],
          });
        }
      }

      // Sla de status EN de winnaar op
      await updateDoc(sessionRef, { status: "voltooid", winnaar: winnaar });

      const chatsRef = collection(db, "chats");
      const q = query(chatsRef, where("sessionId", "==", sessionId));
      const chatSnapshot = await getDocs(q);
      if (!chatSnapshot.empty) await deleteDoc(chatSnapshot.docs[0].ref);

    } catch (error) {
      console.error("Fout bij het beëindigen van sessie:", error);
    }
  };

  return (
    <SessionContext.Provider
      value={{
        sessions,
        addSession,
        deleteSession,
        getSessionById,
        joinSession,
        leaveSession,
        editSession,
        endSession,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSessionContext = () => useContext(SessionContext);

import { createContext, ReactNode, useContext, useState } from "react";

const DUMMY_SESSIONS = [
    { id: "1", game: "Call of Duty", time: "20:00", players: "2/5", level: "Level 3-5" },
    { id: "2", game: "Rocket League", time: "21:30", players: "1/4", level: "Level 2-4" },
    { id: "3", game: "Valorant", time: "19:00", players: "3/4", level: "Level 5-7" },
];

export const SessionContext = createContext<any>(null);

export const SessionProvider = ({ children }: { children: ReactNode }) => {
    const [sessions, setSessions] = useState(DUMMY_SESSIONS);

    // Functie => Toevoegen van game
    const addSession = (game: string, time: string) => {
        const newSession = {
            id: Math.random().toString(),
            game: game,
            time: time,
            players: "1/4",
            level: "Niveau 1.5"
        };
        setSessions([...sessions, newSession]);
    }

    return (
        <SessionContext.Provider value={{ sessions, addSession }}>
            {children}
        </SessionContext.Provider>
    )
}

export const useSessionContext = () => useContext(SessionContext);
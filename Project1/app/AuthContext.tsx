import { createContext, useContext, useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { router } from "expo-router";

// NIEUW: toegevoegd door jouw baas, Mohamed. Ik definieer een UserProfile interface die we gaan gebruiken om gebruikersprofielen in Firestore op te slaan. Deze interface bevat velden zoals uid, name, email, level en createdAt. Dit maakt het makkelijker om gebruikersgegevens te beheren en te typen in onze app.
export interface UserProfile {
    uid?: string;
    name: string;
    email: string;
    level: number;
    createdAt: string;
}
// EINDE NIEUW

type AuthContextType = {
    user: User | null;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
});

type AuthProviderProps = {
    children: React.ReactNode;
}

// Provider component die de auth status bijhoudt en beschikbaar maakt voor de rest van de app
export const AuthProvider = ({children}: AuthProviderProps) => {
    // Opslaan wie ingelogd is
    const [user, setUser] = useState<User | null>(null);
    // wachten tot firebase antwoord
    const [loading, setLoading] = useState(true);
    const auth = getAuth();

    // Kijken of er een user is die al ingelogd is bij het opstarten van de app
    useEffect(()=>{
        // Luisteren naar veranderingen in de auth status (inloggen, uitloggen, sessie verlopen)
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            // Opslaan in state
            setUser(currentUser);
            // Zeggen dat we klaar zijn met laden
            setLoading(false)

            // Naar dasboard als user ingelogd is.
        if (currentUser){
            router.replace("/dashboard")
        } else {
            // Naar login als user niet ingelogd is.
            router.replace("/")
        }
        });

        return unsubscribe;
    }, [auth]);

    // Context provider
    // Alle kinderen kunnen nu de user en loading status gebruiken
    return (
        <AuthContext.Provider value={{user, loading}}>
            {children}
        </AuthContext.Provider>
    )
};

export const useAuth = () => useContext(AuthContext);


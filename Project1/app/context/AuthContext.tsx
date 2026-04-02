import { createContext, useContext, useEffect, useRef, useState } from "react";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { router } from "expo-router";

export interface UserProfile {
    uid?: string;
    name: string;
    email: string;
    level: number;
    createdAt: string;
    photoBase64?: string;
}

type AuthContextType = {
    user: User | null;
    loading: boolean;
    setSkipRedirect: (skip: boolean) => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    setSkipRedirect: () => {},
});

type AuthProviderProps = {
    children: React.ReactNode;
}

// Provider component die de auth status bijhoudt en beschikbaar maakt voor de rest van de app
export const AuthProvider = ({children}: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const skipRedirectRef = useRef(false);
    const auth = getAuth();

    const setSkipRedirect = (skip: boolean) => {
        skipRedirectRef.current = skip;
    };

    useEffect(()=>{
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);

            if (skipRedirectRef.current) return;

            if (currentUser){
                router.replace("/dashboard");
            } else {
                router.replace("/");
            }
        });

        return unsubscribe;
    }, [auth]);

    return (
        <AuthContext.Provider value={{user, loading, setSkipRedirect}}>
            {children}
        </AuthContext.Provider>
    )
};

export const useAuth = () => useContext(AuthContext);


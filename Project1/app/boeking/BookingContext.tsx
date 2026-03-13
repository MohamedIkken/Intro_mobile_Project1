import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Boeking, Slot, zoekFilters } from "./boekingTypes";
import boekingService from "./boekingService";
import slotService from "./slotService";



interface BookingState {
    filters: zoekFilters;
    slots: Slot[];
    selectedSlot: Slot | null;
    loading: boolean;
    error: string | null;
}

interface BookingContextValue extends BookingState {
    setFilters: (filters: Partial<zoekFilters>) => void;
    searchAvailability: () => void;
    selectSlot: (slot: Slot) => void;
    reserveSlot: (userId: string, doel: string) => Promise<void>;
    clearError: () => void;
}

const defaultFilters: zoekFilters = {
    serverNaam: "",
    datum: new Date(),
    duur: 60,
};

const defaultState: BookingState = {
    filters: defaultFilters,
    slots: [],
    selectedSlot: null,
    loading: false,
    error: null,
};



const BookingContext = createContext<BookingContextValue | null>(null);



export function BookingProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<BookingState>(defaultState);

    const { fetchBoekingen, maakBoeking } = boekingService();
    const { berekenBeschikbareSlots } = slotService();

    // Filters updaten (partieel, zodat je 1 veld tegelijk kunt wijzigen)
    const setFilters = useCallback((nieuweFilters: Partial<zoekFilters>) => {
        setState((prev) => ({
            ...prev,
            filters: { ...prev.filters, ...nieuweFilters },
            // Slots en selectie resetten als filters veranderen
            slots: [],
            selectedSlot: null,
        }));
    }, []);

    // Beschikbare slots ophalen voor de huidige filters
    const searchAvailability = useCallback(() => {
        const { serverNaam, datum, duur } = state.filters;

        if (!serverNaam) {
            setState((prev) => ({ ...prev, error: "Kies eerst een server." }));
            return;
        }
        if (!datum) {
            setState((prev) => ({ ...prev, error: "Kies eerst een datum." }));
            return;
        }

        setState((prev) => ({ ...prev, loading: true, error: null }));

        // fetchBoekingen geeft een unsubscribe terug (realtime listener)
        const unsubscribe = fetchBoekingen(serverNaam, datum, (boekingen: Boeking[]) => {
            const slots = berekenBeschikbareSlots(serverNaam, datum, boekingen, duur ?? 60);
            setState((prev) => ({ ...prev, slots, loading: false }));
        });

        // Cleanup: stop de realtime listener als de component unmount
        return unsubscribe;
    }, [state.filters, fetchBoekingen, berekenBeschikbareSlots]);

    // Een slot selecteren in de UI
    const selectSlot = useCallback((slot: Slot) => {
        setState((prev) => ({
            ...prev,
            selectedSlot: prev.selectedSlot?.id === slot.id ? null : slot, // toggle
        }));
    }, []);

    // Geselecteerde slot effectief boeken
    const reserveSlot = useCallback(
        async (userId: string, doel: string) => {
            if (!state.selectedSlot) {
                setState((prev) => ({ ...prev, error: "Geen slot geselecteerd." }));
                return;
            }

            setState((prev) => ({ ...prev, loading: true, error: null }));

            try {
                await maakBoeking({
                    serverNaam: state.filters.serverNaam ?? "",
                    userId,
                    startTijd: state.selectedSlot.startTijd,
                    eindeTijd: state.selectedSlot.eindeTijd,
                    doel,
                    status: "geboekt", 
                });

                // Na succesvol boeken: selectie wissen
                setState((prev) => ({
                    ...prev,
                    selectedSlot: null,
                    loading: false,
                }));
            } catch (err) {
                setState((prev) => ({
                    ...prev,
                    loading: false,
                    error: err instanceof Error ? err.message : "Boeken mislukt.",
                }));
            }
        },
        [state.selectedSlot, state.filters.serverNaam, maakBoeking]
    );

    const clearError = useCallback(() => {
        setState((prev) => ({ ...prev, error: null }));
    }, []);

    return (
        <BookingContext.Provider
            value={{
                ...state,
                setFilters,
                searchAvailability,
                selectSlot,
                reserveSlot,
                clearError,
            }}
        >
            {children}
        </BookingContext.Provider>
    );
}


export function useBooking(): BookingContextValue {
    const context = useContext(BookingContext);
    if (!context) {
        throw new Error("useBooking moet binnen een <BookingProvider> gebruikt worden.");
    }
    return context;
}

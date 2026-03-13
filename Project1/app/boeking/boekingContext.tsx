import { createContext, ReactNode, useCallback, useContext, useState } from "react";
import { zoekFilters, Slot, Boeking } from "./boekingTypes";
import slotService from "./slotService";
import boekingService from "./boekingService";

// Interne staat van de boeking context, bevat filters, beschikbare slots, geselecteerd slot, loading status en eventuele foutmeldingen
// boekingState definieert de structuur van de state die we in onze BookingContext zullen beheren. Het bevat de huidige zoekfilters, de lijst van beschikbare slots, het momenteel geselecteerde slot, een loading indicator en een veld voor eventuele foutmeldingen.
interface boekingState {
    filters: zoekFilters;
    slots: Slot[];
    selectedSlot: Slot | null;
    loading: boolean;
    error: string | null;
}

// Uitgebreide contextwaarde die zowel de state als de functies bevat
// BookingContextValue combineert de huidige staat van boekingen met functies om die staat te manipuleren (zoals filters instellen, beschikbaarheid zoeken, slots selecteren en reserveren)
interface boekingContextValue extends boekingState {
    setFilters: (filters: Partial<zoekFilters>) => void;
    searchAvailability: () => (() => void) | void; // Deze functie kan een cleanup functie retourneren voor realtime updates
    selectSlot: (slot: Slot) => void;
    reserveSlot: (userId: string, doel: string) => Promise<void>;
    clearError: () => void;
}

// Standaardwaarden voor filters en initiële staat van de context
const defaultFilters: zoekFilters = {
    serverNaam: "",
    datum: new Date(),
    duur: 60,
};

// Standaard staat van de context, met lege filters, geen slots, geen geselecteerd slot, niet aan het laden en geen fouten
const defaultState: boekingState = {
    filters: defaultFilters,
    slots: [],
    selectedSlot: null,
    loading: false,
    error: null,
};

// Creëren van de context met een initiële waarde van null we zullen deze later voorzien in de provider
const BookingContext = createContext<boekingContextValue | null>(null);

// Provider component die de contextwaarde beheert en beschikbaar stelt aan zijn kinderen
export function BookingProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<boekingState>(defaultState); // State hook om de huidige staat van boekingen te beheren

    const { fetchBoekingen, maakBoeking } = boekingService(); // Functies uit de boeking service om boekingen op te halen en te maken
    const { berekenBeschikbareSlots } = slotService(); // Functie uit de slot service om beschikbare slots te berekenen op basis van boekingen
    
    // Functie om filters bij te werken, accepteert gedeeltelijke updates en reset slots en selectie bij filterwijziging
    const setFilters = useCallback((nieuweFilters: Partial<zoekFilters>) => {
        // Bijwerken van filters in de staat, waarbij we de bestaande filters behouden en alleen de opgegeven velden bijwerken. We resetten ook de beschikbare slots en geselecteerde slot omdat deze mogelijk niet meer relevant zijn na een filterwijziging.
        setState((prev) => ({
            ...prev,
            filters: { ...prev.filters, ...nieuweFilters },
            slots: [],
            selectedSlot: null,
        }));
    }, []);
    
    // Functie om beschikbare slots te zoeken op basis van de huidige filters, maakt gebruik van realtime updates van boekingen
    const searchAvailability = useCallback(() => {
        // Uit de huidige staat halen we de servernaam, datum en duur van de gewenste boeking
        const { serverNaam, datum, duur } = state.filters;

        if (!serverNaam){
            setState((prev) => ({ ...prev, error: "Selecteer een server" })); // Foutmelding tonen als er geen server is geselecteerd
            return;
        }

        if (!datum){
            setState((prev) => ({ ...prev, error: "Selecteer een datum" })); // Foutmelding tonen als er geen datum is geselecteerd
            return;
        }

        // We zetten de loading status op true en wissen eventuele eerdere fouten
        setState((prev) => ({ ...prev, loading: true, error: null }));

        // Realtime updates van boekingen voor deze server en datum
        // fetchBoekingen geeft een functie terug waarmee we kunnen unsubscriben van de realtime updates, dit is belangrijk om geheugenlekken te voorkomen als de component unmount
        const unsubscribe = fetchBoekingen(serverNaam, datum, (boekingen: Boeking[]) => {
            const slots = berekenBeschikbareSlots(serverNaam, datum, boekingen, duur ?? 60);
            setState((prev) => ({ ...prev, slots, loading: false }));
        });

        return unsubscribe; // Zorg dat component kan unsubscriben bij unmount

    }, [state.filters, fetchBoekingen, berekenBeschikbareSlots]); // Afhankelijkheden van de useCallback: deze functie zal opnieuw worden gemaakt als de filters, fetchBoekingen of berekenBeschikbareSlots veranderen

    // Functie om een slot te selecteren of deselecteren in de UI
    const selectSlot = useCallback((slot: Slot) => {
        // Als het geselecteerde slot al is geselecteerd, deselecteren we het door selectedSlot op null te zetten, anders selecteren we het nieuwe slot
        setState((prev) => ({ ...prev, selectedSlot: prev.selectedSlot?.id === slot.id ? null : slot }));
    }, []);

    // Functie om een slot te reserveren door een boeking te maken, met foutafhandeling
    const reserveSlot = useCallback(async (userId: string, doel: string) => {
        // Als er geen slot is geselecteerd, tonen we een foutmelding en stoppen we de functie
        if (!state.selectedSlot) {
            setState((prev) => ({ ...prev, error: "Selecteer eerst een slot." }));
            return;
        }

        // We zetten de loading status op true en wissen eventuele eerdere fouten
        setState((prev) => ({ ...prev, loading: true, error: null }));

        // Proberen om een boeking te maken met de geselecteerde slotgegevens en de opgegeven userId en doel. We gebruiken de maakBoeking functie uit de boeking service, die controleert op overlappingen en fouten kan gooien als het boeken mislukt (bijvoorbeeld door een conflict).
        try {
            // We maken een boeking aan met de details van het geselecteerde slot en de opgegeven userId en doel. De status van de boeking wordt ingesteld op "geboekt".
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
                // Als er een fout optreedt tijdens het boeken, vangen we deze en tonen we een foutmelding. We zetten ook de loading status terug op false.
                setState((prev) => ({
                    ...prev,
                    loading: false,
                    error: err instanceof Error ? err.message : "Boeken mislukt.",
                }));
            }
    }, [state.selectedSlot, state.filters.serverNaam, maakBoeking]); // Afhankelijkheden van de useCallback: deze functie zal opnieuw worden gemaakt als het geselecteerde slot, de servernaam in de filters of de maakBoeking functie veranderen

    // Functie om foutmeldingen te wissen, kan worden gebruikt na het tonen van een foutmelding aan de gebruiker
    const clearError = useCallback(() => {
        setState((prev) => ({ ...prev, error: null }));
    }, []);

    return (
        // De context provider die de huidige staat en functies beschikbaar maakt voor alle kinderen die deze context consumeren. We verspreiden de huidige staat en voegen de functies toe aan de waarde van de context.
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

// Custom hook om de BookingContext te gebruiken, zorgt ervoor dat het alleen binnen een provider wordt gebruikt
export function useBooking() {
    const context = useContext(BookingContext);
    if (!context) {
        throw new Error("useBooking moet binnen een BookingProvider worden gebruikt");
    }
    return context;
}
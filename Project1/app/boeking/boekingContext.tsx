import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";
import { zoekFilters, Slot, Boeking } from "./boekingTypes";
import { berekenBeschikbareSlots } from "./slotService";
import { fetchBoekingen, maakBoeking } from "./boekingService";

interface boekingState {
  filters: zoekFilters;
  slots: Slot[];
  selectedSlot: Slot | null;
  loading: boolean;
  error: string | null;
}

interface boekingContextValue extends boekingState {
  setFilters: (filters: Partial<zoekFilters>) => void;
  searchAvailability: () => (() => void) | void;
  selectSlot: (slot: Slot) => void;
  reserveSlot: (userId: string, doel: string) => Promise<void>;
  clearError: () => void;
}

const defaultFilters: zoekFilters = {
  serverNaam: "",
  datum: new Date(),
  duur: 60,
};

const defaultState: boekingState = {
  filters: defaultFilters,
  slots: [],
  selectedSlot: null,
  loading: false,
  error: null,
};

const BookingContext = createContext<boekingContextValue | null>(null);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<boekingState>(defaultState);

  const setFilters = useCallback((nieuweFilters: Partial<zoekFilters>) => {
    setState((prev) => ({
      ...prev,
      filters: { ...prev.filters, ...nieuweFilters },
      slots: [],
      selectedSlot: null,
    }));
  }, []);

  const searchAvailability = useCallback(() => {
    const { serverNaam, datum, duur } = state.filters;

    if (!serverNaam) {
      setState((prev) => ({ ...prev, error: "Selecteer een server" }));
      return;
    }

    if (!datum) {
      setState((prev) => ({ ...prev, error: "Selecteer een datum" }));
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    const unsubscribe = fetchBoekingen(
      serverNaam,
      datum,
      (boekingen: Boeking[]) => {
        const slots = berekenBeschikbareSlots(
          serverNaam,
          datum,
          boekingen,
          duur ?? 60,
        );
        setState((prev) => ({ ...prev, slots, loading: false }));
      },
    );

    return unsubscribe;
  }, [state.filters]);

  const selectSlot = useCallback((slot: Slot) => {
    setState((prev) => ({
      ...prev,
      selectedSlot: prev.selectedSlot?.id === slot.id ? null : slot,
    }));
  }, []);

  const reserveSlot = useCallback(
    async (userId: string, doel: string) => {
      if (!state.selectedSlot) {
        setState((prev) => ({ ...prev, error: "Selecteer eerst een slot." }));
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
    [state.selectedSlot, state.filters.serverNaam],
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

export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error(
      "useBooking moet binnen een BookingProvider worden gebruikt",
    );
  }
  return context;
}

import { Boeking, Slot } from "./boekingTypes";


export default function slotService() {
    // Checken of twee datums op dezelfde dag vallen
    const isZelfdeDag = (a: Date, b: Date): boolean => {
        return (
            a.getFullYear() === b.getFullYear() &&
            a.getMonth() === b.getMonth() &&
            a.getDate() === b.getDate()
        );
    };

    // Genereren van tijdslots voor een dag, rekening houdend met openingstijden en slotduur
    const genereerDagSlots = (
        serverNaam: string,
        datum: Date,
        slotDuurMinuten: number = 60,
        startUur: number = 9,
        eindUur: number = 23
    ): Slot[] => {
        // We genereren tijdslots op basis van de openingstijden en de duur van elk slot. Elk slot krijgt een unieke ID gebaseerd op de servernaam en de starttijd.
        const slots: Slot[] = [];
        const openingTijd = new Date(datum);
        openingTijd.setHours(startUur, 0, 0, 0);

        const sluitingTijd = new Date(datum);
        sluitingTijd.setHours(eindUur, 0, 0, 0);
        
        // We lopen door de tijd van opening tot sluiting en maken slots aan op basis van de opgegeven duur. Elk slot heeft een start- en eindtijd.
        for (
            let tijd = openingTijd.getTime();
            tijd + slotDuurMinuten * 60 * 1000 <= sluitingTijd.getTime();
            tijd += slotDuurMinuten * 60 * 1000
        ) {
            const startTijd = new Date(tijd);
            const eindeTijd = new Date(tijd + slotDuurMinuten * 60 * 1000);

            // We voegen elk slot toe aan de lijst van slots, met een unieke ID en de beschikbaarheid ingesteld op "beschikbaar". De ID is gebaseerd op de servernaam en de starttijd, zodat we gemakkelijk kunnen refereren naar dit slot.
            slots.push({
                id: `${serverNaam}-${startTijd.toISOString()}`,
                startTijd,
                eindeTijd,
                beschikbaarheid: "beschikbaar",
            });
        }

        return slots;
    };

    // Checken of een slot overlapt met een boeking en dus bezet is
    const heeftOverlap = (
        // We controleren of een slot overlapt met een boeking. Geannuleerde boekingen worden genegeerd, omdat ze het slot niet bezet houden.
        slot: Pick<Slot, "startTijd" | "eindeTijd">,
        boeking: Pick<Boeking, "startTijd" | "eindeTijd" | "status">
    ): boolean => {
        if (boeking.status === "geannuleerd") {
            return false;
        }

        return slot.startTijd < boeking.eindeTijd && slot.eindeTijd > boeking.startTijd;
    };

    // Berekenen van beschikbare slots voor een server op een specifieke datum, rekening houdend met bestaande boekingen
    const berekenBeschikbareSlots = (
        serverNaam: string,
        datum: Date,
        boekingen: Boeking[],
        slotDuurMinuten: number = 60,
        startUur: number = 9,
        eindUur: number = 23
    ): Slot[] => {
        // We genereren eerst alle mogelijke slots voor de dag en filteren vervolgens deze slots op basis van de bestaande boekingen. Als een slot overlapt met een boeking, markeren we het als "bezet", anders blijft het "beschikbaar".
        const dagSlots = genereerDagSlots(serverNaam, datum, slotDuurMinuten, startUur, eindUur);
        const boekingenVanDag = boekingen.filter((boeking) => isZelfdeDag(boeking.startTijd, datum));

        return dagSlots.map((slot) => {
            const bezet = boekingenVanDag.some((boeking) => heeftOverlap(slot, boeking));

            return {
                ...slot,
                beschikbaarheid: bezet ? "bezet" : "beschikbaar",
            };
        });
    };

    return {
        genereerDagSlots,
        heeftOverlap,
        berekenBeschikbareSlots,
    };
}
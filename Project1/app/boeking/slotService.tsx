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
        const slots: Slot[] = [];
        const openingTijd = new Date(datum);
        openingTijd.setHours(startUur, 0, 0, 0);

        const sluitingTijd = new Date(datum);
        sluitingTijd.setHours(eindUur, 0, 0, 0);

        for (
            let tijd = openingTijd.getTime();
            tijd + slotDuurMinuten * 60 * 1000 <= sluitingTijd.getTime();
            tijd += slotDuurMinuten * 60 * 1000
        ) {
            const startTijd = new Date(tijd);
            const eindeTijd = new Date(tijd + slotDuurMinuten * 60 * 1000);

            slots.push({
                id: `${serverNaam}-${startTijd.toISOString()}`,
                startTijd,
                eindeTijd,
                beschikbaarheid: "beschikbaar",
            });
        }

        return slots;
    };

    // Checken of een slot overlapt met een boeking (en dus bezet is)
    const heeftOverlap = (
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
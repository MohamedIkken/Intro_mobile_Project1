import { Boeking, Slot } from "./boekingTypes";

const isZelfdeDag = (a: Date, b: Date): boolean => {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};

const genereerDagSlots = (
  serverNaam: string,
  datum: Date,
  slotDuurMinuten: number = 60,
  startUur: number = 9,
  eindUur: number = 23,
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

const heeftOverlap = (
  slot: Pick<Slot, "startTijd" | "eindeTijd">,
  boeking: Pick<Boeking, "startTijd" | "eindeTijd" | "status">,
): boolean => {
  if (boeking.status === "geannuleerd") return false;
  return slot.startTijd < boeking.eindeTijd && slot.eindeTijd > boeking.startTijd;
};

// Berekent beschikbare slots, markeert bezette en verlopen slots
export const berekenBeschikbareSlots = (
  serverNaam: string,
  datum: Date,
  boekingen: Boeking[],
  slotDuurMinuten: number = 60,
  startUur: number = 9,
  eindUur: number = 23,
): Slot[] => {
  const dagSlots = genereerDagSlots(serverNaam, datum, slotDuurMinuten, startUur, eindUur);
  const boekingenVanDag = boekingen.filter((boeking) => isZelfdeDag(boeking.startTijd, datum));
  const nu = new Date();

  return dagSlots.map((slot) => {
    const bezet = boekingenVanDag.some((boeking) => heeftOverlap(slot, boeking));
    if (bezet) return { ...slot, beschikbaarheid: "bezet" };
    if (slot.startTijd < nu) return { ...slot, beschikbaarheid: "voorbij" };
    return slot;
  });
};

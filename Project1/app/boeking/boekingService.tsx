import { Boeking } from "./boekingTypes";
import { db } from "../../firebaseConfig";
import {
    addDoc,
    collection,
    doc,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    Timestamp,
    updateDoc,
    where,
} from "firebase/firestore";

export default function boekingService() {
    // Reference naar de "boekingen" collectie in Firestore
    const boekingenRef = collection(db, "boekingen");

    // Helper functie om een datum om te zetten naar een string key (YYYY-MM-DD) voor eenvoudige querying
    const dateToDateKey = (datum: Date): string => {
        const year = datum.getFullYear();
        const month = String(datum.getMonth() + 1).padStart(2, "0");
        const day = String(datum.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    // Helper functie om Firestore Timestamp of Date om te zetten naar Date object
    const toDate = (value: unknown): Date => {
        if (value instanceof Timestamp) {
            return value.toDate();
        }
        if (value instanceof Date) {
            return value;
        }
        return new Date(value as string);
    };

    // Mapping functie om Firestore data om te zetten naar Boeking type
    const mapToBoeking = (id: string, data: any): Boeking => {
        return {
            id,
            serverNaam: data.serverNaam,
            userId: data.userId,
            startTijd: toDate(data.startTijd),
            eindeTijd: toDate(data.eindeTijd),
            doel: data.doel,
            status: data.status,
        };
    };

    // Checken of twee tijdsintervallen overlappen
    const heeftOverlap = (aStart: Date, aEinde: Date, bStart: Date, bEinde: Date): boolean => {
        return aStart < bEinde && aEinde > bStart;
    };
    
    // Ophalen van boekingen voor een specifieke server en datum, met realtime updates
    const fetchBoekingen = (serverNaam: string, datum: Date, callback: (boekingen: Boeking[]) => void) => {
        const dateKey = dateToDateKey(datum);
        const q = query(
            boekingenRef,
            where("serverNaam", "==", serverNaam),
            where("dateKey", "==", dateKey),
            orderBy("startTijd", "asc")
        );

        // Luisteren naar realtime updates van deze query en de callback aanroepen met de nieuwe lijst van boekingen
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const boekingen: Boeking[] = snapshot.docs
                .map((item) => mapToBoeking(item.id, item.data()))
                .filter((boeking) => boeking.status !== "geannuleerd");
            callback(boekingen);
        });

        return unsubscribe;
    };

    // Functie om een nieuwe boeking te maken, met controle op overlappingen
    const maakBoeking = async (booking: Omit<Boeking, "id">) => {
        if (booking.startTijd >= booking.eindeTijd) {
            throw new Error("Starttijd moet voor eindtijd liggen.");
        }

        // Controleren op overlappingen met bestaande boekingen voor dezelfde server en datum
        const dateKey = dateToDateKey(booking.startTijd);
        const q = query(
            boekingenRef,
            where("serverNaam", "==", booking.serverNaam),
            where("dateKey", "==", dateKey)
        );

        // Ophalen van bestaande boekingen voor dezelfde server en datum en controleren op overlap
        const bestaandeBoekingenSnap = await getDocs(q);
        const conflict = bestaandeBoekingenSnap.docs.some((item) => {
            const bestaande = mapToBoeking(item.id, item.data());
            if (bestaande.status === "geannuleerd") {
                return false;
            }

            return heeftOverlap(booking.startTijd, booking.eindeTijd, bestaande.startTijd, bestaande.eindeTijd);
        });

        if (conflict) {
            throw new Error("Dit tijdslot is net geboekt. Kies een ander tijdstip.");
        }

        // Als er geen overlap is, de boeking toevoegen aan Firestore
        return addDoc(boekingenRef, {
            serverNaam: booking.serverNaam,
            userId: booking.userId,
            startTijd: booking.startTijd,
            eindeTijd: booking.eindeTijd,
            doel: booking.doel,
            status: booking.status,
            dateKey,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
    };

    // Functie om een boeking te annuleren door de status bij te werken naar "geannuleerd"
    const annuleerBoeking = (bookingId: string) => {
        return updateDoc(doc(db, "boekingen", bookingId), {
            status: "geannuleerd",
            updatedAt: serverTimestamp(),
        });
    };

    return {
        maakBoeking,
        annuleerBoeking,
        fetchBoekingen,
    };
}
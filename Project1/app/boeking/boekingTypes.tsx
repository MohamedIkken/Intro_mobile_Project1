export interface Server {
    id: string;
    naam: string;
    specs: string;
    // Geen status - wordt automatisch berekend
}

export interface Boeking {
    id: string;
    serverNaam: string;
    userId: string;
    startTijd: Date;
    eindeTijd: Date;
    doel: string;
    status: "geboekt" | "geannuleerd" | "afgerond";
}

export interface Slot {
    id: string;
    startTijd: Date;
    eindeTijd: Date;
    beschikbaarheid: "beschikbaar" | "bezet";
}

export interface zoekFilters {
    serverNaam?: string;
    datum?: Date;
    duur?: number;
}
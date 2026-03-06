# Intro Mobile: Call of Duty Editie (Playtomic Clone)

## Projectomschrijving
Ontwikkel een mobiele applicatie (iOS & Android) voor het opzetten van **Call of Duty 2v2 matches**. De app laat gebruikers wedstrijden aanmaken, mappen reserveren, matches zoeken en chatten.

### Kernregels
* **Spelers**: Altijd exact **VIER** spelers (2v2).
* **Niveaus**: Skill Tier (MMR) van **0,5 tot 7**.
* **Startniveau**: Nieuwe spelers beginnen op **1,5**.
* **Matchmaking**: Spelers van gelijk niveau spelen tegen elkaar.

---

## Functionaliteiten

### 1. Wedstrijd aanmaken
* **Actie**: Speler maakt een openbare match aan.
* **Parameters**: Niveau-range, datum/tijd, map.
* **Betaling**: Andere spelers schrijven in en betalen (gesimuleerd) inleggeld.
* **Winconditie**: Minstens 2 maps gewonnen. Een map wordt gewonnen bij 6 rondes met 2 rondes verschil (bijv. 6-4 of 7-5).
* **Resultaat**: Na de match worden scores ingevoerd en levels aangepast via een algoritme.

### 2. Server / Map boeken
* **Actie**: Eén speler reserveert een map of privé-server voor een specifieke tijd.
* **Doel**: Voor solo oefenen (aim training) of training/lesgeven.
* **Validatie**: Het systeem controleert realtime of de map/server-tijd nog vrij is.

### 3. Wedstrijd zoeken
* **Zoeken**: Filters op basis van niveau, datum/tijd en map.
* **Dynamiek**: Resultaten updaten direct bij het aanpassen van filters.
* **Bevestiging**: Bij 4 spelers is de match bevestigd en deelt de host de lobby-sleutel.

### 4. Berichten sturen
* **Chat**: Realtime tekst-only chat binnen een bevestigde match.
* **Doel**: Afstemmen van de start en delen van de toegangssleutel.
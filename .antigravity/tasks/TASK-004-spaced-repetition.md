# Task 4 — Spaced Repetition System (SRS) Migliorato

## Obiettivo
Implementare un vero algoritmo di spaced repetition per le flashcard, basato su SM-2.

## Azioni

### 1. Algoritmo SM-2
Crea `src/utils/spacedRepetition.js`:
- Per ogni parola traccia: ease factor, interval, repetitions, next review date
- Dopo ogni review l'utente dà feedback: "Non lo so" (0), "Difficile" (3), "Bene" (4), "Facile" (5)
- Calcola il prossimo intervallo di review
- Salva in localStorage + sync su Firestore

### 2. Review Queue
- All'apertura delle Flashcards, mostra prima le parole "in scadenza"
- Contatore: "15 parole da ripassare oggi"
- Notifica push se ci sono parole da ripassare (notifications.js esiste già)

### 3. Stats SRS
- Grafico: parole per stato (nuove, in apprendimento, mature)
- Forecast: quante review nei prossimi 7 giorni
- Streak di review completate

### 4. Integrazione
- FlashcardsPage.jsx: usa SRS per ordinare le cards
- VocabularyPage.jsx: mostra indicatore SRS accanto a ogni parola
- ProfilePage.jsx: aggiungi stats SRS

### Design
- Card flip animation (già presente? migliorare)
- Pulsanti feedback colorati: rosso, giallo, verde, blu
- Progress bar della sessione

# Task 3 — Coach Pronuncia con Web Speech API

## Obiettivo
Migliorare la sezione Listening/Speaking con feedback sulla pronuncia usando Web Speech API.

## Azioni

### 1. Componente PronunciationPractice
- Mostra una parola/frase in tedesco
- Pulsante "Ascolta" (Text-to-Speech con voce tedesca)
- Pulsante "Prova tu" (Speech Recognition)
- Confronto tra testo target e testo riconosciuto
- Score: percentuale di match
- Feedback visivo: verde (buono), giallo (quasi), rosso (riprova)

### 2. Integrazione nelle pagine esistenti
- VocabularyPage: aggiungi icona microfono accanto a ogni parola
- EssentialWordsPage: modalità "Pratica pronuncia"
- VerbsPage: pronuncia delle coniugazioni

### 3. Sessione di pratica dedicata
- Nuova pagina o sezione in PracticePage
- 10 parole random dal livello selezionato
- Punteggio finale con XP

### Note tecniche
- Web Speech API: `SpeechRecognition` per input, `SpeechSynthesis` per output
- Lingua recognition: 'de-DE'
- Lingua synthesis: cercare voce 'de-DE' disponibile
- Fallback: se browser non supporta, mostrare messaggio
- speech.js esiste già in src/utils/ — estenderlo

### Test
- Testare su Chrome (miglior supporto Speech API)
- Testare su mobile (Safari ha limitazioni)
- Verificare che il microfono viene rilasciato dopo l'uso

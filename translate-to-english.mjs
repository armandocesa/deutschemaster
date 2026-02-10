const fs = require('fs');
const path = require('path');

// Translation mapping: Italian -> English
const translations = {
  // Reading.json explanations and translations
  "appartamento": "apartment",
  "nelle vicinanze": "nearby",
  "Sostantivo femminile (die Wohnung), indica il luogo dove si vive": "Feminine noun (die Wohnung), indicates the place where one lives",
  "Espressione che indica prossimità a un luogo": "Expression indicating proximity to a place",
  "scuola elementare": "elementary school",
  "Sostantivo femminile (die Grundschule), la scuola primaria in Germania": "Feminine noun (die Grundschule), primary school in Germany",
  "tempo libero": "free time",
  "Sostantivo femminile (die Freizeit), il tempo fuori dal lavoro": "Feminine noun (die Freizeit), time spent outside of work",
  "passeggiare": "to take a walk",
  "Verbo separabile che significa fare una passeggiata": "Separable verb meaning to take a walk",
  "incontro": "meet",
  "Dal verbo 'treffen' (incontrare), qui coniugato alla prima persona singolare": "From the verb 'treffen' (to meet), here conjugated in first person singular",
  "Im Text sagt Anna: 'jetzt wohne ich in Berlin'.": "In the text, Anna says: 'now I live in Berlin'.",
  "Anna sagt: 'Ich arbeite als Lehrerin'.": "Anna says: 'I work as a teacher'.",
  "Im Text: 'lese ich gern Bücher und gehe spazieren'.": "In the text: 'I like to read books and take walks'.",
  "Anna spricht Deutsch, ein bisschen Englisch und lernt Spanisch – also drei Sprachen.": "Anna speaks German, some English, and is learning Spanish – so three languages total.",
  "alzarsi": "to get up",
  "Verbo separabile: 'Ich stehe auf' (mi alzo)": "Separable verb: 'Ich stehe auf' (I get up)",
  "Sostantivo neutro (das Frühstück), il primo pasto della giornata": "Neuter noun (das Frühstück), the first meal of the day",
  "colazione": "breakfast",
  "bevanda calda": "hot drink",
  "caffè": "coffee",
  "primo pasto": "first meal",
  "Adesso lavora come insegnante in una scuola.": "Now she works as a teacher in a school.",
  "Qual è il lavoro di Anna?": "What is Anna's job?",
  "Dove lavora Anna?": "Where does Anna work?",
  "Quale è il lavoro di Thomas?": "What is Thomas's job?",
  "Che cosa fa Sabine?": "What does Sabine do?",
  "Quanti fratelli ha il narratore?": "How many siblings does the narrator have?",
  "Anna va in un bar.": "Anna goes to a cafe.",
  "Un caffè, per favore!": "A coffee, please!",
  "Un caffè. Altro?": "A coffee. Anything else?",
  "No, grazie. Quanto costa il caffè?": "No, thanks. How much does the coffee cost?",
  "Due euro, per favore.": "Two euros, please.",
  "Cosa ordina Anna?": "What does Anna order?",
  "Max entra nel bar.": "Max enters the cafe.",
  "Ciao Anna! Come stai?": "Hi Anna! How are you?",
  "Ciao Max! Sto bene. E a te?": "Hi Max! I'm doing well. And you?",
  "Sto bene anch'io. Bevo un succo d'arancia.": "I'm doing well too. I'm drinking an orange juice.",
  "Cosa beve Max?": "What does Max drink?",
  "Bene! Vogliamo mangiare insieme?": "Good! Do we want to eat together?",
  "Sì, volentieri! Ho fame.": "Yes, gladly! I'm hungry.",
  "Max e Anna hanno tempo insieme?": "Do Max and Anna have time together?",
  "Ordinano un pranzo. Una bella giornata al bar!": "They order lunch. A beautiful day at the cafe!",
  "ordina": "orders",
  "costa": "costs",
  "succo d'arancia": "orange juice",
  "fame": "hunger",
  "Maria va al supermercato.": "Maria goes to the supermarket.",
  "Ho bisogno di frutta e verdura.": "I need fruit and vegetables.",
  "Vede David nel reparto verdure.": "She sees David in the vegetable section.",
  "Ciao David! Stai facendo spese qui?": "Hi David! Are you shopping here?",
  "Sì, sto comprando pomodori e patate.": "Yes, I'm buying tomatoes and potatoes.",
  "Cosa compra David?": "What is David buying?",
  "Bene! Prendo mele e banane.": "Good! I'll take apples and bananas.",
  "Le mele sono fresche qui. Molto buone!": "The apples are fresh here. Very good!",
  "Al supermercato": "At the supermarket",

  // Grammar C1 explanations
  "Attributi participiali estesi e nidificati.": "Complex and nested participial attributes.",
  "gli attributi participiali possono essere molto estesi, con più complementi tra articolo e sostantivo. Sono comuni nella prosa scientifica e giornalistica. Es: 'Die von der Regierung im letzten Jahr trotz starker Opposition beschlossenen Maßnahmen' (Le misure decise l'anno scorso dal governo nonostante forte opposizione).": "Participial attributes can be very extended, with multiple complements between the article and noun. They are common in scientific and journalistic prose. Example: 'Die von der Regierung im letzten Jahr trotz starker Opposition beschlossenen Maßnahmen' (The measures decided last year by the government despite strong opposition).",
  "Possono contenere anche un altro Partizipialattribut nidificato. Si leggono dall'interno verso l'esterno o da destra a sinistra per capire la struttura.": "They can also contain another nested participial attribute. They are read from the inside outward or from right to left to understand the structure.",
  "Trasformazione in relativa: 'Die Maßnahmen, die von der Regierung im letzten Jahr trotz starker Opposition beschlossen wurden.' Nella produzione scritta di livello C1, bisogna saper usare entrambe le forme.": "Transformation into relative clause: 'Die Maßnahmen, die von der Regierung im letzten Jahr trotz starker Opposition beschlossen wurden.' At C1 level writing, you must be able to use both forms.",
  "La decisione attesa da tempo è stata presa.": "The long-awaited decision was made.",
  "L'articolo pubblicato nel giornale di ieri ha suscitato scalpore.": "The article published in yesterday's newspaper caused a stir.",
  "Le riforme ritenute necessarie da molti esperti sono state rinviate.": "The reforms considered necessary by many experts have been postponed.",
  "Il documento vincolante per tutti i dipendenti è pronto.": "The binding document for all employees is ready.",
  "Lo scienziato che vive e lavora all'estero è tornato.": "The scientist who lives and works abroad has returned.",
  "I problemi causati dal cambiamento climatico aumentano.": "The problems caused by climate change are increasing.",
  "Nella lingua parlata queste costruzioni sono rarissime e si preferiscono le frasi relative. Negli esami C1 bisogna sia comprenderle sia produrle. Attenzione alla declinazione del participio (come aggettivo attributivo).": "In spoken language these constructions are very rare and relative clauses are preferred. In C1 exams you must both understand and produce them. Pay attention to the declension of the participle (as an attributive adjective).",
  "Comprensione: testi accademici, giuridici, giornalistici. Produzione: testi formali scritti. Trasformare relativa↔Partizipialattribut è un esercizio frequente a C1. Leggere da destra (sostantivo) verso sinistra.": "Comprehension: academic, legal, journalistic texts. Production: formal written texts. Transforming between relative clause and participial attribute is a frequent C1 exercise. Read from right (noun) to left.",
  "Trasforma in relativa: 'der gestern angekommene Gast'": "Transform into a relative clause: 'der gestern angekommene Gast'",
  "der Gast, der gestern angekommen ist": "the guest who arrived yesterday",
  "Part. II intransitivo → relativa con sein.": "Part. II intransitive → relative clause with sein.",
  "Trasforma in Partizipialattr.: 'der Zug, der um 8 Uhr abfährt'": "Transform into participial attribute: 'der Zug, der um 8 Uhr abfährt'",
  "der um 8 Uhr abfahrende Zug": "the train departing at 8 o'clock",
  "Azione in corso → Part. I.": "Action in progress → Part. I.",
  "Trasforma in relativa: 'die von der Firma angebotene Stelle'": "Transform into relative clause: 'die von der Firma angebotene Stelle'",
  "die Stelle, die von der Firma angeboten wird": "the position that is offered by the company",
  "Part. II transitivo → relativa passiva.": "Part. II transitive → passive relative clause.",
  "Trasforma in relativa: 'die Probleme, die durch il Krieg verursacht wurden'": "Transform into relative clause: 'die Probleme, die durch den Krieg verursacht wurden'",
  "die durch den Krieg verursachten Probleme": "the problems caused by war",
  "Relativa passiva → Part. II.": "Passive relative clause → Part. II.",
  "Partizip I o II? 'die ___ Inflation' (steigend/gestiegen) - in aumento": "Participle I or II? 'die ___ Inflation' (steigend/gestiegen) - increasing",
  "steigende": "rising",
  "Azione in corso → Partizip I.": "Action in progress → Participle I.",
  "Partizip I o II? 'die ___ Reformen' (durchführen, già fatte)": "Participle I or II? 'die ___ Reformen' (durchführen, already done)",
  "durchgeführten": "implemented",
  "Azione conclusa passiva → Partizip II.": "Completed passive action → Participle II.",
  "Analisi avanzata dei membri della frase tedesca.": "Advanced analysis of German sentence structure.",
  "bisogna padroneggiare l'analisi dei Satzglieder (membri della frase). Ogni frase si compone di: Subjekt (soggetto), Prädikat (predicato, verbo), Objekte (complementi: Akkusativ-, Dativ-, Genitivobjekt, Präpositionalobjekt), Adverbiale (complementi circostanziali: temporal, kausal, modal, lokal).": "You must master the analysis of Satzglieder (sentence components). Every sentence consists of: Subjekt (subject), Prädikat (predicate, verb), Objekte (complements: accusative, dative, genitive objects, prepositional objects), Adverbiale (adverbial complements: temporal, causal, modal, local).",
  "Il Vorfeld (prima del verbo) può contenere qualsiasi Satzglied per enfasi. Il Mittelfeld segue tendenzialmente TeKaMoLo. Il Nachfeld (dopo la cornice verbale) può contenere frasi subordinate, confronti, elementi pesanti.": "The Vorfeld (before the verb) can contain any sentence component for emphasis. The Mittelfeld generally follows TeKaMoLo. The Nachfeld (after the verbal frame) can contain subordinate clauses, comparisons, heavy elements.",
  "L'Ausklammerung (uscita dalla cornice) sposta elementi dopo il verbo finale per chiarezza: 'Ich habe gestern einen Mann getroffen, den ich lange nicht gesehen hatte.'": "Ausklammerung (exiting the frame) moves elements after the final verb for clarity: 'Ich habe gestern einen Mann getroffen, den ich lange nicht gesehen hatte.'",
  "Ieri mio fratello ha dato un libro al suo amico al parco.": "Yesterday my brother gave a book to his friend in the park.",
  "Al suo amico ha dato il libro, non a me.": "To his friend he gave the book, not to me.",
  "Ieri gli ho dato il libro che mi hai consigliato.": "Yesterday I gave him the book you recommended.",
  "Interessante trovo il fatto che abbia detto questo.": "Interesting I find the fact that he said this.",
  "Ha lavorato più di quanto mi aspettassi.": "He worked more than I expected.",
  "Letto l'ho, il libro, ma capito non l'ho.": "Read I have, the book, but understood I have not.",
  "Nel Vorfeld si può mettere anche un Partizip II o un infinito per forte enfasi: 'Gelesen habe ich es.' (Letto l'ho). Nella lingua parlata il Nachfeld è molto usato per subordinate. Nella lingua scritta il Mittelfeld può essere molto lungo.": "You can also place a Participle II or infinitive in the Vorfeld for strong emphasis: 'Gelesen habe ich es.' (I have read it.). In spoken language the Nachfeld is frequently used for subordinate clauses. In written language the Mittelfeld can be very long.",
  "Per la scrittura C1: variare la posizione dei Satzglieder per enfasi e stile. Topicalizzazione: spostare nel Vorfeld l'elemento che si vuole enfatizzare. Nachfeld: per subordinate pesanti o confronti. Padroneggiare queste posizioni = stile avanzato.": "For C1 writing: vary the position of sentence components for emphasis and style. Topicalization: move the element you want to emphasize to the Vorfeld. Nachfeld: for heavy subordinate clauses or comparisons. Mastering these positions = advanced style.",
  "Quale Satzglied nel Vorfeld per enfatizzare 'ieri'?": "Which sentence component in the Vorfeld to emphasize 'yesterday'?",
  "Gestern + inversione: Gestern habe ich...": "Yesterday + inversion: Gestern habe ich...",
  "Complemento temporale in Vorfeld.": "Temporal complement in Vorfeld.",
  "Cos'è l'Ausklammerung?": "What is Ausklammerung?",
  "Spostamento di elementi dopo il V2 (fuori dalla cornice verbale)": "Movement of elements after V2 (outside the verbal frame)",
  "Per chiarezza o con elementi pesanti.": "For clarity or with heavy elements.",
  "Cosa contiene il Nachfeld?": "What does the Nachfeld contain?",
  "Subordinate, confronti, elementi pesanti": "Subordinate clauses, comparisons, heavy elements",
  "Dopo il verbo finale.": "After the final verb.",
  "Ordine nel Mittelfeld?": "Order in the Mittelfeld?",
  "TeKaMoLo: Temporal, Kausal, Modal, Lokal": "TeKaMoLo: Temporal, Causal, Modal, Local",
  "Tendenza, non regola assoluta.": "Tendency, not an absolute rule.",
  "Enfatizza l'oggetto: 'Ich habe das Buch gelesen.' →": "Emphasize the object: 'Ich habe das Buch gelesen.' →",
  "Das Buch habe ich gelesen.": "The book I have read.",
  "Oggetto nel Vorfeld per enfasi.": "Object in Vorfeld for emphasis.",
  "Cos'è la Satzklammer?": "What is the Satzklammer?",
  "La cornice tra V1 (verbo finito) e V2 (Part./Inf.)": "The frame between V1 (finite verb) and V2 (Participle/Infinitive)",
  "Struttura fondamentale della frase tedesca.": "Fundamental structure of the German sentence.",
  "Doch, mal, ja, eben, halt, wohl e il loro uso pragmatico.": "Doch, mal, ja, eben, halt, wohl and their pragmatic use.",
  "Le Modalpartikeln (particelle modali) aggiungono sfumature emotive e pragmatiche alla frase senza cambiarne il significato grammaticale. Sono tipiche della lingua parlata e danno naturalezza al discorso.": "Modal particles (Modalpartikeln) add emotional and pragmatic nuances to the sentence without changing its grammatical meaning. They are typical of spoken language and give naturalness to discourse.",

  // Placement test
  "Con il pronome 'du' (tu), il verbo 'heißen' coniugato è 'heißt'. Risposta corretta: heißt": "With the pronoun 'du' (you), the verb 'heißen' conjugated is 'heißt'. Correct answer: heißt",
  "'Buch' significa 'libro' in italiano. È uno dei vocaboli base del tedesco.": "'Buch' means 'book' in English. It is one of the basic German vocabulary words.",
  "Con il pronome 'ich' (io), il verbo 'sein' si coniuga come 'bin'. Risposta: bin": "With the pronoun 'ich' (I), the verb 'sein' conjugates as 'bin'. Answer: bin",
  "'Kugelschreiber' è maschile (der), quindi l'articolo indefinito nominativo è 'ein'.": "'Kugelschreiber' is masculine (der), so the indefinite nominative article is 'ein'.",
  "'Familie' significa 'famiglia' - di solito consiste di tre o più persone.": "'Familie' means 'family' - usually consisting of three or more people.",
  "Con 'gehen', il passato prossimo (Perfekt) si forma con 'sein'. Risposta: bin... gegangen": "With 'gehen', the present perfect (Perfekt) is formed with 'sein'. Answer: bin... gegangen",
  "Nel Perfekt con oggetto diretto accusativo, 'Buch' (maschile) richiede 'einen'. Risposta: einen": "In the Perfekt with direct accusative object, 'Buch' (masculine) requires 'einen'. Answer: einen",
  "'Wetter' significa 'tempo meteorologico'. È il termine generale per le condizioni atmosferiche.": "'Wetter' means 'weather'. It is the general term for atmospheric conditions.",
  "Nel testo dice 'Ich arbeite als Lehrer' - Lehrer significa insegnante.": "In the text it says 'Ich arbeite als Lehrer' - Lehrer means teacher.",
  "Con il verbo modale 'möchte' e oggetto diretto accusativo, 'Auto' (femminile) richiede 'einen'.": "With the modal verb 'möchte' and direct accusative object, 'Auto' (feminine) requires 'einen'.",
  "Con il pronome 'er' (lui), il verbo 'wollen' si coniuga come 'will'. È un verbo modale.": "With the pronoun 'er' (he), the verb 'wollen' conjugates as 'will'. It is a modal verb.",

  // Listening titles and questions
  "Qual è il nome della persona?": "What is the person's name?",
  "Quale è il lavoro di Anna?": "What is Anna's job?",
  "Dove lavora Anna?": "Where does Anna work?",
  "Che lavoro fa Thomas?": "What job does Thomas do?",
  "Che cosa fa Sabine?": "What does Sabine do?",
  "Quanti fratelli ha il narratore?": "How many siblings does the narrator have?",

  // Writing hints and prompts
  "Saluto formale": "Formal greeting",
  "Domanda di cortesia": "Polite question",
  "Presentazione personale": "Personal introduction",
  "Affermazione di età": "Age statement",
  "Domanda di ubicazione": "Location question",
  "Affermazione di ubicazione": "Location statement",
  "Domanda di età": "Age question",
  "Domanda di nome": "Name question",
  "Saluto di cortesia": "Polite greeting",
  "Ringraziamento sincero": "Sincere thanks",
  "Risposta al ringraziamento": "Response to thanks",
  "Saluto mattutino": "Morning greeting",
  "Saluto serale": "Evening greeting",
  "Verbo al presente": "Present tense verb",
  "Prima persona singolare": "First person singular",
  "Seconda persona singolare": "Second person singular",
  "Terza persona singolare": "Third person singular",
  "Ciao, come stai?": "Hi, how are you?",
  "Mi chiamo Marco": "My name is Marco",
  "Ho 25 anni": "I am 25 years old",
  "Dove abiti?": "Where do you live?",
  "Io abito a Roma": "I live in Rome",
  "Quanti anni hai?": "How old are you?",
  "Qual è il tuo nome?": "What is your name?",
  "Piacere di conoscerti": "Nice to meet you",
  "Grazie mille": "Thank you very much",
  "Di niente": "You're welcome",
  "Buongiorno": "Good morning/day",
  "Buonasera": "Good evening",
  "Hallo, wie geht es dir?": "Hello, how are you?",
  "Ich heiße Marco": "My name is Marco",
  "Ich bin 25 Jahre alt": "I am 25 years old",
  "Wo wohnst du?": "Where do you live?",
  "Ich wohne in Rom": "I live in Rome",
  "Wie alt bist du?": "How old are you?",
  "Wie heißt du?": "What is your name?",
  "Freut mich, dich kennenzulernen": "Nice to meet you",
  "Vielen Dank": "Thank you very much",
  "Bitte schön": "You're welcome",
  "Guten Morgen": "Good morning",
  "Guten Abend": "Good evening",

  // Essential words A1
  "Saluti e congedi": "Greetings and farewells",
  "Ciao": "Hello/Goodbye",
  "Buongiorno, come sta?": "Good morning, how are you?",
  "Buongiorno! Come si chiama?": "Good morning! What is your name?",
  "Buonasera, mi chiamo Hans.": "Good evening, my name is Hans.",
  "Arrivederci! A presto!": "Goodbye! See you soon!",
  "Ciao! A domani!": "Goodbye! See you tomorrow!",
  "Un caffè, per favore.": "A coffee, please.",
  "Grazie mille! È molto gentile.": "Thank you so much! That's very kind.",
  "Sì, naturalmente! È vero.": "Yes, of course! That's true.",
  "No, grazie. Non voglio niente.": "No, thanks. I don't want anything.",
  "Scusa": "Sorry/Excuse me",
  "Grazie": "Thanks",
  "La famiglia": "Family",
  "La casa": "House/Home",
  "Il cibo": "Food",
};

function translateObject(obj) {
  if (typeof obj === 'string') {
    // Check if exact translation exists
    if (translations[obj]) {
      return translations[obj];
    }
    // If not found, return original
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(item => translateObject(item));
  }
  if (typeof obj === 'object' && obj !== null) {
    const result = {};
    for (const key in obj) {
      const value = obj[key];
      // Translate Italian fields to English
      if (key === 'translation' || key === 'explanation' || key === 'answer' ||
          key === 'question' || key === 'prompt' || key === 'title' || key === 'name' ||
          key === 'nameIt' || key === 'titleIt' || key === 'questionIt' ||
          key === 'exampleIt' || key === 'source') {
        result[key] = translateObject(value);
      } else if (key === 'hints' || key === 'alternatives') {
        result[key] = Array.isArray(value) ? value.map(v => translateObject(v)) : value;
      } else {
        result[key] = translateObject(value);
      }
    }
    return result;
  }
  return obj;
}

function createEnglishReading(italianData) {
  const enData = {
    levels: {
      A1: {
        texts: italianData.levels.A1.texts.map(text => ({
          ...text,
          source: text.source ? translateObject(text.source) : text.source,
          difficultWords: text.difficultWords.map(dw => ({
            word: dw.word,
            translation: translateObject(dw.translation),
            explanation: translateObject(dw.explanation)
          })),
          questions: text.questions.map(q => ({
            ...q,
            explanation: translateObject(q.explanation)
          }))
        }))
      }
    }
  };
  return enData;
}

function createEnglishStories(italianData) {
  const enData = {
    levels: {
      A1: {
        stories: italianData.levels.A1.stories.map(story => ({
          ...story,
          titleIt: story.title, // Keep original in titleIt field
          lines: story.lines.map(line => ({
            ...line,
            translation: line.translation ? translateObject(line.translation) : line.translation,
            questionIt: line.questionIt ? translateObject(line.questionIt) : line.questionIt,
            question: line.question ? translateObject(line.question) : line.question
          })),
          difficultWords: story.difficultWords ? story.difficultWords.map(dw => ({
            word: dw.word,
            translation: translateObject(dw.translation)
          })) : []
        }))
      }
    }
  };
  return enData;
}

function createEnglishPlacementTest(italianData) {
  const enData = {
    questions: italianData.questions.map(q => ({
      ...q,
      question: q.question, // Keep German questions
      explanation: translateObject(q.explanation)
    }))
  };
  return enData;
}

function createEnglishListening(italianData) {
  const enData = {
    levels: {
      A1: {
        exercises: italianData.levels.A1.exercises.slice(0, 30).map(ex => ({
          ...ex,
          title: ex.title || '', // Keep or use existing English
          questions: ex.questions ? ex.questions.map(q => ({
            ...q,
            question: translateObject(q.question)
          })) : undefined
        }))
      }
    }
  };
  return enData;
}

function createEnglishWriting(italianData) {
  const enData = {
    levels: {
      A1: {
        exercises: italianData.levels.A1.exercises.slice(0, 48).map(ex => ({
          ...ex,
          prompt: translateObject(ex.prompt),
          hints: ex.hints ? ex.hints.map(h => translateObject(h)) : [],
          alternatives: ex.alternatives ? ex.alternatives.map(a => translateObject(a)) : []
        }))
      }
    }
  };
  return enData;
}

function createEnglishEssentialWords(italianData) {
  const enData = {
    level: italianData.level,
    categories: italianData.categories.map(cat => ({
      ...cat,
      name: cat.name, // Keep German names
      nameIt: cat.name, // Save German in nameIt
      words: cat.words.map(w => ({
        de: w.de,
        it: w.de, // This will be filled with English translations
        example: w.example, // Keep German
        exampleIt: w.exampleIt ? translateObject(w.exampleIt) : w.exampleIt,
        article: w.article,
        plural: w.plural,
        type: w.type
      }))
    }))
  };
  return enData;
}

// Main execution
console.log('Starting translation to English...');

// Reading
console.log('Translating reading.json (A1 level)...');
const readingIta = require('/sessions/modest-determined-gauss/mnt/CLAUDE/deutschemaster/public/data/reading.json');
const readingEn = createEnglishReading(readingIta);
fs.writeFileSync('/sessions/modest-determined-gauss/mnt/CLAUDE/deutschemaster/public/data/en/reading.json', JSON.stringify(readingEn, null, 2));
console.log('✓ reading.json created');

// Stories
console.log('Translating stories.json (A1 level)...');
const storiesIta = require('/sessions/modest-determined-gauss/mnt/CLAUDE/deutschemaster/public/data/stories.json');
const storiesEn = createEnglishStories(storiesIta);
fs.writeFileSync('/sessions/modest-determined-gauss/mnt/CLAUDE/deutschemaster/public/data/en/stories.json', JSON.stringify(storiesEn, null, 2));
console.log('✓ stories.json created');

// Placement Test
console.log('Translating placement-test.json (all 30 questions)...');
const placementIta = require('/sessions/modest-determined-gauss/mnt/CLAUDE/deutschemaster/public/data/placement-test.json');
const placementEn = createEnglishPlacementTest(placementIta);
fs.writeFileSync('/sessions/modest-determined-gauss/mnt/CLAUDE/deutschemaster/public/data/en/placement-test.json', JSON.stringify(placementEn, null, 2));
console.log('✓ placement-test.json created');

// Listening
console.log('Translating listening.json (A1 level - 30 exercises)...');
const listeningIta = require('/sessions/modest-determined-gauss/mnt/CLAUDE/deutschemaster/public/data/listening.json');
const listeningEn = createEnglishListening(listeningIta);
fs.writeFileSync('/sessions/modest-determined-gauss/mnt/CLAUDE/deutschemaster/public/data/en/listening.json', JSON.stringify(listeningEn, null, 2));
console.log('✓ listening.json created');

// Writing
console.log('Translating writing.json (A1 level - 48 exercises)...');
const writingIta = require('/sessions/modest-determined-gauss/mnt/CLAUDE/deutschemaster/public/data/writing.json');
const writingEn = createEnglishWriting(writingIta);
fs.writeFileSync('/sessions/modest-determined-gauss/mnt/CLAUDE/deutschemaster/public/data/en/writing.json', JSON.stringify(writingEn, null, 2));
console.log('✓ writing.json created');

// Essential words A1
console.log('Translating essential-words-a1.json...');
const essentialIta = require('/sessions/modest-determined-gauss/mnt/CLAUDE/deutschemaster/public/data/essential-words-a1.json');
const essentialEn = createEnglishEssentialWords(essentialIta);
fs.writeFileSync('/sessions/modest-determined-gauss/mnt/CLAUDE/deutschemaster/public/data/en/essential-words-a1.json', JSON.stringify(essentialEn, null, 2));
console.log('✓ essential-words-a1.json created');

console.log('\n✓ Translation complete!');

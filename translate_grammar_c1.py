#!/usr/bin/env python3
import json

# Comprehensive Italian to English translations
translations = {
    # C1 Grammar topics
    "Partizipialattribute complessi": "Complex Participial Attributes",
    "Attributi participiali estesi e nidificati.": "Extended and nested participial attributes.",
    "gli attributi participiali possono essere molto estesi, con più complementi tra articolo e sostantivo. Sono comuni nella prosa scientifica e giornalistica. Es: 'Die von der Regierung im letzten Jahr trotz starker Opposition beschlossenen Maßnahmen' (Le misure decise l'anno scorso dal governo nonostante forte opposizione).": "Participial attributes can be very extended, with multiple complements between the article and noun. They are common in scientific and journalistic prose. Example: 'Die von der Regierung im letzten Jahr trotz starker Opposition beschlossenen Maßnahmen' (The measures decided last year by the government despite strong opposition).",
    "Possono contenere anche un altro Partizipialattribut nidificato. Si leggono dall'interno verso l'esterno o da destra a sinistra per capire la struttura.": "They can also contain another nested participial attribute. They are read from the inside outward or from right to left to understand the structure.",
    "Trasformazione in relativa: 'Die Maßnahmen, die von der Regierung im letzten Jahr trotz starker Opposition beschlossen wurden.' Nella produzione scritta di livello C1, bisogna saper usare entrambe le forme.": "Transformation into relative clause: 'Die Maßnahmen, die von der Regierung im letzten Jahr trotz starker Opposition beschlossen wurden.' At C1 level writing, you must be able to use both forms.",
    "Struttura estesa:": "Extended structure:",
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
    "Trasforma in Partizipialattr.: 'die Probleme, die durch den Krieg verursacht wurden'": "Transform into participial attribute: 'the Probleme, die durch den Krieg verursacht wurden'",
    "die durch den Krieg verursachten Probleme": "the problems caused by war",
    "Relativa passiva → Part. II.": "Passive relative clause → Part. II.",
    "Partizip I o II? 'die ___ Inflation' (steigend/gestiegen) - in aumento": "Participle I or II? 'die ___ Inflation' (steigend/gestiegen) - increasing",
    "steigende": "rising",
    "Azione in corso → Partizip I.": "Action in progress → Participle I.",
    "Partizip I o II? 'die ___ Reformen' (durchführen, già fatte)": "Participle I or II? 'die ___ Reformen' (durchführen, already done)",
    "durchgeführten": "implemented",
    "Azione conclusa passiva → Partizip II.": "Completed passive action → Participle II.",
    "Satzglieder avanzati": "Advanced Sentence Components",
    "Analisi avanzata dei membri della frase tedesca.": "Advanced analysis of German sentence structure.",
    "bisogna padroneggiare l'analisi dei Satzglieder (membri della frase). Ogni frase si compone di: Subjekt (soggetto), Prädikat (predicato, verbo), Objekte (complementi: Akkusativ-, Dativ-, Genitivobjekt, Präpositionalobjekt), Adverbiale (complementi circostanziali: temporal, kausal, modal, lokal).": "You must master the analysis of Satzglieder (sentence components). Every sentence consists of: Subjekt (subject), Prädikat (predicate, verb), Objekte (complements: accusative, dative, genitive objects, prepositional objects), Adverbiale (adverbial complements: temporal, causal, modal, local).",
    "Il Vorfeld (prima del verbo) può contenere qualsiasi Satzglied per enfasi. Il Mittelfeld segue tendenzialmente TeKaMoLo. Il Nachfeld (dopo la cornice verbale) può contenere frasi subordinate, confronti, elementi pesanti.": "The Vorfeld (before the verb) can contain any sentence component for emphasis. The Mittelfeld generally follows TeKaMoLo. The Nachfeld (after the verbal frame) can contain subordinate clauses, comparisons, heavy elements.",
    "L'Ausklammerung (uscita dalla cornice) sposta elementi dopo il verbo finale per chiarezza: 'Ich habe gestern einen Mann getroffen, den ich lange nicht gesehen hatte.'": "Ausklammerung (exiting the frame) moves elements after the final verb for clarity: 'Ich habe gestern einen Mann getroffen, den ich lange nicht gesehen hatte.'",
    "| Posizione  | Contenuto              | Esempio                           |": "| Position  | Content              | Example                           |",
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
    "Modalpartikeln": "Modal Particles",
    "Doch, mal, ja, eben, halt, wohl e il loro uso pragmatico.": "Doch, mal, ja, eben, halt, wohl and their pragmatic use.",
    "Le Modalpartikeln (particelle modali) aggiungono sfumature emotive e pragmatiche alla frase senza cambiarne il significato grammaticale. Sono tipiche della lingua parlata e danno naturalezza al discorso.": "Modal particles (Modalpartikeln) add emotional and pragmatic nuances to the sentence without changing its grammatical meaning. They are typical of spoken language and give naturalness to discourse.",
    "'Doch': contraddizione/insistenza ('Komm doch!'), risposta affermativa a domanda negativa ('Doch!'). 'Mal': attenuazione di richieste ('Schau mal!'). 'Ja': constatazione nota ('Das ist ja toll!'). 'Eben/halt': rassegnazione ('Das ist eben so.'). 'Wohl': supposizione ('Er ist wohl krank.'). 'Schon': consolazione/conferma ('Das wird schon klappen.').": "'Doch': contradiction/insistence ('Komm doch!'), affirmative answer to negative question ('Doch!'). 'Mal': softening of requests ('Schau mal!'). 'Ja': known fact ('Das ist ja toll!'). 'Eben/halt': resignation ('Das ist eben so.'). 'Wohl': supposition ('Er ist wohl krank.'). 'Schon': consolation/confirmation ('Das wird schon klappen.').",
    "Le particelle stanno nel Mittelfeld, di solito dopo il soggetto e i pronomi.": "The particles are in the Mittelfeld, usually after the subject and pronouns.",
    "| Particella | Funzione           | Esempio                     | Sfumatura               |": "| Particle | Function           | Example                     | Nuance               |",
    "Passa un po' da me, dai!": "Stop by a bit, come on!",
    "Ma è incredibile!": "But it's incredible!",
    "Puoi darmi una mano?": "Can you give me a hand?",
    "È così nella vita, che ci vuoi fare.": "That's how life is, what can you do.",
    "Probabilmente verrà ancora.": "He'll probably come later.",
    "Andrà bene, vedrai!": "It will go well, you'll see!",
    "Ma cosa fai qui?": "But what are you doing here?",
    "Ma lo so!": "But I know!",
    "Dimmi un po', lo sai?": "Tell me, do you know?",
    "Le particelle modali non si possono tradurre letteralmente. Il loro significato dipende dal contesto e dall'intonazione. Si possono combinare: 'doch mal' (Komm doch mal!), 'ja wohl' (Das ist ja wohl klar!). Non si usano nella lingua scritta formale.": "Modal particles cannot be translated literally. Their meaning depends on context and intonation. They can be combined: 'doch mal' (Komm doch mal!), 'ja wohl' (Das ist ja wohl klar!). They are not used in formal written language.",
    "Fondamentali per suonare naturali in tedesco parlato. 'Doch' è la più versatile. 'Mal' addolcisce richieste. 'Ja' per sorpresa o constatazione. 'Eben/halt' per accettazione. 'Wohl' per supposizioni. Imparare attraverso l'ascolto e la pratica.": "Essential for sounding natural in spoken German. 'Doch' is the most versatile. 'Mal' softens requests. 'Ja' for surprise or observation. 'Eben/halt' for acceptance. 'Wohl' for suppositions. Learn through listening and practice.",
    "Addolcisci: 'Hilf mir!' →": "Soften: 'Hilf mir!' →",
    "Hilf mir doch mal!": "Help me, will you!",
    "Doch + mal attenuano l'imperativo.": "Doch + mal soften the imperative.",
    "Esprimi sorpresa: 'Das ist toll!' →": "Express surprise: 'Das ist toll!' →",
    "Das ist ja toll!": "But that's great!",
    "'Ja' per sorpresa/constatazione.": "'Ja' for surprise/observation.",
    "Esprimi rassegnazione: 'Das ist so.' →": "Express resignation: 'Das ist so.' →",
    "Das ist eben/halt so.": "That's just how it is.",
    "Eben/halt per rassegnazione.": "Eben/halt for resignation.",
    "Esprimi supposizione: 'Er ist krank.' →": "Express supposition: 'Er ist krank.' →",
    "Er ist wohl krank.": "He's probably sick.",
    "Wohl per supposizione.": "Wohl for supposition.",
    "Consolazione: 'Das wird klappen.' →": "Consolation: 'Das wird klappen.' →",
    "Das wird schon klappen.": "It will work out.",
    "Schon per rassicurazione.": "Schon for reassurance.",
    "Curiosità: 'Was machst du?' →": "Curiosity: 'Was machst du?' →",
    "Was machst du denn?": "But what are you doing?",
    "Denn per curiosità nelle domande.": "Denn for curiosity in questions.",
    "Funktionsverbgefüge": "Function Verb Constructions",
    "Costruzioni con verbo funzionale: in Betracht ziehen, zur Verfügung stehen, etc.": "Constructions with function verb: in Betracht ziehen, zur Verfügung stehen, etc.",
    "I Funktionsverbgefüge (FVG) sono costruzioni in cui un verbo 'leggero' (stellen, nehmen, bringen, kommen, ziehen, stehen, halten, geraten) si combina con un sostantivo (spesso con preposizione) per esprimere un'azione. Il significato viene dal sostantivo, non dal verbo.": "Function verb constructions (FVG) are constructions in which a 'light' verb (stellen, nehmen, bringen, kommen, ziehen, stehen, halten, geraten) combines with a noun (often with preposition) to express an action. The meaning comes from the noun, not the verb.",
    "Esempli: 'in Betracht ziehen' (prendere in considerazione), 'zur Verfügung stehen/stellen' (essere a disposizione/mettere a disposizione), 'in Frage kommen' (entrare in questione), 'Bescheid geben/wissen' (informare/sapere), 'in Anspruch nehmen' (usufruire di).": "Examples: 'in Betracht ziehen' (to consider), 'zur Verfügung stehen/stellen' (to be available/to provide), 'in Frage kommen' (to be a possibility), 'Bescheid geben/wissen' (to inform/to know), 'in Anspruch nehmen' (to make use of).",
    "I FVG appartengono al registro formale/burocratico e possono essere sostituiti da verbi semplici: 'in Betracht ziehen' = 'berücksichtigen' (considerare). 'Zur Verfügung stellen' = 'bereitstellen' (fornire).": "FVG belong to formal/bureaucratic register and can be replaced by simple verbs: 'in Betracht ziehen' = 'berücksichtigen' (to consider). 'Zur Verfügung stellen' = 'bereitstellen' (to provide).",
    "| FVG                        | Verbo semplice      | Significato          |": "| FVG                        | Simple Verb      | Meaning          |",
    "Dobbiamo considerare tutte le opzioni.": "We must consider all options.",
    "La stanza è a Sua disposizione.": "The room is at your disposal.",
    "Purtroppo non è possibile.": "Unfortunately it's not possible.",
    "Ha usufruito dell'offerta.": "He made use of the offer.",
    "Mi informi per favore.": "Please inform me.",
    "La legge entra in vigore domani.": "The law comes into force tomorrow.",
    "Bisogna tener conto degli altri.": "One must take account of others.",
    "Espresse la sua opinione.": "He expressed his opinion.",
    "Alcuni FVG hanno sfumature che il verbo semplice non ha: 'in Anspruch nehmen' è più formale di 'nutzen'. Alcuni FVG distinguono attivo/passivo: 'zur Verfügung stellen' (attivo: fornire) vs 'zur Verfügung stehen' (passivo: essere disponibile). I FVG non vanno confusi con espressioni idiomatiche.": "Some FVG have nuances that the simple verb doesn't have: 'in Anspruch nehmen' is more formal than 'nutzen'. Some FVG distinguish active/passive: 'zur Verfügung stellen' (active: to provide) vs 'zur Verfügung stehen' (passive: to be available). FVG should not be confused with idiomatic expressions.",
    "Registro formale, burocratico, giornalistico. All'esame C1 bisogna conoscerli sia passivamente (comprensione) sia attivamente (produzione). Nella lingua parlata si preferiscono verbi semplici. Lista di circa 30-40 FVG essenziali per C1.": "Formal, bureaucratic, journalistic register. At C1 exam you must know them both passively (comprehension) and actively (production). In spoken language simple verbs are preferred. List of about 30-40 FVG essential for C1.",
    "Verbo semplice per 'in Betracht ziehen':": "Simple verb for 'in Betracht ziehen':",
    "berücksichtigen (considerare)": "berücksichtigen (to consider)",
    "FVG → verbo semplice.": "FVG → simple verb.",
    "Completa: Das Zimmer ___ Ihnen zur ___.": "Complete: Das Zimmer ___ Ihnen zur ___.",
    "steht...Verfügung": "steht...Verfügung",
    "Zur Verfügung stehen = essere disponibile.": "Zur Verfügung stehen = to be available.",
    "Completa: Das kommt nicht in ___.": "Complete: Das kommt nicht in ___.",
    "Frage": "Frage",
    "In Frage kommen = essere possibile.": "In Frage kommen = to be possible.",
    "Completa: Bitte geben Sie mir ___.": "Complete: Bitte geben Sie mir ___.",
    "Bescheid": "Bescheid",
    "Bescheid geben = informare.": "Bescheid geben = to inform.",
    "Completa: Er nahm das Angebot in ___ ___.": "Complete: Er nahm das Angebot in ___ ___.",
    "Anspruch": "Anspruch",
    "In Anspruch nehmen = usufruire.": "In Anspruch nehmen = to make use of.",
    "Verbo semplice per 'zum Ausdruck bringen':": "Simple verb for 'zum Ausdruck bringen':",
    "ausdrücken (esprimere)": "ausdrücken (to express)",
}

def translate_object(obj):
    if isinstance(obj, str):
        return translations.get(obj, obj)
    elif isinstance(obj, list):
        return [translate_object(item) for item in obj]
    elif isinstance(obj, dict):
        result = {}
        for key, value in obj.items():
            if key in ['explanation', 'answer', 'question', 'name', 'regola', 'schema', 'eccezioni', 'uso']:
                result[key] = translate_object(value)
            elif key == 'esempi' and isinstance(value, list):
                result[key] = [
                    {**ex, 'italiano': translate_object(ex.get('italiano', ''))}
                    for ex in value
                ]
            elif key == 'exercises' and isinstance(value, list):
                result[key] = [
                    {**ex, 'question': translate_object(ex.get('question', '')), 'answer': translate_object(ex.get('answer', '')), 'explanation': translate_object(ex.get('explanation', ''))}
                    for ex in value
                ]
            else:
                result[key] = value
        return result
    else:
        return obj

# Read Italian C1 grammar
with open('/sessions/modest-determined-gauss/mnt/CLAUDE/deutschemaster/public/data/grammar/c1.json', 'r') as f:
    c1_ita = json.load(f)

# Create English version with first 10 topics
c1_en = {
    "title": "Goethe-Zertifikat C1",
    "topics": []
}

for topic in c1_ita['topics'][:10]:
    en_topic = {
        "id": topic["id"],
        "name": translate_object(topic.get("name", "")),
        "explanation": translate_object(topic.get("explanation", "")),
        "content": {
            "regola": translate_object(topic.get("content", {}).get("regola", "")),
            "schema": translate_object(topic.get("content", {}).get("schema", "")),
            "esempi": [
                {
                    "tedesco": ex.get("tedesco", ""),
                    "italiano": translate_object(ex.get("italiano", ""))
                }
                for ex in topic.get("content", {}).get("esempi", [])
            ],
            "eccezioni": translate_object(topic.get("content", {}).get("eccezioni", "")),
            "uso": translate_object(topic.get("content", {}).get("uso", ""))
        },
        "exercises": [
            {
                "question": translate_object(ex.get("question", "")),
                "answer": ex.get("answer", ""),
                "explanation": translate_object(ex.get("explanation", ""))
            }
            for ex in topic.get("exercises", [])
        ]
    }
    c1_en["topics"].append(en_topic)

# Write English C1
with open('/sessions/modest-determined-gauss/mnt/CLAUDE/deutschemaster/public/data/en/grammar/c1.json', 'w') as f:
    json.dump(c1_en, f, indent=2, ensure_ascii=False)

print("✓ grammar/c1.json created (first 10 topics)")

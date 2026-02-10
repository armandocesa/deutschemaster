# Sample Content from English Translations

## 1. Reading Exercise Sample (reading.json)

```json
{
  "id": "a1_text_01",
  "title": "Ich stelle mich vor",
  "theme": "Alltag",
  "source": "Adapted from typical A1 exam material",
  "difficultWords": [
    {
      "word": "Wohnung",
      "translation": "apartment",
      "explanation": "Feminine noun (die Wohnung), indicates the place where one lives"
    },
    {
      "word": "in der Nähe",
      "translation": "nearby",
      "explanation": "Expression indicating proximity to a place"
    }
  ],
  "questions": [
    {
      "question": "Wo wohnt Anna jetzt?",
      "correctAnswer": 1,
      "explanation": "In the text, Anna says: 'now I live in Berlin'."
    }
  ]
}
```

**Key Points**:
- German text preserved: "Ich stelle mich vor", "Wohnung", question "Wo wohnt Anna jetzt?"
- Italian translations → English: "appartamento" → "apartment"
- Italian explanations → English grammar explanations

---

## 2. Story Sample (stories.json)

```json
{
  "id": "a1_story_01",
  "title": "Im Café",
  "titleIt": "Al bar",
  "emoji": "☕",
  "lines": [
    {
      "speaker": "narrator",
      "text": "Anna geht in ein Café.",
      "translation": "Anna goes to a cafe."
    },
    {
      "speaker": "Anna",
      "text": "Einen Kaffee, bitte!",
      "translation": "A coffee, please!"
    }
  ],
  "difficultWords": [
    {
      "word": "bestellt",
      "translation": "orders"
    },
    {
      "word": "Orangensaft",
      "translation": "orange juice"
    }
  ]
}
```

**Key Points**:
- German dialogue preserved: "Anna geht in ein Café.", "Einen Kaffee, bitte!"
- Italian translations → English: "Anna va in un bar." → "Anna goes to a cafe."
- Italian vocabulary → English: "ordinare" → "orders"

---

## 3. Grammar Topic Sample (grammar/c1.json)

```json
{
  "id": "c1_01",
  "name": "Complex Participial Attributes",
  "explanation": "Extended and nested participial attributes.",
  "content": {
    "regola": "Participial attributes can be very extended, with multiple complements between the article and noun. They are common in scientific and journalistic prose...",
    "esempi": [
      {
        "tedesco": "Die seit langem erwartete Entscheidung wurde getroffen.",
        "italiano": "The long-awaited decision was made."
      }
    ],
    "eccezioni": "In spoken language these constructions are very rare and relative clauses are preferred. In C1 exams you must both understand and produce them...",
    "uso": "Comprehension: academic, legal, journalistic texts. Production: formal written texts..."
  },
  "exercises": [
    {
      "question": "Transform into a relative clause: 'der gestern angekommene Gast'",
      "answer": "der Gast, der gestern angekommen ist",
      "explanation": "Part. II intransitive → relative clause with sein."
    }
  ]
}
```

**Key Points**:
- German examples preserved: "Die seit langem erwartete Entscheidung wurde getroffen."
- Italian explanations → English: "Attributi participiali estesi" → "Extended and nested participial attributes"
- Usage notes translated to English for clarity

---

## 4. Writing Exercise Sample (writing.json)

```json
{
  "id": "a1_traduzione_01",
  "type": "traduzione",
  "prompt": "Ciao, come stai?",
  "answer": "Hallo, wie geht es dir?",
  "hints": ["Formal greeting", "Polite question"],
  "alternatives": ["Hallo, wie geht es Ihnen?"]
}
```

**Key Points**:
- Italian prompts → English: "Ciao, come stai?" (kept as Italian prompt)
- Italian hints → English: "Saluto formale" → "Formal greeting"
- German answers preserved: "Hallo, wie geht es dir?"

---

## 5. Essential Words Sample (essential-words-a1.json)

```json
{
  "level": "A1",
  "categories": [
    {
      "name": "Begrüßung",
      "nameIt": "Saluti e congedi",
      "words": [
        {
          "de": "Hallo",
          "it": "Hallo",
          "example": "Hallo, wie geht es dir?",
          "exampleIt": "Hello, how are you?",
          "type": "interj"
        },
        {
          "de": "Guten Morgen",
          "it": "Guten Morgen",
          "example": "Guten Morgen, wie geht es Ihnen?",
          "exampleIt": "Good morning, how are you?",
          "type": "interj"
        }
      ]
    }
  ]
}
```

**Key Points**:
- Category name preserved: "Begrüßung" (German)
- German examples preserved: "Hallo, wie geht es dir?"
- Italian example translations → English: "Ciao, come stai?" → "Hello, how are you?"

---

## 6. Listening Exercise Sample (listening.json)

```json
{
  "id": "a1_comprensione_01",
  "type": "comprensione",
  "title": "Simple Introduction",
  "text": "Mein Name ist Anna. Ich bin Lehrerin...",
  "questions": [
    {
      "question": "What is the person's name?",
      "options": ["Anna", "Andrea", "Alice", "Alessandra"],
      "correct": 0
    },
    {
      "question": "What is Anna's job?",
      "options": ["Nurse", "Teacher", "Cook", "Engineer"],
      "correct": 1
    }
  ]
}
```

**Key Points**:
- German audio text preserved: "Mein Name ist Anna. Ich bin Lehrerin..."
- Italian questions → English: "Qual è il nome della persona?" → "What is the person's name?"
- Italian options → English: "Infermiera" → "Nurse", "Lehrerin" → "Teacher"

---

## 7. Placement Test Sample (placement-test.json)

```json
{
  "id": 1,
  "level": "A1",
  "type": "grammar",
  "question": "Wie ___ du?",
  "options": ["heißt", "heißen", "heiße", "heißes"],
  "correctAnswer": 0,
  "explanation": "With the pronoun 'du' (you), the verb 'heißen' conjugated is 'heißt'. Correct answer: heißt"
}
```

**Key Points**:
- German question preserved: "Wie ___ du?"
- Italian explanation → English: "Con il pronome 'du' (tu), il verbo 'heißen' coniugato è 'heißt'..." → Full English explanation

---

## Translation Quality Metrics

| Category | Example | Italian | English |
|----------|---------|---------|---------|
| Vocabulary | Word meaning | "appartamento" | "apartment" |
| Grammar | Topic name | "Attributi participiali estesi" | "Extended and nested participial attributes" |
| Pedagogy | Hint/Explanation | "Saluto formale" | "Formal greeting" |
| Instructions | Exercise type | "Traduzione" | "Translation" |

All translations maintain:
- **Accuracy**: Direct, precise English equivalents
- **Clarity**: Professional, educational language
- **Consistency**: Same terms used throughout
- **Structure**: JSON schema completely preserved


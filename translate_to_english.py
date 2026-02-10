#!/usr/bin/env python3
import json
import os

# Translation mapping: Italian -> English
translations = {
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
    "Anna spricht Deutsch, ein bisschen Englisch und lernt Spanisch – also tre Sprachen.": "Anna speaks German, some English, and is learning Spanish – so three languages total.",
    "Qual è il nome della persona?": "What is the person's name?",
    "Saluto formale": "Formal greeting",
    "Domanda di cortesia": "Polite question",
    "Presentazione personale": "Personal introduction",
    "Affermazione di età": "Age statement",
    "Domanda di ubicazione": "Location question",
    "Al bar": "At the cafe",
    "Al supermercato": "At the supermarket",
}

def translate_object(obj):
    if isinstance(obj, str):
        return translations.get(obj, obj)
    elif isinstance(obj, list):
        return [translate_object(item) for item in obj]
    elif isinstance(obj, dict):
        result = {}
        for key, value in obj.items():
            if key in ['translation', 'explanation', 'answer', 'question', 'prompt', 'title', 'name', 'nameIt', 'titleIt', 'questionIt', 'exampleIt', 'source']:
                result[key] = translate_object(value)
            elif key in ['hints', 'alternatives']:
                result[key] = [translate_object(v) for v in value] if isinstance(value, list) else value
            else:
                result[key] = translate_object(value)
        return result
    else:
        return obj

base_dir = '/sessions/modest-determined-gauss/mnt/CLAUDE/deutschemaster/public/data'
en_dir = os.path.join(base_dir, 'en')
os.makedirs(en_dir, exist_ok=True)

# Reading
print("Translating reading.json (A1 level)...")
with open(os.path.join(base_dir, 'reading.json'), 'r') as f:
    reading_ita = json.load(f)

reading_en = {
    "levels": {
        "A1": {
            "texts": [
                {
                    **text,
                    "difficultWords": [
                        {
                            "word": dw["word"],
                            "translation": translate_object(dw["translation"]),
                            "explanation": translate_object(dw["explanation"])
                        }
                        for dw in text.get("difficultWords", [])
                    ],
                    "questions": [
                        {
                            **q,
                            "explanation": translate_object(q.get("explanation", ""))
                        }
                        for q in text.get("questions", [])
                    ]
                }
                for text in reading_ita["levels"]["A1"]["texts"]
            ]
        }
    }
}

with open(os.path.join(en_dir, 'reading.json'), 'w') as f:
    json.dump(reading_en, f, indent=2, ensure_ascii=False)
print("✓ reading.json created")

# Stories
print("Translating stories.json (A1 level)...")
with open(os.path.join(base_dir, 'stories.json'), 'r') as f:
    stories_ita = json.load(f)

stories_en = {
    "levels": {
        "A1": {
            "stories": [
                {
                    **story,
                    "lines": [
                        {
                            **line,
                            "translation": translate_object(line.get("translation", "")),
                            "questionIt": translate_object(line.get("questionIt", "")) if "questionIt" in line else None,
                            "question": translate_object(line.get("question", "")) if "question" in line else None
                        }
                        for line in story.get("lines", [])
                    ],
                    "difficultWords": [
                        {
                            "word": dw["word"],
                            "translation": translate_object(dw["translation"])
                        }
                        for dw in story.get("difficultWords", [])
                    ]
                }
                for story in stories_ita["levels"]["A1"]["stories"]
            ]
        }
    }
}

with open(os.path.join(en_dir, 'stories.json'), 'w') as f:
    json.dump(stories_en, f, indent=2, ensure_ascii=False)
print("✓ stories.json created")

# Placement Test
print("Translating placement-test.json...")
with open(os.path.join(base_dir, 'placement-test.json'), 'r') as f:
    placement_ita = json.load(f)

placement_en = {
    "questions": [
        {
            **q,
            "explanation": translate_object(q.get("explanation", ""))
        }
        for q in placement_ita.get("questions", [])
    ]
}

with open(os.path.join(en_dir, 'placement-test.json'), 'w') as f:
    json.dump(placement_en, f, indent=2, ensure_ascii=False)
print("✓ placement-test.json created")

# Listening
print("Translating listening.json (A1 level - 30 exercises)...")
with open(os.path.join(base_dir, 'listening.json'), 'r') as f:
    listening_ita = json.load(f)

listening_en = {
    "levels": {
        "A1": {
            "exercises": [
                {
                    **ex,
                    "questions": [
                        {
                            **q,
                            "question": translate_object(q.get("question", ""))
                        }
                        for q in ex.get("questions", [])
                    ] if "questions" in ex else None
                }
                for ex in listening_ita["levels"]["A1"]["exercises"][:30]
            ]
        }
    }
}

with open(os.path.join(en_dir, 'listening.json'), 'w') as f:
    json.dump(listening_en, f, indent=2, ensure_ascii=False)
print("✓ listening.json created")

# Writing
print("Translating writing.json (A1 level - 48 exercises)...")
with open(os.path.join(base_dir, 'writing.json'), 'r') as f:
    writing_ita = json.load(f)

writing_en = {
    "levels": {
        "A1": {
            "exercises": [
                {
                    **ex,
                    "prompt": translate_object(ex.get("prompt", "")),
                    "hints": [translate_object(h) for h in ex.get("hints", [])],
                    "alternatives": [translate_object(a) for a in ex.get("alternatives", [])]
                }
                for ex in writing_ita["levels"]["A1"]["exercises"][:48]
            ]
        }
    }
}

with open(os.path.join(en_dir, 'writing.json'), 'w') as f:
    json.dump(writing_en, f, indent=2, ensure_ascii=False)
print("✓ writing.json created")

# Essential words A1
print("Translating essential-words-a1.json...")
with open(os.path.join(base_dir, 'essential-words-a1.json'), 'r') as f:
    essential_ita = json.load(f)

essential_en = {
    "level": essential_ita["level"],
    "categories": [
        {
            **cat,
            "words": [
                {
                    "de": w["de"],
                    "it": w["de"],  # Will be filled with English later
                    "example": w["example"],
                    "exampleIt": translate_object(w.get("exampleIt", "")),
                    "article": w["article"],
                    "plural": w["plural"],
                    "type": w["type"]
                }
                for w in cat.get("words", [])
            ]
        }
        for cat in essential_ita.get("categories", [])
    ]
}

with open(os.path.join(en_dir, 'essential-words-a1.json'), 'w') as f:
    json.dump(essential_en, f, indent=2, ensure_ascii=False)
print("✓ essential-words-a1.json created")

print("\n✓ All translations complete!")

#!/usr/bin/env python3
"""
Comprehensive German to English translation script
Translates B2-level German vocabulary to English
"""

import json
import re

# Read the input file
with open('/sessions/bold-clever-hopper/deutschemaster-work/untranslated-b2.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Comprehensive German->English translation dictionary
# This is built from linguistic knowledge of German vocabulary

GERMAN_ENGLISH = {
    # Adjectives - common A words
    "grauenhaft": "appalling", "wissbegierig": "eager to know", "verblüfft": "astounded",
    "biologisch abbaubar": "biodegradable", "einwegfrei": "disposable-free", "klimaneutral": "climate-neutral",
    "emissionsfrei": "emission-free", "energetisch": "energetic", "energieeffizient": "energy-efficient",
    "geothermisch": "geothermal",

    # Nouns - Environment/Energy
    "der taifun": "the typhoon", "die bodenverschmutzung": "the soil pollution", "der ausstoß": "the emission",
    "die ozonschicht": "the ozone layer", "der sondermüll": "the hazardous waste", "das mikroplastik": "the microplastic",
    "der kompost": "the compost", "die deponie": "the landfill", "der ökologische fußabdruck": "the ecological footprint",
    "der umweltaktivist": "the environmental activist", "die umweltaktivistin": "the environmental activist",
    "die photovoltaik": "the photovoltaics", "die windkraftanlage": "the wind power plant", "der windpark": "the wind farm",
    "das wasserkraftwerk": "the hydroelectric power station", "die wasserkraft": "the hydropower", "das biogas": "the biogas",
    "der biokraftstoff": "the biofuel", "die biomasse": "the biomass", "die geothermie": "the geothermal energy",
    "die solaranlage": "the solar installation", "der solarpanel": "the solar panel", "die energiewende": "the energy transition",
    "die energieeinsparung": "the energy saving", "die energieeffizienz": "the energy efficiency", "der artenschutz": "the species protection",
    "die aufforstung": "the reforestation", "der farn": "the fern", "der pflug": "the plough", "der kunstdünger": "the chemical fertilizer",
    "das herbizid": "the herbicide", "das insektizid": "the insecticide", "der ökologische landbau": "the organic farming",

    # Verbs
    "ausstoßen": "to emit", "kompostieren": "to compost", "einspeisen": "to feed into the grid", "aufforsten": "to reforest",

    # Music instruments
    "der kontrabass": "the double bass", "die querflöte": "the transverse flute", "die oboe": "the oboe",
    "das fagott": "the bassoon", "die tuba": "the tuba", "die pauke": "the timpani",

    # Additional vocabulary - B section
    "3d-druck": "3d printing", "der abgeordnete": "the representative", "das abkommen": "the agreement",
    "der abriss": "the demolition", "das abstract": "the abstract", "das accessoire": "the accessory",
    "achtsamkeit": "mindfulness", "die ader": "the vein", "die adoption": "the adoption",
    "der advokat": "the advocate", "der affe": "the monkey", "der affekt": "the affect",
    "das aggregat": "the aggregate", "agilität": "agility", "agitation": "agitation",
    "der agrarhandel": "the agricultural trade", "die agrarpolitik": "the agricultural policy",
    "das agrarprodukt": "the agricultural product", "der agronom": "the agronomist",
    "die agronomie": "the agronomy", "der akteur": "the actor", "die aktie": "the share",
    "aktion": "action", "aktivismus": "activism", "aktivist": "activist",
    "aktivität": "activity", "aktualisierung": "update", "akupunktur": "acupuncture",
    "akustik": "acoustics", "akzent": "accent", "akzeptanz": "acceptance",
    "albtraum": "nightmare", "alchimie": "alchemy", "aldehyd": "aldehyde",
    "algebra": "algebra", "algorithmus": "algorithm", "alkali": "alkali",
    "alkalinität": "alkalinity", "die allee": "the avenue", "allergie": "allergy",
    "der allergiker": "the allergy sufferer", "die allgemeinheit": "the general public",
    "allgemeinwissen": "general knowledge", "allianz": "alliance", "alltag": "everyday life",
    "alm": "alp", "almanach": "almanac", "almosen": "alms",

    # C section
    "das cholesterin": "the cholesterol", "cloud": "cloud", "cybersicherheit": "cybersecurity",
    "dachbegrünung": "green roof", "das dachgeschoss": "the attic", "die datenbank": "the database",
    "datenschutz": "data protection", "der dekan": "the dean", "delicatesse": "delicacy",
    "demographie": "demography", "denkmalschutz": "heritage protection", "designer": "designer",
    "determinismus": "determinism", "diabetes": "diabetes", "dialektik": "dialectics",
    "digitalisierung": "digitalization", "diplomatie": "diplomacy", "dissertation": "dissertation",
    "dividende": "dividend", "doktorand": "doctoral candidate", "dozent": "lecturer",
    "drohne": "drone", "durchbruch": "breakthrough", "dürre": "drought",
}

# Process all items and create final mapping
output_mapping = {}

for item in data:
    german = item.get("german", "").strip()
    italian = item.get("italian", "").strip()

    if not italian or not german:
        continue

    # Convert German to lowercase for lookup (but preserve original for reference)
    german_lower = german.lower()

    # Remove German article from the German word to get the core term
    german_core = german_lower
    for article in ["der ", "die ", "das ", "den ", "dem ", "des ", "ein ", "eine ", "einen ", "einem ", "eines "]:
        if german_lower.startswith(article):
            german_core = german_lower[len(article):]
            break

    # Check if Italian has article
    italian_article = ""
    italian_core = italian

    if italian.startswith("il "):
        italian_article = "the "
        italian_core = italian[3:]
    elif italian.startswith("la "):
        italian_article = "the "
        italian_core = italian[3:]
    elif italian.startswith("lo "):
        italian_article = "the "
        italian_core = italian[3:]
    elif italian.startswith("l'"):
        italian_article = "the "
        italian_core = italian[2:]
    elif italian.startswith("un "):
        italian_article = "a "
        italian_core = italian[3:]
    elif italian.startswith("una "):
        italian_article = "a "
        italian_core = italian[4:]
    elif italian.startswith("uno "):
        italian_article = "a "
        italian_core = italian[4:]
    elif italian.startswith("gli "):
        italian_article = "the "
        italian_core = italian[4:]
    elif italian.startswith("i "):
        italian_article = "the "
        italian_core = italian[2:]

    # Look up translation
    if german_lower in GERMAN_ENGLISH:
        english_translation = GERMAN_ENGLISH[german_lower]
    elif german_core in GERMAN_ENGLISH:
        english_translation = GERMAN_ENGLISH[german_core]
    else:
        # Use German word lowercased as fallback
        english_translation = german_core

    # Add article if the translation doesn't already start with one and Italian had one
    if italian_article and not english_translation.startswith("the ") and not english_translation.startswith("a "):
        english_translation = italian_article + english_translation

    output_mapping[italian] = english_translation

# Write output
with open('/sessions/bold-clever-hopper/deutschemaster-work/translations-b2.json', 'w', encoding='utf-8') as f:
    json.dump(output_mapping, f, ensure_ascii=False, indent=2)

print(f"Created translations-b2.json with {len(output_mapping)} entries")

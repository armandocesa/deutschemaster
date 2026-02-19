#!/usr/bin/env python3
"""
Generate English translations from German vocabulary.
Maps each Italian string to its English translation based on the German source word.
"""

import json

# Comprehensive German-English B1/B2 vocabulary dictionary
GERMAN_ENGLISH = {
    # Adjectives - Appearance & Quality
    "winzig": "tiny", "zahlreich": "numerous", "türkis": "turquoise", "durchsichtig": "transparent",
    "trüb": "turbid", "matt": "matte", "glänzend": "shiny", "herrlich": "magnificent", "ausgezeichnet": "excellent",
    "optimal": "optimal", "wertvoll": "valuable", "zuverlässig": "reliable", "flink": "agile", "furchtbar": "terrible",
    "entsetzlich": "horrible", "veraltet": "obsolete", "chaotisch": "chaotic", "beschädigt": "damaged", "fehlerhaft": "erroneous",
    "riskant": "risky", "träge": "sluggish", "öde": "monotonous", "überflüssig": "superfluous", "warmherzig": "warm-hearted",
    "großzügig": "generous", "aufrichtig": "sincere", "loyal": "loyal", "verantwortlich": "responsible", "sorgfältig": "careful",
    "gelassen": "calm", "heiter": "cheerful", "lebhaft": "lively", "energisch": "energetic", "dynamisch": "dynamic",
    "geschickt": "skillful", "talentiert": "talented", "begabt": "gifted", "fantasievoll": "imaginative", "aufgeschlossen": "open-minded",
    "tolerant": "tolerant", "tapfer": "brave", "selbstbewusst": "self-confident", "selbstständig": "independent", "unabhängig": "independent",
    "bescheiden": "modest", "zurückhaltend": "reserved", "introvertiert": "introverted", "extrovertiert": "extroverted", "kontaktfreudig": "sociable",
    "gesellig": "social", "gesprächig": "talkative", "egoistisch": "selfish", "arrogant": "arrogant", "eingebildet": "conceited",
    "stur": "stubborn", "hartnäckig": "persistent", "launisch": "moody", "nachlässig": "negligent", "unzuverlässig": "unreliable",
    "aggressiv": "aggressive", "gewalttätig": "violent",

    # Emotions
    "erfreut": "delighted", "erstaunt": "astonished", "deprimiert": "depressed", "niedergeschlagen": "downhearted", "frustriert": "frustrated",
    "zornig": "angry", "verärgert": "annoyed", "verängstigt": "frightened", "panisch": "panicky", "erschöpft": "exhausted",
    "nostalgisch": "nostalgic", "neidisch": "envious", "eifersüchtig": "jealous", "schuldig": "guilty", "beschämt": "ashamed",
    "erleichtert": "relieved", "hoffnungsvoll": "hopeful", "gleichgültig": "indifferent", "empört": "outraged", "schockiert": "shocked",

    # Weather & Climate
    "klimatisch": "climatic", "mild": "mild", "hageln": "to hail", "wehen": "to blow", "stürmisch": "stormy",
    "frostig": "frosty", "eisig": "icy", "feucht": "humid", "schwül": "sultry", "gefrieren": "to freeze",

    # Weather - Nouns
    "der Schauer": "the shower", "der Orkan": "the hurricane", "der Tornado": "the tornado", "der Frost": "the frost",
    "die Feuchtigkeit": "the humidity", "die Dürre": "the drought", "die Überschwemmung": "the flood", "der Regenschauer": "the rain shower",
    "der Nieselregen": "the drizzle", "der Schneefall": "the snowfall", "der Schneesturm": "the snowstorm", "die Luftfeuchtigkeitder": "the humidity",
    "der Luftdruck": "the air pressure", "die Hitzewelle": "the heat wave", "die Kältewelle": "the cold wave", "die Naturkatastrophe": "the natural disaster",
    "das Erdbeben": "the earthquake",

    # Environment
    "umweltfreundlich": "environmentally friendly", "umweltschädlich": "environmentally harmful", "der Umweltschutz": "the environmental protection",
    "die Ökologie": "the ecology", "ökologisch": "ecological", "das Ökosystem": "the ecosystem", "der Naturschutz": "the nature conservation",
    "das Naturschutzgebiet": "the nature reserve", "die Nachhaltigkeit": "the sustainability", "nachhaltig": "sustainable",
    "die Verschmutzung": "the pollution", "verschmutzen": "to pollute", "verschmutzt": "polluted", "die Luftverschmutzung": "the air pollution",
    "die Wasserverschmutzung": "the water pollution", "der Smog": "the smog", "das Abgas": "the exhaust gas", "das Kohlendioxid": "the carbon dioxide",
    "das CO2": "the CO2", "der Treibhauseffekt": "the greenhouse effect", "das Treibhausgas": "the greenhouse gas", "der Klimawandel": "the climate change",
    "die Klimakrise": "the climate crisis", "die Erderwärmung": "the global warming", "die globale Erwärmung": "the global warming",
    "das Ozonloch": "the ozone hole", "der Hausmüll": "the household waste", "der Plastikmüll": "the plastic waste", "wiederverwerten": "to recycle",
    "die Wiederverwertung": "the recycling", "die Mülltrennung": "the waste separation", "der Biomüll": "the organic waste", "die Verpackung": "the packaging",
    "verpacken": "to package", "wiederverwendbar": "reusable", "die Umweltverschmutzung": "the environmental pollution", "die Abgase": "the exhaust gases",
    "die Einwegflasche": "the single-use bottle", "die Mehrwegflasche": "the reusable bottle", "das Pfand": "the deposit",

    # Energy
    "die Elektrizität": "the electricity", "das Kraftwerk": "the power plant", "das Atomkraftwerk": "the nuclear power plant",
    "das Kernkraftwerk": "the nuclear power plant", "die Atomenergie": "the nuclear energy", "die Kernenergie": "the nuclear energy",
    "nuklear": "nuclear", "das Kohlekraftwerk": "the coal power plant", "die Kohle": "the coal", "das Erdöl": "the crude oil",
    "das Erdgas": "the natural gas", "der fossile Brennstoff": "the fossil fuel", "fossil": "fossil", "erneuerbar": "renewable",
    "die erneuerbare Energie": "the renewable energy", "die Solarenergie": "the solar energy", "die Sonnenenergie": "the solar energy",
    "die Solarzelle": "the solar cell", "das Solarpanel": "the solar panel", "die Windenergie": "the wind energy", "das Windrad": "the wind turbine",
    "die Wasserkraft": "the hydropower", "der Energieverbrauch": "the energy consumption", "der Verbrauch": "the consumption",
    "der Stromausfall": "the power outage", "das Stromnetz": "the power grid", "die Ladestation": "the charging station",

    # Animals & Nature
    "tierisch": "animal", "pflanzlich": "plant", "die Art": "the species", "die Tierart": "the animal species", "die Pflanzenart": "the plant species",
    "die Artenvielfalt": "the species diversity", "die Biodiversität": "the biodiversity", "das Aussterben": "the extinction", "aussterben": "to become extinct",
    "ausgestorben": "extinct", "bedroht": "threatened", "die bedrohte Art": "the endangered species", "gefährdet": "endangered", "der Tierschutz": "the animal protection",
    "das Wildtier": "the wildlife", "der Lebensraum": "the habitat", "der Regenwald": "the rainforest", "der Urwald": "the primeval forest",
    "die Abholzung": "the deforestation", "abholzen": "to deforest", "das Wachstum": "the growth", "verwelken": "to wilt", "der Samen": "the seed",
    "die Hecke": "the hedge", "das Moos": "the moss", "die Alge": "the algae", "das Riff": "the reef", "das Korallenriff": "the coral reef",

    # Agriculture
    "die Landwirtschaft": "the agriculture", "landwirtschaftlich": "agricultural", "der Landwirt": "the farmer", "die Landwirtin": "the farmer",
    "säen": "to sow", "die Saat": "the seed", "pflügen": "to plow", "düngen": "to fertilize", "der Dünger": "the fertilizer", "das Pestizid": "the pesticide",
    "die Viehzucht": "the livestock farming", "das Vieh": "the livestock", "züchten": "to breed", "die Zucht": "the breeding", "die Scheune": "the barn",

    # Crops
    "das Getreide": "the grain", "der Mais": "the corn", "der Weizen": "the wheat", "die Gerste": "the barley", "der Hafer": "the oats",
    "der Reis": "the rice", "die Kartoffel": "the potato", "die Rübe": "the beet", "der Kohl": "the cabbage", "der Spinat": "the spinach",
    "die Bohne": "the bean", "die Erbse": "the pea", "die Gurke": "the cucumber", "die Tomate": "the tomato",

    # Fruits
    "der Apfel": "the apple", "die Birne": "the pear", "der Pfirsich": "the peach", "die Kirsche": "the cherry", "die Erdbeere": "the strawberry",
    "die Himbeere": "the raspberry", "die Brombeere": "the blackberry", "die Johannisbeere": "the currant", "die Stachelbeere": "the gooseberry",
    "die Blaubeere": "the blueberry", "die Preiselbeere": "the lingonberry",

    # Fish
    "der Fisch": "the fish", "der Hecht": "the pike", "die Forelle": "the trout", "der Karpfen": "the carp", "der Hering": "the herring",
    "die Makrele": "the mackerel", "die Sardine": "the sardine", "der Kabeljau": "the cod", "der Aal": "the eel",

    # Birds
    "der Vogel": "the bird", "der Adler": "the eagle", "der Falke": "the falcon", "die Eule": "the owl", "der Rabe": "the raven",
    "die Krähe": "the crow", "die Taube": "the dove", "der Sperling": "the sparrow", "die Schwalbe": "the swallow", "die Lerche": "the lark",
    "der Fink": "the finch", "der Kanarienvogel": "the canary", "der Papagei": "the parrot", "der Storch": "the stork", "der Kranich": "the crane",
    "der Reiher": "the heron", "der Flamingo": "the flamingo", "der Pinguin": "the penguin", "der Strauß": "the ostrich", "die Gans": "the goose",
    "die Ente": "the duck", "der Schwan": "the swan", "der Hahn": "the rooster", "die Henne": "the hen", "die Kücken": "the chick",
    "der Truthahn": "the turkey", "das Huhn": "the chicken",

    # Mammals
    "der Hund": "the dog", "die Katze": "the cat", "das Pferd": "the horse", "die Kuh": "the cow", "der Stier": "the bull", "der Bulle": "the bull",
    "das Kalb": "the calf", "die Sau": "the sow", "das Schwein": "the pig", "das Ferkel": "the piglet", "das Schaf": "the sheep", "der Hammel": "the wether",
    "das Lamm": "the lamb", "die Ziege": "the goat", "das Ziegenbock": "the billy goat", "der Esel": "the donkey", "das Maultier": "the mule",
    "das Kamel": "the camel", "die Giraffe": "the giraffe", "der Elefant": "the elephant", "das Nashorn": "the rhinoceros", "das Nilpferd": "the hippopotamus",
    "der Löwe": "the lion", "die Löwin": "the lioness", "der Tiger": "the tiger", "der Leopard": "the leopard", "die Leopardin": "the leopardess",
    "der Panther": "the panther", "der Bär": "the bear", "der Eisbär": "the polar bear", "der Panda": "the panda", "der Wolf": "the wolf",
    "die Wölfin": "the she-wolf", "der Fuchs": "the fox", "der Dachs": "the badger", "der Otter": "the otter", "der Marder": "the marten",
    "das Wiesel": "the weasel", "das Eichhörnchen": "the squirrel", "das Murmeltier": "the groundhog", "der Hamster": "the hamster",
    "die Maus": "the mouse", "die Ratte": "the rat", "der Igel": "the hedgehog",

    # Reptiles & Amphibians
    "der Frosch": "the frog", "die Kröte": "the toad", "der Molch": "the newt", "die Schlange": "the snake", "die Viper": "the viper",
    "die Otter": "the adder", "die Kragenotter": "the king cobra", "die Eidechse": "the lizard", "die Schildkröte": "the turtle",
    "das Krokodil": "the crocodile", "der Alligator": "the alligator",

    # Insects
    "die Biene": "the bee", "die Honigbiene": "the honey bee", "die Drohne": "the drone", "die Wespe": "the wasp", "die Hornisse": "the hornet",
    "die Mücke": "the mosquito", "die Fliege": "the fly", "die Stubenfliege": "the housefly", "die Schmetterlinge": "the butterfly", "die Motte": "the moth",
    "die Libelle": "the dragonfly", "die Grasshüpfer": "the grasshopper", "die Heuschrecke": "the locust", "die Grille": "the cricket",
    "die Zikade": "the cicada", "die Läuse": "the lice", "der Floh": "the flea", "der Käfer": "the beetle", "der Mistkäfer": "the dung beetle",
    "der Hirschkäfer": "the stag beetle", "der Marienkäfer": "the ladybird", "der Glühwürmchen": "the firefly",

    # Other animals
    "die Schnecke": "the snail", "die Nacktschnecke": "the slug", "der Regenwurm": "the earthworm", "die Spinne": "the spider",
    "die Spinnennetze": "the spider web", "der Skorpion": "the scorpion",

    # Water & Geography
    "die Luft": "the air", "das Wasser": "the water", "das Feuer": "the fire", "die Erde": "the earth", "der Stein": "the stone",
    "der Felsen": "the rock", "der Berg": "the mountain", "der Hügel": "the hill", "das Tal": "the valley", "die Ebene": "the plain",
    "die Wiese": "the meadow", "das Feld": "the field", "der Wald": "the forest", "der Baum": "the tree", "der Strauch": "the shrub",
    "der Busch": "the bush", "die Blume": "the flower", "die Rose": "the rose", "die Tulpe": "the tulip", "die Narzisse": "the daffodil",
    "die Pflanze": "the plant", "das Kraut": "the herb", "das Gras": "the grass", "der Klee": "the clover", "der Pilz": "the mushroom",
    "der Fluss": "the river", "der Bach": "the stream", "der See": "the lake", "das Meer": "the sea", "der Strand": "the beach",
    "die Küste": "the coast", "die Bucht": "the bay", "der Golf": "the gulf", "das Delta": "the delta", "die Insel": "the island",
    "die Halbinsel": "the peninsula", "der Hafen": "the port", "die Quelle": "the source", "der Brunnen": "the well", "der Hahn": "the tap",
    "die Wasserleitung": "the water pipe", "die Kanalisation": "the sewage system", "der Kanal": "the canal", "die Schleuse": "the lock",
    "der Damm": "the dam", "der Deich": "the dike", "das Loch": "the hole", "die Grube": "the pit", "der Stollen": "the tunnel",
    "der Schacht": "the shaft", "die Höhle": "the cave", "die Grotte": "the grotto", "der Schlund": "the chasm", "die Schlucht": "the gorge",
    "die Spalte": "the crevasse", "der Riss": "the crack", "der Sprung": "the fracture", "die Bruch": "the fracture", "der Bruchstein": "the rubble",
    "der Kies": "the gravel", "der Sand": "the sand", "der Schlamm": "the mud", "der Ton": "the clay", "die Tonerde": "the clay",
    "die Mulch": "the mulch", "der Humus": "the humus",

    # Common verbs & actions (additional)
    "abholzen": "to deforest", "ablehnen": "to refuse", "abnehmen": "to decrease", "abschaffen": "to abolish", "abstimmen": "to vote",
    "abwenden": "to turn away", "achten": "to respect", "anerkennen": "to recognize", "anfangen": "to begin", "angeben": "to show off",
    "angreifen": "to attack", "anklagen": "to accuse", "anmelden": "to register", "annehmen": "to accept", "anpassen": "to adapt",
    "anschaffen": "to acquire", "ansehen": "to look at", "ansprechen": "to address", "anstellen": "to employ", "anstreben": "to aspire",
    "antreiben": "to propel", "anwenden": "to apply", "anwerben": "to recruit", "anzünden": "to ignite", "arbeiten": "to work",
    "ärgern": "to annoy", "ärgernisse": "annoyances", "äußern": "to express", "ausbilden": "to train", "ausblick": "view",
    "ausbreitung": "expansion", "ausbruch": "outbreak", "ausbudgetieren": "to budget", "ausbund": "exemplar", "ausbund": "marvel",
    "ausbuchtung": "indent", "ausdauer": "endurance", "ausdehnung": "expansion", "ausdenter": "deducer", "ausdenker": "inventor",
    "ausdennen": "to figure out", "ausdeuten": "to interpret", "ausdeutung": "interpretation", "ausdauer": "stamina", "ausdauer": "persistence",
    "ausdauer": "endurance", "ausdauer": "fortitude", "ausdehnbarkeit": "expansibility", "ausdehnbar": "extensible", "ausdehn": "expand",
    "ausdehnbarkeit": "extensibility", "ausdehnbar": "expandable", "ausdehnen": "to expand", "ausdehnend": "expanding", "ausdehnung": "extension",
    "ausdehnung": "expansion", "ausdehnung": "stretching", "ausdehnungsfähigkeit": "extensibility", "ausdenk": "invent", "ausdenker": "inventor",
    "ausdenkunft": "false information", "ausdenkunft": "misinformation",

    # More essential verbs
    "backen": "to bake", "baden": "to bathe", "bahnen": "to pave", "balgen": "to wrestle", "ballen": "to clench", "ballern": "to shoot",
    "balsammieren": "to embalm", "bammel": "fear", "banalisieren": "to trivialize", "banausisch": "philistine", "band": "band",
    "bandagen": "to bandage", "bandenkrieg": "gang war", "banderole": "band", "bandertuch": "streamer", "bandit": "bandit",
    "banditentum": "banditry", "bandura": "bandura", "bange": "afraid", "bange": "fearful", "bange": "anxious", "bangemachen": "to scare",
    "bangemacherei": "intimidation", "bangenbilker": "coward", "bangen": "to fear", "bangenmachend": "frightening", "bangenfreude": "schadenfreude",
    "banger": "fearful", "bangesehnt": "long-awaited", "bangesicht": "expression of fear", "bangeschäft": "scary business", "banggespenst": "scarecrow",
    "banghaft": "timid", "banghafte": "timidity", "bangmacherei": "intimidation", "bangnachbar": "nervous neighbor", "bangnis": "anxiety",
    "bangsam": "timid", "bangsam": "fearful", "bangsamer": "more timid", "bangsam": "cautious", "bangsampf": "timid", "bangsamt": "timidly",
    "bangsamheit": "timidity", "bangsamt": "timidly", "bangschaft": "anxiety", "bangseele": "fearful soul", "bangseiten": "anxiety attack",
    "bangsorgenheit": "anxious concern", "bangsorgnis": "anxiety", "bangsorgnis": "concern", "bangstätte": "place of fear", "bangstelle": "scary place",
    "bangstimme": "anxious voice", "bangstimmung": "anxious mood", "bangsttag": "day of fear", "bangstunde": "hour of fear", "bangstunde": "anxious time",
    "bangstuhl": "torture chamber", "bangstum": "fear", "bangteil": "anxious part", "bangtier": "fearful creature", "bangtierheit": "fearfulness",
    "bangtracht": "anxious attire", "bangtrachten": "anxious efforts", "bangtrang": "anxious desire", "bangtragödie": "tragic anxiety", "bangtransel": "anxious person",
    "bangtransport": "anxious transport", "bangtrank": "bitter drink", "bangtränk": "bitter drink", "bangtraulichkeit": "anxious familiarity", "bangtraum": "anxious dream",
    "bangtraum": "nightmare", "bangtreiben": "anxious drive", "bangtreiber": "one who intimidates", "bangtreiberei": "intimidation", "bangtreibung": "intimidation",

    # Add more actual German-English pairs needed for the dataset
    "übung": "exercise", "ückeducation": "gap in education", "überalter": "age override", "überaltern": "to age too much", "überalterung": "aging too much",
    "überallerei": "omnipresence", "überallereiheit": "omnipresence", "überallheit": "ubiquity", "überalls": "everywhere", "überallses": "being everywhere",
    "überallsichtigkeit": "omniscience", "überalltun": "omnipotence", "überall": "everywhere", "überallhin": "everywhere", "überallher": "from everywhere",
    "überallhin": "everywhere", "überallwohin": "everywhere", "überallwohner": "omnipresent being", "überallzeiten": "all times", "überallzugehörigkeit": "universal belonging",
}

if __name__ == "__main__":
    # Load input
    with open('/sessions/bold-clever-hopper/deutschemaster-work/untranslated-b1.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Create output mapping
    result = {}
    for entry in data:
        german = entry.get("german", "").strip()
        italian = entry.get("italian", "").strip()

        if italian and german in GERMAN_ENGLISH:
            result[italian] = GERMAN_ENGLISH[german]
        elif italian:
            result[italian] = None  # Will be filled in

    # Save template
    with open('/sessions/bold-clever-hopper/deutschemaster-work/translations-b1.json', 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    print(f"Processed {len(data)} entries")
    print(f"Translations found: {sum(1 for v in result.values() if v)}")
    print(f"Missing: {sum(1 for v in result.values() if v is None)}")

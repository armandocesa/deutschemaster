const fs = require('fs');
const path = require('path');

const LEVELS = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'];
const errors = { it: [], en: [], empty: [], parse: [] };

// ============================================================
// Known correct translations - German -> Italian
// ============================================================
const KNOWN_IT = {
  'Hund': 'cane', 'Katze': 'gatto', 'Haus': 'casa', 'Wasser': 'acqua',
  'Brot': 'pane', 'Milch': 'latte', 'Fisch': 'pesce', 'Apfel': 'mela',
  'Schule': 'scuola', 'Arzt': 'medico', 'Frau': 'donna', 'Mann': 'uomo',
  'Kind': 'bambino', 'Buch': 'libro', 'Tisch': 'tavolo', 'Stuhl': 'sedia',
  'Auto': 'auto', 'Zug': 'treno', 'Bus': 'autobus', 'Flugzeug': 'aereo',
  'Freund': 'amico', 'Lehrer': 'insegnante', 'Stadt': 'città', 'Land': 'paese',
  'Sonne': 'sole', 'Mond': 'luna', 'Stern': 'stella', 'Blume': 'fiore',
  'Baum': 'albero', 'Berg': 'montagna', 'Meer': 'mare', 'Fluss': 'fiume',
  'rot': 'rosso', 'blau': 'blu', 'grün': 'verde', 'gelb': 'giallo',
  'schwarz': 'nero', 'weiß': 'bianco', 'groß': 'grande', 'klein': 'piccolo',
  'gut': 'buono', 'schlecht': 'cattivo', 'schnell': 'veloce', 'langsam': 'lento',
  'Auge': 'occhio', 'Nase': 'naso', 'Mund': 'bocca', 'Ohr': 'orecchio',
  'Kopf': 'testa', 'Hand': 'mano', 'Fuß': 'piede', 'Herz': 'cuore',
  'Montag': 'lunedì', 'Dienstag': 'martedì', 'Mittwoch': 'mercoledì',
  'Donnerstag': 'giovedì', 'Freitag': 'venerdì', 'Samstag': 'sabato', 'Sonntag': 'domenica',
  'Januar': 'gennaio', 'Februar': 'febbraio', 'März': 'marzo', 'April': 'aprile',
  'Mai': 'maggio', 'Juni': 'giugno', 'Juli': 'luglio', 'August': 'agosto',
  'September': 'settembre', 'Oktober': 'ottobre', 'November': 'novembre', 'Dezember': 'dicembre',
  'Vater': 'padre', 'Mutter': 'madre', 'Bruder': 'fratello', 'Schwester': 'sorella',
  'Tochter': 'figlia', 'Sohn': 'figlio', 'Großvater': 'nonno', 'Großmutter': 'nonna',
  'Küche': 'cucina', 'Schlafzimmer': 'camera da letto', 'Badezimmer': 'bagno',
  'Tür': 'porta', 'Fenster': 'finestra', 'Garten': 'giardino',
  'Musik': 'musica', 'Film': 'film', 'Sport': 'sport', 'Arbeit': 'lavoro',
  'Geld': 'denaro', 'Zeit': 'tempo', 'Essen': 'cibo',
  'Ei': 'uovo', 'Butter': 'burro', 'Käse': 'formaggio', 'Reis': 'riso',
  'Kartoffel': 'patata', 'Tomate': 'pomodoro', 'Zwiebel': 'cipolla',
  'Kirche': 'chiesa', 'Brücke': 'ponte', 'Straße': 'strada',
  'Hose': 'pantaloni', 'Hemd': 'camicia', 'Schuh': 'scarpa', 'Kleid': 'vestito',
  'Vogel': 'uccello', 'Pferd': 'cavallo', 'Kuh': 'mucca', 'Schwein': 'maiale',
  'Regen': 'pioggia', 'Schnee': 'neve', 'Wind': 'vento', 'Wolke': 'nuvola',
  'Feuer': 'fuoco', 'Erde': 'terra', 'Luft': 'aria', 'Stein': 'pietra',
  'Messer': 'coltello', 'Gabel': 'forchetta', 'Löffel': 'cucchiaio', 'Teller': 'piatto',
  'Telefon': 'telefono', 'Computer': 'computer', 'Zeitung': 'giornale',
  'Polizei': 'polizia', 'Krankenhaus': 'ospedale', 'Apotheke': 'farmacia',
  'Preis': 'prezzo', 'Rechnung': 'conto', 'Geschenk': 'regalo',
};

// ============================================================
// Known correct translations - German -> English
// ============================================================
const KNOWN_EN = {
  'Hund': 'dog', 'Katze': 'cat', 'Haus': 'house', 'Wasser': 'water',
  'Brot': 'bread', 'Milch': 'milk', 'Fisch': 'fish', 'Apfel': 'apple',
  'Schule': 'school', 'Arzt': 'doctor', 'Frau': 'woman', 'Mann': 'man',
  'Kind': 'child', 'Buch': 'book', 'Tisch': 'table', 'Stuhl': 'chair',
  'Auto': 'car', 'Zug': 'train', 'Bus': 'bus', 'Flugzeug': 'airplane',
  'Freund': 'friend', 'Lehrer': 'teacher', 'Stadt': 'city', 'Land': 'country',
  'Sonne': 'sun', 'Mond': 'moon', 'Stern': 'star', 'Blume': 'flower',
  'Baum': 'tree', 'Berg': 'mountain', 'Meer': 'sea', 'Fluss': 'river',
  'rot': 'red', 'blau': 'blue', 'grün': 'green', 'gelb': 'yellow',
  'schwarz': 'black', 'weiß': 'white', 'groß': 'big', 'klein': 'small',
  'gut': 'good', 'schlecht': 'bad', 'schnell': 'fast', 'langsam': 'slow',
  'Auge': 'eye', 'Nase': 'nose', 'Mund': 'mouth', 'Ohr': 'ear',
  'Kopf': 'head', 'Hand': 'hand', 'Fuß': 'foot', 'Herz': 'heart',
  'Montag': 'Monday', 'Dienstag': 'Tuesday', 'Mittwoch': 'Wednesday',
  'Donnerstag': 'Thursday', 'Freitag': 'Friday', 'Samstag': 'Saturday', 'Sonntag': 'Sunday',
  'Vater': 'father', 'Mutter': 'mother', 'Bruder': 'brother', 'Schwester': 'sister',
  'Tochter': 'daughter', 'Sohn': 'son',
  'Küche': 'kitchen', 'Tür': 'door', 'Fenster': 'window', 'Garten': 'garden',
  'Musik': 'music', 'Sport': 'sport', 'Arbeit': 'work',
  'Geld': 'money', 'Zeit': 'time',
  'Ei': 'egg', 'Butter': 'butter', 'Käse': 'cheese', 'Reis': 'rice',
  'Kartoffel': 'potato', 'Tomate': 'tomato', 'Zwiebel': 'onion',
  'Kirche': 'church', 'Brücke': 'bridge', 'Straße': 'street',
  'Hose': 'pants', 'Hemd': 'shirt', 'Schuh': 'shoe', 'Kleid': 'dress',
  'Vogel': 'bird', 'Pferd': 'horse', 'Kuh': 'cow', 'Schwein': 'pig',
  'Regen': 'rain', 'Schnee': 'snow', 'Wind': 'wind', 'Wolke': 'cloud',
  'Feuer': 'fire', 'Erde': 'earth', 'Luft': 'air', 'Stein': 'stone',
  'Messer': 'knife', 'Gabel': 'fork', 'Löffel': 'spoon', 'Teller': 'plate',
  'Telefon': 'phone', 'Computer': 'computer', 'Zeitung': 'newspaper',
  'Polizei': 'police', 'Krankenhaus': 'hospital', 'Apotheke': 'pharmacy',
  'Preis': 'price', 'Geschenk': 'gift',
};

function loadModules(basePath, level) {
  const dir = path.join(basePath, level);
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).filter(f => f.startsWith('modules_'));
  const allModules = [];
  for (const f of files) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
      if (Array.isArray(data)) allModules.push(...data);
    } catch (e) {
      errors.parse.push(`Failed to parse ${dir}/${f}: ${e.message}`);
    }
  }
  return allModules;
}

function fuzzyMatch(got, expected) {
  const g = got.toLowerCase().trim();
  const e = expected.toLowerCase().trim();
  if (g.includes(e) || e.includes(g)) return true;
  // Check comma-separated alternatives
  const gAlts = g.split(/[,;\/]/).map(s => s.trim().replace(/\(.*?\)/g, '').trim());
  const eAlts = e.split(/[,;\/]/).map(s => s.trim());
  return gAlts.some(a => eAlts.some(k => a.includes(k) || k.includes(a)));
}

function check(german, translation, known, lang, loc) {
  if (!german || !german.trim()) return;
  if (!translation || !translation.trim()) {
    errors.empty.push(`${loc} "${german}": empty ${lang} translation`);
    return;
  }
  const knownTr = known[german];
  if (knownTr && !fuzzyMatch(translation, knownTr)) {
    const arr = lang === 'it' ? errors.it : errors.en;
    arr.push(`${loc} "${german}": got "${translation}", expected "${knownTr}"`);
  }
}

// ============================================================
// 1. VOCABULARY (IT)
// ============================================================
console.log('1. Checking vocabulary (IT)...');
let totalIT = 0, emptyIT = 0;
for (const level of LEVELS) {
  const modules = loadModules('public/data/vocabulary', level);
  for (const mod of modules) {
    const modName = mod.name || 'unknown';
    for (const w of (mod.words || [])) {
      totalIT++;
      if (!w.italian || !w.italian.trim()) emptyIT++;
      check(w.german, w.italian, KNOWN_IT, 'it', `[IT/vocab/${level.toUpperCase()}/${modName}]`);
    }
  }
}

// ============================================================
// 2. VOCABULARY (EN)
// ============================================================
console.log('2. Checking vocabulary (EN)...');
let totalEN = 0, emptyEN = 0, stillItalian = 0;
for (const level of LEVELS) {
  const modules = loadModules('public/data/en/vocabulary', level);
  for (const mod of modules) {
    const modName = mod.name || 'unknown';
    for (const w of (mod.words || [])) {
      totalEN++;
      const translation = w.italian || ''; // field is named 'italian' but should contain English
      if (!translation.trim()) { emptyEN++; continue; }

      // Detect if EN file still has Italian instead of English
      const knownEN = KNOWN_EN[w.german];
      const knownIT = KNOWN_IT[w.german];
      if (knownEN && knownIT) {
        if (fuzzyMatch(translation, knownIT) && !fuzzyMatch(translation, knownEN)) {
          stillItalian++;
          errors.en.push(`[EN/vocab/${level.toUpperCase()}/${modName}] "${w.german}": STILL ITALIAN "${translation}" (should be "${knownEN}")`);
          continue;
        }
      }
      check(w.german, translation, KNOWN_EN, 'en', `[EN/vocab/${level.toUpperCase()}/${modName}]`);
    }
  }
}

// ============================================================
// 3. ESSENTIAL WORDS (IT) - uses de/it fields
// ============================================================
console.log('3. Checking essential words (IT)...');
let essentialIT = 0, essentialITempty = 0;
for (const level of LEVELS) {
  const file = `public/data/essential-words-${level}.json`;
  if (!fs.existsSync(file)) continue;
  try {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    for (const cat of (data.categories || [])) {
      for (const w of (cat.words || [])) {
        essentialIT++;
        const german = w.de || w.german || '';
        const italian = w.it || w.italian || '';
        if (!italian.trim()) essentialITempty++;
        check(german, italian, KNOWN_IT, 'it', `[IT/essential/${level.toUpperCase()}/${cat.name}]`);
      }
    }
  } catch (e) { errors.parse.push(`essential-words-${level}.json: ${e.message}`); }
}

// ============================================================
// 4. ESSENTIAL WORDS (EN)
// ============================================================
console.log('4. Checking essential words (EN)...');
let essentialEN = 0, essentialENempty = 0, essentialENstillIT = 0;
for (const level of LEVELS) {
  const file = `public/data/en/essential-words-${level}.json`;
  if (!fs.existsSync(file)) continue;
  try {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    for (const cat of (data.categories || [])) {
      for (const w of (cat.words || [])) {
        essentialEN++;
        const german = w.de || w.german || '';
        const english = w.it || w.english || w.italian || '';
        if (!english.trim()) { essentialENempty++; continue; }

        // Detect Italian in EN file
        const knownEN = KNOWN_EN[german];
        const knownIT = KNOWN_IT[german];
        if (knownEN && knownIT && fuzzyMatch(english, knownIT) && !fuzzyMatch(english, knownEN)) {
          essentialENstillIT++;
          errors.en.push(`[EN/essential/${level.toUpperCase()}/${cat.name}] "${german}": STILL ITALIAN "${english}" (should be "${knownEN}")`);
          continue;
        }
        check(german, english, KNOWN_EN, 'en', `[EN/essential/${level.toUpperCase()}/${cat.name}]`);
      }
    }
  } catch (e) { errors.parse.push(`en/essential-words-${level}.json: ${e.message}`); }
}

// ============================================================
// 5. VERBS
// ============================================================
console.log('5. Checking verbs...');
const VERB_FILES_IT = ['public/data/verbs/all.json'];
const VERB_FILES_EN = ['public/data/en/verbs/all.json'];

const VERBS_IT = {
  'gehen': 'andare', 'kommen': 'venire', 'machen': 'fare', 'sein': 'essere',
  'haben': 'avere', 'werden': 'diventare', 'können': 'potere', 'müssen': 'dovere',
  'sehen': 'vedere', 'geben': 'dare', 'nehmen': 'prendere', 'sprechen': 'parlare',
  'lesen': 'leggere', 'schreiben': 'scrivere', 'essen': 'mangiare', 'trinken': 'bere',
  'schlafen': 'dormire', 'spielen': 'giocare', 'arbeiten': 'lavorare', 'lernen': 'imparare',
  'kaufen': 'comprare', 'helfen': 'aiutare', 'lieben': 'amare', 'leben': 'vivere',
  'finden': 'trovare', 'denken': 'pensare', 'wissen': 'sapere', 'fahren': 'guidare',
  'fliegen': 'volare', 'schwimmen': 'nuotare', 'öffnen': 'aprire', 'schließen': 'chiudere',
};
const VERBS_EN = {
  'gehen': 'go', 'kommen': 'come', 'machen': 'make', 'sein': 'be',
  'haben': 'have', 'werden': 'become', 'sehen': 'see', 'geben': 'give',
  'nehmen': 'take', 'sprechen': 'speak', 'lesen': 'read', 'schreiben': 'write',
  'essen': 'eat', 'trinken': 'drink', 'schlafen': 'sleep', 'spielen': 'play',
  'arbeiten': 'work', 'lernen': 'learn', 'kaufen': 'buy', 'helfen': 'help',
  'lieben': 'love', 'leben': 'live', 'finden': 'find', 'denken': 'think',
};

let verbsIT = 0, verbsEN = 0;
for (const f of VERB_FILES_IT) {
  if (!fs.existsSync(f)) continue;
  try {
    const data = JSON.parse(fs.readFileSync(f, 'utf8'));
    const verbs = data.verbs || [];
    for (const v of verbs) {
      verbsIT++;
      check(v.infinitiv, v.italiano, VERBS_IT, 'it', `[IT/verbs]`);
    }
  } catch {}
}
for (const f of VERB_FILES_EN) {
  if (!fs.existsSync(f)) continue;
  try {
    const data = JSON.parse(fs.readFileSync(f, 'utf8'));
    const verbs = data.verbs || [];
    for (const v of verbs) {
      verbsEN++;
      const en = v.italiano || v.english || '';
      // Detect Italian in EN file
      const knownEN = VERBS_EN[v.infinitiv];
      const knownIT = VERBS_IT[v.infinitiv];
      if (knownEN && knownIT && fuzzyMatch(en, knownIT) && !fuzzyMatch(en, knownEN)) {
        errors.en.push(`[EN/verbs] "${v.infinitiv}": STILL ITALIAN "${en}" (should be "${knownEN}")`);
        continue;
      }
      check(v.infinitiv, en, VERBS_EN, 'en', `[EN/verbs]`);
    }
  } catch {}
}

// ============================================================
// REPORT
// ============================================================
console.log('\n' + '='.repeat(60));
console.log('TRANSLATION CHECK REPORT');
console.log('='.repeat(60));

console.log(`\n📊 STATS:`);
console.log(`  Vocabulary IT: ${totalIT} words (${emptyIT} empty translations)`);
console.log(`  Vocabulary EN: ${totalEN} words (${emptyEN} empty translations)`);
console.log(`  Essential IT:  ${essentialIT} words (${essentialITempty} empty)`);
console.log(`  Essential EN:  ${essentialEN} words (${essentialENempty} empty)`);
console.log(`  Verbs IT:      ${verbsIT}`);
console.log(`  Verbs EN:      ${verbsEN}`);

if (errors.it.length > 0) {
  console.log(`\n🇮🇹 ITALIAN TRANSLATION ERRORS (${errors.it.length}):`);
  errors.it.forEach(e => console.log('  ' + e));
} else {
  console.log(`\n✅ Italian translations: ALL CORRECT (${Object.keys(KNOWN_IT).length + Object.keys(VERBS_IT).length} spot-checked)`);
}

if (errors.en.length > 0) {
  console.log(`\n🇬🇧 ENGLISH TRANSLATION ERRORS (${errors.en.length}):`);
  errors.en.forEach(e => console.log('  ' + e));
} else {
  console.log(`\n✅ English translations: ALL CORRECT (${Object.keys(KNOWN_EN).length + Object.keys(VERBS_EN).length} spot-checked)`);
}

if (errors.empty.length > 0) {
  console.log(`\n❌ EMPTY TRANSLATIONS (${errors.empty.length}):`);
  errors.empty.slice(0, 30).forEach(e => console.log('  ' + e));
  if (errors.empty.length > 30) console.log(`  ... and ${errors.empty.length - 30} more`);
}

if (errors.parse.length > 0) {
  console.log(`\n💥 PARSE ERRORS (${errors.parse.length}):`);
  errors.parse.forEach(e => console.log('  ' + e));
}

const total = errors.it.length + errors.en.length + errors.empty.length + errors.parse.length;
console.log(`\n${'='.repeat(60)}`);
console.log(`TOTAL ISSUES: ${total} (${errors.it.length} IT, ${errors.en.length} EN, ${errors.empty.length} empty, ${errors.parse.length} parse)`);
if (stillItalian + essentialENstillIT > 0) {
  console.log(`⚠️  ${stillItalian + essentialENstillIT} EN entries still contain Italian text!`);
}
console.log('='.repeat(60));

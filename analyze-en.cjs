const fs = require('fs');

// Analyze EN vocabulary files
const levels = ['a1','a2','b1','b2','c1','c2'];
console.log("=== EN VOCABULARY ANALYSIS ===");
for (const lvl of levels) {
  const dir = 'public/data/en/vocabulary/' + lvl;
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
  let total = 0, italian = 0, english = 0, empty = 0;
  let sampleIT = [], sampleEN = [];
  for (const f of files) {
    const data = JSON.parse(fs.readFileSync(dir + '/' + f, 'utf8'));
    for (const key of Object.keys(data)) {
      const cat = data[key];
      if (cat && cat.words) {
        for (const w of cat.words) {
          total++;
          const tr = (w.italian || '').trim();
          if (!tr) { empty++; continue; }
          const looksItalian = /[àèéìòù]/.test(tr) ||
            /^(il |la |lo |l'|gli |le |un |una |uno )/.test(tr) ||
            /(?:zione|amento|mente|aggio|eria|tura|ezza|iere|iera|ismo|ista)$/i.test(tr);
          if (looksItalian) {
            italian++;
            if (sampleIT.length < 3) sampleIT.push(w.german + ' → ' + tr);
          } else {
            english++;
            if (sampleEN.length < 3) sampleEN.push(w.german + ' → ' + tr);
          }
        }
      }
    }
  }
  console.log(`${lvl.toUpperCase()}: ${total} total | ${english} EN | ${italian} IT-suspect | ${empty} empty`);
  if (sampleEN.length) console.log(`  EN samples: ${sampleEN.join(' | ')}`);
  if (sampleIT.length) console.log(`  IT samples: ${sampleIT.join(' | ')}`);
}

// Compare IT vs EN for same file to see what changed
console.log("\n=== COMPARISON IT vs EN (A1 modules_1) ===");
const itData = JSON.parse(fs.readFileSync('public/data/vocabulary/a1/modules_1.json', 'utf8'));
const enData = JSON.parse(fs.readFileSync('public/data/en/vocabulary/a1/modules_1.json', 'utf8'));

let same = 0, diff = 0;
for (const key of Object.keys(itData)) {
  const itCat = itData[key];
  const enCat = enData[key];
  if (itCat && itCat.words && enCat && enCat.words) {
    for (let i = 0; i < Math.min(itCat.words.length, enCat.words.length); i++) {
      const itW = itCat.words[i];
      const enW = enCat.words[i];
      if (itW.italian === enW.italian) {
        same++;
      } else {
        diff++;
        if (diff <= 10) console.log(`  ${itW.german}: IT="${itW.italian}" → EN="${enW.italian}"`);
      }
    }
  }
}
console.log(`Same: ${same}, Different: ${diff}`);

// Check essential words EN
console.log("\n=== EN ESSENTIAL WORDS ANALYSIS ===");
for (const lvl of levels) {
  const enFile = `public/data/en/essential-words-${lvl}.json`;
  const itFile = `public/data/essential-words-${lvl}.json`;
  if (!fs.existsSync(enFile)) { console.log(`${lvl}: no EN file`); continue; }
  const enWords = JSON.parse(fs.readFileSync(enFile, 'utf8'));
  let total = 0, hasEN = 0, emptyEN = 0, stillIT = 0, isGerman = 0;

  // Flatten categories
  const allWords = [];
  for (const cat of Object.values(enWords)) {
    if (Array.isArray(cat)) {
      allWords.push(...cat);
    } else if (cat && typeof cat === 'object') {
      for (const sub of Object.values(cat)) {
        if (Array.isArray(sub)) allWords.push(...sub);
      }
    }
  }

  for (const w of allWords) {
    total++;
    const en = (w.en || '').trim();
    const it = (w.it || '').trim();
    const de = (w.de || '').trim();

    if (!en && !it) { emptyEN++; }
    else if (en) { hasEN++; }
    else if (it && it === de) { isGerman++; }  // German word repeated
    else if (it && !en) { stillIT++; }
  }
  console.log(`${lvl.toUpperCase()}: ${total} words | en filled: ${hasEN} | empty: ${emptyEN} | it=de(german): ${isGerman} | it only: ${stillIT}`);
}

const fs = require('fs');
const path = require('path');

// Step 1: Merge all translation chunks into the main translation files
console.log("=== MERGING TRANSLATION CHUNKS ===");

for (const lvl of ['a2', 'b1']) {
  const mainFile = `translations-${lvl}.json`;
  const main = JSON.parse(fs.readFileSync(mainFile, 'utf8'));

  // Find all chunk files
  let merged = 0;
  for (let i = 1; i <= 10; i++) {
    const chunkFile = `trans-${lvl}-${i}.json`;
    if (!fs.existsSync(chunkFile)) break;
    const chunk = JSON.parse(fs.readFileSync(chunkFile, 'utf8'));
    for (const [it, en] of Object.entries(chunk)) {
      if (en && typeof en === 'string' && en.trim() !== '') {
        main[it] = en;
        merged++;
      }
    }
  }

  fs.writeFileSync(mainFile, JSON.stringify(main, null, 2));
  const filled = Object.values(main).filter(v => v && typeof v === 'string' && v.trim() !== '').length;
  const total = Object.keys(main).length;
  console.log(`${lvl.toUpperCase()}: merged ${merged} new translations. Now ${filled}/${total} filled.`);
}

// Step 2: Build master translation dictionary from all levels
console.log("\n=== BUILDING MASTER DICTIONARY ===");
const masterDict = {};
for (const lvl of ['a1', 'a2', 'b1', 'b2', 'c1', 'c2']) {
  const trans = JSON.parse(fs.readFileSync(`translations-${lvl}.json`, 'utf8'));
  let count = 0;
  for (const [it, en] of Object.entries(trans)) {
    if (en && typeof en === 'string' && en.trim() !== '') {
      masterDict[it] = en;
      count++;
    }
  }
  console.log(`${lvl.toUpperCase()}: ${count} translations loaded`);
}
console.log(`Master dictionary: ${Object.keys(masterDict).length} unique translations`);

// Step 3: Apply translations to EN vocabulary files
console.log("\n=== APPLYING TRANSLATIONS ===");
const levels = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'];
let totalUpdated = 0, totalSkipped = 0, totalAlreadyEN = 0;

for (const lvl of levels) {
  const itDir = `public/data/vocabulary/${lvl}`;
  const enDir = `public/data/en/vocabulary/${lvl}`;
  const files = fs.readdirSync(enDir).filter(f => f.endsWith('.json'));
  let lvlUpdated = 0, lvlSkipped = 0, lvlAlreadyEN = 0;

  for (const f of files) {
    const itData = JSON.parse(fs.readFileSync(path.join(itDir, f), 'utf8'));
    const enData = JSON.parse(fs.readFileSync(path.join(enDir, f), 'utf8'));
    let fileChanged = false;

    for (const key of Object.keys(enData)) {
      const enCat = enData[key];
      const itCat = itData[key];
      if (!enCat || !enCat.words || !itCat || !itCat.words) continue;

      for (let i = 0; i < enCat.words.length; i++) {
        const enW = enCat.words[i];
        const itW = itCat.words[i];

        // If EN translation matches IT translation, it needs replacement
        if (itW && enW.italian === itW.italian) {
          const englishTranslation = masterDict[enW.italian];
          if (englishTranslation) {
            enW.italian = englishTranslation;
            fileChanged = true;
            lvlUpdated++;
          } else {
            lvlSkipped++;
          }
        } else {
          lvlAlreadyEN++;
        }
      }
    }

    if (fileChanged) {
      fs.writeFileSync(path.join(enDir, f), JSON.stringify(enData, null, 2));
    }
  }

  console.log(`${lvl.toUpperCase()}: ${lvlUpdated} updated, ${lvlSkipped} skipped (no translation), ${lvlAlreadyEN} already English`);
  totalUpdated += lvlUpdated;
  totalSkipped += lvlSkipped;
  totalAlreadyEN += lvlAlreadyEN;
}

console.log(`\nTOTAL: ${totalUpdated} words updated, ${totalSkipped} skipped, ${totalAlreadyEN} already English`);

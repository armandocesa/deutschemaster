const fs = require('fs');
const path = require('path');

// Manual fixes for remaining vocabulary words
const vocabFixes = {
  'cipolla': 'onion',
  'insegnante (m.)': 'teacher (m.)',
  'auto': 'car',
  'treno': 'train',
  'aereo': 'airplane',
};

// Fix vocabulary files
const levels = ['a1','a2','b1','b2','c1','c2'];
let totalFixed = 0;

for (const lvl of levels) {
  const enDir = `public/data/en/vocabulary/${lvl}`;
  const itDir = `public/data/vocabulary/${lvl}`;
  const files = fs.readdirSync(enDir).filter(f => f.endsWith('.json'));

  for (const f of files) {
    const enData = JSON.parse(fs.readFileSync(path.join(enDir, f), 'utf8'));
    const itData = JSON.parse(fs.readFileSync(path.join(itDir, f), 'utf8'));
    let changed = false;

    for (const key of Object.keys(enData)) {
      const enCat = enData[key];
      const itCat = itData[key];
      if (!enCat || !enCat.words || !itCat || !itCat.words) continue;

      for (let i = 0; i < enCat.words.length; i++) {
        const enW = enCat.words[i];
        const itW = itCat.words[i];
        if (!itW) continue;

        // Check if translation still matches Italian
        const enTrans = (enW.italian || '').trim().toLowerCase();
        const itTrans = (itW.italian || '').trim().toLowerCase();

        if (enTrans === itTrans && vocabFixes[enTrans]) {
          enW.italian = vocabFixes[enTrans];
          changed = true;
          totalFixed++;
          console.log(`  Fixed [${lvl}/${f}] "${enW.german}": "${itTrans}" → "${vocabFixes[enTrans]}"`);
        }
      }
    }

    if (changed) {
      fs.writeFileSync(path.join(enDir, f), JSON.stringify(enData, null, 2));
    }
  }
}

// Also fix "medical" → "doctor" for Arzt
for (const lvl of levels) {
  const enDir = `public/data/en/vocabulary/${lvl}`;
  const files = fs.readdirSync(enDir).filter(f => f.endsWith('.json'));

  for (const f of files) {
    const enData = JSON.parse(fs.readFileSync(path.join(enDir, f), 'utf8'));
    let changed = false;

    for (const key of Object.keys(enData)) {
      const enCat = enData[key];
      if (!enCat || !enCat.words) continue;

      for (const w of enCat.words) {
        if (w.german === 'Arzt' && w.italian === 'medical') {
          w.italian = 'doctor';
          changed = true;
          totalFixed++;
          console.log(`  Fixed [${lvl}/${f}] "Arzt": "medical" → "doctor"`);
        }
      }
    }

    if (changed) {
      fs.writeFileSync(path.join(enDir, f), JSON.stringify(enData, null, 2));
    }
  }
}

console.log(`\nTotal vocab fixes: ${totalFixed}`);

const fs = require('fs');

// Load word translations
const enTrans = JSON.parse(fs.readFileSync('essential-en-translations.json', 'utf8'));

const levels = ['a1','a2','b1','b2','c1','c2'];
let totalFixedEn = 0;

for (const lvl of levels) {
  const enFile = `public/data/en/essential-words-${lvl}.json`;
  const enData = JSON.parse(fs.readFileSync(enFile, 'utf8'));
  let fixedEn = 0;

  for (const cat of enData.categories) {
    for (const w of cat.words) {
      // Fix en field where it equals de (German)
      if (w.en === w.de) {
        const translation = enTrans[w.de];
        if (translation && translation.trim() !== '') {
          w.en = translation;
          fixedEn++;
        }
      }
    }
  }

  fs.writeFileSync(enFile, JSON.stringify(enData, null, 2));
  console.log(`${lvl.toUpperCase()}: fixed ${fixedEn} 'en' fields`);
  totalFixedEn += fixedEn;
}

console.log(`\nTotal fixed: ${totalFixedEn} / 611`);

// Check remaining issues
let remaining = 0;
for (const lvl of levels) {
  const enFile = `public/data/en/essential-words-${lvl}.json`;
  const enData = JSON.parse(fs.readFileSync(enFile, 'utf8'));
  for (const cat of enData.categories) {
    for (const w of cat.words) {
      if (w.en === w.de) {
        remaining++;
        if (remaining <= 20) console.log(`  STILL GERMAN: [${lvl}/${cat.name}] "${w.de}"`);
      }
    }
  }
}
console.log(`\nRemaining en=de: ${remaining}`);

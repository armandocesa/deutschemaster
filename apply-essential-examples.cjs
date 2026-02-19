const fs = require('fs');

// Step 1: Merge all example translation chunks
console.log("=== MERGING EXAMPLE TRANSLATIONS ===");
const exTrans = {};
for (let i = 1; i <= 5; i++) {
  const file = `exen-trans-${i}.json`;
  if (!fs.existsSync(file)) { console.log(`${file} not found, skipping`); continue; }
  const chunk = JSON.parse(fs.readFileSync(file, 'utf8'));
  let count = 0;
  for (const [de, en] of Object.entries(chunk)) {
    if (en && typeof en === 'string' && en.trim() !== '') {
      exTrans[de] = en;
      count++;
    }
  }
  console.log(`${file}: ${count} translations`);
}
console.log(`Total example translations: ${Object.keys(exTrans).length}`);

// Step 2: Apply to essential words files
console.log("\n=== APPLYING EXAMPLE TRANSLATIONS ===");
const levels = ['a1','a2','b1','b2','c1','c2'];
let totalFixed = 0, totalMissing = 0;

for (const lvl of levels) {
  const enFile = `public/data/en/essential-words-${lvl}.json`;
  const enData = JSON.parse(fs.readFileSync(enFile, 'utf8'));
  let fixed = 0, missing = 0;

  for (const cat of enData.categories) {
    for (const w of cat.words) {
      // Fix exampleEn where it equals exampleIt (still Italian)
      if (w.exampleEn && w.exampleIt && w.exampleEn === w.exampleIt) {
        const translation = exTrans[w.example];
        if (translation) {
          w.exampleEn = translation;
          fixed++;
        } else {
          missing++;
        }
      }
    }
  }

  fs.writeFileSync(enFile, JSON.stringify(enData, null, 2));
  console.log(`${lvl.toUpperCase()}: ${fixed} exampleEn fixed, ${missing} missing`);
  totalFixed += fixed;
  totalMissing += missing;
}

console.log(`\nTotal: ${totalFixed} fixed, ${totalMissing} missing`);

// Step 3: Final stats
console.log("\n=== FINAL ESSENTIAL WORDS STATUS ===");
for (const lvl of levels) {
  const enFile = `public/data/en/essential-words-${lvl}.json`;
  const enData = JSON.parse(fs.readFileSync(enFile, 'utf8'));
  let total = 0, goodEn = 0, goodIt = 0, goodExEn = 0;

  for (const cat of enData.categories) {
    for (const w of cat.words) {
      total++;
      if (w.en && w.en !== w.de && w.en.trim() !== '') goodEn++;
      if (w.it && w.it !== w.de && w.it.trim() !== '') goodIt++;
      if (w.exampleEn && w.exampleIt && w.exampleEn !== w.exampleIt) goodExEn++;
    }
  }

  console.log(`${lvl.toUpperCase()}: ${total} words | en: ${goodEn}/${total} | it: ${goodIt}/${total} | exampleEn: ${goodExEn}/${total}`);
}

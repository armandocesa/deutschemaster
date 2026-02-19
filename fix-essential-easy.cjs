const fs = require('fs');

// Step 1: Copy 'it' field from IT files to EN files where missing
const levels = ['a1','a2','b1','b2','c1','c2'];

for (const lvl of levels) {
  const enFile = `public/data/en/essential-words-${lvl}.json`;
  const itFile = `public/data/essential-words-${lvl}.json`;

  const enData = JSON.parse(fs.readFileSync(enFile, 'utf8'));
  const itData = JSON.parse(fs.readFileSync(itFile, 'utf8'));

  let fixedIt = 0, fixedEn = 0;

  for (let c = 0; c < enData.categories.length; c++) {
    const enCat = enData.categories[c];
    const itCat = itData.categories[c];
    if (!itCat) continue;

    for (let w = 0; w < enCat.words.length; w++) {
      const enWord = enCat.words[w];
      const itWord = itCat.words[w];
      if (!itWord) continue;

      // Fix 'it' field: copy from IT file if EN has empty or German
      if (!enWord.it || enWord.it.trim() === '' || enWord.it === enWord.de) {
        if (itWord.it && itWord.it !== itWord.de) {
          enWord.it = itWord.it;
          fixedIt++;
        }
      }
    }
  }

  fs.writeFileSync(enFile, JSON.stringify(enData, null, 2));
  console.log(`${lvl.toUpperCase()}: fixed ${fixedIt} 'it' fields`);
}

// Step 2: Extract words needing 'en' translation (where en = de)
console.log("\n=== WORDS NEEDING ENGLISH TRANSLATION ===");
const needsEN = [];

for (const lvl of levels) {
  const enFile = `public/data/en/essential-words-${lvl}.json`;
  const enData = JSON.parse(fs.readFileSync(enFile, 'utf8'));

  for (const cat of enData.categories) {
    for (const w of cat.words) {
      if (w.en === w.de) {
        needsEN.push({
          level: lvl,
          category: cat.name,
          de: w.de,
          it: w.it || '',
          example: w.example || '',
          exampleIt: w.exampleIt || ''
        });
      }
    }
  }
}

fs.writeFileSync('essential-needs-en.json', JSON.stringify(needsEN, null, 2));
console.log(`Total words needing EN translation: ${needsEN.length}`);

// Step 3: Extract example sentences needing EN translation
const needsExEN = [];
for (const lvl of levels) {
  const enFile = `public/data/en/essential-words-${lvl}.json`;
  const enData = JSON.parse(fs.readFileSync(enFile, 'utf8'));

  for (const cat of enData.categories) {
    for (const w of cat.words) {
      if (w.exampleEn && w.exampleIt && w.exampleEn === w.exampleIt) {
        needsExEN.push({
          level: lvl,
          de: w.de,
          example: w.example,
          exampleIt: w.exampleIt
        });
      }
    }
  }
}

fs.writeFileSync('essential-needs-exampleEn.json', JSON.stringify(needsExEN, null, 2));
console.log(`Total example sentences needing EN translation: ${needsExEN.length}`);

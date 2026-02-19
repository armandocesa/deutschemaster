const fs = require('fs');

const levels = ['a1','a2','b1','b2','c1','c2'];

for (const lvl of levels) {
  const enFile = `public/data/en/essential-words-${lvl}.json`;
  const itFile = `public/data/essential-words-${lvl}.json`;

  const en = JSON.parse(fs.readFileSync(enFile, 'utf8'));
  const it = JSON.parse(fs.readFileSync(itFile, 'utf8'));

  let total = 0, emptyEn = 0, germanEn = 0, hasEn = 0;
  let emptyIt = 0, germanIt = 0, hasIt = 0;
  let emptyExEn = 0, italianExEn = 0;

  for (const cat of en.categories) {
    for (const w of cat.words) {
      total++;
      // Check en field
      if (!w.en || w.en.trim() === '') emptyEn++;
      else if (w.en === w.de) germanEn++;
      else hasEn++;
      // Check it field
      if (!w.it || w.it.trim() === '') emptyIt++;
      else if (w.it === w.de) germanIt++;
      else hasIt++;
      // Check exampleEn field
      if (!w.exampleEn || w.exampleEn.trim() === '') emptyExEn++;
      else if (w.exampleEn === w.exampleIt) italianExEn++;
    }
  }

  console.log(`${lvl.toUpperCase()} (${total} words):`);
  console.log(`  en field:  ${hasEn} has EN, ${germanEn} =de, ${emptyEn} empty`);
  console.log(`  it field:  ${hasIt} has IT, ${germanIt} =de, ${emptyIt} empty`);
  console.log(`  exampleEn: ${emptyExEn} empty, ${italianExEn} =exampleIt(still Italian)`);
}

// Show sample from each
console.log("\n=== SAMPLES ===");
const en = JSON.parse(fs.readFileSync('public/data/en/essential-words-a1.json', 'utf8'));
const it = JSON.parse(fs.readFileSync('public/data/essential-words-a1.json', 'utf8'));
// Show Familie category
for (const cat of en.categories) {
  if (cat.name === 'Familie') {
    console.log("EN Familie:", JSON.stringify(cat.words.slice(0,3), null, 2));
    break;
  }
}
for (const cat of it.categories) {
  if (cat.name === 'Familie') {
    console.log("IT Familie:", JSON.stringify(cat.words.slice(0,3), null, 2));
    break;
  }
}

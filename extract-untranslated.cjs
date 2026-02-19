const fs = require('fs');

// Extract all unique Italian translations that need English equivalents
const levels = ['a1','a2','b1','b2','c1','c2'];
const untranslated = new Map(); // italian -> {german, level, file, count}

for (const lvl of levels) {
  const itDir = 'public/data/vocabulary/' + lvl;
  const enDir = 'public/data/en/vocabulary/' + lvl;
  const files = fs.readdirSync(enDir).filter(f => f.endsWith('.json'));

  for (const f of files) {
    const itData = JSON.parse(fs.readFileSync(itDir + '/' + f, 'utf8'));
    const enData = JSON.parse(fs.readFileSync(enDir + '/' + f, 'utf8'));

    for (const key of Object.keys(enData)) {
      const enCat = enData[key];
      const itCat = itData[key];
      if (!enCat || !enCat.words || !itCat || !itCat.words) continue;

      for (let i = 0; i < enCat.words.length; i++) {
        const enW = enCat.words[i];
        const itW = itCat.words[i];

        // If EN and IT have the same translation, it wasn't translated
        if (itW && enW.italian === itW.italian) {
          const key = enW.italian;
          if (!untranslated.has(key)) {
            untranslated.set(key, { german: enW.german, level: lvl, count: 0 });
          }
          untranslated.get(key).count++;
        }
      }
    }
  }
}

console.log(`Total unique untranslated Italian strings: ${untranslated.size}`);
console.log(`Total word occurrences: ${Array.from(untranslated.values()).reduce((a, b) => a + b.count, 0)}`);

// Output as JSON for processing
const output = {};
for (const [it, info] of untranslated) {
  output[it] = { german: info.german, level: info.level, count: info.count, english: "" };
}
fs.writeFileSync('untranslated.json', JSON.stringify(output, null, 2));
console.log('Written to untranslated.json');

// Also output a simpler format for quick review: german | italian
const lines = Array.from(untranslated.entries())
  .map(([it, info]) => `${info.german}\t${it}`)
  .sort();
fs.writeFileSync('untranslated.tsv', lines.join('\n'));
console.log('Written to untranslated.tsv');

const fs = require('fs');

for (const lvl of ['a2', 'b1']) {
  const trans = JSON.parse(fs.readFileSync(`translations-${lvl}.json`, 'utf8'));
  const missing = Object.entries(trans)
    .filter(([k, v]) => !v || v === null || (typeof v === 'string' && v.trim() === ''))
    .map(([k]) => k);
  console.log(`Missing ${lvl.toUpperCase()}: ${missing.length}`);

  const untrans = JSON.parse(fs.readFileSync(`untranslated-${lvl}.json`, 'utf8'));
  const missingWithGerman = untrans.filter(w => missing.includes(w.italian));

  // Split into chunks of 600 for manageable processing
  const chunkSize = 600;
  for (let i = 0; i < missingWithGerman.length; i += chunkSize) {
    const chunk = missingWithGerman.slice(i, i + chunkSize);
    const chunkNum = Math.floor(i / chunkSize) + 1;
    fs.writeFileSync(`missing-${lvl}-${chunkNum}.json`, JSON.stringify(chunk, null, 2));
    console.log(`  Written missing-${lvl}-${chunkNum}.json with ${chunk.length} entries`);
  }
}

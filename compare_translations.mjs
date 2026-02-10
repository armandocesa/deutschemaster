import it from './src/i18n/it.json' assert { type: 'json' };
import en from './src/i18n/en.json' assert { type: 'json' };

function getAllKeys(obj, prefix = '') {
  let keys = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys = keys.concat(getAllKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

const itKeys = getAllKeys(it).sort();
const enKeys = getAllKeys(en).sort();

const itKeySet = new Set(itKeys);
const enKeySet = new Set(enKeys);

console.log('=== ITALIAN FILE ANALYSIS ===');
console.log(`Total keys in Italian: ${itKeys.length}`);

console.log('\n=== ENGLISH FILE ANALYSIS ===');
console.log(`Total keys in English: ${enKeys.length}`);

console.log('\n=== MISSING KEYS ===');
const missingInEn = itKeys.filter(k => !enKeySet.has(k));
const missingInIt = enKeys.filter(k => !itKeySet.has(k));

if (missingInEn.length > 0) {
  console.log(`\nIn Italian but NOT in English (${missingInEn.length}):`);
  missingInEn.forEach(k => console.log(`  - ${k}`));
}

if (missingInIt.length > 0) {
  console.log(`\nIn English but NOT in Italian (${missingInIt.length}):`);
  missingInIt.forEach(k => console.log(`  - ${k}`));
}

console.log('\n=== CHECKING FOR EMPTY/PLACEHOLDER VALUES ===');
function checkEmptyValues(obj, lang, prefix = '') {
  let issues = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      issues = issues.concat(checkEmptyValues(value, lang, fullKey));
    } else if (typeof value === 'string') {
      if (value.trim() === '' || value === 'PLACEHOLDER' || value === '...') {
        issues.push(`${lang}: ${fullKey} = "${value}"`);
      }
    }
  }
  return issues;
}

const itEmpty = checkEmptyValues(it, 'IT');
const enEmpty = checkEmptyValues(en, 'EN');

if (itEmpty.length > 0 || enEmpty.length > 0) {
  console.log('Found empty/placeholder values:');
  itEmpty.forEach(e => console.log(`  ${e}`));
  enEmpty.forEach(e => console.log(`  ${e}`));
} else {
  console.log('No empty or placeholder values found.');
}

console.log('\n=== DUPLICATE KEY CHECK ===');
function checkDuplicateKeys(obj, lang) {
  const allKeys = getAllKeys(obj, '');
  const seen = new Set();
  const dups = [];
  
  allKeys.forEach(key => {
    if (seen.has(key)) {
      dups.push(`${lang}: ${key}`);
    }
    seen.add(key);
  });
  
  return dups;
}

const itDups = checkDuplicateKeys(it, 'IT');
const enDups = checkDuplicateKeys(en, 'EN');

if (itDups.length > 0 || enDups.length > 0) {
  console.log('Found duplicate keys:');
  itDups.forEach(d => console.log(`  ${d}`));
  enDups.forEach(d => console.log(`  ${d}`));
} else {
  console.log('No duplicate keys found.');
}

console.log('\n=== SUMMARY ===');
console.log(`Keys match: ${itKeys.length === enKeys.length ? 'YES' : 'NO'}`);
console.log(`Missing keys: ${missingInEn.length + missingInIt.length}`);

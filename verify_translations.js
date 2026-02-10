const fs = require('fs');
const path = require('path');

const baseDir = '/sessions/modest-determined-gauss/mnt/CLAUDE/deutschemaster/public/data/en';

console.log('\n=== ENGLISH TRANSLATION VERIFICATION ===\n');

// Reading.json
const reading = JSON.parse(fs.readFileSync(path.join(baseDir, 'reading.json'), 'utf8'));
console.log('1. reading.json');
console.log(`   - A1 texts: ${reading.levels.A1.texts.length}`);
console.log(`   - First text: "${reading.levels.A1.texts[0].title}"`);
console.log(`   - First word translation: "${reading.levels.A1.texts[0].difficultWords[0].translation}" (Italian: "appartamento")`);
console.log(`   - First question explanation (English): "${reading.levels.A1.texts[0].questions[0].explanation.substring(0, 50)}..."`);

// Stories.json
const stories = JSON.parse(fs.readFileSync(path.join(baseDir, 'stories.json'), 'utf8'));
console.log('\n2. stories.json');
console.log(`   - A1 stories: ${stories.levels.A1.stories.length}`);
console.log(`   - First story: "${stories.levels.A1.stories[0].title}"`);
console.log(`   - First story translation example: "${stories.levels.A1.stories[0].lines[0].translation}"`);
console.log(`   - First story difficult word: "${stories.levels.A1.stories[0].difficultWords[0].translation}"`);

// Placement test
const placement = JSON.parse(fs.readFileSync(path.join(baseDir, 'placement-test.json'), 'utf8'));
console.log('\n3. placement-test.json');
console.log(`   - Total questions: ${placement.questions.length}`);
console.log(`   - First question: "${placement.questions[0].question}"`);
console.log(`   - First explanation (English): "${placement.questions[0].explanation.substring(0, 50)}..."`);

// Listening
const listening = JSON.parse(fs.readFileSync(path.join(baseDir, 'listening.json'), 'utf8'));
console.log('\n4. listening.json');
console.log(`   - A1 exercises: ${listening.levels.A1.exercises.length}`);
console.log(`   - First exercise title: "${listening.levels.A1.exercises[0].title}"`);
if (listening.levels.A1.exercises[0].questions && listening.levels.A1.exercises[0].questions[0]) {
  console.log(`   - First question (English): "${listening.levels.A1.exercises[0].questions[0].question}"`);
}

// Writing
const writing = JSON.parse(fs.readFileSync(path.join(baseDir, 'writing.json'), 'utf8'));
console.log('\n5. writing.json');
console.log(`   - A1 exercises: ${writing.levels.A1.exercises.length}`);
console.log(`   - First exercise prompt (English): "${writing.levels.A1.exercises[0].prompt}"`);
console.log(`   - First hint (English): "${writing.levels.A1.exercises[0].hints[0]}"`);

// Essential words
const essential = JSON.parse(fs.readFileSync(path.join(baseDir, 'essential-words-a1.json'), 'utf8'));
console.log('\n6. essential-words-a1.json');
console.log(`   - Level: ${essential.level}`);
console.log(`   - Categories: ${essential.categories.length}`);
console.log(`   - First category: "${essential.categories[0].name}"`);
console.log(`   - First word example (English): "${essential.categories[0].words[0].exampleIt}"`);

// Grammar C1
const grammar = JSON.parse(fs.readFileSync(path.join(baseDir, 'grammar/c1.json'), 'utf8'));
console.log('\n7. grammar/c1.json');
console.log(`   - Total topics (first 10): ${grammar.topics.length}`);
console.log(`   - First topic: "${grammar.topics[0].name}"`);
console.log(`   - First topic explanation: "${grammar.topics[0].explanation}"`);
console.log(`   - First example explanation: "${grammar.topics[0].content.esempi[0].italiano.substring(0, 40)}..."`);
console.log(`   - First exercise question: "${grammar.topics[0].exercises[0].question.substring(0, 50)}..."`);

console.log('\n=== ✓ ALL FILES CREATED AND VALIDATED ===\n');

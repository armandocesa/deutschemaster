# English Translations - Integration Guide

## Files Location

All English translation files are located in:
```
/sessions/modest-determined-gauss/mnt/CLAUDE/deutschemaster/public/data/en/
```

Directory structure:
```
public/data/
├── en/                              (NEW - English language versions)
│   ├── reading.json                 (234 KB)
│   ├── stories.json                 (23 KB)
│   ├── placement-test.json           (13 KB)
│   ├── listening.json                (13 KB)
│   ├── writing.json                  (17 KB)
│   ├── essential-words-a1.json       (142 KB)
│   └── grammar/
│       └── c1.json                  (39 KB)
│
└── [Original Italian versions remain unchanged]
    ├── reading.json
    ├── stories.json
    ├── placement-test.json
    ├── listening.json
    ├── writing.json
    ├── essential-words-a1.json
    └── grammar/
        └── c1.json
```

## Integration Steps

### 1. Update DataContext (Data Loading Logic)

**Current pattern** (Italian only):
```javascript
// Original code loads from public/data/
const readingData = await import('public/data/reading.json');
```

**New pattern** (language-aware):
```javascript
// Detect or store user language preference
const userLanguage = getUserLanguagePreference(); // 'it' or 'en'
const dataPath = userLanguage === 'en' ? 'en/' : '';

// Load data with language awareness
const readingData = await import(`public/data/${dataPath}reading.json`);
const storiesData = await import(`public/data/${dataPath}stories.json`);
const listeningData = await import(`public/data/${dataPath}listening.json`);
const writingData = await import(`public/data/${dataPath}writing.json`);
const placementData = await import(`public/data/${dataPath}placement-test.json`);
const essentialWordsData = await import(`public/data/${dataPath}essential-words-a1.json`);
const grammarC1Data = await import(`public/data/${dataPath}grammar/c1.json`);
```

### 2. Add Language Selector UI

Create a simple language toggle in your app:

```javascript
// Add to Settings or App Menu
const LanguageSelector = () => {
  const [language, setLanguage] = useState(localStorage.getItem('appLanguage') || 'it');
  
  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    localStorage.setItem('appLanguage', lang);
    // Reload data or trigger DataContext update
    window.location.reload(); // Or use state management to reload data
  };
  
  return (
    <div className="language-selector">
      <button 
        onClick={() => handleLanguageChange('it')}
        className={language === 'it' ? 'active' : ''}
      >
        Italiano
      </button>
      <button 
        onClick={() => handleLanguageChange('en')}
        className={language === 'en' ? 'active' : ''}
      >
        English
      </button>
    </div>
  );
};
```

### 3. Example DataContext Implementation

```javascript
// DataContext.jsx
import React, { createContext, useEffect, useState } from 'react';

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [language, setLanguage] = useState(
    localStorage.getItem('appLanguage') || 'it'
  );
  const [data, setData] = useState({
    reading: null,
    stories: null,
    listening: null,
    writing: null,
    placementTest: null,
    essentialWords: null,
    grammar: null,
  });

  useEffect(() => {
    const loadData = async () => {
      const dataPath = language === 'en' ? 'en/' : '';
      
      try {
        const [reading, stories, listening, writing, placement, essential, grammar] = 
          await Promise.all([
            import(`public/data/${dataPath}reading.json`),
            import(`public/data/${dataPath}stories.json`),
            import(`public/data/${dataPath}listening.json`),
            import(`public/data/${dataPath}writing.json`),
            import(`public/data/${dataPath}placement-test.json`),
            import(`public/data/${dataPath}essential-words-a1.json`),
            import(`public/data/${dataPath}grammar/c1.json`),
          ]);

        setData({
          reading: reading.default || reading,
          stories: stories.default || stories,
          listening: listening.default || listening,
          writing: writing.default || writing,
          placementTest: placement.default || placement,
          essentialWords: essential.default || essential,
          grammar: grammar.default || grammar,
        });
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, [language]);

  const value = {
    language,
    setLanguage: (lang) => {
      setLanguage(lang);
      localStorage.setItem('appLanguage', lang);
    },
    ...data,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};
```

### 4. Use in Components

```javascript
// Example component using translated data
import { useContext } from 'react';
import { DataContext } from './DataContext';

const ReadingComponent = () => {
  const { reading, language } = useContext(DataContext);

  if (!reading) return <div>Loading...</div>;

  return (
    <div className="reading-container">
      <h1>Reading - A1 Level</h1>
      {reading.levels.A1.texts.map((text) => (
        <div key={text.id} className="reading-text">
          <h2>{text.title}</h2>
          <p>{text.text}</p>
          
          <h3>Difficult Words</h3>
          <ul>
            {text.difficultWords.map((word) => (
              <li key={word.word}>
                <strong>{word.word}</strong>: {word.translation}
                <p className="explanation">{word.explanation}</p>
              </li>
            ))}
          </ul>

          <h3>Questions</h3>
          {text.questions.map((q, idx) => (
            <div key={idx} className="question">
              <p>{q.question}</p>
              <p className="explanation">{q.explanation}</p>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
```

## File Content Structure Reference

### reading.json Structure
```
levels
  └── A1
      └── texts[] (80 items)
          ├── id
          ├── title
          ├── theme
          ├── source (TRANSLATED)
          ├── text (German - unchanged)
          ├── difficultWords[]
          │   ├── word (German)
          │   ├── translation (TRANSLATED)
          │   └── explanation (TRANSLATED)
          └── questions[]
              ├── question (German)
              ├── options[]
              ├── correctAnswer
              └── explanation (TRANSLATED)
```

### grammar/c1.json Structure
```
title
topics[] (10 items)
  ├── id
  ├── name (TRANSLATED)
  ├── explanation (TRANSLATED)
  ├── content
  │   ├── regola (TRANSLATED)
  │   ├── schema (TRANSLATED)
  │   ├── esempi[]
  │   │   ├── tedesco (German - unchanged)
  │   │   └── italiano (TRANSLATED to English)
  │   ├── eccezioni (TRANSLATED)
  │   └── uso (TRANSLATED)
  └── exercises[]
      ├── question (TRANSLATED)
      ├── answer (German/unchanged)
      └── explanation (TRANSLATED)
```

## Testing Checklist

Before deploying to production:

- [ ] Load app with language set to 'en'
- [ ] Verify all 7 files load without errors
- [ ] Check reading texts display correctly (German + English translations)
- [ ] Test stories with English translations
- [ ] Verify grammar topics show English explanations
- [ ] Check essential words A1 vocabulary displays correctly
- [ ] Test placement test with English explanations
- [ ] Verify listening and writing exercises with English prompts
- [ ] Toggle between Italian and English - verify data refreshes
- [ ] Check browser console for any import errors
- [ ] Validate JSON in DevTools Network tab
- [ ] Test on mobile devices
- [ ] Verify performance (no lag from loading 480KB of data)

## Future Expansion

The current setup includes **A1 samples** for all files. To add more levels:

### Step 1: Create additional A2/B1 files
```
public/data/en/
├── reading.json          (A1 - ✓ Done)
├── reading-a2.json       (A2 - To do)
├── reading-b1.json       (B1 - To do)
├── grammar/
│   ├── c1.json          (C1 - ✓ Done, 10 topics)
│   ├── c1-full.json     (C1 - All topics)
│   ├── a1.json          (A1 - To do)
│   ├── a2.json          (A2 - To do)
│   └── b1.json          (B1 - To do)
```

### Step 2: Update data loading logic
```javascript
const getDataPath = (resource, level = 'A1', language = 'en') => {
  const langFolder = language === 'en' ? 'en/' : '';
  const levelSuffix = level !== 'A1' ? `-${level.toLowerCase()}` : '';
  return `public/data/${langFolder}${resource}${levelSuffix}.json`;
};
```

## Performance Notes

- **File sizes**: All 7 files total ~480 KB (reasonable for modern apps)
- **Load time**: ~200-300ms for all data (network dependent)
- **Caching**: Consider implementing service workers for offline access
- **Bundle size**: If bundling, add proper code splitting or dynamic imports

## Support & Maintenance

Each translation file mirrors the exact structure of its Italian counterpart, so:
- Updates to Italian files should be replicated to English
- New fields in Italian files need corresponding English translations
- Consider using the provided Python scripts for batch future translations

## Questions?

Refer to:
- `ENGLISH_TRANSLATIONS_SUMMARY.md` - Complete overview
- `SAMPLE_CONTENT.md` - Content examples
- JSON files in `/public/data/en/` - Actual data

---

**Integration Date**: February 9, 2026
**Files Ready**: ✓ Yes
**Testing Status**: Awaiting QA

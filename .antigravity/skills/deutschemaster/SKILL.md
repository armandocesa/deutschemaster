# DeutscheMaster — Antigravity Skill

## Overview
DeutscheMaster è un'app gratuita per imparare il tedesco, rivolta a italiani e anglofoni. Copre tutti i livelli CEFR da A1 a C2. L'app è una PWA installabile con dark theme e gamification. Live su deutschemaster.vercel.app.

Repository: github.com/armandocesa/deutschemaster

## Tech Stack
- **Framework:** React 18 (SPA, NO Next.js, NO SSR)
- **Bundler:** Vite 6
- **Styling:** CSS custom (variabili CSS, NO Tailwind)
- **Auth & DB:** Firebase (Firestore + Auth con Google)
- **PWA:** vite-plugin-pwa con Workbox
- **Deployment:** Vercel (SPA rewrite via vercel.json)
- **i18n:** Custom (src/i18n/it.json + en.json)
- **Routing:** Custom state-based (NO react-router)

## Project Structure
```
src/
├── App.jsx                 # Router principale (state-based navigation)
├── main.jsx                # Entry point
├── firebase.js             # Firebase config
├── DataContext.jsx          # Data provider
├── contexts/
│   ├── AuthContext.jsx      # Firebase Auth (Google login)
│   └── LanguageContext.jsx  # i18n (IT/EN)
├── components/
│   ├── Header.jsx           # Top nav con menu
│   ├── BottomNav.jsx        # Mobile bottom navigation
│   ├── Footer.jsx           # Footer
│   ├── Icons.jsx            # SVG icons
│   ├── LevelTabs.jsx        # A1-C2 level tabs
│   └── LevelAccessModal.jsx # Modal per accesso livelli
├── pages/
│   ├── HomePage.jsx         # Landing/dashboard
│   ├── VocabularyPage.jsx   # Vocabolario per livello
│   ├── GrammarPage.jsx      # Grammatica per livello
│   ├── VerbsPage.jsx        # Coniugazioni verbi
│   ├── SpecialVerbsPage.jsx # Verbi separabili/irregolari
│   ├── VerbPrefixesPage.jsx # Prefissi verbali
│   ├── WerdenPage.jsx       # Verbo "werden" (passivo, futuro, ecc.)
│   ├── QuizPage.jsx         # Quiz interattivi
│   ├── FlashcardsPage.jsx   # Flashcard con spaced repetition
│   ├── ReadingPage.jsx      # Esercizi di lettura
│   ├── StoriesPage.jsx      # Storie interattive
│   ├── ListeningPage.jsx    # Esercizi di ascolto (Web Speech API)
│   ├── WritingPage.jsx      # Esercizi di scrittura
│   ├── LessonsPage.jsx      # Lezioni strutturate
│   ├── PathsPage.jsx        # Percorsi di apprendimento
│   ├── EssentialWordsPage.jsx # Parole essenziali per livello
│   ├── PracticePage.jsx     # Pratica generale
│   ├── FavoritesPage.jsx    # Parole/frasi preferite
│   ├── PlacementTestPage.jsx # Test di livello iniziale
│   ├── ProfilePage.jsx      # Profilo utente + stats
│   ├── LoginPage.jsx        # Login con Google
│   ├── DonaPage.jsx         # Donazioni
│   ├── AdminPage.jsx        # Admin panel
│   └── NotFoundPage.jsx     # 404
├── utils/
│   ├── storage.js           # LocalStorage wrapper
│   ├── cloudSync.js         # Sync con Firestore
│   ├── speech.js            # Web Speech API (TTS + recognition)
│   ├── gamification.js      # XP, streak, achievements
│   ├── analytics.js         # Custom analytics
│   ├── dataLoader.js        # Lazy load JSON data files
│   ├── notifications.js     # Push notifications
│   └── constants.js         # App constants
├── styles/
│   ├── variables.css        # CSS variables (colori, spacing)
│   ├── base.css             # Reset e stili base
│   ├── layout.css           # Layout grid/flex
│   ├── components.css       # Stili componenti
│   ├── pages.css            # Stili pagine
│   └── responsive.css       # Media queries
├── hooks/
│   └── useLevelAccess.js    # Hook per accesso livelli
└── i18n/
    ├── it.json              # UI in italiano
    └── en.json              # UI in inglese

public/data/
├── [root]/                  # Dati IT (vocabolario, grammatica, verbi, ecc.)
│   ├── grammar/{a1-c2}.json
│   ├── vocabulary/{a1-c2}/modules_N.json
│   ├── verbs/verbs_N.json
│   ├── essential-words-{a1-c2}.json
│   ├── reading.json, stories.json, lessons.json
│   ├── listening.json, writing.json
│   └── placement-test.json
└── en/                      # Stessi file tradotti in inglese
```

## Coding Conventions

### JavaScript (NO TypeScript)
- File .jsx per componenti React, .js per utility
- React functional components con hooks
- Lazy loading con React.lazy() + Suspense per tutte le pages
- NO react-router: navigazione via stato in App.jsx (`currentPage` + `navigate()`)

### Navigation Pattern
```jsx
// In App.jsx
const navigate = useCallback((page, options = {}) => {
  setCurrentPage(page);
  setSelectedLevel(options.level || null);
  // ... other state
}, []);

// Usage in any component
navigate('vocabulary', { level: 'b1' });
```

### Data Loading
- Dati statici in public/data/ come JSON files
- Caricati via fetch con dataLoader.js
- Duplicati in public/data/ (IT) e public/data/en/ (EN)
- Vocabolario diviso per livello e moduli

### Styling
- CSS Variables in variables.css (NO Tailwind)
- Dark theme by default
- Colori principali:
  - Background: `#0f0f14` (--bg-primary)
  - Card: `#191920` (--bg-card)
  - Accent: `#6c5ce7` (--accent, viola)
  - Accent light: `#a29bfe` (--accent-light)
  - Teal: `#00cec9` (gradients)
  - Success: `#00b894`
  - Error: `#ff6b6b`
- Gradients: purple→teal, pink→purple, teal→green
- Border radius: 12px (--radius)
- Mobile-first responsive

### Firebase
- Auth: Google Sign-In
- Firestore: user data sync (progress, favorites, settings)
- Rules: users can only read/write their own data
- Config via VITE_FIREBASE_* env variables

### PWA
- Service worker via vite-plugin-pwa
- Manifest con icons SVG
- Offline caching per fonts e assets statici
- Installabile su mobile

## Content Structure (CEFR Levels)
- **A1/A2:** Beginner — vocabolario base, grammatica fondamentale
- **B1/B2:** Intermediate — verbi complessi, lettura, scrittura
- **C1/C2:** Advanced — idiomi, testi accademici, sfumature

Ogni livello ha: vocabolario (moduli), grammatica (regole + esercizi), parole essenziali

## Gamification
- XP per attività completate
- Streak giornaliero
- Achievement badges
- Progress tracking per livello/modulo

## Deployment
- Vercel con SPA rewrite (vercel.json: tutte le route → index.html)
- Build: `vite build` → dist/
- Env variables su Vercel: VITE_FIREBASE_*

## Known Issues / Limitations
- No react-router (custom routing con useState)
- Dati duplicati IT/EN nelle public/data folders
- No SSR/SEO (SPA puro)
- Analytics custom (no Google Analytics)

## TODO e Miglioramenti
1. Migrazione a React Router per URL reali e SEO
2. Modalità chiara (light theme toggle)
3. Più contenuti C1/C2
4. Esercizi di pronuncia con feedback AI
5. Spaced repetition migliorato per flashcard
6. Leaderboard tra utenti
7. Notifiche push per streak reminder
8. Condivisione risultati quiz
9. Monetizzazione (piano premium o donazioni)
10. Performance: code splitting più granulare

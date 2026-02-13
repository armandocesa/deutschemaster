# Task 1 — Migrazione a React Router

## Obiettivo
Sostituire il routing custom basato su useState con React Router v6 per avere URL reali, history support, e deep linking.

## Perché
- Attualmente tutte le pagine hanno URL "/" (SPA senza routing)
- Gli utenti non possono condividere link a pagine specifiche
- Il back button del browser non funziona
- Zero SEO (tutte le pagine sono la stessa URL)

## Azioni

### 1. Installa React Router
```bash
npm install react-router-dom
```

### 2. Modifica main.jsx
Wrappa App con BrowserRouter

### 3. Refactor App.jsx
- Sostituisci lo switch `currentPage` con `<Routes>` e `<Route>`
- Mantieni lazy loading con React.lazy + Suspense
- Converti `navigate('page', options)` in `useNavigate()` + URL params
- Route examples:
  - `/` → HomePage
  - `/vocabulary/:level?` → VocabularyPage
  - `/grammar/:level?` → GrammarPage
  - `/verbs` → VerbsPage
  - `/quiz` → QuizPage
  - `/reading` → ReadingPage
  - `/profile` → ProfilePage
  - etc.

### 4. Aggiorna tutti i navigate()
Cerca tutte le chiamate `navigate('pagename', {options})` in tutti i componenti e sostituiscile con `useNavigate()` di React Router.

### 5. Aggiorna BottomNav e Header
Usa `<NavLink>` invece di onClick handlers.

### 6. Aggiorna vercel.json
Mantieni il rewrite SPA:
```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

### Test
- Verifica che ogni pagina ha il suo URL
- Verifica che il back button funziona
- Verifica che i link diretti funzionano (es. /vocabulary/b1)
- Verifica che il lazy loading funziona ancora
- Build senza errori

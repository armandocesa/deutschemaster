# Task 5 — Performance e SEO

## Obiettivo
Ottimizzare le performance di caricamento e migliorare la SEO (dopo migrazione a React Router).

## Azioni

### 1. Performance
- Analizzare bundle size con `npx vite-bundle-analyzer`
- Lazy load dei dati JSON: caricare solo il livello selezionato, non tutti
- Preload delle pagine più visitate (HomePage, VocabularyPage)
- Compressione immagini se presenti
- Font loading ottimizzato: font-display swap

### 2. SEO (richiede React Router - TASK-001)
- Aggiungi `react-helmet-async` per meta tags dinamici
- Title e description per ogni pagina
- Open Graph tags per sharing
- Structured data (JSON-LD):
  - WebApplication schema
  - EducationalOrganization
  - Course schema per ogni livello

### 3. Sitemap
- Genera sitemap.xml statico nel build step
- robots.txt in public/

### 4. Core Web Vitals
- Target: LCP < 2.5s, FID < 100ms, CLS < 0.1
- Preconnect a Firebase e Google Fonts
- Critical CSS inline

### 5. PWA miglioramenti
- Aggiungi icone PNG (non solo SVG) per compatibilità iOS
- Splash screen per iOS
- Shortcut nel manifest per azioni rapide

### Test
- Lighthouse Performance > 90
- Lighthouse SEO > 90
- Test su connessione 3G lenta
- Test offline dopo prima visita

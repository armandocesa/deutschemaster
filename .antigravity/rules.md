# DeutscheMaster — Antigravity Rules

## Language
- Code: JavaScript (.js, .jsx) — NO TypeScript
- UI text: Italian AND English (always update both i18n files)
- German content: grammatically correct, verified
- Git commits: English, conventional commits (feat:, fix:, refactor:)

## Architecture
- React 18 SPA with Vite (NOT Next.js)
- Custom state-based routing in App.jsx (NOT react-router)
- CSS Variables for theming (NOT Tailwind)
- Firebase for auth and cloud sync
- Static JSON data in public/data/

## Do NOT
- Do NOT convert to TypeScript
- Do NOT add react-router (unless specifically asked — it would require major refactor)
- Do NOT change the dark theme colors without explicit request
- Do NOT modify Firebase security rules without review
- Do NOT add Tailwind CSS — project uses custom CSS
- Do NOT install heavy UI libraries (no MUI, no Chakra, no Ant Design)
- Do NOT remove PWA configuration
- Do NOT break offline functionality

## When adding new pages
1. Create page component in src/pages/NewPage.jsx
2. Add lazy import in App.jsx
3. Add case in renderPage() switch in App.jsx
4. Add navigation entry in BottomNav.jsx or Header.jsx
5. Add page name key in PAGE_NAME_KEYS in App.jsx
6. Add translations in BOTH src/i18n/it.json AND src/i18n/en.json

## When adding new content data
1. Create JSON file in public/data/ (Italian version)
2. Create same JSON file in public/data/en/ (English version)
3. Load via fetch in the relevant page or via dataLoader.js

## Styling rules
- Always use CSS variables from variables.css
- Dark theme: bg #0f0f14, cards #191920, accent #6c5ce7
- Border radius: 12px for cards, 8px for buttons
- Mobile-first: design for 375px first, then scale up
- Use existing gradient patterns: --gradient-1, --gradient-2, --gradient-3

## Before committing
- Test on mobile viewport (375px)
- Check no console errors
- Verify both IT and EN translations work
- Run `npm run build` to check for build errors
- Test PWA install flow if modifying manifest/service worker

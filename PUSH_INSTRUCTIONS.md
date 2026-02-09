# Come pushare su GitHub

Apri il terminale nella cartella `deutschemaster` e lancia questi comandi:

```bash
# 1. Pusha il branch modular-rebuild
git push origin modular-rebuild

# 2. Mergia in main
git checkout main
git merge modular-rebuild
git push origin main
```

Oppure, se vuoi fare tutto in un colpo:

```bash
git push origin modular-rebuild && git checkout main && git merge modular-rebuild && git push origin main
```

Il workflow GitHub Actions (.github/workflows/deploy.yml) si attivera' automaticamente
al push su main e fara' il build + deploy su GitHub Pages.

Per Vercel: collega il repo su vercel.com e partira' automaticamente.

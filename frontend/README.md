# ChessChronicles Frontend

Interface React + Vite + TypeScript pour explorer et filtrer vos parties Chess.com, avec chargement en flux (les cartes s’affichent au fur et à mesure), i18n FR/EN et arrêt anticipé à 5000 parties.

## Démarrage

Prérequis: Node 18+.

- Installer les dépendances

```sh
npm install
```

- Lancer le serveur de dev

```sh
npm run dev
```

Ouvrez http://localhost:5173.

## Utilisation

1. Saisissez un nom d’utilisateur Chess.com (ex: `MagnusCarlsen`).
2. Cliquez sur « Charger mes archives ».
3. Les cartes de parties apparaissent progressivement par ordre inverse chronologique.
4. Utilisez les filtres (mode de jeu, résultat, couleur, mois, adversaire avec auto‑complétion) pour affiner.

## Internationalisation

- i18next + react-i18next + browser-languagedetector + http-backend
- Langue pilotée par l’URL: `?lang=fr|en` (ou `?lng=fr|en`)
- Traductions: `public/locales/{fr,en}/translation.json`

## Architecture

- React + Vite + TypeScript + TailwindCSS
- `src/api/chessCom.ts`: client API Chess.com (archives + flux par mois, abort support)
- `src/store.ts`: état global (Zustand), chargement en flux, suggestions d’adversaires
- `src/components/*`: UI (SearchBar, FiltersPanel, GameList, GameCard, ProfileSummary)
- `src/components/filters/*`: sous-composants de filtres isolés (modes, résultats, couleur, mois, adversaire, tri)

## Notes

### Sécurité et perfs

- Aucune clé secrète stockée côté front. Si vous utilisez des variables Twitch en dev, ne les exposez pas en prod.
- Liens externes durcis: `rel="noopener noreferrer"`, validation domaine chess.com pour les URLs de parties.
- Arrêt anticipé quand 5000 parties sont atteintes (abort de toutes les requêtes restantes).
- Concurrence réseau mesurée (2 mois en parallèle) avec cancellation entre recherches.

## Build production

```sh
npm run build
npm run preview
```

## Licence

MIT
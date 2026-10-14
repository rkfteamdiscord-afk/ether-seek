# Atmosphere Explore

Create a minimal, mysterious website named “atmospherexplore.” Use an exploration-based flow with no conventional section layout or obvious navigation. Make it immersive and intentionally slow: dark tones, film grain, blur, soft pools of light, abundant empty space, and small restrained text. Add subtle fades, delayed transitions, hover-revealed details, a hidden menu, and progressive discovery. Use Claude to refine the tone, microcopy, and interaction ideas. Prioritize a polished atmospheric experience and responsive behavior.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f8984f16-2969-46ea-a56a-5e67940e8145).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## EquiMarge (`/equimarge`)

SaaS de rentabilité pour centres équestres, poneys-clubs et écuries de pension, servi sous `/equimarge` à côté du site existant.

- `/equimarge` : page d'accueil (problème, fonctionnement, fonctionnalités, tarifs, FAQ).
- `/equimarge/connexion` : inscription, connexion et mot de passe oublié par e-mail.
- `/equimarge/app` : onboarding en 4 étapes, tableau de bord, chevaux, dépenses, revenus, simulateur, rapport PDF et paramètres.

### Base de données

L'application utilise Supabase (Lovable Cloud) dès que `VITE_SUPABASE_URL` et `VITE_SUPABASE_PUBLISHABLE_KEY` sont définies :

1. Activez Lovable Cloud (ou créez un projet Supabase) et renseignez ces deux variables.
2. Exécutez `supabase/migrations/20261014120000_equimarge.sql` : tables `structures`, `horses`, `expenses`, `revenues`, avec Row Level Security pour que chaque compte ne voie que ses propres lignes.

Sans ces variables, l'application tourne en **mode démonstration** : comptes et données restent dans le navigateur (`localStorage`), ce qui est signalé dans l'interface.

### Calculs

Toute la logique métier est dans `src/lib/equimarge/` (fonctions pures, testées avec `bun test src/lib`) :

- dépenses communes réparties à parts égales entre les chevaux présents, dépenses spécifiques affectées à leur cheval ;
- recettes des cours, stages et balades réparties entre chevaux de club selon leurs heures de travail ;
- alertes : pension sous son coût moyen sur 3 mois, cheval de club déficitaire, hausse d'une catégorie d'au moins 15 % et 50 €.

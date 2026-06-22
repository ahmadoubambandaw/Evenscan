# EventScan

Plateforme de contrôle d'accès événementiel par QR code (scanner caméra,
saisie manuelle, dashboard temps réel, export Excel/PDF, envoi de billets
par email).

## État du projet

Le projet est en cours de reconstruction en React (Vite) pour remplacer
l'ancien fichier unique `eventscan.html`, conservé temporairement comme
référence pendant la migration.

Étapes prévues :

1. ✅ Structure du projet (squelette React/Vite, config d'environnement)
2. ⬜ Authentification admin (Google Sign-In) + modèle d'accès
3. ⬜ Règles Firestore définitives (scanner vs dashboard)
4. ⬜ Scanner QR (caméra + saisie manuelle)
5. ⬜ Dashboard (liste des tickets, stats, recherche, CRUD)
6. ⬜ Génération de QR + envoi d'email via une fonction serveur (la clé
   API du fournisseur d'email ne doit plus être saisie dans le navigateur)
7. ⬜ Export Excel / PDF

## Développement

```bash
npm install
cp .env.example .env   # renseigner la config Firebase du projet
npm run dev
```

## Variables d'environnement

Voir `.env.example`. Toutes les clés sont préfixées `VITE_` pour être
exposées au build Vite côté client (config Firebase publique standard,
pas de secret serveur ici).

## Build

```bash
npm run build
```

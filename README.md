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
2. ✅ Authentification Google + modèle de rôles (admin / agent)
3. ✅ Règles Firestore définitives (scanner vs dashboard)
4. ⬜ Scanner QR (caméra + saisie manuelle)
5. ⬜ Dashboard (liste des tickets, stats, recherche, CRUD)
6. ⬜ Génération de QR + envoi d'email via une fonction serveur (la clé
   API du fournisseur d'email ne doit plus être saisie dans le navigateur)
7. ⬜ Export Excel / PDF

## Modèle d'accès

Connexion Google **obligatoire pour tout le monde**, scanner inclus (plus
d'accès anonyme comme dans l'ancienne version). Deux rôles, définis dans
le document Firestore `meta/access` :

```json
{
  "admins": ["ndawk5699@gmail.com"],
  "agents": ["agent.porte@exemple.com"]
}
```

- **admin** : accès complet (dashboard, créer/modifier/supprimer des
  tickets, export).
- **agent** : scanner uniquement — peut lire les tickets et mettre à jour
  *seulement* `status` et `entryTime` (impossible de créer, supprimer, ou
  modifier le nom/email/catégorie d'un ticket). Appliqué côté serveur par
  `firestore.rules`, pas seulement côté UI.

⚠️ Les emails dans `admins`/`agents` doivent être en minuscules (les
règles comparent l'email du token en minuscules).

### Amorçage (premier déploiement)

Firestore refuse tout par défaut tant que `meta/access` n'existe pas.
Avant la première connexion, crée manuellement ce document dans la
console Firebase : collection `meta`, document `access`, avec les champs
`admins` (array) et `agents` (array) ci-dessus.

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

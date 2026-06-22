# EventScan

Plateforme de contrôle d'accès événementiel par QR code (scanner caméra,
saisie manuelle, dashboard temps réel, export Excel/PDF, envoi de billets
par email).

## État du projet

Application React (Vite) complète : authentification Google, rôles
admin/agent, scanner QR caméra + saisie manuelle, dashboard temps réel,
envoi d'email côté serveur, export Excel/PDF.

Étapes :

1. ✅ Structure du projet (squelette React/Vite, config d'environnement)
2. ✅ Authentification Google + modèle de rôles (admin / agent)
3. ✅ Règles Firestore définitives (scanner vs dashboard)
4. ✅ Scanner QR (caméra + saisie manuelle), compatible Android/iPhone
5. ✅ Dashboard (liste des tickets, stats, recherche, CRUD)
6. ✅ Génération de QR + envoi d'email via une fonction serveur (Cloud
   Functions) — la clé API du fournisseur d'email n'est plus jamais
   saisie ni exposée dans le navigateur
7. ✅ Export Excel / PDF de la liste des tickets

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
  tickets, export, envoi d'emails).
- **agent** : scanner uniquement — peut lire les tickets et mettre à jour
  *seulement* `status` et `entryTime` (impossible de créer, supprimer, ou
  modifier le nom/email/catégorie d'un ticket). Appliqué côté serveur par
  `firestore.rules`, pas seulement côté UI.

⚠️ Les emails dans `admins`/`agents` doivent être en minuscules (les
règles et la Cloud Function comparent l'email du token en minuscules).

### Amorçage (premier déploiement)

Firestore refuse tout par défaut tant que `meta/access` n'existe pas.
Avant la première connexion, crée manuellement ce document dans la
console Firebase : collection `meta`, document `access`, avec les champs
`admins` (array) et `agents` (array) ci-dessus.

## Scanner QR — Android et iPhone

Le scanner utilise `getUserMedia` (caméra) + `jsQR` (décodage), qui
fonctionnent sur Chrome Android et Safari iOS à condition de respecter
quelques contraintes :

- **HTTPS obligatoire sur appareil réel.** `getUserMedia` est bloqué en
  HTTP, sauf sur `localhost`. Pour tester depuis un téléphone, déploie
  sur Firebase Hosting (ou un canal de prévisualisation
  `firebase hosting:channel:deploy preview`) plutôt que d'ouvrir l'IP
  locale de ton ordinateur en http.
- `<video playsInline autoPlay muted>` est obligatoire sur iOS Safari,
  sinon la vidéo passe en plein écran natif et l'autoplay est refusé.
- Les contraintes caméra utilisent `facingMode: { ideal: ... }` (pas
  `exact`) pour ne pas échouer sur les appareils à une seule caméra.
- Un bouton "Changer de caméra" permet de basculer avant/arrière
  (utile sur iPad/iPhone multi-caméras).
- En cas de refus de permission ou d'absence de caméra, l'app affiche
  un message adapté (instructions iPhone vs Android) et la saisie
  manuelle reste toujours disponible en repli.

## Dashboard

Réservé aux admins (l'onglet n'apparaît même pas pour un agent). Permet
de :

- voir les stats en temps réel (total, entrés, en attente) ;
- rechercher un ticket (nom, code, catégorie) ;
- créer un ticket (aperçu + téléchargement du QR, envoi par email) ;
- modifier nom/email/catégorie d'un ticket existant ;
- réinitialiser ou supprimer un ticket ;
- renvoyer le billet par email à tout moment depuis la liste (icône ✉) ;
- exporter la liste complète en Excel ou PDF (boutons en haut du
  dashboard).

L'identifiant de ticket est généré avec un suffixe aléatoire vérifié
contre les tickets déjà chargés (`src/tickets/generateId.js`), à la
place du compteur `tickets.length + 1` de l'ancienne version qui pouvait
produire des doublons en cas de créations concurrentes.

**Limite connue** : le compteur "invalides/doublons" de l'ancienne
version était une variable JS locale, perdue au rechargement et jamais
partagée entre plusieurs postes de scan. Je ne l'ai pas repris en l'état
dans le dashboard pour ne pas afficher un chiffre faux — un vrai journal
de scans persisté dans Firestore pourra être ajouté plus tard si ce
suivi est nécessaire.

## Export Excel / PDF

`src/tickets/exportTickets.js` génère, côté navigateur (pas de fonction
serveur nécessaire ici, aucune donnée sensible n'est impliquée) :

- un fichier `.xlsx` (via `xlsx`) avec une ligne par ticket (code, nom,
  email, catégorie, statut, heure d'entrée) ;
- un fichier `.pdf` (via `jspdf` + `jspdf-autotable`) avec un tableau
  équivalent et un en-tête horodaté.

L'export porte sur la liste complète des tickets chargés (indépendant du
filtre de recherche du tableau).

## Email — fonction serveur (Cloud Functions)

Dans l'ancienne version, la clé API du fournisseur d'email (Resend/
SendGrid) était saisie directement dans le navigateur — n'importe qui
ouvrant les outils de dev pouvait la voler. C'est désormais corrigé :

- `functions/index.js` expose une Cloud Function **callable**
  `sendTicketEmail({ ticketId })`.
- La fonction vérifie que l'appelant est connecté **et** listé dans
  `meta/access.admins` (même règle que le dashboard) avant de faire
  quoi que ce soit.
- Elle régénère le QR côté serveur (`qrcode` côté Node) et l'envoie en
  pièce jointe via l'API Resend, en utilisant une *clé secrète Cloud
  Functions* — jamais une variable `VITE_*`, donc jamais dans le bundle
  client.
- En cas de succès, le ticket Firestore reçoit un champ `emailSentAt`
  (affiché comme ✓ dans le dashboard, ce qui permet de savoir qui a déjà
  reçu son billet sans relancer un envoi par erreur).

### Configuration

```bash
cd functions
npm install

# Clé API Resend (ou autre fournisseur compatible), stockée comme secret
# Cloud Functions — jamais en clair dans le repo.
firebase functions:secrets:set RESEND_API_KEY

# Optionnel : adresse d'expéditeur personnalisée (sinon valeur par défaut
# de test Resend). Pour la 2e génération de Cloud Functions, cela se
# configure via un fichier functions/.env (non commité, voir .gitignore) :
#   EMAIL_FROM="EventScan <billets@tondomaine.com>"

firebase deploy --only functions
```

Le domaine d'envoi (`EMAIL_FROM`) doit être vérifié côté Resend pour ne
pas finir en spam ; en attendant, la valeur par défaut `onboarding@
resend.dev` fonctionne pour les tests.

## Développement

```bash
npm install
cp .env.example .env   # renseigner la config Firebase du projet
npm run dev
```

## Variables d'environnement

Voir `.env.example`. Toutes les clés sont préfixées `VITE_` pour être
exposées au build Vite côté client (config Firebase publique standard,
pas de secret serveur ici — la clé email, elle, vit uniquement dans
`functions/` côté serveur, voir section ci-dessus).

## Build

```bash
npm run build
```

## Déploiement

```bash
npm run build
firebase deploy --only hosting,firestore:rules,functions
```

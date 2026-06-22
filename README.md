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
4. ✅ Scanner QR (caméra + saisie manuelle), compatible Android/iPhone
5. ✅ Dashboard (liste des tickets, stats, recherche, CRUD)
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
- créer un ticket (aperçu + téléchargement du QR) ;
- modifier nom/email/catégorie d'un ticket existant ;
- réinitialiser ou supprimer un ticket.

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

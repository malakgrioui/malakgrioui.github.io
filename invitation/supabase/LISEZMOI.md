# Mettre en route Supabase (≈ 10 minutes)

## 1. Créer le projet
1. Va sur [supabase.com](https://supabase.com) → **New project** (offre gratuite).
2. Nom : `mariage`, région : **West EU (Paris)**, choisis un mot de passe de base de données (garde-le, il ne sert pas au site).

## 2. Créer les tables
1. Dans le projet : **SQL Editor** → **New query**.
2. Ouvre `schema.sql`, remplace `ton-email@exemple.com` (dernière ligne) par **ton adresse e-mail**.
3. Colle tout le fichier → **Run**. Le message « Success » doit s'afficher.

## 3. Créer ton compte de gestion
1. **Authentication → Users → Add user → Create new user**.
2. Même e-mail qu'à l'étape 2, un mot de passe, et coche **Auto Confirm User**.
3. **Authentication → Sign In / Providers** : désactive **Allow new users to sign up** (personne d'autre ne pourra créer de compte).

## 4. Brancher le site
1. **Project Settings → API** (ou **Data API**) : copie **Project URL** et la clé **anon public**.
2. Envoie-les-moi, ou colle-les dans `invitation/config.js` :
   ```js
   const SUPABASE_URL = "https://xxxx.supabase.co";
   const SUPABASE_ANON_KEY = "eyJ...";
   ```
   Cette clé est faite pour être publique : la base n'autorise rien d'autre que lire sa propre invitation (avec son code) et envoyer sa réponse.

## 5. Utiliser
- `https://malakgrioui.github.io/invitation/gestion.html` : connexion avec ton e-mail et mot de passe, puis ajout ou import des foyers, suivi des réponses, liens à copier ou à envoyer par WhatsApp, export CSV.
- Les données sont aussi visibles dans Supabase → **Table Editor** (`foyers`, `reponses`).

> Sur l'offre gratuite, Supabase met en pause un projet resté 7 jours sans aucune visite. Pendant la période des réponses, ça n'arrivera pas ; sinon, un clic sur **Restore** dans le tableau de bord suffit.

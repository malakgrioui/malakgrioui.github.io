# Faire-part numérique — Ibrahim & Malak

- Page : `https://malakgrioui.github.io/invitation/`
- Lien d'un foyer : `https://malakgrioui.github.io/invitation/#code` (ou `?code=code`)
- Gestion (connexion, foyers, réponses, liens, WhatsApp, export) : `https://malakgrioui.github.io/invitation/gestion.html`

## Données
La liste des foyers et les réponses sont dans Supabase : voir `supabase/LISEZMOI.md` pour la mise en route.
Tant que Supabase n'est pas configuré, la page fonctionne en mode démo avec les foyers d'exemple de `config.js`.

## À modifier
Dans `config.js` :
- `SUPABASE_URL`, `SUPABASE_ANON_KEY` : connexion à la base.
- `RSVP_DEADLINE` : date limite de réponse (texte libre).
- `EVENTS` : heure, adresse et lien Google Maps (`maps`) de chaque événement.

## Images
`assets/carte.webp` (carte festonnée), `assets/frise.webp` (séparateur), `assets/damasse-flou.webp` (fond), `assets/enveloppe-fermee.webp` et `assets/enveloppe-ouverte.webp` (recalées par `outils/aligner_enveloppe.py`).

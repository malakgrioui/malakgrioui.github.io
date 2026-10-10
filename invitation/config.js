/* ================= CONFIGURATION =================
   Seul fichier à modifier pour mettre à jour l'invitation.
   La liste des foyers et les réponses sont dans Supabase
   (voir supabase/LISEZMOI.md).
   ================================================== */

// Supabase → Project Settings → API : « Project URL » et clé « anon public ».
// Cette clé est faite pour être publique : la base n'autorise rien d'autre
// que la lecture de sa propre invitation et l'envoi de sa propre réponse.
const SUPABASE_URL = "";
const SUPABASE_ANON_KEY = "";

// Date limite de réponse (texte libre). Vide = non affichée.
const RSVP_DEADLINE = "";

const EVENTS = {
  mairie:  { titre: "Cérémonie civile",     lieu: "Mairie",    heure: "À confirmer", adresse: "Adresse à confirmer", maps: "" },
  repas:   { titre: "Repas de mariage",     lieu: "Réception", heure: "À confirmer", adresse: "Lieu à confirmer",    maps: "" },
  mosquee: { titre: "Cérémonie religieuse", lieu: "Mosquée",   heure: "À confirmer", adresse: "Lieu à confirmer",    maps: "" }
};
const ORDER = ["mairie", "repas", "mosquee"];

// Mode démo : utilisé seulement tant que Supabase n'est pas configuré.
// Les réponses sont alors gardées dans le navigateur, sans être envoyées.
const DEMO_GUESTS = [
  { code: "exemple-k7m2", foyer: "Famille Exemple", personnes: 4, evenements: ["mairie", "repas", "mosquee"] },
  { code: "exemple-p3x9", foyer: "Famille Démo",    personnes: 2, evenements: ["mairie", "mosquee"] },
  { code: "exemple-w5t1", foyer: "Famille Test",    personnes: 1, evenements: ["mairie"] }
];

/* ---------- Accès aux données (partagé par index.html et gestion.html) ---------- */
const DB_READY = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

async function rpc(name, args) {
  const res = await fetch(SUPABASE_URL.replace(/\/+$/, "") + "/rest/v1/rpc/" + name, {
    method: "POST",
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: "Bearer " + SUPABASE_ANON_KEY, "Content-Type": "application/json" },
    body: JSON.stringify(args)
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error((body && body.message) || "Erreur " + res.status);
  return body;
}

function demoStore(code, value) {
  const key = "rsvp-demo-" + code;
  try {
    if (value === undefined) return JSON.parse(localStorage.getItem(key));
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {}
  return value || null;
}

// { code, foyer, personnes, evenements, reponse: { mairie, repas, mosquee, updated_at } | null } ou null
async function loadInvitation(code) {
  if (!code) return null;
  if (DB_READY) return rpc("get_invitation", { p_code: code });
  const g = DEMO_GUESTS.find(x => x.code === code);
  return g ? { ...g, reponse: demoStore(code) } : null;
}

// counts : { mairie: n, repas: n, mosquee: n } (0 = absent) → invitation mise à jour
async function sendReponse(code, counts) {
  const args = { p_code: code, p_mairie: counts.mairie ?? null, p_repas: counts.repas ?? null, p_mosquee: counts.mosquee ?? null };
  if (DB_READY) return rpc("repondre", args);
  const inv = await loadInvitation(code);
  inv.reponse = demoStore(code, { mairie: args.p_mairie, repas: args.p_repas, mosquee: args.p_mosquee, updated_at: new Date().toISOString() });
  return inv;
}

/* ================= CONFIGURATION =================
   Seul fichier à modifier pour mettre à jour l'invitation.
   ================================================== */

// Lien du formulaire de réponse (Tally, Google Forms…). Vide = bouton désactivé.
// Le bouton y ajoute les champs cachés : code, foyer, personnes, evenements.
const FORM_URL = "";

// Date limite de réponse (texte libre). Vide = non affichée.
const RSVP_DEADLINE = "";

const EVENTS = {
  mairie:  { titre: "Cérémonie civile",     ar: "عقد القران المدني", lieu: "Mairie",    heure: "À confirmer", adresse: "Adresse à confirmer", maps: "" },
  repas:   { titre: "Repas de mariage",     ar: "حفل العشاء",        lieu: "Réception", heure: "À confirmer", adresse: "Lieu à confirmer",    maps: "" },
  mosquee: { titre: "Cérémonie religieuse", ar: "عقد القران",        lieu: "Mosquée",   heure: "À confirmer", adresse: "Lieu à confirmer",    maps: "" }
};
const ORDER = ["mairie", "repas", "mosquee"];

// Un foyer = un lien : .../invitation/#code (ou ?code=...).
// code : minuscules, chiffres et tirets, avec un suffixe difficile à deviner.
const GUESTS = [
  { code: "exemple-k7m2", foyer: "Famille Exemple", personnes: 4, events: ["mairie", "repas", "mosquee"], exemple: true },
  { code: "exemple-p3x9", foyer: "Famille Démo",    personnes: 2, events: ["mairie", "mosquee"],          exemple: true },
  { code: "exemple-w5t1", foyer: "Famille Test",    personnes: 3, events: ["mairie"],                    exemple: true }
];

import type { NavCategory } from "@/types"

// ── Primary navigation categories ────────────────────────────
export const NAV_CATEGORIES: NavCategory[] = [
  {
    id: "school-books",
    name: "Livres Scolaires",
    slug: "livres-scolaires",
    icon: "BookOpen",
    children: [
      {
        id: "primary",
        name: "Primaire",
        slug: "livres-scolaires/primaire",
        children: [
          { id: "primary-1", name: "1ère année", slug: "livres-scolaires/primaire/1ere-annee" },
          { id: "primary-2", name: "2ème année", slug: "livres-scolaires/primaire/2eme-annee" },
          { id: "primary-3", name: "3ème année", slug: "livres-scolaires/primaire/3eme-annee" },
          { id: "primary-4", name: "4ème année", slug: "livres-scolaires/primaire/4eme-annee" },
          { id: "primary-5", name: "5ème année", slug: "livres-scolaires/primaire/5eme-annee" },
          { id: "primary-6", name: "6ème année", slug: "livres-scolaires/primaire/6eme-annee" },
        ],
      },
      {
        id: "college",
        name: "Collège",
        slug: "livres-scolaires/college",
        children: [
          { id: "college-1", name: "1ère année collège", slug: "livres-scolaires/college/1ere-annee" },
          { id: "college-2", name: "2ème année collège", slug: "livres-scolaires/college/2eme-annee" },
          { id: "college-3", name: "3ème année collège", slug: "livres-scolaires/college/3eme-annee" },
        ],
      },
      {
        id: "lycee",
        name: "Lycée",
        slug: "livres-scolaires/lycee",
        children: [
          { id: "lycee-1", name: "Tronc commun", slug: "livres-scolaires/lycee/tronc-commun" },
          { id: "lycee-2", name: "1ère Bac", slug: "livres-scolaires/lycee/1ere-bac" },
          { id: "lycee-3", name: "2ème Bac", slug: "livres-scolaires/lycee/2eme-bac" },
        ],
      },
      {
        id: "exam-prep",
        name: "Préparation aux examens",
        slug: "livres-scolaires/examens",
      },
      {
        id: "workbooks",
        name: "Cahiers d'exercices",
        slug: "livres-scolaires/cahiers-exercices",
      },
    ],
  },
  {
    id: "books",
    name: "Livres",
    slug: "livres",
    icon: "Book",
    children: [
      { id: "novels", name: "Romans & Littérature", slug: "livres/romans" },
      { id: "children", name: "Livres pour enfants", slug: "livres/enfants" },
      { id: "personal-dev", name: "Développement personnel", slug: "livres/developpement-personnel" },
      { id: "science", name: "Sciences & Nature", slug: "livres/sciences" },
      { id: "culture", name: "Culture & Société", slug: "livres/culture" },
      { id: "religion", name: "Religion & Spiritualité", slug: "livres/religion" },
      { id: "bd", name: "Bandes dessinées", slug: "livres/bd" },
      { id: "dictionaries", name: "Dictionnaires", slug: "livres/dictionnaires" },
    ],
  },
  {
    id: "stationery",
    name: "Papeterie",
    slug: "papeterie",
    icon: "PenLine",
    children: [
      { id: "notebooks", name: "Cahiers & Carnets", slug: "papeterie/cahiers" },
      { id: "pens", name: "Stylos & Crayons", slug: "papeterie/stylos" },
      { id: "markers", name: "Marqueurs & Feutres", slug: "papeterie/marqueurs" },
      { id: "folders", name: "Classeurs & Pochettes", slug: "papeterie/classeurs" },
      { id: "organization", name: "Organisation", slug: "papeterie/organisation" },
      { id: "correction", name: "Correction", slug: "papeterie/correction" },
      { id: "adhesives", name: "Colle & Adhésifs", slug: "papeterie/adhesifs" },
    ],
  },
  {
    id: "school-supplies",
    name: "Fournitures Scolaires",
    slug: "fournitures-scolaires",
    icon: "Ruler",
    children: [
      { id: "geometry", name: "Géométrie", slug: "fournitures-scolaires/geometrie" },
      { id: "calculators", name: "Calculatrices", slug: "fournitures-scolaires/calculatrices" },
      { id: "backpacks", name: "Cartables & Sacs", slug: "fournitures-scolaires/cartables" },
      { id: "pencil-cases", name: "Trousses", slug: "fournitures-scolaires/trousses" },
      { id: "art-supplies", name: "Art & Dessin", slug: "fournitures-scolaires/art-dessin" },
      { id: "accessories", name: "Accessoires", slug: "fournitures-scolaires/accessoires" },
    ],
  },
  {
    id: "office",
    name: "Bureau",
    slug: "bureau",
    icon: "Briefcase",
    children: [
      { id: "organization-office", name: "Organisation", slug: "bureau/organisation" },
      { id: "printing", name: "Impression", slug: "bureau/impression" },
      { id: "desk", name: "Accessoires de bureau", slug: "bureau/accessoires" },
      { id: "storage", name: "Rangement", slug: "bureau/rangement" },
      { id: "planners", name: "Agendas & Planners", slug: "bureau/agendas" },
    ],
  },
  {
    id: "arts",
    name: "Arts & Créativité",
    slug: "arts-creativite",
    icon: "Palette",
    children: [
      { id: "drawing", name: "Dessin & Sketch", slug: "arts-creativite/dessin" },
      { id: "painting", name: "Peinture", slug: "arts-creativite/peinture" },
      { id: "diy", name: "DIY & Loisirs créatifs", slug: "arts-creativite/diy" },
      { id: "craft", name: "Matériaux créatifs", slug: "arts-creativite/materiaux" },
      { id: "coloring", name: "Coloriages", slug: "arts-creativite/coloriages" },
    ],
  },
  {
    id: "packs",
    name: "Kits Scolaires",
    slug: "kits-scolaires",
    icon: "Package",
    children: [
      { id: "pack-primary", name: "Kit Primaire", slug: "kits-scolaires/primaire" },
      { id: "pack-college", name: "Kit Collège", slug: "kits-scolaires/college" },
      { id: "pack-lycee", name: "Kit Lycée", slug: "kits-scolaires/lycee" },
    ],
  },
  {
    id: "new-arrivals",
    name: "Nouveautés",
    slug: "nouveautes",
    icon: "Sparkles",
  },
  {
    id: "best-offers",
    name: "Meilleures Offres",
    slug: "meilleures-offres",
    icon: "Tag",
  },
]

// ── Announcement messages ─────────────────────────────────────
export const ANNOUNCEMENT_MESSAGES = [
  "Livraison partout au Maroc 🇲🇦",
  "Paiement à la livraison disponible",
  "Livraison gratuite dès 299 DH d'achat",
]

// ── Store info ────────────────────────────────────────────────
export const WHATSAPP_NUMBER = "+212715220300"

export const SOCIAL_LINKS = {
  instagram: "https://instagram.com",
  facebook: "https://facebook.com",
}

export const STORE_INFO = {
  name: "Papeterie Pro Excel",
  tagline: "Fournitures Scolaires, de Bureau & Librairie",
  phone: "07 15 22 03 00",
  whatsapp: WHATSAPP_NUMBER,
  email: "contact@proexcel.ma",
  address: "Casablanca, Maroc",
  hours: "Lun - Sam : 09h00 - 13h00 / 15h00 - 20h30",
  currency: "DH",
  currencyCode: "MAD",
  locale: "fr-MA",
}

export interface AdminOrder {
  id: string
  order_number: string
  customer_name: string
  customer_email: string
  customer_phone: string
  city: string
  address: string
  total_amount: number
  payment_method: "cod" | "card" | "transfer"
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled"
  created_at: string
  items: {
    id: string
    product_name: string
    quantity: number
    unit_price: number
    total_price: number
    image: string
  }[]
  timeline: {
    status: string
    title: string
    description: string
    timestamp: string
    completed: boolean
  }[]
  notes?: string
}

export interface AdminCustomer {
  id: string
  name: string
  email: string
  phone: string
  city: string
  orders_count: number
  total_spent: number
  last_order_date: string
  created_at: string
  addresses: {
    type: string
    street: string
    city: string
    postal_code: string
  }[]
}

export interface AdminStockItem {
  id: string
  product_id: string
  product_name: string
  sku: string
  category: string
  current_stock: number
  threshold: number
  status: "in_stock" | "low_stock" | "out_of_stock"
  image: string
  price: number
}

export interface AdminStockLog {
  id: string
  date: string
  product_name: string
  sku: string
  change: number
  reason: "restock" | "sale" | "adjustment" | "return"
  admin_name: string
  new_stock: number
}

export interface AdminCoupon {
  id: string
  code: string
  type: "percentage" | "fixed"
  value: number
  min_order: number
  start_date: string
  end_date: string
  usage_limit: number
  usage_count: number
  is_active: boolean
}

export interface AdminReview {
  id: string
  product_id: string
  product_name: string
  product_image: string
  customer_name: string
  rating: number
  title: string
  comment: string
  date: string
  status: "pending" | "approved" | "rejected"
}

export interface AdminHeroSlide {
  id: string
  title: string
  subtitle: string
  cta_text: string
  cta_link: string
  image_url: string
  badge_text: string
  order: number
  is_active: boolean
}

export interface AdminPromoTile {
  id: string
  badge: string
  title: string
  subtitle: string
  link: string
  icon_name: string
  is_active: boolean
}

// ── Seed Orders ─────────────────────────────────────────────
export const SEED_ORDERS: AdminOrder[] = [
  {
    id: "ord-1001",
    order_number: "PE-2026-1049",
    customer_name: "Yassine Berrada",
    customer_email: "yassine.b@gmail.com",
    customer_phone: "+212 661-234567",
    city: "Casablanca",
    address: "Bd d'Anfa, Résidence Al Manar, Apt 14",
    total_amount: 549,
    payment_method: "cod",
    status: "pending",
    created_at: "2026-08-26T20:15:00Z",
    notes: "Appeler avant la livraison svp",
    items: [
      {
        id: "item-1",
        product_name: "Kit Scolaire Primaire Complet — 1ère & 2ème AP",
        quantity: 1,
        unit_price: 349,
        total_price: 349,
        image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=200&auto=format&fit=crop&q=80",
      },
      {
        id: "item-2",
        product_name: "Boîte 12 Stylos Bille Cristal Medium — BIC",
        quantity: 2,
        unit_price: 35,
        total_price: 70,
        image: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=200&auto=format&fit=crop&q=80",
      },
      {
        id: "item-3",
        product_name: "Lot 5 Cahiers Grand Format 200p Séyès — Clairefontaine",
        quantity: 1,
        unit_price: 130,
        total_price: 130,
        image: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=200&auto=format&fit=crop&q=80",
      },
    ],
    timeline: [
      { status: "pending", title: "Commande passée", description: "Le client a validé son panier", timestamp: "26 Août 2026, 20:15", completed: true },
      { status: "confirmed", title: "Confirmation téléphonique", description: "Vérification de l'adresse client", timestamp: "En attente", completed: false },
      { status: "processing", title: "Préparation colis", description: "Colisage en entrepôt", timestamp: "En attente", completed: false },
      { status: "shipped", title: "Expédition", description: "Pris en charge par le transporteur", timestamp: "En attente", completed: false },
      { status: "delivered", title: "Livré", description: "Paiement à la livraison encaissé", timestamp: "En attente", completed: false },
    ],
  },
  {
    id: "ord-1002",
    order_number: "PE-2026-1048",
    customer_name: "Salma Mansouri",
    customer_email: "salma.m@outlook.com",
    customer_phone: "+212 663-891011",
    city: "Rabat",
    address: "Avenue Annakhil, Hay Riad",
    total_amount: 890,
    payment_method: "cod",
    status: "processing",
    created_at: "2026-08-26T16:30:00Z",
    items: [
      {
        id: "item-4",
        product_name: "Calculatrice Scientifique FX-991CW — Casio",
        quantity: 1,
        unit_price: 320,
        total_price: 320,
        image: "https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=200&auto=format&fit=crop&q=80",
      },
      {
        id: "item-5",
        product_name: "Set Beaux-Arts 36 Crayons Polychromos — Faber-Castell",
        quantity: 1,
        unit_price: 570,
        total_price: 570,
        image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=200&auto=format&fit=crop&q=80",
      },
    ],
    timeline: [
      { status: "pending", title: "Commande passée", description: "Paiement à la livraison", timestamp: "26 Août 2026, 16:30", completed: true },
      { status: "confirmed", title: "Confirmée par téléphone", description: "Client joignable", timestamp: "26 Août 2026, 17:00", completed: true },
      { status: "processing", title: "Préparation en cours", description: "En cours d'emballage", timestamp: "26 Août 2026, 18:20", completed: true },
      { status: "shipped", title: "Expédition", description: "En attente du ramassage", timestamp: "En attente", completed: false },
      { status: "delivered", title: "Livré", description: "Colis remis", timestamp: "En attente", completed: false },
    ],
  },
  {
    id: "ord-1003",
    order_number: "PE-2026-1047",
    customer_name: "Omar Tazi",
    customer_email: "o.tazi@menara.ma",
    customer_phone: "+212 660-445566",
    city: "Marrakech",
    address: "Guéliz, Rue de la Liberté",
    total_amount: 1250,
    payment_method: "transfer",
    status: "shipped",
    created_at: "2026-08-25T11:20:00Z",
    items: [
      {
        id: "item-6",
        product_name: "Pack Rentrée Collège 3ème Année Conforme",
        quantity: 2,
        unit_price: 625,
        total_price: 1250,
        image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=200&auto=format&fit=crop&q=80",
      },
    ],
    timeline: [
      { status: "pending", title: "Commande passée", description: "Virement bancaire", timestamp: "25 Août 2026, 11:20", completed: true },
      { status: "confirmed", title: "Virement reçu", description: "Paiement validé", timestamp: "25 Août 2026, 14:00", completed: true },
      { status: "processing", title: "Préparé", description: "Colis scellé", timestamp: "25 Août 2026, 16:45", completed: true },
      { status: "shipped", title: "Expédié", description: "N° Suivi Amana: MA-8921092", timestamp: "26 Août 2026, 09:00", completed: true },
      { status: "delivered", title: "Livré", description: "Livraison prévue le 27 Août", timestamp: "En cours", completed: false },
    ],
  },
  {
    id: "ord-1004",
    order_number: "PE-2026-1046",
    customer_name: "Khadija El Idrissi",
    customer_email: "khadija.idrissi@gmail.com",
    customer_phone: "+212 672-112233",
    city: "Tanger",
    address: "Malabata, Résidence Les Fleurs",
    total_amount: 420,
    payment_method: "cod",
    status: "delivered",
    created_at: "2026-08-24T09:40:00Z",
    items: [
      {
        id: "item-7",
        product_name: "Organiseur Bureau Métal & 4 Trieurs — Oxford",
        quantity: 1,
        unit_price: 420,
        total_price: 420,
        image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=200&auto=format&fit=crop&q=80",
      },
    ],
    timeline: [
      { status: "pending", title: "Commande passée", description: "Paiement à la livraison", timestamp: "24 Août 2026, 09:40", completed: true },
      { status: "confirmed", title: "Confirmé", description: "Validé", timestamp: "24 Août 2026, 10:15", completed: true },
      { status: "processing", title: "Préparé", description: "Prêt", timestamp: "24 Août 2026, 13:00", completed: true },
      { status: "shipped", title: "Expédié", description: "En route", timestamp: "24 Août 2026, 15:30", completed: true },
      { status: "delivered", title: "Livré avec succès", description: "Encaissé 420 DH", timestamp: "25 Août 2026, 14:10", completed: true },
    ],
  },
  {
    id: "ord-1005",
    order_number: "PE-2026-1045",
    customer_name: "Mehdi Benjelloun",
    customer_email: "m.benjelloun@yahoo.fr",
    customer_phone: "+212 668-990011",
    city: "Fès",
    address: "Route d'Immouzer, Hay Saada",
    total_amount: 290,
    payment_method: "cod",
    status: "cancelled",
    created_at: "2026-08-23T14:10:00Z",
    notes: "Annulé par le client (doublon de commande)",
    items: [
      {
        id: "item-8",
        product_name: "Set Géométrie Métal Professionnel 7 Pièces — Maped",
        quantity: 2,
        unit_price: 145,
        total_price: 290,
        image: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=200&auto=format&fit=crop&q=80",
      },
    ],
    timeline: [
      { status: "pending", title: "Commande passée", description: "Créée", timestamp: "23 Août 2026, 14:10", completed: true },
      { status: "cancelled", title: "Commande annulée", description: "Motif: Doublon", timestamp: "23 Août 2026, 15:00", completed: true },
    ],
  },
]

// ── Seed Stock & Inventory ──────────────────────────────────
export const SEED_STOCK_ITEMS: AdminStockItem[] = [
  {
    id: "stk-1",
    product_id: "prod-1",
    product_name: "Calculatrice Scientifique FX-991CW — Casio",
    sku: "CAS-FX991CW",
    category: "Fournitures Scolaires",
    current_stock: 4,
    threshold: 10,
    status: "low_stock",
    price: 320,
    image: "https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=200&auto=format&fit=crop&q=80",
  },
  {
    id: "stk-2",
    product_id: "prod-2",
    product_name: "Lot 5 Cahiers Grand Format 200p Séyès — Clairefontaine",
    sku: "CF-CAH200-A4",
    category: "Papeterie",
    current_stock: 3,
    threshold: 15,
    status: "low_stock",
    price: 130,
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=200&auto=format&fit=crop&q=80",
  },
  {
    id: "stk-3",
    product_id: "prod-3",
    product_name: "Set Beaux-Arts 36 Crayons Polychromos — Faber-Castell",
    sku: "FC-POLY-36",
    category: "Arts & Créativité",
    current_stock: 0,
    threshold: 5,
    status: "out_of_stock",
    price: 570,
    image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=200&auto=format&fit=crop&q=80",
  },
  {
    id: "stk-4",
    product_id: "prod-4",
    product_name: "Kit Scolaire Primaire Complet — 1ère & 2ème AP",
    sku: "KIT-PRIM-01",
    category: "Kits Scolaires",
    current_stock: 2,
    threshold: 8,
    status: "low_stock",
    price: 349,
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=200&auto=format&fit=crop&q=80",
  },
  {
    id: "stk-5",
    product_id: "prod-5",
    product_name: "Boîte 12 Stylos Bille Cristal Medium — BIC",
    sku: "BIC-CRISTAL-12",
    category: "Papeterie",
    current_stock: 85,
    threshold: 20,
    status: "in_stock",
    price: 35,
    image: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=200&auto=format&fit=crop&q=80",
  },
  {
    id: "stk-6",
    product_id: "prod-6",
    product_name: "Organiseur Bureau Métal & 4 Trieurs — Oxford",
    sku: "OXF-ORG-MET",
    category: "Bureau",
    current_stock: 24,
    threshold: 5,
    status: "in_stock",
    price: 420,
    image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=200&auto=format&fit=crop&q=80",
  },
]

export const SEED_STOCK_LOGS: AdminStockLog[] = [
  { id: "log-1", date: "26 Août 2026, 18:30", product_name: "Boîte 12 Stylos Bille Cristal Medium — BIC", sku: "BIC-CRISTAL-12", change: 50, reason: "restock", admin_name: "Admin ProExcel", new_stock: 85 },
  { id: "log-2", date: "26 Août 2026, 16:30", product_name: "Calculatrice Scientifique FX-991CW — Casio", sku: "CAS-FX991CW", change: -1, reason: "sale", admin_name: "Système (Commande #1048)", new_stock: 4 },
  { id: "log-3", date: "25 Août 2026, 11:20", product_name: "Pack Rentrée Collège 3ème Année", sku: "KIT-COL-03", change: -2, reason: "sale", admin_name: "Système (Commande #1047)", new_stock: 14 },
  { id: "log-4", date: "24 Août 2026, 15:00", product_name: "Set Beaux-Arts 36 Crayons Polychromos", sku: "FC-POLY-36", change: -5, reason: "adjustment", admin_name: "Responsable Stock", new_stock: 0 },
]

// ── Seed Customers ──────────────────────────────────────────
export const SEED_CUSTOMERS: AdminCustomer[] = [
  {
    id: "cust-1",
    name: "Yassine Berrada",
    email: "yassine.b@gmail.com",
    phone: "+212 661-234567",
    city: "Casablanca",
    orders_count: 4,
    total_spent: 2350,
    last_order_date: "26 Août 2026",
    created_at: "15 Janvier 2026",
    addresses: [
      { type: "Domicile", street: "Bd d'Anfa, Résidence Al Manar, Apt 14", city: "Casablanca", postal_code: "20000" },
    ],
  },
  {
    id: "cust-2",
    name: "Salma Mansouri",
    email: "salma.m@outlook.com",
    phone: "+212 663-891011",
    city: "Rabat",
    orders_count: 2,
    total_spent: 1480,
    last_order_date: "26 Août 2026",
    created_at: "03 Mars 2026",
    addresses: [
      { type: "Bureau", street: "Avenue Annakhil, Hay Riad", city: "Rabat", postal_code: "10000" },
    ],
  },
  {
    id: "cust-3",
    name: "Omar Tazi",
    email: "o.tazi@menara.ma",
    phone: "+212 660-445566",
    city: "Marrakech",
    orders_count: 5,
    total_spent: 4890,
    last_order_date: "25 Août 2026",
    created_at: "10 Novembre 2025",
    addresses: [
      { type: "Principal", street: "Guéliz, Rue de la Liberté", city: "Marrakech", postal_code: "40000" },
    ],
  },
  {
    id: "cust-4",
    name: "Khadija El Idrissi",
    email: "khadija.idrissi@gmail.com",
    phone: "+212 672-112233",
    city: "Tanger",
    orders_count: 1,
    total_spent: 420,
    last_order_date: "24 Août 2026",
    created_at: "24 Août 2026",
    addresses: [
      { type: "Domicile", street: "Malabata, Résidence Les Fleurs", city: "Tanger", postal_code: "90000" },
    ],
  },
]

// ── Seed Marketing (Coupons & Reviews) ──────────────────────
export const SEED_COUPONS: AdminCoupon[] = [
  { id: "coup-1", code: "RENTREE2026", type: "percentage", value: 15, min_order: 300, start_date: "2026-08-01", end_date: "2026-09-30", usage_limit: 500, usage_count: 184, is_active: true },
  { id: "coup-2", code: "PROMO50", type: "fixed", value: 50, min_order: 400, start_date: "2026-08-15", end_date: "2026-09-15", usage_limit: 200, usage_count: 92, is_active: true },
  { id: "coup-3", code: "LIVRAISON_GRATUITE", type: "fixed", value: 35, min_order: 250, start_date: "2026-01-01", end_date: "2026-12-31", usage_limit: 1000, usage_count: 430, is_active: true },
]

export const SEED_REVIEWS: AdminReview[] = [
  {
    id: "rev-1",
    product_id: "prod-1",
    product_name: "Calculatrice Scientifique FX-991CW — Casio",
    product_image: "https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=200&auto=format&fit=crop&q=80",
    customer_name: "Youssef K.",
    rating: 5,
    title: "Parfaite pour le baccalauréat",
    comment: "Conforme au programme marocain, très simple d'utilisation et livrée sous 24h.",
    date: "Il y a 1 jour",
    status: "approved",
  },
  {
    id: "rev-2",
    product_id: "prod-4",
    product_name: "Kit Scolaire Primaire Complet",
    product_image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=200&auto=format&fit=crop&q=80",
    customer_name: "Fatima Z.",
    rating: 5,
    title: "Gain de temps incroyable !",
    comment: "Tous les cahiers et fournitures demandés par l'école étaient dans le pack. Bravo ProExcel.",
    date: "Il y a 3 jours",
    status: "approved",
  },
  {
    id: "rev-3",
    product_id: "prod-5",
    product_name: "Boîte 12 Stylos Bille Cristal Medium",
    product_image: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=200&auto=format&fit=crop&q=80",
    customer_name: "Amine M.",
    rating: 4,
    title: "Classique et efficace",
    comment: "Bonne qualité d'origine, rien à redire.",
    date: "Il y a 4 heures",
    status: "pending",
  },
]

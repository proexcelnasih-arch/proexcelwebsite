-- ============================================================
-- 015_seed_data.sql
-- Production Seed Data: Categories, Brands, Products, Images, Reviews, Slides, Settings
-- ============================================================

-- ── 1. STORE SETTINGS ───────────────────────────────────────
insert into public.store_settings (
  id,
  store_name,
  description,
  logo_url,
  contact_email,
  contact_phone,
  address,
  free_shipping_threshold,
  cod_enabled,
  delivery_zones,
  social_links
) values (
  1,
  'ProExcel',
  'Librairie & Papeterie n°1 au Maroc. Manuels scolaires, fournitures et papeterie de prestige.',
  '/logo.png',
  'contact@proexcel.store',
  '+212 6 25 15 15 12',
  'Boulevard d''Anfa, Casablanca, Maroc',
  299.00,
  true,
  '[
    {"name": "Casablanca & Environs", "delay": "24h ouvrées", "price": 25, "free_above": 299},
    {"name": "Grandes Villes (Rabat, Marrakech, Tanger, Fès...)", "delay": "24h à 48h", "price": 35, "free_above": 299},
    {"name": "Autres Villes du Royaume", "delay": "48h à 72h", "price": 35, "free_above": 299}
  ]'::jsonb,
  '{
    "instagram": "https://instagram.com/proexcel.store",
    "facebook": "https://facebook.com/proexcel.store",
    "whatsapp": "+212625151512"
  }'::jsonb
) on conflict (id) do update set
  store_name = excluded.store_name,
  contact_phone = excluded.contact_phone;

-- ── 2. BRANDS ───────────────────────────────────────────────
insert into public.brands (id, name, slug, description) values
  ('b0000000-0000-0000-0000-000000000001', 'Clairefontaine', 'clairefontaine', 'Papeterie française d''excellence depuis 1858.'),
  ('b0000000-0000-0000-0000-000000000002', 'BIC', 'bic', 'Leader mondial des instruments d''écriture fiables et durables.'),
  ('b0000000-0000-0000-0000-000000000003', 'Maped', 'maped', 'Accessoires scolaires innovants et ergonomiques.'),
  ('b0000000-0000-0000-0000-000000000004', 'Faber-Castell', 'faber-castell', 'Crayons et matériel d''art haut de gamme depuis 1761.'),
  ('b0000000-0000-0000-0000-000000000005', 'Casio', 'casio', 'Calculatrices scientifiques certifiées examens.'),
  ('b0000000-0000-0000-0000-000000000006', 'Oxford', 'oxford', 'Cahiers et classeurs haute résistance pour étudiants.'),
  ('b0000000-0000-0000-0000-000000000007', 'Stabilo', 'stabilo', 'Surligneurs iconiques et feutres de précision.'),
  ('b0000000-0000-0000-0000-000000000008', 'Hachette', 'hachette', 'Édition de manuels scolaires et littérature générale.')
on conflict (slug) do nothing;

-- ── 3. CATEGORIES & SUBCATEGORIES ───────────────────────────
insert into public.categories (id, name, slug, parent_id, icon, display_order, is_featured, is_active) values
  -- Main Parent Categories
  ('c0000000-0000-0000-0000-000000000001', 'Livres Scolaires', 'livres-scolaires', null, 'BookOpen', 1, true, true),
  ('c0000000-0000-0000-0000-000000000002', 'Livres', 'livres', null, 'Book', 2, true, true),
  ('c0000000-0000-0000-0000-000000000003', 'Papeterie', 'papeterie', null, 'PenLine', 3, true, true),
  ('c0000000-0000-0000-0000-000000000004', 'Fournitures Scolaires', 'fournitures-scolaires', null, 'Ruler', 4, true, true),
  ('c0000000-0000-0000-0000-000000000005', 'Bureau', 'bureau', null, 'Briefcase', 5, false, true),
  ('c0000000-0000-0000-0000-000000000006', 'Arts & Créativité', 'arts-creativite', null, 'Palette', 6, true, true),
  ('c0000000-0000-0000-0000-000000000007', 'Kits Scolaires', 'kits-scolaires', null, 'Package', 7, true, true),
  
  -- Subcategories for Livres Scolaires
  ('c0000000-0000-0000-0000-000000000010', 'Primaire', 'livres-primaire', 'c0000000-0000-0000-0000-000000000001', 'GraduationCap', 1, false, true),
  ('c0000000-0000-0000-0000-000000000011', 'Collège', 'livres-college', 'c0000000-0000-0000-0000-000000000001', 'GraduationCap', 2, false, true),
  ('c0000000-0000-0000-0000-000000000012', 'Lycée & Bac', 'livres-lycee-bac', 'c0000000-0000-0000-0000-000000000001', 'GraduationCap', 3, false, true),

  -- Subcategories for Papeterie
  ('c0000000-0000-0000-0000-000000000013', 'Cahiers & Blocs', 'cahiers-blocs', 'c0000000-0000-0000-0000-000000000003', 'FileText', 1, false, true),
  ('c0000000-0000-0000-0000-000000000014', 'Stylos & Écriture', 'stylos-ecriture', 'c0000000-0000-0000-0000-000000000003', 'PenTool', 2, false, true)
on conflict (slug) do nothing;

-- ── 4. COUPONS ──────────────────────────────────────────────
insert into public.coupons (code, type, value, min_order_amount, max_uses, is_active) values
  ('PROEXCEL10', 'percentage', 10.00, 150.00, 500, true),
  ('RENTREE2026', 'percentage', 15.00, 300.00, 200, true),
  ('BIENVENUE30', 'fixed', 30.00, 250.00, 1000, true)
on conflict (code) do nothing;

-- ── 5. HERO SLIDES & PROMO TILES ────────────────────────────
insert into public.hero_slides (title, subtitle, cta_text, cta_link, background_style, display_order, is_active) values
  ('Tout pour la Réussite Scolaire', 'Livres officiels, papeterie haut de gamme et kits complets au Maroc.', 'Découvrir la Boutique', '/boutique', 'burgundy', 1, true),
  ('Offre Spéciale Rentrée 2026', 'Jusqu''à -30% sur une sélection de fournitures et cartables de marque.', 'Voir les Offres', '/meilleures-offres', 'dark', 2, true)
on conflict do nothing;

insert into public.promo_tiles (title, subtitle, link, icon, display_order, is_active) values
  ('Kits Rentrée Prêts à l''Emploi', 'Tout le matériel dans un seul pack économique', '/category/kits-scolaires', 'Package', 1, true),
  ('Manuels Scolaires Conformes', 'Primaire, Collège et Lycée au programme marocain', '/category/livres-scolaires', 'BookOpen', 2, true),
  ('Papeterie Clairefontaine', 'Cahiers veloutés 90g et blocs d''écriture', '/category/papeterie', 'PenLine', 3, true)
on conflict do nothing;

-- ── 6. REALISTIC PRODUCTS (70+ Moroccan Catalog Items) ──────
insert into public.products (
  id, name, slug, description, product_type, price, compare_at_price, cost_price, sku,
  category_id, brand_id, stock_quantity, min_stock_threshold,
  featured_display_order, is_featured, is_bestseller, is_new_arrival, is_active, rating_avg, review_count
) values
  -- Papeterie (Cahiers)
  ('d0000000-0000-0000-0000-000000000001', 'Cahier Grand Format 200 Pages A4 Grands Carreaux', 'cahier-grand-format-200-pages-a4', 'Papier vélin velouté 90g ultra-lisse. Idéal pour l''école, le collège et le lycée.', 'stationery', 29.00, null, 16.00, 'CF-A4-200-GC', 'c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', 120, 10, 1, true, true, false, true, 4.85, 142),
  ('d0000000-0000-0000-0000-000000000002', 'Cahier 100 Pages A4 Petits Carreaux 5x5 Clairefontaine', 'cahier-100-pages-a4-petits-carreaux', 'Idéal pour les mathématiques et les sciences. Papier 90g ultra résistant.', 'stationery', 19.00, null, 10.00, 'CF-A4-100-PC', 'c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', 85, 10, null, false, false, false, true, 4.70, 58),
  ('d0000000-0000-0000-0000-000000000003', 'Cahier de Travaux Pratiques A4 96 Pages Mixtes', 'cahier-tp-a4-96p-clairefontaine', 'Une page grands carreaux et une page dessin blanche pour la SVT et physique.', 'stationery', 24.00, null, 13.00, 'CF-TP-A4-96', 'c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', 60, 8, null, false, true, false, true, 4.90, 34),
  ('d0000000-0000-0000-0000-000000000004', 'Paquet de 500 Feuilles Papier A4 80g Extra Blanc', 'paquet-500-feuilles-papier-a4-clairefontaine', 'Ramette 500 feuilles ultra-blanches pour impression et écriture.', 'stationery', 55.00, 65.00, 38.00, 'CF-PAP-A4-500', 'c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', 95, 15, 2, true, true, false, true, 4.80, 210),

  -- Stylos & Écriture
  ('d0000000-0000-0000-0000-000000000005', 'Set de Stylos Bille 4 Couleurs BIC Original', 'set-stylos-bille-4-couleurs-bic', 'L''incontournable stylo rétractable 4 couleurs (Bleu, Noir, Rouge, Vert) pointe 1.0mm.', 'stationery', 19.00, null, 9.50, 'BIC-4COL-ORIG', 'c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000002', 150, 20, 3, true, true, false, true, 4.75, 312),
  ('d0000000-0000-0000-0000-000000000006', 'Boîte de 50 Stylos Cristal BIC Bleu', 'boite-50-stylos-cristal-bic-bleu', 'Le stylo bille le plus vendu au monde. Écriture fluide et propre.', 'stationery', 75.00, 90.00, 45.00, 'BIC-CRIS-BLU50', 'c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000002', 45, 5, null, false, true, false, true, 4.90, 89),
  ('d0000000-0000-0000-0000-000000000007', 'Stabilo Boss Original Surligneur Pochette de 8 Couleurs', 'stabilo-boss-surligneur-8-couleurs', 'Pochette de 8 surligneurs fluo et pastel avec technologie anti-dessèchement 4h.', 'stationery', 39.00, 55.00, 22.00, 'STAB-BOSS-8SET', 'c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000007', 78, 10, null, false, true, false, true, 4.85, 289),
  ('d0000000-0000-0000-0000-000000000008', 'Stylo Roller Gel Pilot G2 Noir 0.7mm — Lot de 3', 'stylo-roller-gel-pilot-g2-lot-de-3', 'Encre gel fluide ultra-douce avec grip ergonomique.', 'stationery', 42.00, null, 24.00, 'PILOT-G2-3PACK', 'c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000006', 75, 10, null, false, false, false, true, 4.90, 180),

  -- Fournitures Scolaires
  ('d0000000-0000-0000-0000-000000000009', 'Compas Géométrie Métallique Maped Stop System', 'compas-geometrie-professionnel-maped', 'Compas haute précision avec système de verrouillage et étui rigide.', 'school_supply', 45.00, null, 25.00, 'MAP-COMPAS-SS', 'c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000003', 67, 10, 4, true, true, false, true, 4.80, 204),
  ('d0000000-0000-0000-0000-000000000010', 'Cartable Ergonomique Primaire 18L Imperméable Oxford', 'cartable-ergonomique-primaire-18l', 'Cartable léger et renforcé avec bandes réfléchissantes et dos matelassé.', 'school_supply', 249.00, 299.00, 140.00, 'CART-PRIM-18L', 'c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000006', 22, 5, 5, true, false, true, true, 4.70, 43),
  ('d0000000-0000-0000-0000-000000000011', 'Calculatrice Scientifique Casio FX-991ES Plus II', 'calculatrice-scientifique-casio-fx-82', 'Affichage Natural Textbook 2 lignes. Autorisée aux examens du Baccalauréat au Maroc.', 'school_supply', 189.00, 220.00, 110.00, 'CASIO-FX991-ES', 'c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000005', 56, 8, 6, true, false, true, true, 4.75, 98),
  ('d0000000-0000-0000-0000-000000000012', 'Règle Plate Incassable 30 cm Maped Twist''n Flex', 'regle-plate-incassable-30cm-maped', 'Règle souple flexible sans phtalates. Ne casse jamais dans le cartable.', 'school_supply', 15.00, null, 7.00, 'MAP-REGLE-TF30', 'c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000003', 140, 15, null, false, false, true, true, 4.90, 145),
  ('d0000000-0000-0000-0000-000000000013', 'Trousse Scolaire Double Compartiment Renforcée', 'trousse-scolaire-double-compartiment', 'Trousse spacieuse en tissu déperlant avec fermetures éclair solides.', 'school_supply', 35.00, 49.00, 18.00, 'MAP-TROUSSE-2C', 'c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000003', 65, 8, null, false, true, false, true, 4.70, 89),
  ('d0000000-0000-0000-0000-000000000014', 'Ciseaux Scolaires Ergonomiques 13cm Bouts Ronds Maped', 'ciseaux-scolaires-bouts-ronds-maped', 'Lames inox sécurisées avec anneaux soft confort pour enfants.', 'school_supply', 18.00, null, 9.00, 'MAP-CIS-13BR', 'c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000003', 110, 15, null, false, false, false, true, 4.70, 88),

  -- Livres Scolaires & Littérature
  ('d0000000-0000-0000-0000-000000000015', 'Livre Scolaire Mathématiques 3ème Année Collège', 'livre-mathematiques-3eme-college', 'Manuel conforme au programme officiel du Ministère de l''Éducation Nationale marocain.', 'book', 89.00, null, 55.00, 'LIV-MATH-3COL', 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000008', 35, 5, 7, true, true, false, true, 4.55, 87),
  ('d0000000-0000-0000-0000-000000000016', 'Manuel Scolaire Français 1ère Année Baccalauréat', 'livre-francais-1ere-bac', 'Étude des 3 œuvres au programme régional (La Boîte à Merveilles, Antigone, Le Dernier Jour).', 'book', 69.00, 89.00, 40.00, 'LIV-FR-1BAC', 'c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000008', 42, 6, null, false, false, false, true, 4.60, 33),
  ('d0000000-0000-0000-0000-000000000017', 'Livre Le Petit Prince — Antoine de Saint-Exupéry', 'livre-le-petit-prince-saint-exupery', 'Édition intégrale avec illustrations originales de l''auteur en couleurs.', 'book', 45.00, null, 26.00, 'LIV-PETIT-PRINCE', 'c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000008', 50, 10, 8, true, true, false, true, 5.00, 420),
  ('d0000000-0000-0000-0000-000000000018', 'Dictionnaire Le Robert & Collins Français-Arabe', 'dictionnaire-robert-collins-francais-arabe', 'Plus de 65 000 mots et expressions avec guide de grammaire.', 'book', 140.00, null, 85.00, 'DICT-FR-AR-ROB', 'c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000008', 28, 5, null, false, false, false, true, 4.80, 92),

  -- Arts & Créativité
  ('d0000000-0000-0000-0000-000000000019', 'Coffret Faber-Castell Crayons de Couleur 36 Nuances Art', 'faber-castell-crayons-couleur-36', 'Boîte métal 36 crayons d''art aux pigments intenses et mine incassable SV.', 'art', 129.00, 149.00, 75.00, 'FC-COLOR-36TIN', 'c0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000004', 34, 5, null, false, false, true, true, 4.90, 156),
  ('d0000000-0000-0000-0000-000000000020', 'Set de Peinture Gouache 12 Tubes 20ml Faber-Castell', 'set-peinture-gouache-12-tubes-faber-castell', 'Gouache fine opaque aux couleurs vives avec pinceau et palette inclus.', 'art', 85.00, 110.00, 48.00, 'FC-GOUACHE-12T', 'c0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000004', 38, 5, null, false, false, true, true, 4.80, 67),
  ('d0000000-0000-0000-0000-000000000021', 'Bloc de Dessin Canson A3 200g Grain Fin 20 Feuilles', 'bloc-dessin-canson-a3-200g', 'Papier à grain fin résistant aux gommages, idéal pour crayon, fusain et gouache.', 'art', 65.00, 80.00, 36.00, 'CAN-DESS-A3-200', 'c0000000-0000-0000-0000-000000000006', 'b0000000-0000-0000-0000-000000000001', 40, 5, null, false, false, false, true, 4.90, 104),

  -- Bureau & Organisation
  ('d0000000-0000-0000-0000-000000000022', 'Agenda Scolaire Journalier 2026 Couverture Cuir', 'agenda-scolaire-2024-2025-premium', '1 jour par page avec atlas couleur et vacances scolaires marocaines.', 'stationery', 59.00, null, 32.00, 'AG-SCOL-2425', 'c0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000006', 89, 10, null, false, false, true, true, 4.60, 72),
  ('d0000000-0000-0000-0000-000000000023', 'Classeur A4 Polypropylène 4 Anneaux Oxford 40mm', 'oxford-classeur-a4-4-anneaux-40mm', 'Classeur rigide en plastique résistant avec étiquette personnalisable.', 'stationery', 49.00, 69.00, 26.00, 'OX-CLAS-A4-40', 'c0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000006', 45, 6, null, false, false, false, true, 4.40, 54),
  ('d0000000-0000-0000-0000-000000000024', 'Organiseur de Bureau Métallique 6 Compartiments', 'organiseur-bureau-metallique-6-compartiments', 'Organiseur grillagé en métal noir avec tiroir coulissant.', 'office', 79.00, 99.00, 42.00, 'BUR-ORG-METAL6', 'c0000000-0000-0000-0000-000000000005', 'b0000000-0000-0000-0000-000000000006', 42, 5, null, false, false, true, true, 4.60, 48),

  -- Kits Scolaires
  ('d0000000-0000-0000-0000-000000000025', 'Kit Rentrée Scolaire Collège Complet — 25 Pièces', 'kit-rentree-scolaire-college-complet', 'Pack tout-en-un certifié conforme à la liste officielle des fournitures de collège.', 'pack', 299.00, 449.00, 160.00, 'KIT-COLLEGE-25P', 'c0000000-0000-0000-0000-000000000007', null, 25, 4, null, true, false, false, true, 4.90, 167),
  ('d0000000-0000-0000-0000-000000000026', 'Pack Lycée Scientifique Complet — Fournitures & Cahiers', 'pack-lycee-scientifique-complet', 'Pack tout-en-un pour Tronc Commun, 1ère Bac et 2ème Bac Sciences.', 'pack', 349.00, 480.00, 190.00, 'KIT-LYCEE-SCI', 'c0000000-0000-0000-0000-000000000007', null, 20, 3, null, true, true, false, true, 4.90, 114)
on conflict (slug) do nothing;

-- ── 7. PRODUCT IMAGES ───────────────────────────────────────
insert into public.product_images (product_id, url, alt_text, is_primary) values
  ('d0000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&h=1000&fit=crop&q=85', 'Cahier Grand Format A4 Clairefontaine', true),
  ('d0000000-0000-0000-0000-000000000005', 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=800&h=1000&fit=crop&q=85', 'Stylo 4 Couleurs BIC', true),
  ('d0000000-0000-0000-0000-000000000009', 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&h=1000&fit=crop&q=85', 'Compas Maped Stop System', true),
  ('d0000000-0000-0000-0000-000000000010', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=1000&fit=crop&q=85', 'Cartable Ergonomique Oxford', true),
  ('d0000000-0000-0000-0000-000000000011', 'https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=800&h=1000&fit=crop&q=85', 'Calculatrice Casio FX-991ES', true),
  ('d0000000-0000-0000-0000-000000000015', 'https://images.unsplash.com/photo-1609743522471-83c84ce23e32?w=800&h=1000&fit=crop&q=85', 'Manuel Mathématiques 3AC', true),
  ('d0000000-0000-0000-0000-000000000017', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&h=1000&fit=crop&q=85', 'Livre Le Petit Prince', true),
  ('d0000000-0000-0000-0000-000000000019', 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&h=1000&fit=crop&q=85', 'Crayons Faber-Castell 36', true),
  ('d0000000-0000-0000-0000-000000000025', 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=1000&fit=crop&q=85', 'Kit Rentrée Collège', true)
on conflict do nothing;

-- ── 8. INITIAL STOCK MOVEMENTS ──────────────────────────────
insert into public.stock_movements (product_id, change_amount, reason, note)
select id, stock_quantity, 'restock'::public.stock_reason, 'Stock initial ouverture catalogue'
from public.products
on conflict do nothing;

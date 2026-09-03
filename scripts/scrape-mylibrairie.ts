/**
 * ProExcel — Product Catalog Scraper (mylibrairie.ma → ProExcel format)
 *
 * Scrapes title, price, image URL, and category from mylibrairie.ma category pages.
 * Output JSON matches ProExcel products import format (Option A safe reference).
 *
 * Usage:
 *   npx tsx scripts/scrape-mylibrairie.ts --category=11-fournitures-scolaires --max-pages=3
 *   npx tsx scripts/scrape-mylibrairie.ts --all --max-pages=2
 *   npx tsx scripts/scrape-mylibrairie.ts --output=custom_products.json
 */

import * as fs from 'fs';
import * as path from 'path';
import * as cheerio from 'cheerio';

export interface ScrapedProduct {
  name: string;
  price: number;
  category_slug: string;
  source_image_url: string;
  source_product_url?: string;
  needs_manual_image: boolean;
  is_active: boolean;
}

export interface CategoryMapping {
  proexcelSlug: string;
  defaultType: 'book' | 'stationery' | 'school_supply' | 'office' | 'art' | 'pack' | 'other';
  name: string;
}

export const CATEGORY_MAP: Record<string, CategoryMapping> = {
  // Main Categories
  '11-fournitures-scolaires': {
    proexcelSlug: 'fournitures-scolaires',
    defaultType: 'school_supply',
    name: 'Fournitures Scolaires',
  },
  '52-papeterie-et-classement': {
    proexcelSlug: 'papeterie',
    defaultType: 'stationery',
    name: 'Papeterie & Classement',
  },
  '53-cahier-carnet-et-bloc-note': {
    proexcelSlug: 'cahier-carnet-bloc-note',
    defaultType: 'stationery',
    name: 'Cahier, Carnet et Bloc-Note',
  },
  '54-feuille-copie-et-papier': {
    proexcelSlug: 'papeterie',
    defaultType: 'stationery',
    name: 'Feuilles, Copies & Papier',
  },
  '55-agenda-et-cahier-de-texte': {
    proexcelSlug: 'papeterie',
    defaultType: 'stationery',
    name: 'Agendas & Cahiers de texte',
  },
  '56-classement-et-protection': {
    proexcelSlug: 'papeterie',
    defaultType: 'stationery',
    name: 'Classement & Protection',
  },
  '57-fourniture': {
    proexcelSlug: 'fournitures-scolaires',
    defaultType: 'school_supply',
    name: 'Fournitures',
  },
  '58-ecriture-et-correction': {
    proexcelSlug: 'stylos-ecriture',
    defaultType: 'stationery',
    name: 'Écriture & Correction',
  },
  '59-colle-adhesif-et-pate-a-fixe': {
    proexcelSlug: 'fournitures-scolaires',
    defaultType: 'school_supply',
    name: 'Colle & Adhésif',
  },
  '60-ciseau': {
    proexcelSlug: 'fournitures-scolaires',
    defaultType: 'school_supply',
    name: 'Ciseaux',
  },
  '61-geometrie-et-tracage': {
    proexcelSlug: 'fournitures-scolaires',
    defaultType: 'school_supply',
    name: 'Géométrie & Traçage',
  },
  '62-dessin-musique-et-peinture': {
    proexcelSlug: 'arts-creativite',
    defaultType: 'art',
    name: 'Dessin, Musique & Peinture',
  },
  '63-calculatrice': {
    proexcelSlug: 'fournitures-scolaires',
    defaultType: 'school_supply',
    name: 'Calculatrices',
  },
  '64-cartable-et-trousse': {
    proexcelSlug: 'fournitures-scolaires',
    defaultType: 'school_supply',
    name: 'Cartables & Trousses',
  },
  '65-cartable': {
    proexcelSlug: 'fournitures-scolaires',
    defaultType: 'school_supply',
    name: 'Cartables',
  },
  '66-trousse': {
    proexcelSlug: 'fournitures-scolaires',
    defaultType: 'school_supply',
    name: 'Trousses',
  },
  '12-beaux-arts-dessin': {
    proexcelSlug: 'arts-creativite',
    defaultType: 'art',
    name: 'Beaux-Arts & Dessin',
  },
  '10-livres': {
    proexcelSlug: 'livres',
    defaultType: 'book',
    name: 'Livres Généraux',
  },
  '14-livres-scolaires': {
    proexcelSlug: 'livres-scolaires',
    defaultType: 'book',
    name: 'Livres Scolaires',
  },
  '21-cp-ce1': {
    proexcelSlug: 'livres-primaire',
    defaultType: 'book',
    name: 'Livres CP / CE1',
  },
  '22-ce1-ce2': {
    proexcelSlug: 'livres-primaire',
    defaultType: 'book',
    name: 'Livres CE1 / CE2',
  },
  '23-ce2-ce3': {
    proexcelSlug: 'livres-primaire',
    defaultType: 'book',
    name: 'Livres CE2 / CE3',
  },
  '24-cm1-ce4': {
    proexcelSlug: 'livres-primaire',
    defaultType: 'book',
    name: 'Livres CM1 / CE4',
  },
  '25-cm2-ce5': {
    proexcelSlug: 'livres-primaire',
    defaultType: 'book',
    name: 'Livres CM2 / CE5',
  },
  '26-6eme-ce6': {
    proexcelSlug: 'livres-primaire',
    defaultType: 'book',
    name: 'Livres 6ème / CE6',
  },
  '27-5eme-1ere-annee-college': {
    proexcelSlug: 'livres-college',
    defaultType: 'book',
    name: 'Livres 5ème Collège',
  },
  '28-4eme-2eme-annee-college': {
    proexcelSlug: 'livres-college',
    defaultType: 'book',
    name: 'Livres 4ème Collège',
  },
  '29-3eme-3eme-annee-college': {
    proexcelSlug: 'livres-college',
    defaultType: 'book',
    name: 'Livres 3ème Collège',
  },
  '70-2de-tronc-commun': {
    proexcelSlug: 'livres-lycee-bac',
    defaultType: 'book',
    name: 'Livres Tronc Commun',
  },
  '71-1ere-1ere-annee-bac': {
    proexcelSlug: 'livres-lycee-bac',
    defaultType: 'book',
    name: 'Livres 1ère Année Bac',
  },
  '72-terminal-2eme-annee-bac': {
    proexcelSlug: 'livres-lycee-bac',
    defaultType: 'book',
    name: 'Livres Terminale Bac',
  },
  '213-livres-parascolaires': {
    proexcelSlug: 'livres-scolaires',
    defaultType: 'book',
    name: 'Livres Parascolaires',
  },
  '311-best-sellers': {
    proexcelSlug: 'fournitures-scolaires',
    defaultType: 'school_supply',
    name: 'Best Sellers',
  },
};

const DEFAULT_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseCliArgs() {
  const args = process.argv.slice(2);
  const options: {
    categoryKey?: string;
    allCategories: boolean;
    maxPages?: number;
    delayMs: number;
    outputFile: string;
  } = {
    allCategories: false,
    delayMs: 1750, // Polite 1.75s default
    outputFile: 'scraped_products.json',
  };

  for (const arg of args) {
    if (arg.startsWith('--category=')) {
      options.categoryKey = arg.split('=')[1].trim();
    } else if (arg === '--all') {
      options.allCategories = true;
    } else if (arg.startsWith('--max-pages=')) {
      options.maxPages = parseInt(arg.split('=')[1].trim(), 10);
    } else if (arg.startsWith('--delay=')) {
      options.delayMs = parseInt(arg.split('=')[1].trim(), 10);
    } else if (arg.startsWith('--output=')) {
      options.outputFile = arg.split('=')[1].trim();
    }
  }

  return options;
}

function normalizeTitle(title: string): string {
  return title
    .replace(/\s+/g, ' ')
    .replace(/\s*,\s*Marque\s*:\s*.*$/i, '')
    .trim();
}

function parsePrice(rawText: string): number {
  if (!rawText) return 0;
  // Examples: "Prix 10,00 MAD", "1 250,50 MAD", "24,00 MAD"
  const cleaned = rawText
    .replace(/Prix/gi, '')
    .replace(/MAD/gi, '')
    .replace(/\u00a0|\u202f|\s/g, '') // Non-breaking & normal spaces
    .replace(/,/g, '.')
    .trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

interface PageParseResult {
  products: ScrapedProduct[];
  totalPages: number;
  totalProductsCount: number;
}

async function fetchAndParseCategoryPage(
  categoryKey: string,
  targetCategorySlug: string,
  pageNumber: number
): Promise<PageParseResult | null> {
  const url = `https://mylibrairie.ma/fr/${categoryKey}?page=${pageNumber}`;

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': DEFAULT_USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
      },
    });

    if (!res.ok) {
      console.warn(`[WARN] Page ${pageNumber} returned HTTP ${res.status} for ${categoryKey}`);
      return null;
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    // Compute total pages
    let totalProductsCount = 0;
    let totalPages = 1;

    const countText = $('#js-product-list-top, .pagination, .total-products').text();
    const countMatch =
      countText.match(/(\d+)\s*(?:article|produit)/i) ||
      html.match(/Il y a (\d+) produits/i) ||
      html.match(/Affichage[^\d]*\d+-\d+[^\d]*de[^\d]*(\d+)/i);

    if (countMatch) {
      totalProductsCount = parseInt(countMatch[1], 10);
      totalPages = Math.ceil(totalProductsCount / 24);
    }

    // Inspect pagination links for max page number
    $('#js-product-list .page-list a, .pagination .page-list a').each((_, el) => {
      const pageNum = parseInt($(el).text().trim(), 10);
      if (!isNaN(pageNum) && pageNum > totalPages) {
        totalPages = pageNum;
      }
    });

    // IMPORTANT: Scrape ONLY the main paginated grid inside #js-product-list,
    // explicitly avoiding duplicated items in glider / featured carousels.
    const productElements = $('#js-product-list .products .ml-product-card');

    const products: ScrapedProduct[] = [];

    productElements.each((_, el) => {
      const card = $(el);

      // Product Title & Link
      const titleLink = card.find(
        '.ml-product-title .product-title a, .product-title a, h1.product-title a, h2.product-title a, h3.product-title a'
      );
      const rawTitle = titleLink.text().trim();
      const productHref = titleLink.attr('href') || card.find('a.thumbnail').attr('href') || '';
      const name = normalizeTitle(rawTitle);

      if (!name) return;

      // Image URL: Prefer high-res data-full-size-image-url, fallback to src
      const imgEl = card.find('.ml-product-image img, .thumbnail img, img.ml-product-image, .product-thumbnail img, img');
      let imageUrl = (imgEl.attr('data-full-size-image-url') || imgEl.attr('src') || '').trim();
      if (imageUrl) {
        if (imageUrl.startsWith('//')) {
          imageUrl = 'https:' + imageUrl;
        } else if (imageUrl.startsWith('/')) {
          imageUrl = 'https://mylibrairie.ma' + imageUrl;
        } else if (!imageUrl.startsWith('http')) {
          imageUrl = 'https://mylibrairie.ma/' + imageUrl;
        }
      }

      // Price
      const priceText = card
        .find('.ml-price-label, .price, .product-price-and-shipping .price')
        .first()
        .text()
        .trim();
      const price = parsePrice(priceText);

      products.push({
        name,
        price,
        category_slug: targetCategorySlug,
        source_image_url: imageUrl,
        source_product_url: productHref,
        needs_manual_image: true,
        is_active: false,
      });
    });

    return {
      products,
      totalPages: Math.max(totalPages, 1),
      totalProductsCount,
    };
  } catch (err: any) {
    console.error(`[ERROR] Failed to fetch page ${pageNumber} of ${categoryKey}:`, err.message || err);
    return null;
  }
}

async function scrapeCategory(
  categoryKey: string,
  mapping: CategoryMapping,
  maxPages: number | undefined,
  delayMs: number,
  seenNames: Set<string>,
  allProducts: ScrapedProduct[]
) {
  console.log(`\n============================================================`);
  console.log(`Starting scrape: ${categoryKey} → ProExcel category: "${mapping.proexcelSlug}"`);
  console.log(`============================================================`);

  let currentPage = 1;
  let totalPages = 1;
  let categoryProductsCount = 0;

  while (currentPage <= totalPages) {
    if (maxPages && currentPage > maxPages) {
      console.log(`[INFO] Reached max requested pages (${maxPages}) for ${categoryKey}. Moving on.`);
      break;
    }

    process.stdout.write(`Fetching page ${currentPage}... `);
    const result = await fetchAndParseCategoryPage(categoryKey, mapping.proexcelSlug, currentPage);

    if (!result) {
      console.log(`[SKIP] Page ${currentPage} skipped due to error.`);
      currentPage++;
      await sleep(delayMs);
      continue;
    }

    totalPages = result.totalPages;
    let newInPage = 0;

    for (const prod of result.products) {
      const key = prod.name.toLowerCase();
      if (!seenNames.has(key)) {
        seenNames.add(key);
        allProducts.push(prod);
        categoryProductsCount++;
        newInPage++;
      }
    }

    console.log(
      `Done! Found ${result.products.length} items (${newInPage} new, ${categoryProductsCount} total in category, ${allProducts.length} total overall). [Page ${currentPage}/${totalPages}]`
    );

    currentPage++;

    if (currentPage <= totalPages && (!maxPages || currentPage <= maxPages)) {
      await sleep(delayMs);
    }
  }

  console.log(`Completed category "${categoryKey}": ${categoryProductsCount} unique products collected.`);
}

export async function runScraper() {
  const options = parseCliArgs();

  console.log('--- ProExcel Catalog Scraper (mylibrairie.ma) ---');
  console.log(`Rate limit delay: ${options.delayMs}ms between requests`);
  console.log(`Image mode: Option A (Reference URL only, needs_manual_image = true)`);

  const seenNames = new Set<string>();
  const allProducts: ScrapedProduct[] = [];

  let categoriesToScrape: { key: string; mapping: CategoryMapping }[] = [];

  if (options.allCategories) {
    categoriesToScrape = Object.entries(CATEGORY_MAP).map(([key, mapping]) => ({ key, mapping }));
  } else if (options.categoryKey) {
    const mapping = CATEGORY_MAP[options.categoryKey];
    if (!mapping) {
      console.error(`[ERROR] Unknown category key: "${options.categoryKey}".`);
      console.log('Available category keys:');
      for (const k of Object.keys(CATEGORY_MAP)) {
        console.log(`  - ${k} (${CATEGORY_MAP[k].name})`);
      }
      process.exit(1);
    }
    categoriesToScrape = [{ key: options.categoryKey, mapping }];
  } else {
    // Default: 11-fournitures-scolaires
    const defaultKey = '11-fournitures-scolaires';
    categoriesToScrape = [{ key: defaultKey, mapping: CATEGORY_MAP[defaultKey] }];
    console.log(`No category specified. Defaulting to "${defaultKey}".`);
    console.log(`(Tip: Use --category=<key> or --all to scrape other categories. Run with --max-pages=N to limit).`);
  }

  const startTime = Date.now();

  for (const { key, mapping } of categoriesToScrape) {
    await scrapeCategory(key, mapping, options.maxPages, options.delayMs, seenNames, allProducts);
  }

  const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);

  // Write output
  const outputPath = path.isAbsolute(options.outputFile)
    ? options.outputFile
    : path.resolve(process.cwd(), options.outputFile);

  fs.writeFileSync(outputPath, JSON.stringify(allProducts, null, 2), 'utf-8');

  console.log(`\n============================================================`);
  console.log(`SCRAPING COMPLETE`);
  console.log(`============================================================`);
  console.log(`Total unique products scraped: ${allProducts.length}`);
  console.log(`Output saved to: ${outputPath}`);
  console.log(`Duration: ${elapsedSec}s`);
  console.log(`Next step: Review ${options.outputFile}, then run import script:`);
  console.log(`  npx tsx scripts/import-scraped-products.ts --file=${options.outputFile} --dry-run`);
}

// Execute when run directly
if (require.main === module || (typeof process !== 'undefined' && process.argv[1]?.includes('scrape-mylibrairie'))) {
  runScraper().catch((err) => {
    console.error('[FATAL ERROR]:', err);
    process.exit(1);
  });
}

/**
 * ProExcel — Import & Upsert Scraped Products to Supabase
 *
 * Reads scraped JSON catalog and performs an intelligent, safe UPSERT:
 * 1. Matches existing products in Supabase by slug or name.
 * 2. Defaults `is_active = false` so products must be reviewed before going live.
 * 3. Handles images safely:
 *    - If MYLIBRAIRIE_IMAGES_APPROVED === 'true', downloads the image server-side,
 *      uploads it to Supabase Storage ('product-images' bucket), and stores the storage URL in product_images.
 *    - If MYLIBRAIRIE_IMAGES_APPROVED !== 'true' (default), routes to `pending_image_source`
 *      and sets `needs_manual_image = true` without creating direct external hotlinks.
 * 4. Uses SUPABASE_SERVICE_ROLE_KEY to bypass Row-Level Security (RLS).
 *
 * Usage:
 *   npx tsx scripts/import-scraped-products.ts --file=scraped_products.json
 *   npx tsx scripts/import-scraped-products.ts --file=scraped_products.json --dry-run
 *   npx tsx scripts/import-scraped-products.ts --file=scraped_products.json --limit=24
 */

import * as fs from 'fs';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import type { ScrapedProduct } from './scrape-mylibrairie';

// ── 1. Load Environment Variables ─────────────────────────────
function loadEnv() {
  const possiblePaths = [
    path.resolve(process.cwd(), '.env.local'),
    path.resolve(process.cwd(), 'app/.env.local'),
    path.resolve(__dirname, '../app/.env.local'),
    path.resolve(__dirname, '../.env.local'),
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), 'app/.env'),
  ];

  for (const envPath of possiblePaths) {
    if (fs.existsSync(envPath)) {
      dotenv.config({ path: envPath, override: true });
    }
  }
}

loadEnv();

// ── 2. Helper Functions ─────────────────────────────────────────
function parseCliArgs() {
  const args = process.argv.slice(2);
  const options: {
    inputFile: string;
    dryRun: boolean;
    limit?: number;
  } = {
    inputFile: 'scraped_products.json',
    dryRun: false,
  };

  for (const arg of args) {
    if (arg.startsWith('--file=')) {
      options.inputFile = arg.split('=')[1].trim();
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg.startsWith('--limit=')) {
      options.limit = parseInt(arg.split('=')[1].trim(), 10);
    }
  }

  return options;
}

function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function generateSku(categorySlug: string, slug: string, index: number): string {
  const catPrefix = (categorySlug.slice(0, 3) || 'GEN').toUpperCase();
  const slugPrefix = (slug.slice(0, 6) || 'ITEM').replace(/-/g, '').toUpperCase();
  const randSuffix = Math.floor(1000 + Math.random() * 9000);
  return `PE-${catPrefix}-${slugPrefix}-${String(index + 1).padStart(3, '0')}-${randSuffix}`;
}

function getProductTypeFromCategory(
  categorySlug: string
): 'book' | 'stationery' | 'school_supply' | 'office' | 'art' | 'pack' | 'other' {
  if (categorySlug.includes('livre')) return 'book';
  if (categorySlug.includes('papeterie') || categorySlug.includes('cahier') || categorySlug.includes('stylo'))
    return 'stationery';
  if (categorySlug.includes('art') || categorySlug.includes('dessin') || categorySlug.includes('peinture'))
    return 'art';
  if (categorySlug.includes('kit') || categorySlug.includes('pack')) return 'pack';
  if (categorySlug.includes('bureau')) return 'office';
  if (categorySlug.includes('fourniture') || categorySlug.includes('cartable') || categorySlug.includes('trousse'))
    return 'school_supply';
  return 'other';
}

/**
 * Downloads image from source, uploads to Supabase Storage 'product-images',
 * and updates product_images table.
 */
async function processProductImage(
  supabase: any,
  productId: string,
  productSlug: string,
  productName: string,
  sourceImageUrl: string | null,
  imagesApproved: boolean
): Promise<{ needsManualImage: boolean; pendingImageSource: string | null }> {
  if (!sourceImageUrl) {
    return { needsManualImage: true, pendingImageSource: null };
  }

  if (!imagesApproved) {
    // Flag is OFF: Route to pending_image_source without inserting raw hotlinks
    return { needsManualImage: true, pendingImageSource: sourceImageUrl };
  }

  // Flag is ON: Download to Supabase Storage
  try {
    const res = await fetch(sourceImageUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const contentType = res.headers.get('content-type') || 'image/jpeg';
    const buffer = Buffer.from(await res.arrayBuffer());

    let ext = 'jpg';
    if (contentType.includes('png')) ext = 'png';
    else if (contentType.includes('webp')) ext = 'webp';

    const filename = `${productSlug}-${Date.now()}.${ext}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filename, buffer, {
        contentType,
        upsert: true,
      });

    if (uploadError) {
      throw new Error(`Storage upload error: ${uploadError.message}`);
    }

    const { data: publicUrlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(uploadData.path);

    const storageUrl = publicUrlData.publicUrl;

    const { data: existingImg } = await supabase
      .from('product_images')
      .select('id')
      .eq('product_id', productId)
      .maybeSingle();

    if (existingImg) {
      await supabase
        .from('product_images')
        .update({
          url: storageUrl,
          alt_text: productName,
          is_primary: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingImg.id);
    } else {
      await supabase.from('product_images').insert({
        product_id: productId,
        url: storageUrl,
        alt_text: productName,
        is_primary: true,
        display_order: 0,
      });
    }

    return { needsManualImage: false, pendingImageSource: null };
  } catch (err: any) {
    console.warn(`[IMAGE WARN] Failed to download/upload image for "${productName}": ${err.message}. Setting pending source.`);
    return { needsManualImage: true, pendingImageSource: sourceImageUrl };
  }
}

// ── 3. Main Upsert Routine ──────────────────────────────────────
export async function runImport() {
  const options = parseCliArgs();

  console.log('============================================================');
  console.log('PROEXCEL PRODUCT CATALOG CONTROLLED IMPORTER');
  console.log('============================================================');

  // 1. Read Image Approval Flag from Environment
  const MYLIBRAIRIE_IMAGES_APPROVED = process.env.MYLIBRAIRIE_IMAGES_APPROVED === 'true';
  console.log(`[CONFIG] MYLIBRAIRIE_IMAGES_APPROVED: ${MYLIBRAIRIE_IMAGES_APPROVED}`);
  if (MYLIBRAIRIE_IMAGES_APPROVED) {
    console.log(`[CONFIG] Storage routing: Downloading images directly to Supabase Storage bucket 'product-images'`);
  } else {
    console.log(`[CONFIG] Storage routing: Storing in 'pending_image_source' (needs_manual_image: true, no raw hotlinks)`);
  }
  console.log(`[CONFIG] Activation policy: Default is_active = false (requires manual review)`);

  if (options.dryRun) {
    console.log(`[DRY-RUN MODE] Validation only. No changes will be written to Supabase.`);
  }

  // 2. Initialize Supabase Admin Client (Service Role Key bypasses RLS)
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl) {
    console.error('[FATAL] Missing Supabase URL. Set NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL in .env.local.');
    process.exit(1);
  }

  if (!serviceRoleKey) {
    console.error('[FATAL] SUPABASE_SERVICE_ROLE_KEY is required to bypass RLS for product updates.');
    console.error('Please ensure SUPABASE_SERVICE_ROLE_KEY is configured in your .env.local file.');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  console.log('[AUTH] Initialized Supabase admin client with service role key (bypassing RLS).');

  // 3. Read Input JSON
  const inputFilePath = path.isAbsolute(options.inputFile)
    ? options.inputFile
    : path.resolve(process.cwd(), options.inputFile);

  if (!fs.existsSync(inputFilePath)) {
    console.error(`[FATAL] Input file not found: ${inputFilePath}`);
    console.log(`Please run the scraper first:\n  npx tsx scripts/scrape-mylibrairie.ts --category=<key> --max-pages=1`);
    process.exit(1);
  }

  const rawJson = fs.readFileSync(inputFilePath, 'utf-8');
  let products: ScrapedProduct[] = JSON.parse(rawJson);

  if (!Array.isArray(products) || products.length === 0) {
    console.log(`Input file "${options.inputFile}" contains 0 products. Nothing to import.`);
    return;
  }

  if (options.limit && options.limit > 0) {
    console.log(`Limiting import to first ${options.limit} products.`);
    products = products.slice(0, options.limit);
  }

  console.log(`Loaded ${products.length} products to process from "${options.inputFile}".`);

  // 4. Fetch Categories
  console.log('\nFetching categories from Supabase...');
  const { data: dbCategories, error: catError } = await supabase
    .from('categories')
    .select('id, name, slug');

  if (catError) {
    console.error('[ERROR] Failed to fetch categories from database:', catError.message);
    if (!options.dryRun) process.exit(1);
  }

  const categoryMap = new Map<string, { id: string; name: string }>();
  if (dbCategories && dbCategories.length > 0) {
    for (const cat of dbCategories) {
      categoryMap.set(cat.slug, { id: cat.id, name: cat.name });
    }
    console.log(`Found ${categoryMap.size} categories in database.`);
  }

  // 5. Fetch Existing Products in Supabase for Upsert Matching
  console.log('Fetching existing products from Supabase...');
  const { data: existingProducts, error: prodFetchError } = await supabase
    .from('products')
    .select('id, name, slug, sku, is_active, needs_manual_image')
    .range(0, 5000);

  if (prodFetchError) {
    console.error('[ERROR] Failed to fetch existing products:', prodFetchError.message);
    if (!options.dryRun) process.exit(1);
  }

  const existingList = existingProducts || [];
  console.log(`Found ${existingList.length} existing products in Supabase database.`);

  const existingSlugs = new Set<string>(existingList.map((p) => p.slug));
  const existingSkus = new Set<string>(existingList.map((p) => p.sku));

  // Multi-index lookup tables for fuzzy & exact matching
  const slugMap = new Map<string, (typeof existingList)[0]>();
  const baseSlugMap = new Map<string, (typeof existingList)[0]>();
  const normalizedNameMap = new Map<string, (typeof existingList)[0]>();

  for (const p of existingList) {
    slugMap.set(p.slug.toLowerCase().trim(), p);

    const base = p.slug.replace(/-\d+$/, '').toLowerCase().trim();
    if (!baseSlugMap.has(base)) {
      baseSlugMap.set(base, p);
    }

    const norm = normalize(p.name);
    if (!normalizedNameMap.has(norm)) {
      normalizedNameMap.set(norm, p);
    }
  }

  // 6. Process and Upsert Each Product
  let updatedCount = 0;
  let createdCount = 0;
  let skippedCount = 0;

  console.log('\n--- Beginning Product Upsert & Image Handling ---');

  for (let i = 0; i < products.length; i++) {
    const item = products[i];
    const name = item.name.trim();

    if (!name) {
      console.warn(`[SKIP] Item #${i + 1} has empty name.`);
      skippedCount++;
      continue;
    }

    // Resolve Category
    let category = categoryMap.get(item.category_slug);
    if (!category) {
      if (item.category_slug.includes('cahier') || item.category_slug.includes('stylo')) {
        category = categoryMap.get('papeterie');
      } else if (item.category_slug.includes('livre')) {
        category = categoryMap.get('livres-scolaires') || categoryMap.get('livres');
      } else {
        category = categoryMap.get('fournitures-scolaires');
      }
    }

    if (!category) {
      console.warn(`[WARN] Category "${item.category_slug}" not found in DB for product "${name}". Skipping.`);
      skippedCount++;
      continue;
    }

    const rawSlug = slugify(name);
    const normName = normalize(name);
    const productType = getProductTypeFromCategory(item.category_slug);
    const imageUrl = item.source_image_url?.trim() || null;

    // Check if product already exists in Supabase (slug, baseSlug, or normalized name)
    const existing =
      slugMap.get(rawSlug) ||
      baseSlugMap.get(rawSlug) ||
      normalizedNameMap.get(normName) ||
      existingList.find((p) => p.slug.startsWith(rawSlug));

    if (options.dryRun) {
      console.log(
        `[DRY-RUN #${i + 1}] ${existing ? 'UPDATE' : 'CREATE'}: "${name}" | Price: ${item.price} MAD | is_active: false | Image: ${imageUrl ? (MYLIBRAIRIE_IMAGES_APPROVED ? 'Storage Download' : 'Pending Source') : '(none)'}`
      );
      if (existing) updatedCount++;
      else createdCount++;
      continue;
    }

    if (existing) {
      // ── A. UPDATE EXISTING PRODUCT ROW ──────────────────────
      const productId = existing.id;

      // Handle image flow
      const imgResult = await processProductImage(
        supabase,
        productId,
        existing.slug,
        name,
        imageUrl,
        MYLIBRAIRIE_IMAGES_APPROVED
      );

      const { error: updateError } = await supabase
        .from('products')
        .update({
          name,
          price: item.price,
          product_type: productType,
          category_id: category.id,
          is_active: existing.is_active ?? false, // keep existing active state or false
          needs_manual_image: imgResult.needsManualImage,
          pending_image_source: imgResult.pendingImageSource,
          updated_at: new Date().toISOString(),
        })
        .eq('id', productId);

      if (updateError) {
        console.error(`[ERROR] Failed to update product "${name}" (ID: ${productId}):`, updateError.message);
        skippedCount++;
        continue;
      }

      updatedCount++;
      console.log(`✓ [UPDATE #${i + 1}] "${name}" (${existing.slug}) → is_active: ${existing.is_active ?? false} | Manual Image: ${imgResult.needsManualImage}`);
    } else {
      // ── B. CREATE NEW PRODUCT ROW ───────────────────────────
      let uniqueSlug = rawSlug;
      let counter = 2;
      while (existingSlugs.has(uniqueSlug)) {
        uniqueSlug = `${rawSlug}-${counter}`;
        counter++;
      }
      existingSlugs.add(uniqueSlug);

      let sku = generateSku(item.category_slug, uniqueSlug, i);
      while (existingSkus.has(sku)) {
        sku = generateSku(item.category_slug, uniqueSlug, i + 1000);
      }
      existingSkus.add(sku);

      // Default is_active = false for imported new items
      const productPayload = {
        name,
        slug: uniqueSlug,
        sku,
        price: item.price,
        product_type: productType,
        category_id: category.id,
        is_active: false,
        needs_manual_image: !MYLIBRAIRIE_IMAGES_APPROVED,
        pending_image_source: !MYLIBRAIRIE_IMAGES_APPROVED ? imageUrl : null,
        stock_quantity: 10,
        min_stock_threshold: 5,
        is_featured: false,
        is_bestseller: false,
        is_new_arrival: false,
        rating_avg: 0,
        review_count: 0,
      };

      const { data: insertedProduct, error: insertError } = await supabase
        .from('products')
        .insert(productPayload)
        .select('id')
        .single();

      if (insertError) {
        console.error(`[ERROR] Failed to insert new product "${name}":`, insertError.message);
        skippedCount++;
        continue;
      }

      // If images approved, download and save to storage & product_images table
      let needsManualImg = !MYLIBRAIRIE_IMAGES_APPROVED;
      let pendingSource = !MYLIBRAIRIE_IMAGES_APPROVED ? imageUrl : null;

      if (MYLIBRAIRIE_IMAGES_APPROVED && imageUrl && insertedProduct?.id) {
        const imgResult = await processProductImage(
          supabase,
          insertedProduct.id,
          uniqueSlug,
          name,
          imageUrl,
          true
        );
        needsManualImg = imgResult.needsManualImage;
        pendingSource = imgResult.pendingImageSource;

        if (needsManualImg) {
          await supabase
            .from('products')
            .update({
              needs_manual_image: needsManualImg,
              pending_image_source: pendingSource,
            })
            .eq('id', insertedProduct.id);
        }
      }

      // Add to tracking maps
      slugMap.set(uniqueSlug, {
        id: insertedProduct.id,
        name,
        slug: uniqueSlug,
        sku,
        is_active: false,
        needs_manual_image: needsManualImg,
      });
      normalizedNameMap.set(normName, {
        id: insertedProduct.id,
        name,
        slug: uniqueSlug,
        sku,
        is_active: false,
        needs_manual_image: needsManualImg,
      });

      createdCount++;
      console.log(`✓ [CREATE #${i + 1}] "${name}" (${uniqueSlug}) → is_active: false | Manual Image: ${needsManualImg}`);
    }
  }

  // 7. Summary Report
  console.log('\n============================================================');
  console.log('IMPORT & UPSERT COMPLETE');
  console.log('============================================================');
  console.log(`Total processed from JSON: ${products.length}`);
  console.log(`Existing products updated: ${updatedCount}`);
  console.log(`New products created:      ${createdCount}`);
  console.log(`Skipped / Failed:          ${skippedCount}`);
  console.log(`\nImported products set to is_active = false (ready for manual review in admin panel).`);
}

// Execute when run directly
if (require.main === module || (typeof process !== 'undefined' && process.argv[1]?.includes('import-scraped-products'))) {
  runImport().catch((err) => {
    console.error('[FATAL ERROR]:', err);
    process.exit(1);
  });
}

import { neon } from '@neondb/serverless';

export const DIRECT_DB_URL = 'postgresql://neondb_owner:npg_tb0fasgdG1Zo@ep-holy-bar-b5if2h0c-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require';

export const runDirectSql = () => {
  return neon(DIRECT_DB_URL);
};

export async function fetchLiveStoreData() {
  const sql = runDirectSql();
  try {
    const [branches, categories, menuItems, coupons, settings, banners] = await Promise.all([
      sql`SELECT * FROM "StoreBranch" WHERE "isActive" = true ORDER BY "city" ASC, "name" ASC;`,
      sql`SELECT * FROM "Category" WHERE "isActive" = true ORDER BY "sortOrder" ASC;`,
      sql`SELECT * FROM "MenuItem" WHERE "isActive" = true ORDER BY "createdAt" DESC;`,
      sql`SELECT * FROM "Coupon" WHERE "isActive" = true ORDER BY "createdAt" DESC;`,
      sql`SELECT * FROM "StoreSettings" WHERE "id" = 'default_settings' LIMIT 1;`.catch(() => []),
      sql`SELECT * FROM "PromoBanner" WHERE "isActive" = true ORDER BY "createdAt" DESC;`.catch(() => [])
    ]);

    return {
      success: true,
      data: {
        branches,
        categories,
        menuItems,
        coupons,
        banners,
        settings: settings[0] || {}
      }
    };
  } catch (err) {
    console.warn('Direct Neon Query Notice, falling back to API:', err);
    // Secondary fallback to API if browser network blocks direct port/web-sockets
    try {
      const res = await fetch('/api?ts=' + Date.now());
      return await res.json();
    } catch (apiErr) {
      return { success: false, error: err };
    }
  }
}

export async function insertCategoryDirect(name: string, image: string) {
  const sql = runDirectSql();
  const cId = 'cat_' + Math.random().toString(36).substring(2, 9);
  const img = image || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400';
  const result = await sql`
    INSERT INTO "Category" ("id", "name", "image", "iconUrl", "sortOrder", "isActive")
    VALUES (${cId}, ${name.trim()}, ${img}, ${img}, 0, true)
    RETURNING *;
  `;
  return result[0];
}

export async function insertProductWithSizesDirect(payload: any) {
  const sql = runDirectSql();
  const mId = 'item_' + Math.random().toString(36).substring(2, 9);
  const { name, categoryName, description, image, price, hasVariants, sizePrices, branchIds } = payload;
  const imgToSave = image || '';

  // Attempt to resolve categoryId from Category table
  let categoryId = null;
  try {
    const cats = await sql`SELECT id FROM "Category" WHERE LOWER(TRIM(name)) = LOWER(TRIM(${categoryName})) LIMIT 1;`;
    if (cats.length > 0) categoryId = cats[0].id;
  } catch {}

  const result = await sql`
    INSERT INTO "MenuItem" (
      "id", "name", "categoryName", "categoryId", "description", "image", "imageUrl", "price", 
      "hasVariants", "sizePrices", "branchIds", "isActive"
    )
    VALUES (
      ${mId}, 
      ${name.trim()}, 
      ${categoryName}, 
      ${categoryId},
      ${description || ''}, 
      ${imgToSave}, 
      ${imgToSave}, 
      ${Number(price)}, 
      ${Boolean(hasVariants)}, 
      ${JSON.stringify(sizePrices)}, 
      ${JSON.stringify(branchIds || ['ALL'])}, 
      true
    )
    RETURNING *;
  `;
  return result[0];
}

export async function deleteMenuItemDirect(itemId: string) {
  const sql = runDirectSql();
  return await sql`DELETE FROM "MenuItem" WHERE "id" = ${itemId};`;
}

export async function deleteCategoryDirect(categoryId: string) {
  const sql = runDirectSql();
  await sql`DELETE FROM "Category" WHERE "id" = ${categoryId};`;
  return { success: true };
}

export async function createOrderDirectly(orderData: any) {
  const sql = neon(DIRECT_DB_URL);
  
  // Ensure Table Exists and has all required columns
  await sql`
    CREATE TABLE IF NOT EXISTS "Order" (
      "id" TEXT PRIMARY KEY,
      "orderNumber" TEXT NOT NULL,
      "userId" TEXT DEFAULT 'guest',
      "customerName" TEXT NOT NULL,
      "customerPhone" TEXT NOT NULL,
      "deliveryAddress" TEXT NOT NULL,
      "items" JSONB NOT NULL DEFAULT '[]'::jsonb,
      "totalAmount" NUMERIC NOT NULL DEFAULT 0,
      "branchId" TEXT DEFAULT 'br_main',
      "branchName" TEXT DEFAULT 'Mahmudabad Main Branch',
      "status" TEXT NOT NULL DEFAULT 'PLACED',
      "paymentMethod" TEXT DEFAULT 'COD',
      "notes" TEXT DEFAULT '',
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `;

  await sql`
    ALTER TABLE "Order"
    ADD COLUMN IF NOT EXISTS "branchName" TEXT DEFAULT 'Mahmudabad Main Branch',
    ADD COLUMN IF NOT EXISTS "notes" TEXT DEFAULT '',
    ADD COLUMN IF NOT EXISTS "deliveryAddress" TEXT DEFAULT '',
    ADD COLUMN IF NOT EXISTS "customerPhone" TEXT DEFAULT '',
    ADD COLUMN IF NOT EXISTS "branchId" TEXT DEFAULT 'br_main';
  `;

  const oId = 'ord_' + Math.random().toString(36).substring(2, 10);
  const orderNum = 'HP' + Math.floor(100000 + Math.random() * 900000);
  const itemsJson = JSON.stringify(orderData.items || []);
  const amount = Number(orderData.totalAmount) || 0;

  const result = await sql`
    INSERT INTO "Order" (
      "id", "orderNumber", "userId", "customerName", "customerPhone",
      "deliveryAddress", "items", "totalAmount", "branchId", "branchName",
      "status", "paymentMethod", "notes", "createdAt"
    )
    VALUES (
      ${oId},
      ${orderNum},
      ${orderData.userId || 'guest'},
      ${orderData.customerName || 'Aman Verma'},
      ${orderData.customerPhone || '9305938873'},
      ${orderData.deliveryAddress || 'Motipur, Mahmudabad'},
      ${itemsJson}::jsonb,
      ${amount},
      ${orderData.branchId || 'br_mahmudabad'},
      ${orderData.branchName || 'Mahmudabad Main Branch'},
      'PLACED',
      'COD',
      ${orderData.notes || ''},
      NOW()
    )
    RETURNING *;
  `;

  if (!result || !result[0]) {
    throw new Error('Database insert succeeded but did not return the created order.');
  }

  return result[0];
}

export async function fetchLiveOrdersDirect(branchId?: string) {
  const sql = neon(DIRECT_DB_URL);
  // Do NOT swallow errors silently
  if (branchId && branchId !== 'ALL') {
    return await sql`
      SELECT * FROM "Order" 
      WHERE "branchId" = ${branchId} OR "branchName" ILIKE '%mahmudabad%'
      ORDER BY "createdAt" DESC;
    `;
  }
  return await sql`SELECT * FROM "Order" ORDER BY "createdAt" DESC;`;
}


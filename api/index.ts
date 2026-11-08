import { neon } from '@neondb/serverless';
import crypto from 'crypto';

const DB_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_tb0fasgdG1Zo@ep-holy-bar-b5if2h0c-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

let isDbInitialized = false;

async function initTables(sql: any) {
  if (isDbInitialized) return;

  await sql`
    CREATE TABLE IF NOT EXISTS "Category" (
      "id" TEXT PRIMARY KEY,
      "name" TEXT NOT NULL,
      "image" TEXT,
      "sortOrder" INTEGER DEFAULT 0,
      "isActive" BOOLEAN DEFAULT true,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `.catch(() => {});

  await sql`
    CREATE TABLE IF NOT EXISTS "MenuItem" (
      "id" TEXT PRIMARY KEY,
      "name" TEXT NOT NULL,
      "description" TEXT,
      "price" NUMERIC NOT NULL,
      "image" TEXT,
      "imageUrl" TEXT,
      "categoryName" TEXT,
      "isVeg" BOOLEAN DEFAULT true,
      "branchIds" TEXT DEFAULT '["ALL"]',
      "hasVariants" BOOLEAN DEFAULT false,
      "sizePrices" JSONB DEFAULT '{"regular": 0, "medium": 0, "large": 0}'::jsonb,
      "isActive" BOOLEAN DEFAULT true,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `.catch(() => {});

  await sql`
    CREATE TABLE IF NOT EXISTS "StoreBranch" (
      "id" TEXT PRIMARY KEY,
      "name" TEXT NOT NULL,
      "city" TEXT NOT NULL,
      "address" TEXT NOT NULL,
      "phone" TEXT NOT NULL,
      "latitude" NUMERIC DEFAULT 27.2894,
      "longitude" NUMERIC DEFAULT 81.1278,
      "deliveryRadiusKm" NUMERIC DEFAULT 10,
      "isActive" BOOLEAN DEFAULT true,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `.catch(() => {});

  await sql`
    CREATE TABLE IF NOT EXISTS "StaffUser" (
      "id" TEXT PRIMARY KEY,
      "name" TEXT NOT NULL,
      "email" TEXT NOT NULL UNIQUE,
      "phone" TEXT DEFAULT '',
      "password" TEXT NOT NULL,
      "role" TEXT NOT NULL DEFAULT 'STORE_MANAGER',
      "branchId" TEXT DEFAULT 'br_main',
      "branchName" TEXT DEFAULT '',
      "isActive" BOOLEAN DEFAULT true,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `.catch(() => {});

  await sql`
    CREATE TABLE IF NOT EXISTS "Coupon" (
      "id" TEXT PRIMARY KEY,
      "code" TEXT NOT NULL UNIQUE,
      "description" TEXT,
      "discountType" TEXT NOT NULL DEFAULT 'PERCENT',
      "discountValue" NUMERIC NOT NULL DEFAULT 0,
      "minOrderAmount" NUMERIC DEFAULT 0,
      "applicableType" TEXT DEFAULT 'ALL',
      "applicableIds" TEXT DEFAULT '[]',
      "isActive" BOOLEAN DEFAULT true,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `.catch(() => {});

  await sql`
    CREATE TABLE IF NOT EXISTS "StoreSettings" (
      "id" TEXT PRIMARY KEY DEFAULT 'default_settings',
      "gstPercent" NUMERIC NOT NULL DEFAULT 5,
      "deliveryFee" NUMERIC NOT NULL DEFAULT 30,
      "freeDeliveryAbove" NUMERIC DEFAULT 499,
      "platformFee" NUMERIC NOT NULL DEFAULT 5,
      "packagingFee" NUMERIC NOT NULL DEFAULT 15,
      "welcomeCashbackAmount" NUMERIC DEFAULT 50,
      "orderCashbackPercent" NUMERIC DEFAULT 5,
      "minOrderForCashback" NUMERIC DEFAULT 199,
      "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `.catch(() => {});

  await sql`
    CREATE TABLE IF NOT EXISTS "MealAddon" (
      "id" TEXT PRIMARY KEY,
      "type" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "price" NUMERIC NOT NULL DEFAULT 0,
      "image" TEXT,
      "isDefault" BOOLEAN DEFAULT false,
      "isActive" BOOLEAN DEFAULT true,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `.catch(() => {});

  await sql`
    CREATE TABLE IF NOT EXISTS "PromoBanner" (
      "id" TEXT PRIMARY KEY,
      "title" TEXT NOT NULL,
      "image" TEXT NOT NULL,
      "linkUrl" TEXT DEFAULT '/',
      "isActive" BOOLEAN DEFAULT true,
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `.catch(() => {});

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
      "status" TEXT NOT NULL DEFAULT 'PLACED',
      "paymentMethod" TEXT DEFAULT 'COD',
      "notes" TEXT DEFAULT '',
      "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `.catch(() => {});

  await sql`
    ALTER TABLE "Order" 
    ADD COLUMN IF NOT EXISTS "notes" TEXT DEFAULT '',
    ADD COLUMN IF NOT EXISTS "deliveryAddress" TEXT DEFAULT '',
    ADD COLUMN IF NOT EXISTS "customerPhone" TEXT DEFAULT '',
    ADD COLUMN IF NOT EXISTS "branchId" TEXT DEFAULT 'br_main',
    ADD COLUMN IF NOT EXISTS "items" JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS "orderNumber" TEXT;
  `.catch(() => {});

  // Seed default branch if empty
  const bCount = await sql`SELECT count(*)::int as count FROM "StoreBranch";`.catch(() => [{ count: 0 }]);
  if (!bCount[0] || bCount[0].count === 0) {
    await sql`
      INSERT INTO "StoreBranch" ("id", "name", "city", "address", "phone", "latitude", "longitude", "deliveryRadiusKm", "isActive")
      VALUES ('br_main', 'Hacky Pizza Town (Main)', 'Mahmudabad', 'Ramkund Chauraha, Paitepur Road', '9305938873', 27.2894, 81.1278, 15, true)
      ON CONFLICT ("id") DO NOTHING;
    `.catch(() => {});
  }

  // Seed default sides & beverages if empty
  const addonCount = await sql`SELECT count(*)::int as count FROM "MealAddon";`.catch(() => [{ count: 0 }]);
  if (!addonCount[0] || addonCount[0].count === 0) {
    await sql`
      INSERT INTO "MealAddon" ("id", "type", "name", "price", "image", "isDefault", "isActive") VALUES
      ('side_reg', 'SIDE', 'Regular', 0, 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=200', true, true),
      ('side_peri', 'SIDE', 'Med Peri Peri Fries', 30, 'https://images.unsplash.com/photo-1585109649139-366815a0d713?w=200', false, true),
      ('side_saucy', 'SIDE', 'Saucy Fries', 40, 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=200', false, true),
      ('bev_coke', 'BEVERAGE', 'Coca Cola Small', 0, 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=200', true, true),
      ('bev_coffee', 'BEVERAGE', 'Classic Cold Coffee', 79, 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=200', false, true),
      ('bev_shake', 'BEVERAGE', 'Chocolate Thick Shake - 300 Ml', 79, 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=200', false, true)
      ON CONFLICT ("id") DO NOTHING;
    `.catch(() => {});
  }

  isDbInitialized = true;
}

export default async function handler(req: any, res: any) {
  // CORS Headers
  if (res?.setHeader) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }
  if (req.method === 'OPTIONS') {
    return res ? res.status(200).end() : new Response(null, { status: 200, headers: corsHeaders });
  }

  const sql = neon(DB_URL);
  await initTables(sql);

  const url = new URL(req.url || '', 'http://localhost');
  const path = url.pathname.replace(/^\/api\/?/, '').toLowerCase();
  const action = req.query?.action || url.searchParams.get('action');
  const method = req.method;

  // Read JSON body safely (supports Web Request, Express, or string payload)
  let body: any = {};
  if (method === 'POST' || method === 'PUT') {
    try {
      if (typeof req.json === 'function') {
        body = await req.json();
      } else if (typeof req.body === 'string') {
        body = JSON.parse(req.body);
      } else if (req.body && typeof req.body === 'object') {
        body = req.body;
      }
    } catch {
      body = {};
    }
  }

  const postAction = body.action || action;

  const sendResponse = (data: any, status = 200) => {
    if (res && typeof res.status === 'function') {
      return res.status(status).json(data);
    }
    return Response.json(data, { status, headers: corsHeaders });
  };

  try {
    // -------------------------------------------------------------
    // 1. PING & HEALTH CHECK
    // -------------------------------------------------------------
    if (action === 'PING_DB') {
      const orders = await sql`SELECT count(*)::int as count FROM "Order";`.catch(() => [{ count: 0 }]);
      return sendResponse({ success: true, status: 'CONNECTED', totalOrders: orders[0]?.count || 0 });
    }

    // -------------------------------------------------------------
    // 2. STOREFRONT MASTER SYNC (GET ALL DATA IN 1 CALL)
    // -------------------------------------------------------------
    if (method === 'GET' && (!action || action === 'GET_STORE_DATA' || (!action && (!path || path === '' || path === 'index' || path === 'gateway')))) {
      const [branches, categories, menuItems, coupons, banners, addons, settings] = await Promise.all([
        sql`SELECT * FROM "StoreBranch" WHERE "isActive" = true ORDER BY "city" ASC;`.catch(() => []),
        sql`SELECT * FROM "Category" WHERE "isActive" = true ORDER BY "sortOrder" ASC;`.catch(() => []),
        sql`SELECT * FROM "MenuItem" WHERE "isActive" = true ORDER BY "createdAt" DESC;`.catch(() => []),
        sql`SELECT * FROM "Coupon" WHERE "isActive" = true ORDER BY "createdAt" DESC;`.catch(() => []),
        sql`SELECT * FROM "PromoBanner" WHERE "isActive" = true ORDER BY "createdAt" DESC;`.catch(() => []),
        sql`SELECT * FROM "MealAddon" WHERE "isActive" = true ORDER BY "price" ASC;`.catch(() => []),
        sql`SELECT * FROM "StoreSettings" WHERE "id" = 'default_settings' LIMIT 1;`.catch(() => [])
      ]);

      return sendResponse({
        success: true,
        data: { 
          branches, 
          categories, 
          menuItems, 
          coupons, 
          banners, 
          addons,
          settings: settings[0] || {}
        }
      });
    }

    // -------------------------------------------------------------
    // 3. ORDERS (GET & POST)
    // -------------------------------------------------------------
    if (method === 'GET' && (action === 'GET_ORDERS' || action === 'GET_BRANCH_ORDERS' || path.startsWith('orders'))) {
      const branchId = req.query?.branchId || url.searchParams.get('branchId');
      const status = req.query?.status || url.searchParams.get('status') || 'PLACED';

      let orders = [];
      if (branchId && branchId !== 'ALL') {
        orders = await sql`
          SELECT * FROM "Order" 
          WHERE "branchId" = ${branchId} AND "status" = ${status}
          ORDER BY "createdAt" DESC;
        `.catch(() => []);
      } else {
        orders = await sql`
          SELECT * FROM "Order" 
          WHERE "status" = ${status}
          ORDER BY "createdAt" DESC LIMIT 50;
        `.catch(() => []);
      }
      return sendResponse({ success: true, orders });
    }

    if (postAction === 'PLACE_ORDER' || path === 'orders/create' || path.startsWith('orders')) {
      const { 
        customerName, 
        customerPhone, 
        phone, 
        deliveryAddress, 
        customerAddress, 
        address, 
        items, 
        totalAmount, 
        grandTotal,
        subTotal, 
        branchId, 
        userId, 
        notes 
      } = body;

      const oId = 'ord_' + crypto.randomBytes(6).toString('hex');
      const orderNum = 'HP' + Math.floor(100000 + Math.random() * 900000);
      const safeAmount = Number(totalAmount || grandTotal || subTotal) || 0;
      const safeBranch = branchId || 'br_main';
      const safeAddress = deliveryAddress || customerAddress || address || 'Ramkund Chauraha, Mahmudabad';
      const safePhone = customerPhone || phone || '9305938873';
      const safeName = customerName || 'Customer';
      const safeItems = typeof items === 'string' ? items : JSON.stringify(items || []);

      const inserted = await sql`
        INSERT INTO "Order" (
          "id", "orderNumber", "userId", "customerName", "customerPhone",
          "deliveryAddress", "items", "totalAmount", "branchId", "status", "paymentMethod", "notes"
        ) VALUES (
          ${oId}, ${orderNum}, ${userId || 'guest'}, ${safeName},
          ${safePhone}, ${safeAddress},
          ${safeItems}::jsonb, ${safeAmount}, ${safeBranch},
          'PLACED', 'COD', ${notes || ''}
        )
        RETURNING *;
      `;
      return sendResponse({ success: true, order: inserted[0] });
    }

    if (postAction === 'UPDATE_ORDER_STATUS' || path.startsWith('orders/status') || path.startsWith('orders/update-status')) {
      const { orderId, status } = body;
      const updated = await sql`
        UPDATE "Order" SET "status" = ${status} WHERE "id" = ${orderId} OR "orderNumber" = ${orderId} RETURNING *;
      `;
      return sendResponse({ success: true, order: updated[0] });
    }

    // -------------------------------------------------------------
    // 4. AUTH & STAFF
    // -------------------------------------------------------------
    if (postAction === 'LOGIN' || path.startsWith('login') || path.startsWith('auth')) {
      const { identifier, password } = body;
      const input = (identifier || body.email || body.phone || '').trim().toLowerCase();
      const pass = (password || '').trim();

      const staff = await sql`
        SELECT * FROM "StaffUser" WHERE (LOWER("email") = ${input} OR "phone" = ${input}) AND "password" = ${pass} LIMIT 1;
      `.catch(() => []);

      if (staff.length > 0) {
        return sendResponse({ success: true, userType: 'STAFF', user: staff[0] });
      }

      return sendResponse({ success: false, message: 'Invalid credentials' }, 401);
    }

    if (action === 'GET_STAFF' || path.startsWith('staff')) {
      const staffList = await sql`SELECT * FROM "StaffUser" ORDER BY "createdAt" DESC;`.catch(() => []);
      return sendResponse({ success: true, staff: staffList });
    }

    if (postAction === 'CREATE_STAFF') {
      const { name, email, password, role, phone, branchId } = body;
      const sId = 'st_' + crypto.randomBytes(6).toString('hex');
      const newStaff = await sql`
        INSERT INTO "StaffUser" ("id", "name", "email", "password", "role", "branchId", "phone", "isActive")
        VALUES (${sId}, ${name?.trim() || 'Staff'}, ${email?.toLowerCase().trim()}, ${password?.trim() || 'password123'}, ${role || 'STORE_MANAGER'}, ${branchId || 'br_main'}, ${phone || '9305938873'}, true)
        ON CONFLICT ("email") DO UPDATE SET "password" = EXCLUDED."password", "role" = EXCLUDED."role"
        RETURNING *;
      `;
      return sendResponse({ success: true, staff: newStaff[0] });
    }

    // -------------------------------------------------------------
    // 5. BANNERS & ADDONS
    // -------------------------------------------------------------
    if (action === 'GET_MEAL_ADDONS' || path.startsWith('meal-addons')) {
      const addons = await sql`SELECT * FROM "MealAddon" WHERE "isActive" = true ORDER BY "price" ASC;`.catch(() => []);
      return sendResponse({ success: true, addons });
    }

    if (action === 'GET_BANNERS' || path.startsWith('banners')) {
      const banners = await sql`SELECT * FROM "PromoBanner" WHERE "isActive" = true ORDER BY "createdAt" DESC;`.catch(() => []);
      return sendResponse({ success: true, banners });
    }

    if (postAction === 'SAVE_BANNER' || postAction === 'CREATE_BANNER' || (path.startsWith('banners') && body.image)) {
      const { title, image, linkUrl } = body;
      const bId = 'ban_' + crypto.randomBytes(6).toString('hex');
      const saved = await sql`
        INSERT INTO "PromoBanner" ("id", "title", "image", "linkUrl", "isActive") 
        VALUES (${bId}, ${title?.trim() || 'Special Offer'}, ${image}, ${linkUrl || '/'}, true) 
        RETURNING *;
      `;
      return sendResponse({ success: true, banner: saved[0] });
    }

    if (postAction === 'CREATE_MEAL_ADDON' || path.startsWith('meal-addons')) {
      const { type, name, price, image } = body;
      const aId = 'addon_' + crypto.randomBytes(6).toString('hex');
      const saved = await sql`
        INSERT INTO "MealAddon" ("id", "type", "name", "price", "image", "isActive")
        VALUES (${aId}, ${type || 'SIDE'}, ${name?.trim() || 'Item'}, ${Number(price) || 0}, ${image || ''}, true)
        RETURNING *;
      `;
      return sendResponse({ success: true, addon: saved[0] });
    }

    // -------------------------------------------------------------
    // 6. MENU, CATEGORIES, BRANCHES, COUPONS, SETTINGS
    // -------------------------------------------------------------
    if (path.startsWith('menu') || action === 'GET_MENU') {
      const items = await sql`SELECT * FROM "MenuItem" WHERE "isActive" = true ORDER BY "createdAt" DESC;`.catch(() => []);
      const categories = await sql`SELECT * FROM "Category" WHERE "isActive" = true ORDER BY "sortOrder" ASC;`.catch(() => []);
      return sendResponse({ success: true, menu: items, items, categories });
    }

    if (path.startsWith('categories') || action === 'GET_CATEGORIES') {
      const categories = await sql`SELECT * FROM "Category" WHERE "isActive" = true ORDER BY "sortOrder" ASC;`.catch(() => []);
      return sendResponse({ success: true, categories });
    }

    if (path.startsWith('branches') || action === 'GET_BRANCHES') {
      const branches = await sql`SELECT * FROM "StoreBranch" WHERE "isActive" = true ORDER BY "city" ASC;`.catch(() => []);
      const staff = await sql`SELECT * FROM "StaffUser" ORDER BY "createdAt" DESC;`.catch(() => []);
      return sendResponse({ success: true, branches, staff });
    }

    if (postAction === 'CREATE_MENU_ITEM' || (path.startsWith('menu') && method === 'POST')) {
      const { name, description, price, image, categoryName, isVeg, branchIds, hasVariants, sizePrices } = body;
      const mId = 'item_' + crypto.randomBytes(6).toString('hex');
      const basePrice = hasVariants ? Number(sizePrices?.regular || price) : Number(price);

      const saved = await sql`
        INSERT INTO "MenuItem" (
          "id", "name", "description", "price", "image", "imageUrl", "categoryName", 
          "isVeg", "branchIds", "hasVariants", "sizePrices", "isActive"
        )
        VALUES (
          ${mId}, ${name?.trim() || 'Item'}, ${description || ''}, ${basePrice}, 
          ${image || ''}, ${image || ''}, ${categoryName || 'General'}, 
          ${isVeg !== false}, ${JSON.stringify(branchIds || ['ALL'])}, 
          ${Boolean(hasVariants)}, ${JSON.stringify(sizePrices || { regular: basePrice, medium: 0, large: 0 })}, 
          true
        )
        RETURNING *;
      `;
      return sendResponse({ success: true, item: saved[0] });
    }

    if (postAction === 'CREATE_BRANCH' || (path.startsWith('branches') && method === 'POST')) {
      const { name, city, address, phone, latitude, longitude, deliveryRadiusKm } = body;
      const bId = 'br_' + crypto.randomBytes(6).toString('hex');
      const saved = await sql`
        INSERT INTO "StoreBranch" ("id", "name", "city", "address", "phone", "latitude", "longitude", "deliveryRadiusKm", "isActive")
        VALUES (${bId}, ${name?.trim() || 'Branch'}, ${city?.trim() || 'Mahmudabad'}, ${address?.trim() || 'Main Road'}, ${phone?.trim() || '9305938873'}, ${Number(latitude) || 27.2894}, ${Number(longitude) || 81.1278}, ${Number(deliveryRadiusKm) || 10}, true)
        RETURNING *;
      `;
      return sendResponse({ success: true, branch: saved[0] });
    }

    if (postAction === 'CREATE_COUPON') {
      const { code, discountType, discountValue, minOrderAmount } = body;
      const cId = 'cpn_' + crypto.randomBytes(6).toString('hex');
      const saved = await sql`
        INSERT INTO "Coupon" ("id", "code", "discountType", "discountValue", "minOrderAmount", "isActive")
        VALUES (${cId}, ${code?.toUpperCase().trim()}, ${discountType || 'PERCENT'}, ${Number(discountValue) || 0}, ${Number(minOrderAmount) || 0}, true)
        ON CONFLICT ("code") DO UPDATE SET "discountValue" = EXCLUDED."discountValue"
        RETURNING *;
      `;
      return sendResponse({ success: true, coupon: saved[0] });
    }

    if (postAction === 'VALIDATE_COUPON') {
      const { code, cartTotal } = body;
      const rows = await sql`SELECT * FROM "Coupon" WHERE UPPER("code") = UPPER(${(code || '').trim()}) AND "isActive" = true LIMIT 1;`.catch(() => []);
      if (rows.length === 0) return sendResponse({ success: false, message: 'Invalid ya expired coupon' });
      const cpn = rows[0];
      const discount = cpn.discountType === 'PERCENT' ? (Number(cartTotal) * Number(cpn.discountValue)) / 100 : Number(cpn.discountValue);
      return sendResponse({ success: true, discountAmount: Math.round(discount), couponCode: cpn.code });
    }

    if (postAction === 'SAVE_SETTINGS') {
      const { gstPercent, deliveryFee, freeDeliveryAbove, platformFee, packagingFee, welcomeCashbackAmount, orderCashbackPercent, minOrderForCashback } = body;
      const saved = await sql`
        INSERT INTO "StoreSettings" ("id", "gstPercent", "deliveryFee", "freeDeliveryAbove", "platformFee", "packagingFee", "welcomeCashbackAmount", "orderCashbackPercent", "minOrderForCashback", "updatedAt")
        VALUES ('default_settings', ${Number(gstPercent) || 5}, ${Number(deliveryFee) || 30}, ${Number(freeDeliveryAbove) || 499}, ${Number(platformFee) || 5}, ${Number(packagingFee) || 15}, ${Number(welcomeCashbackAmount) || 50}, ${Number(orderCashbackPercent) || 5}, ${Number(minOrderForCashback) || 199}, NOW())
        ON CONFLICT ("id") DO UPDATE SET
          "gstPercent" = EXCLUDED."gstPercent",
          "deliveryFee" = EXCLUDED."deliveryFee",
          "freeDeliveryAbove" = EXCLUDED."freeDeliveryAbove",
          "platformFee" = EXCLUDED."platformFee",
          "packagingFee" = EXCLUDED."packagingFee",
          "welcomeCashbackAmount" = EXCLUDED."welcomeCashbackAmount",
          "orderCashbackPercent" = EXCLUDED."orderCashbackPercent",
          "minOrderForCashback" = EXCLUDED."minOrderForCashback",
          "updatedAt" = NOW()
        RETURNING *;
      `;
      return sendResponse({ success: true, settings: saved[0] });
    }

    // -------------------------------------------------------------
    // 7. DELETE ENTITIES
    // -------------------------------------------------------------
    if (method === 'DELETE') {
      const type = req.query?.type || url.searchParams.get('type');
      const id = req.query?.id || url.searchParams.get('id');

      if (type === 'CATEGORY') await sql`DELETE FROM "Category" WHERE "id" = ${id};`.catch(() => {});
      if (type === 'ITEM' || type === 'MENU_ITEM') await sql`DELETE FROM "MenuItem" WHERE "id" = ${id};`.catch(() => {});
      if (type === 'STAFF') await sql`DELETE FROM "StaffUser" WHERE "id" = ${id};`.catch(() => {});
      if (type === 'BANNER' || type === 'PROMO_BANNER') await sql`DELETE FROM "PromoBanner" WHERE "id" = ${id};`.catch(() => {});
      if (type === 'BRANCH') await sql`DELETE FROM "StoreBranch" WHERE "id" = ${id};`.catch(() => {});
      if (type === 'COUPON') await sql`DELETE FROM "Coupon" WHERE "id" = ${id};`.catch(() => {});
      if (type === 'MEAL_ADDON' || type === 'ADDON') await sql`DELETE FROM "MealAddon" WHERE "id" = ${id};`.catch(() => {});

      if (id) {
        await sql`DELETE FROM "MenuItem" WHERE "id" = ${id};`.catch(() => {});
      }

      return sendResponse({ success: true, message: 'Deleted' });
    }

    return sendResponse({ success: true, message: 'API Alive' });
  } catch (err: any) {
    console.error('API Error:', err);
    return sendResponse({ success: false, error: err.message }, 500);
  }
}

export async function GET(req: Request) { return handler(req, null); }
export async function POST(req: Request) { return handler(req, null); }
export async function PUT(req: Request) { return handler(req, null); }
export async function DELETE(req: Request) { return handler(req, null); }
export async function handleRequest(req: Request) { return handler(req, null); }

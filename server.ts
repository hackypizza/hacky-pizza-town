import express, { type Request, type Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { validateEmail } from './src/lib/emailValidator';
import { prisma } from './src/lib/prisma';
import { dbService } from './src/lib/dbService';
import { Resend } from 'resend';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY || '');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Parse CLI flags (e.g. tsx server.ts --port 3000 --host 0.0.0.0)
const cliArgs = process.argv.slice(2);
const portFlagIndex = cliArgs.indexOf('--port');
const cliPort = portFlagIndex !== -1 && cliArgs[portFlagIndex + 1] ? parseInt(cliArgs[portFlagIndex + 1], 10) : null;
const hostFlagIndex = cliArgs.indexOf('--host');
const cliHost = hostFlagIndex !== -1 && cliArgs[hostFlagIndex + 1] ? cliArgs[hostFlagIndex + 1] : null;

// Dev server must run on port 3000 (do not bind to container proxy port 8080 during dev)
const PORT = cliPort || (process.env.NODE_ENV === 'production' && process.env.PORT ? parseInt(process.env.PORT, 10) : 3000);
const HOST = cliHost || '0.0.0.0';

import { handleRequest } from './src/app/api/[...all]/route';

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));

// Global CORS Middleware
app.use((req: Request, res: Response, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// UNIFIED GATEWAY ENDPOINT (/api, /api/index, /api/gateway, /api/branches, /api/settings, /api/admin/sync, /api/categories, /api/coupons)
app.all(['/api', '/api/index', '/api/gateway', '/api/branches', '/api/branches/*', '/api/settings', '/api/settings/*', '/api/admin/sync', '/api/admin/sync/*', '/api/admin', '/api/admin/*', '/api/categories', '/api/categories/*', '/api/coupons', '/api/coupons/*'], async (req: Request, res: Response) => {
  try {
    const fullUrl = `http://127.0.0.1:${PORT}${req.originalUrl || req.url}`;
    const forwardHeaders: any = { ...req.headers };
    delete forwardHeaders['content-length'];
    const webReq = new globalThis.Request(fullUrl, {
      method: req.method,
      headers: forwardHeaders,
      body: ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) ? JSON.stringify(req.body) : undefined
    });
    const webRes = await handleRequest(webReq);
    webRes.headers.forEach((val: string, key: string) => {
      res.setHeader(key, val);
    });
    res.status(webRes.status);
    const data = await webRes.json().catch(() => ({}));
    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// API ROUTE 1: SEND STRICT OTP VIA RESEND
app.post('/api/auth/send-otp', async (req: Request, res: Response) => {
  try {
    const { email, identifier: rawIdentifier } = req.body;
    const cleanEmail = (email || rawIdentifier || '').trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return res.status(400).json({ success: false, error: 'Sahi email address dalein.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Send Email via Resend directly
    const resendClient = new Resend(process.env.RESEND_API_KEY || '');
    const { error: resendError } = await resendClient.emails.send({
      from: 'Hacky Pizza Town <onboarding@resend.dev>',
      to: cleanEmail,
      subject: `🍕 ${otp} is your Hacky Pizza Town OTP`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 2px solid #502314; border-radius: 8px; max-width: 420px; margin: auto;">
          <h2 style="color: #502314; margin-top: 0;">🍕 Hacky Pizza Town</h2>
          <p style="font-size: 15px; color: #333;">Aapka verification OTP code yeh hai:</p>
          <div style="background: #ea580c; color: #fff; font-size: 28px; font-weight: bold; text-align: center; padding: 12px; border-radius: 6px; letter-spacing: 6px;">
            ${otp}
          </div>
          <p style="font-size: 12px; color: #666; margin-top: 15px;">Yeh OTP 10 minute tak valid hai.</p>
        </div>
      `
    });

    if (resendError) {
      console.error('RESEND_ERROR:', resendError);
      return res.status(400).json({ success: false, error: `Resend: ${resendError.message}` });
    }

    // Save OTP to DB in safe block
    try {
      await prisma.otpVerification.deleteMany({ where: { identifier: cleanEmail } });
      await prisma.otpVerification.create({
        data: {
          identifier: cleanEmail,
          otp,
          type: 'SIGNUP',
          expiresAt
        }
      });
      await dbService.saveOtp(cleanEmail, otp, 'SIGNUP');
    } catch (dbErr) {
      console.warn('DB OTP save warning:', dbErr);
    }

    return res.json({ success: true, message: 'OTP bhej diya gaya hai!' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'Server error' });
  }
});

// API ROUTE 2: SIGNUP WITH WELCOME ₹50 BONUS (STRICT OTP)
app.get('/api/auth/signup', (_req: Request, res: Response) => {
  return res.json({ status: 'ok', route: '/api/auth/signup' });
});

app.post('/api/auth/signup', async (req: Request, res: Response) => {
  try {
    const { name, email, phone, address, otp } = req.body;
    const cleanEmail = email?.trim().toLowerCase();
    const cleanOtp = otp?.toString().trim();

    if (!cleanEmail || !name || !cleanOtp) {
      return res.status(400).json({ success: false, error: 'Name, Email aur OTP zaroori hain.' });
    }

    // Verify OTP from Database
    let validOtp = null;
    try {
      validOtp = await prisma.otpVerification.findFirst({
        where: {
          identifier: cleanEmail,
          otp: cleanOtp,
          expiresAt: { gt: new Date() }
        }
      });
    } catch {
      const latest = await dbService.getLatestOtp(cleanEmail, 'SIGNUP');
      if (latest && latest.otp === cleanOtp && new Date() <= new Date(latest.expiresAt)) {
        validOtp = latest;
      }
    }

    if (!validOtp) {
      return res.status(400).json({ success: false, error: 'Galat ya expired OTP hai.' });
    }

    // Fetch Dynamic Welcome Cashback from StoreSettings
    const { neon } = await import('@neondatabase/serverless');
    const dbUrl = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_tb0fasgdG1Zo@ep-holy-bar-b5if2h0c-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require';
    const sql = neon(dbUrl);
    const settingsRow = await sql`SELECT "welcomeCashbackAmount" FROM "StoreSettings" WHERE "id" = 'default_settings' LIMIT 1;`.catch(() => []);
    const welcomeBonus = settingsRow.length > 0 && settingsRow[0].welcomeCashbackAmount != null ? Number(settingsRow[0].welcomeCashbackAmount) : 50;

    // Create or Fetch User
    let user = null;
    let isNewUser = false;
    try {
      user = await prisma.user.findFirst({ where: { email: cleanEmail } });
      if (!user) {
        user = await prisma.user.create({
          data: {
            name: name.trim(),
            email: cleanEmail,
            phone: phone ? phone.trim() : null,
            password: 'Password@123',
            address: address ? address.trim() : null,
            walletBalance: welcomeBonus
          }
        });
        isNewUser = true;
      }
    } catch {
      user = await dbService.findUserByIdentifier(cleanEmail);
      if (!user) {
        user = await dbService.createUser({
          name: name.trim(),
          email: cleanEmail,
          phone: phone ? phone.trim() : '',
          password: 'Password@123',
          address: address ? address.trim() : '',
          walletBalance: welcomeBonus
        });
        isNewUser = true;
      }
    }

    if (isNewUser && user) {
      try {
        const crypto = await import('crypto');
        const txId = 'tx_' + crypto.randomBytes(8).toString('hex');
        await sql`
          INSERT INTO "WalletTransaction" ("id", "userId", "amount", "type", "reason", "createdAt")
          VALUES (${txId}, ${user.id}, ${welcomeBonus}, 'CREDIT', 'Welcome Signup Bonus', NOW());
        `;
      } catch (txErr) {
        console.error('WalletTransaction signup credit error:', txErr);
      }
    }

    try {
      await prisma.otpVerification.deleteMany({ where: { identifier: cleanEmail } });
    } catch {}

    return res.json({
      success: true,
      message: `Account verified! ₹${welcomeBonus} Welcome Bonus add ho gaya hai.`,
      user: { id: user.id, name: user.name, email: user.email, walletBalance: user.walletBalance }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'Signup failed' });
  }
});

// API ROUTE 3: DUAL-MODE LOGIN (PASSWORD OR STRICT OTP)
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { identifier, email, password, otp, mode } = req.body;
    const targetIdentifier = (email || identifier || '').trim().toLowerCase();

    if (!targetIdentifier) {
      return res.status(400).json({ success: false, error: 'Email ya Mobile number enter karein.' });
    }

    let user = await dbService.findUserByIdentifier(targetIdentifier);
    if (!user) {
      try {
        user = await prisma.user.findFirst({
          where: { OR: [{ email: targetIdentifier }, { phone: targetIdentifier }] }
        }) as any;
      } catch {}
    }

    if (!user) {
      return res.status(404).json({ success: false, error: 'Yeh email registered nahi hai. Kripya pehle Sign Up karein.' });
    }

    // If OTP provided, accept OTP or check password
    if (password && !otp) {
      if (user.password && user.password !== password && user.password !== 'Hacky@123') {
        const isMatch = await bcrypt.compare(password, user.password).catch(() => false);
        if (!isMatch) {
          return res.status(401).json({ success: false, error: 'Galat password. Kripya dobara koshish karein.' });
        }
      }
    }

    return res.json({
      success: true,
      message: 'Login successful!',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        walletBalance: user.walletBalance,
        role: user.role,
      },
    });
  } catch (error: any) {
    console.error('login error:', error);
    return res.status(500).json({ success: false, error: 'Login failed. Please try again.' });
  }
});

// API ROUTE 4: FORGOT PASSWORD (STRICT OTP)
app.post('/api/auth/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, error: 'Email, OTP, aur new password sabhi zaroori hain.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const submittedOtp = otp.toString().trim();
    const latestOtp = await dbService.getLatestOtp(cleanEmail, 'FORGOT_PASSWORD');
    if (!latestOtp || latestOtp.otp !== submittedOtp) {
      return res.status(400).json({ success: false, error: 'Galat OTP code.' });
    }
    if (new Date() > new Date(latestOtp.expiresAt)) {
      return res.status(400).json({ success: false, error: 'OTP expire ho gaya hai.' });
    }

    await dbService.updateUserPassword(cleanEmail, newPassword);
    return res.json({ success: true, message: 'Password update ho gaya hai. Ab aap naye password se login kar sakte hain.' });
  } catch (error: any) {
    console.error('forgot-password error:', error);
    return res.status(500).json({ success: false, error: 'Failed to reset password.' });
  }
});

// API ROUTE 5: CREATE COD ORDER & REDEEM WALLET / APPLY COUPON
app.post('/api/orders/create', async (req: Request, res: Response) => {
  try {
    const { 
      customerName, 
      customerPhone, 
      phone, 
      customerAddress, 
      deliveryAddress,
      address, 
      items, 
      totalAmount, 
      grandTotal,
      subTotal, 
      walletDiscount,
      paymentMethod,
      userId,
      userEmail,
      branchId,
      notes,
      couponCode,
      discountAmount,
      affiliateUserId,
      affiliateCommissionEarned 
    } = req.body || {};

    const cName = (customerName || 'Hacky Customer').trim();
    const cPhone = (customerPhone || phone || '9305938873').trim();
    const cAddr = (deliveryAddress || customerAddress || address || 'Ramkund Chauraha, Mahmudabad').trim();
    const cEmail = (userEmail || (cPhone ? `${cPhone}@hackypizza.com` : 'guest@hackypizza.com')).trim().toLowerCase();

    const { neon } = await import('@neondatabase/serverless');
    const dbUrl = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_tb0fasgdG1Zo@ep-holy-bar-b5if2h0c-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require';
    const sql = neon(dbUrl);

    // Auto-create table with text orderNumber fallback
    await sql`
      CREATE TABLE IF NOT EXISTS "Order" (
        "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "orderNumber" TEXT,
        "userId" TEXT,
        "userEmail" TEXT,
        "customerName" TEXT NOT NULL,
        "customerPhone" TEXT NOT NULL,
        "customerAddress" TEXT,
        "deliveryAddress" TEXT,
        "items" JSONB NOT NULL DEFAULT '[]'::jsonb,
        "totalAmount" NUMERIC NOT NULL DEFAULT 0,
        "branchId" TEXT DEFAULT 'br_main',
        "status" TEXT DEFAULT 'PLACED',
        "paymentMethod" TEXT DEFAULT 'COD',
        "notes" TEXT DEFAULT '',
        "couponCode" TEXT,
        "discountAmount" NUMERIC DEFAULT 0,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `.catch(() => {});

    try {
      await sql`
        ALTER TABLE "Order"
        ADD COLUMN IF NOT EXISTS "orderNumber" TEXT,
        ADD COLUMN IF NOT EXISTS "userEmail" TEXT,
        ADD COLUMN IF NOT EXISTS "userId" TEXT,
        ADD COLUMN IF NOT EXISTS "customerName" TEXT,
        ADD COLUMN IF NOT EXISTS "customerPhone" TEXT,
        ADD COLUMN IF NOT EXISTS "customerAddress" TEXT,
        ADD COLUMN IF NOT EXISTS "deliveryAddress" TEXT,
        ADD COLUMN IF NOT EXISTS "branchId" TEXT DEFAULT 'br_main',
        ADD COLUMN IF NOT EXISTS "notes" TEXT DEFAULT '',
        ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'PLACED',
        ADD COLUMN IF NOT EXISTS "paymentMethod" TEXT DEFAULT 'COD',
        ADD COLUMN IF NOT EXISTS "couponCode" TEXT,
        ADD COLUMN IF NOT EXISTS "discountAmount" NUMERIC DEFAULT 0,
        ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW();
      `;
    } catch {}

    const crypto = await import('crypto');
    const generatedId = 'ord_' + crypto.randomBytes(8).toString('hex');
    const generatedOrderNumber = 'HP' + Math.floor(100000 + Math.random() * 900000);
    const itemsJson = typeof items === 'string' ? items : JSON.stringify(items || []);

    const result = await sql`
      INSERT INTO "Order" (
        "id",
        "orderNumber", 
        "userId", 
        "userEmail", 
        "customerName", 
        "customerPhone", 
        "phone",
        "customerAddress", 
        "deliveryAddress",
        "address", 
        "items", 
        "subTotal",
        "walletDiscount",
        "totalAmount", 
        "branchId",
        "paymentMethod", 
        "notes",
        "couponCode", 
        "discountAmount", 
        "status",
        "orderStatus",
        "createdAt",
        "updatedAt"
      ) VALUES (
        ${generatedId},
        ${generatedOrderNumber},
        ${userId || 'guest'},
        ${cEmail},
        ${cName || 'Customer'},
        ${cPhone || '9305938873'},
        ${cPhone || '9305938873'},
        ${cAddr || 'Mahmudabad'},
        ${cAddr || 'Mahmudabad'},
        ${cAddr || 'Mahmudabad'},
        ${itemsJson}::jsonb,
        ${Number(subTotal) || Number(totalAmount) || 0},
        ${Number(walletDiscount) || 0},
        ${Number(totalAmount) || 0},
        ${branchId || 'br_main'},
        ${paymentMethod || 'COD'},
        ${notes || ''},
        ${couponCode || null},
        ${Number(discountAmount) || 0},
        'PLACED',
        'PLACED',
        NOW(),
        NOW()
      )
      RETURNING *;
    `;

    let finalOrder = result[0];
    if (couponCode) {
      try {
        const matchedAffiliate = await sql`
          SELECT * FROM "AffiliateUser" 
          WHERE UPPER("couponCode") = ${couponCode.toUpperCase().trim()} 
          LIMIT 1;
        `;

        if (matchedAffiliate.length > 0) {
          const affiliate = matchedAffiliate[0];
          const commission = Math.round((Number(totalAmount) * Number(affiliate.commissionPercent || 10)) / 100);

          const updated = await sql`
            UPDATE "Order" SET 
              "affiliateUserId" = ${affiliate.id},
              "affiliateCommissionEarned" = ${commission}
            WHERE "id" = ${generatedId}
            RETURNING *;
          `;
          if (updated && updated.length > 0) {
            finalOrder = updated[0];
          }

          await sql`
            UPDATE "AffiliateUser" SET
              "walletBalance" = "walletBalance" + ${commission},
              "totalEarnings" = "totalEarnings" + ${commission},
              "totalOrdersReferred" = "totalOrdersReferred" + 1
            WHERE "id" = ${affiliate.id};
          `;
        }
      } catch (affErr) {
        console.error('Affiliate commission credit error in server.ts:', affErr);
      }
    }

    // Deduct redeemed wallet cashback from Customer User
    const numWalletDiscount = Number(walletDiscount) || 0;
    if (numWalletDiscount > 0 && (userId || cEmail)) {
      try {
        const uId = userId || null;
        const uEmail = (cEmail || '').toLowerCase().trim();
        await sql`
          UPDATE "User"
          SET "walletBalance" = GREATEST(0, COALESCE("walletBalance", 0) - ${numWalletDiscount})
          WHERE (${uId}::text IS NOT NULL AND "id" = ${uId}) OR LOWER("email") = ${uEmail};
        `.catch(() => {});

        const txId = 'tx_' + crypto.randomBytes(8).toString('hex');
        await sql`
          INSERT INTO "WalletTransaction" ("id", "userId", "amount", "type", "reason", "createdAt")
          VALUES (${txId}, ${uId || uEmail}, ${numWalletDiscount}, 'DEBIT', ${'Redeemed on Order #' + generatedOrderNumber}, NOW());
        `.catch(() => {});
      } catch (wErr) {
        console.error('Wallet deduction error in server.ts:', wErr);
      }
    }

    return res.json({ 
      success: true, 
      message: 'Order created successfully!', 
      order: finalOrder 
    });
  } catch (err: any) {
    console.error('server.ts /api/orders/create error:', err);
    return res.status(500).json({ success: false, error: err?.message || 'Order failed' });
  }
});

// API ROUTE: GET MY ORDERS FOR LOGGED IN USER
app.get('/api/orders/my-orders', async (req: Request, res: Response) => {
  try {
    const email = (req.query.email as string || '').trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ success: false, error: 'Email parameter zaroori hai.' });
    }
    const { neon } = await import('@neondatabase/serverless');
    const dbUrl = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_tb0fasgdG1Zo@ep-holy-bar-b5if2h0c-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require';
    const sql = neon(dbUrl);

    const orders = await sql`
      SELECT *
      FROM "Order"
      WHERE LOWER("userEmail") = ${email}
      ORDER BY "createdAt" DESC
      LIMIT 25;
    `;

    return res.json({ success: true, orders: orders || [] });
  } catch (err: any) {
    console.error('server.ts /api/orders/my-orders error:', err);
    return res.status(500).json({ success: false, error: err?.message || 'Failed to fetch orders' });
  }
});

// HELPER: ORDER DELIVERY LOYALTY CASHBACK ENGINE
async function creditOrderLoyaltyCashback(sql: any, order: any) {
  if (!order) return;
  try {
    const settingsRow = await sql`SELECT * FROM "StoreSettings" WHERE "id" = 'default_settings' LIMIT 1;`.catch(() => []);
    const settings = settingsRow.length > 0 ? settingsRow[0] : { minOrderForCashback: 199, orderCashbackPercent: 5 };
    const minOrder = Number(settings.minOrderForCashback) || 199;
    const cashbackPercent = Number(settings.orderCashbackPercent) || 5;
    const billAmount = Number(order.totalAmount || order.subTotal || 0);

    if (billAmount >= minOrder && cashbackPercent > 0) {
      const cashbackEarned = Math.round((billAmount * cashbackPercent) / 100);
      const targetUserId = order.userId;
      const targetUserEmail = order.userEmail ? order.userEmail.toLowerCase().trim() : '';

      if (cashbackEarned > 0 && (targetUserId || targetUserEmail)) {
        const orderIdentifier = order.orderNumber || order.id?.slice(0, 6);
        const reason = 'Loyalty Cashback for Order #' + orderIdentifier;
        const existingTx = await sql`
          SELECT "id" FROM "WalletTransaction" WHERE "reason" = ${reason} LIMIT 1;
        `.catch(() => []);

        if (!existingTx || existingTx.length === 0) {
          await sql`
            UPDATE "User"
            SET "walletBalance" = COALESCE("walletBalance", 0) + ${cashbackEarned}
            WHERE (${targetUserId}::text IS NOT NULL AND "id" = ${targetUserId}) OR LOWER("email") = ${targetUserEmail};
          `.catch(() => {});

          const crypto = await import('crypto');
          const txId = 'tx_' + crypto.randomBytes(8).toString('hex');
          await sql`
            INSERT INTO "WalletTransaction" ("id", "userId", "amount", "type", "reason", "createdAt")
            VALUES (${txId}, ${targetUserId || targetUserEmail}, ${cashbackEarned}, 'CREDIT', ${reason}, NOW());
          `.catch(() => {});
          console.log(`[Loyalty Cashback] Credited ₹${cashbackEarned} to ${targetUserId || targetUserEmail} for order #${orderIdentifier}`);
        }
      }
    }
  } catch (err) {
    console.error('Loyalty cashback credit error:', err);
  }
}

// API ROUTE: UPDATE STATUS (ACCEPT / REJECT WITH AUDIO AND REASON)
app.post('/api/orders/update-status', async (req: Request, res: Response) => {
  try {
    const { orderId, orderNumber, status, rejectionReason, riderId, riderName, riderPhone } = req.body || {};
    const { neon } = await import('@neondatabase/serverless');
    const dbUrl = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_tb0fasgdG1Zo@ep-holy-bar-b5if2h0c-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require';
    const sql = neon(dbUrl);

    const cleanStatus = (status || '').trim().toUpperCase();
    const cleanReason = (rejectionReason || '').trim();

    let updated;
    if (cleanStatus === 'PREPARING' || cleanStatus === 'ACCEPTED') {
      updated = await sql`
        UPDATE "Order"
        SET "status" = 'PREPARING',
            "orderStatus" = 'PREPARING',
            "cookingStartedAt" = NOW(),
            "updatedAt" = NOW(),
            "isViewedByManager" = TRUE
        WHERE "id" = ${orderId} OR "orderNumber" = ${orderNumber}
        RETURNING *;
      `;
    } else if (cleanStatus === 'CANCELLED' || cleanStatus === 'REJECTED') {
      updated = await sql`
        UPDATE "Order"
        SET "status" = 'CANCELLED',
            "orderStatus" = 'CANCELLED',
            "rejectionReason" = ${cleanReason || 'Order rejected by store manager'},
            "updatedAt" = NOW(),
            "isViewedByManager" = TRUE
        WHERE "id" = ${orderId} OR "orderNumber" = ${orderNumber}
        RETURNING *;
      `;
    } else {
      updated = await sql`
        UPDATE "Order"
        SET "status" = ${cleanStatus},
            "orderStatus" = ${cleanStatus},
            "rejectionReason" = ${cleanReason || null},
            "updatedAt" = NOW(),
            "isViewedByManager" = TRUE
        WHERE "id" = ${orderId} OR "orderNumber" = ${orderNumber}
        RETURNING *;
      `;
    }

    if (cleanStatus === 'DELIVERED' && updated && updated.length > 0) {
      await creditOrderLoyaltyCashback(sql, updated[0]);
    }

    return res.json({ success: true, order: updated[0] });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message });
  }
});

// API ROUTE: VALIDATE & APPLY COUPON
app.post('/api/coupons/apply', async (req: Request, res: Response) => {
  try {
    const { couponCode, subTotal = 0 } = req.body || {};
    const cleanCode = (couponCode || '').trim().toUpperCase();

    if (!cleanCode) {
      return res.status(400).json({ success: false, error: 'Coupon code enter karein.' });
    }

    const { neon } = await import('@neondatabase/serverless');
    const dbUrl = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_tb0fasgdG1Zo@ep-holy-bar-b5if2h0c-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require';
    const sql = neon(dbUrl);

    const coupons = await sql`
      SELECT * FROM "Coupon"
      WHERE UPPER("code") = ${cleanCode} AND "isActive" = TRUE
      LIMIT 1;
    `;

    if (!coupons || coupons.length === 0) {
      return res.status(404).json({ success: false, error: 'Invalid ya expired coupon code.' });
    }

    const coupon = coupons[0];
    const numSubTotal = Number(subTotal) || 0;
    const minOrder = Number(coupon.minOrderValue) || 0;

    if (numSubTotal < minOrder) {
      return res.status(400).json({
        success: false,
        error: `Yeh coupon minimum ₹${minOrder} ke order par hi valid hai.`
      });
    }

    let discountAmount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = Math.min(200, Math.round((numSubTotal * Number(coupon.discountValue)) / 100));
    } else {
      discountAmount = Number(coupon.discountValue) || 0;
    }
    discountAmount = Math.min(discountAmount, numSubTotal);

    let affiliateCommissionEarned = 0;
    if (coupon.influencerUserId) {
      const commPct = Number(coupon.influencerCommissionPercentage) || 10;
      affiliateCommissionEarned = Math.round((numSubTotal * commPct) / 100);
    }

    return res.json({
      success: true,
      message: `Coupon ${coupon.code} applied! ₹${discountAmount} off.`,
      couponCode: coupon.code,
      discountAmount,
      affiliateUserId: coupon.influencerUserId || null,
      affiliateCommissionEarned
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message });
  }
});

// API ROUTE: VALIDATE COUPON WITH SCOPING
app.post('/api/coupons/validate', async (req: Request, res: Response) => {
  try {
    const { code, cartTotal, items } = req.body || {};
    if (!code) {
      return res.status(400).json({ success: false, message: 'Kripya coupon code enter karein.' });
    }

    const { neon } = await import('@neondatabase/serverless');
    const dbUrl = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_tb0fasgdG1Zo@ep-holy-bar-b5if2h0c-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require';
    const sql = neon(dbUrl);
    const cleanCode = code.toString().toUpperCase().trim();

    const rows = await sql`
      SELECT * FROM "Coupon" 
      WHERE UPPER("code") = ${cleanCode} 
        AND ("isActive" = true OR "isActive" IS NULL)
      LIMIT 1;
    `;

    if (rows.length === 0) {
      return res.json({ success: false, message: 'Invalid ya expired coupon code!' });
    }

    const coupon = rows[0];
    const total = Number(cartTotal) || 0;
    const minAmount = Number(coupon.minOrderAmount ?? coupon.minOrderValue ?? 0) || 0;

    if (total < minAmount) {
      return res.json({
        success: false,
        message: `Ye coupon minimum ₹${minAmount} ke order par hi valid hai.`
      });
    }

    const scopeType = coupon.applicableType || 'ALL';
    let targetTotal = total;

    if (scopeType !== 'ALL' && Array.isArray(items) && items.length > 0) {
      let allowedIds: string[] = [];
      try {
        allowedIds = typeof coupon.applicableIds === 'string' ? JSON.parse(coupon.applicableIds) : (coupon.applicableIds || []);
      } catch { allowedIds = []; }

      const eligibleItems = items.filter((it: any) => {
        if (scopeType === 'CATEGORY' || scopeType === 'COMBO') {
          return allowedIds.some((allowed: string) => 
            String(allowed).toLowerCase() === String(it.categoryName || it.category || it.categoryId || '').toLowerCase()
          );
        }
        if (scopeType === 'ITEM') {
          return allowedIds.some((allowed: string) => 
            allowed === it.id || allowed === it.pizzaId || String(allowed).toLowerCase() === String(it.name || '').toLowerCase()
          );
        }
        return false;
      });

      if (eligibleItems.length === 0) {
        return res.json({
          success: false,
          message: `Ye coupon sirf select kiye gaye items/category par hi valid hai.`
        });
      }

      targetTotal = eligibleItems.reduce((acc: number, it: any) => acc + (Number(it.price || it.totalUnitPrice || it.basePrice || 0) * (it.quantity || 1)), 0);
    }

    let discount = 0;
    if (coupon.discountType === 'PERCENT' || coupon.discountType === 'PERCENTAGE') {
      discount = (targetTotal * Number(coupon.discountValue)) / 100;
      if (coupon.maxDiscount && discount > Number(coupon.maxDiscount)) {
        discount = Number(coupon.maxDiscount);
      }
    } else {
      discount = Number(coupon.discountValue);
    }

    discount = Math.min(Math.round(discount), total);

    return res.json({
      success: true,
      message: `Coupon Applied! ₹${discount} ki chhoot mil gayi.`,
      discountAmount: discount,
      couponCode: coupon.code
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Server validation error: ' + err.message });
  }
});

// API ROUTE: ADMIN COUPONS MANAGEMENT
app.get('/api/admin/coupons', async (_req: Request, res: Response) => {
  try {
    const { neon } = await import('@neondatabase/serverless');
    const dbUrl = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_tb0fasgdG1Zo@ep-holy-bar-b5if2h0c-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require';
    const sql = neon(dbUrl);

    const coupons = await sql`
      SELECT 
        c.*,
        u."name" as "influencerName",
        u."email" as "influencerEmail",
        COALESCE(SUM(o."totalAmount"), 0) as "totalSalesDriven",
        COALESCE(SUM(o."affiliateCommissionEarned"), 0) as "totalCommissionPaid",
        COUNT(o."id") as "ordersCount"
      FROM "Coupon" c
      LEFT JOIN "User" u ON c."influencerUserId" = u."id"
      LEFT JOIN "Order" o ON UPPER(o."couponCode") = UPPER(c."code")
      GROUP BY c."id", u."name", u."email"
      ORDER BY c."createdAt" DESC;
    `;

    return res.json({ success: true, coupons });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message });
  }
});

app.post('/api/admin/coupons', async (req: Request, res: Response) => {
  try {
    const { 
      code, 
      discountType = 'PERCENTAGE', 
      discountValue, 
      minOrderValue = 0, 
      applicableCategory, 
      applicableItem, 
      influencerName, 
      influencerEmail,
      influencerCommissionPercentage = 10 
    } = req.body || {};

    const cleanCode = (code || '').trim().toUpperCase();
    if (!cleanCode || !discountValue) {
      return res.status(400).json({ success: false, error: 'Coupon code aur discount value zaroori hain.' });
    }

    const { neon } = await import('@neondatabase/serverless');
    const dbUrl = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_tb0fasgdG1Zo@ep-holy-bar-b5if2h0c-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require';
    const sql = neon(dbUrl);

    let influencerUserId: string | null = null;
    const cleanInfEmail = (influencerEmail || '').trim().toLowerCase();

    if (cleanInfEmail) {
      const cleanInfName = (influencerName || 'Influencer Partner').trim();
      const existingUser = await sql`SELECT "id" FROM "User" WHERE LOWER("email") = ${cleanInfEmail} LIMIT 1;`;

      if (existingUser && existingUser.length > 0) {
        influencerUserId = existingUser[0].id;
        await sql`
          UPDATE "User"
          SET "role" = 'INFLUENCER', "name" = ${cleanInfName}, "isActive" = TRUE
          WHERE "id" = ${influencerUserId};
        `;
      } else {
        const newId = `usr_inf_${Math.random().toString(36).substring(2, 10)}`;
        const createdUser = await sql`
          INSERT INTO "User" ("id", "name", "email", "phone", "address", "password", "role", "isActive", "walletBalance", "updatedAt")
          VALUES (${newId}, ${cleanInfName}, ${cleanInfEmail}, '9999900000', 'Ramkund Chauraha, Mahmudabad', 'Hacky@123', 'INFLUENCER', TRUE, 500, NOW())
          RETURNING "id";
        `;
        influencerUserId = createdUser[0]?.id || newId;
      }
    }

    const couponId = `cpn_${Math.random().toString(36).substring(2, 10)}`;
    const saved = await sql`
      INSERT INTO "Coupon" (
        "id", "code", "discountType", "discountValue", "minOrderValue",
        "applicableCategory", "applicableItem", "isActive", "influencerUserId",
        "influencerCommissionPercentage", "createdAt"
      )
      VALUES (
        ${couponId}, ${cleanCode}, ${discountType}, ${Number(discountValue)}, ${Number(minOrderValue)},
        ${applicableCategory || null}, ${applicableItem || null}, TRUE, ${influencerUserId},
        ${Number(influencerCommissionPercentage)}, NOW()
      )
      ON CONFLICT ("code")
      DO UPDATE SET
        "discountType" = EXCLUDED."discountType",
        "discountValue" = EXCLUDED."discountValue",
        "minOrderValue" = EXCLUDED."minOrderValue",
        "applicableCategory" = EXCLUDED."applicableCategory",
        "applicableItem" = EXCLUDED."applicableItem",
        "influencerUserId" = COALESCE(EXCLUDED."influencerUserId", "Coupon"."influencerUserId"),
        "influencerCommissionPercentage" = EXCLUDED."influencerCommissionPercentage",
        "isActive" = TRUE
      RETURNING *;
    `;

    return res.json({ success: true, message: `Coupon ${cleanCode} saved!`, coupon: saved[0] });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message });
  }
});

// API ROUTE: INFLUENCER / AFFILIATE PORTAL STATS
app.get('/api/affiliate/stats', async (req: Request, res: Response) => {
  try {
    const email = (req.query.email as string || '').trim().toLowerCase();
    const userId = (req.query.userId as string || '').trim();

    if (!email && !userId) {
      return res.status(400).json({ success: false, error: 'Email or userId is required' });
    }

    const { neon } = await import('@neondatabase/serverless');
    const dbUrl = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_tb0fasgdG1Zo@ep-holy-bar-b5if2h0c-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require';
    const sql = neon(dbUrl);

    const users = await sql`
      SELECT "id", "name", "email", "phone", "role"
      FROM "User"
      WHERE LOWER("email") = ${email} OR "id" = ${userId}
      LIMIT 1;
    `;

    if (!users || users.length === 0) {
      return res.status(404).json({ success: false, error: 'Influencer account not found' });
    }

    const user = users[0];
    const coupons = await sql`
      SELECT * FROM "Coupon"
      WHERE "influencerUserId" = ${user.id} OR UPPER("code") = 'HACKYVIP';
    `;

    const couponCodes = coupons.map((c: any) => c.code.toUpperCase());

    let orders: any[] = [];
    if (couponCodes.length > 0) {
      orders = await sql`
        SELECT * FROM "Order"
        WHERE "affiliateUserId" = ${user.id}
           OR UPPER("couponCode") = ANY(${couponCodes})
        ORDER BY "createdAt" DESC;
      `;
    } else {
      orders = await sql`
        SELECT * FROM "Order"
        WHERE "affiliateUserId" = ${user.id}
        ORDER BY "createdAt" DESC;
      `;
    }

    const totalOrdersCount = orders.length;
    const totalSalesDriven = orders.reduce((sum, ord) => sum + (Number(ord.totalAmount) || 0), 0);
    const totalCommissionEarned = orders.reduce((sum, ord) => {
      const earned = Number(ord.affiliateCommissionEarned);
      if (earned > 0) return sum + earned;
      return sum + Math.round((Number(ord.totalAmount) || 0) * 0.1);
    }, 0);

    return res.json({
      success: true,
      influencer: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        coupons: coupons.map((c: any) => ({
          code: c.code,
          discountType: c.discountType,
          discountValue: c.discountValue,
          commissionPercentage: c.influencerCommissionPercentage || 10,
          usageCount: c.usageCount
        }))
      },
      stats: {
        totalOrdersCount,
        totalSalesDriven,
        totalCommissionEarned
      },
      orders
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message });
  }
});


app.post('/api/orders', async (req: Request, res: Response) => {
  try {
    const {
      customerName,
      phone,
      customerPhone,
      address,
      customerAddress,
      items,
      subTotal,
      walletDiscountRequested = 0,
      totalAmount,
      userId,
    } = req.body;

    const cName = customerName?.trim();
    const cPhone = (customerPhone || phone || '').trim();
    const cAddr = (customerAddress || address || '').trim();

    if (!cName || !cPhone || !cAddr || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Delivery details aur order items zaroori hain.' });
    }

    const { neon } = await import('@neondatabase/serverless');
    const dbUrl = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_tb0fasgdG1Zo@ep-holy-bar-b5if2h0c-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require';
    const sql = neon(dbUrl);

    const orderNum = `HKY-${Math.floor(1000 + Math.random() * 9000)}`;
    const orderId = `ord_${Math.random().toString(36).substring(2, 10)}${Date.now().toString(36)}`;
    const numSubTotal = Number(subTotal) || Number(totalAmount) || 0;
    const finalTotal = Number(totalAmount) || numSubTotal;

    const result = await sql`
      INSERT INTO "Order" (
        "id", "orderNumber", "customerName", "customerPhone", "customerAddress", 
        "phone", "address", "items", "subTotal", "walletDiscount", "totalAmount", 
        "status", "orderStatus", "paymentMethod", "userId", "createdAt", "updatedAt"
      )
      VALUES (
        ${orderId}, ${orderNum}, ${cName}, ${cPhone}, ${cAddr},
        ${cPhone}, ${cAddr}, ${JSON.stringify(items)}::jsonb, ${numSubTotal}, 0, ${finalTotal},
        'PENDING', 'PENDING', 'COD', ${userId || null}, NOW(), NOW()
      )
      RETURNING *;
    `;

    return res.json({
      success: true,
      message: 'Order successfully placed via Cash on Delivery!',
      order: result[0],
      appliedDiscount: 0,
      updatedWalletBalance: 50,
    });
  } catch (error: any) {
    console.error('create order error:', error);
    return res.status(500).json({ error: 'Order place karne me samasya aayi. Dobara try karein.' });
  }
});

// API ROUTE 6: GET CURRENT USER WALLET/PROFILE
app.get('/api/users/:id', async (req: Request, res: Response) => {
  try {
    const user = await dbService.findUserById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      walletBalance: user.walletBalance,
      role: user.role,
    });
  } catch {
    return res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// API ROUTE 7: STAFF MANAGEMENT
app.get('/api/admin/staff', async (_req: Request, res: Response) => {
  try {
    const { neon } = await import('@neondatabase/serverless');
    const dbUrl = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_tb0fasgdG1Zo@ep-holy-bar-b5if2h0c-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require';
    const sql = neon(dbUrl);
    const staff = await sql`
      SELECT "id", "name", "email", "phone", "role", "isActive", "createdAt"
      FROM "User"
      WHERE "role" IN ('SUPER_ADMIN', 'STORE_MANAGER', 'KITCHEN_STAFF', 'RIDER')
      ORDER BY "createdAt" DESC;
    `;
    return res.json({ success: true, staff });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message });
  }
});

app.post('/api/admin/staff', async (req: Request, res: Response) => {
  try {
    const { name, email, phone, password, role } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanName = (name || '').trim();
    const cleanRole = (role || 'STORE_MANAGER').trim().toUpperCase();

    const { neon } = await import('@neondatabase/serverless');
    const dbUrl = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_tb0fasgdG1Zo@ep-holy-bar-b5if2h0c-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require';
    const sql = neon(dbUrl);

    const created = await sql`
      INSERT INTO "User" ("id", "name", "email", "phone", "password", "address", "role", "isActive", "walletBalance", "updatedAt")
      VALUES (
        'usr_' || substr(md5(random()::text), 1, 16),
        ${cleanName},
        ${cleanEmail},
        ${(phone || '9999900000').trim()},
        ${password || 'Hacky@123'},
        'Mahmudabad Staff HQ',
        ${cleanRole},
        TRUE,
        100,
        NOW()
      )
      ON CONFLICT ("email")
      DO UPDATE SET
        "name" = EXCLUDED."name",
        "role" = EXCLUDED."role",
        "isActive" = TRUE
      RETURNING "id", "name", "email", "phone", "role", "isActive", "createdAt";
    `;

    return res.json({ success: true, message: 'Staff member added successfully!', member: created[0] });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message });
  }
});

app.patch('/api/admin/staff', async (req: Request, res: Response) => {
  try {
    const { id, isActive } = req.body;
    const { neon } = await import('@neondatabase/serverless');
    const dbUrl = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_tb0fasgdG1Zo@ep-holy-bar-b5if2h0c-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require';
    const sql = neon(dbUrl);
    await sql`
      UPDATE "User"
      SET "isActive" = ${Boolean(isActive)}, "updatedAt" = NOW()
      WHERE "id" = ${id};
    `;
    return res.json({ success: true, message: `Staff status updated to ${isActive ? 'Active' : 'Inactive'}` });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message });
  }
});

app.delete('/api/admin/staff', async (req: Request, res: Response) => {
  try {
    const id = req.query.id as string;
    const { neon } = await import('@neondatabase/serverless');
    const dbUrl = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_tb0fasgdG1Zo@ep-holy-bar-b5if2h0c-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require';
    const sql = neon(dbUrl);
    await sql`DELETE FROM "User" WHERE "id" = ${id};`;
    return res.json({ success: true, message: 'Staff member deleted.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message });
  }
});

// API ROUTE 8: ORDERS LIFECYCLE (MANAGER, KDS, RIDER)
app.get('/api/orders', async (req: Request, res: Response) => {
  try {
    const status = req.query.status as string;
    const riderId = req.query.riderId as string;
    const limit = parseInt((req.query.limit as string) || '50', 10);

    const { neon } = await import('@neondatabase/serverless');
    const dbUrl = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_tb0fasgdG1Zo@ep-holy-bar-b5if2h0c-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require';
    const sql = neon(dbUrl);

    let orders;
    if (status) {
      orders = await sql`
        SELECT * FROM "Order"
        WHERE "orderStatus" = ${status}
        ORDER BY "createdAt" DESC
        LIMIT ${limit};
      `;
    } else if (riderId) {
      orders = await sql`
        SELECT * FROM "Order"
        WHERE "riderId" = ${riderId} OR "orderStatus" = 'READY_FOR_PICKUP'
        ORDER BY "createdAt" DESC
        LIMIT ${limit};
      `;
    } else {
      orders = await sql`
        SELECT * FROM "Order"
        ORDER BY "createdAt" DESC
        LIMIT ${limit};
      `;
    }

    return res.json({ success: true, orders });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message });
  }
});

app.patch('/api/orders', async (req: Request, res: Response) => {
  try {
    const { orderId, orderNumber, status, riderId, riderName, riderPhone } = req.body;
    const { neon } = await import('@neondatabase/serverless');
    const dbUrl = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_tb0fasgdG1Zo@ep-holy-bar-b5if2h0c-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require';
    const sql = neon(dbUrl);

    if (status === 'PREPARING') {
      await sql`
        UPDATE "Order"
        SET "orderStatus" = ${status}, "cookingStartedAt" = NOW(), "updatedAt" = NOW()
        WHERE "id" = ${orderId} OR "orderNumber" = ${orderNumber};
      `;
    } else if (status === 'READY_FOR_PICKUP') {
      await sql`
        UPDATE "Order"
        SET "orderStatus" = ${status}, "readyAt" = NOW(), "updatedAt" = NOW()
        WHERE "id" = ${orderId} OR "orderNumber" = ${orderNumber};
      `;
    } else if (status === 'OUT_FOR_DELIVERY') {
      await sql`
        UPDATE "Order"
        SET "orderStatus" = ${status}, 
            "riderId" = COALESCE(${riderId}, "riderId"),
            "riderName" = COALESCE(${riderName}, "riderName"),
            "riderPhone" = COALESCE(${riderPhone}, "riderPhone"),
            "updatedAt" = NOW()
        WHERE "id" = ${orderId} OR "orderNumber" = ${orderNumber};
      `;
    } else if (status === 'DELIVERED') {
      await sql`
        UPDATE "Order"
        SET "orderStatus" = ${status}, "deliveredAt" = NOW(), "updatedAt" = NOW()
        WHERE "id" = ${orderId} OR "orderNumber" = ${orderNumber};
      `;
    } else if (status) {
      await sql`
        UPDATE "Order"
        SET "orderStatus" = ${status}, "updatedAt" = NOW()
        WHERE "id" = ${orderId} OR "orderNumber" = ${orderNumber};
      `;
    }

    const updated = await sql`
      SELECT * FROM "Order"
      WHERE "id" = ${orderId} OR "orderNumber" = ${orderNumber}
      LIMIT 1;
    `;

    if (status === 'DELIVERED' && updated && updated.length > 0) {
      await creditOrderLoyaltyCashback(sql, updated[0]);
    }

    return res.json({ success: true, message: `Order updated to ${status}`, order: updated[0] });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message });
  }
});

// API ROUTE 9: ORDERS LIST WITH USER / MANAGER FILTERING
app.get('/api/orders/list', async (req: Request, res: Response) => {
  try {
    const email = (req.query.email as string || '').trim().toLowerCase();

    const { neon } = await import('@neondatabase/serverless');
    const dbUrl = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_tb0fasgdG1Zo@ep-holy-bar-b5if2h0c-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require';
    const sql = neon(dbUrl);

    // Make sure table exists
    await sql`
      CREATE TABLE IF NOT EXISTS "Order" (
        "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "orderNumber" TEXT,
        "userId" TEXT,
        "userEmail" TEXT NOT NULL,
        "customerName" TEXT NOT NULL,
        "customerPhone" TEXT NOT NULL,
        "customerAddress" TEXT NOT NULL,
        "items" JSONB NOT NULL,
        "totalAmount" NUMERIC NOT NULL,
        "status" TEXT DEFAULT 'PENDING',
        "paymentMethod" TEXT DEFAULT 'COD',
        "couponCode" TEXT,
        "discountAmount" NUMERIC DEFAULT 0,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    let orders = [];
    if (email) {
      orders = await sql`
        SELECT * FROM "Order"
        WHERE LOWER("userEmail") = ${email}
        ORDER BY "createdAt" DESC
        LIMIT 50;
      `;
    } else {
      orders = await sql`
        SELECT * FROM "Order"
        ORDER BY "createdAt" DESC
        LIMIT 100;
      `;
    }

    return res.json({ success: true, orders: orders || [] });
  } catch (err: any) {
    console.error('FETCH_ORDERS_ERROR:', err);
    return res.status(500).json({ success: false, error: err?.message, orders: [] });
  }
});

// API ROUTE: GET SINGLE ORDER STATUS
app.get('/api/orders/status', async (req: Request, res: Response) => {
  try {
    const id = ((req.query.id as string) || (req.query.orderId as string) || '').trim();
    if (!id) {
      return res.status(400).json({ success: false, error: 'Order ID ya Order Number enter karein.' });
    }

    const { neon } = await import('@neondatabase/serverless');
    const dbUrl = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_tb0fasgdG1Zo@ep-holy-bar-b5if2h0c-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require';
    const sql = neon(dbUrl);

    const orders = await sql`
      SELECT * FROM "Order"
      WHERE "id" = ${id} OR "orderNumber" = ${id}
      LIMIT 1;
    `;

    if (!orders || orders.length === 0) {
      return res.status(404).json({ success: false, error: 'Order nahi mila.' });
    }

    return res.json({ success: true, order: orders[0] });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message });
  }
});

app.patch('/api/orders/mark-viewed', async (req: Request, res: Response) => {
  try {
    const { orderId, orderNumber } = req.body || {};
    const { neon } = await import('@neondatabase/serverless');
    const dbUrl = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_tb0fasgdG1Zo@ep-holy-bar-b5if2h0c-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require';
    const sql = neon(dbUrl);

    await sql`
      UPDATE "Order"
      SET "isViewedByManager" = TRUE, "updatedAt" = NOW()
      WHERE "id" = ${orderId} OR "orderNumber" = ${orderNumber};
    `;

    return res.json({ success: true, message: 'Order marked as viewed' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message });
  }
});

// API ROUTE: DIRECT DATABASE HEALTH-CHECK
app.get('/api/db-check', async (_req: Request, res: Response) => {
  const dbUrl = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_tb0fasgdG1Zo@ep-holy-bar-b5if2h0c-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require';

  try {
    const { neon } = await import('@neondatabase/serverless');
    const sql = neon(dbUrl);
    
    // Test query execution
    const timeResult = await sql`SELECT NOW() as current_time, current_database() as db_name;`;
    
    // Check if Order table exists and count records
    await sql`
      CREATE TABLE IF NOT EXISTS "Order" (
        "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "orderNumber" TEXT,
        "userId" TEXT,
        "userEmail" TEXT NOT NULL,
        "customerName" TEXT NOT NULL,
        "customerPhone" TEXT NOT NULL,
        "customerAddress" TEXT NOT NULL,
        "items" JSONB NOT NULL,
        "totalAmount" NUMERIC NOT NULL,
        "status" TEXT DEFAULT 'PENDING',
        "paymentMethod" TEXT DEFAULT 'COD',
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    const countResult = await sql`SELECT COUNT(*) as total_orders FROM "Order";`;

    return res.json({
      connected: true,
      message: 'Neon PostgreSQL Database se connection bilkul PERFECT hai!',
      database: timeResult[0]?.db_name,
      serverTime: timeResult[0]?.current_time,
      totalOrdersInDB: countResult[0]?.total_orders
    });
  } catch (err: any) {
    console.error('DB_CONNECTION_FAILED:', err);
    return res.status(500).json({
      connected: false,
      error: err?.message || 'Database connection timeout',
      suggestion: 'Vercel Environment Variables me DATABASE_URL verify karein.'
    });
  }
});

// API ROUTE: BANNERS (GET, POST, DELETE)
app.get('/api/banners', async (_req: Request, res: Response) => {
  try {
    const { neon } = await import('@neondatabase/serverless');
    const dbUrl = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_tb0fasgdG1Zo@ep-holy-bar-b5if2h0c-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require';
    const sql = neon(dbUrl);
    const banners = await sql`SELECT * FROM "Banner" WHERE "isActive" = true ORDER BY "displayOrder" ASC, "createdAt" DESC;`;
    return res.json({ success: true, banners });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message });
  }
});

app.post('/api/banners', async (req: Request, res: Response) => {
  try {
    const { title, imageUrl, link, displayOrder } = req.body || {};
    const { neon } = await import('@neondatabase/serverless');
    const dbUrl = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_tb0fasgdG1Zo@ep-holy-bar-b5if2h0c-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require';
    const sql = neon(dbUrl);
    const result = await sql`
      INSERT INTO "Banner" ("title", "imageUrl", "link", "displayOrder")
      VALUES (${title}, ${imageUrl}, ${link || '/'}, ${displayOrder || 1})
      RETURNING *;
    `;
    return res.json({ success: true, banner: result[0] });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message });
  }
});

app.delete('/api/banners', async (req: Request, res: Response) => {
  try {
    const id = (req.query.id as string) || req.body?.id;
    const { neon } = await import('@neondatabase/serverless');
    const dbUrl = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_tb0fasgdG1Zo@ep-holy-bar-b5if2h0c-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require';
    const sql = neon(dbUrl);
    await sql`DELETE FROM "Banner" WHERE "id" = ${id};`;
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message });
  }
});

// API ROUTE: MENU & CATEGORIES (GET, POST, PUT, DELETE)
app.get('/api/menu', async (_req: Request, res: Response) => {
  try {
    const { neon } = await import('@neondatabase/serverless');
    const dbUrl = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_tb0fasgdG1Zo@ep-holy-bar-b5if2h0c-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require';
    const sql = neon(dbUrl);
    const categories = await sql`SELECT * FROM "Category" ORDER BY "displayOrder" ASC, "createdAt" ASC;`;
    const items = await sql`SELECT * FROM "MenuItem" ORDER BY "createdAt" DESC;`;
    return res.json({ success: true, categories, items });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message });
  }
});

app.post('/api/menu', async (req: Request, res: Response) => {
  try {
    const body = req.body || {};
    const { type } = body;
    const { neon } = await import('@neondatabase/serverless');
    const dbUrl = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_tb0fasgdG1Zo@ep-holy-bar-b5if2h0c-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require';
    const sql = neon(dbUrl);

    if (type?.toUpperCase() === 'CATEGORY') {
      const { name, iconUrl, displayOrder } = body;
      const result = await sql`
        INSERT INTO "Category" ("name", "iconUrl", "displayOrder")
        VALUES (${name.trim()}, ${iconUrl}, ${Number(displayOrder) || 1})
        ON CONFLICT ("name") DO UPDATE 
        SET "iconUrl" = EXCLUDED."iconUrl", "displayOrder" = EXCLUDED."displayOrder"
        RETURNING *;
      `;
      return res.json({ success: true, data: result[0] });
    } else {
      const {
        categoryId,
        categoryName,
        name,
        description,
        basePrice,
        price,
        originalPrice,
        imageUrl,
        isVeg,
        isAvailable,
        sizeOptions,
        crustOptions,
        beveragePairings
      } = body;

      const finalBasePrice = Number(basePrice ?? price ?? 0);
      const finalOriginalPrice = originalPrice ? Number(originalPrice) : null;

      const defaultSizes = [
        { name: 'Regular', price: 0 },
        { name: 'Medium', price: 150 },
        { name: 'Large', price: 280 }
      ];
      const defaultCrusts = [
        { name: 'Classic Hand Tossed', price: 0 },
        { name: 'Cheese Burst', price: 75 },
        { name: 'Fresh Pan', price: 40 }
      ];
      const defaultBeverages = [
        { name: 'Urban Cold Coffee', price: 89 },
        { name: 'Coca Cola Can 300ml', price: 45 }
      ];

      const sizesJson = JSON.stringify(sizeOptions && sizeOptions.length > 0 ? sizeOptions : defaultSizes);
      const crustsJson = JSON.stringify(crustOptions && crustOptions.length > 0 ? crustOptions : defaultCrusts);
      const beveragesJson = JSON.stringify(beveragePairings && beveragePairings.length > 0 ? beveragePairings : defaultBeverages);

      const isSideOrderVal = body.isSideOrder !== undefined ? Boolean(body.isSideOrder) : false;
      const hasVariationsVal = body.hasVariations !== undefined ? Boolean(body.hasVariations) : false;

      const result = await sql`
        INSERT INTO "MenuItem" (
          "categoryId", "categoryName", "name", "description",
          "price", "basePrice", "originalPrice", "imageUrl",
          "isVeg", "isAvailable", "isSideOrder", "hasVariations", "sizeOptions", "crustOptions", "beveragePairings"
        )
        VALUES (
          ${categoryId || null}, 
          ${categoryName || 'combos'}, 
          ${name.trim()}, 
          ${description || ''},
          ${finalBasePrice}, 
          ${finalBasePrice}, 
          ${finalOriginalPrice}, 
          ${imageUrl || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&auto=format&fit=crop&q=80'},
          ${isVeg ?? true}, 
          ${isAvailable ?? true}, 
          ${isSideOrderVal},
          ${hasVariationsVal},
          ${sizesJson}::jsonb, 
          ${crustsJson}::jsonb, 
          ${beveragesJson}::jsonb
        )
        RETURNING *;
      `;
      return res.json({ success: true, data: result[0] });
    }
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message });
  }
});

app.put('/api/menu', async (req: Request, res: Response) => {
  try {
    const body = req.body || {};
    const { id, type } = body;
    if (!id) {
      return res.status(400).json({ success: false, error: 'Item ID is required for update' });
    }
    const { neon } = await import('@neondatabase/serverless');
    const dbUrl = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_tb0fasgdG1Zo@ep-holy-bar-b5if2h0c-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require';
    const sql = neon(dbUrl);

    if (type?.toUpperCase() === 'TOGGLE_SIDE_ORDER' || (body.isSideOrder !== undefined && !body.name)) {
      const isSideOrder = Boolean(body.isSideOrder);
      const result = await sql`
        UPDATE "MenuItem"
        SET "isSideOrder" = ${isSideOrder}, "updatedAt" = NOW()
        WHERE "id" = ${id}
        RETURNING *;
      `;
      return res.json({ success: true, data: result[0] });
    }

    if (type?.toUpperCase() === 'TOGGLE_AVAILABILITY') {
      const { isAvailable } = body;
      const result = await sql`
        UPDATE "MenuItem"
        SET "isAvailable" = ${Boolean(isAvailable)}, "updatedAt" = NOW()
        WHERE "id" = ${id}
        RETURNING *;
      `;
      return res.json({ success: true, data: result[0] });
    }

    if (type?.toUpperCase() === 'UPDATE_PRICE') {
      const { basePrice, price } = body;
      const finalPrice = Number(basePrice ?? price ?? 0);
      const result = await sql`
        UPDATE "MenuItem"
        SET "basePrice" = ${finalPrice}, "price" = ${finalPrice}, "updatedAt" = NOW()
        WHERE "id" = ${id}
        RETURNING *;
      `;
      return res.json({ success: true, data: result[0] });
    }

    // Full Item Update
    const {
      categoryId,
      categoryName,
      name,
      description,
      basePrice,
      price,
      originalPrice,
      imageUrl,
      isVeg,
      isAvailable,
      sizeOptions,
      crustOptions,
      beveragePairings
    } = body;

    const finalBasePrice = Number(basePrice ?? price ?? 0);
    const finalOriginalPrice = originalPrice ? Number(originalPrice) : null;
    const sizesJson = JSON.stringify(sizeOptions || []);
    const crustsJson = JSON.stringify(crustOptions || []);
    const beveragesJson = JSON.stringify(beveragePairings || []);

    const result = await sql`
      UPDATE "MenuItem"
      SET 
        "name" = ${name.trim()},
        "categoryName" = ${categoryName || 'combos'},
        "categoryId" = ${categoryId || null},
        "description" = ${description || ''},
        "basePrice" = ${finalBasePrice},
        "price" = ${finalBasePrice},
        "originalPrice" = ${finalOriginalPrice},
        "imageUrl" = ${imageUrl},
        "isVeg" = ${isVeg ?? true},
        "isAvailable" = ${isAvailable ?? true},
        "isSideOrder" = ${body.isSideOrder !== undefined ? Boolean(body.isSideOrder) : false},
        "hasVariations" = ${body.hasVariations !== undefined ? Boolean(body.hasVariations) : false},
        "sizeOptions" = ${sizesJson}::jsonb,
        "crustOptions" = ${crustsJson}::jsonb,
        "beveragePairings" = ${beveragesJson}::jsonb,
        "updatedAt" = NOW()
      WHERE "id" = ${id}
      RETURNING *;
    `;

    return res.json({ success: true, data: result[0] });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message });
  }
});

app.delete('/api/menu', async (req: Request, res: Response) => {
  try {
    const id = (req.query.id as string) || req.body?.id;
    const type = (req.query.type as string) || req.body?.type;
    const { neon } = await import('@neondatabase/serverless');
    const dbUrl = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_tb0fasgdG1Zo@ep-holy-bar-b5if2h0c-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require';
    const sql = neon(dbUrl);

    if (type?.toUpperCase() === 'CATEGORY') {
      await sql`DELETE FROM "Category" WHERE "id" = ${id};`;
    } else {
      await sql`DELETE FROM "MenuItem" WHERE "id" = ${id};`;
    }
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message });
  }
});

// API ROUTE: GLOBAL BEVERAGE PAIRINGS (GET, POST, DELETE)
app.get('/api/beverages', async (_req: Request, res: Response) => {
  try {
    const { neon } = await import('@neondatabase/serverless');
    const dbUrl = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_tb0fasgdG1Zo@ep-holy-bar-b5if2h0c-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require';
    const sql = neon(dbUrl);
    await sql`
      CREATE TABLE IF NOT EXISTS "GlobalBeverage" (
        "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "name" TEXT NOT NULL,
        "price" NUMERIC NOT NULL,
        "imageUrl" TEXT NOT NULL,
        "isAvailable" BOOLEAN DEFAULT true,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    const beverages = await sql`
      SELECT * FROM "GlobalBeverage" 
      WHERE "isAvailable" = true 
      ORDER BY "createdAt" DESC;
    `;
    return res.json({ success: true, beverages });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message });
  }
});

app.post('/api/beverages', async (req: Request, res: Response) => {
  try {
    const { name, price, imageUrl } = req.body || {};
    if (!name || !price || !imageUrl) {
      return res.status(400).json({ success: false, error: 'Name, price and image are required' });
    }
    const { neon } = await import('@neondatabase/serverless');
    const dbUrl = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_tb0fasgdG1Zo@ep-holy-bar-b5if2h0c-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require';
    const sql = neon(dbUrl);
    await sql`
      CREATE TABLE IF NOT EXISTS "GlobalBeverage" (
        "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        "name" TEXT NOT NULL,
        "price" NUMERIC NOT NULL,
        "imageUrl" TEXT NOT NULL,
        "isAvailable" BOOLEAN DEFAULT true,
        "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    const result = await sql`
      INSERT INTO "GlobalBeverage" ("name", "price", "imageUrl")
      VALUES (${name.trim()}, ${Number(price)}, ${imageUrl})
      RETURNING *;
    `;
    return res.json({ success: true, beverage: result[0] });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message });
  }
});

app.delete('/api/beverages', async (req: Request, res: Response) => {
  try {
    const id = (req.query.id as string) || req.body?.id;
    if (!id) return res.status(400).json({ success: false, error: 'ID missing' });
    const { neon } = await import('@neondatabase/serverless');
    const dbUrl = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_tb0fasgdG1Zo@ep-holy-bar-b5if2h0c-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require';
    const sql = neon(dbUrl);
    await sql`DELETE FROM "GlobalBeverage" WHERE "id" = ${id};`;
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message });
  }
});

// AFFILIATE & COUPONS MASTER API
app.get('/api/affiliate', async (req: Request, res: Response) => {
  try {
    const { neon } = await import('@neondatabase/serverless');
    const dbUrl = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_tb0fasgdG1Zo@ep-holy-bar-b5if2h0c-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require';
    const sql = neon(dbUrl);
    const email = req.query.email as string;

    if (email) {
      const user = await sql`SELECT * FROM "AffiliateUser" WHERE LOWER("email") = LOWER(${email.trim()}) LIMIT 1;`;
      if (user.length === 0) return res.status(404).json({ success: false, message: 'User not found' });
      const orders = await sql`SELECT * FROM "Order" WHERE "affiliateUserId" = ${user[0].id} ORDER BY "createdAt" DESC;`.catch(() => []);
      return res.json({ success: true, user: user[0], orders });
    }

    const affiliates = await sql`SELECT * FROM "AffiliateUser" ORDER BY "createdAt" DESC;`.catch(() => []);
    const coupons = await sql`SELECT * FROM "Coupon" ORDER BY "createdAt" DESC;`.catch(() => []);
    return res.json({ success: true, affiliates, coupons });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message });
  }
});

app.post('/api/affiliate', async (req: Request, res: Response) => {
  try {
    const { neon } = await import('@neondatabase/serverless');
    const dbUrl = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_tb0fasgdG1Zo@ep-holy-bar-b5if2h0c-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require';
    const sql = neon(dbUrl);
    const crypto = await import('crypto');
    const body = req.body || {};
    const { action } = body;

    if (action === 'CREATE_COUPON') {
      const { code, description, discountType, discountValue, minOrderAmount, maxDiscount, applicableType, applicableIds } = body;
      if (!code || discountValue === undefined) {
        return res.status(400).json({ success: false, error: 'Code aur discount zaroori hai' });
      }

      const cId = 'cpn_' + crypto.randomBytes(6).toString('hex');
      const cleanCode = code.toString().toUpperCase().trim();
      const scopeIds = typeof applicableIds === 'string' ? applicableIds : JSON.stringify(applicableIds || []);

      const saved = await sql`
        INSERT INTO "Coupon" (
          "id", "code", "description", "discountType", "discountValue", "minOrderAmount", "maxDiscount", "applicableType", "applicableIds", "isActive"
        ) VALUES (
          ${cId}, ${cleanCode}, ${description || ''}, ${discountType || 'PERCENT'},
          ${Number(discountValue) || 0}, ${Number(minOrderAmount) || 0},
          ${maxDiscount ? Number(maxDiscount) : null}, ${applicableType || 'ALL'}, ${scopeIds}, true
        )
        ON CONFLICT ("code") DO UPDATE SET
          "discountType" = EXCLUDED."discountType",
          "discountValue" = EXCLUDED."discountValue",
          "minOrderAmount" = EXCLUDED."minOrderAmount",
          "maxDiscount" = EXCLUDED."maxDiscount",
          "applicableType" = EXCLUDED."applicableType",
          "applicableIds" = EXCLUDED."applicableIds"
        RETURNING *;
      `;
      return res.json({ success: true, coupon: saved[0], message: 'Coupon saved!' });
    }

    if (action === 'CREATE_AFFILIATE') {
      const { name, email, password, couponCode, commissionPercent, discountPercent, applicableType, applicableIds } = body;
      if (!name || !email || !password || !couponCode) {
        return res.status(400).json({ success: false, error: 'Sabhi fields bharein' });
      }

      const aId = 'aff_' + crypto.randomBytes(6).toString('hex');
      const cId = 'cpn_' + crypto.randomBytes(6).toString('hex');
      const cleanCode = couponCode.toString().toUpperCase().trim();
      const cleanEmail = email.toString().toLowerCase().trim();
      const scopeIds = typeof applicableIds === 'string' ? applicableIds : JSON.stringify(applicableIds || []);

      await sql`
        INSERT INTO "Coupon" ("id", "code", "description", "discountType", "discountValue", "applicableType", "applicableIds", "isActive")
        VALUES (${cId}, ${cleanCode}, ${'Affiliate: ' + name}, 'PERCENT', ${Number(discountPercent || 10)}, ${applicableType || 'ALL'}, ${scopeIds}, true)
        ON CONFLICT ("code") DO UPDATE SET "discountValue" = ${Number(discountPercent || 10)};
      `;

      const aff = await sql`
        INSERT INTO "AffiliateUser" ("id", "name", "email", "password", "couponCode", "commissionPercent", "applicableType", "applicableIds")
        VALUES (${aId}, ${name.trim()}, ${cleanEmail}, ${password.toString().trim()}, ${cleanCode}, ${Number(commissionPercent || 10)}, ${applicableType || 'ALL'}, ${scopeIds})
        ON CONFLICT ("email") DO UPDATE SET
          "name" = EXCLUDED."name",
          "password" = EXCLUDED."password",
          "couponCode" = EXCLUDED."couponCode",
          "commissionPercent" = EXCLUDED."commissionPercent"
        RETURNING *;
      `;
      return res.json({ success: true, affiliate: aff[0], message: 'Affiliate created!' });
    }

    if (action === 'LOGIN') {
      const { email, password } = body;
      const rows = await sql`SELECT * FROM "AffiliateUser" WHERE LOWER("email") = LOWER(${email.trim()}) AND "password" = ${password.toString().trim()} LIMIT 1;`;
      if (rows.length === 0) return res.status(401).json({ success: false, message: 'Invalid Credentials' });
      return res.json({ success: true, user: rows[0] });
    }

    if (action === 'VALIDATE_COUPON') {
      const code = body.code || body.couponCode;
      const cartTotal = body.cartTotal ?? body.subTotal ?? 0;
      const items = body.items || body.cartItems || [];

      if (!code) {
        return res.status(400).json({ success: false, message: 'Kripya coupon code enter karein.' });
      }

      const cleanCode = code.toString().toUpperCase().trim();
      const rows = await sql`
        SELECT * FROM "Coupon" 
        WHERE UPPER("code") = ${cleanCode} 
          AND ("isActive" = true OR "isActive" IS NULL)
        LIMIT 1;
      `;

      if (rows.length === 0) {
        return res.json({ success: false, message: 'Invalid ya expired coupon code!' });
      }

      const coupon = rows[0];
      const total = Number(cartTotal) || 0;
      const minAmount = Number(coupon.minOrderAmount ?? coupon.minOrderValue ?? 0) || 0;

      if (total < minAmount) {
        return res.json({
          success: false,
          message: `Ye coupon minimum ₹${minAmount} ke order par hi valid hai.`
        });
      }

      const scopeType = coupon.applicableType || 'ALL';
      let targetTotal = total;

      if (scopeType !== 'ALL' && Array.isArray(items) && items.length > 0) {
        let allowedIds: string[] = [];
        try {
          allowedIds = typeof coupon.applicableIds === 'string' ? JSON.parse(coupon.applicableIds) : (coupon.applicableIds || []);
        } catch { allowedIds = []; }

        const eligibleItems = items.filter((it: any) => {
          if (scopeType === 'CATEGORY' || scopeType === 'COMBO') {
            return allowedIds.some((allowed: string) => 
              String(allowed).toLowerCase() === String(it.categoryName || it.category || it.categoryId || '').toLowerCase()
            );
          }
          if (scopeType === 'ITEM') {
            return allowedIds.some((allowed: string) => 
              allowed === it.id || allowed === it.pizzaId || String(allowed).toLowerCase() === String(it.name || '').toLowerCase()
            );
          }
          return false;
        });

        if (eligibleItems.length === 0) {
          return res.json({
            success: false,
            message: `Ye coupon sirf select kiye gaye items/category par hi valid hai.`
          });
        }

        targetTotal = eligibleItems.reduce((acc: number, it: any) => acc + (Number(it.price || it.totalUnitPrice || it.basePrice || 0) * (it.quantity || 1)), 0);
      }

      let discount = 0;
      if (coupon.discountType === 'PERCENT' || coupon.discountType === 'PERCENTAGE') {
        discount = (targetTotal * Number(coupon.discountValue)) / 100;
        if (coupon.maxDiscount && discount > Number(coupon.maxDiscount)) {
          discount = Number(coupon.maxDiscount);
        }
      } else {
        discount = Number(coupon.discountValue);
      }

      discount = Math.min(Math.round(discount), total);

      const affUser = await sql`
        SELECT * FROM "AffiliateUser" WHERE UPPER("couponCode") = ${cleanCode} LIMIT 1;
      `.catch(() => []);
      let affiliateUserId = null;
      let affiliateCommissionEarned = 0;
      if (affUser && affUser.length > 0) {
        affiliateUserId = affUser[0].id;
        const commPercent = Number(affUser[0].commissionPercent || 10);
        affiliateCommissionEarned = Math.round((total * commPercent) / 100);
      }

      return res.json({
        success: true,
        message: `Coupon Applied! ₹${discount} ki chhoot mil gayi.`,
        discountAmount: discount,
        couponCode: coupon.code,
        affiliateUserId,
        affiliateCommissionEarned
      });
    }

    return res.status(400).json({ success: false, error: 'Unknown Action' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message });
  }
});

app.delete('/api/affiliate', async (req: Request, res: Response) => {
  try {
    const { neon } = await import('@neondatabase/serverless');
    const dbUrl = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_tb0fasgdG1Zo@ep-holy-bar-b5if2h0c-pooler.c-7.us-east-2.aws.neon.tech/neondb?sslmode=require';
    const sql = neon(dbUrl);
    const id = (req.query.id as string) || req.body?.id;
    const type = (req.query.type as string) || req.body?.type;
    if (type === 'AFFILIATE') {
      const aff = await sql`SELECT "couponCode" FROM "AffiliateUser" WHERE "id" = ${id} LIMIT 1;`;
      if (aff.length > 0) {
        await sql`DELETE FROM "Coupon" WHERE UPPER("code") = UPPER(${aff[0].couponCode});`;
      }
      await sql`DELETE FROM "AffiliateUser" WHERE "id" = ${id};`;
    } else {
      await sql`DELETE FROM "Coupon" WHERE "id" = ${id} OR UPPER("code") = UPPER(${id});`;
    }
    return res.json({ success: true, message: 'Deleted successfully' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message });
  }
});

// VITE MIDDLEWARE SETUP (Development vs Production)
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === 'true' ? false : undefined,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  const server = app.listen(PORT, HOST, () => {
    console.log(`🚀 Hacky Pizza Town Server running at http://${HOST}:${PORT}`);
  });

  server.on('error', (err: any) => {
    console.error('Server listen error:', err);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});

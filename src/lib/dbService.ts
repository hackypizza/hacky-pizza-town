import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

// In-memory fallback in case the Neon database connection is not yet configured or is connecting
interface MemoryUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  password?: string | null;
  role: string;
  walletBalance: number;
  createdAt: Date;
  updatedAt: Date;
}

interface MemoryOtp {
  id: string;
  identifier: string;
  otp: string;
  type: string;
  expiresAt: Date;
  createdAt: Date;
}

interface MemoryOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  address: string;
  items: unknown;
  subTotal: number;
  walletDiscount: number;
  totalAmount: number;
  paymentMethod: string;
  orderStatus: string;
  userId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const memoryUsers: MemoryUser[] = [];


const memoryOtps: MemoryOtp[] = [];
const memoryOrders: MemoryOrder[] = [];
let orderCounter = 1000;

export const dbService = {
  // --- USER OPERATIONS ---
  async findUserByIdentifier(identifier: string) {
    const clean = identifier.trim().toLowerCase();
    try {
      const user = await prisma.user.findFirst({
        where: {
          OR: [{ email: clean }, { phone: identifier.trim() }],
        },
      });
      if (user) return user;
    } catch {
      // Prisma offline or connection error - fallback to memory
    }

    return memoryUsers.find(
      (u) =>
        u.email.toLowerCase() === clean ||
        u.phone.replace(/\D/g, '') === identifier.replace(/\D/g, '')
    ) || null;
  },

  async findUserById(id: string) {
    try {
      const user = await prisma.user.findUnique({ where: { id } });
      if (user) return user;
    } catch {
      // fallback
    }
    return memoryUsers.find((u) => u.id === id) || null;
  },

  async createUser(data: {
    name: string;
    email: string;
    phone: string;
    address: string;
    password?: string;
    walletBalance?: number;
  }) {
    const cleanEmail = data.email.trim().toLowerCase();
    const cleanPhone = data.phone.trim();
    const hashedPassword = data.password ? await bcrypt.hash(data.password, 10) : null;
    const initialWallet = Number(data.walletBalance) || 0;

    try {
      const newUser = await prisma.user.create({
        data: {
          name: data.name.trim(),
          email: cleanEmail,
          phone: cleanPhone,
          address: data.address.trim(),
          password: hashedPassword,
          role: 'CUSTOMER',
          walletBalance: initialWallet,
        },
      });
      return newUser;
    } catch {
      // Memory fallback
      const newUser: MemoryUser = {
        id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: data.name.trim(),
        email: cleanEmail,
        phone: cleanPhone,
        address: data.address.trim(),
        password: hashedPassword,
        role: 'CUSTOMER',
        walletBalance: initialWallet,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryUsers.push(newUser);
      return newUser;
    }
  },

  async updateUserPassword(email: string, newPasswordPlain: string) {
    const cleanEmail = email.trim().toLowerCase();
    const hashedPassword = await bcrypt.hash(newPasswordPlain, 10);

    try {
      await prisma.user.update({
        where: { email: cleanEmail },
        data: { password: hashedPassword },
      });
    } catch {
      const u = memoryUsers.find((m) => m.email.toLowerCase() === cleanEmail);
      if (u) {
        u.password = hashedPassword;
        u.updatedAt = new Date();
      }
    }
  },

  async deductUserWallet(userId: string, amountToDeduct: number) {
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user) {
        const newBal = Math.max(0, user.walletBalance - amountToDeduct);
        const updated = await prisma.user.update({
          where: { id: userId },
          data: { walletBalance: newBal },
        });
        return updated.walletBalance;
      }
    } catch {
      // fallback
    }

    const m = memoryUsers.find((u) => u.id === userId);
    if (m) {
      m.walletBalance = Math.max(0, m.walletBalance - amountToDeduct);
      m.updatedAt = new Date();
      return m.walletBalance;
    }
    return 0;
  },

  // --- OTP OPERATIONS ---
  async getLatestOtp(identifier: string, type: string) {
    const clean = identifier.trim().toLowerCase();
    try {
      const otpRec = await prisma.otpVerification.findFirst({
        where: {
          identifier: clean,
          type,
        },
        orderBy: { createdAt: 'desc' },
      });
      if (otpRec) return otpRec;
    } catch {
      // fallback
    }

    return (
      memoryOtps
        .filter((o) => o.identifier.toLowerCase() === clean && o.type === type)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0] || null
    );
  },

  async saveOtp(identifier: string, otp: string, type: string) {
    const clean = identifier.trim().toLowerCase();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins expiry

    try {
      const record = await prisma.otpVerification.create({
        data: {
          identifier: clean,
          otp,
          type,
          expiresAt,
        },
      });
      return record;
    } catch {
      const record: MemoryOtp = {
        id: `otp_${Date.now()}`,
        identifier: clean,
        otp,
        type,
        expiresAt,
        createdAt: new Date(),
      };
      memoryOtps.push(record);
      return record;
    }
  },

  // --- ORDER OPERATIONS ---
  async createOrder(data: {
    customerName: string;
    phone: string;
    address: string;
    items: unknown;
    subTotal: number;
    walletDiscount: number;
    totalAmount: number;
    paymentMethod: string;
    userId?: string;
  }) {
    orderCounter += 1;
    const orderNumber = `#HPT-${orderCounter}`;

    try {
      const created = await prisma.order.create({
        data: {
          orderNumber,
          customerName: data.customerName,
          phone: data.phone,
          address: data.address,
          items: data.items as any,
          subTotal: data.subTotal,
          walletDiscount: data.walletDiscount || 0,
          totalAmount: data.totalAmount,
          paymentMethod: 'COD',
          orderStatus: 'PLACED',
          userId: data.userId || null,
        },
      });
      return created;
    } catch {
      const created: MemoryOrder = {
        id: `ord_${Date.now()}`,
        orderNumber,
        customerName: data.customerName,
        phone: data.phone,
        address: data.address,
        items: data.items,
        subTotal: data.subTotal,
        walletDiscount: data.walletDiscount || 0,
        totalAmount: data.totalAmount,
        paymentMethod: 'COD',
        orderStatus: 'PLACED',
        userId: data.userId || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      memoryOrders.push(created);
      return created;
    }
  },
};

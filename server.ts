import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { db } from "./src/db/index.js";
import { platforms, orders, customers, customPlatformRequests, messages, notifications, invoices, paymentSettings, inPersonMeetings } from "./src/db/schema.js";
import { eq, desc, and, or, sql } from "drizzle-orm";
import crypto from "crypto";
import { sendVerificationEmail } from "./src/utils/email.js";

export const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

  // API Routes
  
  // Get all platforms
  app.get("/api/platforms", async (req, res) => {
    try {
      const allPlatforms = await db.select().from(platforms).where(eq(platforms.isActive, true));
      res.json(allPlatforms);
    } catch (error) {
      console.error("Error fetching platforms:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Get platform by ID
  app.get("/api/platforms/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const platform = await db.select().from(platforms).where(eq(platforms.id, id)).limit(1);
      if (platform.length === 0) {
        return res.status(404).json({ error: "Platform not found" });
      }
      res.json(platform[0]);
    } catch (error) {
      console.error("Error fetching platform:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Get customer orders
  app.get("/api/customer/orders/:email", async (req, res) => {
    try {
      const { email } = req.params;
      const customerOrders = await db.select({
        order: orders,
        platform: platforms
      }).from(orders)
        .leftJoin(platforms, eq(orders.platformId, platforms.id))
        .where(eq(orders.buyerEmail, email));
      
      res.json(customerOrders);
    } catch (error) {
      console.error("Error fetching customer orders:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Custom Platform Requests
  app.post("/api/custom-requests", async (req, res) => {
    try {
      const { email, platformName, teacherName, subject, targetAudience, additionalRequirements } = req.body;
      
      const customer = await db.select().from(customers).where(eq(customers.email, email)).limit(1);
      
      if (!customer.length) {
        return res.status(404).json({ error: "Customer not found" });
      }

      const request = await db.insert(customPlatformRequests).values({
        customerId: customer[0].id,
        platformName,
        teacherName,
        subject,
        targetAudience,
        additionalRequirements,
        status: 'pending'
      }).returning();

      // Create Admin Notification
      await db.insert(notifications).values({
        recipientType: 'admin',
        title: 'طلب منصة خاصة جديد 🚀',
        message: `قام العميل (${customer[0].name}) بطلب إنشاء منصة "${platformName}" لمادة ${subject}`,
        link: '/admin',
        type: 'request'
      });

      // Also create an initial message/welcome message thread if customer added notes
      await db.insert(messages).values({
        customerId: customer[0].id,
        sender: 'customer',
        senderName: customer[0].name,
        message: `طلب منصة خاصة جديدة: "${platformName}" - المعلم: ${teacherName} - المادة: ${subject}${additionalRequirements ? `\nالمتطلبات: ${additionalRequirements}` : ''}`,
        isReadByAdmin: false,
        isReadByCustomer: true,
      });

      res.json({ success: true, request: request[0] });
    } catch (error) {
      console.error("Error creating custom request:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.get("/api/admin/custom-requests", async (req, res) => {
    try {
      const requests = await db.select({
        request: customPlatformRequests,
        customer: customers
      }).from(customPlatformRequests)
        .leftJoin(customers, eq(customPlatformRequests.customerId, customers.id))
        .orderBy(desc(customPlatformRequests.createdAt));
      
      res.json(requests);
    } catch (error) {
      console.error("Error fetching custom requests:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Admin Conversations List (all customers with chat summaries and unread counts)
  app.get("/api/admin/conversations", async (req, res) => {
    try {
      const allCustomers = await db.select().from(customers).orderBy(desc(customers.createdAt));
      const allMsgs = await db.select().from(messages).orderBy(desc(messages.createdAt));

      const conversationMap = new Map();

      for (const cust of allCustomers) {
        const custMessages = allMsgs.filter(m => m.customerId === cust.id);
        const unreadByAdmin = custMessages.filter(m => !m.isReadByAdmin && m.sender === 'customer').length;
        const lastMessage = custMessages[0] || null;

        // If customer has messages or has submitted requests, include in conversations
        conversationMap.set(cust.id, {
          customer: cust,
          lastMessage,
          unreadCount: unreadByAdmin,
          totalMessages: custMessages.length,
          lastActivity: lastMessage ? lastMessage.createdAt : cust.createdAt
        });
      }

      const list = Array.from(conversationMap.values()).sort((a, b) => {
        const timeA = new Date(a.lastActivity).getTime();
        const timeB = new Date(b.lastActivity).getTime();
        return timeB - timeA;
      });

      res.json(list);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Get Messages for a specific customer
  app.get("/api/messages/:customerId", async (req, res) => {
    try {
      const { customerId } = req.params;
      const { role } = req.query; // 'admin' | 'customer'

      const chatMessages = await db.select()
        .from(messages)
        .where(eq(messages.customerId, customerId))
        .orderBy(messages.createdAt);

      // Auto mark as read based on viewing role
      if (role === 'admin') {
        await db.update(messages)
          .set({ isReadByAdmin: true })
          .where(and(eq(messages.customerId, customerId), eq(messages.isReadByAdmin, false)));
      } else if (role === 'customer') {
        await db.update(messages)
          .set({ isReadByCustomer: true })
          .where(and(eq(messages.customerId, customerId), eq(messages.isReadByCustomer, false)));
      }

      res.json(chatMessages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Post a new message
  app.post("/api/messages", async (req, res) => {
    try {
      const { customerId, sender, senderName, message } = req.body;
      
      if (!customerId || !sender || !message || !message.trim()) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const cleanMsg = message.trim();
      const customer = await db.select().from(customers).where(eq(customers.id, customerId)).limit(1);

      if (!customer.length) {
        return res.status(404).json({ error: "Customer not found" });
      }

      const newMsg = await db.insert(messages).values({
        customerId,
        sender, // 'admin' or 'customer'
        senderName: senderName || (sender === 'admin' ? 'إدارة السعيد' : customer[0].name),
        message: cleanMsg,
        isReadByAdmin: sender === 'admin',
        isReadByCustomer: sender === 'customer',
      }).returning();

      // Trigger notification
      if (sender === 'customer') {
        // Notify Admin
        await db.insert(notifications).values({
          recipientType: 'admin',
          title: `رسالة جديدة من ${customer[0].name} 💬`,
          message: cleanMsg.length > 80 ? cleanMsg.substring(0, 80) + '...' : cleanMsg,
          link: `/admin`,
          type: 'message'
        });
      } else {
        // Notify Customer
        await db.insert(notifications).values({
          recipientType: 'customer',
          customerId: customer[0].id,
          title: `رد جديد من إدارة المنصة 👑`,
          message: cleanMsg.length > 80 ? cleanMsg.substring(0, 80) + '...' : cleanMsg,
          link: `/dashboard`,
          type: 'message'
        });
      }

      res.json({ success: true, message: newMsg[0] });
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Get notifications
  app.get("/api/notifications", async (req, res) => {
    try {
      const { recipientType, email } = req.query;

      if (recipientType === 'admin') {
        const adminNotifs = await db.select()
          .from(notifications)
          .where(eq(notifications.recipientType, 'admin'))
          .orderBy(desc(notifications.createdAt))
          .limit(30);

        const unreadCount = adminNotifs.filter(n => !n.isRead).length;
        return res.json({ notifications: adminNotifs, unreadCount });
      }

      if (recipientType === 'customer') {
        if (!email) {
          return res.json({ notifications: [], unreadCount: 0 });
        }
        const cust = await db.select().from(customers).where(eq(customers.email, email as string)).limit(1);
        if (!cust.length) {
          return res.json({ notifications: [], unreadCount: 0 });
        }

        const custNotifs = await db.select()
          .from(notifications)
          .where(and(
            eq(notifications.recipientType, 'customer'),
            eq(notifications.customerId, cust[0].id)
          ))
          .orderBy(desc(notifications.createdAt))
          .limit(30);

        const unreadCount = custNotifs.filter(n => !n.isRead).length;
        return res.json({ notifications: custNotifs, unreadCount, customerId: cust[0].id });
      }

      res.json({ notifications: [], unreadCount: 0 });
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Mark notification read
  app.post("/api/notifications/mark-read", async (req, res) => {
    try {
      const { id } = req.body;
      if (id) {
        await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Mark all notifications read
  app.post("/api/notifications/mark-all-read", async (req, res) => {
    try {
      const { recipientType, customerId } = req.body;
      if (recipientType === 'admin') {
        await db.update(notifications).set({ isRead: true }).where(eq(notifications.recipientType, 'admin'));
      } else if (recipientType === 'customer' && customerId) {
        await db.update(notifications)
          .set({ isRead: true })
          .where(and(eq(notifications.recipientType, 'customer'), eq(notifications.customerId, customerId)));
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Customer Profile Helper (by email)
  app.get("/api/customer/me/:email", async (req, res) => {
    try {
      const { email } = req.params;
      const customer = await db.select().from(customers).where(eq(customers.email, email)).limit(1);
      if (!customer.length) {
        return res.status(404).json({ error: "Customer not found" });
      }
      const { passwordHash, verificationCode, ...safeUser } = customer[0];
      res.json(safeUser);
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Create order
  app.post("/api/orders", async (req, res) => {
    try {
      const { platformId, buyerName, buyerEmail, buyerPhone, amount } = req.body;
      const accessCode = "SAEED-" + Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const newOrder = await db.insert(orders).values({
        platformId,
        buyerName,
        buyerEmail,
        buyerPhone,
        amount: amount.toString(),
        status: 'paid', // Simulating successful payment for MVP
        accessCode,
        deliveredAt: new Date()
      }).returning();
      
      // Increment sold copies
      const platform = await db.select().from(platforms).where(eq(platforms.id, platformId)).limit(1);
      if (platform.length > 0) {
        await db.update(platforms)
          .set({ soldCopies: (platform[0].soldCopies || 0) + 1 })
          .where(eq(platforms.id, platformId));
      }
      res.json({ success: true, order: newOrder[0] });
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Admin login check
  app.post("/api/admin/login", (req, res) => {
    const { email, password } = req.body;
    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanPassword = (password || "").trim();
    
    if (cleanEmail === "smarteducationauthority@gmail.com" && cleanPassword === "M&N-MNSAT MSR ALKOBRA") {
      res.json({ success: true, token: "admin-token-mock" });
    } else {
      res.status(401).json({ success: false, error: "بيانات الدخول غير صحيحة" });
    }
  });

  // Admin Get All Platforms
  app.get("/api/admin/platforms", async (req, res) => {
    try {
      const allPlatforms = await db.select().from(platforms);
      res.json(allPlatforms);
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Auth: Register
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { name, email, phone, whatsapp, governorate, region, platformIdea, additionalInfo, password } = req.body;
      const existing = await db.select().from(customers).where(eq(customers.email, email)).limit(1);
      
      const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

      if (existing.length > 0) {
        if (existing[0].isVerified) {
          return res.status(400).json({ error: "البريد الإلكتروني مسجل مسبقاً" });
        } else {
          // Resend OTP for unverified user
          await db.update(customers).set({
            verificationCode: otp,
            verificationCodeExpires: expires,
            passwordHash,
            name, phone, whatsapp, governorate, region, platformIdea, additionalInfo
          }).where(eq(customers.email, email));
          
          sendVerificationEmail(email, name, otp);
          return res.json({ success: true, requiresVerification: true, email });
        }
      }
      
      await db.insert(customers).values({
        name,
        email,
        phone,
        whatsapp,
        governorate,
        region,
        platformIdea,
        additionalInfo,
        passwordHash,
        isVerified: false,
        verificationCode: otp,
        verificationCodeExpires: expires,
        purchasedPlatforms: []
      });
      
      sendVerificationEmail(email, name, otp);
      res.json({ success: true, requiresVerification: true, email });
    } catch (error) {
      console.error("Register error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Auth: Verify Email
  app.post("/api/auth/verify", async (req, res) => {
    try {
      const { email, code } = req.body;
      
      const customer = await db.select().from(customers).where(eq(customers.email, email)).limit(1);
      if (customer.length === 0) {
        return res.status(400).json({ error: "المستخدم غير موجود" });
      }

      const user = customer[0];
      if (user.isVerified) {
        return res.status(400).json({ error: "تم التحقق من الحساب مسبقاً" });
      }

      if (user.verificationCode !== code) {
        return res.status(400).json({ error: "رمز التحقق غير صحيح" });
      }

      if (user.verificationCodeExpires && new Date(user.verificationCodeExpires) < new Date()) {
        return res.status(400).json({ error: "انتهت صلاحية رمز التحقق" });
      }

      // Update as verified
      await db.update(customers).set({
        isVerified: true,
        verificationCode: null,
        verificationCodeExpires: null
      }).where(eq(customers.email, email));

      res.json({ 
        success: true, 
        user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: 'customer' } 
      });

    } catch (error) {
      console.error("Verification error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Auth: Resend Code
  app.post("/api/auth/resend-code", async (req, res) => {
    try {
      const { email } = req.body;
      
      const customer = await db.select().from(customers).where(eq(customers.email, email)).limit(1);
      if (customer.length === 0 || customer[0].isVerified) {
        return res.status(400).json({ error: "طلب غير صالح" });
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

      await db.update(customers).set({
        verificationCode: otp,
        verificationCodeExpires: expires,
      }).where(eq(customers.email, email));
      
      sendVerificationEmail(email, customer[0].name, otp);
      res.json({ success: true });
    } catch (error) {
      console.error("Resend code error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Auth: Login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const cleanEmail = (email || "").trim().toLowerCase();
      const cleanPassword = (password || "").trim();

      // Check if Admin
      if (cleanEmail === "smarteducationauthority@gmail.com" && cleanPassword === "M&N-MNSAT MSR ALKOBRA") {
        return res.json({ 
           success: true, 
           user: { id: 'admin', name: 'نور السعيد', email: cleanEmail, phone: '', role: 'admin' },
          isAdmin: true 
        });
      }

      const customer = await db.select().from(customers).where(eq(customers.email, email)).limit(1);
      if (customer.length === 0) {
        return res.status(401).json({ error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" });
      }
      
      if (!customer[0].isVerified) {
        // Automatically send a new code
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date(Date.now() + 15 * 60 * 1000);
        await db.update(customers).set({
          verificationCode: otp,
          verificationCodeExpires: expires,
        }).where(eq(customers.email, email));
        sendVerificationEmail(email, customer[0].name, otp);

        return res.json({ success: true, requiresVerification: true, email });
      }
      
      const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
      if (customer[0].passwordHash !== passwordHash) {
        return res.status(401).json({ error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" });
      }
      
      res.json({ success: true, user: { id: customer[0].id, name: customer[0].name, email: customer[0].email, phone: customer[0].phone, role: 'customer' } });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Admin Add Platform
  app.post("/api/admin/platforms", async (req, res) => {
    try {
      const { title, description, price, imageUrl, platformUrl, category, features, totalCopies, isSoldOut } = req.body;
      const newPlatform = await db.insert(platforms).values({
        title,
        description,
        price: price.toString(),
        imageUrl,
        platformUrl,
        category,
        features: features || [],
        totalCopies: parseInt(totalCopies) || 1,
        isSoldOut: isSoldOut || false,
      }).returning();
      res.json(newPlatform[0]);
    } catch (error) {
      console.error("Error adding platform:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Admin Delete Platform
  app.delete("/api/admin/platforms/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await db.delete(orders).where(eq(orders.platformId, id));
      await db.delete(platforms).where(eq(platforms.id, id));
      res.json({ success: true });
    } catch (error) {
      console.error("Delete platform error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Admin CRM: Get All Customers with Rich Insights & Metrics
  app.get("/api/admin/customers", async (req, res) => {
    try {
      const allCustomers = await db.select().from(customers).orderBy(desc(customers.createdAt));
      const allOrders = await db.select().from(orders);
      const allRequests = await db.select().from(customPlatformRequests);
      const allMessages = await db.select().from(messages);
      const allPlatforms = await db.select().from(platforms);

      const enrichedCustomers = allCustomers.map(cust => {
        // Customer orders
        const custOrders = allOrders.filter(o => o.buyerEmail?.toLowerCase() === cust.email?.toLowerCase());
        const totalSpent = custOrders.reduce((sum, o) => {
          const amt = parseFloat(o.amount as any) || 0;
          return sum + amt;
        }, 0);

        // Customer requests
        const custRequests = allRequests.filter(r => r.customerId === cust.id);

        // Customer messages
        const custMsgs = allMessages.filter(m => m.customerId === cust.id);
        const unreadByAdmin = custMsgs.filter(m => m.sender === 'customer' && !m.isReadByAdmin).length;

        // Customer purchased platforms details
        const purchasedIds = cust.purchasedPlatforms || [];
        const purchasedPlatformsList = allPlatforms.filter(p => purchasedIds.includes(p.id));

        return {
          id: cust.id,
          name: cust.name,
          email: cust.email,
          phone: cust.phone || '',
          whatsapp: cust.whatsapp || cust.phone || '',
          governorate: cust.governorate || '',
          region: cust.region || '',
          platformIdea: cust.platformIdea || '',
          additionalInfo: cust.additionalInfo || '',
          isVerified: cust.isVerified || false,
          status: cust.status || 'active',
          tierRating: cust.tierRating || 'UNRATED',
          tierNotes: cust.tierNotes || '',
          tierDiscountPercent: cust.tierDiscountPercent || 0,
          adminNotes: cust.adminNotes || '',
          lastLoginAt: cust.lastLoginAt,
          createdAt: cust.createdAt,
          ordersCount: custOrders.length,
          totalSpent: totalSpent,
          customRequestsCount: custRequests.length,
          messagesCount: custMsgs.length,
          unreadMessagesCount: unreadByAdmin,
          purchasedPlatforms: purchasedPlatformsList.map(p => ({
            id: p.id,
            title: p.title,
            price: p.price,
            imageUrl: p.imageUrl,
            category: p.category
          }))
        };
      });

      res.json(enrichedCustomers);
    } catch (error) {
      console.error("Error fetching admin customers:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Admin CRM: Get Single Customer Details (with full orders, requests & messages)
  app.get("/api/admin/customers/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const cust = await db.select().from(customers).where(eq(customers.id, id)).limit(1);
      if (cust.length === 0) {
        return res.status(404).json({ error: "العميل غير موجود" });
      }

      const customer = cust[0];
      const custOrders = await db.select().from(orders).where(eq(orders.buyerEmail, customer.email)).orderBy(desc(orders.createdAt));
      const custRequests = await db.select().from(customPlatformRequests).where(eq(customPlatformRequests.customerId, customer.id)).orderBy(desc(customPlatformRequests.createdAt));
      const custMessages = await db.select().from(messages).where(eq(messages.customerId, customer.id)).orderBy(desc(messages.createdAt));
      
      const allPlatforms = await db.select().from(platforms);
      const purchasedIds = customer.purchasedPlatforms || [];
      const purchasedPlatformsList = allPlatforms.filter(p => purchasedIds.includes(p.id));

      const totalSpent = custOrders.reduce((sum, o) => sum + (parseFloat(o.amount as any) || 0), 0);

      res.json({
        customer: {
          ...customer,
          totalSpent,
          ordersCount: custOrders.length,
          customRequestsCount: custRequests.length,
          messagesCount: custMessages.length
        },
        orders: custOrders,
        customRequests: custRequests,
        purchasedPlatforms: purchasedPlatformsList,
        recentMessages: custMessages.slice(0, 10)
      });
    } catch (error) {
      console.error("Error fetching customer details:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Admin CRM: Update Customer Profile, Status, Notes
  app.put("/api/admin/customers/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { name, phone, whatsapp, governorate, region, status, adminNotes, isVerified, tierRating, tierNotes, tierDiscountPercent } = req.body;

      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (phone !== undefined) updateData.phone = phone;
      if (whatsapp !== undefined) updateData.whatsapp = whatsapp;
      if (governorate !== undefined) updateData.governorate = governorate;
      if (region !== undefined) updateData.region = region;
      if (status !== undefined) updateData.status = status;
      if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
      if (isVerified !== undefined) updateData.isVerified = isVerified;
      if (tierRating !== undefined) updateData.tierRating = tierRating;
      if (tierNotes !== undefined) updateData.tierNotes = tierNotes;
      if (tierDiscountPercent !== undefined) updateData.tierDiscountPercent = tierDiscountPercent;

      const updated = await db.update(customers).set(updateData).where(eq(customers.id, id)).returning();
      if (updated.length === 0) {
        return res.status(404).json({ error: "العميل غير موجود" });
      }

      res.json({ success: true, customer: updated[0] });
    } catch (error) {
      console.error("Error updating customer:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Admin CRM: Delete Customer
  app.delete("/api/admin/customers/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await db.delete(invoices).where(eq(invoices.customerId, id));
      await db.delete(messages).where(eq(messages.customerId, id));
      await db.delete(customPlatformRequests).where(eq(customPlatformRequests.customerId, id));
      await db.delete(notifications).where(eq(notifications.customerId, id));
      await db.delete(customers).where(eq(customers.id, id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting customer:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // ==========================================
  // INVOICES & OFFICIAL QUOTES API
  // ==========================================

  // 1. Create Formal Invoice / Quotation (Admin)
  app.post("/api/admin/invoices", async (req, res) => {
    try {
      const {
        customerId,
        customRequestId,
        platformTitle,
        teacherName,
        subject,
        targetAudience,
        requirements,
        amount,
        isNegotiable,
        featuresIncluded,
        deliveryDays,
        validUntil,
        adminNotes
      } = req.body;

      if (!customerId || !amount || !platformTitle) {
        return res.status(400).json({ error: "الرجاء توفير معرف العميل، السعر، واسم المنصة" });
      }

      // Generate Official Serial Number (e.g. SA-2026-8492)
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const invoiceNumber = `SA-${new Date().getFullYear()}-${randomSuffix}`;

      // Default high-end standard features if not specified
      const finalFeatures = featuresIncluded && featuresIncluded.length > 0 
        ? featuresIncluded 
        : [
            "تطبيق موبايل مخصص (Android & iOS Web-App)",
            "دومين خاص باسم المعلم (e.g. yourname.com) + شهادة SSL",
            "سيرفر سحابي واستضافة فائقة السرعة لمدة عام كامل",
            "نظام حماية الفيديوهات ضد التصوير وسرقة المحتوى (Watermarking)",
            "بوابة دفع إلكتروني متكاملة (فودافون كاش، بطاقات بنكية، إنستاباي)",
            "لوحة تحكم إدارية عربية ذكية وشاملة للطلاب والواجبات",
            "دعم فني وصيانة وضمان استقرار مجاناً طوال فترة الاشتراك"
          ];

      // Default structured features modules
      const defaultModules = [
        {
          id: 'domain_hosting',
          name: 'حجز دومين خاص باسم المعلم (e.g. yourname.com) وسيرفر سحابي سنة كاملة',
          category: 'core',
          description: 'نطاق رسمي مخصص فائق السرعة مع شهادة SSL مجانية',
          isEnabled: true,
          isCompleted: false
        },
        {
          id: 'web_portal',
          name: 'منصة ويب متكاملة للطلاب ولإدارة المحتوى والمذكرات والامتحانات',
          category: 'core',
          description: 'واجهة عصرية بتصميم فاخر تدعم جميع الأجهزة الذكية',
          isEnabled: true,
          isCompleted: false
        },
        {
          id: 'video_security',
          name: 'نظام حماية الفيديوهات ضد التصوير وسرقة المحتوى (Dynamic Watermarking)',
          category: 'security',
          description: 'طباعة بيانات الطالب المتحركة على الشاشة ومنع برامج التسجيل والـ Screen Recording',
          isEnabled: true,
          isCompleted: false
        },
        {
          id: 'payment_gateway',
          name: 'بوابات الدفع الإلكتروني المباشر (فودافون كاش، إنستاباي، فيزا، بطاقات بنكية)',
          category: 'payment',
          description: 'استلام مستحقات الطلاب وشحن الأكواد وتفعيل الكورسات آلياً',
          isEnabled: true,
          isCompleted: false
        },
        {
          id: 'mobile_app',
          name: 'تطبيق هاتف ذكي مخصص (Android APK & iOS Web-App)',
          category: 'mobile',
          description: 'تطبيق للموبايل باسم وصورة المعلم على متجر التطبيقات مع إشعارات Push لحظية',
          isEnabled: true,
          isCompleted: false,
          additionalCost: 1500
        },
        {
          id: 'admin_dashboard',
          name: 'لوحة تحكم إدارية ذكية وتقارير فورية لأولياء الأمور ومتابعة غياب وحضور الطلاب',
          category: 'core',
          description: 'متابعة شاملة لدرجات الامتحانات، نسب المشاهدة، وإرسال رسائل SMS وواتساب',
          isEnabled: true,
          isCompleted: false
        },
        {
          id: 'support_warranty',
          name: 'دعم فني مخصص وضمان استقرار ونسخ احتياطي يومي مجاناً',
          category: 'extra',
          description: 'فريق صيانة وتحديثات مستمرة طوال فترة الاشتراك',
          isEnabled: true,
          isCompleted: false
        }
      ];

      const defaultMilestones = [
        {
          id: 'm1_specs',
          title: 'اعتماد المواصفات والوثيقة الرسمية',
          description: 'مراجعة متطلبات المعلم والمادة وتأكيد حجز النظام',
          phase: 1,
          isCompleted: true,
          completedAt: new Date().toISOString()
        },
        {
          id: 'm2_domain',
          title: 'حجز النطاق الخاص وإعداد السيرفر السحابي',
          description: 'ربط دومين المعلم وتثبيت شهادات الأمان السحابية SSL',
          phase: 2,
          isCompleted: false
        },
        {
          id: 'm3_branding',
          title: 'رفع هوية وشعار المعلم وتخصيص الواجهات',
          description: 'تطبيق الألوان وتجهيز أقسام المراحل التعليمية والكورسات',
          phase: 3,
          isCompleted: false
        },
        {
          id: 'm4_security_mobile',
          title: 'تفعيل نظام حماية الفيديوهات وبناء تطبيق الهاتف',
          description: 'دمج العلامة المائية الذكية وبناء حزم الأندرويد وبوابات الدفع',
          phase: 4,
          isCompleted: false
        },
        {
          id: 'm5_handover',
          title: 'التسليم النهائي، تسليم لوحة الإدارة والتدريب',
          description: 'إطلاق المنصة الحية للطلاب وتسليم بيانات الدخول الخاصة بالمعلم',
          phase: 5,
          isCompleted: false
        }
      ];

      const newInvoice = await db.insert(invoices).values({
        invoiceNumber,
        customerId,
        customRequestId: customRequestId || null,
        platformTitle,
        teacherName: teacherName || "الأستاذ الفاضل",
        subject: subject || "المادة التعليمية",
        targetAudience: targetAudience || "المرحلة التعليمية العامة",
        requirements: requirements || "تطوير منصة تعليمية وتطبيق مخصص متكامل بالمواصفات القياسية",
        amount: String(amount),
        isNegotiable: isNegotiable === true,
        featuresIncluded: finalFeatures,
        featuresModules: defaultModules,
        milestones: defaultMilestones,
        deliveryDays: deliveryDays || "3 - 5 أيام عمل",
        validUntil: validUntil || "صالح لمدة 7 أيام من تاريخ الإصدار",
        adminNotes: adminNotes || null,
        status: 'issued'
      }).returning();

      const createdInv = newInvoice[0];

      // Auto-post formal message in the chat between Admin & Customer
      const formalMessageText = `📄 **وثيقة عرض سعر وعقد منصة تعليمية رسمية**\n\n` +
        `رقم الوثيقة: **${createdInv.invoiceNumber}**\n` +
        `اسم المنصة: **${createdInv.platformTitle}**\n` +
        `المعلم: **${createdInv.teacherName}** - مادة: **${createdInv.subject}**\n` +
        `قيمة الاستثمار: **${Number(createdInv.amount).toLocaleString('ar-EG')} ج.م** (${createdInv.isNegotiable ? 'قابلة للتفاوض' : 'سعر نهائي معتمد'})\n` +
        `مدة التنفيذ والتسليم: **${createdInv.deliveryDays}**\n\n` +
        `تم إصدار هذه الوثيقة رسمياً من إدارة منصات السعيد للأنظمة التعليمية الذكية. يمكنك معاينة الوثيقة الرسمية وسداد الفاتورة مباشرة لتثبيت الحجز وبدء التطوير.`;

      await db.insert(messages).values({
        customerId,
        sender: 'admin',
        senderName: 'إدارة منصات السعيد',
        message: formalMessageText,
        isReadByAdmin: true,
        isReadByCustomer: false
      });

      // Send live notification to customer
      await db.insert(notifications).values({
        recipientType: 'customer',
        customerId,
        title: '📄 تم إصدار وثيقة عرض سعر وفاتورة رسمية جديدة',
        message: `أصدرت الإدارة عرض سعر رسمي لمنصة "${createdInv.platformTitle}" بقيمة ${Number(createdInv.amount).toLocaleString('ar-EG')} ج.م.`,
        link: '/customer/dashboard?tab=chat',
        type: 'invoice'
      });

      res.json({ success: true, invoice: createdInv });
    } catch (error) {
      console.error("Error creating invoice:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // 2. Get Invoices for a Customer (or All for Admin)
  app.get("/api/invoices", async (req, res) => {
    try {
      const { customerId } = req.query;
      let query = db.select({
        invoice: invoices,
        customer: {
          id: customers.id,
          name: customers.name,
          email: customers.email,
          phone: customers.phone,
          governorate: customers.governorate
        }
      })
      .from(invoices)
      .leftJoin(customers, eq(invoices.customerId, customers.id))
      .orderBy(desc(invoices.createdAt));

      if (customerId) {
        query = query.where(eq(invoices.customerId, String(customerId))) as any;
      }

      const results = await query;
      res.json(results);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // 3. Get Single Invoice by ID or Invoice Number
  app.get("/api/invoices/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const inv = await db.select({
        invoice: invoices,
        customer: {
          id: customers.id,
          name: customers.name,
          email: customers.email,
          phone: customers.phone,
          whatsapp: customers.whatsapp,
          governorate: customers.governorate,
          region: customers.region
        }
      })
      .from(invoices)
      .leftJoin(customers, eq(invoices.customerId, customers.id))
      .where(sql`${invoices.id}::text = ${id} OR ${invoices.invoiceNumber} = ${id}`)
      .limit(1);

      if (inv.length === 0) {
        return res.status(404).json({ error: "الوثيقة / الفاتورة غير موجودة" });
      }

      res.json(inv[0]);
    } catch (error) {
      console.error("Error fetching single invoice:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // 4. Customer Accepts / Pays an Invoice
  app.post("/api/invoices/:id/pay", async (req, res) => {
    try {
      const { id } = req.params;
      const { paymentMethod, transactionRef } = req.body;

      const invList = await db.select().from(invoices).where(eq(invoices.id, id)).limit(1);
      if (invList.length === 0) {
        return res.status(404).json({ error: "الفاتورة غير موجودة" });
      }

      const inv = invList[0];
      if (inv.status === 'paid') {
        return res.status(400).json({ error: "هذه الفاتورة تم سدادها وتأكيدها مسبقاً" });
      }

      // Mark Invoice as Paid
      const updatedInv = await db.update(invoices).set({
        status: 'paid',
        paidAt: new Date()
      }).where(eq(invoices.id, id)).returning();

      // Create a matching Order entry
      const accessCode = `SA-${Math.floor(100000 + Math.random() * 900000)}`;
      const custRecord = await db.select().from(customers).where(eq(customers.id, inv.customerId)).limit(1);
      const buyerName = custRecord[0]?.name || inv.teacherName;
      const buyerEmail = custRecord[0]?.email || 'customer@alsaeed.com';
      const buyerPhone = custRecord[0]?.phone || '';

      await db.insert(orders).values({
        platformId: null, // Custom built platform
        buyerName,
        buyerEmail,
        buyerPhone,
        amount: inv.amount,
        accessCode,
        status: 'completed'
      });

      // Update customPlatformRequest if linked
      if (inv.customRequestId) {
        await db.update(customPlatformRequests).set({
          status: 'paid_and_building'
        }).where(eq(customPlatformRequests.id, inv.customRequestId));
      }

      // Send Chat Message Confirming Payment
      await db.insert(messages).values({
        customerId: inv.customerId,
        sender: 'customer',
        senderName: buyerName,
        message: `✅ تم سداد الفاتورة الرسمية رقم (${inv.invoiceNumber}) بنجاح بمبلغ ${Number(inv.amount).toLocaleString('ar-EG')} ج.م عبر (${paymentMethod || 'الدفع الإلكتروني'}).\nكود الدخول والاعتماد: ${accessCode}`,
        isReadByAdmin: false,
        isReadByCustomer: true
      });

      // Notify Admin
      await db.insert(notifications).values({
        recipientType: 'admin',
        customerId: inv.customerId,
        title: '💰 تم سداد فاتورة رسمية جديدة بنجاح!',
        message: `قام العميل ${buyerName} بسداد فاتورة منصة "${inv.platformTitle}" بمبلغ ${Number(inv.amount).toLocaleString('ar-EG')} ج.م.`,
        link: '/admin?tab=chat',
        type: 'order'
      });

      res.json({ success: true, invoice: updatedInv[0], accessCode });
    } catch (error) {
      console.error("Error paying invoice:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // 5. Admin Update Milestones & Feature Modules (Enable/Disable/Complete)
  app.patch("/api/admin/invoices/:id/delivery", async (req, res) => {
    try {
      const { id } = req.params;
      const { 
        milestones, 
        featuresModules, 
        status, 
        domainUrl, 
        adminPortalUrl, 
        appDownloadUrl, 
        accessCredentials,
        adminNotes,
        amount
      } = req.body;

      const existing = await db.select().from(invoices).where(eq(invoices.id, id)).limit(1);
      if (existing.length === 0) {
        return res.status(404).json({ error: "الوثيقة غير موجودة" });
      }

      const updateData: any = {};
      if (milestones !== undefined) updateData.milestones = milestones;
      if (featuresModules !== undefined) updateData.featuresModules = featuresModules;
      if (status !== undefined) {
        updateData.status = status;
        if (status === 'delivered') {
          updateData.deliveredAt = new Date();
        }
      }
      if (domainUrl !== undefined) updateData.domainUrl = domainUrl;
      if (adminPortalUrl !== undefined) updateData.adminPortalUrl = adminPortalUrl;
      if (appDownloadUrl !== undefined) updateData.appDownloadUrl = appDownloadUrl;
      if (accessCredentials !== undefined) updateData.accessCredentials = accessCredentials;
      if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
      if (amount !== undefined) updateData.amount = String(amount);

      const updated = await db.update(invoices).set(updateData).where(eq(invoices.id, id)).returning();
      const inv = updated[0];

      // If status changed or milestone completed, send live notification to customer
      await db.insert(notifications).values({
        recipientType: 'customer',
        customerId: inv.customerId,
        title: status === 'delivered' ? '🚀 تم تسليم منصتك التعليمية بنجاح!' : '⚙️ تحديث في شريط مراحل تجهيز منصتك',
        message: status === 'delivered' 
          ? `أصبحت منصة "${inv.platformTitle}" جاهزة تماماً للطلاب ولإدارة الدروس. تفضل بالدخول للوحة التحكم.`
          : `تم تحديث مراحل وتجهيزات منصة "${inv.platformTitle}". تفقد شريط التقدم الآن.`,
        link: '/customer/dashboard?tab=delivery',
        type: 'system'
      });

      res.json({ success: true, invoice: inv });
    } catch (error) {
      console.error("Error updating invoice delivery details:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // 6. Public Portal: Instant Document & Contract & Meeting Verification
  app.get("/api/public/verify-document", async (req, res) => {
    try {
      const { code } = req.query;
      if (!code || typeof code !== 'string' || !code.trim()) {
        return res.status(400).json({ error: "يرجى إدخال رقم الوثيقة أو كود التحقق" });
      }

      let cleanCode = code.trim();
      // If code was passed as a full URL like https://domain.com/verify?code=INV-2026-XXXX, extract code
      if (cleanCode.includes('code=')) {
        try {
          const urlParams = new URLSearchParams(cleanCode.split('?')[1]);
          cleanCode = urlParams.get('code') || cleanCode;
        } catch (e) {
          // ignore
        }
      }

      // Validate if cleanCode is a valid UUID format before comparing with uuid columns
      const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(cleanCode);

      // Check invoices table
      const invoiceConditions = [eq(invoices.invoiceNumber, cleanCode)];
      if (isUuid) {
        invoiceConditions.push(eq(invoices.id, cleanCode));
      }

      const matchedInvoice = await db.select().from(invoices)
        .where(or(...invoiceConditions))
        .limit(1);

      if (matchedInvoice.length > 0) {
        const inv = matchedInvoice[0];
        const cust = await db.select().from(customers).where(eq(customers.id, inv.customerId)).limit(1);
        return res.json({
          type: 'invoice',
          found: true,
          data: {
            id: inv.id,
            documentNumber: inv.invoiceNumber,
            documentType: 'عقد ووثيقة اعتماد منصة تعليمية رسمية',
            platformTitle: inv.platformTitle,
            teacherName: inv.teacherName,
            subject: inv.subject,
            targetAudience: inv.targetAudience,
            customerName: cust.length > 0 ? cust[0].name : (inv.teacherName || 'عميل معتمد'),
            customerPhone: cust.length > 0 ? cust[0].phone : '',
            customerGovernorate: cust.length > 0 ? cust[0].governorate : 'جمهورية مصر العربية',
            amount: inv.amount,
            status: inv.status,
            issuedDate: inv.createdAt,
            deliveryDays: inv.deliveryDays,
            deliveredAt: inv.deliveredAt,
            paidAt: inv.paidAt,
            featuresIncluded: inv.featuresIncluded || [],
            milestones: inv.milestones || [],
            sealAuthority: 'إدارة السعيد للأنظمة والبرمجيات - الختم السيادي المعتمد',
            securityStamp: `VALID-HASH-${inv.id.substring(0, 10).toUpperCase()}`
          }
        });
      }

      // Check in-person meetings table
      const meetingConditions = [
        eq(inPersonMeetings.meetingNumber, cleanCode),
        eq(inPersonMeetings.verificationCode, cleanCode)
      ];
      if (isUuid) {
        meetingConditions.push(eq(inPersonMeetings.id, cleanCode));
      }

      const matchedMeeting = await db.select().from(inPersonMeetings)
        .where(or(...meetingConditions))
        .limit(1);

      if (matchedMeeting.length > 0) {
        const meet = matchedMeeting[0];
        return res.json({
          type: 'meeting',
          found: true,
          data: {
            id: meet.id,
            documentNumber: meet.meetingNumber,
            documentType: 'تفويض موعد مقابلة شخصية ودفع يدوي رسمي',
            platformTitle: meet.governorate === 'القاهرة' ? 'مقابلة معتمدة - محافظة القاهرة' : 'مقابلة معتمدة - محافظة الإسكندرية',
            customerName: meet.customerName,
            customerPhone: meet.customerPhone,
            governorate: meet.governorate,
            region: meet.region,
            specificAddress: meet.specificAddress,
            status: meet.status,
            issuedDate: meet.scheduledDate,
            scheduledTime: meet.scheduledTime,
            employeeName: meet.employeeName,
            employeePhone: meet.employeePhone,
            employeeTitle: meet.employeeTitle,
            amountToCollect: meet.amountToCollect,
            verificationCode: meet.verificationCode,
            createdAt: meet.createdAt,
            completedAt: meet.completedAt,
            sealAuthority: 'الهيئة الإدارية للسعيد - قطاع المقابلات الميدانية الرسمية',
            securityStamp: `AUTH-REP-${meet.verificationCode}`
          }
        });
      }

      return res.status(404).json({
        found: false,
        message: "لم يتم العثور على أي وثيقة أو عقد مسجل بهذا الرقم. يرجى التأكد من كتابة الرقم بدقة أو إعادة مسح رمز الـ QR."
      });
    } catch (error) {
      console.error("Error verifying document:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // ==========================================
  // PAYMENT SETTINGS & IN-PERSON MEETINGS APIS
  // ==========================================

  // 1. Get current payment settings & active methods
  app.get("/api/payment-settings", async (req, res) => {
    try {
      let settings = await db.select().from(paymentSettings).limit(1);
      if (settings.length === 0) {
        // Initialize default record
        const inserted = await db.insert(paymentSettings).values({
          primaryWalletNumber: "01151157100",
          walletLabel: "فودافون كاش / إتصالات كاش / أورانج كاش / إنستاباي",
          secondaryWalletNumber: null,
          bankAccountDetails: "البنك الأهلي المصري - حساب رقم: 1048291048194",
          isWalletEnabled: true,
          isInstapayEnabled: true,
          isCashMeetingEnabled: true,
          isCreditCardGatewayEnabled: false,
          creditCardGatewayNotice: "بوابات الدفع الإلكتروني المباشر (فيزا/ماستركارد) قيد الاعتماد والتعاقد البنكي حالياً - متاح الدفع الفوري عبر المحفظة الإلكترونية أو المقابلة المباشرة",
          inPersonLocationsNotice: "المقابلات المباشرة والدفع اليدوي مع مندوبنا المعتمد متاحة حصرياً في محافظتي (القاهرة والإسكندرية) بكافة مناطقهما.",
          cancellationPenaltyPercent: 20,
          penaltyWarningClause: "تنبيه وإقرار صارم: في حال إلغاء طلب المنصة أو التخلف غير المبرر عن موعد المقابلة المعتمد، يتحمل العميل 20% مصاريف إدارية وحجز مواعيد (طلب غير جاد / طلب زائف) غير قابلة للتفاوض نهائياً."
        }).returning();
        return res.json(inserted[0]);
      }
      res.json(settings[0]);
    } catch (error) {
      console.error("Error fetching payment settings:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // 2. Admin update payment settings
  app.put("/api/admin/payment-settings", async (req, res) => {
    try {
      const {
        primaryWalletNumber,
        walletLabel,
        secondaryWalletNumber,
        bankAccountDetails,
        isWalletEnabled,
        isInstapayEnabled,
        isCashMeetingEnabled,
        isCreditCardGatewayEnabled,
        creditCardGatewayNotice,
        inPersonLocationsNotice,
        cancellationPenaltyPercent,
        penaltyWarningClause
      } = req.body;

      let settings = await db.select().from(paymentSettings).limit(1);
      let updated;
      
      const payload = {
        primaryWalletNumber: primaryWalletNumber || "01151157100",
        walletLabel: walletLabel || "فودافون كاش / إتصالات كاش / أورانج / إنستاباي",
        secondaryWalletNumber: secondaryWalletNumber !== undefined ? secondaryWalletNumber : null,
        bankAccountDetails: bankAccountDetails !== undefined ? bankAccountDetails : null,
        isWalletEnabled: isWalletEnabled !== undefined ? Boolean(isWalletEnabled) : true,
        isInstapayEnabled: isInstapayEnabled !== undefined ? Boolean(isInstapayEnabled) : true,
        isCashMeetingEnabled: isCashMeetingEnabled !== undefined ? Boolean(isCashMeetingEnabled) : true,
        isCreditCardGatewayEnabled: isCreditCardGatewayEnabled !== undefined ? Boolean(isCreditCardGatewayEnabled) : false,
        creditCardGatewayNotice: creditCardGatewayNotice || undefined,
        inPersonLocationsNotice: inPersonLocationsNotice || undefined,
        cancellationPenaltyPercent: cancellationPenaltyPercent ? Number(cancellationPenaltyPercent) : 20,
        penaltyWarningClause: penaltyWarningClause || undefined,
        updatedAt: new Date()
      };

      if (settings.length === 0) {
        updated = await db.insert(paymentSettings).values(payload).returning();
      } else {
        updated = await db.update(paymentSettings).set(payload).where(eq(paymentSettings.id, settings[0].id)).returning();
      }

      res.json({ success: true, settings: updated[0] });
    } catch (error) {
      console.error("Error updating payment settings:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // 3. Create or Request an In-Person Meeting (Cash Handover)
  app.post("/api/in-person-meetings/request", async (req, res) => {
    try {
      const {
        invoiceId,
        customerId,
        customerName,
        customerPhone,
        governorate,
        region,
        specificAddress,
        preferredDate,
        preferredTime,
        amountToCollect,
        customerNotes
      } = req.body;

      if (!customerId || !customerName || !customerPhone || !governorate || !region) {
        return res.status(400).json({ error: "يرجى استكمال البيانات المطلوبة (الاسم، الهاتف، المحافظة والمنطقة)" });
      }

      if (governorate !== 'القاهرة' && governorate !== 'الإسكندرية') {
        return res.status(400).json({ error: "المقابلات المباشرة متاحة حصرياً في محافظتي القاهرة والإسكندرية فقط" });
      }

      const randomSerial = Math.floor(1000 + Math.random() * 9000);
      const meetingNumber = `MEET-${new Date().getFullYear()}-${randomSerial}`;
      const verificationCode = `AUTH-${Math.random().toString(36).substring(2, 7).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

      const newMeeting = await db.insert(inPersonMeetings).values({
        meetingNumber,
        invoiceId: invoiceId || null,
        customerId,
        customerName,
        customerPhone,
        governorate,
        region,
        specificAddress: specificAddress || `منطقة ${region} - ${governorate}`,
        scheduledDate: preferredDate || "سيتم تأكيده هاتفياً من الإدارة",
        scheduledTime: preferredTime || "خلال ساعات العمل الرسمية (10 ص - 8 م)",
        employeeName: "م. كريم السعيد (أو المندوب المفوض)",
        employeePhone: "01151157100",
        employeeTitle: "مندوب التعاقد والتحصيل المعتمد",
        amountToCollect: String(amountToCollect || "6500"),
        verificationCode,
        status: "scheduled",
        penaltyWarningAcknowledged: true,
        customerNotes: customerNotes || null
      }).returning();

      // Notify Admin
      await db.insert(notifications).values({
        recipientType: 'admin',
        title: `🤝 طلب مقابلة ودفع يدوي جديد (${governorate})`,
        message: `طلب المعلم "${customerName}" تحديد موعد مقابلة لدفع فاتورة منصته نقداً في منطقة "${region} - ${governorate}".`,
        link: '/admin/dashboard',
        type: 'invoice'
      });

      // Notify Customer with Card
      await db.insert(notifications).values({
        recipientType: 'customer',
        customerId,
        title: `🎫 تم إصدار بطاقة موعد المقابلة المعتمدة (${meetingNumber})`,
        message: `تم تثبيت موعد المقابلة في ${governorate} (${region}). برجاء طباعة البطاقة أو حفظها لإبرازها للمندوب.`,
        link: '/customer/dashboard?tab=delivery',
        type: 'system'
      });

      res.status(201).json({ success: true, meeting: newMeeting[0] });
    } catch (error) {
      console.error("Error creating meeting request:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // 4. Get In-Person Meetings (by customerId or invoiceId or all for admin)
  app.get("/api/in-person-meetings", async (req, res) => {
    try {
      const { customerId, invoiceId } = req.query;
      let query = db.select().from(inPersonMeetings);

      if (customerId) {
        query = query.where(eq(inPersonMeetings.customerId, customerId as string)) as any;
      } else if (invoiceId) {
        query = query.where(eq(inPersonMeetings.invoiceId, invoiceId as string)) as any;
      }

      const allMeetings = await query.orderBy(desc(inPersonMeetings.createdAt));
      res.json(allMeetings);
    } catch (error) {
      console.error("Error fetching in-person meetings:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // 5. Admin Update In-Person Meeting Details & Schedule
  app.patch("/api/admin/in-person-meetings/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const {
        scheduledDate,
        scheduledTime,
        governorate,
        region,
        specificAddress,
        employeeName,
        employeePhone,
        employeeTitle,
        amountToCollect,
        status,
        adminNotes
      } = req.body;

      const updateData: any = {};
      if (scheduledDate !== undefined) updateData.scheduledDate = scheduledDate;
      if (scheduledTime !== undefined) updateData.scheduledTime = scheduledTime;
      if (governorate !== undefined) updateData.governorate = governorate;
      if (region !== undefined) updateData.region = region;
      if (specificAddress !== undefined) updateData.specificAddress = specificAddress;
      if (employeeName !== undefined) updateData.employeeName = employeeName;
      if (employeePhone !== undefined) updateData.employeePhone = employeePhone;
      if (employeeTitle !== undefined) updateData.employeeTitle = employeeTitle;
      if (amountToCollect !== undefined) updateData.amountToCollect = String(amountToCollect);
      if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
      if (status !== undefined) {
        updateData.status = status;
        if (status === 'completed') {
          updateData.completedAt = new Date();
        }
      }

      const updated = await db.update(inPersonMeetings).set(updateData).where(eq(inPersonMeetings.id, id)).returning();
      if (updated.length === 0) {
        return res.status(404).json({ error: "المقابلة غير موجودة" });
      }

      const meet = updated[0];

      // If status completed, also update related invoice to paid if exists
      if (status === 'completed' && meet.invoiceId) {
        await db.update(invoices).set({ status: 'paid', paidAt: new Date() }).where(eq(invoices.id, meet.invoiceId));
      }

      // Notify customer
      await db.insert(notifications).values({
        recipientType: 'customer',
        customerId: meet.customerId,
        title: status === 'completed' 
          ? '✅ تم استلام المبلغ واعتماد الدفع بنجاح!' 
          : '📅 تحديث في تفاصيل موعد المقابلة المباشرة',
        message: status === 'completed'
          ? `تم استلام الدفعة النقدية من قبل المندوب "${meet.employeeName}". جاري متابعة بناء منصتك.`
          : `تم تحديث الموعد والمندوب المعتمد لمقابلتك في ${meet.governorate} (${meet.region}) في ${meet.scheduledDate} الساعة ${meet.scheduledTime}.`,
        link: '/customer/dashboard?tab=delivery',
        type: 'system'
      });

      res.json({ success: true, meeting: meet });
    } catch (error) {
      console.error("Error updating in-person meeting:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });


  // Vite middleware for development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  startServer();
}

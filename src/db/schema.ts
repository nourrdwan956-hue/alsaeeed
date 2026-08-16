import { relations } from 'drizzle-orm';
import { pgTable, text, timestamp, decimal, integer, boolean, uuid, jsonb, serial } from 'drizzle-orm/pg-core';

// 1. جدول المنصات (Products / Platforms)
export const platforms = pgTable('platforms', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  longDescription: text('long_description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  category: text('category'),
  imageUrl: text('image_url'),
  platformUrl: text('platform_url'),
  galleryImages: text('gallery_images').array(),
  features: text('features').array(),
  totalCopies: integer('total_copies').default(1),
  soldCopies: integer('sold_copies').default(0),
  isSoldOut: boolean('is_sold_out').default(false),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 2. جدول الطلبات (Orders)
export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  platformId: uuid('platform_id').references(() => platforms.id),
  buyerName: text('buyer_name').notNull(),
  buyerEmail: text('buyer_email').notNull(),
  buyerPhone: text('buyer_phone'),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  status: text('status').default('pending'), // pending, paid, delivered, cancelled
  paymentMethod: text('payment_method'),
  paymentId: text('payment_id'),
  accessCode: text('access_code').unique(),
  deliveredAt: timestamp('delivered_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 3. جدول العملاء (Customers)
export const customers = pgTable('customers', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').unique().notNull(),
  name: text('name').notNull(),
  phone: text('phone'),
  whatsapp: text('whatsapp'),
  governorate: text('governorate'),
  region: text('region'),
  platformIdea: text('platform_idea'),
  additionalInfo: text('additional_info'),
  passwordHash: text('password_hash'),
  isVerified: boolean('is_verified').default(false),
  verificationCode: text('verification_code'),
  verificationCodeExpires: timestamp('verification_code_expires'),
  purchasedPlatforms: uuid('purchased_platforms').array(),
  status: text('status').default('active'), // 'active' | 'suspended'
  tierRating: text('tier_rating').default('UNRATED'), // 'UNRATED', 'A_PLUS_PLUS', 'A_PLUS', 'A', 'B_PLUS_PLUS', 'B_PLUS', 'B', 'C_PLUS', 'C', 'D_MINUS', 'D_MINUS_MINUS', 'F'
  tierNotes: text('tier_notes'),
  tierDiscountPercent: integer('tier_discount_percent').default(0),
  adminNotes: text('admin_notes'),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 4. جدول الإعدادات (Settings)
export const settings = pgTable('settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  key: text('key').unique().notNull(),
  value: text('value'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 5. جدول سجل النشاط (Activity Log)
export const activityLog = pgTable('activity_log', {
  id: uuid('id').defaultRandom().primaryKey(),
  action: text('action').notNull(),
  details: jsonb('details'),
  ipAddress: text('ip_address'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 6. جدول طلبات المنصات المخصصة (Custom Platform Requests)
export const customPlatformRequests = pgTable('custom_platform_requests', {
  id: uuid('id').defaultRandom().primaryKey(),
  customerId: uuid('customer_id').references(() => customers.id),
  platformName: text('platform_name').notNull(),
  teacherName: text('teacher_name').notNull(),
  subject: text('subject').notNull(),
  targetAudience: text('target_audience'),
  additionalRequirements: text('additional_requirements'),
  status: text('status').default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 7. جدول الرسائل والمحادثات (Direct Messages between Admin and Customers)
export const messages = pgTable('messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  customerId: uuid('customer_id').references(() => customers.id).notNull(),
  sender: text('sender').notNull(), // 'admin' | 'customer'
  senderName: text('sender_name'),
  message: text('message').notNull(),
  isReadByAdmin: boolean('is_read_by_admin').default(false),
  isReadByCustomer: boolean('is_read_by_customer').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// 8. جدول الإشعارات (Notifications for Admin and Customer)
export const notifications = pgTable('notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  recipientType: text('recipient_type').notNull(), // 'admin' | 'customer'
  customerId: uuid('customer_id').references(() => customers.id), // null if recipientType is admin
  title: text('title').notNull(),
  message: text('message').notNull(),
  link: text('link'),
  type: text('type').default('message'), // 'message' | 'request' | 'order' | 'system' | 'invoice'
  isRead: boolean('is_read').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// 9. جدول عروض الأسعار، مراحل التسليم والمشاريع (Official Quotations, Dynamic Milestones & Project Deliveries)
export const invoices = pgTable('invoices', {
  id: uuid('id').defaultRandom().primaryKey(),
  invoiceNumber: text('invoice_number').notNull().unique(),
  customerId: uuid('customer_id').references(() => customers.id).notNull(),
  customRequestId: uuid('custom_request_id').references(() => customPlatformRequests.id),
  platformTitle: text('platform_title').notNull(),
  teacherName: text('teacher_name').notNull(),
  subject: text('subject').notNull(),
  targetAudience: text('target_audience'),
  requirements: text('requirements'),
  amount: text('amount').notNull(), // E.g. "6500"
  isNegotiable: boolean('is_negotiable').default(false), // قابل للتفاوض أو نهائي
  featuresIncluded: text('features_included').array(), // Text array for backward compatibility
  // Smart Feature Modules list stored as JSON: [{ id, name, category, isEnabled, isCompleted, additionalCost, notes }]
  featuresModules: jsonb('features_modules'),
  // Milestones: [{ id, title, description, isCompleted, completedAt }]
  milestones: jsonb('milestones'),
  // Handover delivery information
  domainUrl: text('domain_url'),
  adminPortalUrl: text('admin_portal_url'),
  appDownloadUrl: text('app_download_url'),
  accessCredentials: text('access_credentials'),
  deliveryDays: text('delivery_days').default('3 - 5 أيام عمل'),
  validUntil: text('valid_until'),
  adminNotes: text('admin_notes'),
  status: text('status').default('issued'), // 'issued' | 'accepted' | 'building' | 'delivered' | 'paid' | 'cancelled'
  paidAt: timestamp('paid_at'),
  deliveredAt: timestamp('delivered_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 10. جدول إعدادات وبوابات الدفع (Payment Settings & Gateway Controls)
export const paymentSettings = pgTable('payment_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  primaryWalletNumber: text('primary_wallet_number').default('01151157100').notNull(),
  walletLabel: text('wallet_label').default('فودافون كاش / إتصالات كاش / أورانج / إنستاباي'),
  secondaryWalletNumber: text('secondary_wallet_number'),
  bankAccountDetails: text('bank_account_details'),
  isWalletEnabled: boolean('is_wallet_enabled').default(true),
  isInstapayEnabled: boolean('is_instapay_enabled').default(true),
  isCashMeetingEnabled: boolean('is_cash_meeting_enabled').default(true),
  isCreditCardGatewayEnabled: boolean('is_credit_card_gateway_enabled').default(false), // معطلة لحين التعاقد
  creditCardGatewayNotice: text('credit_card_gateway_notice').default('بوابات الدفع الإلكتروني المباشر (فيزا/ماستركارد) قيد الاعتماد والتعاقد التجاري حالياً - متاح الدفع الفوري عبر المحفظة أو المقابلة المباشرة'),
  inPersonLocationsNotice: text('in_person_locations_notice').default('المقابلات المباشرة والدفع اليدوي مع مندوبنا المعتمد متاحة حصرياً في محافظتي (القاهرة والإسكندرية) بكافة مناطقهما.'),
  cancellationPenaltyPercent: integer('cancellation_penalty_percent').default(20),
  penaltyWarningClause: text('penalty_warning_clause').default('تنبيه وإقرار صارم: في حال إلغاء طلب المنصة أو التخلف غير المبرر عن موعد المقابلة المعتمد، يتحمل العميل 20% مصاريف إدارية وحجز مواعيد (طلب غير جاد / طلب زائف) غير قابلة للتفاوض نهائياً.'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 11. جدول المقابلات المباشرة والدفع اليدوي مع موظف الإدارة (In-Person Meetings & Cash Handover)
export const inPersonMeetings = pgTable('in_person_meetings', {
  id: uuid('id').defaultRandom().primaryKey(),
  meetingNumber: text('meeting_number').notNull().unique(),
  invoiceId: uuid('invoice_id').references(() => invoices.id),
  customerId: uuid('customer_id').references(() => customers.id).notNull(),
  customerName: text('customer_name').notNull(),
  customerPhone: text('customer_phone').notNull(),
  governorate: text('governorate').notNull(), // 'القاهرة' | 'الإسكندرية'
  region: text('region').notNull(), // المنطقة / الحي
  specificAddress: text('specific_address').notNull(), // المكان أو الفرع المتفق عليه
  scheduledDate: text('scheduled_date').notNull(), // اليوم والتاريخ
  scheduledTime: text('scheduled_time').notNull(), // الساعة المحددة
  employeeName: text('employee_name').default('م. كريم السعيد').notNull(),
  employeePhone: text('employee_phone').default('01151157100').notNull(),
  employeeTitle: text('employee_title').default('مندوب التعاقد والتحصيل المعتمد'),
  amountToCollect: text('amount_to_collect').notNull(),
  verificationCode: text('verification_code').notNull(), // كود التأكيد للتحقق من هوية طالب المنصة
  status: text('status').default('scheduled'), // 'requested' | 'scheduled' | 'completed' | 'cancelled'
  penaltyWarningAcknowledged: boolean('penalty_warning_acknowledged').default(true),
  customerNotes: text('customer_notes'),
  adminNotes: text('admin_notes'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Relationships
export const ordersRelations = relations(orders, ({ one }) => ({
  platform: one(platforms, {
    fields: [orders.platformId],
    references: [platforms.id],
  }),
}));

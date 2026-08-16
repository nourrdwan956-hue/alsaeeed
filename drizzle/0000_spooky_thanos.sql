CREATE TABLE "activity_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"action" text NOT NULL,
	"details" jsonb,
	"ip_address" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "custom_platform_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid,
	"platform_name" text NOT NULL,
	"teacher_name" text NOT NULL,
	"subject" text NOT NULL,
	"target_audience" text,
	"additional_requirements" text,
	"status" text DEFAULT 'pending',
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"phone" text,
	"whatsapp" text,
	"governorate" text,
	"region" text,
	"platform_idea" text,
	"additional_info" text,
	"password_hash" text,
	"is_verified" boolean DEFAULT false,
	"verification_code" text,
	"verification_code_expires" timestamp,
	"purchased_platforms" uuid[],
	"status" text DEFAULT 'active',
	"tier_rating" text DEFAULT 'UNRATED',
	"tier_notes" text,
	"tier_discount_percent" integer DEFAULT 0,
	"admin_notes" text,
	"last_login_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "customers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "in_person_meetings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"meeting_number" text NOT NULL,
	"invoice_id" uuid,
	"customer_id" uuid NOT NULL,
	"customer_name" text NOT NULL,
	"customer_phone" text NOT NULL,
	"governorate" text NOT NULL,
	"region" text NOT NULL,
	"specific_address" text NOT NULL,
	"scheduled_date" text NOT NULL,
	"scheduled_time" text NOT NULL,
	"employee_name" text DEFAULT 'م. كريم السعيد' NOT NULL,
	"employee_phone" text DEFAULT '01151157100' NOT NULL,
	"employee_title" text DEFAULT 'مندوب التعاقد والتحصيل المعتمد',
	"amount_to_collect" text NOT NULL,
	"verification_code" text NOT NULL,
	"status" text DEFAULT 'scheduled',
	"penalty_warning_acknowledged" boolean DEFAULT true,
	"customer_notes" text,
	"admin_notes" text,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "in_person_meetings_meeting_number_unique" UNIQUE("meeting_number")
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_number" text NOT NULL,
	"customer_id" uuid NOT NULL,
	"custom_request_id" uuid,
	"platform_title" text NOT NULL,
	"teacher_name" text NOT NULL,
	"subject" text NOT NULL,
	"target_audience" text,
	"requirements" text,
	"amount" text NOT NULL,
	"is_negotiable" boolean DEFAULT false,
	"features_included" text[],
	"features_modules" jsonb,
	"milestones" jsonb,
	"domain_url" text,
	"admin_portal_url" text,
	"app_download_url" text,
	"access_credentials" text,
	"delivery_days" text DEFAULT '3 - 5 أيام عمل',
	"valid_until" text,
	"admin_notes" text,
	"status" text DEFAULT 'issued',
	"paid_at" timestamp,
	"delivered_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "invoices_invoice_number_unique" UNIQUE("invoice_number")
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"customer_id" uuid NOT NULL,
	"sender" text NOT NULL,
	"sender_name" text,
	"message" text NOT NULL,
	"is_read_by_admin" boolean DEFAULT false,
	"is_read_by_customer" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"recipient_type" text NOT NULL,
	"customer_id" uuid,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"link" text,
	"type" text DEFAULT 'message',
	"is_read" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"platform_id" uuid,
	"buyer_name" text NOT NULL,
	"buyer_email" text NOT NULL,
	"buyer_phone" text,
	"amount" numeric(10, 2) NOT NULL,
	"status" text DEFAULT 'pending',
	"payment_method" text,
	"payment_id" text,
	"access_code" text,
	"delivered_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "orders_access_code_unique" UNIQUE("access_code")
);
--> statement-breakpoint
CREATE TABLE "payment_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"primary_wallet_number" text DEFAULT '01151157100' NOT NULL,
	"wallet_label" text DEFAULT 'فودافون كاش / إتصالات كاش / أورانج / إنستاباي',
	"secondary_wallet_number" text,
	"bank_account_details" text,
	"is_wallet_enabled" boolean DEFAULT true,
	"is_instapay_enabled" boolean DEFAULT true,
	"is_cash_meeting_enabled" boolean DEFAULT true,
	"is_credit_card_gateway_enabled" boolean DEFAULT false,
	"credit_card_gateway_notice" text DEFAULT 'بوابات الدفع الإلكتروني المباشر (فيزا/ماستركارد) قيد الاعتماد والتعاقد التجاري حالياً - متاح الدفع الفوري عبر المحفظة أو المقابلة المباشرة',
	"in_person_locations_notice" text DEFAULT 'المقابلات المباشرة والدفع اليدوي مع مندوبنا المعتمد متاحة حصرياً في محافظتي (القاهرة والإسكندرية) بكافة مناطقهما.',
	"cancellation_penalty_percent" integer DEFAULT 20,
	"penalty_warning_clause" text DEFAULT 'تنبيه وإقرار صارم: في حال إلغاء طلب المنصة أو التخلف غير المبرر عن موعد المقابلة المعتمد، يتحمل العميل 20% مصاريف إدارية وحجز مواعيد (طلب غير جاد / طلب زائف) غير قابلة للتفاوض نهائياً.',
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "platforms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"long_description" text,
	"price" numeric(10, 2) NOT NULL,
	"category" text,
	"image_url" text,
	"platform_url" text,
	"gallery_images" text[],
	"features" text[],
	"total_copies" integer DEFAULT 1,
	"sold_copies" integer DEFAULT 0,
	"is_sold_out" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"value" text,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "settings_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"uid" text NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_uid_unique" UNIQUE("uid")
);
--> statement-breakpoint
ALTER TABLE "custom_platform_requests" ADD CONSTRAINT "custom_platform_requests_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "in_person_meetings" ADD CONSTRAINT "in_person_meetings_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "in_person_meetings" ADD CONSTRAINT "in_person_meetings_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_custom_request_id_custom_platform_requests_id_fk" FOREIGN KEY ("custom_request_id") REFERENCES "public"."custom_platform_requests"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_platform_id_platforms_id_fk" FOREIGN KEY ("platform_id") REFERENCES "public"."platforms"("id") ON DELETE no action ON UPDATE no action;
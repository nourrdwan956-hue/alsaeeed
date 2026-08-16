const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const newEndpoints = `
  // Auth: Forgot Password
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      const cleanEmail = (email || "").trim().toLowerCase();

      const customer = await db.select().from(customers).where(eq(customers.email, cleanEmail)).limit(1);
      
      // Always return success to prevent email enumeration
      if (customer.length === 0) {
        return res.json({ success: true, message: "If an account exists, a reset code was sent." });
      }
      
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
      
      await db.update(customers).set({
        verificationCode: otp,
        verificationCodeExpires: expires,
      }).where(eq(customers.email, cleanEmail));
      
      sendPasswordResetEmail(cleanEmail, customer[0].name, otp);
      
      res.json({ success: true, message: "If an account exists, a reset code was sent." });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  // Auth: Reset Password
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { email, code, newPassword } = req.body;
      const cleanEmail = (email || "").trim().toLowerCase();
      const cleanPassword = (newPassword || "").trim();

      if (!cleanPassword || cleanPassword.length < 6) {
        return res.status(400).json({ error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" });
      }

      const customer = await db.select().from(customers).where(eq(customers.email, cleanEmail)).limit(1);
      
      if (customer.length === 0) {
        return res.status(404).json({ error: "المستخدم غير موجود" });
      }
      
      if (customer[0].verificationCode !== code || !customer[0].verificationCodeExpires || customer[0].verificationCodeExpires < new Date()) {
        return res.status(400).json({ error: "رمز غير صالح أو منتهي الصلاحية" });
      }
      
      const passwordHash = crypto.createHash("sha256").update(cleanPassword).digest("hex");
      
      await db.update(customers).set({
        passwordHash,
        verificationCode: null,
        verificationCodeExpires: null,
      }).where(eq(customers.email, cleanEmail));
      
      res.json({ success: true, message: "تم إعادة تعيين كلمة المرور بنجاح" });
    } catch (error) {
      console.error("Reset password error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

`;

code = code.replace('  // Admin Add Platform', newEndpoints + '  // Admin Add Platform');

fs.writeFileSync('server.ts', code);
console.log("Added forgot password endpoints");

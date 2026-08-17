import nodemailer from 'nodemailer';

const getTransporter = () => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const isSecure = process.env.SMTP_SECURE === 'true' || port === 465;
  const user = (process.env.SMTP_USER || '').trim();
  const pass = (process.env.SMTP_PASS || '').replace(/\s+/g, '');

  if (host.includes('gmail.com')) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: isSecure,
    auth: { user, pass },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    tls: {
      rejectUnauthorized: false,
    },
  });
};

export const isSmtpConfigured = () => {
  return Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
};

export const sendVerificationEmail = async (to: string, name: string, code: string): Promise<{ success: boolean; error?: string }> => {
  if (!isSmtpConfigured()) {
    console.warn('⚠️ SMTP_USER or SMTP_PASS is not configured in environment.');
    console.warn(`[OTP Code for ${to}]: ${code}`);
    return { success: false, error: 'SMTP_NOT_CONFIGURED' };
  }

  const htmlContent = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تأكيد حسابك - منصات السعيد</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; -webkit-font-smoothing: antialiased;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 0;">
        <tr>
            <td align="center">
                <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); max-width: 600px; width: 100%;">
                    <!-- Header -->
                    <tr>
                        <td align="center" style="background-color: #020617; padding: 40px 20px;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: 1px;">
                                السعيد <span style="color: #f59e0b; font-size: 16px; vertical-align: middle;">للمنصات التعليمية</span>
                            </h1>
                        </td>
                    </tr>
                    <!-- Body -->
                    <tr>
                        <td style="padding: 50px 40px; text-align: right;" dir="rtl">
                            <h2 style="color: #0f172a; font-size: 24px; margin-top: 0; margin-bottom: 20px; font-weight: bold;">
                                مرحباً ${name}،
                            </h2>
                            <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                                يسعدنا انضمامك إلى النخبة واختيارك لمنصات السعيد. لتأكيد حسابك الفاخر والبدء في رحلة التميز، يرجى استخدام رمز التحقق أدناه:
                            </p>
                            <!-- Verification Code Box -->
                            <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 1px solid #fcd34d; border-radius: 12px; padding: 30px; text-align: center; margin-bottom: 30px;">
                                <span style="display: block; color: #b45309; font-size: 14px; font-weight: bold; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 2px;">رمز التحقق السري</span>
                                <span style="display: block; color: #020617; font-size: 42px; font-weight: 900; letter-spacing: 8px;">${code}</span>
                            </div>
                            <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin-bottom: 10px;">
                                هذا الرمز صالح لمدة 15 دقيقة فقط.<br>
                                يرجى عدم مشاركة هذا الرمز مع أي شخص لضمان أمان حسابك.
                            </p>
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td align="center" style="background-color: #f1f5f9; padding: 30px 40px; border-top: 1px solid #e2e8f0;">
                            <p style="color: #94a3b8; font-size: 12px; line-height: 1.5; margin: 0;">
                                أنت تتلقى هذه الرسالة لأنك قمت بإنشاء حساب في منصات السعيد.<br>
                                إذا لم تكن أنت من قام بذلك، يرجى تجاهل هذه الرسالة.
                            </p>
                            <p style="color: #cbd5e1; font-size: 11px; margin-top: 15px; margin-bottom: 0;">
                                &copy; ${new Date().getFullYear()} منصات السعيد. جميع الحقوق محفوظة.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
  `;

  const mailOptions = {
    from: `"منصات السعيد" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
    to,
    subject: 'رمز تأكيد الحساب - منصات السعيد',
    html: htmlContent,
  };

  try {
    const transporter = getTransporter();
    const info = await transporter.sendMail(mailOptions);
    console.log('Verification email sent: %s', info.messageId);
    return { success: true };
  } catch (error: any) {
    console.error('Error sending verification email:', error);
    return { success: false, error: error.message };
  }
};

export const sendPasswordResetEmail = async (to: string, name: string, code: string): Promise<{ success: boolean; error?: string }> => {
  if (!isSmtpConfigured()) {
    console.warn('⚠️ SMTP_USER or SMTP_PASS is not configured in environment.');
    console.warn(`[Password Reset Code for ${to}]: ${code}`);
    return { success: false, error: 'SMTP_NOT_CONFIGURED' };
  }

  const htmlContent = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>إعادة تعيين كلمة المرور - منصات السعيد</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 0;">
        <tr>
            <td align="center">
                <table width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); max-width: 600px; width: 100%;">
                    <tr>
                        <td align="center" style="background-color: #020617; padding: 40px 20px;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: 1px;">
                                السعيد <span style="color: #f59e0b; font-size: 16px; vertical-align: middle;">للمنصات التعليمية</span>
                            </h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 50px 40px; text-align: right;" dir="rtl">
                            <h2 style="color: #0f172a; font-size: 24px; margin-top: 0; margin-bottom: 20px; font-weight: bold;">
                                مرحباً ${name}،
                            </h2>
                            <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                                لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك. يرجى استخدام رمز التحقق أدناه لتعيين كلمة مرور جديدة:
                            </p>
                            <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 1px solid #fcd34d; border-radius: 12px; padding: 30px; text-align: center; margin-bottom: 30px;">
                                <span style="display: block; color: #b45309; font-size: 14px; font-weight: bold; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 2px;">رمز إعادة التعيين</span>
                                <span style="display: block; color: #020617; font-size: 42px; font-weight: 900; letter-spacing: 8px;">${code}</span>
                            </div>
                            <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin-bottom: 10px;">
                                هذا الرمز صالح لمدة 15 دقيقة فقط.<br>
                                إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذه الرسالة بأمان.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="background-color: #f1f5f9; padding: 30px 40px; border-top: 1px solid #e2e8f0;">
                            <p style="color: #cbd5e1; font-size: 11px; margin-top: 15px; margin-bottom: 0;">
                                &copy; ${new Date().getFullYear()} منصات السعيد. جميع الحقوق محفوظة.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
  `;

  const mailOptions = {
    from: `"منصات السعيد" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
    to,
    subject: 'إعادة تعيين كلمة المرور - منصات السعيد',
    html: htmlContent,
  };

  try {
    const transporter = getTransporter();
    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent: %s', info.messageId);
    return { success: true };
  } catch (error: any) {
    console.error('Error sending password reset email:', error);
    return { success: false, error: error.message };
  }
};

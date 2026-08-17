import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';

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

// Check if logo exists to attach via CID
const getLogoAttachment = () => {
  const logoPath = path.join(process.cwd(), 'public', 'logo.png');
  if (fs.existsSync(logoPath)) {
    return [
      {
        filename: 'logo.png',
        path: logoPath,
        cid: 'alsaad_logo@platform',
      },
    ];
  }
  return [];
};

export const sendVerificationEmail = async (to: string, name: string, code: string): Promise<{ success: boolean; error?: string }> => {
  if (!isSmtpConfigured()) {
    console.warn('⚠️ SMTP_USER or SMTP_PASS is not configured in environment.');
    console.warn(`[OTP Code for ${to}]: ${code}`);
    return { success: false, error: 'SMTP_NOT_CONFIGURED' };
  }

  const currentYear = new Date().getFullYear();

  const htmlContent = `
<!DOCTYPE html>
<html dir="rtl" lang="ar" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light dark">
    <meta name="supported-color-schemes" content="light dark">
    <title>رمز تأكيد حسابك الفاخر - منصات السعيد</title>
    <!--[if mso]>
    <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
    </noscript>
    <![endif]-->
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&display=swap');
      * {
        box-sizing: border-box;
      }
      body {
        margin: 0 !important;
        padding: 0 !important;
        -webkit-text-size-adjust: 100% !important;
        -ms-text-size-adjust: 100% !important;
        font-family: 'Tajawal', 'Segoe UI', Tahoma, Arial, sans-serif !important;
        background-color: #030712 !important;
      }
      table {
        border-collapse: collapse !important;
        mso-table-lspace: 0pt !important;
        mso-table-rspace: 0pt !important;
      }
      img {
        border: 0 !important;
        outline: none !important;
        text-decoration: none !important;
        -ms-interpolation-mode: bicubic !important;
      }
      .code-digit {
        display: inline-block;
        width: 44px;
        height: 52px;
        line-height: 52px;
        background: #020617;
        color: #fbbf24;
        border: 1.5px solid #f59e0b;
        border-radius: 10px;
        margin: 0 4px;
        font-size: 28px;
        font-weight: 900;
        text-align: center;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
      }
      @media only screen and (max-width: 600px) {
        .main-container {
          width: 100% !important;
          border-radius: 0 !important;
        }
        .content-padding {
          padding: 30px 20px !important;
        }
        .header-padding {
          padding: 30px 15px !important;
        }
        .code-digit {
          width: 36px !important;
          height: 44px !important;
          line-height: 44px !important;
          font-size: 22px !important;
          margin: 0 2px !important;
          border-radius: 8px !important;
        }
        .brand-title {
          font-size: 26px !important;
        }
        .hero-title {
          font-size: 20px !important;
        }
      }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #030712; font-family: 'Tajawal', 'Segoe UI', Tahoma, Arial, sans-serif; direction: rtl;">

    <!-- Wrapper Table -->
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #030712; padding: 30px 10px;">
        <tr>
            <td align="center">
                
                <!-- Main Container -->
                <table class="main-container" width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #0f172a; border-radius: 24px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7); max-width: 600px; width: 100%; border: 1px solid rgba(245, 158, 11, 0.25);">
                    
                    <!-- Top Luxury Gold Bar -->
                    <tr>
                        <td height="6" style="background: linear-gradient(90deg, #d97706, #fbbf24, #f59e0b, #d97706); line-height: 6px; font-size: 6px;">&nbsp;</td>
                    </tr>

                    <!-- Header with Logo and Brand -->
                    <tr>
                        <td class="header-padding" align="center" style="background: linear-gradient(180deg, #020617 0%, #0b1120 100%); padding: 40px 30px 30px 30px; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
                            <table border="0" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td align="center" style="padding-bottom: 16px;">
                                        <!-- Logo with Gold Glow Frame -->
                                        <table border="0" cellspacing="0" cellpadding="0">
                                          <tr>
                                            <td style="padding: 4px; background: linear-gradient(135deg, #f59e0b, #78350f); border-radius: 50%; box-shadow: 0 0 25px rgba(245, 158, 11, 0.4);">
                                              <img src="cid:alsaad_logo@platform" alt="شعار منصات السعيد" width="76" height="76" style="display: block; border-radius: 50%; background-color: #020617; object-fit: cover;" onerror="this.style.display='none';" />
                                            </td>
                                          </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center">
                                        <h1 class="brand-title" style="color: #ffffff; margin: 0; font-size: 30px; font-weight: 900; letter-spacing: 0.5px; font-family: 'Tajawal', 'Segoe UI', Tahoma, sans-serif;">
                                            منصات <span style="color: #fbbf24; text-shadow: 0 0 12px rgba(251, 191, 36, 0.5);">السعيد</span>
                                        </h1>
                                        <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 11px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase;">
                                            AL-SA'EED LUXURY PLATFORMS
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Body Content -->
                    <tr>
                        <td class="content-padding" style="padding: 40px 35px; text-align: right; background-color: #0f172a;" dir="rtl">
                            
                            <!-- Greeting Badge -->
                            <div style="display: inline-block; background-color: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 30px; padding: 6px 16px; margin-bottom: 20px;">
                              <span style="color: #fbbf24; font-size: 13px; font-weight: 800;">✨ تأكيد الأمان والتحقق</span>
                            </div>

                            <h2 class="hero-title" style="color: #f8fafc; font-size: 24px; margin: 0 0 14px 0; font-weight: 800; line-height: 1.4;">
                                أهلاً بك يا <span style="color: #fbbf24;">${name || 'عميلنا المميز'}</span>،
                            </h2>
                            
                            <p style="color: #cbd5e1; font-size: 15px; line-height: 1.8; margin: 0 0 28px 0;">
                                شكراً لاختيارك منصات السعيد للحلول التعليمية والبرمجية الفاخرة. لتأكيد هويتك وتفعيل حسابك بأعلى درجات الأمان، يرجى إدخال رمز التحقق السري الموضح أدناه:
                            </p>

                            <!-- Verification Code VIP Card -->
                            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 0 0 30px 0;">
                                <tr>
                                    <td align="center" style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(217, 119, 6, 0.05) 100%); border: 1.5px dashed rgba(245, 158, 11, 0.5); border-radius: 18px; padding: 30px 20px;">
                                        
                                        <span style="display: block; color: #fbbf24; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 16px;">
                                            🔒 رمز التحقق السري (OTP)
                                        </span>

                                        <!-- Digits Display Box -->
                                        <div style="direction: ltr; unicode-bidi: bidi-override; margin-bottom: 16px;">
                                          ${code.split('').map(digit => `<span class="code-digit">${digit}</span>`).join('')}
                                        </div>

                                        <p style="color: #94a3b8; font-size: 12px; margin: 0; font-weight: 600;">
                                            ⏱️ هذا الرمز ساري المفعول لمدة <strong style="color: #f8fafc;">15 دقيقة فقط</strong>
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <!-- Security Notes Box -->
                            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #020617; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.06); margin-bottom: 25px;">
                                <tr>
                                    <td style="padding: 16px 20px; text-align: right;" dir="rtl">
                                        <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                            <tr>
                                                <td width="28" valign="top" style="padding-top: 2px;">
                                                    <span style="font-size: 18px;">🛡️</span>
                                                </td>
                                                <td style="color: #94a3b8; font-size: 13px; line-height: 1.6;">
                                                    <strong style="color: #e2e8f0;">تنبيه أمان هام:</strong> لا تشارك هذا الرمز السري مع أي شخص مطلقاً بما في ذلك فريق الدعم الفني لحماية بيانات حسابك ومنصتك.
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <p style="color: #64748b; font-size: 13px; line-height: 1.6; margin: 0;">
                                إذا لم تكن قد قمت بإنشاء هذا الحساب، يرجى تجاهل هذه الرسالة بأمان أو التواصل مع فريق الأمان لدينا فوراً.
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td align="center" style="background-color: #020617; padding: 32px 30px; border-top: 1px solid rgba(255, 255, 255, 0.08);">
                            <p style="color: #e2e8f0; font-size: 14px; font-weight: 800; margin: 0 0 8px 0;">
                                منصات السعيد للحلول البرمجية والتعليمية
                            </p>
                            <p style="color: #64748b; font-size: 12px; line-height: 1.6; margin: 0 0 16px 0; max-width: 400px;">
                                فخامة التصميم • قوة الأداء • حماية متقدمة للمحتوى والبيانات
                            </p>
                            <p style="color: #475569; font-size: 11px; margin: 0;">
                                &copy; ${currentYear} جميع الحقوق محفوظة لـ <strong>منصات السعيد</strong>
                            </p>
                        </td>
                    </tr>

                </table>
                <!-- End Main Container -->

            </td>
        </tr>
    </table>
</body>
</html>
  `;

  const mailOptions = {
    from: `"منصات السعيد الفاخرة" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
    to,
    subject: `🔐 رمز التحقق الخاص بحسابك [${code}] - منصات السعيد`,
    html: htmlContent,
    attachments: getLogoAttachment(),
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

  const currentYear = new Date().getFullYear();

  const htmlContent = `
<!DOCTYPE html>
<html dir="rtl" lang="ar" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light dark">
    <meta name="supported-color-schemes" content="light dark">
    <title>إعادة تعيين كلمة المرور - منصات السعيد</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&display=swap');
      * { box-sizing: border-box; }
      body {
        margin: 0 !important;
        padding: 0 !important;
        -webkit-text-size-adjust: 100% !important;
        -ms-text-size-adjust: 100% !important;
        font-family: 'Tajawal', 'Segoe UI', Tahoma, Arial, sans-serif !important;
        background-color: #030712 !important;
      }
      table { border-collapse: collapse !important; }
      img { border: 0 !important; outline: none !important; }
      .code-digit {
        display: inline-block;
        width: 44px;
        height: 52px;
        line-height: 52px;
        background: #020617;
        color: #fbbf24;
        border: 1.5px solid #f59e0b;
        border-radius: 10px;
        margin: 0 4px;
        font-size: 28px;
        font-weight: 900;
        text-align: center;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
      }
      @media only screen and (max-width: 600px) {
        .main-container { width: 100% !important; border-radius: 0 !important; }
        .content-padding { padding: 30px 20px !important; }
        .header-padding { padding: 30px 15px !important; }
        .code-digit {
          width: 36px !important;
          height: 44px !important;
          line-height: 44px !important;
          font-size: 22px !important;
          margin: 0 2px !important;
          border-radius: 8px !important;
        }
      }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #030712; font-family: 'Tajawal', 'Segoe UI', Tahoma, Arial, sans-serif; direction: rtl;">

    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #030712; padding: 30px 10px;">
        <tr>
            <td align="center">
                
                <table class="main-container" width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #0f172a; border-radius: 24px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7); max-width: 600px; width: 100%; border: 1px solid rgba(245, 158, 11, 0.25);">
                    
                    <tr>
                        <td height="6" style="background: linear-gradient(90deg, #d97706, #fbbf24, #f59e0b, #d97706); line-height: 6px; font-size: 6px;">&nbsp;</td>
                    </tr>

                    <tr>
                        <td class="header-padding" align="center" style="background: linear-gradient(180deg, #020617 0%, #0b1120 100%); padding: 40px 30px 30px 30px; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
                            <table border="0" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td align="center" style="padding-bottom: 16px;">
                                        <table border="0" cellspacing="0" cellpadding="0">
                                          <tr>
                                            <td style="padding: 4px; background: linear-gradient(135deg, #f59e0b, #78350f); border-radius: 50%; box-shadow: 0 0 25px rgba(245, 158, 11, 0.4);">
                                              <img src="cid:alsaad_logo@platform" alt="شعار منصات السعيد" width="76" height="76" style="display: block; border-radius: 50%; background-color: #020617; object-fit: cover;" onerror="this.style.display='none';" />
                                            </td>
                                          </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center">
                                        <h1 style="color: #ffffff; margin: 0; font-size: 30px; font-weight: 900; letter-spacing: 0.5px; font-family: 'Tajawal', 'Segoe UI', Tahoma, sans-serif;">
                                            منصات <span style="color: #fbbf24; text-shadow: 0 0 12px rgba(251, 191, 36, 0.5);">السعيد</span>
                                        </h1>
                                        <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 11px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase;">
                                            PASSWORD RESET RECOVERY
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <tr>
                        <td class="content-padding" style="padding: 40px 35px; text-align: right; background-color: #0f172a;" dir="rtl">
                            
                            <div style="display: inline-block; background-color: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.35); border-radius: 30px; padding: 6px 16px; margin-bottom: 20px;">
                              <span style="color: #f87171; font-size: 13px; font-weight: 800;">🔑 طلب استعادة كلمة المرور</span>
                            </div>

                            <h2 style="color: #f8fafc; font-size: 24px; margin: 0 0 14px 0; font-weight: 800; line-height: 1.4;">
                                مرحباً <span style="color: #fbbf24;">${name || 'عميلنا العزيز'}</span>،
                            </h2>
                            
                            <p style="color: #cbd5e1; font-size: 15px; line-height: 1.8; margin: 0 0 28px 0;">
                                لقد تلقينا طلباً لاستعادة كلمة المرور لحسابك في منصات السعيد. يرجى استخدام رمز الأمان المكون من 6 أرقام لإكمال التعيين:
                            </p>

                            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 0 0 30px 0;">
                                <tr>
                                    <td align="center" style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(217, 119, 6, 0.05) 100%); border: 1.5px dashed rgba(245, 158, 11, 0.5); border-radius: 18px; padding: 30px 20px;">
                                        
                                        <span style="display: block; color: #fbbf24; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 16px;">
                                            رمز استعادة الحساب
                                        </span>

                                        <div style="direction: ltr; unicode-bidi: bidi-override; margin-bottom: 16px;">
                                          ${code.split('').map(digit => `<span class="code-digit">${digit}</span>`).join('')}
                                        </div>

                                        <p style="color: #94a3b8; font-size: 12px; margin: 0; font-weight: 600;">
                                            ⏱️ هذا الرمز ساري المفعول لمدة <strong style="color: #f8fafc;">15 دقيقة فقط</strong>
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #020617; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.06); margin-bottom: 25px;">
                                <tr>
                                    <td style="padding: 16px 20px; text-align: right;" dir="rtl">
                                        <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                            <tr>
                                                <td width="28" valign="top" style="padding-top: 2px;">
                                                    <span style="font-size: 18px;">🛡️</span>
                                                </td>
                                                <td style="color: #94a3b8; font-size: 13px; line-height: 1.6;">
                                                    <strong style="color: #e2e8f0;">تنبيه:</strong> إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذا البريد تماماً، وسيبقى حسابك مؤمناً.
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <tr>
                        <td align="center" style="background-color: #020617; padding: 32px 30px; border-top: 1px solid rgba(255, 255, 255, 0.08);">
                            <p style="color: #e2e8f0; font-size: 14px; font-weight: 800; margin: 0 0 8px 0;">
                                منصات السعيد للحلول البرمجية والتعليمية
                            </p>
                            <p style="color: #475569; font-size: 11px; margin: 0;">
                                &copy; ${currentYear} جميع الحقوق محفوظة لـ <strong>منصات السعيد</strong>
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
    from: `"منصات السعيد الفاخرة" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
    to,
    subject: `🔑 رمز استعادة كلمة المرور [${code}] - منصات السعيد`,
    html: htmlContent,
    attachments: getLogoAttachment(),
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


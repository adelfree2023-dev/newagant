/**
 * Email Service
 * خدمة البريد الإلكتروني
 * 
 * يدعم Nodemailer مع قوالب عربية
 * يجب وضعه في: api/src/services/email/index.js
 */

const nodemailer = require('nodemailer');

// إنشاء الـ transporter
let transporter;

function initializeTransporter() {
    if (transporter) return transporter;

    // في الإنتاج: استخدم SMTP حقيقي
    if (process.env.SMTP_HOST) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    } else {
        // للتطوير: استخدم ethereal.email
        transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            auth: {
                user: 'dev@ethereal.email',
                pass: 'devpassword',
            },
        });
        console.log('📧 Using ethereal.email for development');
    }

    return transporter;
}

/**
 * القوالب الأساسية
 */
const templates = {
    /**
     * قالب تأكيد الطلب
     */
    orderConfirmation: (data) => ({
        subject: `تأكيد طلبك #${data.order_number} - ${data.store_name}`,
        html: `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .order-box { background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
          .total { font-size: 24px; color: #667eea; font-weight: bold; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✓ تم استلام طلبك</h1>
            <p>شكراً لتسوقك معنا!</p>
          </div>
          <div class="content">
            <h2>مرحباً ${data.customer_name}،</h2>
            <p>تم استلام طلبك بنجاح وسيتم معالجته قريباً.</p>
            
            <div class="order-box">
              <h3>تفاصيل الطلب #${data.order_number}</h3>
              ${data.items.map(item => `
                <div class="item">
                  <span>${item.name} × ${item.quantity}</span>
                  <span>${item.total.toFixed(2)} ر.س</span>
                </div>
              `).join('')}
              <hr>
              <div class="item">
                <span>المجموع الفرعي</span>
                <span>${data.subtotal.toFixed(2)} ر.س</span>
              </div>
              <div class="item">
                <span>الشحن</span>
                <span>${data.shipping_cost === 0 ? 'مجاني' : data.shipping_cost.toFixed(2) + ' ر.س'}</span>
              </div>
              <div class="item">
                <strong>الإجمالي</strong>
                <strong class="total">${data.total.toFixed(2)} ر.س</strong>
              </div>
            </div>
            
            <h3>عنوان التوصيل</h3>
            <p>${data.shipping_address.address}, ${data.shipping_address.city}</p>
            
            <center>
              <a href="${data.track_url}" class="button">تتبع طلبك</a>
            </center>
          </div>
          <div class="footer">
            <p>${data.store_name}</p>
            <p>هذا الإيميل آلي، الرجاء عدم الرد عليه</p>
          </div>
        </div>
      </body>
      </html>
    `,
    }),

    /**
     * قالب تحديث حالة الطلب
     */
    orderStatusUpdate: (data) => ({
        subject: `تحديث على طلبك #${data.order_number} - ${data.status_label}`,
        html: `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; }
          .header { background: ${data.status_color}; color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .status-badge { display: inline-block; background: ${data.status_color}; color: white; padding: 8px 20px; border-radius: 20px; font-size: 18px; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; border-radius: 5px; text-decoration: none; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${data.status_emoji} ${data.status_label}</h1>
          </div>
          <div class="content">
            <h2>مرحباً ${data.customer_name}،</h2>
            <p>تم تحديث حالة طلبك رقم <strong>#${data.order_number}</strong></p>
            
            <center>
              <span class="status-badge">${data.status_label}</span>
            </center>
            
            ${data.tracking_number ? `
              <h3>رقم التتبع</h3>
              <p style="font-family: monospace; font-size: 18px; background: #f0f0f0; padding: 10px; border-radius: 5px;">
                ${data.tracking_number}
              </p>
            ` : ''}
            
            <center>
              <a href="${data.track_url}" class="button">تتبع طلبك</a>
            </center>
          </div>
          <div class="footer">
            <p>${data.store_name}</p>
          </div>
        </div>
      </body>
      </html>
    `,
    }),

    /**
     * قالب السلة المتروكة
     */
    abandonedCart: (data) => ({
        subject: `لم تنسى شيئاً في سلتك؟ 🛒 - ${data.store_name}`,
        html: `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; }
          .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .product { display: flex; align-items: center; padding: 15px; border-bottom: 1px solid #eee; }
          .product img { width: 80px; height: 80px; object-fit: cover; border-radius: 8px; margin-left: 15px; }
          .coupon { background: #fff3cd; border: 2px dashed #ffc107; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; }
          .coupon-code { font-size: 24px; font-weight: bold; color: #856404; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; }
          .button { display: inline-block; background: #f5576c; color: white; padding: 15px 40px; border-radius: 5px; text-decoration: none; font-size: 18px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🛒 سلتك بانتظارك!</h1>
            <p>المنتجات التي أعجبتك لا تزال متاحة</p>
          </div>
          <div class="content">
            <h2>مرحباً ${data.customer_name}،</h2>
            <p>لاحظنا أنك تركت بعض المنتجات الرائعة في سلتك. لا تفوّت الفرصة!</p>
            
            ${data.items.map(item => `
              <div class="product">
                <img src="${item.image}" alt="${item.name}">
                <div>
                  <h4 style="margin: 0 0 5px 0;">${item.name}</h4>
                  <p style="margin: 0; color: #f5576c; font-weight: bold;">${item.price.toFixed(2)} ر.س</p>
                </div>
              </div>
            `).join('')}
            
            ${data.coupon_code ? `
              <div class="coupon">
                <p>🎁 خصم خاص لك!</p>
                <p class="coupon-code">${data.coupon_code}</p>
                <p>خصم ${data.coupon_discount}% على طلبك</p>
              </div>
            ` : ''}
            
            <center>
              <a href="${data.cart_url}" class="button">أكمل طلبك الآن</a>
            </center>
          </div>
          <div class="footer">
            <p>${data.store_name}</p>
            <p>لإلغاء الاشتراك من هذه الرسائل، <a href="${data.unsubscribe_url}">اضغط هنا</a></p>
          </div>
        </div>
      </body>
      </html>
    `,
    }),

    /**
     * قالب إعادة تعيين كلمة المرور
     */
    passwordReset: (data) => ({
        subject: `إعادة تعيين كلمة المرور - ${data.store_name}`,
        html: `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; }
          .header { background: #495057; color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; }
          .button { display: inline-block; background: #495057; color: white; padding: 15px 40px; border-radius: 5px; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 إعادة تعيين كلمة المرور</h1>
          </div>
          <div class="content">
            <h2>مرحباً ${data.customer_name}،</h2>
            <p>تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك.</p>
            <p>إذا لم تطلب ذلك، يمكنك تجاهل هذا الإيميل.</p>
            
            <center>
              <a href="${data.reset_url}" class="button">إعادة تعيين كلمة المرور</a>
            </center>
            
            <p style="color: #999; font-size: 12px; margin-top: 30px;">
              هذا الرابط صالح لمدة ساعة واحدة فقط.
            </p>
          </div>
          <div class="footer">
            <p>${data.store_name}</p>
          </div>
        </div>
      </body>
      </html>
    `,
    }),

    /**
     * قالب تأكيد الإيميل
     */
    emailVerification: (data) => ({
        subject: `تأكيد البريد الإلكتروني - ${data.store_name}`,
        html: `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; }
          .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; }
          .button { display: inline-block; background: #11998e; color: white; padding: 15px 40px; border-radius: 5px; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✉️ تأكيد بريدك الإلكتروني</h1>
          </div>
          <div class="content">
            <h2>مرحباً ${data.customer_name}،</h2>
            <p>شكراً لتسجيلك معنا! يرجى تأكيد بريدك الإلكتروني للبدء.</p>
            
            <center>
              <a href="${data.verification_url}" class="button">تأكيد البريد</a>
            </center>
          </div>
          <div class="footer">
            <p>${data.store_name}</p>
          </div>
        </div>
      </body>
      </html>
    `,
    }),
};

/**
 * إرسال إيميل
 */
async function sendEmail({ to, template, data }) {
    try {
        const trans = initializeTransporter();

        const templateFn = templates[template];
        if (!templateFn) {
            throw new Error(`Template "${template}" not found`);
        }

        const { subject, html } = templateFn(data);

        const result = await trans.sendMail({
            from: `"${data.store_name || 'CoreFlex'}" <${process.env.SMTP_FROM || 'noreply@coreflex.app'}>`,
            to,
            subject,
            html,
        });

        console.log(`📧 Email sent to ${to}: ${result.messageId}`);

        return { success: true, messageId: result.messageId };
    } catch (error) {
        console.error('Email send error:', error);
        return { success: false, error: error.message };
    }
}

module.exports = {
    sendEmail,
    templates,
    initializeTransporter,
};

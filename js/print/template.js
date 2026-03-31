// template.js
export function buildInvoiceHTML(order, cartRowsHTML, totals) {
  // بيانات ثابتة من نموذج الفاتورة الأصلي
  const freelancerCert = "FL-765735204";
  const taxNumber = "312495447600003";
  const companyName = "منصة في خدمتك";
  const companyAddress = "المملكة العربية السعودية<br>حائل - حي النقرة - شارع سعد المشاط - مبنى 3085";
  const companyExtra = "الرقم الإضافي: 7718 - الرمز البريدي: 55431";
  const companyContact = "🌐 www.khidmatik.com<br>✉️ info@fi-khidmatik.com<br>📞 +966597771565";
  
  // الشعار - المسار الصحيح من مجلد admin/modules
  const logoUrl = "../../../images/logo.svg";
  // في حال عدم وجود الصورة، استخدم نص بديل
  const fallbackLogo = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 60'%3E%3Crect width='200' height='60' fill='%233b82f6'/%3E%3Ctext x='100' y='40' text-anchor='middle' fill='white' font-size='16' font-weight='bold'%3Eمنصة في خدمتك%3C/text%3E%3C/svg%3E";

  const customer = order.customer || {};
  const customerName = customer.name || "غير محدد";
  const customerPhone = customer.phone || "";
  const customerEmail = customer.email || "";
  const customerAddress = customer.address || "المملكة العربية السعودية";

  let paymentMethodText = order.paymentMethodName || order.paymentMethod || "-";
  let approvalHtml = "";
  if (order.approvalCode && (order.paymentMethod === "tamara" || order.paymentMethod === "tabby")) {
    approvalHtml = `<div><strong>رمز الموافقة:</strong> ${order.approvalCode}</div>`;
  }

  const shippingText = order.shippingService || "-";

  return `
    <div class="invoice-print" dir="rtl">
      <div class="invoice-header">
        <div class="header-logo">
          <img src="${logoUrl}" alt="شعار منصة في خدمتك" class="company-logo" onerror="this.onerror=null; this.src='${fallbackLogo}';">
        </div>
        <div class="header-numbers">
          <div class="cert-numbers">
            رقم شهادة العمل الحر: ${freelancerCert}<br>
            الرقم الضريبي: ${taxNumber}
          </div>
          <div class="invoice-number">
            رقم الفاتورة: ${order.orderNumber || order.id}
          </div>
        </div>
      </div>

      <div class="invoice-parties">
        <div class="invoice-from">
          <strong>مصدرة من</strong><br>
          ${companyName}<br>
          ${companyAddress}<br>
          ${companyExtra}
        </div>
        <div class="invoice-to">
          <strong>مصدرة إلى</strong><br>
          ${customerName}<br>
          ${customerAddress}<br>
          هاتف: ${customerPhone}<br>
          البريد: ${customerEmail}
        </div>
      </div>

      <div class="payment-shipping">
        <div class="payment-method">
          <strong>طريقة الدفع:</strong> ${paymentMethodText}
          ${approvalHtml}
        </div>
        <div class="shipping-method">
          <strong>خدمة الشحن:</strong> ${shippingText}
        </div>
      </div>

      <table class="products-table">
        <thead>
          <tr>
            <th>اسم المنتج</th><th>الكود</th><th>الوصف</th>
            <th>الكمية</th><th>السعر</th><th>الخصم</th><th>الإجمالي</th>
          </tr>
        </thead>
        <tbody>
          ${cartRowsHTML}
        </tbody>
      </table>

      <div class="totals-wrapper">
        <div class="totals-lines">
          <div>المجموع: ${totals.subtotal}</div>
          <div>الخصم: ${totals.discount}</div>
          <div>الضريبة: ${totals.tax}</div>
        </div>
        <div class="grand-total">
          <h2>الإجمالي: ${totals.total}</h2>
        </div>
      </div>

      <div class="contact-bar">
        ${companyContact}
      </div>

      <div class="thanks">
        شكرًا لتسوقكم معنا.
      </div>
    </div>
  `;
}

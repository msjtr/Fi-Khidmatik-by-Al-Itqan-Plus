/**
 * js/customer-print-logic.js
 * محرك طباعة الفواتير وتقارير العملاء
 * يدعم التنسيق الحراري (80mm) وتنسيق A4
 * @version 1.5.0
 */

import { formatPrice } from './modules/orders-dashboard.js';

/**
 * دالة الطباعة الرئيسية
 * @param {Object} order - بيانات الطلب بالكامل
 * @param {Object} customer - بيانات العميل المرتبطة
 */
export function printOrderInvoice(order, customer = null) {
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    
    // إعداد بيانات العميل (الدمج بين بيانات الطلب والملف الشخصي)
    const clientName = order.customerName || customer?.name || 'عميل نقدي';
    const clientPhone = order.phone || customer?.phone || 'غير مسجل';
    const clientAddress = order.address || (customer ? `${customer.city}, ${customer.district}` : 'حائل، المملكة العربية السعودية');
    
    const date = order.createdAt?.toDate ? 
                 order.createdAt.toDate().toLocaleDateString('ar-SA') : 
                 new Date().toLocaleDateString('ar-SA');

    const invoiceHtml = `
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <meta charset="UTF-8">
            <title>فاتورة رقم ${order.orderNumber || order.id.slice(0,8)}</title>
            <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap" rel="stylesheet">
            <style>
                body { font-family: 'Cairo', sans-serif; margin: 0; padding: 20px; color: #333; line-height: 1.6; }
                .invoice-box { max-width: 800px; margin: auto; border: 1px solid #eee; padding: 30px; border-radius: 10px; }
                
                .header-table { width: 100%; border-bottom: 2px solid #f97316; padding-bottom: 20px; margin-bottom: 20px; }
                .logo { width: 100px; filter: grayscale(1); }
                .company-info { text-align: left; font-size: 0.9rem; }
                
                .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
                .info-card { background: #f9fafb; padding: 15px; border-radius: 8px; border: 1px dashed #ddd; }
                .info-card h4 { margin: 0 0 10px 0; color: #f97316; border-bottom: 1px solid #eee; padding-bottom: 5px; }
                
                table.items-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                table.items-table th { background: #f3f4f6; padding: 12px; text-align: right; border-bottom: 2px solid #ddd; }
                table.items-table td { padding: 12px; border-bottom: 1px solid #eee; }
                
                .totals-area { margin-top: 20px; float: left; width: 300px; }
                .total-row { display: flex; justify-content: space-between; padding: 8px 0; }
                .grand-total { border-top: 2px solid #f97316; margin-top: 10px; padding-top: 10px; font-weight: bold; font-size: 1.2rem; color: #f97316; }
                
                .footer { margin-top: 50px; text-align: center; font-size: 0.8rem; color: #777; border-top: 1px solid #eee; padding-top: 20px; }
                .qr-placeholder { margin-top: 20px; width: 100px; height: 100px; background: #eee; display: inline-block; }
                
                @media print {
                    .no-print { display: none; }
                    body { padding: 0; }
                    .invoice-box { border: none; }
                }
            </style>
        </head>
        <body>
            <div class="no-print" style="text-align:center; margin-bottom: 20px;">
                <button onclick="window.print()" style="padding:10px 25px; background:#f97316; color:white; border:none; border-radius:5px; cursor:pointer; font-weight:bold;">إصدار الفاتورة (طباعة)</button>
            </div>

            <div class="invoice-box">
                <table class="header-table">
                    <tr>
                        <td>
                            <h2 style="margin:0; color:#1e293b;">في خدمتكم | Fi Khidmatik</h2>
                            <p style="margin:5px 0;">للاتصالات وتقنية المعلومات</p>
                            <p style="margin:0; font-size:0.8rem;">حائل - المملكة العربية السعودية</p>
                        </td>
                        <td class="company-info">
                            <p><strong>رقم الفاتورة:</strong> ${order.orderNumber || order.id.slice(0,8)}</p>
                            <p><strong>التاريخ:</strong> ${date}</p>
                            <p><strong>حالة الدفع:</strong> ${order.status || 'مكتمل'}</p>
                        </td>
                    </tr>
                </table>

                <div class="info-grid">
                    <div class="info-card">
                        <h4>بيانات العميل</h4>
                        <p><strong>الاسم:</strong> ${escapeHtml(clientName)}</p>
                        <p><strong>الجوال:</strong> <span dir="ltr">${clientPhone}</span></p>
                        <p><strong>العنوان:</strong> ${escapeHtml(clientAddress)}</p>
                    </div>
                    <div class="info-card">
                        <h4>طريقة الدفع والشحن</h4>
                        <p><strong>الوسيلة:</strong> ${order.paymentMethodName || 'نقدي'}</p>
                        <p><strong>الفرع:</strong> فرع حائل الرئيسي</p>
                    </div>
                </div>

                <table class="items-table">
                    <thead>
                        <tr>
                            <th>الصنف / الوصف</th>
                            <th style="text-align:center;">الكمية</th>
                            <th style="text-align:center;">سعر الوحدة</th>
                            <th style="text-align:left;">الإجمالي</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${(order.items || []).map(item => `
                            <tr>
                                <td>${escapeHtml(item.name)}</td>
                                <td style="text-align:center;">${item.quantity}</td>
                                <td style="text-align:center;">${item.price.toFixed(2)}</td>
                                <td style="text-align:left;">${(item.quantity * item.price).toFixed(2)} ر.س</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="totals-area">
                    <div class="total-row">
                        <span>المجموع الفرعي:</span>
                        <span>${(order.total / 1.15).toFixed(2)} ر.س</span>
                    </div>
                    <div class="total-row">
                        <span>ضريبة القيمة المضافة (15%):</span>
                        <span>${(order.total - (order.total / 1.15)).toFixed(2)} ر.س</span>
                    </div>
                    <div class="total-row grand-total">
                        <span>الإجمالي النهائي:</span>
                        <span>${order.total.toFixed(2)} ر.س</span>
                    </div>
                </div>

                <div style="clear:both;"></div>

                <div class="footer">
                    <p>شكراً لثقتكم بنا. هذه الفاتورة صدرت إلكترونياً ولا تحتاج لختم.</p>
                    <div class="qr-placeholder">
                        <!-- هنا يمكن دمج مكتبة QR Code لاحقاً -->
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=Invoice:${order.id}" alt="QR" width="100">
                    </div>
                    <p style="margin-top:10px;">www.fi-khidmatik.com</p>
                </div>
            </div>
        </body>
        </html>
    `;

    printWindow.document.write(invoiceHtml);
    printWindow.document.close();
}

/**
 * تنظيف نصوص الـ HTML للطباعة
 */
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

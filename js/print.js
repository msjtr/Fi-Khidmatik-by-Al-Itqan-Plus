// ========== دوال الطباعة والتصدير ==========
// print.js - نظام متكامل للطباعة والتصدير بجودة عالية

/**
 * طباعة الفاتورة مباشرة
 */
export function printInvoice() {
    window.print();
}

/**
 * طباعة فاتورة محددة من Firebase
 */
export async function printOrderFromFirebase(orderId) {
    showLoading('جاري تحضير الفاتورة للطباعة...');
    
    try {
        const order = await getOrderFromFirebase(orderId);
        if (!order) {
            showError('الطلب غير موجود');
            return;
        }
        
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            showError('الرجاء السماح للنوافذ المنبثقة');
            return;
        }
        
        const invoiceHTML = generateInvoiceHTML(order);
        printWindow.document.write(invoiceHTML);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        showSuccess('تم إرسال الفاتورة للطباعة');
    } catch (error) {
        console.error('Print Error:', error);
        showError('حدث خطأ في الطباعة');
    } finally {
        hideLoading();
    }
}

/**
 * توليد HTML كامل للفاتورة
 */
export function generateInvoiceHTML(order) {
    const items = order.items || order.cart || [];
    const subtotal = order.subtotal || items.reduce((s, i) => s + (i.price * i.quantity), 0);
    const discount = order.discount || 0;
    const tax = order.tax || ((subtotal - discount) * 0.15);
    const total = order.total || (subtotal - discount + tax);
    
    const statusClass = {
        'جديد': 'status-new',
        'تحت التنفيذ': 'status-processing',
        'تم التنفيذ': 'status-completed',
        'تحت المراجعة': 'status-review',
        'مسترجع': 'status-refund',
        'ملغي': 'status-cancelled'
    }[order.status] || 'status-new';
    
    const statusText = {
        'جديد': '🆕 جديد',
        'تحت التنفيذ': '⚙️ تحت التنفيذ',
        'تم التنفيذ': '✅ تم التنفيذ',
        'تحت المراجعة': '🔍 تحت المراجعة',
        'مسترجع': '↩️ مسترجع',
        'ملغي': '❌ ملغي'
    }[order.status] || order.status;
    
    const itemsHTML = items.map((item, idx) => `
        <tr>
            <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${idx + 1}</td>
            <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">
                ${item.image ? `<img src="${item.image}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;" onerror="this.style.display='none'">` : '<div style="width: 50px; height: 50px; background: #f3f4f6; border-radius: 8px; display: flex; align-items: center; justify-content: center;"><i class="fas fa-image" style="color: #9ca3af;"></i></div>'}
            </td>
            <td style="border: 1px solid #ddd; padding: 10px;"><strong>${escapeHtml(item.name)}</strong><br><small style="color: #666;">${escapeHtml(item.description || '')}</small></td>
            <td style="border: 1px solid #ddd; padding: 10; text-align: center;">${item.quantity}</td>
            <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${(item.price || 0).toFixed(2)} ريال</td>
            <td style="border: 1px solid #ddd; padding: 10px; text-align: center;">${((item.price || 0) * item.quantity).toFixed(2)} ريال</td>
        </tr>
    `).join('');
    
    const shippingMethodText = {
        'pickup': '🏪 استلام من المقر',
        'delivery': '🚚 شحن منزلي',
        'noship': '📥 لا يتطلب شحن'
    }[order.shippingMethod] || 'استلام من المقر';
    
    return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>فاتورة ${order.orderNumber}</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', 'Tahoma', 'Arial', sans-serif;
            background: #f5f5f5;
            padding: 20px;
        }
        
        .invoice-container {
            max-width: 210mm;
            margin: 0 auto;
            background: white;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        
        .invoice-page {
            padding: 15mm 12mm;
            position: relative;
        }
        
        /* Header */
        .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 3px solid #1e3a5f;
            padding-bottom: 15px;
            margin-bottom: 20px;
            flex-wrap: wrap;
        }
        
        .logo-area {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        
        .logo {
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #1e3a5f, #2d4a7a);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 24px;
        }
        
        .platform-name {
            font-size: 18px;
            font-weight: bold;
            color: #1e3a5f;
        }
        
        .invoice-title {
            font-size: 24px;
            font-weight: bold;
            color: #1e3a5f;
        }
        
        .legal-numbers {
            text-align: left;
            font-size: 11px;
            color: #666;
            line-height: 1.5;
        }
        
        /* Status Bar */
        .status-bar {
            background: #f8fafc;
            border-radius: 12px;
            padding: 12px 15px;
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
            border: 1px solid #e2e8f0;
        }
        
        .status-badge {
            background: #10b981;
            color: white;
            padding: 5px 15px;
            border-radius: 30px;
            font-size: 13px;
        }
        
        /* Addresses */
        .addresses {
            display: flex;
            gap: 20px;
            margin-bottom: 20px;
        }
        
        .address-box {
            flex: 1;
            background: #f9fafb;
            padding: 12px;
            border-radius: 12px;
            border: 1px solid #e5e7eb;
            font-size: 12px;
            line-height: 1.6;
        }
        
        .address-box strong {
            display: block;
            margin-bottom: 8px;
            color: #1e3a5f;
        }
        
        /* Payment & Shipping */
        .info-row {
            display: flex;
            gap: 20px;
            margin-bottom: 20px;
        }
        
        .info-card {
            flex: 1;
            background: #f1f5f9;
            padding: 12px;
            border-radius: 12px;
            font-size: 13px;
        }
        
        /* Table */
        .invoice-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }
        
        .invoice-table th {
            background: #1e3a5f;
            color: white;
            padding: 12px;
            border: 1px solid #2d4a7a;
            font-weight: bold;
        }
        
        .invoice-table td {
            border: 1px solid #cbd5e1;
            padding: 10px;
        }
        
        /* Totals */
        .totals {
            width: 280px;
            margin-right: auto;
            margin-top: 20px;
            margin-bottom: 30px;
        }
        
        .totals div {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            font-size: 14px;
        }
        
        .grand-total {
            font-weight: bold;
            font-size: 18px;
            color: #1e3a5f;
            border-top: 2px solid #e2e8f0;
            margin-top: 8px;
            padding-top: 12px;
        }
        
        /* QR Code */
        .qr-section {
            display: flex;
            justify-content: center;
            margin: 20px 0;
            padding: 15px;
            background: #f9fafb;
            border-radius: 12px;
        }
        
        .qr-placeholder {
            width: 100px;
            height: 100px;
            background: white;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        /* Footer */
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 11px;
            color: #666;
            border-top: 1px solid #e2e8f0;
            padding-top: 15px;
        }
        
        .contact-info {
            display: flex;
            justify-content: center;
            gap: 20px;
            margin: 10px 0;
            flex-wrap: wrap;
        }
        
        .page-number {
            text-align: left;
            font-size: 11px;
            color: #999;
            margin-top: 20px;
        }
        
        /* Print Styles */
        @media print {
            body {
                background: white;
                padding: 0;
                margin: 0;
            }
            .invoice-container {
                box-shadow: none;
                margin: 0;
            }
            .no-print {
                display: none;
            }
            button {
                display: none;
            }
            .print-button {
                display: none;
            }
        }
        
        .print-button {
            display: flex;
            justify-content: center;
            gap: 10px;
            margin-top: 20px;
            padding: 15px;
        }
        
        .btn {
            padding: 10px 20px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: bold;
        }
        
        .btn-primary {
            background: #1e3a5f;
            color: white;
        }
        
        .btn-secondary {
            background: #6c757d;
            color: white;
        }
        
        .status-new { background: #dbeafe; color: #1e40af; }
        .status-processing { background: #fef3c7; color: #b45309; }
        .status-completed { background: #d1fae5; color: #065f46; }
        .status-review { background: #e9d5ff; color: #6b21a5; }
        .status-refund { background: #fed7aa; color: #9a3412; }
        .status-cancelled { background: #fee2e2; color: #b91c1c; }
    </style>
</head>
<body>
    <div class="invoice-container">
        <div class="invoice-page">
            <!-- Header -->
            <div class="header">
                <div class="logo-area">
                    <div class="logo">
                        <i class="fas fa-store"></i>
                    </div>
                    <div>
                        <div class="platform-name">منصة في خدمتك</div>
                        <small style="color: #666;">خدمات تقنية متكاملة</small>
                    </div>
                </div>
                <div class="invoice-title">فاتورة إلكترونية</div>
                <div class="legal-numbers">
                    <div>رقم شهادة العمل الحر: FL-765735204</div>
                    <div>الرقم الضريبي: 312495447600003</div>
                </div>
            </div>
            
            <!-- Status -->
            <div class="status-bar">
                <div><strong>رقم الفاتورة:</strong> ${order.orderNumber}</div>
                <div><strong>التاريخ:</strong> ${order.orderDate} | <strong>الوقت:</strong> ${order.orderTime || '00:00'}</div>
                <div><span class="status-badge ${statusClass}">${statusText}</span></div>
            </div>
            
            <!-- Addresses -->
            <div class="addresses">
                <div class="address-box">
                    <strong><i class="fas fa-building"></i> مصدرة من</strong>
                    منصة في خدمتك<br>
                    المملكة العربية السعودية<br>
                    حائل : حي النقرة : شارع سعد المشاط<br>
                    رقم المبنى: 3085 | الرقم الإضافي: 7718<br>
                    الرمز البريدي: 55431
                </div>
                <div class="address-box">
                    <strong><i class="fas fa-user"></i> مصدرة إلى</strong>
                    ${escapeHtml(order.customerName || order.customer || 'عميل')}<br>
                    ${order.addressTo || ''}<br>
                    <strong>رقم الجوال:</strong> ${order.phone || ''}<br>
                    <strong>البريد الإلكتروني:</strong> ${order.email || ''}
                </div>
            </div>
            
            <!-- Payment & Shipping -->
            <div class="info-row">
                <div class="info-card">
                    <strong><i class="fas fa-credit-card"></i> طريقة الدفع</strong><br>
                    ${order.paymentMethodName || order.paymentMethod || 'مدى'}
                </div>
                <div class="info-card">
                    <strong><i class="fas fa-truck"></i> طريقة استلام المنتج</strong><br>
                    ${shippingMethodText}
                </div>
                <div class="info-card">
                    <strong><i class="fas fa-check-circle"></i> رمز الموافقة على الطلب</strong><br>
                    ${order.approvalCode || 'غير مطلوب'}
                </div>
            </div>
            
            <!-- Products Table -->
            <table class="invoice-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>صورة المنتج</th>
                        <th>اسم المنتج</th>
                        <th>الكمية</th>
                        <th>سعر الوحدة</th>
                        <th>الإجمالي</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHTML}
                </tbody>
            </table>
            
            <!-- Totals -->
            <div class="totals">
                <div><span>المجموع الفرعي:</span><span>${subtotal.toFixed(2)} ريال</span></div>
                <div><span>إجمالي الخصم:</span><span>- ${discount.toFixed(2)} ريال</span></div>
                <div><span>ضريبة القيمة المضافة (15%):</span><span>${tax.toFixed(2)} ريال</span></div>
                <div class="grand-total"><span>الإجمالي النهائي شامل الضريبة:</span><span>${total.toFixed(2)} ريال</span></div>
            </div>
            
            <!-- QR Code -->
            <div class="qr-section">
                <div id="zatcaQR" class="qr-placeholder"></div>
            </div>
            
            <!-- Footer -->
            <div class="footer">
                <strong>تعليمات الفاتورة:</strong> تخضع هذه الفاتورة لكامل الشروط والأحكام المرفقة<br><br>
                <strong>شكراً لتسوقكم معنا</strong><br>
                <div class="contact-info">
                    <span><i class="fas fa-phone"></i> 966534051317</span>
                    <span><i class="fab fa-whatsapp"></i> 966545312021</span>
                    <span><i class="fas fa-envelope"></i> info@fi-khidmatik.com</span>
                    <span><i class="fas fa-globe"></i> www.khidmatik.com</span>
                </div>
                <div style="margin-top: 10px;">هذه الفاتورة إلكترونية - نسخة معتمدة قانونياً</div>
            </div>
            
            <div class="page-number">صفحة 1 من 1</div>
            
            <!-- Print Buttons -->
            <div class="print-button no-print">
                <button class="btn btn-primary" onclick="window.print()"><i class="fas fa-print"></i> طباعة</button>
                <button class="btn btn-secondary" onclick="window.close()"><i class="fas fa-times"></i> إغلاق</button>
            </div>
        </div>
    </div>
    
    <script src="https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js"><\/script>
    <script>
        // ZATCA QR Code
        const sellerName = 'منصة في خدمتك';
        const vatNumber = '312495447600003';
        const timestamp = new Date().toISOString();
        const totalWithVAT = ${total};
        const vatAmount = ${tax};
        
        let tlvData = '';
        tlvData += String.fromCharCode(1) + String.fromCharCode(sellerName.length) + sellerName;
        tlvData += String.fromCharCode(2) + String.fromCharCode(vatNumber.length) + vatNumber;
        tlvData += String.fromCharCode(3) + String.fromCharCode(timestamp.length) + timestamp;
        tlvData += String.fromCharCode(4) + String.fromCharCode(totalWithVAT.toFixed(2).length) + totalWithVAT.toFixed(2);
        tlvData += String.fromCharCode(5) + String.fromCharCode(vatAmount.toFixed(2).length) + vatAmount.toFixed(2);
        
        const qrDiv = document.getElementById('zatcaQR');
        if (qrDiv) {
            new QRCode(qrDiv, {
                text: btoa(tlvData),
                width: 100,
                height: 100,
                colorDark: '#000000',
                colorLight: '#ffffff',
                correctLevel: QRCode.CorrectLevel.H
            });
        }
    <\/script>
</body>
</html>
    `;
}

/**
 * تحميل الفاتورة كملف PDF بجودة عالية
 */
export async function downloadPDF(elementId, filename = 'invoice') {
    const element = document.getElementById(elementId);
    if (!element) {
        console.error('❌ العنصر غير موجود:', elementId);
        showError('العنصر غير موجود');
        return;
    }
    
    showLoading('جاري إنشاء ملف PDF...');
    
    try {
        const canvas = await html2canvas(element, {
            scale: 3,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            allowTaint: false
        });
        
        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            unit: 'mm',
            format: 'a4',
            orientation: 'portrait'
        });
        
        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;
        
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= 297;
        
        while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= 297;
        }
        
        pdf.save(`${filename}.pdf`);
        showSuccess('تم حفظ PDF بنجاح');
    } catch (error) {
        console.error('PDF Error:', error);
        showError('حدث خطأ في إنشاء PDF');
    } finally {
        hideLoading();
    }
}

/**
 * تحميل الفاتورة كصورة PNG بدقة عالية
 */
export async function downloadPNG(elementId, filename = 'invoice') {
    const element = document.getElementById(elementId);
    if (!element) {
        console.error('❌ العنصر غير موجود:', elementId);
        showError('العنصر غير موجود');
        return;
    }
    
    showLoading('جاري إنشاء صورة PNG...');
    
    try {
        const canvas = await html2canvas(element, {
            scale: 3,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            allowTaint: false
        });
        
        const link = document.createElement('a');
        link.download = `${filename}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        showSuccess('تم حفظ PNG بنجاح');
    } catch (error) {
        console.error('PNG Error:', error);
        showError('حدث خطأ في إنشاء PNG');
    } finally {
        hideLoading();
    }
}

/**
 * تحميل الفاتورة كملف ZIP مضغوط (PDF + PNG)
 */
export async function downloadZIP(elementId, filename = 'invoice') {
    const element = document.getElementById(elementId);
    if (!element) {
        console.error('❌ العنصر غير موجود:', elementId);
        showError('العنصر غير موجود');
        return;
    }
    
    showLoading('جاري إنشاء الملف المضغوط...');
    
    try {
        const canvas = await html2canvas(element, {
            scale: 3,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            allowTaint: false
        });
        
        const zip = new JSZip();
        
        // إضافة PDF
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, imgWidth, imgHeight);
        zip.file(`${filename}.pdf`, pdf.output('blob'));
        
        // إضافة PNG
        const pngData = canvas.toDataURL('image/png').split(',')[1];
        zip.file(`${filename}.png`, pngData, { base64: true });
        
        // إنشاء ZIP
        const content = await zip.generateAsync({ type: 'blob' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = `${filename}.zip`;
        link.click();
        URL.revokeObjectURL(link.href);
        
        showSuccess('تم حفظ الملف المضغوط بنجاح');
    } catch (error) {
        console.error('ZIP Error:', error);
        showError('حدث خطأ في إنشاء الملف المضغوط');
    } finally {
        hideLoading();
    }
}

/**
 * تصدير الفاتورة كملف HTML
 */
export async function downloadHTML(elementId, filename = 'invoice') {
    const element = document.getElementById(elementId);
    if (!element) {
        console.error('❌ العنصر غير موجود:', elementId);
        showError('العنصر غير موجود');
        return;
    }
    
    showLoading('جاري إنشاء ملف HTML...');
    
    try {
        const styles = document.querySelectorAll('style');
        let stylesHTML = '';
        styles.forEach(style => {
            stylesHTML += style.innerHTML;
        });
        
        const htmlContent = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>فاتورة ${filename}</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <style>${stylesHTML}</style>
    <style>
        body {
            padding: 20px;
            background: #f5f5f5;
        }
        .print-button {
            display: flex !important;
            justify-content: center;
            gap: 10px;
            margin-top: 20px;
        }
        @media print {
            .print-button {
                display: none !important;
            }
            body {
                padding: 0;
                background: white;
            }
        }
    </style>
</head>
<body>
    ${element.outerHTML}
    <div class="print-button">
        <button onclick="window.print()" style="padding: 10px 20px; background: #1e3a5f; color: white; border: none; border-radius: 8px; cursor: pointer;">
            🖨️ طباعة
        </button>
        <button onclick="window.close()" style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 8px; cursor: pointer;">
            ✖️ إغلاق
        </button>
    </div>
</body>
</html>`;
        
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${filename}.html`;
        link.click();
        URL.revokeObjectURL(link.href);
        showSuccess('تم حفظ HTML بنجاح');
    } catch (error) {
        console.error('HTML Error:', error);
        showError('حدث خطأ في إنشاء HTML');
    } finally {
        hideLoading();
    }
}

/**
 * إنشاء باركود هيئة الزكاة والضريبة (ZATCA)
 */
export function generateZATCAQRCode(containerId, orderData) {
    const sellerName = 'منصة في خدمتك';
    const vatNumber = '312495447600003';
    const timestamp = new Date().toISOString();
    const totalWithVAT = orderData.total || 0;
    const vatAmount = orderData.tax || 0;
    
    // تشفير TLV وفق معيار هيئة الزكاة
    function encodeTLV(tag, value) {
        const tagHex = String.fromCharCode(tag);
        const lengthHex = String.fromCharCode(value.length);
        return tagHex + lengthHex + value;
    }
    
    let tlvData = '';
    tlvData += encodeTLV(1, sellerName);
    tlvData += encodeTLV(2, vatNumber);
    tlvData += encodeTLV(3, timestamp);
    tlvData += encodeTLV(4, totalWithVAT.toFixed(2));
    tlvData += encodeTLV(5, vatAmount.toFixed(2));
    
    const base64Data = btoa(tlvData);
    
    const container = document.getElementById(containerId);
    if (container && typeof QRCode !== 'undefined') {
        container.innerHTML = '';
        new QRCode(container, {
            text: base64Data,
            width: 100,
            height: 100,
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H
        });
    }
}

// ========== دوال مساعدة ==========
function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

let loadingOverlay = null;

export function showLoading(message) {
    if (!loadingOverlay) {
        loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'loadingOverlay';
        loadingOverlay.style.cssText = `
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.7); display: flex; align-items: center;
            justify-content: center; z-index: 9999; flex-direction: column;
        `;
        loadingOverlay.innerHTML = `
            <div style="background: white; padding: 25px 35px; border-radius: 16px; text-align: center;">
                <div class="loading-spinner" style="border: 4px solid #f3f3f3; border-top: 4px solid #1e3a5f; border-radius: 50%; width: 45px; height: 45px; animation: spin 1s linear infinite; margin: 0 auto 15px;"></div>
                <p id="loadingMessage" style="margin: 0; color: #333;">جاري التحميل...</p>
            </div>
        `;
        
        const style = document.createElement('style');
        style.textContent = `@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`;
        document.head.appendChild(style);
        document.body.appendChild(loadingOverlay);
    }
    const messageEl = document.getElementById('loadingMessage');
    if (messageEl) messageEl.textContent = message;
    loadingOverlay.style.display = 'flex';
}

export function hideLoading() {
    if (loadingOverlay) loadingOverlay.style.display = 'none';
}

export function showSuccess(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = '✅ ' + message;
    toast.style.cssText = `
        position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
        background: #10b981; color: white; padding: 12px 24px;
        border-radius: 8px; z-index: 10000; font-size: 14px;
        animation: slideUp 0.3s ease; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

export function showError(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.textContent = '❌ ' + message;
    toast.style.cssText = `
        position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
        background: #ef4444; color: white; padding: 12px 24px;
        border-radius: 8px; z-index: 10000; font-size: 14px;
        animation: slideUp 0.3s ease; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

export function clearToasts() {
    const toasts = document.querySelectorAll('.toast-message');
    toasts.forEach(toast => toast.remove());
}

export function removeLoadingOverlay() {
    if (loadingOverlay) {
        loadingOverlay.remove();
        loadingOverlay = null;
    }
}

// استيراد دوال Firebase (افتراضي)
import { getOrderFromFirebase } from './order.js';

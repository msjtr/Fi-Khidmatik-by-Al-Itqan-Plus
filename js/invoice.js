// ========================================
// invoice.js - دوال إنشاء الفاتورة الإلكترونية (نسخة محسنة)
// ========================================

// بيانات البائع (ثابتة)
const sellerData = {
    name: "في خدمتك",
    taxNumber: "312495447600003",
    licenseNumber: "FL-765735204",
    address: "حائل - حي النقرة - شارع سعد المشاط - مبنى 3085 - الرمز البريدي 55431",
    phone: "+966 534051317",
    whatsapp: "+966 545312021",
    email: "info@fi-khidmatik.com",
    website: "www.khidmatik.com"
};

// ========================================
// دوال مساعدة (تجنب التعارض مع print.js)
// ========================================
function cleanText(text) {
    if (!text) return '';
    let cleaned = text.replace(/[^\u0600-\u06FF\s\u0621-\u064A\u0660-\u0669\.\,\-\+\#\@\&\*\(\)]/g, '');
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    return cleaned || text;
}

function getStatusText(status) {
    const map = {
        'جديد': 'جديد',
        'تحت التنفيذ': 'قيد التنفيذ',
        'تم التنفيذ': 'مكتمل',
        'ملغي': 'ملغي',
        'مسترجع': 'مسترجع',
        'تحت المراجعة': 'تحت المراجعة'
    };
    return map[status] || status || 'مكتمل';
}

function getShippingText(method) {
    if (method === 'delivery') return 'شحن منزلي';
    if (method === 'noship') return 'لا يتطلب شحن';
    return 'استلام من المقر';
}

function getPaymentName(method) {
    const names = {
        'mada': 'مدى',
        'mastercard': 'ماستركارد',
        'visa': 'فيزا',
        'stcpay': 'STCPay',
        'tamara': 'تمارا',
        'tabby': 'تابي',
        'other': 'أخرى'
    };
    return names[method] || method || 'مدى';
}

// توليد نص QR لهيئة الزكاة (ZATCA) – مبسط
function generateZATCAQRData(order) {
    // يجب أن يكون هذا النص مطابقاً لمتطلبات الفاتورة الإلكترونية
    // يمكنك تعديله حسب الحاجة
    return JSON.stringify({
        seller_name: sellerData.name,
        tax_number: sellerData.taxNumber,
        invoice_date: order.orderDate,
        invoice_total: order.total,
        total_tax: order.tax
    });
}

// ========================================
// بناء رأس الصفحة (يستخدم sellerData)
// ========================================
function buildInvoiceHeader(title) {
    const logoPath = "images/logo.svg";
    const errorHtml = '<div class="logo-error">شعار<br>في خدمتك</div>';
    
    const rightSection = `
        <div class="header-right">
            <div class="logo-area">
                <div class="logo-img-wrapper">
                    <img src="${logoPath}" class="logo-img" alt="شعار في خدمتك" onerror="this.outerHTML = '${errorHtml}'">
                </div>
                <div class="logo-text">
                    <div class="platform-name">في خدمتك</div>
                    <div class="platform-slogan">Fi Khidmatik</div>
                </div>
            </div>
        </div>
    `;
    
    const centerSection = `
        <div class="header-center">
            <div class="page-title">${title}</div>
        </div>
    `;
    
    const leftSection = `
        <div class="header-left">
            <div class="legal-numbers">
                <div>شهادة العمل الحر: ${sellerData.licenseNumber}</div>
                <div>الرقم الضريبي: ${sellerData.taxNumber}</div>
            </div>
        </div>
    `;
    
    return `<div class="page-header">${rightSection}${centerSection}${leftSection}</div>`;
}

// ========================================
// بناء تذييل الصفحة
// ========================================
function buildInvoiceFooter(pageNum, totalPages) {
    return `
        <div class="page-footer">
            <div class="contact-info">
                <span>هاتف: ${sellerData.phone}</span>
                <span>واتساب: ${sellerData.whatsapp}</span>
                <span>بريد: ${sellerData.email}</span>
                <span>موقع: ${sellerData.website}</span>
            </div>
            <div>هذه الفاتورة إلكترونية - نسخة معتمدة قانونيا</div>
            <div class="page-number">صفحة ${pageNum} من ${totalPages}</div>
        </div>
    `;
}

// ========================================
// حساب الإجماليات (نسخة محسنة)
// ========================================
function calculateInvoiceTotals(order) {
    let subtotal = order.subtotal || 0;
    if (!subtotal && order.items) {
        subtotal = order.items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
    }
    let discount = order.discount || 0;
    let tax = order.tax || ((subtotal - discount) * 0.15);
    let total = order.total || (subtotal - discount + tax);
    return { subtotal, discount, tax, total };
}

// ========================================
// صفحة الفاتورة الرئيسية (تعتمد على دوال window إذا وجدت)
// ========================================
function buildInvoicePage(order, pageNum, totalPages) {
    // استخدام دوال مساعدة من window (إن وجدت) أو من الداخل
    const formatDate = window.formatDate || function(d) { return d; };
    const formatTime = window.formatTime || function(t) { return t; };
    const escape = window.escapeHtml || function(s) { return s; };
    
    const totals = calculateInvoiceTotals(order);
    const items = order.items || [];
    
    let itemsHtml = '';
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        itemsHtml += `
            <tr>
                <td style="text-align:center">${i+1}</td>
                <td style="text-align:center">
                    ${item.image ? `<img src="${item.image}" class="product-img" onerror="this.style.display='none'">` : '<div style="width:50px;height:50px;background:#e2e8f0;border-radius:8px;"></div>'}
                </td>
                <td style="text-align:right"><strong>${escape(cleanText(item.productName || item.name))}</strong><br><small>${escape(cleanText(item.description))}</small></td>
                <td style="text-align:center">${item.quantity}</td>
                <td style="text-align:center">${(item.price || 0).toFixed(2)} ريال</td>
                <td style="text-align:center">${((item.price || 0) * (item.quantity || 1)).toFixed(2)} ريال</td>
            </tr>
        `;
    }
    
    return `
        <div class="page invoice-page">
            ${buildInvoiceHeader('فاتورة إلكترونية')}
            
            <div class="info-grid">
                <div class="info-item"><div class="info-label">رقم الفاتورة</div><div class="info-value">${escape(order.orderNumber)}</div></div>
                <div class="info-item"><div class="info-label">التاريخ</div><div class="info-value">${formatDate(order.orderDate)} - ${formatTime(order.orderTime)}</div></div>
                <div class="info-item"><div class="info-label">الحالة</div><div class="status-badge">${getStatusText(order.status)}</div></div>
            </div>
            
            <div class="addresses">
                <div class="address-card">
                    <strong>مصدرة من</strong>
                    ${sellerData.name}<br>
                    المملكة العربية السعودية<br>
                    ${sellerData.address}<br>
                    ${sellerData.phone}
                </div>
                <div class="address-card">
                    <strong>مصدرة إلى</strong>
                    ${escape(order.customerName)}<br>
                    ${escape(order.customerAddress)}<br>
                    ${escape(order.customerPhone)}<br>
                    ${escape(order.customerEmail)}
                </div>
            </div>
            
            <div class="payment-grid">
                <div class="payment-card"><strong>طريقة الدفع</strong><br>${getPaymentName(order.paymentMethod)}</div>
                <div class="payment-card"><strong>طريقة الاستلام</strong><br>${getShippingText(order.shippingMethod)}</div>
                <div class="payment-card"><strong>رمز الموافقة</strong><br>${order.approvalCode || 'غير مطلوب'}</div>
            </div>
            
            <table class="products-table">
                <thead>
                    <tr><th>#</th><th>الصورة</th><th>المنتج</th><th>الكمية</th><th>السعر</th><th>الإجمالي</th></tr>
                </thead>
                <tbody>${itemsHtml}</tbody>
            </table>
            
            <div class="totals-box">
                <div class="totals-row"><span>المجموع الفرعي</span><span>${totals.subtotal.toFixed(2)} ريال</span></div>
                ${totals.discount > 0 ? `<div class="totals-row"><span>الخصم</span><span>- ${totals.discount.toFixed(2)} ريال</span></div>` : ''}
                <div class="totals-row"><span>ضريبة القيمة المضافة 15%</span><span>${totals.tax.toFixed(2)} ريال</span></div>
                <div class="totals-row grand-total"><span>الإجمالي النهائي</span><span>${totals.total.toFixed(2)} ريال</span></div>
            </div>
            
            <div class="barcodes">
                <div class="barcode-right"><div class="barcode-item"><div id="zatcaQR" class="qr-code"></div><p>باركود هيئة الزكاة</p></div></div>
                <div class="barcode-center"><div class="barcode-item"><div id="orderQR" class="qr-code"></div><p>باركود الطلب</p></div></div>
                <div class="barcode-left"><div class="barcode-item"><div id="downloadQR" class="qr-code"></div><p>باركود التحميل</p></div></div>
            </div>
            
            ${buildInvoiceFooter(pageNum, totalPages)}
        </div>
    `;
}

// ========================================
// جلب الطلب من Firebase (Firestore v9)
// ========================================
async function fetchOrderData(db, orderId) {
    if (!db) throw new Error('Firestore غير مهيأ');
    const { doc, getDoc, collection, getDocs } = await import("https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js");
    
    const orderRef = doc(db, "orders", orderId);
    const orderSnap = await getDoc(orderRef);
    if (!orderSnap.exists()) throw new Error('الطلب غير موجود');
    const order = { id: orderSnap.id, ...orderSnap.data() };
    
    let customer = { name: 'غير معروف', phone: '', email: '', address: '' };
    if (order.customerId) {
        try {
            const customerRef = doc(db, "customers", order.customerId);
            const customerSnap = await getDoc(customerRef);
            if (customerSnap.exists()) customer = customerSnap.data();
        } catch(e) {}
    }
    
    const items = [];
    for (let item of (order.items || [])) {
        let productImage = item.image || '';
        let productName = cleanText(item.name) || 'منتج';
        let productDesc = cleanText(item.description) || '';
        
        if (item.productId && item.productId !== 'null' && !item.productId.startsWith('temp_')) {
            try {
                const productRef = doc(db, "products", item.productId);
                const productSnap = await getDoc(productRef);
                if (productSnap.exists()) {
                    const product = productSnap.data();
                    productImage = product.image || productImage;
                    productName = cleanText(product.name) || productName;
                    productDesc = cleanText(product.description) || productDesc;
                }
            } catch(e) {}
        }
        
        items.push({
            productName: productName,
            description: productDesc,
            image: productImage,
            quantity: item.quantity || 1,
            price: item.price || 0
        });
    }
    
    return {
        orderNumber: order.orderNumber,
        orderDate: order.orderDate,
        orderTime: order.orderTime,
        status: order.status,
        customerName: customer.name,
        customerPhone: customer.phone,
        customerEmail: customer.email,
        customerAddress: customer.address || '',
        shippingMethod: order.shippingMethod,
        paymentMethod: order.paymentMethod,
        paymentMethodName: getPaymentName(order.paymentMethod),
        approvalCode: order.approvalCode,
        items: items,
        subtotal: order.subtotal,
        discount: order.discount,
        tax: order.tax,
        total: order.total
    };
}

// ========================================
// تحميل وعرض الفاتورة (دالة رئيسية)
// ========================================
let currentOrder = null;

async function loadInvoice(firebaseDb) {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('id');
    if (!orderId || orderId === 'null') {
        document.getElementById('invoiceRoot').innerHTML = '<div class="page" style="text-align:center"><h2>خطأ</h2><p>لم يتم تحديد رقم الطلب</p></div>';
        return;
    }
    
    if (window.showLoading) window.showLoading('جاري تحميل الفاتورة...');
    else console.log('Loading...');
    
    try {
        const order = await fetchOrderData(firebaseDb, orderId);
        currentOrder = order;
        
        let html = buildInvoicePage(order, 1, 4);
        
        // إضافة صفحات الشروط والأحكام إذا كانت موجودة
        if (typeof window.buildTermsPage1 === 'function') {
            html += window.buildTermsPage1(2, 4);
            html += window.buildTermsPage2(3, 4);
            if (typeof window.buildTermsPage3 === 'function') {
                html += window.buildTermsPage3(order, { name: order.customerName }, order.orderDate, order.orderTime, 4, 4);
            }
        }
        
        document.getElementById('invoiceRoot').innerHTML = html;
        
        // إنشاء QR codes بعد تحميل DOM
        setTimeout(() => {
            if (typeof QRCode !== 'undefined') {
                const zatcaDiv = document.getElementById('zatcaQR');
                if (zatcaDiv) {
                    try {
                        const zatcaData = generateZATCAQRData(order);
                        new QRCode(zatcaDiv, { text: zatcaData, width: 90, height: 90 });
                    } catch(e) { console.log('ZATCA QR Error:', e); }
                }
                const orderDiv = document.getElementById('orderQR');
                if (orderDiv) {
                    try {
                        new QRCode(orderDiv, { text: window.location.href, width: 90, height: 90 });
                    } catch(e) {}
                }
                const downloadDiv = document.getElementById('downloadQR');
                if (downloadDiv) {
                    try {
                        const downloadUrl = window.location.origin + window.location.pathname + '?id=' + orderId;
                        new QRCode(downloadDiv, { text: downloadUrl, width: 90, height: 90 });
                    } catch(e) {}
                }
            }
        }, 200);
        
        if (window.showToast) window.showToast('تم تحميل الفاتورة بنجاح', false);
    } catch (error) {
        console.error(error);
        document.getElementById('invoiceRoot').innerHTML = `<div class="page" style="text-align:center"><h2>خطأ</h2><p>${error.message}</p><button onclick="location.reload()">إعادة المحاولة</button></div>`;
        if (window.showToast) window.showToast(error.message, true);
    } finally {
        if (window.hideLoading) window.hideLoading();
    }
}

// ========================================
// تصدير الدوال المستخدمة خارجياً
// ========================================
window.sellerData = sellerData;
window.buildInvoiceHeader = buildInvoiceHeader;
window.buildInvoiceFooter = buildInvoiceFooter;
window.buildInvoicePage = buildInvoicePage;
window.calculateInvoiceTotals = calculateInvoiceTotals;
window.fetchOrderData = fetchOrderData;
window.loadInvoice = loadInvoice;
window.generateZATCAQRData = generateZATCAQRData;

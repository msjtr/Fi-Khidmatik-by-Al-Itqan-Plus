// داخل ملف js/print.js وتحديداً داخل دالة window.onload

// ... (بعد جلب order و customer و seller)

// التصحيح هنا: استخدمنا seller.name بدلاً من seller.sellerName
let html = `
<div class="page">
    <div class="header">// js/print.js
import { TERMS_DATA } from './terms.js';
import { generateAllInvoiceQRs } from './zatca.js';

window.onload = async () => {
    const id = new URLSearchParams(window.location.search).get('id');
    if (!id) return;

    try {
        // 1. جلب البيانات من Firebase
        const order = await window.getDocument("orders", id);
        const customer = await window.getDocument("customers", order.customerId);
        
        // 2. تعريف seller (تأكد أن السطر أدناه موجود قبل استخدامه)
        const seller = window.invoiceSettings; 

        if (!seller) {
            console.error("خطأ: لم يتم العثور على إعدادات البائع في window.invoiceSettings");
            return;
        }

        // 3. بناء واجهة الطباعة (الآن يمكنك استخدام seller بأمان)
        let html = `
        <div class="page">
            <div class="header">
                <div class="logo">
                    <img src="images/logo.svg" onerror="this.src='https://via.placeholder.com/150'">
                    <div style="font-weight:800; color:#1e3a5f;">
                        ${seller.name} <br>
                        <small>${seller.slogan || ''}</small>
                    </div>
                </div>
                <div class="doc-label">فاتورة إلكترونية</div>
            </div>
            </div>`;

        // ... تكملة الكود
        document.getElementById('print-app').innerHTML = html;
        generateAllInvoiceQRs(order, seller);
        document.getElementById('loader').style.display = 'none';

    } catch (e) {
        console.error("Print Error:", e);
    }
};
        <div class="logo">
            <img src="images/logo.svg" onerror="this.src='https://via.placeholder.com/150'">
            <div style="font-weight:800; color:#1e3a5f; margin-top:5px;">
                ${seller.name} <br> 
                <small>${seller.slogan || ''}</small>
            </div>
        </div>
        <div class="doc-label">فاتورة إلكترونية</div>
        <div class="header-meta">
            الرقم الضريبي: ${seller.taxNumber} <br>
            العمل الحر: ${seller.licenseNumber}
        </div>
    </div>

    <div class="grid-2">
        <div class="card">
            <div class="card-h">بيانات المتجر (المصدر)</div>
            <div class="card-b">
                ${seller.address} <br>
                التواصل: ${seller.phone}
            </div>
        </div>
        <div class="card">
            <div class="card-h">بيانات العميل (المستلم)</div>
            <div class="card-b">
                <b>${customer.name || 'عميل كرام'}</b> <br>
                الجوال: ${customer.phone || '---'}
            </div>
        </div>
    </div>
    
    `;

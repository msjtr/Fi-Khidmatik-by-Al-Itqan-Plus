import { db } from './firebase.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('id');

    if (!orderId) {
        alert("عذراً، لم يتم العثور على رقم الطلب.");
        return;
    }

    try {
        const docRef = doc(db, "orders", orderId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            renderOrderData(data);
        } else {
            document.body.innerHTML = "<h1>عذراً، الطلب غير موجود في القاعدة</h1>";
        }
    } catch (error) {
        console.error("Error fetching order:", error);
    }
});

function renderOrderData(data) {
    // 1. بيانات الفاتورة الأساسية (الوقت والتاريخ)
    setText('inv-number', data.orderNumber);
    setText('inv-date', data.orderDate);
    setText('inv-time', data.orderTime || "---");

    // 2. بيانات العميل الكاملة من الـ Snapshot
    const cust = data.customerSnapshot || {};
    setText('cust-name', cust.name);
    setText('cust-phone', cust.phone);
    setText('cust-email', cust.email || '---');
    
    // العنوان التفصيلي
    const addr = cust.address || {};
    const fullAddress = `${addr.city || ''} - ${addr.district || ''} - ${addr.street || ''} (مبنى: ${addr.building || ''})`;
    setText('cust-address', fullAddress);
    setText('cust-postal', addr.postal || '---');

    // 3. عرض المنتجات (مع الصورة والوصف)
    const itemsContainer = document.getElementById('items-container');
    if (itemsContainer && data.items) {
        itemsContainer.innerHTML = data.items.map(item => `
            <div class="flex items-center gap-4 border-b py-4">
                ${item.image ? `<img src="${item.image}" class="w-16 h-16 rounded-lg object-cover">` : '<div class="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-400">لا توجد صورة</div>'}
                <div class="flex-1">
                    <h4 class="font-bold text-slate-800">${item.name}</h4>
                    <div class="text-xs text-gray-500 mt-1">${item.desc || 'لا يوجد وصف'}</div>
                    <div class="text-xs text-blue-600 font-mono mt-1">SKU: ${item.sku || '---'}</div>
                </div>
                <div class="text-left">
                    <div class="font-bold">${item.price} ر.س</div>
                    <div class="text-xs text-gray-400">الكمية: ${item.qty}</div>
                </div>
            </div>
        `).join('');
    }

    // 4. الإجماليات والضريبة
    const totals = data.totals || {};
    setText('inv-subtotal', totals.subtotal);
    setText('inv-tax', totals.tax);
    setText('inv-total', totals.total);

    // 5. طريقة الدفع والشحن
    setText('inv-pay-method', data.payment?.method || '---');
    setText('inv-shipping', data.shipping?.type || 'استلام من المقر');

    // 6. توليد QR Code للزكاة والدخل
    generateZakatQR(data);
}

// دالة مساعدة لتجنب الأخطاء في حال عدم وجود العنصر في الـ HTML
function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.innerText = value || "---";
}

function generateZakatQR(data) {
    const qrContainer = document.getElementById('qrcode');
    if (!qrContainer) return;
    
    // نص الـ QR المتوافق مع متطلبات الفاتورة الضريبية
    const qrContent = `Seller: Tera\nVAT: 300000000000003\nDate: ${data.orderDate} ${data.orderTime}\nTotal: ${data.totals?.total}\nTax: ${data.totals?.tax}`;
    
    new QRCode(qrContainer, {
        text: qrContent,
        width: 128,
        height: 128
    });
}

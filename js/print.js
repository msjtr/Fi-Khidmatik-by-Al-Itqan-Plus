import { db } from './firebase.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    if (!id) {
        console.error("رقم الطلب مفقود");
        return;
    }

    try {
        const docRef = doc(db, "orders", id);
        const snap = await getDoc(docRef);
        
        if (snap.exists()) {
            renderInvoice(snap.data());
            // إظهار المحتوى بعد التحميل
            document.getElementById('print-app')?.classList.remove('hidden');
            document.getElementById('loader')?.classList.add('hidden');
        } else {
            document.body.innerHTML = "<div class='text-center py-20'><h1>عذراً، الفاتورة غير موجودة</h1></div>";
        }
    } catch (error) {
        console.error("Error fetching invoice:", error);
    }
});

function renderInvoice(data) {
    // 1. تأمين بيانات العميل (اللقطة) لضمان عدم توقف الكود (Crash Prevention)
    const cust = data.customerSnapshot || {};
    const addr = cust.address || {};

    setSafeText('inv-cust-name', cust.name);
    setSafeText('inv-cust-phone', cust.phone);
    
    // تركيب العنوان بشكل آمن
    const fullAddr = [addr.city, addr.street].filter(Boolean).join(' - ') || '---';
    setSafeText('inv-cust-address', fullAddr);
    
    // 2. الوقت والتاريخ
    setSafeText('inv-date', data.orderDate);
    setSafeText('inv-time', data.orderTime);
    setSafeText('inv-no', data.orderNumber);

    // 3. المنتجات (دعم الهيكل القديم والجديد)
    const itemsContainer = document.getElementById('inv-items');
    if (itemsContainer && data.items) {
        itemsContainer.innerHTML = data.items.map(item => `
            <div class="flex justify-between border-b py-3 text-sm">
                <div class="flex flex-col">
                    <span class="font-bold text-slate-800">${item.name || 'منتج'}</span>
                    <span class="text-[10px] text-slate-400">الكمية: ${item.qty || 1}</span>
                </div>
                <span class="font-black">${item.total || (parseFloat(item.price || 0) * (item.qty || 1))} ر.س</span>
            </div>
        `).join('');
    }

    // 4. الإجماليات (دعم مرن)
    const totalVal = data.totals?.total || data.total || "0.00";
    setSafeText('inv-total', totalVal);

    // 5. توليد QR الزكاة (بشرط وجود المكتبة والحاوية)
    const qrContainer = document.getElementById("qrcode");
    if (qrContainer && typeof QRCode !== 'undefined') {
        qrContainer.innerHTML = ""; // تنظيف لتجنب التكرار
        const qrText = `Seller: Tera | VAT: 300000000000003 | Date: ${data.orderDate} | Total: ${totalVal}`;
        new QRCode(qrContainer, {
            text: qrText,
            width: 120,
            height: 120,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });
    }
}

// دالة مساعدة لمنع توقف الكود في حال فقدان عنصر بالـ HTML
function setSafeText(id, value) {
    const el = document.getElementById(id);
    if (el) el.innerText = value || "---";
}

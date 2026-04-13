import { db } from './orders-firebase-db.js';
import { getOrders, getStock, deleteOrder, toast } from './orders-logic.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

const container = document.getElementById('ordersContainer');

// دالة المعاينة والطباعة (تعمل مع البيانات القديمة والجديدة)
window.openPreview = function(order) {
    const area = document.getElementById('printArea');
    if (!area) return;

    area.innerHTML = `
        <div style="direction: rtl; text-align: right; padding: 25px; border: 2px solid #2563eb; border-radius: 15px; font-family: sans-serif;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h1 style="color: #2563eb; margin: 0;">منصة تيرا | TERA</h1>
                <p>فاتورة مبيعات رقم: ${order.orderNumber || 'KF-OLD'}</p>
            </div>
            <hr>
            <div style="margin: 20px 0; line-height: 1.8;">
                <p><b>اسم العميل:</b> ${order.customerName}</p>
                <p><b>رقم الجوال:</b> ${order.phone}</p>
                <p><b>الباقة/المنتج:</b> ${order.packageName}</p>
                <p><b>طريقة الدفع:</b> ${order.paymentMethod || 'غير محدد'}</p>
            </div>
            <div style="text-align: center; border-top: 2px solid #2563eb; padding-top: 15px; margin-top: 20px;">
                <h2 style="margin: 0;">الإجمالي: ${order.price} ريال</h2>
            </div>
        </div>
    `;

    const modal = document.getElementById('previewModal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }

    // ربط الأزرار بطريقة آمنة (فقط إذا كانت موجودة)
    const downloadBtn = document.getElementById('downloadPdfBtn');
    if (downloadBtn) {
        downloadBtn.onclick = () => {
            const opt = { margin: 1, filename: `Tera-${order.customerName}.pdf`, html2canvas: { scale: 2 }, jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' } };
            html2pdf().from(area).set(opt).save();
        };
    }

    const printBtn = document.getElementById('directPrintBtn');
    if (printBtn) {
        printBtn.onclick = () => window.print();
    }
};

async function render() {
    if (!container) return;
    
    container.innerHTML = '<p class="col-span-full text-center py-10 font-bold text-blue-500">جاري استدعاء كافة بياناتك القديمة من Firebase...</p>';
    
    const orders = await getOrders();
    container.innerHTML = '';

    if (orders.length === 0) {
        container.innerHTML = '<p class="col-span-full text-center py-10 text-gray-400">لا توجد سجلات في مجموعة orders</p>';
    }

    orders.forEach(order => {
        const div = document.createElement('div');
        div.className = "bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition";
        div.innerHTML = `
            <div class="flex justify-between mb-2 text-xs font-bold text-blue-600">
                <span>${order.orderNumber || 'KF-OLD'}</span>
                <button class="del-btn text-red-300 hover:text-red-500 transition"><i class="fas fa-trash"></i></button>
            </div>
            <h4 class="font-bold text-lg">${order.customerName}</h4>
            <p class="text-xs text-gray-500 mb-4">${order.packageName}</p>
            <div class="flex justify-between items-center border-t mt-4 pt-4">
                <span class="font-bold text-blue-600">${order.price} ريال</span>
                <button class="preview-btn bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm hover:bg-blue-700">معاينة وطباعة</button>
            </div>
        `;
        div.querySelector('.del-btn').onclick = async () => { if(await deleteOrder(order.id)) render(); };
        div.querySelector('.preview-btn').onclick = () => openPreview(order);
        container.appendChild(div);
    });

    // جلب المنتجات لتحديث القائمة
    const products = await getStock();
    const select = document.getElementById('stockSelect');
    if (select) {
        select.innerHTML = products.map(p => `<option value="${p.price}">${p.name}</option>`).join('');
    }
}

// كود الإغلاق الآمن
document.addEventListener('click', (e) => {
    if (e.target.id === 'closePreviewBtn' || e.target.closest('#closePreviewBtn')) {
        const modal = document.getElementById('previewModal');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    }
});

window.addEventListener('DOMContentLoaded', render);

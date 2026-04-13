import { db } from './orders-firebase-db.js';
import { getOrders, getStock, deleteOrder, toast } from './orders-logic.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

const container = document.getElementById('ordersContainer');

// دالة المعاينة والطباعة
window.openPreview = function(order) {
    const area = document.getElementById('printArea');
    area.innerHTML = `
        <div style="direction: rtl; text-align: right; padding: 25px; border: 2px solid #2563eb; border-radius: 15px; font-family: sans-serif;">
            <h2 style="text-align: center; color: #2563eb;">منصة تيرا | TERA</h2>
            <hr>
            <p><b>رقم الطلب:</b> ${order.orderNumber}</p>
            <p><b>العميل:</b> ${order.customerName}</p>
            <p><b>الجوال:</b> ${order.phone}</p>
            <p><b>الباقة:</b> ${order.packageName}</p>
            <div style="text-align: center; border-top: 2px solid #2563eb; margin-top: 20px; padding-top: 15px;">
                <h3 style="margin: 0;">الإجمالي: ${order.price} ريال</h3>
            </div>
        </div>
    `;
    document.getElementById('previewModal').classList.remove('hidden');
    document.getElementById('previewModal').classList.add('flex');

    // تفعيل الطباعة و PDF
    document.getElementById('downloadPdfBtn').onclick = () => {
        const opt = { margin: 1, filename: `Tera-${order.customerName}.pdf`, html2canvas: { scale: 2 }, jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' } };
        html2pdf().from(area).set(opt).save();
    };
    document.getElementById('directPrintBtn').onclick = () => window.print();
};

async function render() {
    container.innerHTML = '<p class="col-span-full text-center py-10">جاري استدعاء كافة سجلاتك القديمة...</p>';
    const orders = await getOrders();
    container.innerHTML = '';

    orders.forEach(order => {
        const div = document.createElement('div');
        div.className = "bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition";
        div.innerHTML = `
            <div class="flex justify-between mb-2 text-xs font-bold text-blue-600">
                <span>${order.orderNumber}</span>
                <button class="del-btn text-red-300 hover:text-red-500"><i class="fas fa-trash"></i></button>
            </div>
            <h4 class="font-bold text-lg">${order.customerName}</h4>
            <div class="flex justify-between items-center border-t mt-4 pt-4">
                <span class="font-bold text-blue-600">${order.price} ريال</span>
                <button class="preview-btn bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm hover:bg-blue-700">معاينة وطباعة</button>
            </div>
        `;
        div.querySelector('.del-btn').onclick = async () => { if(await deleteOrder(order.id)) render(); };
        div.querySelector('.preview-btn').onclick = () => openPreview(order);
        container.appendChild(div);
    });

    // تعبئة المنتجات من مجموعة products
    const products = await getStock();
    const select = document.getElementById('stockSelect');
    if(select) select.innerHTML = products.map(p => `<option value="${p.price}">${p.name}</option>`).join('');
}

document.getElementById('closePreviewBtn').onclick = () => document.getElementById('previewModal').classList.add('hidden');

window.addEventListener('DOMContentLoaded', render);

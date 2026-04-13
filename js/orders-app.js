import { db } from './orders-firebase-db.js';
import { getOrders, getStock, deleteOrder, toast } from './orders-logic.js';
import { collection, addDoc, serverTimestamp, getDocs } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

const container = document.getElementById('ordersContainer');

// دالة المعاينة والطباعة الشاملة
window.openPreview = function(order) {
    const area = document.getElementById('printArea');
    area.innerHTML = `
        <div style="direction: rtl; text-align: right; font-family: Arial, sans-serif; padding: 30px; border: 2px solid #2563eb; border-radius: 15px;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h1 style="color: #2563eb; margin: 0;">منصة تيرا | TERA</h1>
                <p>فاتورة مبيعات رقم: ${order.orderNumber}</p>
            </div>
            <hr>
            <div style="margin: 20px 0;">
                <p><strong>اسم العميل:</strong> ${order.customerName}</p>
                <p><strong>رقم الجوال:</strong> ${order.phone}</p>
                <p><strong>الباقة/المنتج:</strong> ${order.packageName}</p>
                <p><strong>طريقة الدفع:</strong> ${order.paymentMethod}</p>
            </div>
            <div style="text-align: center; border-top: 2px solid #2563eb; padding-top: 15px; margin-top: 20px;">
                <h2 style="margin: 0;">الإجمالي: ${order.price} ريال</h2>
            </div>
        </div>
    `;
    document.getElementById('previewModal').classList.remove('hidden');
    document.getElementById('previewModal').classList.add('flex');

    // تفعيل زر PDF
    document.getElementById('downloadPdfBtn').onclick = () => {
        const opt = { margin: 1, filename: `Tera-${order.customerName}.pdf`, html2canvas: { scale: 2 }, jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' } };
        html2pdf().from(area).set(opt).save();
    };
    // تفعيل زر الطباعة
    document.getElementById('directPrintBtn').onclick = () => window.print();
};

async function render() {
    container.innerHTML = '<p class="col-span-full text-center py-10">جاري استدعاء كافة الملفات من المجموعات الثلاث...</p>';
    const orders = await getOrders();
    container.innerHTML = '';

    orders.forEach(order => {
        const div = document.createElement('div');
        div.className = "bg-white p-6 rounded-2xl shadow-md border border-gray-100 transform transition hover:scale-105";
        div.innerHTML = `
            <div class="flex justify-between mb-3 text-xs font-bold text-blue-600">
                <span>${order.orderNumber}</span>
                <button class="del-btn text-red-300 hover:text-red-600 transition"><i class="fas fa-trash"></i></button>
            </div>
            <h4 class="font-extrabold text-xl mb-1">${order.customerName}</h4>
            <p class="text-sm text-gray-500 mb-4">${order.packageName}</p>
            <div class="flex justify-between items-center border-t pt-4">
                <span class="font-bold text-blue-600 text-lg">${order.price} ريال</span>
                <button class="view-btn bg-blue-600 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md hover:bg-blue-700">معاينة وطباعة</button>
            </div>
        `;
        div.querySelector('.del-btn').onclick = async () => { if(await deleteOrder(order.id)) render(); };
        div.querySelector('.view-btn').onclick = () => openPreview(order);
        container.appendChild(div);
    });

    // تعبئة قائمة المنتجات من مجموعة products
    const products = await getStock();
    const stockSelect = document.getElementById('stockSelect');
    if(stockSelect) {
        stockSelect.innerHTML = products.map(p => `<option value="${p.price}">${p.name} - ${p.price} ريال</option>`).join('');
    }
}

// إغلاق المعاينة
const closePreview = document.getElementById('closePreviewBtn');
if(closePreview) closePreview.onclick = () => document.getElementById('previewModal').classList.add('hidden');

window.addEventListener('DOMContentLoaded', render);

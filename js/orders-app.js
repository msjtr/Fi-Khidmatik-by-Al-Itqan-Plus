import { db } from './orders-firebase-db.js';
import { getOrders, getStock, deleteOrder, toast } from './orders-logic.js';
import { collection, addDoc, updateDoc, doc, serverTimestamp, getDocs } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

const container = document.getElementById('ordersContainer');
const orderForm = document.getElementById('orderForm');

// 1. جلب الأسماء فقط من مجموعة customers (بياناتك القديمة)
async function loadOldCustomerNames() {
    const snap = await getDocs(collection(db, "customers"));
    const select = document.getElementById('dbCustomerSelect');
    
    // استخراج الأسماء الفريدة فقط
    const names = [...new Set(snap.docs.map(d => d.data().name || d.data().customerName).filter(Boolean))];
    
    select.innerHTML = '<option value="">-- اختر اسماً من سجلاتك --</option>' + 
        names.map(name => `<option value="${name}">${name}</option>`).join('');
}

// 2. إصلاح ميزة المعاينة والطباعة
window.openPreview = function(order) {
    const area = document.getElementById('printArea');
    area.innerHTML = `
        <div style="border: 2px solid #2563eb; padding: 25px; border-radius: 15px; direction: rtl; text-align: right;">
            <h2 style="text-align: center; color: #2563eb;">منصة تيرا - فاتورة طلب</h2>
            <hr>
            <p><b>رقم الطلب:</b> ${order.orderNumber}</p>
            <p><b>اسم العميل:</b> ${order.customerName}</p>
            <p><b>رقم الجوال:</b> ${order.phone}</p>
            <p><b>المنتج:</b> ${order.packageName}</p>
            <p><b>المبلغ:</b> ${order.price} ريال</p>
            <p><b>التاريخ:</b> ${new Date().toLocaleDateString('ar-SA')}</p>
        </div>
    `;
    document.getElementById('previewModal').classList.remove('hidden');
    document.getElementById('previewModal').classList.add('flex');
    
    // ربط زر الـ PDF
    document.getElementById('downloadPdfBtn').onclick = () => {
        const opt = { margin: 1, filename: `Tera-${order.customerName}.pdf`, html2canvas: { scale: 2 }, jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' } };
        html2pdf().from(area).set(opt).save();
    };
};

// 3. عرض الطلبات وتعبئة القوائم
async function init() {
    container.innerHTML = '<p class="col-span-full text-center">جاري استعادة بياناتك القديمة...</p>';
    const orders = await getOrders();
    container.innerHTML = '';

    orders.forEach(order => {
        const div = document.createElement('div');
        div.className = "bg-white p-5 rounded-2xl shadow-sm border border-gray-100";
        div.innerHTML = `
            <div class="flex justify-between mb-2">
                <span class="text-xs font-bold text-blue-600">${order.orderNumber}</span>
                <div class="flex gap-2">
                    <button class="edit-btn text-green-500"><i class="fas fa-edit text-sm"></i></button>
                    <button class="del-btn text-red-300"><i class="fas fa-trash text-sm"></i></button>
                </div>
            </div>
            <h4 class="font-bold">${order.customerName}</h4>
            <div class="flex justify-between items-center border-t mt-4 pt-4">
                <span class="font-bold text-blue-600">${order.price} ريال</span>
                <button class="preview-btn bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-xs font-bold">معاينة</button>
            </div>
        `;
        div.querySelector('.del-btn').onclick = async () => { if(await deleteOrder(order.id)) init(); };
        div.querySelector('.preview-btn').onclick = () => openPreview(order);
        div.querySelector('.edit-btn').onclick = () => openEdit(order);
        container.appendChild(div);
    });

    const products = await getStock();
    document.getElementById('stockSelect').innerHTML = products.map(p => `<option value="${p.price}">${p.name}</option>`).join('');
    loadOldCustomerNames();
}

// 4. الحفظ (إضافة لـ orders وتحديث customers)
orderForm.onsubmit = async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    btn.disabled = true;

    const data = {
        orderNumber: document.getElementById('orderNumber').value,
        customerName: document.getElementById('custName').value,
        phone: document.getElementById('custPhone').value,
        packageName: document.getElementById('stockSelect').options[document.getElementById('stockSelect').selectedIndex].text,
        price: document.getElementById('stockSelect').value,
        paymentMethod: document.getElementById('paymentMethod').value,
        createdAt: serverTimestamp()
    };

    try {
        await addDoc(collection(db, "orders"), data);
        toast("تم تسجيل الطلب واستخدام بياناتك القديمة بنجاح");
        document.getElementById('orderModal').classList.add('hidden');
        init();
    } catch(e) { toast("حدث خطأ في الاتصال", "error"); }
    finally { btn.disabled = false; }
};

window.addEventListener('DOMContentLoaded', init);

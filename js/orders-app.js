// js/orders-app.js
import { getOrders, getStock, deleteOrder, toast } from './orders-logic.js';
import { db } from './orders-firebase-db.js';
import { collection, addDoc, updateDoc, doc, serverTimestamp, getDocs } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

const container = document.getElementById('ordersContainer');
const orderForm = document.getElementById('orderForm');
const orderModal = document.getElementById('orderModal');
const stockSelect = document.getElementById('stockSelect');

// --- 1. دوال التحكم في الواجهة (فتح وإغلاق المودال) ---

function openModal(isEdit = false) {
    orderModal.classList.remove('hidden');
    orderModal.classList.add('flex');
    if (!isEdit) {
        orderForm.reset();
        document.getElementById('editOrderId').value = "";
        document.getElementById('modalTitle').textContent = "إنشاء طلب جديد";
        // تعيين الوقت الحالي تلقائياً
        document.getElementById('orderDateTime').value = new Date().toISOString().slice(0, 16);
    }
}

function closeModal() {
    orderModal.classList.add('hidden');
    orderModal.classList.remove('flex');
}

// --- 2. دالة التعديل (التي كانت تسبب الخطأ) ---

window.openEdit = function(order) {
    document.getElementById('modalTitle').textContent = "تعديل بيانات الطلب";
    document.getElementById('editOrderId').value = order.id;
    document.getElementById('orderNumber').value = order.orderNumber || "";
    document.getElementById('orderDateTime').value = order.orderDateTime || "";
    document.getElementById('custName').value = order.customerName || order.name || "";
    document.getElementById('custPhone').value = order.phone || order.mobile || "";
    document.getElementById('region').value = order.address?.region || "";
    document.getElementById('city').value = order.address?.city || "";
    document.getElementById('paymentMethod').value = order.paymentMethod || "مدى";
    
    openModal(true);
};

// --- 3. عرض الطلبات في الصفحة ---

async function render(filter = 'الكل') {
    container.innerHTML = '<div class="col-span-full text-center py-10">جاري تحميل البيانات...</div>';
    const orders = await getOrders(filter);
    
    if (!orders || orders.length === 0) {
        container.innerHTML = '<div class="col-span-full text-center py-10 text-gray-400">لا توجد طلبات مسجلة حالياً</div>';
        return;
    }

    container.innerHTML = '';
    orders.forEach(order => {
        const name = order.customerName || order.name || "عميل غير معروف";
        const num = order.orderNumber || "بدون رقم";
        
        const card = document.createElement('div');
        card.className = "bg-white p-5 rounded-2xl shadow-sm border border-gray-100 relative";
        card.innerHTML = `
            <div class="flex justify-between items-start mb-2">
                <span class="text-xs font-bold text-blue-600 font-mono">${num}</span>
                <div class="flex gap-3 text-gray-400">
                    <button class="edit-btn hover:text-green-600"><i class="fas fa-edit"></i></button>
                    <button class="del-btn hover:text-red-500"><i class="fas fa-trash"></i></button>
                </div>
            </div>
            <h4 class="font-bold text-lg">${name}</h4>
            <p class="text-xs text-gray-400 mb-4">${order.packageName || 'باقة سوا'}</p>
            <div class="flex justify-between items-center border-t pt-4">
                <span class="font-bold text-blue-600">${order.price || 0} ريال</span>
                <button class="preview-btn text-xs bg-gray-100 px-3 py-1 rounded-lg">معاينة</button>
            </div>
        `;

        // ربط الأزرار بالأحداث
        card.querySelector('.edit-btn').onclick = () => window.openEdit(order);
        card.querySelector('.del-btn').onclick = async () => { if(await deleteOrder(order.id)) render(); };
        card.querySelector('.preview-btn').onclick = () => toast("خاصية المعاينة قيد التجهيز");
        
        container.appendChild(card);
    });

    // تحميل المخزون في القائمة
    const products = await getStock();
    stockSelect.innerHTML = products.map(p => `<option value="${p.price}">${p.name} - ${p.price} ريال</option>`).join('');
}

// --- 4. معالجة حفظ الطلب (إضافة أو تحديث) ---

orderForm.onsubmit = async (e) => {
    e.preventDefault();
    const id = document.getElementById('editOrderId').value;
    
    const orderData = {
        orderNumber: document.getElementById('orderNumber').value,
        orderDateTime: document.getElementById('orderDateTime').value,
        customerName: document.getElementById('custName').value,
        phone: document.getElementById('custPhone').value,
        address: {
            region: document.getElementById('region').value,
            city: document.getElementById('city').value
        },
        paymentMethod: document.getElementById('paymentMethod').value,
        packageName: stockSelect.options[stockSelect.selectedIndex]?.text || "باقة يدوية",
        price: stockSelect.value,
        updatedAt: serverTimestamp()
    };

    try {
        if (id) {
            await updateDoc(doc(db, "customers", id), orderData);
            toast("تم تحديث الطلب بنجاح");
        } else {
            orderData.createdAt = serverTimestamp();
            orderData.status = "جديد";
            await addDoc(collection(db, "customers"), orderData);
            toast("تم إضافة الطلب الجديد");
        }
        closeModal();
        render();
    } catch (error) {
        console.error(error);
        toast("فشلت العملية، تأكد من الاتصال", "error");
    }
};

// --- 5. أحداث الصفحة ---

document.getElementById('newOrderBtn').onclick = () => openModal();
document.getElementById('closeModalBtn').onclick = () => closeModal();
document.getElementById('cancelModalBtn').onclick = () => closeModal();

document.getElementById('genNumBtn').onclick = () => {
    const rand = Math.floor(1000 + Math.random() * 9000);
    document.getElementById('orderNumber').value = `KF-${rand}-P`;
};

// تشغيل النظام عند التحميل
window.addEventListener('DOMContentLoaded', () => render());

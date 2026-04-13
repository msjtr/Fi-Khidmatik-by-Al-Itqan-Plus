/**
 * نظام إدارة الطلبات - منصة في خدمتك
 * JavaScript Core Logic
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { 
    getFirestore, collection, addDoc, doc, getDocs, updateDoc, deleteDoc, 
    query, where, orderBy, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

// إعدادات Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBWYW6Qqlhh904pBeuJ29wY7Cyjm2uklBA",
    authDomain: "msjt301-974bb.firebaseapp.com",
    projectId: "msjt301-974bb",
    storageBucket: "msjt301-974bb.firebasestorage.app",
    messagingSenderId: "186209858482",
    appId: "1:186209858482:web:186ca610780799ef562aab"
};

// تهيئة التطبيق
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// المتغيرات العامة
let orders = [];
let orderProducts = [];
let currentOrderId = null;
let selectedPaymentMethod = 'mada';

// --- 1. الوظائف الأساسية عند التشغيل ---
document.addEventListener('DOMContentLoaded', async () => {
    setupEventListeners();
    await loadOrders();
    await loadCustomerDropdown();
});

function setupEventListeners() {
    // فتح مودال طلب جديد
    document.getElementById('newOrderBtn')?.addEventListener('click', () => {
        resetForm();
        document.getElementById('modalTitle').innerText = "إضافة طلب جديد";
        generateOrderNumber();
        openModal('orderModal');
    });

    // إغلاق المودالات
    document.getElementById('closeModalBtn')?.addEventListener('click', () => closeModal('orderModal'));
    document.getElementById('cancelOrderBtn')?.addEventListener('click', () => closeModal('orderModal'));

    // تغيير طريقة الشحن (إظهار/إخفاء الحقول)
    document.querySelectorAll('input[name="shippingMethod"]').forEach(input => {
        input.addEventListener('change', (e) => toggleShippingFields(e.target.value));
    });

    // اختيار وسيلة الدفع
    document.querySelectorAll('.payment-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.payment-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            selectedPaymentMethod = this.dataset.payment;
            document.getElementById('paymentMethod').value = selectedPaymentMethod;
        });
    });

    // حفظ الطلب
    document.getElementById('orderForm')?.addEventListener('submit', handleOrderSubmit);

    // إضافة منتج جديد يدوياً
    document.getElementById('addNewProductBtn')?.addEventListener('click', () => {
        const product = { name: "منتج جديد", price: 0, quantity: 1, tempId: Date.now() };
        orderProducts.push(product);
        renderProductRows();
    });
}

// --- 2. العمليات على قاعدة البيانات (Firebase) ---
async function loadOrders() {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderOrdersTable();
}

async function handleOrderSubmit(e) {
    e.preventDefault();
    
    const orderData = {
        orderNumber: document.getElementById('orderNumber').value,
        date: document.getElementById('orderDate').value,
        status: document.getElementById('orderStatus').value,
        customerId: document.getElementById('customerSelect').value,
        customerName: document.getElementById('customerSelect').options[document.getElementById('customerSelect').selectedIndex]?.text || "عميل عام",
        shippingMethod: document.querySelector('input[name="shippingMethod"]:checked').value,
        paymentMethod: selectedPaymentMethod,
        products: orderProducts,
        subtotal: calculateSubtotal(),
        discount: parseFloat(document.getElementById('discountValue').value) || 0,
        tax: calculateTax(),
        total: calculateTotal(),
        updatedAt: serverTimestamp()
    };

    try {
        if (currentOrderId) {
            await updateDoc(doc(db, "orders", currentOrderId), orderData);
            showToast("تم تحديث الطلب بنجاح");
        } else {
            orderData.createdAt = serverTimestamp();
            await addDoc(collection(db, "orders"), orderData);
            showToast("تم إضافة الطلب بنجاح");
        }
        closeModal('orderModal');
        loadOrders();
    } catch (error) {
        console.error("Error saving order:", error);
        showToast("حدث خطأ أثناء الحفظ", "error");
    }
}

// --- 3. إدارة واجهة المستخدم ---
function renderOrdersTable() {
    const container = document.getElementById('ordersContainer');
    if (!container) return;

    container.innerHTML = orders.map(order => `
        <div class="order-card p-4 border rounded-xl bg-white shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
            <div class="flex items-center gap-4">
                <div class="p-3 bg-blue-50 rounded-lg text-blue-600 font-bold">#${order.orderNumber}</div>
                <div>
                    <h4 class="font-bold text-gray-800">${order.customerName}</h4>
                    <p class="text-xs text-gray-500">${order.date}</p>
                </div>
            </div>
            <div class="flex items-center gap-6">
                <div class="text-center">
                    <p class="text-xs text-gray-400">الإجمالي</p>
                    <p class="font-bold text-green-600">${order.total?.toFixed(2)} ريال</p>
                </div>
                <span class="status-badge ${getStatusColor(order.status)}">${order.status}</span>
                <div class="flex gap-2">
                    <button onclick="editOrder('${order.id}')" class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><i class="fas fa-edit"></i></button>
                    <button onclick="deleteOrder('${order.id}')" class="p-2 text-red-600 hover:bg-red-50 rounded-lg"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        </div>
    `).join('');
}

function renderProductRows() {
    const container = document.getElementById('productsContainer');
    container.innerHTML = orderProducts.map((p, index) => `
        <div class="product-row grid grid-cols-12 gap-2 items-center">
            <div class="col-span-6"><input type="text" value="${p.name}" onchange="updateProduct(${index}, 'name', this.value)" class="w-full border rounded p-1 text-sm"></div>
            <div class="col-span-2"><input type="number" value="${p.price}" onchange="updateProduct(${index}, 'price', this.value)" class="w-full border rounded p-1 text-sm"></div>
            <div class="col-span-2"><input type="number" value="${p.quantity}" onchange="updateProduct(${index}, 'quantity', this.value)" class="w-full border rounded p-1 text-sm text-center"></div>
            <div class="col-span-2 text-left"><button type="button" onclick="removeProductRow(${index})" class="text-red-500"><i class="fas fa-times"></i></button></div>
        </div>
    `).join('');
    updateTotals();
}

// --- 4. وظائف الحسابات ---
function calculateSubtotal() {
    return orderProducts.reduce((sum, p) => sum + (p.price * p.quantity), 0);
}

function calculateTax() {
    const discount = parseFloat(document.getElementById('discountValue').value) || 0;
    return (calculateSubtotal() - discount) * 0.15;
}

function calculateTotal() {
    const discount = parseFloat(document.getElementById('discountValue').value) || 0;
    return (calculateSubtotal() - discount) + calculateTax();
}

function updateTotals() {
    document.getElementById('subtotalDisplay').innerText = calculateSubtotal().toFixed(2) + " ريال";
    document.getElementById('taxDisplay').innerText = calculateTax().toFixed(2) + " ريال";
    document.getElementById('totalDisplay').innerText = calculateTotal().toFixed(2) + " ريال";
}

// --- 5. أدوات مساعدة (Helpers) ---
window.updateProduct = (index, field, value) => {
    orderProducts[index][field] = field === 'name' ? value : parseFloat(value);
    updateTotals();
};

window.removeProductRow = (index) => {
    orderProducts.splice(index, 1);
    renderProductRows();
};

function generateOrderNumber() {
    const rand = Math.floor(1000 + Math.random() * 9000);
    document.getElementById('orderNumber').value = rand;
}

function openModal(id) { document.getElementById(id).classList.remove('hidden'); document.getElementById(id).classList.add('flex'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); document.getElementById(id).classList.remove('flex'); }

function showToast(msg, type = "success") {
    const toast = document.getElementById('toast');
    toast.innerText = msg;
    toast.className = `fixed bottom-5 left-5 px-6 py-3 rounded-xl text-white shadow-lg z-50 ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`;
    toast.style.display = 'block';
    setTimeout(() => toast.style.display = 'none', 3000);
}

function getStatusColor(status) {
    if (status === 'تم التنفيذ') return 'status-completed';
    if (status === 'تحت التنفيذ') return 'status-processing';
    if (status === 'ملغي') return 'status-cancelled';
    return 'status-new';
}

function resetForm() {
    document.getElementById('orderForm').reset();
    orderProducts = [];
    currentOrderId = null;
    renderProductRows();
}

function toggleShippingFields(method) {
    document.getElementById('pickupFields').classList.toggle('hidden', method !== 'pickup');
    document.getElementById('deliveryFields').classList.toggle('hidden', method !== 'delivery');
    document.getElementById('noShipFields').classList.toggle('hidden', method !== 'noship');
}

// orders-logic.js
import { db } from './orders-firebase-db.js';
import { 
    collection, getDocs, addDoc, query, orderBy 
} from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

// --- المتغيرات العامة ---
let orders = [];

// --- وظائف الحسابات ---
export function calculateOrderTotal(products, discount, discountType) {
    let subtotal = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    let discAmount = discountType === 'percent' ? (subtotal * discount / 100) : discount;
    let tax = (subtotal - discAmount) * 0.15; // الضريبة 15%
    return {
        subtotal,
        discount: discAmount,
        tax,
        total: (subtotal - discAmount) + tax
    };
}

// --- جلب البيانات ---
export async function loadAllOrders() {
    const ordersRef = collection(db, "orders");
    const q = query(ordersRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// --- إشعارات النظام ---
export function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = type === 'success' ? 'success' : 'error';
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 3000);
}

// --- إدارة المودالات ---
export function toggleModal(modalId, show = true) {
    const modal = document.getElementById(modalId);
    if (show) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    } else {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
}

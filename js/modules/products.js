import { db } from '../core/firebase.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export async function initProducts(container) {
    container.innerHTML = `
        <div style="padding:20px;">
            <h3><i class="fas fa-box"></i> إدارة المخزن</h3>
            <form id="prod-form" style="background:white; padding:20px; border-radius:10px; display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                <input type="text" id="p-name" placeholder="اسم المنتج" required>
                <input type="text" id="p-code" placeholder="كود المنتج SKU">
                <input type="number" id="p-price" placeholder="سعر البيع">
                <input type="number" id="p-stock" placeholder="الكمية المتوفرة">
                <button type="submit" style="grid-column: span 2; background:#e67e22; color:white; border:none; padding:10px; border-radius:5px;">إضافة للمخزون</button>
            </form>
        </div>
    `;
    // كود الحفظ مشابه للعملاء...
}

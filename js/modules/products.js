/**
 * المسار الحالي: js/modules/products.js
 * الإصدار: 2.2 - دعم التعديل الشامل وتحسين الأداء
 */

import { db } from '../core/config.js'; 
import { 
    collection, addDoc, getDocs, deleteDoc, doc, updateDoc, getDoc,
    serverTimestamp, query, orderBy 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { calculateProductProfit, getStockStatus } from '../utils/calculations.js';
import { formatCurrency } from '../utils/formatter.js';

export async function initProducts(container) {
    container.innerHTML = `
        <div class="products-container" style="padding:20px; animation: fadeIn 0.4s ease;">
            <div class="module-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:25px;">
                <div>
                    <h2 style="font-weight:800; color:#1a202c; margin:0;">إدارة المستودع والمنتجات</h2>
                    <p style="color:#64748b; margin:5px 0 0 0;">نظام إدارة باقات سوا لخدمة "في خدمتك"</p>
                </div>
                <button onclick="window.openProductModal()" class="btn-main" style="background:#e67e22; color:white; border:none; padding:12px 25px; border-radius:12px; font-weight:bold; cursor:pointer; box-shadow: 0 4px 12px rgba(230,126,34,0.3); transition:0.3s;">
                    <i class="fas fa-plus"></i> إضافة منتج جديد
                </button>
            </div>

            <div style="margin-bottom:20px;">
                <div style="position:relative; max-width:400px;">
                    <i class="fas fa-search" style="position:absolute; right:15px; top:50%; transform:translateY(-50%); color:#94a3b8;"></i>
                    <input type="text" id="p-search" placeholder="بحث باسم الباقة..." oninput="window.fetchProducts()" 
                        style="width:100%; padding:12px 40px 12px 15px; border-radius:12px; border:1px solid #e2e8f0; outline:none; transition:0.3s;">
                </div>
            </div>

            <div id="products-list-grid" class="orders-grid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap:20px;">
                </div>
        </div>

        <div id="product-modal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.6); z-index:1000; justify-content:center; align-items:center; backdrop-filter: blur(5px);">
            <div style="background:white; width:90%; max-width:550px; padding:30px; border-radius:24px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);">
                <h3 id="modal-title" style="margin-top:0; margin-bottom:25px; font-weight:800; color:#1e293b;">بيانات المنتج</h3>
                <form id="product-form">
                    <input type="hidden" id="edit-id">
                    <div style="margin-bottom:15px;">
                        <label style="display:block; margin-bottom:8px; font-weight:600; color:#475569;">اسم الباقة</label>
                        <input type="text" id="p-name" placeholder="مثلاً: سوا 100 ريال" required style="width:100%; padding:12px; border:1px solid #e2e8f0; border-radius:10px; box-sizing:border-box;">
                    </div>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-bottom:15px;">
                        <div>
                            <label style="display:block; margin-bottom:8px; font-weight:600; color:#475569;">سعر التكلفة</label>
                            <input type="number" id="p-cost" step="0.01" placeholder="0.00" required style="width:100%; padding:12px; border:1px solid #e2e8f0; border-radius:10px; box-sizing:border-box;">
                        </div>
                        <div>
                            <label style="display:block; margin-bottom:8px; font-weight:600; color:#475569;">سعر البيع</label>
                            <input type="number" id="p-price" step="0.01" placeholder="0.00" required style="width:100%; padding:12px; border:1px solid #e2e8f0; border-radius:10px; box-sizing:border-box;">
                        </div>
                    </div>
                    <div style="margin-bottom:25px;">
                        <label style="display:block; margin-bottom:8px; font-weight:600; color:#475569;">الكمية المتوفرة</label>
                        <input type="number" id="p-stock" placeholder="0" required style="width:100%; padding:12px; border:1px solid #e2e8f0; border-radius:10px; box-sizing:border-box;">
                    </div>
                    <div style="display:flex; gap:12px;">
                        <button type="submit" id="save-btn" style="flex:2; padding:15px; background:#1e293b; color:white; border:none; border-radius:12px; cursor:pointer; font-weight:bold; transition:0.3s;">حفظ البيانات</button>
                        <button type="button" onclick="window.closeProductModal()" style="flex:1; padding:15px; background:#f1f5f9; color:#475569; border:none; border-radius:12px; cursor:pointer; font-weight:600;">إلغاء</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    window.fetchProducts();
    setupForm();
}

window.fetchProducts = async function() {
    const grid = document.getElementById('products-list-grid');
    const searchVal = document.getElementById('p-search') ? document.getElementById('p-search').value.toLowerCase() : "";
    if(!grid) return;

    try {
        const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        grid.innerHTML = "";

        if (snap.empty) {
            grid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding:50px; color:#94a3b8;">لا يوجد منتجات في المستودع حالياً.</div>`;
            return;
        }

        snap.forEach(d => {
            const p = d.data();
            if (p.name.toLowerCase().includes(searchVal)) {
                const profit = calculateProductProfit(p.cost, p.price);
                const status = getStockStatus(p.stock);
                
                grid.innerHTML += `
                    <div class="order-card" style="border-right: 5px solid ${status.color}; padding:20px; transition: 0.3s; background:#fff; border-radius:18px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); position:relative;">
                        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                            <h4 style="font-weight:800; margin:0; color:#1e293b; font-size:1.1rem;">${p.name}</h4>
                            <div style="display:flex; gap:10px;">
                                <button onclick="window.editProduct('${d.id}')" style="background:none

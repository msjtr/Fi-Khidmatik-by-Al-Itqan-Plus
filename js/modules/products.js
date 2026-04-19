/**
 * المسار الحالي: js/modules/products.js
 */

import { db } from '../core/config.js'; 
import { 
    collection, addDoc, getDocs, deleteDoc, doc, updateDoc,
    serverTimestamp, query, orderBy 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { calculateProductProfit, getStockStatus } from '../utils/calculations.js';
import { formatCurrency } from '../utils/formatter.js';

export async function initProducts(container) {
    container.innerHTML = `
        <div class="products-container" style="padding:20px; animation: fadeIn 0.4s ease;">
            <div class="module-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:25px;">
                <div>
                    <h2 style="font-weight:800; color:#1a202c;">إدارة المستودع والمنتجات</h2>
                    <p style="color:#64748b;">نظام إدارة باقات سوا لخدمة "في خدمتك"</p>
                </div>
                <button onclick="window.openProductModal()" class="btn-main" style="background:#e67e22; color:white; border:none; padding:12px 25px; border-radius:12px; font-weight:bold; cursor:pointer; box-shadow: 0 4px 12px rgba(230,126,34,0.3);">
                    <i class="fas fa-plus"></i> إضافة منتج جديد
                </button>
            </div>

            <div style="margin-bottom:20px;">
                <input type="text" id="p-search" placeholder="بحث سريع..." oninput="window.fetchProducts()" style="width:100%; max-width:400px; padding:12px; border-radius:10px; border:1px solid #e2e8f0;">
            </div>

            <div id="products-list-grid" class="orders-grid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap:20px;">
                </div>
        </div>

        <div id="product-modal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.6); z-index:1000; justify-content:center; align-items:center; backdrop-filter: blur(5px);">
            <div style="background:white; width:90%; max-width:650px; padding:30px; border-radius:20px;">
                <h3 id="modal-title" style="margin-bottom:20px;">بيانات المنتج الجديد</h3>
                <form id="product-form">
                    <input type="hidden" id="edit-id">
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-bottom:15px;">
                        <input type="text" id="p-name" placeholder="اسم المنتج/الباقة" required style="padding:12px; border:1px solid #ddd; border-radius:10px;">
                        <input type="number" id="p-cost" placeholder="سعر التكلفة" required style="padding:12px; border:1px solid #ddd; border-radius:10px;">
                    </div>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-bottom:15px;">
                        <input type="number" id="p-price" placeholder="سعر البيع" required style="padding:12px; border:1px solid #ddd; border-radius:10px;">
                        <input type="number" id="p-stock" placeholder="الكمية المتوفرة" required style="padding:12px; border:1px solid #ddd; border-radius:10px;">
                    </div>
                    <div style="display:flex; gap:10px; margin-top:20px;">
                        <button type="submit" style="flex:2; padding:15px; background:#1a202c; color:white; border:none; border-radius:12px; cursor:pointer; font-weight:bold;">حفظ في المستودع</button>
                        <button type="button" onclick="window.closeProductModal()" style="flex:1; padding:15px; background:#f1f5f9; border:none; border-radius:12px; cursor:pointer;">إلغاء</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    // استدعاء أولي للبيانات
    window.fetchProducts();
    setupForm();
}

// ✅ ربط الدالة بـ window لتكون مرئية للـ HTML (oninput)
window.fetchProducts = async function() {
    const grid = document.getElementById('products-list-grid');
    const searchVal = document.getElementById('p-search') ? document.getElementById('p-search').value.toLowerCase() : "";
    
    if(!grid) return;

    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    grid.innerHTML = "";

    snap.forEach(d => {
        const p = d.data();
        if (p.name.toLowerCase().includes(searchVal)) {
            const profit = calculateProductProfit(p.cost, p.price);
            const status = getStockStatus(p.stock);
            
            grid.innerHTML += `
                <div class="order-card" style="border-right: 5px solid ${status.color}; padding:20px; transition: 0.3s; background:#fff; border-radius:15px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                        <h4 style="font-weight:800; margin:0;">${p.name}</h4>
                        <i class="fas fa-trash" onclick="window.deleteProduct('${d.id}')" style="color:#e74c3c; cursor:pointer; font-size:0.9rem;"></i>
                    </div>
                    <div style="margin:15px 0;">
                        <p style="font-size:1.1rem; font-weight:800; color:#e67e22; margin:0;">${formatCurrency(p.price)}</p>
                    </div>
                    <div style="display:flex; justify-content:space-between; border-top:1px solid #f1f5f9; padding-top:10px; font-size:0.8rem;">
                        <span>الربح: <b style="color:#27ae60;">${profit}</b></span>
                        <span style="color:${status.color}; font-weight:bold;">${status.label}: ${p.stock}</span>
                    </div>
                </div>`;
        }
    });
}

function setupForm() {
    const form = document.getElementById('product-form');
    if(!form) return;
    form.onsubmit = async (e) => {
        e.preventDefault();
        try {
            const data = {
                name: document.getElementById('p-name').value,
                cost: Number(document.getElementById('p-cost').value),
                price: Number(document.getElementById('p-price').value),
                stock: Number(document.getElementById('p-stock').value),
                createdAt: serverTimestamp()
            };
            await addDoc(collection(db, "products"), data);
            window.closeProductModal();
            window.fetchProducts();
        } catch (error) {
            console.error("Error adding product: ", error);
            alert("حدث خطأ أثناء الحفظ");
        }
    };
}

// ✅ جعل دوال المودال والحذف مرئية عالمياً
window.openProductModal = () => document.getElementById('product-modal').style.display = 'flex';
window.closeProductModal = () => document.getElementById('product-modal').style.display = 'none';
window.deleteProduct = async (id) => { 
    if(confirm("هل أنت متأكد من حذف هذا المنتج من المستودع؟")) { 
        await deleteDoc(doc(db, "products", id)); 
        window.fetchProducts(); 
    } 
};

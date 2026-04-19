// ✅ المسارات المحدثة حسب الهيكل الجديد
import { db } from '../core/config.js'; 
import { 
    collection, addDoc, getDocs, deleteDoc, doc, updateDoc,
    serverTimestamp, query, orderBy 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// استدعاء الأدوات الحسابية من مجلد utils الموازي
import { calculateProductProfit, getStockStatus } from '../utils/calculations.js';
import { formatCurrency } from '../utils/formatter.js';

export async function initProducts(container) {
    // جلب قالب HTML من مجلد admin/modules (اختياري أو كتابته هنا)
    container.innerHTML = `
        <div class="products-container" style="padding:20px; animation: fadeIn 0.5s;">
            <div class="module-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:25px;">
                <div>
                    <h2 style="font-weight:800; color:#1a202c;">المخزون والمنتجات</h2>
                    <p style="color:#64748b;">إدارة باقات سوا والمنتجات</p>
                </div>
                <button onclick="openProductModal()" class="btn-main" style="background:#e67e22; color:white; border:none; padding:12px 20px; border-radius:10px; cursor:pointer; font-weight:bold;">
                    <i class="fas fa-plus"></i> إضافة منتج جديد
                </button>
            </div>

            <div style="display:flex; gap:10px; margin-bottom:20px;">
                <input type="text" id="p-search" placeholder="بحث باسم المنتج أو الكود..." oninput="fetchProducts()" style="flex:2; padding:12px; border-radius:10px; border:1px solid #cbd5e1;">
            </div>

            <div id="products-list-grid" class="orders-grid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap:20px;">
                </div>
        </div>

        <div id="product-modal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:1000; justify-content:center; align-items:center; backdrop-filter:blur(5px);">
            <div style="background:white; width:90%; max-width:700px; padding:30px; border-radius:20px; max-height:90vh; overflow-y:auto;">
                <h3 id="modal-title" style="margin-bottom:20px;">إضافة منتج</h3>
                <form id="product-complex-form">
                    <input type="hidden" id="edit-id">
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-bottom:15px;">
                        <input type="text" id="p-name" placeholder="اسم المنتج" required style="padding:10px; border:1px solid #ddd; border-radius:8px;">
                        <input type="number" id="p-cost" placeholder="سعر التكلفة" required style="padding:10px; border:1px solid #ddd; border-radius:8px;">
                    </div>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-bottom:15px;">
                        <input type="number" id="p-price" placeholder="سعر البيع" required style="padding:10px; border:1px solid #ddd; border-radius:8px;">
                        <input type="number" id="p-stock" placeholder="الكمية" required style="padding:10px; border:1px solid #ddd; border-radius:8px;">
                    </div>
                    <button type="submit" style="width:100%; padding:15px; background:#1a202c; color:white; border:none; border-radius:10px; cursor:pointer; font-weight:bold;">حفظ</button>
                    <button type="button" onclick="closeProductModal()" style="width:100%; margin-top:10px; padding:10px; background:#eee; border:none; border-radius:10px; cursor:pointer;">إلغاء</button>
                </form>
            </div>
        </div>
    `;

    fetchProducts();
    setupForm();
}

async function fetchProducts() {
    const grid = document.getElementById('products-list-grid');
    const searchTerm = document.getElementById('p-search').value.toLowerCase();
    
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    grid.innerHTML = "";

    snap.forEach(d => {
        const p = d.data();
        if (p.name.toLowerCase().includes(searchTerm)) {
            const profit = calculateProductProfit(p.cost, p.price);
            const status = getStockStatus(p.stock);
            
            grid.innerHTML += `
                <div class="order-card" style="border-top: 4px solid ${status.color}; padding:15px;">
                    <h4 style="margin:10px 0;">${p.name}</h4>
                    <p style="font-weight:bold; color:#e67e22;">السعر: ${formatCurrency(p.price)}</p>
                    <div style="margin-top:10px; font-size:0.8rem; color:#64748b;">
                        الربح: <span style="color:#27ae60;">${profit} SAR</span> | 
                        الحالة: <span style="color:${status.color}">${status.label}</span>
                    </div>
                    <div style="margin-top:10px; display:flex; gap:10px;">
                        <button onclick="deleteProduct('${d.id}')" style="background:none; border:none; color:#e74c3c; cursor:pointer;"><i class="fas fa-trash"></i></button>
                    </div>
                </div>`;
        }
    });
}

function setupForm() {
    const form = document.getElementById('product-complex-form');
    if(!form) return;
    form.onsubmit = async (e) => {
        e.preventDefault();
        const data = {
            name: document.getElementById('p-name').value,
            cost: Number(document.getElementById('p-cost').value),
            price: Number(document.getElementById('p-price').value),
            stock: Number(document.getElementById('p-stock').value),
            createdAt: serverTimestamp()
        };
        await addDoc(collection(db, "products"), data);
        closeProductModal();
        fetchProducts();
    };
}

window.openProductModal = () => document.getElementById('product-modal').style.display = 'flex';
window.closeProductModal = () => document.getElementById('product-modal').style.display = 'none';
window.deleteProduct = async (id) => { if(confirm("حذف؟")) { await deleteDoc(doc(db, "products", id)); fetchProducts(); } };

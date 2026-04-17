import { db } from '../core/firebase.js';
import { 
    collection, addDoc, getDocs, doc, deleteDoc, updateDoc, 
    query, orderBy, serverTimestamp, getDoc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/**
 * موديول إدارة المنتجات والمخزون - تيرا جيتواي
 */

export async function initProducts(container) {
    // 1. بناء الواجهة (HTML)
    container.innerHTML = `
        <div class="module-container" style="font-family: 'Tajawal', sans-serif;" dir="rtl">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 25px;">
                <h2 style="margin:0;"><i class="fas fa-cubes" style="color:#e67e22; margin-left:10px;"></i> إدارة مستودع المنتجات</h2>
                <button id="new-product-btn" style="background:#e67e22; color:white; border:none; padding:10px 20px; border-radius:8px; cursor:pointer; font-weight:bold; box-shadow:0 4px 10px rgba(230,126,34,0.2);">
                    <i class="fas fa-plus"></i> إضافة منتج جديد
                </button>
            </div>

            <div style="display:grid; grid-template-columns: 2fr 1fr; gap:15px; margin-bottom: 20px; background:#f8f9fa; padding:15px; border-radius:12px; border: 1px solid #eee;">
                <div style="position:relative;">
                    <i class="fas fa-search" style="position:absolute; right:15px; top:12px; color:#bdc3c7;"></i>
                    <input type="text" id="search-product" placeholder="بحث باسم المنتج أو كود SKU..." style="width:100%; padding:10px 40px 10px 10px; border:1px solid #ddd; border-radius:8px;">
                </div>
                <select id="stock-filter" style="padding:10px; border:1px solid #ddd; border-radius:8px; background:white;">
                    <option value="all">جميع الحالات</option>
                    <option value="low">المخزون المنخفض</option>
                    <option value="out">المنتجات النافدة</option>
                </select>
            </div>

            <div id="products-table-container" style="background:white; border-radius:15px; border:1px solid #eee; overflow:hidden;">
                <table style="width:100%; border-collapse:collapse; text-align:right;">
                    <thead style="background:#fcfcfc;">
                        <tr>
                            <th style="padding:15px; border-bottom:2px solid #f1f1f1;">المنتج</th>
                            <th style="padding:15px; border-bottom:2px solid #f1f1f1;">SKU</th>
                            <th style="padding:15px; border-bottom:2px solid #f1f1f1;">سعر البيع</th>
                            <th style="padding:15px; border-bottom:2px solid #f1f1f1;">المخزون</th>
                            <th style="padding:15px; border-bottom:2px solid #f1f1f1;">الحالة</th>
                            <th style="padding:15px; border-bottom:2px solid #f1f1f1;">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody id="products-list-body">
                        <tr><td colspan="6" style="text-align:center; padding:30px;">جاري تحميل المستودع...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div id="prod-modal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); z-index:9999; padding:20px;">
            <div style="background:white; max-width:550px; margin:30px auto; border-radius:15px; padding:25px; box-shadow:0 10px 25px rgba(0,0,0,0.2);">
                <h3 id="prod-modal-title" style="color:#e67e22; margin-top:0;">إضافة منتج جديد</h3>
                <form id="prod-form">
                    <input type="hidden" id="edit-prod-id">
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-top:20px;">
                        <div style="grid-column: span 2;">
                            <label style="display:block; margin-bottom:5px; font-weight:bold;">اسم المنتج</label>
                            <input type="text" id="p-name" required style="width:100%; padding:12px; border:1px solid #ddd; border-radius:8px;">
                        </div>
                        <div>
                            <label style="display:block; margin-bottom:5px; font-weight:bold;">كود SKU</label>
                            <input type="text" id="p-code" placeholder="TR-001" style="width:100%; padding:12px; border:1px solid #ddd; border-radius:8px;">
                        </div>
                        <div>
                            <label style="display:block; margin-bottom:5px; font-weight:bold;">سعر البيع</label>
                            <input type="number" id="p-price" step="0.01" required style="width:100%; padding:12px; border:1px solid #ddd; border-radius:8px;">
                        </div>
                        <div>
                            <label style="display:block; margin-bottom:5px; font-weight:bold;">الكمية المتوفرة</label>
                            <input type="number" id="p-stock" required style="width:100%; padding:12px; border:1px solid #ddd; border-radius:8px;">
                        </div>
                        <div>
                            <label style="display:block; margin-bottom:5px; font-weight:bold;">تنبيه عند نقص المخزون</label>
                            <input type="number" id="p-min-stock" value="5" style="width:100%; padding:12px; border:1px solid #ddd; border-radius:8px;">
                        </div>
                        <div style="grid-column: span 2; display:flex; gap:10px; margin-top:10px;">
                            <button type="submit" style="flex:2; background:#2ecc71; color:white; padding:15px; border:none; border-radius:8px; cursor:pointer; font-weight:bold;">حفظ المنتج</button>
                            <button type="button" id="close-prod-modal" style="flex:1; background:#95a5a6; color:white; padding:15px; border:none; border-radius:8px; cursor:pointer;">إلغاء</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    `;

    setupProductEvents();
    await loadProducts();
}

async function loadProducts() {
    const tbody = document.getElementById('products-list-body');
    const snap = await getDocs(query(collection(db, "products"), orderBy("createdAt", "desc")));
    
    tbody.innerHTML = snap.docs.map(doc => {
        const p = doc.data();
        const stock = parseInt(p.stock) || 0;
        const minStock = parseInt(p.minStock) || 5;
        
        // تحديد حالة المخزون برمجياً
        let statusBadge = '';
        if (stock <= 0) {
            statusBadge = '<span style="background:#ffebee; color:#c62828; padding:4px 10px; border-radius:6px; font-size:0.8rem; font-weight:bold;">نافد</span>';
        } else if (stock <= minStock) {
            statusBadge = '<span style="background:#fff3e0; color:#ef6c00; padding:4px 10px; border-radius:6px; font-size:0.8rem; font-weight:bold;">منخفض</span>';
        } else {
            statusBadge = '<span style="background:#e8f5e9; color:#2e7d32; padding:4px 10px; border-radius:6px; font-size:0.8rem; font-weight:bold;">متوفر</span>';
        }

        return `
            <tr style="border-bottom: 1px solid #f1f1f1;">
                <td style="padding:15px; font-weight:bold; color:#2c3e50;">${p.name}</td>
                <td style="padding:15px; color:#7f8c8d;">${p.code || '---'}</td>
                <td style="padding:15px; font-weight:bold;">${parseFloat(p.price).toFixed(2)} ريال</td>
                <td style="padding:15px; text-align:center;">${stock}</td>
                <td style="padding:15px; text-align:center;">${statusBadge}</td>
                <td style="padding:15px; text-align:center;">
                    <button onclick="window.editProduct('${doc.id}')" style="color:#f39c12; background:none; border:none; cursor:pointer; margin-left:10px;"><i class="fas fa-edit"></i></button>
                    <button onclick="window.deleteProduct('${doc.id}')" style="color:#e74c3c; background:none; border:none; cursor:pointer;"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `;
    }).join('');
}

function setupProductEvents() {
    const modal = document.getElementById('prod-modal');
    
    document.getElementById('new-product-btn').onclick = () => {
        document.getElementById('prod-form').reset();
        document.getElementById('edit-prod-id').value = '';
        document.getElementById('prod-modal-title').innerText = "إضافة منتج جديد للمخزن";
        modal.style.display = 'block';
    };

    document.getElementById('close-prod-modal').onclick = () => modal.style.display = 'none';

    document.getElementById('prod-form').onsubmit = async (e) => {
        e.preventDefault();
        const id = document.getElementById('edit-prod-id').value;
        const data = {
            name: document.getElementById('p-name').value,
            code: document.getElementById('p-code').value,
            price: parseFloat(document.getElementById('p-price').value),
            stock: parseInt(document.getElementById('p-stock').value),
            minStock: parseInt(document.getElementById('p-min-stock').value),
            updatedAt: serverTimestamp()
        };

        if (id) {
            await updateDoc(doc(db, "products", id), data);
        } else {
            data.createdAt = serverTimestamp();
            await addDoc(collection(db, "products"), data);
        }
        modal.style.display = 'none';
        loadProducts();
    };
}

// --- الوظائف العالمية للإجراءات ---

window.deleteProduct = async (id) => {
    if (confirm("هل تريد حذف هذا المنتج من المخزن نهائياً؟")) {
        await deleteDoc(doc(db, "products", id));
        location.reload();
    }
};

window.editProduct = async (id) => {
    const snap = await getDoc(doc(db, "products", id));
    if (snap.exists()) {
        const p = snap.data();
        document.getElementById('edit-prod-id').value = id;
        document.getElementById('p-name').value = p.name;
        document.getElementById('p-code').value = p.code || '';
        document.getElementById('p-price').value = p.price;
        document.getElementById('p-stock').value = p.stock;
        document.getElementById('p-min-stock').value = p.minStock || 5;
        document.getElementById('prod-modal-title').innerText = "تعديل بيانات المنتج";
        document.getElementById('prod-modal').style.display = 'block';
    }
};

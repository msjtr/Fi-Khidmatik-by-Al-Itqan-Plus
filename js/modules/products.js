// الاستيراد باستخدام المسارات النسبية المتوافقة مع GitHub Pages
import { db } from '../firebase-config.js'; 
import { 
    collection, addDoc, getDocs, deleteDoc, doc, updateDoc,
    serverTimestamp, query, orderBy 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// استدعاء الأدوات الحسابية من مجلد utils
import { calculateProductProfit, getStockStatus } from '../utils/calculations.js';

let editorInstance;

export async function initProducts(container) {
    container.innerHTML = `
        <div class="products-container" style="padding:20px; animation: fadeIn 0.5s;">
            <div class="module-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:25px;">
                <div>
                    <h2 style="font-weight:800; color:#1a202c;">مخزون منصة تيرا</h2>
                    <p style="color:#64748b;">إدارة باقات سوا والمنتجات الذكية</p>
                </div>
                <button onclick="openProductModal()" class="btn-main" style="background:#e67e22; color:white; border:none; padding:12px 20px; border-radius:10px; cursor:pointer; font-weight:bold;">
                    <i class="fas fa-plus"></i> إضافة منتج جديد
                </button>
            </div>

            <div style="display:flex; gap:10px; margin-bottom:20px;">
                <input type="text" id="p-search" placeholder="بحث باسم المنتج أو الكود..." oninput="fetchProducts()" style="flex:2; padding:12px; border-radius:10px; border:1px solid #cbd5e1;">
                <button onclick="exportToExcel()" style="background:#27ae60; color:white; border:none; padding:10px; border-radius:10px; cursor:pointer;"><i class="fas fa-file-excel"></i> تصدير</button>
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
                        <select id="p-category" style="padding:10px; border:1px solid #ddd; border-radius:8px;">
                            <option value="sawa">باقات سوا</option>
                            <option value="cards">بطاقات شحن</option>
                        </select>
                    </div>
                    <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:15px; margin-bottom:15px;">
                        <input type="number" id="p-cost" placeholder="سعر التكلفة" required style="padding:10px; border:1px solid #ddd; border-radius:8px;">
                        <input type="number" id="p-price" placeholder="سعر البيع" required style="padding:10px; border:1px solid #ddd; border-radius:8px;">
                        <input type="number" id="p-stock" placeholder="المخزون" required style="padding:10px; border:1px solid #ddd; border-radius:8px;">
                    </div>
                    <input type="url" id="p-main-img" placeholder="رابط الصورة الرئيسية" style="width:100%; padding:10px; border:1px solid #ddd; border-radius:8px; margin-bottom:15px;">
                    <textarea id="p-editor"></textarea>
                    
                    <div style="display:flex; gap:10px; margin-top:20px;">
                        <button type="submit" style="flex:2; padding:15px; background:#1a202c; color:white; border:none; border-radius:10px; cursor:pointer;">حفظ المنتج</button>
                        <button type="button" onclick="closeProductModal()" style="flex:1; padding:15px; background:#eee; border:none; border-radius:10px; cursor:pointer;">إلغاء</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    setTimeout(() => {
        if(typeof ClassicEditor !== 'undefined') {
            ClassicEditor.create(document.querySelector('#p-editor')).then(ed => editorInstance = ed);
        }
        fetchProducts();
        setupForm();
    }, 100);
}

async function fetchProducts() {
    const grid = document.getElementById('products-list-grid');
    const searchTerm = document.getElementById('p-search').value.toLowerCase();
    
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    grid.innerHTML = "";

    snap.forEach(d => {
        const p = d.data();
        if (p.name.toLowerCase().includes(searchTerm) || (p.code && p.code.toLowerCase().includes(searchTerm))) {
            const profit = calculateProductProfit(p.cost, p.price);
            const status = getStockStatus(p.stock);
            
            grid.innerHTML += `
                <div class="order-card" style="border-top: 4px solid ${status.color}; padding:15px; position:relative;">
                    <div style="position:absolute; left:10px; top:10px;">
                        <i class="fas fa-edit" onclick="editProduct('${d.id}')" style="color:#2980b9; cursor:pointer; margin-left:10px;"></i>
                        <i class="fas fa-trash" onclick="deleteProduct('${d.id}')" style="color:#e74c3c; cursor:pointer;"></i>
                    </div>
                    <small style="color:#64748b;">كود: ${p.code || '---'}</small>
                    <h4 style="margin:10px 0;">${p.name}</h4>
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <span style="font-weight:bold; color:#e67e22;">${p.price} ريال</span>
                        <span style="font-size:0.8rem; color:${status.color}">${status.label} (${p.stock})</span>
                    </div>
                    <div style="margin-top:10px; padding-top:10px; border-top:1px solid #f1f5f9; font-size:0.8rem;">
                        صافي الربح: <span style="color:#27ae60;">${profit} ريال</span>
                    </div>
                </div>`;
        }
    });
}

function setupForm() {
    const form = document.getElementById('product-complex-form');
    form.onsubmit = async (e) => {
        e.preventDefault();
        const editId = document.getElementById('edit-id').value;
        const autoCode = "TR-" + Math.floor(1000 + Math.random() * 9000);

        const data = {
            name: document.getElementById('p-name').value,
            category: document.getElementById('p-category').value,
            cost: Number(document.getElementById('p-cost').value),
            price: Number(document.getElementById('p-price').value),
            stock: Number(document.getElementById('p-stock').value),
            mainImage: document.getElementById('p-main-img').value,
            description: editorInstance ? editorInstance.getData() : "",
            updatedAt: serverTimestamp()
        };

        if (editId) {
            await updateDoc(doc(db, "products", editId), data);
        } else {
            data.code = autoCode;
            data.createdAt = serverTimestamp();
            await addDoc(collection(db, "products"), data);
        }
        
        closeProductModal();
        fetchProducts();
        alert("تم الحفظ بنجاح");
    };
}

window.openProductModal = () => {
    document.getElementById('product-modal').style.display = 'flex';
    document.getElementById('product-complex-form').reset();
    document.getElementById('edit-id').value = "";
};

window.closeProductModal = () => {
    document.getElementById('product-modal').style.display = 'none';
};

window.deleteProduct = async (id) => {
    if(confirm("هل أنت متأكد من الحذف؟")) {
        await deleteDoc(doc(db, "products", id));
        fetchProducts();
    }
};

window.exportToExcel = () => {
    alert("جاري تحويل بيانات المستودع إلى ملف Excel...");
};

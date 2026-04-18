// js/modules/products.js
import { db } from '../firebase-config.js'; // تأكد من مسار ملف الإعدادات الخاص بك
import { 
    collection, 
    addDoc, 
    getDocs, 
    deleteDoc, 
    doc, 
    serverTimestamp, 
    query, 
    orderBy 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

let editorInstance; // لتخزين نسخة المحرر وسحب البيانات منها

export async function initProducts(container) {
    container.innerHTML = `
        <div class="products-wrapper" style="animation: fadeIn 0.4s ease;">
            <div class="module-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:30px;">
                <div>
                    <h2 style="font-weight:800; color:#1a202c; font-size:1.8rem;">منتجات تيرا جيتواي</h2>
                    <p style="color:#64748b;">متصل الآن بقاعدة بيانات Firestore</p>
                </div>
                <button onclick="document.getElementById('product-form-section').scrollIntoView({behavior:'smooth'})" 
                        class="btn-main" style="background:#e67e22; color:white; padding:12px 25px; border-radius:12px; font-weight:800; cursor:pointer;">
                    <i class="fas fa-plus-circle"></i> إضافة منتج جديد
                </button>
            </div>

            <div id="products-list-grid" class="orders-grid">
                <div style="grid-column: 1/-1; text-align:center; padding:50px;">جاري الاتصال بالقاعدة...</div>
            </div>

            <hr style="margin:50px 0; border:0; border-top:2px dashed #e2e8f0;">

            <section id="product-form-section" class="order-card" style="padding:30px; background:#fff; border-radius:20px;">
                <h3 style="font-weight:800; color:#1a202c; margin-bottom:25px; border-right:4px solid #e67e22; padding-right:15px;">إدخال منتج جديد</h3>
                
                <form id="product-main-form">
                    <div style="display:grid; grid-template-columns: 2fr 1fr; gap:20px; margin-bottom:20px;">
                        <div>
                            <label style="font-weight:700;">اسم المنتج</label>
                            <input type="text" id="p-name" required class="form-input" style="width:100%; padding:12px; border-radius:10px; border:1px solid #e2e8f0;">
                        </div>
                        <div>
                            <label style="font-weight:700;">كود SKU</label>
                            <input type="text" id="p-code" required class="form-input" style="width:100%; padding:12px; border-radius:10px; border:1px solid #e2e8f0;">
                        </div>
                    </div>

                    <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:20px; margin-bottom:20px;">
                        <div>
                            <label style="font-weight:700;">السعر</label>
                            <input type="number" id="p-price" required class="form-input" style="width:100%; padding:12px; border-radius:10px; border:1px solid #e2e8f0;">
                        </div>
                        <div>
                            <label style="font-weight:700;">المخزون</label>
                            <input type="number" id="p-stock" required class="form-input" style="width:100%; padding:12px; border-radius:10px; border:1px solid #e2e8f0;">
                        </div>
                        <div>
                            <label style="font-weight:700;">رابط الفيديو</label>
                            <input type="url" id="p-video" class="form-input" style="width:100%; padding:12px; border-radius:10px; border:1px solid #e2e8f0;">
                        </div>
                    </div>

                    <div style="margin-bottom:25px;">
                        <label style="font-weight:700;">الوصف (HTML)</label>
                        <textarea id="p-description"></textarea>
                    </div>

                    <div style="display:flex; justify-content:flex-end; gap:15px;">
                        <button type="submit" id="save-btn" class="btn-main" style="background:#1a202c; color:#fff; padding:15px 40px; border-radius:12px; cursor:pointer; font-weight:800;">حفظ في Firestore</button>
                    </div>
                </form>
            </section>
        </div>
    `;

    setTimeout(() => {
        initFullEditor('p-description');
        fetchProducts(); // جلب البيانات عند التحميل
        setupFormHandler(); // تفعيل زر الحفظ
    }, 100);
}

// 1. جلب البيانات من Firestore
async function fetchProducts() {
    const grid = document.getElementById('products-list-grid');
    try {
        const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:40px;">لا توجد منتجات في القاعدة.</div>`;
            return;
        }

        grid.innerHTML = "";
        querySnapshot.forEach((docSnap) => {
            const p = docSnap.data();
            grid.innerHTML += `
                <div class="order-card" id="card-${docSnap.id}">
                    <div class="order-header">
                        <div class="order-id">#${p.code}</div>
                        <span class="order-status ${p.stock > 5 ? 'status-completed' : 'status-pending'}">
                            ${p.stock > 5 ? 'متوفر' : 'منخفض'}
                        </span>
                    </div>
                    <div class="order-body">
                        <div style="font-weight:800; font-size:1.1rem; margin-bottom:10px;">${p.name}</div>
                        <div class="order-finance">
                            <span class="finance-label">السعر</span>
                            <span class="finance-value">${p.price} <small>ريال</small></span>
                        </div>
                    </div>
                    <div class="order-footer">
                        <button class="btn-action" onclick="deleteProduct('${docSnap.id}')" style="color:#e74c3c;">
                            <i class="fas fa-trash"></i> حذف
                        </button>
                    </div>
                </div>`;
        });
    } catch (error) {
        console.error("Error fetching:", error);
        grid.innerHTML = "خطأ في جلب البيانات.";
    }
}

// 2. حفظ منتج جديد في Firestore
function setupFormHandler() {
    const form = document.getElementById('product-main-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const saveBtn = document.getElementById('save-btn');
        saveBtn.disabled = true;
        saveBtn.innerText = "جاري الحفظ...";

        try {
            await addDoc(collection(db, "products"), {
                name: document.getElementById('p-name').value,
                code: document.getElementById('p-code').value,
                price: Number(document.getElementById('p-price').value),
                stock: Number(document.getElementById('p-stock').value),
                video: document.getElementById('p-video').value,
                description: editorInstance ? editorInstance.getData() : "",
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });

            alert("تم الحفظ في قاعدة البيانات!");
            form.reset();
            if(editorInstance) editorInstance.setData('');
            fetchProducts(); // تحديث القائمة فوراً
        } catch (error) {
            console.error("Save error:", error);
            alert("فشل الحفظ!");
        } finally {
            saveBtn.disabled = false;
            saveBtn.innerText = "حفظ في Firestore";
        }
    });
}

// 3. حذف منتج من Firestore
window.deleteProduct = async (id) => {
    if (confirm("هل تريد حذف هذا المنتج نهائياً من القاعدة؟")) {
        try {
            await deleteDoc(doc(db, "products", id));
            fetchProducts();
        } catch (error) {
            alert("خطأ في الحذف!");
        }
    }
};

async function initFullEditor(elementId) {
    if (typeof ClassicEditor !== 'undefined') {
        ClassicEditor.create(document.getElementById(elementId), { language: 'ar', direction: 'rtl' })
            .then(editor => { editorInstance = editor; })
            .catch(err => console.error(err));
    }
}

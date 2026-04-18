/**
 * js/modules/products.js
 * موديول إدارة المنتجات - منصة تيرا
 */

import { db } from '../core/firebase.js';
import { 
    collection, addDoc, getDocs, deleteDoc, doc, 
    serverTimestamp, query, orderBy 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/**
 * هذه هي الدالة التي يستدعيها main.js عند فتح قسم المنتجات
 */
export async function initProducts(container) {
    console.log("🚀 جاري تحميل واجهة المنتجات من السيرفر...");
    
    try {
        // 1. تحميل القالب من مجلد admin
        const response = await fetch('./admin/modules/products.html');
        if (!response.ok) throw new Error("لم يتم العثور على ملف products.html");
        
        const html = await response.text();
        container.innerHTML = html;

        // 2. تشغيل العمليات فور حقن الـ HTML في الصفحة
        console.log("✅ تم حقن الواجهة. بدء جلب المنتجات...");
        
        // نستخدم setTimeout بسيط لضمان أن المتصفح انتهى من رسم العناصر (DOM)
        setTimeout(() => {
            fetchProducts();
            setupFormHandler();
        }, 50);

    } catch (error) {
        console.error("❌ خطأ في تحميل موديول المنتجات:", error);
        container.innerHTML = `<div style="color:red; padding:20px;">حدث خطأ أثناء تحميل الواجهة: ${error.message}</div>`;
    }
}

/**
 * جلب البيانات من Firestore
 */
async function fetchProducts() {
    // تأكد أن هذا الـ ID موجود داخل admin/modules/products.html
    const grid = document.getElementById('products-list-grid');
    
    if (!grid) {
        console.error("❌ خطأ: لم أجد عنصر 'products-list-grid' داخل ملف HTML.");
        return;
    }

    try {
        const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
            grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:50px; color:#64748b;">لا توجد منتجات حالياً في منصة تيرا.</div>`;
            return;
        }

        grid.innerHTML = ""; // تنظيف المكان قبل العرض

        snapshot.forEach((docSnap) => {
            const p = docSnap.data();
            const pId = docSnap.id;
            
            grid.innerHTML += `
                <div class="order-card" style="border-top: 4px solid #e67e22; animation: fadeIn 0.5s ease;">
                    <div class="order-body" style="padding:15px;">
                        <img src="${p.mainImage || 'admin/images/default-product.png'}" 
                             style="width:100%; height:140px; object-fit:cover; border-radius:8px; margin-bottom:12px;">
                        <h4 style="font-weight:800; color:#1e293b;">${p.name}</h4>
                        <p style="font-size:0.75rem; color:#94a3b8; margin-bottom:10px;">كود: ${p.code || 'N/A'}</p>
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <span style="color:#e67e22; font-weight:800; font-size:1.1rem;">${p.price} ريال</span>
                            <span style="background:#f1f5f9; padding:2px 8px; border-radius:5px; font-size:0.8rem; color:#475569;">المخزون: ${p.stock}</span>
                        </div>
                    </div>
                    <div class="order-footer" style="padding:12px; background:#f8fafc; border-top:1px solid #f1f5f9; display:flex; justify-content:space-between;">
                        <button onclick="deleteProduct('${pId}')" style="color:#ef4444; border:none; background:none; cursor:pointer; font-size:0.85rem;">
                            <i class="fas fa-trash-alt"></i> حذف
                        </button>
                        <span style="font-size:0.75rem; color:#cbd5e1;">${p.createdAt?.toDate().toLocaleDateString('ar-SA') || '' }</span>
                    </div>
                </div>`;
        });
        console.log("✅ تم عرض المنتجات بنجاح.");

    } catch (err) {
        console.error("❌ فشل جلب البيانات من Firestore:", err);
    }
}

/**
 * معالج حفظ النموذج
 */
function setupFormHandler() {
    const form = document.getElementById('product-main-form');
    if (!form) return;

    form.onsubmit = async (e) => {
        e.preventDefault();
        
        const productData = {
            name: document.getElementById('p-name').value,
            code: document.getElementById('p-code').value,
            description: document.getElementById('p-desc')?.value || "",
            mainImage: document.getElementById('p-main-image')?.value || "",
            galleryImages: [], 
            price: Number(document.getElementById('p-price').value),
            stock: Number(document.getElementById('p-stock').value),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        try {
            await addDoc(collection(db, "products"), productData);
            alert("تمت إضافة المنتج بنجاح");
            form.reset();
            fetchProducts();
        } catch (err) {
            console.error("❌ خطأ في الإضافة:", err);
            alert("حدث خطأ أثناء الحفظ.");
        }
    };
}

// دالة الحذف (Global)
window.deleteProduct = async (id) => {
    if (confirm("هل تريد حذف هذا المنتج؟")) {
        try {
            await deleteDoc(doc(db, "products", id));
            fetchProducts();
        } catch (err) {
            console.error("❌ فشل الحذف:", err);
        }
    }
};

/**
 * js/modules/products.js
 * موديول إدارة المنتجات المطور - منصة تيرا
 */

// 1. تأكد من صحة مسار ملف firebase.js في مجلد core
import { db } from '../core/firebase.js';
import { 
    collection, addDoc, getDocs, deleteDoc, doc, 
    serverTimestamp, query, orderBy 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export async function initProducts(container) {
    try {
        // 2. جلب واجهة الـ HTML من المسار الصحيح
        const response = await fetch('./admin/modules/products.html');
        if (!response.ok) throw new Error("فشل في تحميل ملف products.html");
        
        const html = await response.text();
        container.innerHTML = html;

        console.log("✅ تم تحميل الواجهة، يبدأ الآن جلب البيانات من Firestore...");
        
        // استدعاء الوظائف الأساسية
        fetchProducts(); 
        setupFormHandler(); 
        
    } catch (error) {
        console.error("❌ خطأ في initProducts:", error);
        container.innerHTML = `<div class="error-msg">حدث خطأ في تحميل القسم: ${error.message}</div>`;
    }
}

async function fetchProducts() {
    // 3. تأكد أن هذا الـ ID موجود حرفياً في ملف products.html
    const grid = document.getElementById('products-list-grid');
    if (!grid) {
        console.warn("⚠️ لم يتم العثور على عنصر 'products-list-grid' في الصفحة.");
        return;
    }

    try {
        const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
            grid.innerHTML = `<p style="text-align:center; grid-column:1/-1;">لا توجد منتجات حالياً.</p>`;
            return;
        }

        grid.innerHTML = ""; 

        snapshot.forEach((docSnap) => {
            const p = docSnap.data();
            const pId = docSnap.id;
            
            // عرض المنتج بالتنسيق الجديد
            grid.innerHTML += `
                <div class="order-card" id="prod-${pId}">
                    <div class="order-body">
                        <img src="${p.mainImage || 'admin/images/default-product.png'}" 
                             style="width:100%; height:120px; object-fit:cover; border-radius:5px;">
                        <h4 style="margin:10px 0;">${p.name || 'بدون اسم'}</h4>
                        <div style="display:flex; justify-content:space-between; font-size:13px;">
                            <span style="color:#e67e22; font-weight:bold;">${p.price || 0} ريال</span>
                            <span>المخزون: ${p.stock || 0}</span>
                        </div>
                    </div>
                    <div class="order-footer" style="margin-top:10px; text-align:left;">
                        <button onclick="deleteProduct('${pId}')" class="btn-delete" style="background:none; border:none; color:red; cursor:pointer;">
                            <i class="fas fa-trash"></i> حذف
                        </button>
                    </div>
                </div>`;
        });
        console.log(`✅ تم جلب ${snapshot.size} منتجات بنجاح.`);

    } catch (err) {
        console.error("❌ خطأ أثناء جلب المنتجات من Firestore:", err);
        grid.innerHTML = `<p style="color:red;">خطأ في الاتصال بقاعدة البيانات.</p>`;
    }
}

function setupFormHandler() {
    const form = document.getElementById('product-main-form');
    if (!form) return;

    form.onsubmit = async (e) => {
        e.preventDefault();
        console.log("⏳ جاري حفظ المنتج...");

        try {
            const productData = {
                name: document.getElementById('p-name').value,
                code: document.getElementById('p-code').value,
                description: document.getElementById('p-desc')?.value || "",
                mainImage: document.getElementById('p-main-image')?.value || "",
                price: Number(document.getElementById('p-price').value),
                stock: Number(document.getElementById('p-stock').value),
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            await addDoc(collection(db, "products"), productData);
            alert("تم الحفظ بنجاح!");
            form.reset();
            fetchProducts();
        } catch (err) {
            console.error("❌ فشل في إضافة المنتج:", err);
            alert("حدث خطأ أثناء الحفظ.");
        }
    };
}

// جعل دالة الحذف متاحة للـ HTML
window.deleteProduct = async (id) => {
    if (confirm("هل أنت متأكد من الحذف؟")) {
        try {
            await deleteDoc(doc(db, "products", id));
            fetchProducts();
        } catch (err) {
            console.error("❌ خطأ في الحذف:", err);
        }
    }
};

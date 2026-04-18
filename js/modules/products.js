/**
 * js/modules/products.js
 * موديول إدارة المنتجات المطور - منصة تيرا
 */

import { db } from '../core/firebase.js';
import { 
    collection, addDoc, getDocs, deleteDoc, doc, updateDoc,
    serverTimestamp, query, orderBy 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export async function initProducts(container) {
    try {
        // تحميل الواجهة من المسار المعتمد في هيكلك
        const response = await fetch('./admin/modules/products.html');
        const html = await response.text();
        container.innerHTML = html;

        fetchProducts(); 
        setupFormHandler(); 
        
    } catch (error) {
        console.error("خطأ في تحميل الواجهة:", error);
    }
}

/**
 * جلب وعرض المنتجات حسب الهيكلة الجديدة
 */
async function fetchProducts() {
    const grid = document.getElementById('products-list-grid');
    if (!grid) return;

    try {
        const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        grid.innerHTML = ""; 

        snapshot.forEach((docSnap) => {
            const p = docSnap.data();
            const pId = docSnap.id;
            
            grid.innerHTML += `
                <div class="order-card" style="border-top: 4px solid #e67e22;">
                    <div class="order-body" style="padding:15px;">
                        <img src="${p.mainImage || 'admin/images/default-product.png'}" style="width:100%; height:150px; object-fit:cover; border-radius:8px; margin-bottom:10px;">
                        <h4 style="font-weight:800;">${p.name}</h4>
                        <p style="font-size:0.8rem; color:#64748b;">كود: ${p.code}</p>
                        <div style="display:flex; justify-content:space-between; margin-top:10px;">
                            <span style="color:#e67e22; font-weight:700;">${p.price} ريال</span>
                            <span>المخزون: ${p.stock}</span>
                        </div>
                    </div>
                    <div class="order-footer" style="padding:10px; background:#f8fafc; display:flex; justify-content:space-between;">
                        <button onclick="deleteProduct('${pId}')" style="color:#ef4444; border:none; background:none; cursor:pointer;">حذف</button>
                        <small style="color:#94a3b8;">${p.createdAt?.toDate().toLocaleDateString('en-GB') || ''}</small>
                    </div>
                </div>`;
        });
    } catch (err) {
        console.error("Error fetching products:", err);
    }
}

/**
 * معالج الحفظ بالهيكلة الجديدة
 */
function setupFormHandler() {
    const form = document.getElementById('product-main-form');
    if (!form) return;

    form.onsubmit = async (e) => {
        e.preventDefault();
        
        // تجهيز مصفوفة الصور الإضافية (بناءً على حقل إدخال مفصول بفاصلة أو روابط)
        const galleryInput = document.getElementById('p-gallery').value;
        const galleryArray = galleryInput ? galleryInput.split(',').map(img => img.trim()) : [];

        const productData = {
            name: document.getElementById('p-name').value,
            code: document.getElementById('p-code').value,
            description: document.getElementById('p-desc').value, // HTML Content
            mainImage: document.getElementById('p-main-image').value,
            galleryImages: galleryArray,
            price: Number(document.getElementById('p-price').value),
            stock: Number(document.getElementById('p-stock').value),
            video: document.getElementById('p-video').value || null,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        try {
            await addDoc(collection(db, "products"), productData);
            alert("تم حفظ المنتج في منصة تيرا بنجاح.");
            form.reset();
            fetchProducts();
        } catch (err) {
            console.error("Error saving product:", err);
        }
    };
}

// دالة الحذف
window.deleteProduct = async (id) => {
    if (confirm("هل أنت متأكد من حذف هذا المنتج؟")) {
        await deleteDoc(doc(db, "products", id));
        fetchProducts();
    }
};

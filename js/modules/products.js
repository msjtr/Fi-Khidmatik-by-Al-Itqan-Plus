/**
 * js/modules/products.js
 * موديول إدارة المستودع - منصة تيرا
 */

import { db } from '../core/firebase.js';
import { 
    collection, getDocs, deleteDoc, doc, query, orderBy 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export async function initProducts(container) {
    try {
        // تحميل الواجهة التي أرسلتها أنت
        const response = await fetch('./admin/modules/products.html');
        const html = await response.text();
        container.innerHTML = html;

        console.log("✅ تم تحميل واجهة المستودع.");
        
        // تشغيل الجلب فوراً
        fetchProducts();
        
    } catch (error) {
        console.error("❌ خطأ في تحميل الواجهة:", error);
    }
}

async function fetchProducts() {
    // الـ ID الصحيح حسب الكود الذي أرسلته أنت
    const tableBody = document.getElementById('products-list-body');
    
    if (!tableBody) {
        console.error("❌ لم يتم العثور على 'products-list-body' في ملف HTML.");
        return;
    }

    try {
        const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        
        tableBody.innerHTML = ""; // تنظيف رسالة "جاري فحص المستودع"

        if (snapshot.empty) {
            tableBody.innerHTML = `<tr><td colspan="6" style="padding:30px; text-align:center;">المستودع فارغ حالياً.</td></tr>`;
            return;
        }

        snapshot.forEach((docSnap) => {
            const p = docSnap.data();
            const pId = docSnap.id;
            
            // تحديد لون حالة المخزون
            let stockClass = 'stock-in';
            let stockText = 'متوفر';
            if (p.stock <= 0) {
                stockClass = 'stock-out';
                stockText = 'نفد';
            } else if (p.stock < 5) {
                stockClass = 'stock-low';
                stockText = 'منخفض';
            }

            // حقن الصف في الجدول
            tableBody.innerHTML += `
                <tr style="border-bottom: 1px solid #f1f1f1;">
                    <td style="padding:15px;">
                        <div class="product-img-slot">
                            <img src="${p.mainImage || 'admin/images/default-product.png'}" alt="">
                        </div>
                    </td>
                    <td style="padding:15px;">
                        <div style="font-weight:bold; color:#2c3e50;">${p.name}</div>
                        <div style="font-size:0.75rem; color:#95a5a6;">${p.code || 'بدون كود'}</div>
                    </td>
                    <td style="padding:15px; font-weight:bold; color:#e67e22;">${p.price} ريال</td>
                    <td style="padding:15px;">${p.stock}</td>
                    <td style="padding:15px;">
                        <span class="stock-badge ${stockClass}">${stockText}</span>
                    </td>
                    <td style="padding:15px;">
                        <button onclick="deleteProduct('${pId}')" style="background:none; border:none; color:#e74c3c; cursor:pointer;">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
        console.log("✅ تم تحديث قائمة المستودع.");

    } catch (err) {
        console.error("❌ خطأ أثناء جلب المنتجات:", err);
        tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color:red; padding:20px;">خطأ في الاتصال بقاعدة البيانات.</td></tr>`;
    }
}

// دالة الحذف
window.deleteProduct = async (id) => {
    if (confirm("هل تريد إزالة هذا المنتج من المستودع؟")) {
        try {
            await deleteDoc(doc(db, "products", id));
            fetchProducts();
        } catch (err) {
            console.error("❌ فشل الحذف:", err);
        }
    }
};

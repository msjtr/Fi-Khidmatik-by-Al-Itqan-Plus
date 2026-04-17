// js/modules/customers.js
import { db } from '../core/firebase.js'; 
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export async function initCustomers(container) {
    // إعداد الهيكل الأساسي مع إضافة زر "إضافة عميل" لتكتمل الوظائف
    container.innerHTML = `
        <div style="padding:20px; font-family: 'Tajawal', sans-serif;" dir="rtl">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:25px;">
                <h2 style="color:#2c3e50; margin:0;"><i class="fas fa-users"></i> قاعدة بيانات عملاء تيرا</h2>
                <button id="btn-add-customer" style="background:#2ecc71; color:white; border:none; padding:10px 20px; border-radius:8px; cursor:pointer; font-weight:bold;">
                    <i class="fas fa-user-plus"></i> إضافة عميل جديد
                </button>
            </div>
            <div id="customers-grid" style="display:grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap:20px;">
                <div style="text-align:center; padding:40px; grid-column: 1/-1;">
                    <i class="fas fa-sync fa-spin fa-2x" style="color:#3498db;"></i>
                    <p>جاري تحميل قائمة العملاء...</p>
                </div>
            </div>
        </div>
    `;

    // ربط زر الإضافة
    const addBtn = document.getElementById('btn-add-customer');
    if(addBtn) addBtn.onclick = () => alert('وظيفة إضافة عميل ستفتح قريباً...');

    await loadCustomers();
}

async function loadCustomers() {
    const target = document.getElementById('customers-grid');
    
    // 1. فحص هل db معرف؟
    if (!db) {
        console.error("خطأ: لم يتم تحميل قاعدة البيانات db. تأكد من مسار ../core/firebase.js");
        target.innerHTML = `<div style="grid-column:1/-1; color:red; text-align:center;">تعذر الاتصال بقاعدة البيانات. تأكد من إعدادات Firebase.</div>`;
        return;
    }

    try {
        const snap = await getDocs(collection(db, "customers"));
        
        if (snap.empty) {
            target.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:40px; color:#7f8c8d;">لا يوجد عملاء مسجلين حالياً.</div>`;
            return;
        }

        target.innerHTML = snap.docs.map(doc => {
            const c = doc.data();
            // معالجة العناوين لتظهر كاملة
            const fullLocation = `${c.city || ''} - ${c.district || ''}`.replace(/^- |-$/g, '');
            
            return `
                <div style="background:white; padding:20px; border-radius:15px; box-shadow:0 4px 12px rgba(0,0,0,0.05); border:1px solid #eee; position:relative; overflow:hidden;">
                    <div style="display:flex; align-items:center; margin-bottom:15px;">
                        <div style="width:50px; height:50px; background:#f4f7f6; color:#3498db; border-radius:12px; display:flex; align-items:center; justify-content:center; margin-left:15px; font-size:1.3rem;">
                            <i class="fas fa-user"></i>
                        </div>
                        <div>
                            <h4 style="margin:0; color:#2c3e50; font-size:1.1rem;">${c.name || 'عميل غير مسمى'}</h4>
                            <small style="color:#95a5a6;">${c.email || 'لا يوجد بريد'}</small>
                        </div>
                    </div>
                    
                    <div style="font-size:0.9rem; color:#34495e; background:#fcfcfc; padding:10px; border-radius:10px;">
                        <div style="margin-bottom:8px;"><i class="fas fa-phone" style="width:20px; color:#27ae60;"></i> ${c.phone || '---'}</div>
                        <div style="margin-bottom:8px;"><i class="fas fa-map-marker-alt" style="width:20px; color:#e74c3c;"></i> ${fullLocation || 'العنوان غير محدد'}</div>
                        <div style="font-size:0.85rem; color:#7f8c8d; padding-right:20px;">${c.street || ''}</div>
                    </div>

                    <div style="margin-top:15px; text-align:left;">
                        <button onclick="window.printCustomer('${doc.id}')" style="background:none; border:none; color:#3498db; cursor:pointer; font-size:0.85rem;">
                            <i class="fas fa-print"></i> طباعة الملف
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    } catch (err) {
        console.error("Firestore Error:", err);
        target.innerHTML = `<div style="grid-column:1/-1; color:red; text-align:center;">حدث خطأ أثناء جلب البيانات: ${err.message}</div>`;
    }
}

// دالة الطباعة لتكون متاحة عالمياً
window.printCustomer = (id) => {
    alert("جاري تجهيز ملف العميل للطباعة...");
};

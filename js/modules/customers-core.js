/**
 * js/modules/customers-core.js
 * إدارة العملاء والخدمات - Tera Gateway
 */

import { db } from '../core/config.js';
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/**
 * تهيئة القسم وجلب كافة البيانات
 */
export async function initCustomers(container) {
    if (!container) return;
    
    // 1. عرض مؤشر التحميل
    container.innerHTML = `
        <div style="text-align:center; padding:50px; color:#e67e22;">
            <i class="fas fa-circle-notch fa-spin fa-3x"></i>
            <p style="margin-top:15px; font-weight:bold;">جاري تحميل بيانات العملاء في حائل...</p>
        </div>`;

    try {
        const q = query(collection(db, "customers"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            container.innerHTML = '<div class="empty-state">لا يوجد عملاء حالياً في قاعدة البيانات.</div>';
            return;
        }

        let customersHTML = '';
        querySnapshot.forEach((doc) => {
            customersHTML += renderCustomerCard(doc.id, doc.data());
        });

        // 2. بناء الهيكل الرئيسي
        renderLayout(container, customersHTML);
        
        // 3. تفعيل الأزرار بنظام Delegation (لحل مشكلة توقف الأزرار)
        attachEventListeners(container);

    } catch (error) {
        console.error("Firestore Error:", error);
        container.innerHTML = `<div class="error-box">خطأ في الوصول للبيانات: ${error.message}</div>`;
    }
}

/**
 * هيكل العرض الرئيسي
 */
function renderLayout(container, content) {
    container.innerHTML = `
        <div class="customers-wrapper">
            <div class="header-section">
                <h2><i class="fas fa-users-cog"></i> سجل عملاء المنطقة</h2>
                <div class="stats">إجمالي المسجلين: <span id="count-badge">..</span></div>
            </div>
            
            <div class="customers-list-container">
                ${content}
            </div>
        </div>

        <style>
            .customers-wrapper { padding: 20px; font-family: 'Tajawal', sans-serif; }
            .header-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
            .customers-list-container { display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 20px; }
            
            .c-card { background: white; border-radius: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #eee; overflow: hidden; }
            .c-header { background: #f8fafc; padding: 15px; border-bottom: 1px solid #f0f0f0; display: flex; align-items: center; gap: 12px; }
            .c-icon { width: 45px; height: 45px; background: #e67e22; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
            
            .c-body { padding: 20px; }
            .data-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
            .data-item { margin-bottom: 12px; border-bottom: 1px solid #fafafa; padding-bottom: 5px; }
            .data-item label { display: block; font-size: 0.75rem; color: #94a3b8; }
            .data-item span { font-weight: 700; color: #334155; font-size: 0.9rem; }
            
            .national-address-box { 
                grid-column: span 2; background: #fffaf5; border: 1px solid #ffe8d1; 
                padding: 10px; border-radius: 8px; margin-top: 10px;
            }
            .address-title { font-size: 0.8rem; font-weight: 800; color: #e67e22; margin-bottom: 8px; display: block; }
            
            .btn-action { 
                width: 100%; padding: 12px; border: none; background: #2c3e50; color: white; 
                border-radius: 8px; cursor: pointer; font-weight: bold; margin-top: 15px; transition: 0.3s;
            }
            .btn-action:hover { background: #e67e22; }

            .badge { background: #e2e8f0; padding: 2px 8px; border-radius: 4px; font-family: monospace; color: #e67e22; }
        </style>
    `;
}

/**
 * رسم بطاقة العميل مع كافة العناصر المطلوبة
 */
function renderCustomerCard(id, d) {
    return `
        <div class="c-card">
            <div class="c-header">
                <div class="c-icon"><i class="fas fa-user-check"></i></div>
                <div>
                    <div style="font-weight:800; color:#2c3e50;">${d.name || 'غير مسمى'}</div>
                    <small>${d.phone || '-'}</small>
                </div>
            </div>
            <div class="c-body">
                <div class="data-grid">
                    <div class="data-item"><label>البريد</label><span>${d.email || '-'}</span></div>
                    <div class="data-item"><label>المدينة</label><span>${d.city || 'حائل'}</span></div>
                    
                    <div class="national-address-box">
                        <span class="address-title"><i class="fas fa-map-marker-alt"></i> العنوان الوطني المفصل:</span>
                        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
                            <div><label>الحي:</label> <span>${d.district || '-'}</span></div>
                            <div><label>الشارع:</label> <span>${d.street || '-'}</span></div>
                            <div><label>رقم المبنى:</label> <span class="badge">${d.buildingNo || '-'}</span></div>
                            <div><label>الإضافي:</label> <span class="badge">${d.additionalNo || '-'}</span></div>
                            <div><label>ص.ب:</label> <span>${d.poBox || '-'}</span></div>
                            <div><label>الرمز البريدي:</label> <span class="badge">${d.postalCode || '55421'}</span></div>
                        </div>
                    </div>
                </div>

                <button class="btn-action customer-btn" data-id="${id}">
                    <i class="fas fa-external-link-alt"></i> فتح الطلبات والخدمات
                </button>
            </div>
        </div>
    `;
}

/**
 * وظيفة ربط الأحداث للأزرار
 */
function attachEventListeners(container) {
    container.addEventListener('click', function(e) {
        // البحث عن الزر حتى لو ضغط المستخدم على الأيقونة بداخل الزر
        const btn = e.target.closest('.customer-btn');
        
        if (btn) {
            const customerId = btn.getAttribute('data-id');
            console.log("🚀 جاري فتح خدمات العميل ID:", customerId);
            
            // هنا يتم الربط مع موديول الطلبات
            if (window.switchModule) {
                window.switchModule('orders', { customerId: customerId });
            } else {
                alert("جاري الانتقال لطلبات العميل: " + customerId);
            }
        }
    });

    // تحديث عدد العملاء
    const count = container.querySelectorAll('.c-card').length;
    const badge = container.querySelector('#count-badge');
    if (badge) badge.innerText = count;
}

/**
 * js/modules/customers-core.js
 * إدارة وجلب كافة العملاء من Firebase وربط الخدمات
 */

import { db } from '../core/config.js';
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/**
 * تهيئة القسم وجلب كافة البيانات
 */
export async function initCustomers(container) {
    if (!container) return;
    
    // إظهار شاشة التحميل
    container.innerHTML = '<div class="loader-inline"><i class="fas fa-spinner fa-spin"></i> جاري جلب كافة العملاء...</div>';

    try {
        const customersRef = collection(db, "customers");
        // جلب العملاء وترتيبهم حسب الأحدث
        const q = query(customersRef, orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            container.innerHTML = '<div class="empty-state">لا يوجد عملاء مسجلين حالياً.</div>';
            return;
        }

        let customersListHTML = '';
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            customersListHTML += renderCustomerRow(data);
        });

        renderMainLayout(container, customersListHTML);
        
    } catch (error) {
        console.error("خطأ في جلب البيانات:", error);
        container.innerHTML = '<div class="error-msg">حدث خطأ أثناء تحميل البيانات. تأكد من إعدادات Firestore.</div>';
    }
}

/**
 * هيكل الصفحة الرئيسي
 */
function renderMainLayout(container, listContent) {
    container.innerHTML = `
        <div class="customers-module">
            <div class="module-header">
                <h2><i class="fas fa-users"></i> إدارة العملاء والخدمات</h2>
                <button class="btn-add-customer"><i class="fas fa-plus"></i> إضافة عميل جديد</button>
            </div>
            
            <div class="customers-grid">
                ${listContent}
            </div>
        </div>

        <style>
            .customers-module { padding: 20px; }
            .module-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; }
            .customers-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px; }
            
            .customer-card { 
                background: white; border-radius: 15px; border: 1px solid #eef2f6; 
                box-shadow: 0 4px 12px rgba(0,0,0,0.03); transition: 0.3s; overflow: hidden;
            }
            .customer-card:hover { transform: translateY(-5px); box-shadow: 0 8px 20px rgba(0,0,0,0.08); }
            
            .card-top { padding: 20px; background: #fafbfc; border-bottom: 1px solid #f1f4f8; display: flex; align-items: center; gap: 15px; }
            .user-icon { width: 50px; height: 50px; background: #e67e22; color: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; }
            
            .card-body { padding: 20px; }
            .info-line { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 0.9rem; }
            .info-line label { color: #7f8c8d; }
            .info-line span { font-weight: 700; color: #2c3e50; }
            
            .services-tag-container { margin-top: 15px; padding-top: 15px; border-top: 1px dashed #eee; }
            .service-pill { 
                display: inline-block; background: #fef5e8; color: #e67e22; 
                padding: 5px 12px; border-radius: 8px; font-size: 0.8rem; font-weight: bold; margin-bottom: 5px;
            }
            
            .btn-view-details { 
                width: 100%; margin-top: 15px; padding: 10px; border: none; 
                background: #f8fafc; color: #64748b; font-weight: bold; cursor: pointer; transition: 0.2s;
            }
            .btn-view-details:hover { background: #e67e22; color: white; }

            .loader-inline { text-align: center; padding: 50px; color: #e67e22; font-weight: bold; }
        </style>
    `;
}

/**
 * رسم بطاقة العميل الفردية
 */
function renderCustomerRow(data) {
    return `
        <div class="customer-card">
            <div class="card-top">
                <div class="user-icon"><i class="fas fa-user"></i></div>
                <div>
                    <h4 style="margin:0">${data.name || 'بدون اسم'}</h4>
                    <small style="color:#95a5a6">${data.city || 'حائل'} - ${data.district || 'النقرة'}</small>
                </div>
            </div>
            <div class="card-body">
                <div class="info-line">
                    <label>رقم الجوال:</label>
                    <span dir="ltr">${data.phone || '-'}</span>
                </div>
                <div class="info-line">
                    <label>الرمز البريدي:</label>
                    <span>${data.postalCode || '-'}</span>
                </div>
                
                <div class="services-tag-container">
                    <div class="service-pill"><i class="fas fa-sim-card"></i> أقساط سوا</div>
                    <div class="service-pill"><i class="fas fa-file-contract"></i> خدمة تمارا</div>
                </div>

                <button class="btn-view-details">عرض الملف الكامل</button>
            </div>
        </div>
    `;
}

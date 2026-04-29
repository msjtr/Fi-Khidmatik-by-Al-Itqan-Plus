/**
 * js/modules/customers-ui.js
 * موديول واجهة إدارة العملاء - متوافق مع نظام Tera V12
 */

// 1. استيراد النسخة المهيأة مسبقاً (السر في هذا السطر ✅)
import { db } from '../core/config.js'; 
import { 
    collection, 
    getDocs, 
    query, 
    orderBy 
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

/**
 * دالة تهيئة واجهة العملاء
 */
export async function initCustomersUI(container) {
    console.log("🚀 Tera Gateway: جاري تحميل بيانات العملاء...");

    // 1. إعداد الهيكل البصري للجدول
    container.innerHTML = `
        <div class="customers-view-container">
            <div class="view-header">
                <h3><i class="fas fa-users"></i> إدارة العملاء</h3>
                <p>عرض وتعديل بيانات العملاء المسجلين في نظام "في خدمتك"</p>
            </div>
            
            <div class="table-responsive">
                <table class="tera-table">
                    <thead>
                        <tr>
                            <th>العميل</th>
                            <th>العنوان والتفاصيل</th>
                            <th>رقم الهاتف</th>
                            <th>التصنيف</th>
                            <th>تاريخ التسجيل</th>
                        </tr>
                    </thead>
                    <tbody id="customers-data-rows">
                        <tr>
                            <td colspan="5" class="text-center p-5">
                                <div class="loading-spinner-small"></div> جاري مزامنة البيانات...
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    const tbody = document.getElementById('customers-data-rows');
    
    try {
        // التحقق من أن db متاح
        if (!db) throw new Error("قاعدة البيانات غير متصلة. تأكد من تهيئة Firebase أولاً.");

        // 2. بناء الاستعلام (استخدام المجموعات المركزية من الإعدادات مفضل مستقبلاً)
        const customersRef = collection(db, "customers");
        const q = query(customersRef, orderBy("createdAt", "desc"));
        
        // 3. تنفيذ جلب البيانات
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            tbody.innerHTML = `<tr><td colspan="5" class="empty-msg text-center p-4">لا توجد سجلات عملاء حالياً</td></tr>`;
            return;
        }

        tbody.innerHTML = ""; // تنظيف صف التحميل

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const row = document.createElement('tr');
            
            // إصلاح: تعامل صحيح مع Firebase Timestamp
            let dateStr = '-';
            if (data.createdAt) {
                // إذا كان Timestamp من Firebase نستخدم toDate()، وإذا كان نصاً نستخدم New Date
                const dateObj = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
                dateStr = dateObj.toLocaleDateString('ar-SA');
            }

            row.innerHTML = `
                <td>
                    <div class="user-info">
                        <span class="user-name"><strong>${data.name || 'بدون اسم'}</strong></span><br>
                        <small class="text-muted">${data.email || ''}</small>
                    </div>
                </td>
                <td>
                    <div class="address-box">
                        <strong>${data.city || ''}</strong>، ${data.district || ''}<br>
                        <small>${data.street || ''} ${data.buildingNo ? '- مبنى: ' + data.buildingNo : ''}</small>
                    </div>
                </td>
                <td dir="ltr" class="text-right">
                    ${data.countryCode || '+966'} ${data.phone || ''}
                </td>
                <td>
                    <span class="badge ${data.tag === 'vip' ? 'bg-warning text-dark' : 'bg-info'}">
                        ${data.tag || 'عميل'}
                    </span>
                </td>
                <td>${dateStr}</td>
            `;
            tbody.appendChild(row);
        });

    } catch (error) {
        console.error("🔴 Error in initCustomersUI:", error);
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="error-msg text-center text-danger p-4">
                    <i class="fas fa-exclamation-triangle"></i> فشل جلب البيانات: ${error.message}
                </td>
            </tr>`;
    }
}

/**
 * js/modules/customers-ui.js
 * موديول واجهة إدارة العملاء - متوافق مع نظام Tera V12.12.6
 */

// 1. استيراد الخدمات من ملف الإعدادات المركزي (لضمان عمل db)
import { db, FIREBASE_COLLECTIONS } from '../core/config.js'; 
import { 
    collection, 
    getDocs, 
    query, 
    orderBy 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/**
 * دالة تهيئة واجهة العملاء
 * @param {HTMLElement} container - الحاوية التي سيتم رسم الجدول داخلها
 */
export async function initCustomersUI(container) {
    if (!container) return;
    
    console.log("🚀 Tera Gateway: جاري تحميل واجهة العملاء...");

    // 1. إعداد الهيكل البصري للجدول (تصميم Neumorphism المتوافق مع تيرا)
    container.innerHTML = `
        <div class="customers-view-container animated fadeIn">
            <div class="view-header" style="margin-bottom: 20px;">
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
                                <div class="loading-spinner-small"></div> جاري مزامنة البيانات من قاعدة بيانات تيرا...
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    const tbody = document.getElementById('customers-data-rows');
    
    try {
        // التحقق من جاهزية الاتصال
        if (!db) {
            throw new Error("قاعدة البيانات غير متصلة. تأكد من تهيئة ملف firebase.js بالإصدار 10.7.1");
        }

        // 2. بناء الاستعلام باستخدام المجموعة المركزية
        const collectionName = FIREBASE_COLLECTIONS?.customers || "customers";
        const customersRef = collection(db, collectionName);
        const q = query(customersRef, orderBy("createdAt", "desc"));
        
        // 3. تنفيذ جلب البيانات
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            tbody.innerHTML = `<tr><td colspan="5" class="empty-msg text-center p-4">لا توجد سجلات عملاء حالياً في منطقة حائل أو غيرها</td></tr>`;
            return;
        }

        tbody.innerHTML = ""; // تنظيف صف التحميل

        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const row = document.createElement('tr');
            
            // إصلاح منطق التاريخ ليدعم Firebase Timestamp
            let dateStr = '-';
            if (data.createdAt) {
                const dateObj = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
                dateStr = dateObj.toLocaleDateString('ar-SA', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            }

            // رسم الصف مع مراعاة الحقول الـ 17 لنظام تيرا
            row.innerHTML = `
                <td>
                    <div class="user-info" style="display:flex; align-items:center; gap:12px;">
                        <img src="${data.photoURL || 'admin/images/default-avatar.png'}" 
                             style="width:35px; height:35px; border-radius:50%; border: 2px solid #ddd;">
                        <div>
                            <span class="user-name"><strong>${data.name || 'بدون اسم'}</strong></span><br>
                            <small class="text-muted">${data.email || 'لا يوجد بريد'}</small>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="address-box">
                        <strong>${data.city || 'حائل'}</strong>، ${data.district || '-'}<br>
                        <small>${data.street || ''} ${data.buildingNo ? ' - مبنى ' + data.buildingNo : ''}</small>
                    </div>
                </td>
                <td dir="ltr" style="text-align: right; font-family: monospace;">
                    ${data.countryCode || '+966'} ${data.phone || ''}
                </td>
                <td>
                    <span class="badge ${data.tag?.toLowerCase() === 'vip' ? 'bg-warning text-dark' : 'bg-primary'}">
                        ${data.tag || (data.type === 'شركة' ? 'منشأة' : 'فرد')}
                    </span>
                </td>
                <td><small>${dateStr}</small></td>
            `;
            tbody.appendChild(row);
        });

    } catch (error) {
        console.error("🔴 Tera UI Error:", error);
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="error-msg text-center text-danger p-4">
                    <i class="fas fa-exclamation-triangle"></i> فشل جلب البيانات: ${error.message}
                </td>
            </tr>`;
    }
}

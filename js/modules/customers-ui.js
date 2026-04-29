// استيراد الدوال المطلوبة من الإصدار 12
import { 
    getFirestore, 
    collection, 
    getDocs, 
    query, 
    orderBy 
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

/**
 * دالة تهيئة واجهة العملاء
 * @param {HTMLElement} container - الحاوية التي سيتم حقن الجدول فيها
 */
export async function initCustomersUI(container) {
    console.log("🚀 Tera Gateway: موديول العملاء نشط (Firebase v12)");

    // 1. إعداد الهيكل البصري للجدول
    container.innerHTML = `
        <div class="customers-view-container">
            <div class="view-header">
                <h3><i class="fas fa-users"></i> إدارة العملاء</h3>
                <p>عرض وتعديل بيانات العملاء المسجلين في "في خدمتك"</p>
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
                            <td colspan="5" class="text-center">
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
        const db = getFirestore();
        
        // 2. بناء الاستعلام (ترتيب حسب تاريخ الإنشاء تنازلياً)
        const customersRef = collection(db, "customers");
        const q = query(customersRef, orderBy("createdAt", "desc"));
        
        // 3. تنفيذ جلب البيانات
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            tbody.innerHTML = `<tr><td colspan="5" class="empty-msg">لا توجد سجلات عملاء حالياً</td></tr>`;
            return;
        }

        tbody.innerHTML = ""; // تنظيف صف التحميل

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const row = document.createElement('tr');
            
            // تحويل الطابع الزمني (Timestamp) الخاص بفايربيز إلى تاريخ مقروء
            const dateStr = data.createdAt ? new Date(data.createdAt).toLocaleDateString('ar-SA') : '-';

            row.innerHTML = `
                <td>
                    <div class="user-info">
                        <span class="user-name">${data.name || 'بدون اسم'}</span>
                        <span class="user-email">${data.email || ''}</span>
                    </div>
                </td>
                <td>
                    <div class="address-box">
                        <strong>${data.city || ''}</strong>، ${data.district || ''}<br>
                        <small>${data.street || ''} - مبنى: ${data.buildingNo || ''}</small>
                    </div>
                </td>
                <td dir="ltr" class="text-right">
                    ${data.countryCode || ''} ${data.phone || ''}
                </td>
                <td>
                    <span class="tag-badge ${data.tag === 'vip' ? 'is-vip' : ''}">
                        ${data.tag || 'عميل'}
                    </span>
                </td>
                <td>${dateStr}</td>
            `;
            tbody.appendChild(row);
        });

    } catch (error) {
        console.error("Firebase v12 Error:", error);
        tbody.innerHTML = `<tr><td colspan="5" class="error-msg">فشل جلب البيانات: ${error.message}</td></tr>`;
    }
}

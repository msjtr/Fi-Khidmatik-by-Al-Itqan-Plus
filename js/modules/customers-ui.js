import { db } from '../core/firebase.js';
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

console.log('✅ customers-ui.js (العملاء) تم تحميله');

export async function initCustomers(container) {
    console.log('🚀 initCustomers بدأت');
    if (!container) {
        console.error('❌ container غير موجود');
        return;
    }
    
    // عرض واجهة التحميل
    container.innerHTML = `
        <div style="padding: 20px; font-family: 'Tajawal', sans-serif;">
            <h2 style="color: #2c3e50; margin-bottom: 20px;">
                <i class="fas fa-users" style="color: #e67e22;"></i> إدارة العملاء
            </h2>
            <div id="customers-container" style="margin-top: 20px;">
                <div style="text-align: center; padding: 40px;">
                    <i class="fas fa-spinner fa-spin fa-2x" style="color: #e67e22;"></i>
                    <p>جاري تحميل العملاء...</p>
                </div>
            </div>
        </div>
    `;
    
    try {
        // جلب العملاء من Firebase
        const q = query(collection(db, "customers"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const containerDiv = document.getElementById('customers-container');
        
        if (snapshot.empty) {
            containerDiv.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #7f8c8d;">
                    <i class="fas fa-users fa-3x" style="margin-bottom: 10px;"></i>
                    <p>لا يوجد عملاء مسجلين حالياً</p>
                </div>
            `;
            return;
        }
        
        // بناء جدول HTML
        let html = `
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 12px; overflow: hidden;">
                    <thead style="background: #f8f9fa;">
                        <tr>
                            <th style="padding: 12px;">#</th>
                            <th style="padding: 12px;">الاسم</th>
                            <th style="padding: 12px;">رقم الجوال</th>
                            <th style="padding: 12px;">البريد الإلكتروني</th>
                            <th style="padding: 12px;">المدينة</th>
                            <th style="padding: 12px;">الحي</th>
                            <th style="padding: 12px;">الشارع</th>
                            <th style="padding: 12px;">رقم المبنى</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        let index = 1;
        snapshot.forEach((doc) => {
            const data = doc.data();
            html += `
                <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 12px;">${index}</td>
                    <td style="padding: 12px; font-weight: bold;">${escapeHtml(data.name) || '-'}</td>
                    <td style="padding: 12px; direction: ltr;">${escapeHtml(data.phone) || '-'}</td>
                    <td style="padding: 12px;">${escapeHtml(data.email) || '-'}</td>
                    <td style="padding: 12px;">${escapeHtml(data.city) || '-'}</td>
                    <td style="padding: 12px;">${escapeHtml(data.district) || '-'}</td>
                    <td style="padding: 12px;">${escapeHtml(data.street) || '-'}</td>
                    <td style="padding: 12px;">${escapeHtml(data.buildingNo) || '-'}</td>
                </tr>
            `;
            index++;
        });
        
        html += `
                    </tbody>
                </table>
            </div>
            <div style="margin-top: 15px; padding: 10px; background: #e3f2fd; border-radius: 8px; text-align: center;">
                ✅ تم جلب ${snapshot.size} عميل من Firebase
            </div>
        `;
        
        containerDiv.innerHTML = html;
        
    } catch (error) {
        console.error('❌ خطأ في جلب العملاء:', error);
        document.getElementById('customers-container').innerHTML = `
            <div style="color: red; text-align: center; padding: 40px;">
                <i class="fas fa-exclamation-triangle fa-3x"></i>
                <p>خطأ في تحميل العملاء: ${error.message}</p>
            </div>
        `;
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

/**
 * js/modules/customers-ui.js
 * موديول العملاء - النسخة النهائية
 */

import { db } from '../core/firebase.js';
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

console.log('✅ customers-ui.js تم تحميله');

export async function initCustomers(container) {
    console.log('🚀 initCustomers تم استدعاؤها');
    
    if (!container) {
        console.error('❌ container غير موجود');
        return;
    }
    
    // عرض مؤشر تحميل
    container.innerHTML = `
        <div style="padding: 25px; font-family: 'Tajawal', sans-serif;">
            <h2 style="color: #2c3e50;">
                <i class="fas fa-users" style="color: #e67e22;"></i> 
                إدارة العملاء
            </h2>
            <div id="customers-list" style="margin-top: 20px; text-align: center;">
                <i class="fas fa-spinner fa-spin fa-2x" style="color: #e67e22;"></i>
                <p style="margin-top: 10px;">جاري تحميل العملاء...</p>
            </div>
        </div>
    `;
    
    try {
        const q = query(collection(db, "customers"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const customers = [];
        snapshot.forEach(doc => {
            customers.push({ id: doc.id, ...doc.data() });
        });
        
        const listDiv = document.getElementById('customers-list');
        if (!customers.length) {
            listDiv.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #7f8c8d;">
                    <i class="fas fa-users fa-3x" style="margin-bottom: 15px; display: block;"></i>
                    <p>لا يوجد عملاء مسجلين حالياً</p>
                    <p style="font-size: 12px;">✅ تم الاتصال بـ Firebase بنجاح</p>
                </div>
            `;
            return;
        }
        
        let html = `
            <div style="margin-bottom: 15px;">
                <p style="color: #27ae60; background: #d4edda; padding: 10px; border-radius: 8px;">
                    ✅ تم جلب ${customers.length} عميل من Firebase
                </p>
            </div>
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 12px; overflow: hidden;">
                    <thead style="background: #f8f9fa; border-bottom: 2px solid #e9ecef;">
                        <tr>
                            <th style="padding: 12px; text-align: right;">#</th>
                            <th style="padding: 12px; text-align: right;">الاسم</th>
                            <th style="padding: 12px; text-align: right;">الجوال</th>
                            <th style="padding: 12px; text-align: right;">البريد الإلكتروني</th>
                            <th style="padding: 12px; text-align: right;">المدينة</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        customers.forEach((customer, index) => {
            html += `
                <tr style="border-bottom: 1px solid #f1f5f9;">
                    <td style="padding: 12px;">${index + 1}</td>
                    <td style="padding: 12px; font-weight: bold;">${escapeHtml(customer.name)}</td>
                    <td style="padding: 12px; direction: ltr;">${escapeHtml(customer.phone)}</td>
                    <td style="padding: 12px;">${escapeHtml(customer.email) || '-'}</td>
                    <td style="padding: 12px;">${escapeHtml(customer.city) || '-'}</td>
                </tr>
            `;
        });
        
        html += `
                    </tbody>
                </table>
            </div>
        `;
        
        listDiv.innerHTML = html;
        
    } catch (error) {
        console.error('❌ خطأ في جلب العملاء:', error);
        document.getElementById('customers-list').innerHTML = `
            <div style="text-align: center; padding: 40px; color: #e74c3c;">
                <i class="fas fa-exclamation-triangle fa-3x"></i>
                <p>حدث خطأ في تحميل العملاء</p>
                <p style="font-size: 12px;">${error.message}</p>
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

/**
 * js/modules/customers-ui.js
 * موديول العملاء - نسخة مبسطة ونظيفة
 */

import { db } from '../core/firebase.js';
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

console.log('✅ customers-ui.js تم تحميله بنجاح');

// ===================== جلب العملاء من Firebase =====================

async function getCustomersFromFirebase() {
    console.log('👥 جلب العملاء من Firebase...');
    try {
        const q = query(collection(db, "customers"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        console.log(`📊 عدد العملاء: ${querySnapshot.size}`);
        
        const customers = [];
        querySnapshot.forEach((doc) => {
            customers.push({
                id: doc.id,
                ...doc.data()
            });
        });
        return customers;
    } catch (error) {
        console.error('❌ خطأ في جلب العملاء:', error);
        return [];
    }
}

// ===================== عرض العملاء =====================

function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function formatFullAddress(customer) {
    if (!customer) return '';
    const parts = [];
    if (customer.buildingNo) parts.push('مبنى ' + customer.buildingNo);
    if (customer.street) parts.push('شارع ' + customer.street);
    if (customer.district) parts.push('حي ' + customer.district);
    if (customer.city) parts.push(customer.city);
    if (customer.additionalNo) parts.push('رقم إضافي ' + customer.additionalNo);
    if (customer.poBox) parts.push('ص.ب ' + customer.poBox);
    if (customer.country) parts.push(customer.country);
    return parts.length > 0 ? parts.join('، ') : 'لا يوجد عنوان';
}

async function renderCustomers(container) {
    console.log('🎨 عرض العملاء...');
    
    const customers = await getCustomersFromFirebase();
    
    if (!customers || customers.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 60px; color: #7f8c8d;">
                <i class="fas fa-users fa-3x" style="margin-bottom: 15px; display: block;"></i>
                <p>لا يوجد عملاء مسجلين حالياً</p>
                <p style="font-size: 12px;">✅ تم الاتصال بـ Firebase بنجاح ولكن مجموعة customers فارغة</p>
            </div>
        `;
        return;
    }
    
    let html = `
        <div style="margin-bottom: 20px;">
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
                        <th style="padding: 12px; text-align: right;">العنوان</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    for (let i = 0; i < customers.length; i++) {
        const c = customers[i];
        const fullAddress = formatFullAddress(c);
        
        html += `
            <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 12px;">${i + 1}</td>
                <td style="padding: 12px; font-weight: bold;">${escapeHtml(c.name)}</td>
                <td style="padding: 12px; direction: ltr;">${escapeHtml(c.phone)}</td>
                <td style="padding: 12px;">${escapeHtml(c.email) || '-'}</td>
                <td style="padding: 12px;">${escapeHtml(c.city) || '-'}</td>
                <td style="padding: 12px; max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${escapeHtml(fullAddress)}">
                    ${escapeHtml(fullAddress.length > 35 ? fullAddress.substring(0, 35) + '...' : fullAddress)}
                </td>
            </tr>
        `;
    }
    
    html += `
                </tbody>
            </table>
        </div>
    `;
    
    container.innerHTML = html;
    console.log('✅ تم عرض العملاء بنجاح');
}

// ===================== الدالة الرئيسية =====================

export async function initCustomers(container) {
    console.log('🚀 initCustomers تم استدعاؤها');
    
    if (!container) {
        console.error('❌ container غير موجود');
        return;
    }
    
    // عرض واجهة التحميل
    container.innerHTML = `
        <div style="padding: 25px; font-family: 'Tajawal', sans-serif;">
            <h2 style="color: #2c3e50; margin-bottom: 20px;">
                <i class="fas fa-users" style="color: #e67e22;"></i> 
                إدارة العملاء
            </h2>
            <div id="customers-container" style="margin-top: 20px;">
                <div style="text-align: center; padding: 40px;">
                    <i class="fas fa-spinner fa-spin fa-2x" style="color: #e67e22;"></i>
                    <p style="margin-top: 10px;">جاري تحميل العملاء...</p>
                </div>
            </div>
        </div>
    `;
    
    const customersContainer = document.getElementById('customers-container');
    if (customersContainer) {
        await renderCustomers(customersContainer);
    }
}

// تصدير افتراضي
export default { initCustomers };

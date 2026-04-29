/**
 * js/modules/customers-ui.js
 * موديول عرض بيانات العملاء - الإصدار 12.12.6
 * متوافق مع بنية بيانات حائل (النقرة) وحقول Firestore الـ 17
 */

import { db, COLLECTIONS } from '../core/config.js'; 
import { 
    collection, 
    getDocs, 
    query, 
    orderBy 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export async function initCustomersUI(container) {
    if (!container) return;
    
    container.innerHTML = `
        <div class="customers-view-container animated fadeIn">
            <div class="view-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                <div>
                    <h3 style="margin:0; color: #1e293b;"><i class="fas fa-address-card" style="color: #2563eb;"></i> سجل العملاء المعتمد</h3>
                    <p style="font-size: 0.85rem; color: #64748b; margin-top: 5px;">إدارة بيانات المستفيدين في منطقة حائل</p>
                </div>
                <div class="header-actions">
                    <button class="btn-tera secondary" onclick="window.print()"><i class="fas fa-print"></i> طباعة السجل</button>
                </div>
            </div>
            
            <div class="table-responsive card-style">
                <table class="tera-table">
                    <thead>
                        <tr>
                            <th>العميل</th>
                            <th>العنوان الوطني (حائل)</th>
                            <th>الاتصال</th>
                            <th>الحالة/الوسم</th>
                            <th>آخر تحديث</th>
                        </tr>
                    </thead>
                    <tbody id="customers-data-rows">
                        <tr><td colspan="5" class="text-center p-5"><div class="spinner-tera"></div></td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    const tbody = document.getElementById('customers-data-rows');
    
    try {
        const customersRef = collection(db, COLLECTIONS.customers);
        const q = query(customersRef, orderBy("name", "asc")); 
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center p-5">لا توجد سجلات حالية.</td></tr>`;
            return;
        }

        tbody.innerHTML = "";

        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            
            // 1. معالجة التواريخ (دعم String و Timestamp)
            const formatDT = (val) => {
                if (!val) return '-';
                const d = val.toDate ? val.toDate() : new Date(val);
                return d.toLocaleDateString('ar-SA');
            };

            // 2. تجميع العنوان الوطني حسب بنية بياناتك
            const fullAddress = `
                <div class="address-chip">
                    <strong>${data.district || ''}</strong> - ${data.street || ''}<br>
                    <small>مبنى: ${data.buildingNo || ''} | إضافي: ${data.additionalNo || ''} | ص.ب: ${data.postalCode || ''}</small>
                </div>
            `;

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div class="user-cell">
                        <div class="avatar-circle">${data.name ? data.name.charAt(0) : '?'}</div>
                        <div class="user-meta">
                            <span class="user-name">${data.name || 'غير مسجل'}</span>
                            <span class="user-sub">${data.email || ''}</span>
                        </div>
                    </div>
                </td>
                <td>${fullAddress}</td>
                <td dir="ltr" class="phone-cell">
                    <span style="color:#64748b; font-size: 0.8rem;">${data.countryCode || '+966'}</span> 
                    <strong>${data.phone || ''}</strong>
                </td>
                <td>
                    <span class="badge-tera ${data.tag === 'vip' ? 'vip' : 'normal'}">
                        ${data.tag ? data.tag.toUpperCase() : 'عادي'}
                    </span>
                </td>
                <td style="font-size: 0.85rem; color: #475569;">
                    ${formatDT(data.updatedAt)}
                </td>
            `;
            tbody.appendChild(row);
        });

    } catch (error) {
        console.error("Error fetching customers:", error);
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger p-4">خطأ في المزامنة: ${error.message}</td></tr>`;
    }
}

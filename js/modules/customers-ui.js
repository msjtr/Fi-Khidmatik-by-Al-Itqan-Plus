/**
 * js/modules/customers-ui.js
 * موديول واجهة مستخدم العملاء - الإصدار المحدث V12.12.1
 */

import { collection, query, orderBy, getDocs } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";
import { db } from "../core/firebase.js";

export async function initCustomersUI(container) {
    console.log("🚀 Tera Gateway: جاري تحضير واجهة العملاء الحديثة...");

    // نظام الانتظار لضمان اكتمال تهيئة Firebase قبل بدء الرسم
    const waitForDb = () => {
        return new Promise((resolve) => {
            if (window.db) return resolve(window.db);
            const interval = setInterval(() => {
                if (window.db) {
                    clearInterval(interval);
                    resolve(window.db);
                }
            }, 100);
        });
    };

    try {
        await waitForDb();
        const tableBody = container.querySelector('#customers-data-rows');
        
        if (tableBody) {
            await renderCustomersTable(tableBody);
        } else {
            // مراقب التغييرات في حال لم تكن الواجهة محملة بالكامل بعد
            const observer = new MutationObserver(() => {
                const target = container.querySelector('#customers-data-rows');
                if (target) {
                    renderCustomersTable(target);
                    observer.disconnect();
                }
            });
            observer.observe(container, { childList: true, subtree: true });
        }
    } catch (err) {
        console.error("❌ فشل تشغيل موديول العملاء:", err);
    }
}

async function renderCustomersTable(tableBody) {
    tableBody.innerHTML = '<tr><td colspan="17" style="text-align:center; padding:40px;">جاري مزامنة بيانات تيرا جيت واي...</td></tr>';

    try {
        // استخدام نظام الاستعلام الحديث V12
        const customersRef = collection(db, "customers");
        const q = query(customersRef, orderBy("name"));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
            tableBody.innerHTML = '<tr><td colspan="17" style="text-align:center; padding:30px;">لا يوجد عملاء مسجلين حالياً.</td></tr>';
            return;
        }

        let html = '';
        let index = 1;

        snapshot.forEach(customerDoc => {
            const data = customerDoc.data();
            const id = customerDoc.id;

            // تنسيق التاريخ بذكاء
            const registrationDate = data.createdAt?.toDate 
                ? data.createdAt.toDate().toLocaleDateString('ar-SA') 
                : '---';

            html += `
                <tr>
                    <td class="sticky-col">${index++}</td>
                    <td class="sticky-col-name"><strong>${data.name || '---'}</strong></td>
                    <td dir="ltr">${data.phone || '---'}</td>
                    <td>${data.countryCode || '+966'}</td>
                    <td>${data.email || '---'}</td>
                    <td>${data.country || 'السعودية'}</td>
                    <td>${data.city || '---'}</td>
                    <td>${data.district || '---'}</td>
                    <td>${data.street || '---'}</td>
                    <td>${data.buildingNo || data.building_no || '---'}</td>
                    <td>${data.additionalNo || data.additional_no || '---'}</td>
                    <td>${data.postalCode || data.zip_code || '---'}</td>
                    <td>${data.poBox || data.po_box || '---'}</td>
                    <td>${registrationDate}</td>
                    <td><span class="status-badge ${data.status === 'active' || data.status === 'نشط' ? 'status-active' : 'status-inactive'}">${data.status || 'نشط'}</span></td>
                    <td><span class="badge ${data.tag === 'VIP' || data.classification === 'VIP' ? 'vip' : 'regular'}">${data.tag || data.classification || 'عادي'}</span></td>
                    <td class="sticky-actions-header">
                        <div class="table-actions">
                            <button onclick="window.editCustomer('${id}')" class="action-btn edit" title="تعديل"><i class="fas fa-edit"></i></button>
                            <button onclick="window.deleteCustomer('${id}')" class="action-btn delete" title="حذف"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                </tr>
            `;
        });

        tableBody.innerHTML = html;
        
        // تحديث عدادات الإحصائيات في اللوحة الرئيسية إن وجدت
        const statTotal = document.getElementById('stat-total');
        if (statTotal) statTotal.innerText = snapshot.size;

    } catch (error) {
        console.error("🔴 خطأ في عرض الجدول:", error);
        tableBody.innerHTML = `<tr><td colspan="17" style="color:red; text-align:center;">فشل جلب البيانات: ${error.message}</td></tr>`;
    }
}

/**
 * customers-ui.js 
 * هذا الملف يجلب البيانات من Firestore ويعرضها في الـ 17 عموداً
 */
import { db } from '../core/firebase.js'; // تأكد من صحة مسار ملف الفايربيس لديك
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export async function initCustomersUI(container) {
    const tableBody = document.getElementById('customers-data-rows');
    if (!tableBody) return;

    // 1. تنظيف الجدول وإظهار مؤشر تحميل
    tableBody.innerHTML = '<tr><td colspan="17" style="text-align:center;">جاري جلب بيانات العملاء...</td></tr>';

    try {
        // 2. تحديد المجموعة المطلوبة: customers
        const customersRef = collection(db, "customers");
        const q = query(customersRef, orderBy("createdAt", "desc")); // ترتيب حسب الأحدث
        const querySnapshot = await getDocs(q);

        tableBody.innerHTML = ''; // مسح مؤشر التحميل

        if (querySnapshot.empty) {
            tableBody.innerHTML = '<tr><td colspan="17" style="text-align:center;">لا يوجد عملاء في قاعدة البيانات حالياً.</td></tr>';
            return;
        }

        let index = 1;
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const tr = document.createElement('tr');
            tr.className = "customer-row";

            // 3. توزيع البيانات على الـ 17 عموداً بالترتيب الدقيق
            tr.innerHTML = `
                <td>${index++}</td>                           <td class="font-bold">${data.name || '---'}</td> <td>${data.phone || '---'}</td>                <td>${data.countryKey || '+966'}</td>          <td>${data.email || '---'}</td>                <td>${data.countryName || 'السعودية'}</td>      <td>${data.city || '---'}</td>                 <td>${data.district || '---'}</td>             <td>${data.street || '---'}</td>               <td>${data.buildingNo || '---'}</td>           <td>${data.extraNo || '---'}</td>              <td>${data.zipCode || '---'}</td>              <td>${data.poBox || '---'}</td>                <td>${data.createdAt || '---'}</td>            <td><span class="status-badge ${getStatusClass(data.status)}">${data.status || 'نشط'}</span></td> <td>${data.type || 'فرد'}</td>                 <td class="sticky-actions">                    <button onclick="editCust('${doc.id}')" class="btn-sm btn-edit"><i class="fas fa-edit"></i></button>
                    <button onclick="printCust('${doc.id}')" class="btn-sm btn-print"><i class="fas fa-print"></i></button>
                    <button onclick="deleteCust('${doc.id}')" class="btn-sm btn-delete"><i class="fas fa-trash"></i></button>
                </td>
            `;
            tableBody.appendChild(tr);
        });

    } catch (error) {
        console.error("خطأ في جلب المحتوى:", error);
        tableBody.innerHTML = '<tr><td colspan="17" style="text-align:center; color:red;">فشل تحميل البيانات. تأكد من إعدادات Firebase.</td></tr>';
    }
}

// دالة لتحديد لون حالة العميل
function getStatusClass(status) {
    if (status === 'نشط') return 'status-active';
    if (status === 'معلق') return 'status-pending';
    return 'status-inactive';
}

/**
 * customers-ui.js
 * موديول إدارة واجهة العملاء - إصلاح أخطاء الأقواس والتحميل
 */

import { db } from '../core/firebase.js';
import { collection, getDocs, addDoc, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export async function initCustomersUI(container) {
    console.log("إعداد واجهة العملاء...");
    await renderCustomerTable();
}

export async function renderCustomerTable() {
    const tableBody = document.querySelector('#customers-table-body');
    if (!tableBody) return;

    try {
        const querySnapshot = await getDocs(collection(db, "customers"));
        tableBody.innerHTML = '';

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const row = `
                <tr class="customer-row">
                    <td>${data.name || '---'}</td>
                    <td>${data.phone || '---'}</td>
                    <td>${data.city || '---'}</td>
                    <td><span class="badge status-${data.status || 'نشط'}">${data.status || 'نشط'}</span></td>
                    <td class="sticky-actions">
                        <button class="btn-sm btn-edit" onclick="editCustomer('${doc.id}')"><i class="fas fa-edit"></i></button>
                        <button class="btn-sm btn-delete" onclick="deleteCustomer('${doc.id}')"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>`;
            tableBody.innerHTML += row;
        });
    } catch (error) {
        console.error("خطأ في جلب البيانات:", error);
    }
}

export async function openAddCustomer() {
    const modal = document.getElementById('customer-modal');
    if (modal) modal.style.display = 'flex';
}

export function closeCustomerModal() {
    const modal = document.getElementById('customer-modal');
    if (modal) modal.style.display = 'none';
}

export async function saveCustomer() {
    const name = document.getElementById('cust-name').value;
    const phone = document.getElementById('cust-phone').value;

    if (!name || !phone) {
        alert("يرجى ملء الحقول الأساسية");
        return;
    }

    try {
        await addDoc(collection(db, "customers"), {
            name: name,
            phone: phone,
            status: "نشط",
            createdAt: new Date()
        });
        closeCustomerModal();
        renderCustomerTable();
    } catch (e) {
        console.error("خطأ في الحفظ:", e);
    }
}

export async function deleteCustomer(id) {
    if (confirm("هل أنت متأكد من حذف هذا العميل؟")) {
        try {
            await deleteDoc(doc(db, "customers", id));
            renderCustomerTable();
        } catch (e) {
            console.error("خطأ في الحذف:", e);
        }
    }
}

// تأكد من وجود هذا القوس النهائي لإغلاق الموديول

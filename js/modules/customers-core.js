/**
 * js/modules/customers-core.js
 * موديول إدارة العملاء - Tera Gateway
 */

import { db } from '../core/firebase.js'; 
import { 
    collection, addDoc, getDocs, doc, updateDoc, deleteDoc, 
    serverTimestamp, query, orderBy 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export async function initCustomers(container) {
    // --- تعريف العناصر ---
    const customersTable = container.querySelector('#customers-list');
    const customerForm = container.querySelector('#customer-form');
    const customerModal = container.querySelector('#customer-modal');
    const btnAddNew = container.querySelector('.btn-primary-tera') || container.querySelector('button[data-action="add"]');
    const btnDelete = container.querySelector('#delete-btn');
    const btnCloseModal = container.querySelectorAll('.close-modal');

    let localCustomers = [];

    // --- 1. جلب البيانات من Firebase ---
    async function loadCustomers() {
        if (!customersTable) return;
        customersTable.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:30px;"><i class="fas fa-spinner fa-spin"></i> جاري تحديث البيانات...</td></tr>';
        
        try {
            const q = query(collection(db, "customers"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            customersTable.innerHTML = '';
            localCustomers = []; 

            querySnapshot.forEach((docSnap) => {
                const data = docSnap.data();
                const id = docSnap.id;
                localCustomers.push({ id, ...data });

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td style="padding: 15px; font-weight:bold;">${data.name}</td>
                    <td style="padding: 15px;">${data.phone}</td>
                    <td style="padding: 15px;">${data.city || 'حائل'}</td>
                    <td style="padding: 15px; text-align: center;">
                        <button class="edit-action-btn" data-id="${id}" style="background:none; border:none; color:#e67e22; cursor:pointer;">
                            <i class="fas fa-edit"></i> تعديل
                        </button>
                    </td>`;
                customersTable.appendChild(tr);
            });

            // ربط أزرار التعديل
            container.querySelectorAll('.edit-action-btn').forEach(btn => {
                btn.addEventListener('click', () => renderEdit(btn.dataset.id));
            });

        } catch (error) {
            console.error("Firebase Error:", error);
            customersTable.innerHTML = '<tr><td colspan="6" style="text-align:center; color:red;">خطأ في الاتصال بقاعدة البيانات</td></tr>';
        }
    }

    // --- 2. منطق النافذة المنبثقة (Modal) ---
    const openModal = (isEdit = false) => {
        if (customerModal) customerModal.style.display = 'flex';
        if (!isEdit && customerForm) {
            customerForm.reset();
            container.querySelector('#edit-customer-id').value = '';
            if (btnDelete) btnDelete.style.display = 'none';
        }
    };

    const closeModal = () => {
        if (customerModal) customerModal.style.display = 'none';
    };

    // --- 3. ربط الأحداث بأمان (Safe Binding) ---
    if (btnAddNew) btnAddNew.addEventListener('click', () => openModal(false));
    
    btnCloseModal.forEach(btn => btn.addEventListener('click', closeModal));

    if (customerForm) {
        customerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = container.querySelector('#edit-customer-id').value;
            const payload = {
                name: container.querySelector('#cust-name').value,
                phone: container.querySelector('#cust-phone').value,
                city: container.querySelector('#cust-city').value,
                updatedAt: serverTimestamp()
            };

            try {
                if (id) {
                    await updateDoc(doc(db, "customers", id), payload);
                } else {
                    payload.createdAt = serverTimestamp();
                    await addDoc(collection(db, "customers"), payload);
                }
                closeModal();
                loadCustomers();
            } catch (err) { alert("فشل الحفظ"); }
        });
    }

    if (btnDelete) {
        btnDelete.addEventListener('click', async () => {
            const id = container.querySelector('#edit-customer-id').value;
            if (id && confirm("هل أنت متأكد من حذف هذا العميل؟")) {
                await deleteDoc(doc(db, "customers", id));
                closeModal();
                loadCustomers();
            }
        });
    }

    // --- 4. تعبئة بيانات التعديل ---
    function renderEdit(id) {
        const data = localCustomers.find(c => c.id === id);
        if (!data) return;
        container.querySelector('#edit-customer-id').value = id;
        container.querySelector('#cust-name').value = data.name || '';
        container.querySelector('#cust-phone').value = data.phone || '';
        container.querySelector('#cust-city').value = data.city || '';
        if (btnDelete) btnDelete.style.display = 'block';
        openModal(true);
    }

    // التشغيل الأولي
    loadCustomers();
}

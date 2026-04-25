import { db } from '../firebase-config.js'; // تأكد من مسار ملف الإعدادات الخاص بك
import { 
    collection, 
    addDoc, 
    getDocs, 
    doc, 
    updateDoc, 
    deleteDoc, 
    serverTimestamp,
    query,
    orderBy 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export async function initCustomers(container) {
    const customersTable = document.getElementById('customers-list');
    const customerForm = document.getElementById('customer-form');
    const customerModal = document.getElementById('customer-modal');
    const statTotal = document.getElementById('stat-total');

    // --- 1. الدوال الأساسية (تصدير للـ Window لتعمل الأزرار) ---

    window.openCustomerModal = () => {
        customerForm.reset();
        document.getElementById('edit-customer-id').value = '';
        document.getElementById('modal-title').innerText = 'إضافة عميل جديد';
        document.getElementById('delete-btn').style.display = 'none';
        customerModal.style.display = 'flex';
    };

    window.closeCustomerModal = () => {
        customerModal.style.display = 'none';
    };

    window.deleteCustomer = async () => {
        const id = document.getElementById('edit-customer-id').value;
        if (!id) return;

        if (confirm('هل أنت متأكد من حذف بيانات هذا العميل نهائياً؟')) {
            try {
                await deleteDoc(doc(db, "customers", id));
                window.closeCustomerModal();
                loadCustomers(); // تحديث الجدول
                alert('تم حذف العميل بنجاح');
            } catch (error) {
                console.error("Error deleting document: ", error);
            }
        }
    };

    // --- 2. جلب البيانات وعرضها ---

    async function loadCustomers() {
        if (!customersTable) return;
        customersTable.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:20px;">جاري جلب البيانات...</td></tr>';
        
        try {
            const q = query(collection(db, "customers"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            customersTable.innerHTML = '';
            
            statTotal.innerText = querySnapshot.size;

            querySnapshot.forEach((docSnap) => {
                const data = docSnap.data();
                const id = docSnap.id;

                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td style="padding: 15px;">
                        <div style="font-weight: 700;">${data.name}</div>
                        <div style="font-size: 0.75rem; color: #94a3b8;">${data.email || 'لا يوجد بريد'}</div>
                    </td>
                    <td style="padding: 15px;">${data.countryCode} ${data.phone}</td>
                    <td style="padding: 15px;">${data.city} - ${data.district}</td>
                    <td style="padding: 15px;">
                        <span class="tag-${data.tag}" style="padding: 5px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: bold;">
                            ${translateTag(data.tag)}
                        </span>
                    </td>
                    <td style="padding: 15px; text-align: center;">
                        <button onclick="editCustomer('${id}')" class="btn-edit" style="background: none; border: none; color: #e67e22; cursor: pointer; font-size: 1.1rem;">
                            <i class="fas fa-edit"></i>
                        </button>
                    </td>
                `;
                customersTable.appendChild(tr);
            });
        } catch (error) {
            console.error("Error loading customers: ", error);
            customersTable.innerHTML = '<tr><td colspan="6" style="text-align:center; color:red;">فشل جلب البيانات</td></tr>';
        }
    }

    // --- 3. تعديل عميل (جلب بياناته للمودال) ---

    window.editCustomer = async (id) => {
        // البحث عن البيانات في الـ Snapshot أو جلبها من Firestore
        // للتبسيط سنجلبها مباشرة من Firestore
        const docRef = doc(db, "customers", id);
        try {
            // منطقياً: يمكنك جلبها من مصفوفة محلية لتكون أسرع
            const querySnapshot = await getDocs(collection(db, "customers"));
            const data = querySnapshot.docs.find(d => d.id === id).data();

            document.getElementById('edit-customer-id').value = id;
            document.getElementById('cust-name').value = data.name;
            document.getElementById('cust-email').value = data.email;
            document.getElementById('cust-countryCode').value = data.countryCode;
            document.getElementById('cust-phone').value = data.phone;
            document.getElementById('cust-tag').value = data.tag;
            document.getElementById('cust-city').value = data.city;
            document.getElementById('cust-district').value = data.district;
            document.getElementById('cust-street').value = data.street;
            document.getElementById('cust-buildingNo').value = data.buildingNo;
            document.getElementById('cust-notes').value = data.notes;

            document.getElementById('modal-title').innerText = 'تعديل بيانات العميل';
            document.getElementById('delete-btn').style.display = 'block';
            customerModal.style.display = 'flex';
        } catch (e) { console.error(e); }
    };

    // --- 4. حفظ البيانات (إضافة أو تحديث) ---

    customerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('edit-customer-id').value;

        const customerData = {
            name: document.getElementById('cust-name').value,
            email: document.getElementById('cust-email').value,
            countryCode: document.getElementById('cust-countryCode').value,
            phone: document.getElementById('cust-phone').value,
            tag: document.getElementById('cust-tag').value,
            city: document.getElementById('cust-city').value,
            district: document.getElementById('cust-district').value,
            street: document.getElementById('cust-street').value,
            buildingNo: document.getElementById('cust-buildingNo').value,
            notes: document.getElementById('cust-notes').value,
            updatedAt: serverTimestamp()
        };

        try {
            if (id) {
                // تحديث
                await updateDoc(doc(db, "customers", id), customerData);
            } else {
                // إضافة جديد
                customerData.createdAt = serverTimestamp();
                await addDoc(collection(db, "customers"), customerData);
            }
            window.closeCustomerModal();
            loadCustomers();
        } catch (error) {
            alert("حدث خطأ أثناء الحفظ");
            console.error(error);
        }
    });

    // دالة مساعدة لترجمة التصنيفات
    function translateTag(tag) {
        const tags = {
            'normal': 'عادي',
            'vip': 'مميز ⭐',
            'fraud': 'محتال ⚠️',
            'unserious': 'غير جدي',
            'uncooperative': 'غير متعاون'
        };
        return tags[tag] || tag;
    }

    // تشغيل الجلب عند التحميل
    loadCustomers();
}

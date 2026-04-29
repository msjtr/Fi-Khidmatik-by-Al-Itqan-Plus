/**
 * Tera Gateway - Customers UI Module
 * Version: 12.12.6
 * Description: التحكم في واجهة المستخدم لقاعدة العملاء والتعامل مع النوافذ المنبثقة
 */

import { db } from '../core/config.js';

class CustomersUI {
    constructor() {
        this.modal = document.getElementById('customerModal');
        this.form = document.getElementById('customerForm');
        this.tableBody = document.getElementById('customersList');
        this.searchTerm = '';
        
        this.init();
    }

    init() {
        // تسجيل الوظائف في النطاق العالمي لسهولة الوصول من HTML
        window.openCustomerModal = () => this.openModal();
        window.closeCustomerModal = () => this.closeModal();
        window.handleCustomerSubmit = (e) => this.handleSubmit(e);
        window.filterCustomers = () => this.handleSearch();
        window.deleteCustomer = (id) => this.confirmDelete(id);

        // تحميل البيانات الأولية
        this.loadCustomers();
    }

    // --- إدارة النافذة المنبثقة (Modal) ---
    
    openModal(customerId = null) {
        if (this.modal) {
            this.modal.style.display = 'flex';
            document.body.style.overflow = 'hidden'; // منع التمرير في الخلفية
            
            if (customerId) {
                this.prepareEditMode(customerId);
            } else {
                this.form.reset();
                document.getElementById('imagePreview').style.backgroundImage = "url('images/default-avatar.png')";
            }
        }
    }

    closeModal() {
        if (this.modal) {
            this.modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            this.form.reset();
        }
    }

    // --- التعامل مع البيانات (CRUD) ---

    async loadCustomers() {
        try {
            // إظهار لودر بسيط داخل الجدول
            this.tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center">جاري تحميل بيانات العملاء...</td></tr>';
            
            const snapshot = await db.collection('customers').orderBy('createdAt', 'desc').get();
            const customers = [];
            snapshot.forEach(doc => customers.push({ id: doc.id, ...doc.data() }));
            
            this.renderTable(customers);
        } catch (error) {
            console.error("Error loading customers:", error);
            this.tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center; color:red;">فشل تحميل البيانات. تأكد من الاتصال.</td></tr>';
        }
    }

    renderTable(customers) {
        if (customers.length === 0) {
            this.tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center">لا يوجد عملاء مسجلين حالياً.</td></tr>';
            return;
        }

        this.tableBody.innerHTML = customers.map(cust => `
            <tr class="animate-row">
                <td>
                    <div class="user-info">
                        <div class="avatar-circle" style="background: ${this.getRandomColor()}">
                            ${cust.name ? cust.name.substring(0, 2) : '??'}
                        </div>
                        <div class="name-details">
                            <strong>${cust.name}</strong>
                            <small>${cust.type === 'vip' ? '💎 عميل VIP' : 'فرد'}</small>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="contact-col">
                        <span><i class="fas fa-phone"></i> ${cust.phone}</span>
                        <small>${cust.email || 'بدون بريد'}</small>
                    </div>
                </td>
                <td>
                    <div class="address-col">
                        <span>${cust.district || 'حائل'}</span>
                        <small>${cust.street || '-'}</small>
                    </div>
                </td>
                <td>${cust.createdAt ? new Date(cust.createdAt.seconds * 1000).toLocaleDateString('ar-SA') : '-'}</td>
                <td><span class="badge-type">${cust.type || 'عادي'}</span></td>
                <td><span class="status-pill active">نشط</span></td>
                <td>
                    <div class="action-btns">
                        <button onclick="openCustomerModal('${cust.id}')" class="edit-btn" title="تعديل">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteCustomer('${cust.id}')" class="delete-btn" title="حذف">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    async handleSubmit(e) {
        e.preventDefault();
        const btn = e.target.querySelector('.btn-save');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الحفظ...';

        const formData = new FormData(this.form);
        const customerData = {
            name: formData.get('name'),
            phone: formData.get('phone'),
            email: formData.get('email'),
            type: formData.get('type'),
            district: formData.get('district'),
            street: formData.get('street'),
            building: formData.get('building'),
            zip: formData.get('zip'),
            updatedAt: new Date()
        };

        try {
            await db.collection('customers').add({
                ...customerData,
                createdAt: new Date()
            });
            
            this.closeModal();
            this.loadCustomers(); // تحديث الجدول
            // يمكنك إضافة تنبيه نجاح هنا (مثل Toast)
        } catch (error) {
            alert("حدث خطأ أثناء الحفظ: " + error.message);
        } finally {
            btn.disabled = false;
            btn.innerText = 'حفظ البيانات';
        }
    }

    // --- وظائف مساعدة ---

    handleSearch() {
        const input = document.getElementById('customerSearch').value.toLowerCase();
        const rows = this.tableBody.getElementsByTagName('tr');

        for (let row of rows) {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(input) ? '' : 'none';
        }
    }

    getRandomColor() {
        const colors = ['#f97316', '#0ea5e9', '#8b5cf6', '#10b981', '#ef4444'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    async confirmDelete(id) {
        if (confirm("هل أنت متأكد من حذف هذا العميل؟ لا يمكن التراجع عن هذا الإجراء.")) {
            try {
                await db.collection('customers').doc(id).delete();
                this.loadCustomers();
            } catch (error) {
                alert("خطأ في الحذف: " + error.message);
            }
        }
    }
}

// تشغيل الموديول
document.addEventListener('DOMContentLoaded', () => {
    window.CustomersModule = new CustomersUI();
});

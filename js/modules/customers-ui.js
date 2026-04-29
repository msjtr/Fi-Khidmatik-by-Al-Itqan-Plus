/**
 * Tera Gateway - Customers UI Module (Enterprise Version)
 * Version: 12.12.8
 * Description: النظام المتكامل لإدارة بيانات العملاء مع دعم العنوان الوطني والمفاتيح الدولية
 * المطور: محمد بن صالح الشمري
 */

import { db } from '../core/config.js';

class CustomersUI {
    constructor() {
        this.modal = document.getElementById('customerModal');
        this.form = document.getElementById('customerForm');
        this.tableBody = document.getElementById('customersList');
        this.defaultAvatar = "https://ui-avatars.com/api/?background=f97316&color=fff&bold=true&name=";
        
        // قاعدة بيانات مفاتيح الدول مع البحث
        this.countries = [
            { name: "المملكة العربية السعودية", dial: "+966", code: "SA" },
            { name: "الإمارات العربية المتحدة", dial: "+971", code: "AE" },
            { name: "الكويت", dial: "+965", code: "KW" },
            { name: "قطر", dial: "+974", code: "QA" },
            { name: "عمان", dial: "+968", code: "OM" },
            { name: "البحرين", dial: "+973", code: "BH" },
            { name: "مصر", dial: "+20", code: "EG" },
            { name: "الأردن", dial: "+962", code: "JO" },
            { name: "العراق", dial: "+964", code: "IQ" }
        ];

        this.init();
    }

    init() {
        // تسجيل الوظائف عالمياً للوصول من HTML
        window.openCustomerModal = (id = null) => this.openModal(id);
        window.closeCustomerModal = () => this.closeModal();
        window.handleCustomerSubmit = (e) => this.handleSubmit(e);
        window.filterCustomers = () => this.handleSearch();
        window.deleteCustomer = (id) => this.confirmDelete(id);
        window.toggleCountryDropdown = () => this.toggleDropdown();
        window.selectCountry = (dial, name) => this.setCountry(dial, name);
        window.searchCountryList = (q) => this.renderCountryOptions(q);

        this.loadCustomers();
        this.renderCountryOptions();
    }

    // --- منطق اختيار الدولة ومفتاح الاتصال ---
    
    toggleDropdown() {
        const drop = document.getElementById('countryDropdown');
        if (drop) drop.classList.toggle('show');
    }

    renderCountryOptions(query = '') {
        const container = document.getElementById('countryOptions');
        if (!container) return;

        const filtered = this.countries.filter(c => 
            c.name.includes(query) || c.dial.includes(query)
        );

        container.innerHTML = filtered.map(c => `
            <div class="country-option" onclick="selectCountry('${c.dial}', '${c.name}')">
                <span>${c.name}</span>
                <span class="dial-code">${c.dial}</span>
            </div>
        `).join('');
    }

    setCountry(dial, name) {
        document.getElementById('dialCodeDisplay').innerText = dial;
        document.getElementById('countryDialInput').value = dial;
        document.getElementById('countryNameInput').value = name;
        this.toggleDropdown();
    }

    // --- إدارة النافذة المنبثقة (Modal) ---
    
    async openModal(customerId = null) {
        if (!this.modal) return;
        this.modal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; 
        
        if (customerId && typeof customerId === 'string') {
            await this.prepareEditMode(customerId);
        } else {
            this.form.reset();
            this.form.dataset.mode = 'add';
            delete this.form.dataset.editId;
            document.getElementById('dialCodeDisplay').innerText = '+966'; // افتراضي
            
            const preview = document.getElementById('imagePreview');
            if (preview) preview.style.backgroundImage = `url('${this.defaultAvatar}New+User')`;
        }
    }

    closeModal() {
        this.modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        this.form.reset();
    }

    // --- التعامل مع البيانات (CRUD) ---

    async loadCustomers() {
        try {
            this.tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:30px;"><i class="fas fa-spinner fa-spin"></i> جاري جلب بيانات عملاء حائل...</td></tr>';
            const snapshot = await db.collection('customers').orderBy('createdAt', 'desc').get();
            const customers = [];
            snapshot.forEach(doc => customers.push({ id: doc.id, ...doc.data() }));
            this.renderTable(customers);
        } catch (error) {
            console.error("Tera Engine Error:", error);
            this.tableBody.innerHTML = `<tr><td colspan="7" style="color:red; text-align:center;">خطأ: ${error.message}</td></tr>`;
        }
    }

    async handleSubmit(e) {
        e.preventDefault();
        const btn = this.form.querySelector('.btn-save');
        const formData = new FormData(this.form);
        
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> جاري الحفظ...';
        }

        // تجميع الـ 16 حقل المطلوبة
        const customerData = {
            name: formData.get('name'),
            phone: formData.get('phone'),
            countryDial: formData.get('countryDial') || '+966',
            email: formData.get('email'),
            countryName: formData.get('countryName'),
            city: formData.get('city'),
            district: formData.get('district'),
            street: formData.get('street'),
            buildingNum: formData.get('buildingNum'),
            extraNum: formData.get('extraNum'),
            zipCode: formData.get('zipCode'),
            poBox: formData.get('poBox'),
            status: formData.get('status'),
            category: formData.get('category'),
            notes: formData.get('notes'),
            updatedAt: new Date()
        };

        try {
            if (this.form.dataset.mode === 'edit') {
                await db.collection('customers').doc(this.form.dataset.editId).update(customerData);
            } else {
                await db.collection('customers').add({
                    ...customerData,
                    createdAt: new Date() // تاريخ الإضافة التلقائي
                });
            }
            this.closeModal();
            await this.loadCustomers(); 
        } catch (error) {
            alert("خطأ في بوابة تيرا: " + error.message);
        } finally {
            if (btn) {
                btn.disabled = false;
                btn.innerText = 'حفظ البيانات';
            }
        }
    }

    renderTable(customers) {
        if (customers.length === 0) {
            this.tableBody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:20px;">لا يوجد عملاء مسجلين.</td></tr>';
            return;
        }

        this.tableBody.innerHTML = customers.map(cust => {
            const avatarUrl = `${this.defaultAvatar}${encodeURIComponent(cust.name || 'User')}`;
            return `
            <tr class="animate-row">
                <td>
                    <div class="user-info">
                        <div class="avatar-circle" style="background-image: url('${avatarUrl}')"></div>
                        <div class="name-details">
                            <strong>${cust.name}</strong>
                            <small>${cust.category || 'عادي'}</small>
                        </div>
                    </div>
                </td>
                <td><span dir="ltr">${cust.countryDial} ${cust.phone}</span></td>
                <td>${cust.city} - ${cust.district}</td>
                <td>${cust.createdAt ? new Date(cust.createdAt.seconds * 1000).toLocaleDateString('ar-SA') : '-'}</td>
                <td><span class="status-pill ${cust.status === 'نشط' ? 'active' : 'inactive'}">${cust.status || 'نشط'}</span></td>
                <td>
                    <div class="action-btns">
                        <button onclick="openCustomerModal('${cust.id}')" class="edit-btn"><i class="fas fa-edit"></i></button>
                        <button onclick="deleteCustomer('${cust.id}')" class="delete-btn"><i class="fas fa-trash-alt"></i></button>
                    </div>
                </td>
            </tr>`;
        }).join('');
    }

    async prepareEditMode(id) {
        const doc = await db.collection('customers').doc(id).get();
        if (doc.exists) {
            const data = doc.data();
            this.form.dataset.mode = 'edit';
            this.form.dataset.editId = id;
            
            // تعبئة كافة الحقول
            Object.keys(data).forEach(key => {
                const input = this.form.querySelector(`[name="${key}"]`);
                if (input) input.value = data[key];
            });

            document.getElementById('dialCodeDisplay').innerText = data.countryDial || '+966';
            const preview = document.getElementById('imagePreview');
            if (preview) preview.style.backgroundImage = `url('${this.defaultAvatar}${encodeURIComponent(data.name)}')`;
        }
    }

    handleSearch() {
        const query = document.getElementById('customerSearch').value.toLowerCase();
        const rows = this.tableBody.getElementsByTagName('tr');
        Array.from(rows).forEach(row => {
            row.style.display = row.textContent.toLowerCase().includes(query) ? '' : 'none';
        });
    }

    async confirmDelete(id) {
        if (confirm("أبا صالح، هل أنت متأكد من حذف هذا العميل وسجلاته نهائياً؟")) {
            await db.collection('customers').doc(id).delete();
            await this.loadCustomers();
        }
    }
}

// تشغيل المحرك
document.addEventListener('DOMContentLoaded', () => {
    window.CustomersModule = new CustomersUI();
});

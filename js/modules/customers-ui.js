/**
 * js/modules/customers-ui.js - Tera Gateway
 * النسخة المصلحة لتفعيل الأزرار والعمليات
 */

import * as Core from './customers-core.js';

export async function initCustomersUI(container) {
    if (!container) return;

    // 1. رسم الهيكل (بدون سكريبتات داخلية)
    renderStructure(container);
    
    // 2. ربط الأحداث (Event Listeners) بالأزرار
    attachGlobalFunctions();
    
    // 3. تفعيل مراقب إرسال النموذج (Form Submission)
    setupFormHandler();

    // 4. جلب البيانات وعرضها
    await loadAndRender();
}

function renderStructure(container) {
    container.innerHTML = `
        <div class="cust-ui-wrapper" style="font-family: 'Tajawal', sans-serif;">
            <div class="action-bar" style="display:flex; justify-content:space-between; margin-bottom:20px;">
                <h3 style="margin:0;">👥 إدارة العملاء</h3>
                <button class="btn-tera" onclick="window.showAddCustomerModal()" style="background:#2563eb; color:white; border:none; padding:10px 20px; border-radius:8px; cursor:pointer; font-weight:bold;">
                    <i class="fas fa-plus"></i> إضافة عميل جديد
                </button>
            </div>
            
            <div class="table-responsive" style="background:white; border-radius:12px; border:1px solid #e2e8f0; overflow:hidden;">
                <table class="tera-table" style="width:100%; border-collapse:collapse; text-align:right;">
                    <thead>
                        <tr style="background:#f8fafc; border-bottom:2px solid #e2e8f0;">
                            <th style="padding:15px;">العميل</th>
                            <th style="padding:15px;">الاتصال</th>
                            <th style="padding:15px;">العنوان</th>
                            <th style="padding:15px; text-align:center;">الحالة</th>
                            <th style="padding:15px; text-align:center;">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody id="customers-list-render">
                        <tr><td colspan="5" style="text-align:center; padding:30px;">جاري تحميل البيانات...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function attachGlobalFunctions() {
    // جعل الدوال متاحة للأزرار في HTML
    window.showAddCustomerModal = () => {
        const modal = document.getElementById('customer-modal');
        if (modal) {
            document.getElementById('customer-form').reset();
            modal.style.display = 'flex';
        } else {
            alert("خطأ: لم يتم العثور على Modal في الصفحة");
        }
    };

    window.closeCustomerModal = () => {
        const modal = document.getElementById('customer-modal');
        if (modal) modal.style.display = 'none';
    };

    window.handleDelete = async (id) => {
        if (confirm('هل أنت متأكد من حذف هذا العميل من تيرا؟')) {
            const success = await Core.removeCustomer(id);
            if (success) await loadAndRender();
        }
    };
}

function setupFormHandler() {
    const form = document.getElementById('customer-form');
    if (!form) return;

    form.onsubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        try {
            await Core.addCustomer(data);
            window.closeCustomerModal();
            await loadAndRender(); // تحديث الجدول فوراً
        } catch (error) {
            alert("فشل حفظ العميل: " + error.message);
        }
    };
}

async function loadAndRender() {
    const list = document.getElementById('customers-list-render');
    if (!list) return;

    try {
        const snapshot = await Core.fetchAllCustomers();
        list.innerHTML = '';
        
        if (snapshot.empty) {
            list.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:30px;">لا يوجد بيانات.</td></tr>';
            return;
        }

        snapshot.forEach(docSnap => {
            const d = docSnap.data();
            const id = docSnap.id;
            const name = d.name || "غير مسجل";

            list.innerHTML += `
                <tr style="border-bottom:1px solid #f1f5f9;">
                    <td style="padding:15px;"><b>${name}</b></td>
                    <td style="padding:15px;" dir="ltr">${d.phone || '-'}</td>
                    <td style="padding:15px; font-size:0.8rem;">${d.district || '-'} - ${d.street || '-'}</td>
                    <td style="padding:15px; text-align:center;">${d.tag || 'عادي'}</td>
                    <td style="padding:15px; text-align:center;">
                        <button onclick="window.handleDelete('${id}')" style="color:red; background:none; border:none; cursor:pointer;"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>`;
        });
    } catch (error) {
        list.innerHTML = `<tr><td colspan="5" style="color:red; text-align:center;">خطأ: ${error.message}</td></tr>`;
    }
}

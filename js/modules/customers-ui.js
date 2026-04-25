/**
 * Tera Gateway - Customers UI Module
 * إدارة واجهة المستخدم لصفحة العملاء والربط مع Firestore
 */

import * as Core from './customers-core.js';

/**
 * التشغيل الرئيسي للموديول
 */
export async function initCustomersUI(container) {
    if (!container) return;

    // حقن الهيكل الأساسي للجدول والإحصائيات
    container.innerHTML = `
        <div class="cust-ui-wrapper">
            <div class="stats-grid">
                <div class="stat-item"><span>إجمالي العملاء</span><strong id="stat-total">0</strong></div>
                <div class="stat-item success"><span>مكتمل البيانات</span><strong id="stat-complete">0</strong></div>
                <div class="stat-item warning"><span>غير مكتمل</span><strong id="stat-incomplete">0</strong></div>
                <div class="stat-item danger"><span>لديهم ملاحظات</span><strong id="stat-notes">0</strong></div>
            </div>

            <div class="action-bar">
                <div class="search-box">
                    <i class="fas fa-search"></i>
                    <input type="text" id="cust-filter" placeholder="بحث باسم العميل، المدينة، أو الجوال...">
                </div>
                <button class="btn-tera" onclick="showAddCustomerModal()">
                    <i class="fas fa-user-plus"></i> إضافة عميل جديد
                </button>
            </div>

            <div class="table-responsive">
                <table class="tera-table">
                    <thead>
                        <tr>
                            <th>العميل</th>
                            <th>الاتصال</th>
                            <th>العنوان الوطني</th>
                            <th>الحالة</th>
                            <th>الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody id="customers-list-render">
                        <tr><td colspan="5" style="text-align:center; padding:30px;">جاري استدعاء البيانات من منصة تيرا...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    // جلب البيانات وعرضها
    await loadAndRender();

    // تفعيل خاصية البحث اللحظي
    const filterInput = document.getElementById('cust-filter');
    if (filterInput) {
        filterInput.addEventListener('input', (e) => filterData(e.target.value));
    }
}

/**
 * جلب البيانات من الموديول الأساسي ورسمها في الجدول
 */
async function loadAndRender() {
    const list = document.getElementById('customers-list-render');
    if (!list) return;

    try {
        const snapshot = await Core.fetchAllCustomers();
        list.innerHTML = '';
        
        let stats = { total: 0, complete: 0, incomplete: 0, notes: 0 };

        if (snapshot.empty) {
            list.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:30px;">لا يوجد عملاء مسجلين حالياً.</td></tr>';
            updateStatsDisplay(stats);
            return;
        }

        snapshot.forEach(docSnap => {
            const d = docSnap.data();
            const id = docSnap.id;
            
            // تحديث الإحصائيات
            stats.total++;
            if (d.notes && d.notes.trim() !== '') stats.notes++;
            
            // التحقق من اكتمال عناصر العنوان الوطني الأساسية
            const isComplete = d.buildingNo && d.postalCode && d.city;
            if (isComplete) stats.complete++; else stats.incomplete++;

            // رسم الصف
            list.innerHTML += `
                <tr class="cust-row">
                    <td>
                        <div class="avatar-cell">
                            <div class="avatar-icon">${d.name ? d.name.charAt(0) : '?'}</div>
                            <div>
                                <b>${d.name || 'غير مسجل'}</b><br>
                                <small style="color: #64748b;">${d.Email || 'لا يوجد بريد'}</small>
                            </div>
                        </div>
                    </td>
                    <td dir="ltr" style="text-align:center; font-weight: 500;">${d.Phone || '-'}</td>
                    <td>
                        <div class="addr-details">
                            <b>${d.city || 'غير محدد'}</b> - ${d.district || '-'}<br>
                            <small>مبنى: ${d.buildingNo || '-'} | شارع: ${d.street || '-'}</small>
                        </div>
                    </td>
                    <td style="text-align:center;">
                        <span class="status-tag ${getStatusClass(d.status)}">${d.status || 'عادي'}</span>
                    </td>
                    <td>
                        <div class="row-actions">
                            <button onclick="handlePrint('${id}')" title="طباعة البطاقة"><i class="fas fa-print"></i></button>
                            <button onclick="handleEdit('${id}')" title="تعديل"><i class="fas fa-pen"></i></button>
                            <button onclick="handleDelete('${id}')" class="text-danger" title="حذف"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                </tr>`;
        });
        
        updateStatsDisplay(stats);

    } catch (error) {
        console.error("خطأ في رندر الجدول:", error);
        list.innerHTML = '<tr><td colspan="5" style="text-align:center; color:red; padding:20px;">فشل تحميل البيانات. تأكد من اتصال الإنترنت وقواعد Firestore.</td></tr>';
    }
}

/**
 * دوال مساعدة للتنسيق والبحث
 */
function getStatusClass(s) {
    const map = { 'محتال': 'danger', 'مميز': 'success', 'غير جدي': 'warning', 'غير متعاون': 'warning' };
    return map[s] || 'default';
}

function updateStatsDisplay(s) {
    if (document.getElementById('stat-total')) document.getElementById('stat-total').innerText = s.total;
    if (document.getElementById('stat-complete')) document.getElementById('stat-complete').innerText = s.complete;
    if (document.getElementById('stat-incomplete')) document.getElementById('stat-incomplete').innerText = s.incomplete;
    if (document.getElementById('stat-notes')) document.getElementById('stat-notes').innerText = s.notes;
}

function filterData(val) {
    const rows = document.querySelectorAll('.cust-row');
    const term = val.toLowerCase();
    rows.forEach(r => {
        r.style.display = r.innerText.toLowerCase().includes(term) ? '' : 'none';
    });
}

// --- ربط العمليات بـ Window لضمان عملها مع HTML (onclick/onsubmit) ---

window.showAddCustomerModal = () => {
    const modal = document.getElementById('customer-modal');
    if (modal) {
        document.getElementById('customer-form').reset();
        modal.style.display = 'flex';
    }
};

window.closeCustomerModal = () => {
    const modal = document.getElementById('customer-modal');
    if (modal) modal.style.display = 'none';
};

/**
 * معالج حفظ العميل الجديد
 */
window.handleCustomerSubmit = async (event) => {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // تنسيق رقم الهاتف
    data.Phone = `${data.countryCode} ${data.Phone}`;

    try {
        const btn = form.querySelector('.btn-save');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الحفظ...';

        await Core.addCustomer(data);
        
        window.closeCustomerModal();
        await loadAndRender(); // تحديث الجدول فوراً بعد الحفظ
        
    } catch (error) {
        alert("حدث خطأ أثناء الحفظ: " + error.message);
    } finally {
        const btn = form.querySelector('.btn-save');
        btn.disabled = false;
        btn.innerText = 'حفظ بيانات العميل';
    }
};

window.handleDelete = async (id) => {
    if (confirm('⚠️ هل أنت متأكد من حذف هذا العميل نهائياً من النظام؟')) {
        const success = await Core.removeCustomer(id);
        if (success) await loadAndRender();
    }
};

window.handlePrint = (id) => {
    window.open(`print-card.html?id=${id}`, '_blank');
};

window.handleEdit = (id) => {
    console.log("طلب تعديل العميل:", id);
    alert("ميزة التعديل قيد التجهيز للمعرف: " + id);
};

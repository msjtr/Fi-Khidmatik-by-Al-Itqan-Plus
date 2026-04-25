import * as Core from './customers-core.js';

export async function initCustomersUI(container) {
    if (!container) return;

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
                <button class="btn-tera" onclick="showAddCustomerModal()">+ إضافة عميل جديد</button>
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
                        <tr><td colspan="5" style="text-align:center; padding:20px;">جاري تحميل البيانات...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;
    
    // تشغيل الجلب والعرض
    await loadAndRender();

    // ربط الفلتر
    const filterInput = document.getElementById('cust-filter');
    if (filterInput) {
        filterInput.addEventListener('input', (e) => filterData(e.target.value));
    }
}

async function loadAndRender() {
    const list = document.getElementById('customers-list-render');
    if (!list) return;

    try {
        const snapshot = await Core.fetchAllCustomers();
        list.innerHTML = '';
        
        let stats = { total: 0, complete: 0, incomplete: 0, notes: 0 };

        if (snapshot.empty) {
            list.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:20px;">لا يوجد عملاء حالياً</td></tr>';
        }

        snapshot.forEach(docSnap => {
            const d = docSnap.data();
            const id = docSnap.id;
            
            // حساب الإحصائيات
            stats.total++;
            if (d.notes && d.notes.trim() !== '') stats.notes++;
            // التحقق من اكتمال العنوان الوطني (8 عناصر)
            const isComplete = d.buildingNo && d.postalCode && d.city && d.district;
            if (isComplete) stats.complete++; else stats.incomplete++;

            list.innerHTML += `
                <tr class="cust-row">
                    <td>
                        <div class="avatar-cell">
                            <div class="avatar-icon">${d.name ? d.name.charAt(0) : 'U'}</div>
                            <div><b>${d.name || 'بدون اسم'}</b><br><small>${d.Email || ''}</small></div>
                        </div>
                    </td>
                    <td dir="ltr" style="text-align:center;">${d.Phone || '-'}</td>
                    <td>
                        <div class="addr-details">
                            <b>${d.city || '-'}</b> - ${d.district || '-'}<br>
                            <small>مبنى: ${d.buildingNo || '-'} | إضافي: ${d.additionalNo || '-'}</small>
                        </div>
                    </td>
                    <td style="text-align:center;">
                        <span class="status-tag ${getStatusClass(d.status)}">${d.status || 'عادي'}</span>
                    </td>
                    <td>
                        <div class="row-actions">
                            <button onclick="handlePrint('${id}')" title="طباعة"><i class="fas fa-print"></i></button>
                            <button onclick="handleEdit('${id}')" title="تعديل"><i class="fas fa-pen"></i></button>
                            <button onclick="handleDelete('${id}')" class="text-danger" title="حذف"><i class="fas fa-trash"></i></button>
                        </div>
                    </td>
                </tr>`;
        });
        
        updateStatsDisplay(stats);

    } catch (error) {
        console.error("Error rendering table:", error);
        list.innerHTML = '<tr><td colspan="5" style="text-align:center; color:red;">حدث خطأ أثناء جلب البيانات</td></tr>';
    }
}

// دالة تصنيف الألوان للحالة
function getStatusClass(s) {
    const map = {
        'محتال': 'danger', 
        'مميز': 'success', 
        'غير جدي': 'warning', 
        'غير متعاون': 'warning',
        'عادي': 'default'
    };
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

// تصدير الدوال للنافذة العالمية (Global Window) لتعمل مع الـ HTML
window.handlePrint = (id) => window.open(`print-card.html?id=${id}`, '_blank');

window.handleDelete = async (id) => {
    if (confirm('هل أنت متأكد من حذف هذا العميل؟ لا يمكن التراجع عن هذه الخطوة.')) {
        const success = await Core.removeCustomer(id);
        if (success) {
            await loadAndRender(); // إعادة تحميل الجدول
        } else {
            alert('حدث خطأ أثناء الحذف');
        }
    }
};

window.handleEdit = async (id) => {
    console.log("تعديل العميل:", id);
    // هنا يتم استدعاء فتح المودال وتعبئة البيانات (سنضيفها لاحقاً)
};

window.showAddCustomerModal = () => {
    const modal = document.getElementById('customer-modal');
    if (modal) modal.style.display = 'flex';
};

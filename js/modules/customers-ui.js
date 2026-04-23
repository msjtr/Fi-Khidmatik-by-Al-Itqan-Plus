import { db } from '../core/firebase.js';
import { collection, getDocs, query, orderBy, deleteDoc, doc, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

console.log('✅ customers-core.js تم تحميل النسخة الاحترافية المحدثة');

export async function initCustomers(container) {
    if (!container) return;
    
    // 1. رسم الهيكل العام (العنوان + أزرار التحكم + الفلتر)
    container.innerHTML = `
        <div style="padding: 20px; font-family: 'Tajawal', sans-serif; direction: rtl;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px; flex-wrap: wrap; gap: 15px;">
                <h2 style="color: #2c3e50; margin: 0; display: flex; align-items: center; gap: 10px;">
                    <i class="fas fa-users-cog" style="color: #e67e22;"></i> إدارة سجل العملاء
                </h2>
                <div style="display: flex; gap: 10px;">
                    <button id="btn-add-customer" style="background: #27ae60; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: bold;">
                        <i class="fas fa-user-plus"></i> إضافة عميل جديد
                    </button>
                    <div id="stats-badge"></div>
                </div>
            </div>

            <div style="background: white; padding: 15px; border-radius: 12px; margin-bottom: 20px; display: flex; gap: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                <div style="flex: 1; position: relative;">
                    <i class="fas fa-search" style="position: absolute; right: 15px; top: 12px; color: #95a5a6;"></i>
                    <input type="text" id="customer-search" placeholder="ابحث باسم العميل أو رقم الجوال..." 
                           style="width: 100%; padding: 10px 40px 10px 15px; border-radius: 8px; border: 1px solid #ddd; outline: none;">
                </div>
                <select id="city-filter" style="padding: 10px; border-radius: 8px; border: 1px solid #ddd; outline: none; background: #f8fafc;">
                    <option value="">جميع المدن</option>
                    <option value="حائل">حائل</option>
                </select>
            </div>

            <div id="customers-table-container">
                <div style="text-align: center; padding: 40px;">
                    <i class="fas fa-sync fa-spin fa-2x" style="color: #e67e22;"></i>
                    <p>جاري مزامنة البيانات...</p>
                </div>
            </div>
        </div>
    `;

    // ربط الأحداث (Events)
    document.getElementById('btn-add-customer').addEventListener('click', showAddCustomerModal);
    document.getElementById('customer-search').addEventListener('input', filterCustomers);
    document.getElementById('city-filter').addEventListener('change', filterCustomers);

    loadCustomersData();
}

// دالة جلب البيانات من Firebase
async function loadCustomersData() {
    const containerDiv = document.getElementById('customers-table-container');
    try {
        const q = query(collection(db, "customers"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
            containerDiv.innerHTML = `<div style="text-align:center; padding:50px; color:#95a5a6;"><i class="fas fa-folder-open fa-3x"></i><p>لا يوجد عملاء في السجل</p></div>`;
            return;
        }

        renderTable(snapshot);
        updateStats(snapshot.size);
        
    } catch (error) {
        console.error('❌ Error:', error);
        containerDiv.innerHTML = `<div style="color:red; text-align:center; padding:20px;">خطأ في تحميل البيانات</div>`;
    }
}

// دالة رسم الجدول القائم على القائمة
function renderTable(snapshot) {
    const containerDiv = document.getElementById('customers-table-container');
    let html = `
        <div style="overflow-x: auto; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <table id="main-customers-table" style="width: 100%; border-collapse: collapse; min-width: 1100px;">
                <thead style="background: #f8fafc; color: #64748b; border-bottom: 2px solid #edf2f7;">
                    <tr>
                        <th style="padding: 15px; text-align: right;">العميل</th>
                        <th style="padding: 15px; text-align: center;">الجوال</th>
                        <th style="padding: 15px; text-align: center;">العنوان</th>
                        <th style="padding: 15px; text-align: center;">الرمز البريدي/الإضافي</th>
                        <th style="padding: 15px; text-align: center;">العمليات</th>
                    </tr>
                </thead>
                <tbody>
    `;

    snapshot.forEach((doc) => {
        const data = doc.data();
        html += `
            <tr class="customer-row" data-city="${data.city}" style="border-bottom: 1px solid #edf2f7; transition: 0.2s;">
                <td style="padding: 15px;">
                    <div style="font-weight: bold; color: #2d3748;">${escapeHtml(data.name)}</div>
                    <div style="font-size: 0.75rem; color: #a0aec0;">ID: ${doc.id.slice(-5)}</div>
                </td>
                <td style="padding: 15px; text-align: center; direction: ltr;">${escapeHtml(data.phone)}</td>
                <td style="padding: 15px; text-align: center;">
                    <span style="font-size: 0.9rem;">${escapeHtml(data.city)} - ${escapeHtml(data.district)}</span><br>
                    <small style="color: #718096;">${escapeHtml(data.street)}</small>
                </td>
                <td style="padding: 15px; text-align: center;">
                    <div style="display: flex; flex-direction: column; gap: 4px; align-items: center;">
                        <span style="background: #f1f5f9; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem;">📦 ${escapeHtml(data.postalCode) || '-'}</span>
                        <span style="background: #fff7ed; color: #c2410c; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem;">➕ ${escapeHtml(data.additionalNo) || '-'}</span>
                    </div>
                </td>
                <td style="padding: 15px; text-align: center;">
                    <div style="display: flex; gap: 8px; justify-content: center;">
                        <button onclick="window.location.hash='#orders?customer=${doc.id}'" title="طلب جديد" style="background:#e67e22; color:white; border:none; padding:6px 10px; border-radius:6px; cursor:pointer;"><i class="fas fa-plus"></i></button>
                        <button onclick="editCustomer('${doc.id}')" title="تعديل" style="background:#3498db; color:white; border:none; padding:6px 10px; border-radius:6px; cursor:pointer;"><i class="fas fa-edit"></i></button>
                        <button onclick="printCustomerRecord('${doc.id}')" title="طباعة" style="background:#95a5a6; color:white; border:none; padding:6px 10px; border-radius:6px; cursor:pointer;"><i class="fas fa-print"></i></button>
                        <button onclick="deleteCustomerRecord('${doc.id}')" title="حذف" style="background:#e74c3c; color:white; border:none; padding:6px 10px; border-radius:6px; cursor:pointer;"><i class="fas fa-trash-alt"></i></button>
                    </div>
                </td>
            </tr>
        `;
    });

    html += `</tbody></table></div>`;
    containerDiv.innerHTML = html;
}

// --- الدوال الفرعية للعمليات ---

function filterCustomers() {
    const searchTerm = document.getElementById('customer-search').value.toLowerCase();
    const cityTerm = document.getElementById('city-filter').value;
    const rows = document.querySelectorAll('.customer-row');

    rows.forEach(row => {
        const text = row.innerText.toLowerCase();
        const city = row.getAttribute('data-city');
        const matchesSearch = text.includes(searchTerm);
        const matchesCity = cityTerm === "" || city === cityTerm;

        row.style.display = (matchesSearch && matchesCity) ? "" : "none";
    });
}

window.deleteCustomerRecord = async (id) => {
    if (confirm('هل أنت متأكد من حذف هذا العميل نهائياً؟')) {
        try {
            await deleteDoc(doc(db, "customers", id));
            alert('تم حذف العميل بنجاح');
            loadCustomersData();
        } catch (e) { alert('خطأ في الحذف'); }
    }
}

window.printCustomerRecord = (id) => {
    alert('جاري تجهيز نسخة للطباعة للعميل: ' + id);
    // يمكن هنا فتح نافذة جديدة تحتوي على تصميم الطباعة
};

function updateStats(count) {
    const badge = document.getElementById('stats-badge');
    if (badge) {
        badge.innerHTML = `<span style="background: #e1f5fe; color: #01579b; padding: 8px 16px; border-radius: 20px; font-weight: bold;">إجمالي المسجلين: ${count}</span>`;
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>]/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]));
}

// دالة إظهار نافذة إضافة عميل (Modal)
function showAddCustomerModal() {
    alert("سيتم فتح نموذج الإضافة الشامل (يمكنك ربطه بـ Form مخصص)");
    // هنا يمكنك إضافة كود لفتح Modal يحتوي على مدخلات (Name, Phone, City, etc.)
}

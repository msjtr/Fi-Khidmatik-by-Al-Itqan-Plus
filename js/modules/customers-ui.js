import { db } from '../core/firebase.js';
import { 
    collection, query, onSnapshot, orderBy, 
    doc, addDoc, deleteDoc, updateDoc, getDoc, 
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

console.log('✅ customers-core.js: تم تفعيل نظام تيرا المطور');

// قائمة الدول المعتمدة
const countries = [
    { name: "المملكة العربية السعودية", code: "966", flag: "🇸🇦" },
    { name: "الإمارات", code: "971", flag: "🇦🇪" },
    { name: "الكويت", code: "965", flag: "🇰🇼" },
    { name: "مصر", code: "20", flag: "🇪🇬" }
];

export async function initCustomers(container) {
    if (!container) return;
    
    container.innerHTML = `
        <div style="padding: 20px; font-family: 'Tajawal', sans-serif; direction: rtl;">
            <div id="stats-container" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; margin-bottom: 25px;">
                <div class="stat-card" style="background:#fff; padding:15px; border-radius:12px; box-shadow:0 2px 8px rgba(0,0,0,0.05); border-right:4px solid #e67e22;">
                    <small style="color:#7f8c8d;">إجمالي العملاء</small>
                    <div id="stat-total" style="font-size:22px; font-weight:bold; color:#2c3e50;">0</div>
                </div>
                <div class="stat-card" style="background:#fff; padding:15px; border-radius:12px; box-shadow:0 2px 8px rgba(0,0,0,0.05); border-right:4px solid #27ae60;">
                    <small style="color:#7f8c8d;">مكتمل البيانات</small>
                    <div id="stat-complete" style="font-size:22px; font-weight:bold; color:#27ae60;">0</div>
                </div>
                <div class="stat-card" style="background:#fff; padding:15px; border-radius:12px; box-shadow:0 2px 8px rgba(0,0,0,0.05); border-right:4px solid #e74c3c;">
                    <small style="color:#7f8c8d;">عملاء محتالون</small>
                    <div id="stat-fraud" style="font-size:22px; font-weight:bold; color:#e74c3c;">0</div>
                </div>
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 15px;">
                <h2 style="color: #2c3e50; margin: 0;"><i class="fas fa-users"></i> قاعدة بيانات العملاء</h2>
                <button id="btn-add-customer" style="background: #27ae60; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: bold; transition:0.3s;">
                    <i class="fas fa-user-plus"></i> إضافة عميل جديد
                </button>
            </div>

            <div style="background: white; padding: 15px; border-radius: 12px; margin-bottom: 20px; display: flex; gap: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                <div style="flex: 2; position: relative;">
                    <i class="fas fa-search" style="position: absolute; right: 15px; top: 12px; color: #95a5a6;"></i>
                    <input type="text" id="customer-search" placeholder="بحث بالاسم، الجوال، المدينة..." 
                           style="width: 100%; padding: 10px 40px 10px 15px; border-radius: 8px; border: 1px solid #ddd; outline: none;">
                </div>
                <select id="class-filter" style="flex: 1; padding: 10px; border-radius: 8px; border: 1px solid #ddd; background: #f8fafc;">
                    <option value="">جميع التصنيفات</option>
                    <option value="مميز">عميل مميز</option>
                    <option value="محتال">عميل محتال</option>
                    <option value="غير جدي">غير جدي</option>
                    <option value="غير متعاون">غير متعاون</option>
                </select>
            </div>

            <div id="customers-table-container">
                <div style="text-align: center; padding: 40px;">
                    <i class="fas fa-sync fa-spin fa-2x" style="color: #e67e22;"></i>
                    <p>جاري تحميل البيانات الحية...</p>
                </div>
            </div>
        </div>
    `;

    document.getElementById('btn-add-customer').onclick = () => showCustomerModal();
    document.getElementById('customer-search').oninput = filterCustomers;
    document.getElementById('class-filter').onchange = filterCustomers;

    listenToCustomers();
}

// استماع حي للبيانات (Real-time)
function listenToCustomers() {
    const q = query(collection(db, "customers"), orderBy("createdAt", "desc"));
    onSnapshot(q, (snapshot) => {
        const customers = [];
        snapshot.forEach(doc => customers.push({ id: doc.id, ...doc.data() }));
        renderTable(customers);
        updateStats(customers);
    });
}

function updateStats(customers) {
    document.getElementById('stat-total').innerText = customers.length;
    document.getElementById('stat-complete').innerText = customers.filter(c => c.postalCode && c.buildingNo).length;
    document.getElementById('stat-fraud').innerText = customers.filter(c => c.classification === 'محتال').length;
}

function renderTable(customers) {
    const container = document.getElementById('customers-table-container');
    if (customers.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding:50px; color:#95a5a6;"><p>لا يوجد عملاء حالياً</p></div>`;
        return;
    }

    let html = `
        <div style="overflow-x: auto; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
            <table style="width: 100%; border-collapse: collapse; min-width: 1000px;">
                <thead style="background: #f8fafc; color: #64748b; border-bottom: 2px solid #edf2f7;">
                    <tr>
                        <th style="padding: 15px; text-align: right;">العميل</th>
                        <th style="padding: 15px; text-align: center;">الاتصال</th>
                        <th style="padding: 15px; text-align: center;">العنوان الوطني</th>
                        <th style="padding: 15px; text-align: center;">التصنيف</th>
                        <th style="padding: 15px; text-align: center;">العمليات</th>
                    </tr>
                </thead>
                <tbody>
    `;

    customers.forEach(c => {
        const classStyle = c.classification === 'محتال' ? 'background:#fee2e2; color:#b91c1c;' : 
                          c.classification === 'مميز' ? 'background:#dcfce7; color:#15803d;' : 'background:#f1f5f9; color:#475569;';
        
        html += `
            <tr class="customer-row" data-search="${(c.name||'')}${(c.phone||'')}${(c.city||'')}" data-class="${c.classification || ''}" style="border-bottom: 1px solid #edf2f7;">
                <td style="padding: 15px;">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <div style="width:40px; height:40px; background:#e67e22; color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:bold;">
                            ${(c.name || 'C').charAt(0)}
                        </div>
                        <div>
                            <div style="font-weight:bold; color:#2d3748;">${c.name || 'بدون اسم'}</div>
                            <small style="color:#a0aec0;">ID: ${c.id.slice(-5)}</small>
                        </div>
                    </div>
                </td>
                <td style="padding: 15px; text-align: center; direction: ltr;">
                    <div>+${c.phone || ''}</div>
                    <small style="color:#718096;">${c.email || ''}</small>
                </td>
                <td style="padding: 15px; text-align: center;">
                    <div style="font-size:0.85rem;">${c.city || 'حائل'} - ${c.district || ''}</div>
                    <div style="font-size:0.75rem; color:#94a3b8;">مبنى: ${c.buildingNo || '-'} | رمز: ${c.postalCode || '-'}</div>
                </td>
                <td style="padding: 15px; text-align: center;">
                    <span style="padding:4px 10px; border-radius:20px; font-size:0.75rem; font-weight:bold; ${classStyle}">
                        ${c.classification || 'غير مصنف'}
                    </span>
                </td>
                <td style="padding: 15px; text-align: center;">
                    <div style="display: flex; gap: 5px; justify-content: center;">
                        <button onclick="showCustomerModal('${c.id}')" title="تعديل" style="background:#3498db; color:white; border:none; padding:8px; border-radius:6px; cursor:pointer;"><i class="fas fa-edit"></i></button>
                        <button onclick="deleteCustomerRecord('${c.id}')" title="حذف" style="background:#e74c3c; color:white; border:none; padding:8px; border-radius:6px; cursor:pointer;"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `;
    });

    html += `</tbody></table></div>`;
    container.innerHTML = html;
}

function filterCustomers() {
    const search = document.getElementById('customer-search').value.toLowerCase();
    const cat = document.getElementById('class-filter').value;
    document.querySelectorAll('.customer-row').forEach(row => {
        const matchesSearch = row.dataset.search.toLowerCase().includes(search);
        const matchesClass = !cat || row.dataset.class === cat;
        row.style.display = (matchesSearch && matchesClass) ? "" : "none";
    });
}

// نافذة الإضافة والتعديل الشاملة
window.showCustomerModal = async (id = null) => {
    let data = { name:'', phone:'', city:'حائل', district:'', street:'', buildingNo:'', additionalNo:'', poBox:'', postalCode:'', email:'', classification:'', notes:'' };
    if(id) {
        const docSnap = await getDoc(doc(db, "customers", id));
        if(docSnap.exists()) data = docSnap.data();
    }

    const modal = document.createElement('div');
    modal.id = "tera-modal";
    modal.style = "position:fixed; inset:0; background:rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center; z-index:1000; padding:20px; font-family:'Tajawal';";
    modal.innerHTML = `
        <div style="background:white; width:100%; max-width:700px; border-radius:15px; overflow:hidden; animation: slideUp 0.3s ease-out;">
            <div style="background:#2c3e50; color:white; padding:15px 20px; display:flex; justify-content:space-between; align-items:center;">
                <h3 style="margin:0;">${id ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'}</h3>
                <button onclick="document.getElementById('tera-modal').remove()" style="background:none; border:none; color:white; font-size:24px; cursor:pointer;">&times;</button>
            </div>
            <form id="customer-form" style="padding:20px; display:grid; grid-template-columns:1fr 1fr; gap:15px;">
                <div class="field"><label>اسم العميل</label><input type="text" name="name" value="${data.name}" required style="width:100%; padding:8px; border:1px solid #ddd; border-radius:6px;"></div>
                <div class="field"><label>رقم الجوال</label><input type="tel" name="phone" value="${data.phone}" placeholder="9665..." required style="width:100%; padding:8px; border:1px solid #ddd; border-radius:6px; direction:ltr;"></div>
                <div class="field"><label>المدينة</label><input type="text" name="city" value="${data.city}" style="width:100%; padding:8px; border:1px solid #ddd; border-radius:6px;"></div>
                <div class="field"><label>الحي</label><input type="text" name="district" value="${data.district}" style="width:100%; padding:8px; border:1px solid #ddd; border-radius:6px;"></div>
                <div class="field"><label>رقم المبنى</label><input type="text" name="buildingNo" value="${data.buildingNo}" style="width:100%; padding:8px; border:1px solid #ddd; border-radius:6px;"></div>
                <div class="field"><label>الرمز البريدي</label><input type="text" name="postalCode" value="${data.postalCode}" style="width:100%; padding:8px; border:1px solid #ddd; border-radius:6px;"></div>
                <div class="field"><label>التصنيف</label>
                    <select name="classification" style="width:100%; padding:8px; border:1px solid #ddd; border-radius:6px;">
                        <option value="">اختر..</option>
                        <option value="مميز" ${data.classification==='مميز'?'selected':''}>مميز</option>
                        <option value="محتال" ${data.classification==='محتال'?'selected':''}>محتال</option>
                        <option value="غير جدي" ${data.classification==='غير جدي'?'selected':''}>غير جدي</option>
                    </select>
                </div>
                <div class="field" style="grid-column: span 2;">
                    <label>ملاحظات (محرر نصي)</label>
                    <textarea name="notes" style="width:100%; height:80px; padding:8px; border:1px solid #ddd; border-radius:6px;">${data.notes}</textarea>
                </div>
                <div style="grid-column: span 2; text-align:left; margin-top:10px;">
                    <button type="submit" style="background:#27ae60; color:white; border:none; padding:10px 30px; border-radius:6px; cursor:pointer;">حفظ البيانات</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('customer-form').onsubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const updateData = Object.fromEntries(formData.entries());
        updateData.updatedAt = serverTimestamp();

        try {
            if(id) await updateDoc(doc(db, "customers", id), updateData);
            else { updateData.createdAt = serverTimestamp(); await addDoc(collection(db, "customers"), updateData); }
            modal.remove();
        } catch (err) { alert('خطأ في الحفظ'); }
    };
}

window.deleteCustomerRecord = async (id) => {
    if(confirm('سيتم حذف العميل وكافة سجلاته، هل أنت متأكد؟')) {
        await deleteDoc(doc(db, "customers", id));
    }
}

/**
 * نظام إدارة العملاء المتكامل لـ Tera Gateway
 * النسخة النهائية الشاملة لكافة حقول العنوان الوطني والإحصائيات والطباعة
 */

import { db } from '../core/config.js';
import { 
    collection, query, onSnapshot, doc, setDoc, 
    deleteDoc, updateDoc, getDoc, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const worldCountries = [
    { name: "المملكة العربية السعودية", code: "966", flag: "🇸🇦" },
    { name: "الإمارات", code: "971", flag: "🇦🇪" },
    { name: "الكويت", code: "965", flag: "🇰🇼" },
    { name: "البحرين", code: "973", flag: "🇧🇭" },
    { name: "عمان", code: "968", flag: "🇴🇲" },
    { name: "قطر", code: "974", flag: "🇶🇦" },
    { name: "مصر", code: "20", flag: "🇪🇬" }
];

export async function initCustomers(container) {
    if (!container) return;

    container.innerHTML = `
        <div id="statsGrid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; margin-bottom: 25px;"></div>
        
        <div class="customers-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; gap: 15px; flex-wrap: wrap; direction: rtl;">
            <div style="display: flex; gap: 10px; flex: 1;">
                <input type="text" id="searchCust" placeholder="بحث ذكي (اسم، جوال، حي، شارع...)" 
                       style="flex: 2; padding: 12px; border: 1px solid #ddd; border-radius: 10px;">
                <select id="classFilter" style="flex: 1; padding: 10px; border-radius: 10px; border: 1px solid #ddd;">
                    <option value="">كل التصنيفات</option>
                    <option value="مميز">عميل مميز</option>
                    <option value="محتال">عميل محتال</option>
                    <option value="غير جدي">غير جدي</option>
                    <option value="غير متعاون">غير متعاون</option>
                </select>
            </div>
            <button id="openAddModal" style="background: #1a73e8; color: white; border: none; padding: 12px 25px; border-radius: 10px; cursor: pointer; font-weight: bold;">
                <i class="fas fa-plus"></i> إضافة عميل جديد
            </button>
        </div>

        <div id="tableContainer" style="background: white; border-radius: 15px; box-shadow: 0 5px 15px rgba(0,0,0,0.05); overflow: hidden; direction: rtl;">
            <div style="padding: 50px; text-align: center;">جاري مزامنة بيانات العملاء...</div>
        </div>
    `;

    document.getElementById('openAddModal').onclick = () => openCustomerModal();

    const q = query(collection(db, "customers"));
    onSnapshot(q, (snapshot) => {
        const customers = [];
        snapshot.forEach(doc => customers.push({ id: doc.id, ...doc.data() }));
        renderStats(customers);
        setupLiveSearch(customers);
    });
}

function renderStats(data) {
    const now = new Date();
    const s = {
        total: data.length,
        new: data.filter(c => (now - (c.createdAt?.toDate?.() || now)) < 604800000).length,
        complete: data.filter(c => c.buildingNo && c.street && c.district && c.postalCode).length,
        incomplete: data.filter(c => !c.buildingNo || !c.postalCode).length,
        hasNotes: data.filter(c => c.notes && c.notes.length > 0).length
    };

    document.getElementById('statsGrid').innerHTML = `
        <div style="background:#fff; padding:15px; border-radius:12px; border-bottom:4px solid #1a73e8;">إجمالي العملاء: <b>${s.total}</b></div>
        <div style="background:#fff; padding:15px; border-radius:12px; border-bottom:4px solid #34a853;">جدد (أسبوع): <b>${s.new}</b></div>
        <div style="background:#fff; padding:15px; border-radius:12px; border-bottom:4px solid #27ae60;">مكتمل البيانات: <b>${s.complete}</b></div>
        <div style="background:#fff; padding:15px; border-radius:12px; border-bottom:4px solid #ea4335;">نقص بيانات: <b>${s.incomplete}</b></div>
        <div style="background:#fff; padding:15px; border-radius:12px; border-bottom:4px solid #fbbc05;">بملاحظات: <b>${s.hasNotes}</b></div>
    `;
}

function setupLiveSearch(customers) {
    const search = document.getElementById('searchCust');
    const filter = document.getElementById('classFilter');
    const run = () => {
        const t = search.value.toLowerCase();
        const f = filter.value;
        const res = customers.filter(c => {
            const match = (c.name||'').toLowerCase().includes(t) || (c.phone||'').includes(t) || (c.district||'').toLowerCase().includes(t) || (c.street||'').toLowerCase().includes(t);
            return match && (f === "" || c.classification === f);
        });
        renderTable(res);
    };
    search.oninput = run;
    filter.onchange = run;
    run();
}

function renderTable(data) {
    document.getElementById('tableContainer').innerHTML = `
        <table style="width:100%; border-collapse:collapse;">
            <thead style="background:#f8f9fa;">
                <tr style="text-align:right; border-bottom:2px solid #eee;">
                    <th style="padding:15px;">العميل</th>
                    <th style="padding:15px;">الجوال</th>
                    <th style="padding:15px;">العنوان الوطني</th>
                    <th style="padding:15px;">التصنيف</th>
                    <th style="padding:15px;">الإجراءات</th>
                </tr>
            </thead>
            <tbody>
                ${data.map(c => `
                    <tr style="border-bottom:1px solid #eee;">
                        <td style="padding:15px;">
                            <div style="display:flex; align-items:center; gap:10px;">
                                <img src="${c.avatar || 'https://ui-avatars.com/api/?name='+c.name+'&background=random'}" 
                                     style="width:40px; height:40px; border-radius:50%; object-fit:cover;">
                                <div><b>${c.name}</b><br><small style="color:#888;">${c.email || ''}</small></div>
                            </div>
                        </td>
                        <td style="padding:15px; direction:ltr; text-align:right;">+${c.phone}</td>
                        <td style="padding:15px;">
                            <small>${c.city}, ${c.district}<br>${c.street}, مبنى ${c.buildingNo}</small>
                        </td>
                        <td style="padding:15px;"><span class="badge-${c.classification}">${c.classification || 'عادي'}</span></td>
                        <td style="padding:15px;">
                            <button onclick="openCustomerModal('${c.id}')" title="تعديل"><i class="fas fa-edit"></i></button>
                            <button onclick="window.printCustomer('${c.id}')" title="طباعة"><i class="fas fa-print"></i></button>
                            <button onclick="deleteCustomer('${c.id}')" style="color:red" title="حذف"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

window.openCustomerModal = async (id = null) => {
    let c = { name:'', email:'', country:'المملكة العربية السعودية', city:'', district:'', street:'', buildingNo:'', additionalNo:'', poBox:'', postalCode:'', phone:'', classification:'', notes:'' };
    if(id) {
        const s = await getDoc(doc(db, "customers", id));
        c = { id: s.id, ...s.data() };
    }

    const m = document.createElement('div');
    m.id = "custModal";
    m.style = "position:fixed; inset:0; background:rgba(0,0,0,0.7); z-index:10000; display:flex; align-items:center; justify-content:center; direction:rtl; font-family:sans-serif;";
    m.innerHTML = `
        <div style="background:white; width:90%; max-width:800px; max-height:90vh; overflow-y:auto; border-radius:15px; padding:25px;">
            <h3 style="margin-top:0;">${id ? 'تعديل بيانات عميل' : 'إضافة عميل جديد'}</h3>
            <form id="custForm" style="display:grid; grid-template-columns:1fr 1fr; gap:15px;">
                <div style="grid-column: span 2;"><label>اسم العميل</label><input id="m_name" value="${c.name}" required style="width:100%; padding:10px;"></div>
                <div><label>البريد الإلكتروني</label><input id="m_email" type="email" value="${c.email}" style="width:100%; padding:10px;"></div>
                <div>
                    <label>الدولة</label>
                    <select id="m_country" onchange="document.getElementById('m_code').innerText = '+'+this.selectedOptions[0].dataset.code" style="width:100%; padding:10px;">
                        ${worldCountries.map(x => `<option value="${x.name}" data-code="${x.code}" ${c.country===x.name?'selected':''}>${x.flag} ${x.name}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label>رقم الجوال</label>
                    <div style="display:flex; direction:ltr;">
                        <span id="m_code" style="padding:10px; background:#eee; border:1px solid #ddd;">+${worldCountries.find(x=>x.name===c.country)?.code || '966'}</span>
                        <input id="m_phone" value="${c.phone.replace(/^(966|971|965|973|968|974|20)/, '')}" required style="flex:1; padding:10px;">
                    </div>
                </div>
                <div style="grid-column: span 2; background:#f9f9f9; padding:10px; border-radius:8px;">
                    <p style="margin:0 0 10px 0; font-weight:bold; color:#1a73e8;">العنوان الوطني</p>
                    <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:10px;">
                        <input id="m_city" placeholder="المدينة" value="${c.city}" style="padding:8px;">
                        <input id="m_district" placeholder="الحي" value="${c.district}" style="padding:8px;">
                        <input id="m_street" placeholder="الشارع" value="${c.street}" style="padding:8px;">
                        <input id="m_build" placeholder="رقم المبنى" value="${c.buildingNo}" style="padding:8px;">
                        <input id="m_add" placeholder="الرقم الإضافي" value="${c.additionalNo}" style="padding:8px;">
                        <input id="m_zip" placeholder="الرمز البريدي" value="${c.postalCode}" style="padding:8px;">
                        <input id="m_pobox" placeholder="صندوق البريد" value="${c.poBox}" style="padding:8px; grid-column: span 3;">
                    </div>
                </div>
                <div style="grid-column: span 2;">
                    <label>تصنيف العميل (اختياري)</label>
                    <select id="m_class" style="width:100%; padding:10px;">
                        <option value="">بدون تصنيف</option>
                        <option value="مميز" ${c.classification==='مميز'?'selected':''}>عميل مميز</option>
                        <option value="محتال" ${c.classification==='محتال'?'selected':''}>عميل محتال</option>
                        <option value="غير جدي" ${c.classification==='غير جدي'?'selected':''}>عميل غير جدي</option>
                        <option value="غير متعاون" ${c.classification==='غير متعاون'?'selected':''}>عميل غير متعاون</option>
                    </select>
                </div>
                <div style="grid-column: span 2;">
                    <label>ملاحظات (مربع نص كامل المزايا)</label>
                    <textarea id="m_notes" style="width:100%; height:80px; padding:10px;">${c.notes}</textarea>
                </div>
                <div style="grid-column: span 2; display:flex; gap:10px; margin-top:10px;">
                    <button type="submit" style="flex:1; background:#27ae60; color:white; padding:12px; border:none; border-radius:8px; cursor:pointer;">حفظ البيانات</button>
                    <button type="button" onclick="document.getElementById('custModal').remove()" style="flex:1; background:#888; color:white; padding:12px; border:none; border-radius:8px;">إلغاء</button>
                </div>
            </form>
        </div>
    `;
    document.body.appendChild(m);

    document.getElementById('custForm').onsubmit = async (e) => {
        e.preventDefault();
        const code = document.getElementById('m_country').selectedOptions[0].dataset.code;
        const data = {
            name: document.getElementById('m_name').value,
            email: document.getElementById('m_email').value,
            country: document.getElementById('m_country').value,
            phone: code + document.getElementById('m_phone').value.replace(/^0/, ''),
            city: document.getElementById('m_city').value,
            district: document.getElementById('m_district').value,
            street: document.getElementById('m_street').value,
            buildingNo: document.getElementById('m_build').value,
            additionalNo: document.getElementById('m_add').value,
            postalCode: document.getElementById('m_zip').value,
            poBox: document.getElementById('m_pobox').value,
            classification: document.getElementById('m_class').value,
            notes: document.getElementById('m_notes').value,
            updatedAt: serverTimestamp()
        };
        if(id) await updateDoc(doc(db, "customers", id), data);
        else { data.createdAt = serverTimestamp(); await setDoc(doc(collection(db, "customers")), data); }
        m.remove();
    };
};

// وظيفة طباعة بيانات العميل
window.printCustomer = async (id) => {
    const s = await getDoc(doc(db, "customers", id));
    const c = s.data();
    const win = window.open('', '_blank');
    win.document.write(`
        <div style="direction:rtl; font-family:Arial; padding:40px; border:2px solid #eee;">
            <h2 style="text-align:center; border-bottom:2px solid #333; padding-bottom:10px;">بطاقة بيانات عميل - Tera Gateway</h2>
            <p><b>الاسم:</b> ${c.name}</p>
            <p><b>الجوال:</b> +${c.phone}</p>
            <p><b>البريد:</b> ${c.email || 'غير متوفر'}</p>
            <hr>
            <h3>العنوان الوطني:</h3>
            <p>${c.city} - ${c.district} - ${c.street}</p>
            <p>رقم المبنى: ${c.buildingNo} | الرمز البريدي: ${c.postalCode}</p>
            <p>الرقم الإضافي: ${c.additionalNo} | صندوق البريد: ${c.poBox}</p>
            <hr>
            <p><b>التصنيف:</b> ${c.classification || 'عادي'}</p>
            <p><b>ملاحظات:</b> ${c.notes || 'لا يوجد'}</p>
            <div style="margin-top:50px; text-align:center; color:#888;">طُبع بواسطة نظام Tera Gateway</div>
        </div>
    `);
    win.print();
};

window.deleteCustomer = async (id) => {
    if(confirm("حذف العميل نهائياً؟")) await deleteDoc(doc(db, "customers", id));
};

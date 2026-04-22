/**
 * js/modules/customers.js
 */
import { db } from '../core/config.js'; // تأكد من اسم الملف هنا
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// دالة التنبيهات السريعة
function showNotify(msg, type = 'success') {
    const toast = document.createElement('div');
    toast.style.cssText = `position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:${type==='success'?'#27ae60':'#e74c3c'};color:white;padding:12px 25px;border-radius:10px;z-index:9999;`;
    toast.innerText = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

export async function initCustomers(container) {
    container.innerHTML = `
        <div style="padding:25px; font-family:'Tajawal', sans-serif;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                <h2><i class="fas fa-users" style="color:#e67e22;"></i> إدارة العملاء</h2>
                <button id="add-cust-btn" style="background:#e67e22; color:white; border:none; padding:10px 20px; border-radius:8px; cursor:pointer; font-weight:bold;">
                    <i class="fas fa-plus"></i> إضافة عميل
                </button>
            </div>
            
            <div style="background:white; border-radius:15px; box-shadow:0 4px 12px rgba(0,0,0,0.05); overflow:hidden;">
                <table style="width:100%; border-collapse:collapse; text-align:right;">
                    <thead style="background:#f8f9fa;">
                        <tr>
                            <th style="padding:15px;">الاسم</th>
                            <th style="padding:15px;">الجوال</th>
                            <th style="padding:15px;">المدينة</th>
                            <th style="padding:15px;">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody id="cust-table-body">
                        <tr><td colspan="4" style="text-align:center; padding:20px;">جاري تحميل العملاء...</td></tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div id="cust-modal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:1000; justify-content:center; align-items:center; backdrop-filter:blur(4px);">
            <div style="background:white; width:90%; max-width:500px; padding:25px; border-radius:20px;">
                <h3 id="m-title">إضافة عميل جديد</h3>
                <form id="cust-form">
                    <input type="hidden" id="c-id">
                    <input type="text" id="c-name" placeholder="الاسم الكامل" required style="width:100%; padding:12px; margin-bottom:10px; border-radius:8px; border:1px solid #ddd;">
                    <input type="tel" id="c-phone" placeholder="رقم الجوال" required style="width:100%; padding:12px; margin-bottom:10px; border-radius:8px; border:1px solid #ddd;">
                    <input type="text" id="c-city" placeholder="المدينة" style="width:100%; padding:12px; margin-bottom:15px; border-radius:8px; border:1px solid #ddd;">
                    <button type="submit" style="width:100%; padding:12px; background:#1a202c; color:white; border:none; border-radius:8px; cursor:pointer;">حفظ البيانات</button>
                    <button type="button" onclick="document.getElementById('cust-modal').style.display='none'" style="width:100%; margin-top:10px; background:none; border:none; color:#666; cursor:pointer;">إلغاء</button>
                </form>
            </div>
        </div>
    `;

    // ربط الأحداث
    document.getElementById('add-cust-btn').onclick = () => {
        document.getElementById('cust-form').reset();
        document.getElementById('c-id').value = '';
        document.getElementById('m-title').innerText = "إضافة عميل جديد";
        document.getElementById('cust-modal').style.display = 'flex';
    };

    document.getElementById('cust-form').onsubmit = async (e) => {
        e.preventDefault();
        const id = document.getElementById('c-id').value;
        const data = {
            name: document.getElementById('c-name').value,
            phone: document.getElementById('c-phone').value,
            city: document.getElementById('c-city').value,
            updatedAt: serverTimestamp()
        };

        try {
            if(id) {
                await updateDoc(doc(db, "customers", id), data);
            } else {
                data.createdAt = serverTimestamp();
                await addDoc(collection(db, "customers"), data);
            }
            document.getElementById('cust-modal').style.display = 'none';
            showNotify("تم حفظ بيانات العميل");
            renderCustTable();
        } catch(err) { console.error(err); }
    };

    renderCustTable();
}

async function renderCustTable() {
    const tbody = document.getElementById('cust-table-body');
    if(!tbody) return;

    const q = query(collection(db, "customers"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    tbody.innerHTML = "";

    if (snap.empty) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:20px;">لا يوجد عملاء مسجلين</td></tr>';
        return;
    }

    snap.forEach(d => {
        const c = d.data();
        tbody.innerHTML += `
            <tr style="border-bottom:1px solid #eee;">
                <td style="padding:15px;">${c.name}</td>
                <td style="padding:15px; direction:ltr;">${c.phone}</td>
                <td style="padding:15px;">${c.city || '-'}</td>
                <td style="padding:15px;">
                    <button onclick="window.editCust('${d.id}')" style="color:#3498db; background:none; border:none; cursor:pointer; margin-left:10px;"><i class="fas fa-edit"></i></button>
                    <button onclick="window.deleteCust('${d.id}')" style="color:#e74c3c; background:none; border:none; cursor:pointer;"><i class="fas fa-trash"></i></button>
                </td>
            </tr>
        `;
    });
}

// وظائف عالمية للوصول إليها من الجدول
window.deleteCust = async (id) => {
    if(confirm("هل تريد حذف هذا العميل؟")) {
        await deleteDoc(doc(db, "customers", id));
        showNotify("تم حذف العميل", "error");
        renderCustTable();
    }
};

window.editCust = async (id) => {
    // منطق جلب بيانات العميل وتعبئة المودال للتعديل
    // يمكن اختصاره هنا لسرعة العمل
};

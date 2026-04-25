import * as Core from './customers-core.js';

export async function initCustomersUI(container) {
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
                    <input type="text" id="cust-filter" placeholder="بحث باسم العميل أو المدينة أو الجوال...">
                </div>
                <button class="btn-tera" onclick="showAddCustomerModal()">+ إضافة عميل جديد</button>
            </div>

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
                <tbody id="customers-list-render"></tbody>
            </table>
        </div>
    `;
    
    loadAndRender();
    document.getElementById('cust-filter').addEventListener('input', (e) => filterData(e.target.value));
}

async function loadAndRender() {
    const list = document.getElementById('customers-list-render');
    const snapshot = await Core.fetchAllCustomers();
    list.innerHTML = '';
    
    let stats = { total: 0, complete: 0, incomplete: 0, notes: 0 };

    snapshot.forEach(docSnap => {
        const d = docSnap.data();
        const id = docSnap.id;
        stats.total++;
        if(d.notes) stats.notes++;
        if(d.buildingNo && d.postalCode) stats.complete++; else stats.incomplete++;

        list.innerHTML += `
            <tr class="cust-row">
                <td>
                    <div class="avatar-cell">
                        <div class="avatar-icon">${d.name.charAt(0)}</div>
                        <div><b>${d.name}</b><br><small>${d.Email || ''}</small></div>
                    </div>
                </td>
                <td dir="ltr" style="text-align:center;">${d.Phone}</td>
                <td>
                    <div class="addr-details">
                        <b>${d.city}</b> - ${d.district}<br>
                        <small>مبنى: ${d.buildingNo} | إضافي: ${d.additionalNo}</small>
                    </div>
                </td>
                <td><span class="status-tag ${getStatusClass(d.status)}">${d.status || 'عادي'}</span></td>
                <td>
                    <div class="row-actions">
                        <button onclick="handlePrint('${id}')"><i class="fas fa-print"></i></button>
                        <button onclick="handleEdit('${id}')"><i class="fas fa-pen"></i></button>
                        <button onclick="handleDelete('${id}')" class="text-danger"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            </tr>`;
    });
    updateStatsDisplay(stats);
}

function getStatusClass(s) {
    const map = {'محتال':'danger', 'مميز':'success', 'غير جدي':'warning', 'غير متعاون':'warning'};
    return map[s] || 'default';
}

function updateStatsDisplay(s) {
    document.getElementById('stat-total').innerText = s.total;
    document.getElementById('stat-complete').innerText = s.complete;
    document.getElementById('stat-incomplete').innerText = s.incomplete;
    document.getElementById('stat-notes').innerText = s.notes;
}

function filterData(val) {
    const rows = document.querySelectorAll('.cust-row');
    rows.forEach(r => r.style.display = r.innerText.toLowerCase().includes(val.toLowerCase()) ? '' : 'none');
}

window.handlePrint = (id) => window.open(`print-card.html?id=${id}`, '_blank');

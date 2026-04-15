import { db } from '../core/firebase.js';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { showModal } from '../utils/helpers.js';

export async function initCustomers(container) {
    container.innerHTML = await fetch('admin/modules/customers.html').then(r => r.text());
    await renderCustomersTable();
    document.getElementById('new-customer-btn').onclick = () => showCustomerModal();
}

async function renderCustomersTable() {
    const snapshot = await getDocs(collection(db, "customers"));
    const customers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const html = `
        <table class="data-table">
            <thead><tr><th>الاسم</th><th>الهاتف</th><th>العنوان</th><th>إجراءات</th></tr></thead>
            <tbody>
                ${customers.map(c => `
                    <tr>
                        <td>${c.name}</td><td>${c.phone || ''}</td><td>${c.address || ''}</td>
                        <td><button onclick="editCustomer('${c.id}', '${c.name}', '${c.phone}', '${c.address}')"><i class="fas fa-edit"></i></button>
                        <button onclick="deleteCustomer('${c.id}')"><i class="fas fa-trash"></i></button></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    document.getElementById('customers-table-container').innerHTML = html;
}

window.editCustomer = (id, name, phone, address) => {
    showCustomerModal(id, name, phone, address);
};

window.deleteCustomer = async (id) => {
    if(confirm('هل أنت متأكد؟')) await deleteDoc(doc(db, "customers", id));
    renderCustomersTable();
};

async function showCustomerModal(id = null, name = '', phone = '', address = '') {
    showModal('بيانات العميل', `
        <input id="cust-name" value="${name}" placeholder="الاسم" class="form-control"><br>
        <input id="cust-phone" value="${phone}" placeholder="الهاتف" class="form-control"><br>
        <input id="cust-address" value="${address}" placeholder="العنوان" class="form-control"><br>
        <button class="btn-success" id="save-customer-btn">حفظ</button>
    `);
    document.getElementById('save-customer-btn').onclick = async () => {
        const data = { name: document.getElementById('cust-name').value, phone: document.getElementById('cust-phone').value, address: document.getElementById('cust-address').value };
        if(id) await updateDoc(doc(db, "customers", id), data);
        else await addDoc(collection(db, "customers"), data);
        renderCustomersTable();
        document.getElementById('genericModal').style.display = 'none';
    };
}

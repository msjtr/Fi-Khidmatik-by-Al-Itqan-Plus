import * as logic from './orders-logic.js';

let cartItems = [];
let allCustomers = [];
let allProducts = [];

document.addEventListener('DOMContentLoaded', async () => {
    initApp();
    loadSelectionData();
});

async function loadSelectionData() {
    allCustomers = await logic.fetchCustomers();
    allProducts = await logic.fetchProducts();
    // هنا يمكن إضافة كود لتعبئة قائمة Datalist في HTML للبحث السريع
}

async function initApp() {
    document.getElementById('orderNo').value = logic.generateOrderID();
    // ضبط الوقت الحالي
    const now = new Date();
    document.getElementById('orderDate').value = now.toISOString().split('T')[0];
    window.currentOrderTime = now.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
    
    const history = await logic.fetchFullData();
    renderOrdersTable(history);
}

window.addToCart = () => {
    const name = document.getElementById('pName').value;
    const price = parseFloat(document.getElementById('pPrice').value || 0);
    const qty = parseInt(document.getElementById('pQty').value || 1);
    
    if(!name || price <= 0) return alert("أكمل بيانات المنتج");

    cartItems.push({
        name, price, qty,
        sku: logic.generateSKU(),
        total: price * qty
    });
    
    renderCart();
    calculateTotals();
};

function calculateTotals() {
    const subtotal = cartItems.reduce((acc, i) => acc + i.total, 0);
    const discount = parseFloat(document.getElementById('discountInput')?.value || 0);
    const tax = (subtotal - discount) * 0.15;
    const total = (subtotal - discount) + tax;

    document.getElementById('subtotalLabel').innerText = subtotal.toFixed(2);
    document.getElementById('taxLabel').innerText = tax.toFixed(2);
    document.getElementById('totalLabel').innerText = total.toFixed(2);
}

window.submitOrder = async (e) => {
    const btn = e.target;
    btn.disabled = true;

    const orderData = {
        orderNumber: document.getElementById('orderNo').value,
        orderDate: document.getElementById('orderDate').value,
        orderTime: window.currentOrderTime,
        // لقطة بيانات العميل (Snapshot)
        customerSnapshot: {
            name: document.getElementById('cName').value,
            phone: document.getElementById('cPhone').value,
            email: document.getElementById('cEmail')?.value || "---",
            address: {
                city: document.getElementById('cCity')?.value || "",
                district: document.getElementById('cDistrict')?.value || "",
                street: document.getElementById('cStreet').value,
                building: document.getElementById('cBuild')?.value || "",
                postal: document.getElementById('cPost')?.value || ""
            }
        },
        items: cartItems,
        payment: {
            method: document.getElementById('payMethod').value,
            approvalNo: document.getElementById('approvalNo')?.value || "---"
        },
        shipping: {
            type: document.getElementById('shipType')?.value || "بدون شحن"
        },
        totals: {
            subtotal: document.getElementById('subtotalLabel').innerText,
            tax: document.getElementById('taxLabel').innerText,
            total: document.getElementById('totalLabel').innerText
        }
    };

    const docRef = await logic.saveData("orders", orderData);
    // فتح الطباعة في تبويب جديد
    window.open(`../../print.html?id=${docRef.id}`, '_blank');
    location.reload(); // لإعادة تعيين النموذج
};

function renderOrdersTable(data) {
    const tbody = document.getElementById('ordersTableBody');
    tbody.innerHTML = data.map(o => `
        <tr class="border-b">
            <td class="p-4 font-bold">${o.orderNumber}</td>
            <td class="p-4">${o.customerSnapshot?.name || '---'}</td>
            <td class="p-4">${o.orderDate} ${o.orderTime || ''}</td>
            <td class="p-4 font-black">${o.totals?.total} ر.س</td>
            <td class="p-4">
                <button onclick="window.open('../../print.html?id=${o.id}', '_blank')" class="text-blue-600"><i class="fas fa-print"></i></button>
            </td>
        </tr>
    `).join('');
}

import { initOrdersDashboard } from './modules/orders.js';
import { initCustomers } from './modules/customers.js';
import { initProducts } from './modules/products.js';
import { initSettings } from './modules/settings.js';
import { initOrderForm } from './modules/order-form.js'; // we'll define quickly

// Load components
async function loadComponent(id, path) {
    const resp = await fetch(path);
    document.getElementById(id).innerHTML = await resp.text();
}

async function init() {
    await loadComponent('header-container', 'admin/components/header.html');
    await loadComponent('sidebar-container', 'admin/components/sidebar.html');
    // Load modal template
    await fetch('admin/components/modals.html').then(r=>r.text()).then(html=>document.getElementById('modal-container').innerHTML = html);
    
    // Set current datetime
    setInterval(() => {
        const now = new Date().toLocaleString('ar-EG');
        if(document.getElementById('current-datetime')) document.getElementById('current-datetime').innerText = now;
    }, 1000);
    
    // Default module: orders dashboard
    await switchModule('orders-dashboard');
    
    // Sidebar navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', async (e) => {
            document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            const module = item.dataset.module;
            await switchModule(module);
        });
    });
}

async function switchModule(moduleName) {
    const main = document.getElementById('main-content');
    switch(moduleName) {
        case 'orders-dashboard': await initOrdersDashboard(main); break;
        case 'order-form': await initOrderForm(main); break;
        case 'customers': await initCustomers(main); break;
        case 'products': await initProducts(main); break;
        case 'settings': await initSettings(main); break;
        default: main.innerHTML = '<h2>قيد التطوير</h2>';
    }
}

// order-form module
window.initOrderForm = async (container) => {
    container.innerHTML = await fetch('admin/modules/order-form.html').then(r=>r.text());
    // load customers and products into selects
    const { getDocs, collection } = await import("https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js");
    const { db } = await import('./core/firebase.js');
    const customersSnap = await getDocs(collection(db, "customers"));
    const productsSnap = await getDocs(collection(db, "products"));
    const customerSelect = document.getElementById('customer-select');
    customerSelect.innerHTML = '<option value="">اختر عميل</option>' + customersSnap.docs.map(d=>`<option value="${d.id}">${d.data().name}</option>`).join('');
    const productSelect = document.getElementById('product-select');
    productSelect.innerHTML = productsSnap.docs.map(d=>`<option value="${d.id}" data-price="${d.data().price}">${d.data().name} - ${d.data().price}</option>`).join('');
    document.getElementById('add-product-btn').onclick = () => addProductToTable();
    document.getElementById('save-order-btn').onclick = () => saveOrder();
    
    let items = [];
    function addProductToTable() {
        const prodId = productSelect.value;
        const qty = parseInt(document.getElementById('product-qty').value);
        const selectedOption = productSelect.options[productSelect.selectedIndex];
        const price = parseFloat(selectedOption.dataset.price);
        const name = selectedOption.text.split('-')[0];
        items.push({ productId: prodId, name, quantity: qty, price });
        renderItemsTable();
    }
    function renderItemsTable() {
        const tbody = document.querySelector('#order-items-table tbody');
        tbody.innerHTML = items.map((item,idx)=>`<tr><td>${item.name}</td><td>${item.quantity}</td><td>${item.price}</td><td>${item.quantity*item.price}</td><td><button onclick="removeItem(${idx})">حذف</button></td></tr>`).join('');
        const subtotal = items.reduce((s,i)=>s+(i.price*i.quantity),0);
        const taxRate = 15;
        const tax = subtotal * taxRate/100;
        document.getElementById('subtotal').innerText = subtotal;
        document.getElementById('tax-amount').innerText = tax;
        document.getElementById('total').innerText = subtotal+tax;
    }
    window.removeItem = (idx)=>{ items.splice(idx,1); renderItemsTable(); };
    async function saveOrder() {
        const customerId = customerSelect.value;
        const customerName = customerSelect.options[customerSelect.selectedIndex]?.text || '';
        if(!customerId || items.length===0) return alert('أكمل البيانات');
        const total = parseFloat(document.getElementById('total').innerText);
        await addDoc(collection(db, "orders"), {
            orderNumber: 'ORD-'+Date.now(),
            customerId, customerName,
            items: items,
            total: total,
            status: 'pending',
            createdAt: new Date(),
            paidAmount: 0
        });
        alert('تم حفظ الطلب');
        items = [];
        renderItemsTable();
        customerSelect.value = '';
    }
};

init();

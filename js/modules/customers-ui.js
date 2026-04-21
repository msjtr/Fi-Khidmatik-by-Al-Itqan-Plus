cat > fi-khidmatik/js/modules/customers-ui.js << 'EOF'
import { db } from '../core/firebase.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

console.log('customers-ui.js تم تحميله');

export async function initCustomers(container) {
    console.log('initCustomers بدأت');
    if (!container) return;
    container.innerHTML = '<div style="padding:20px"><h2>العملاء</h2><div id="customersList">جاري التحميل...</div></div>';
    try {
        const snapshot = await getDocs(collection(db, "customers"));
        const div = document.getElementById('customersList');
        if (snapshot.empty) {
            div.innerHTML = '<p>لا يوجد عملاء</p>';
            return;
        }
        let html = '<ul>';
        snapshot.forEach((doc) => {
            const data = doc.data();
            html += '<li><strong>' + (data.name || 'بدون اسم') + '</strong> - ' + (data.phone || '') + '</li>';
        });
        html += '</ul>';
        div.innerHTML = html;
    } catch (error) {
        console.error(error);
        div.innerHTML = '<p style="color:red">خطأ: ' + error.message + '</p>';
    }
}

export default { initCustomers };
EOF

import { db } from '../core/firebase.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

console.log('customers-ui.js تم تحميله');

export async function initCustomers(container) {
    console.log('initCustomers بدأت');
    if (!container) return;
    
    container.innerHTML = '<h2>العملاء</h2><div id="custData">جاري التحميل...</div>';
    
    try {
        const snapshot = await getDocs(collection(db, "customers"));
        const div = document.getElementById('custData');
        div.innerHTML = '<p>عدد العملاء: ' + snapshot.size + '</p>';
    } catch(e) {
        console.error(e);
    }
}

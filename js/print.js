import { db, doc, getDoc } from './core/firebase.js';

async function loadInvoiceData(orderId) {
    const docRef = doc(db, "orders", orderId);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
        const data = snap.data();
        renderInvoice(data);
    }
}

function renderInvoice(data) {
    // تعبئة البيانات الثابتة من المصدر [cite: 1, 3]
    document.getElementById('taxNumber').innerText = "312495447600003"; 
    document.getElementById('freelanceCert').innerText = "FL-765735204";
    document.getElementById('invoiceID').innerText = data.invoiceNumber || "KF-2603290287";
    
    // تعبئة الحسابات المالية [cite: 7]
    document.getElementById('subtotal').innerText = data.totals.subtotal + " ريال";
    document.getElementById('discount').innerText = data.totals.discount + " ريال";
    document.getElementById('vat').innerText = data.totals.vat + " ريال";
    document.getElementById('total').innerText = data.totals.total + " ريال";
}

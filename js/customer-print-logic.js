import { db } from './core/config.js'; 
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const translationDictionary = {
    "المملكة العربية السعودية": "Saudi Arabia",
    "الرياض": "Riyadh", "حائل": "Hail", "جدة": "Jeddah", "الدمام": "Dammam",
    "عادي": "Normal", "مميز": "VIP", "تاجر": "Merchant",
    "هذه المعلومات صادرة من منصة في خدمتك من الأتقان بلس": "This information is issued by Fi-Khidmatik platform from Al-Etqan Plus",
    "منصة في خدمتك": "Fi-Khidmatik Platform",
    "من الأتقان بلس": "From Al-Etqan Plus"
};

let customerData = null;

const autoTranslate = (text) => {
    if (!text || text === '-') return '';
    if (/[a-zA-Z]/.test(text)) return text;
    return translationDictionary[text] || text;
};

export async function createCustomerPrintCard() {
    const urlParams = new URLSearchParams(window.location.search);
    const customerId = urlParams.get('id');

    if (customerId) {
        const docRef = doc(db, "customers", customerId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            customerData = docSnap.data();
            renderSelectionMenu();
            populatePrintTable(customerData, customerId);
        }
    }
}

function renderSelectionMenu() {
    if(document.querySelector('.selection-panel')) return;
    const menuHtml = `
        <div class="selection-panel no-print">
            <h3 style="font-size:1.1rem;"><i class="fas fa-cog"></i> إعدادات محتوى الوثيقة</h3>
            <div class="checkbox-group">
                <label><input type="checkbox" checked onchange="window.toggleAll(this)"> تحديد الكل</label>
                <label><input type="checkbox" class="field-check" value="name" checked> اسم العميل</label>
                <label><input type="checkbox" class="field-check" value="phone" checked> رقم الجوال</label>
                <label><input type="checkbox" class="field-check" value="email" checked> البريد الإلكتروني</label>
                <label><input type="checkbox" class="field-check" value="city" checked> المدينة</label>
                <label><input type="checkbox" class="field-check" value="tag" checked> التصنيف</label>
            </div>
            <button class="btn-apply" onclick="window.applyFilter()">تحديث المعاينة المترجمة</button>
        </div>
    `;
    document.body.insertAdjacentHTML('afterbegin', menuHtml);
}

window.applyFilter = () => {
    const selectedFields = Array.from(document.querySelectorAll('.field-check:checked')).map(cb => cb.value);
    const id = new URLSearchParams(window.location.search).get('id');
    populatePrintTable(customerData, id, selectedFields);
};

window.toggleAll = (master) => {
    document.querySelectorAll('.field-check').forEach(cb => cb.checked = master.checked);
};

function populatePrintTable(data, id, selectedFields = null) {
    const tbody = document.getElementById('data-body');
    if (!tbody) return;

    const allFields = [
        { id: 'name', ar: "اسم العميل", en: "Customer Name", val: data.name },
        { id: 'country', ar: "الدولة", en: "Country", val: "المملكة العربية السعودية" },
        { id: 'phone', ar: "رقم الجوال", en: "Mobile Number", val: `${data.countryCode || '+966'} ${data.phone || ''}` },
        { id: 'email', ar: "البريد الإلكتروني", en: "Email Address", val: data.email },
        { id: 'city', ar: "المدينة", en: "City", val: data.city },
        { id: 'tag', ar: "تصنيف العميل", en: "Category", val: data.tag }
    ];

    const fieldsToDisplay = selectedFields ? allFields.filter(f => selectedFields.includes(f.id)) : allFields;
    tbody.innerHTML = ''; 

    fieldsToDisplay.forEach(field => {
        const tr = document.createElement('tr');
        tr.style.breakInside = 'avoid';
        const translatedVal = autoTranslate(field.val);
        tr.innerHTML = `
            <td class="col-ar">${field.ar}</td>
            <td class="col-data">
                <div class="val-ar">${field.val || '-'}</div>
                <div class="val-en" style="font-size:0.75rem; color:#666; font-weight:600;">${translatedVal}</div>
            </td>
            <td class="col-en">${field.en}</td>
        `;
        tbody.appendChild(tr);
    });
    
    // تحديث التاريخ المزدوج
    const now = new Date();
    document.getElementById('current-date').innerText = `${now.toLocaleDateString('ar-SA')} | ${now.toLocaleDateString('en-US')}`;
    document.getElementById('current-time').innerText = now.toLocaleTimeString('ar-SA');
    document.getElementById('trans-id').innerText = `KF-${now.getFullYear()}-${id.substring(0,5).toUpperCase()}`;

    // توليد الباركود
    const qrContainer = document.getElementById("qrcode");
    qrContainer.innerHTML = '';
    new QRCode(qrContainer, { text: window.location.href, width: 85, height: 85 });
}

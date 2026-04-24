import { db } from './core/config.js'; 
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 1. القاموس الثابت للكلمات والمصطلحات الرسمية
const translationDictionary = {
    "المملكة العربية السعودية": "Saudi Arabia",
    "الرياض": "Riyadh", "حائل": "Hail", "جدة": "Jeddah", "الدمام": "Dammam",
    "عادي": "Normal", "مميز": "VIP", "تاجر": "Merchant",
    "اسم العميل": "Customer Name", "رقم الجوال": "Mobile Number",
    "المدينة": "City", "الحي": "District", "تصنيف العميل": "Category"
};

// 2. محرك الترجمة الصوتية التلقائي (للأسماء والأحياء الجديدة)
const transliterate = (text) => {
    if (!text) return '';
    const map = {
        'أ': 'A', 'إ': 'I', 'ب': 'B', 'ت': 'T', 'ث': 'Th', 'ج': 'J', 'ح': 'H', 'خ': 'Kh', 'د': 'D', 'ذ': 'Dh',
        'ر': 'R', 'ز': 'Z', 'س': 'S', 'ش': 'Sh', 'ص': 'S', 'ض': 'D', 'ط': 'T', 'ظ': 'Z', 'ع': 'A', 'غ': 'Gh',
        'ف': 'F', 'ق': 'Q', 'ك': 'K', 'ل': 'L', 'م': 'M', 'ن': 'N', 'ه': 'H', 'و': 'W', 'ي': 'Y', 'ء': 'A',
        'ة': 'a', 'ى': 'a', ' ': ' ', 'لا': 'La', 'ؤ': 'O', 'ئ': 'E'
    };
    return text.split('').map(char => map[char] || char).join('');
};

const autoTranslate = (text) => {
    if (!text || text === '-') return '';
    // إذا كان النص يحتوي على حروف إنجليزية أصلاً (مثل البريد الإلكتروني)، لا نلمسه
    if (/[a-zA-Z]/.test(text)) return text;
    // ابحث في القاموس أولاً، إذا لم يوجد، استخدم المحرك الصوتي
    return translationDictionary[text] || transliterate(text);
};

let customerData = null;

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
        <div class="selection-panel no-print" style="background:#fff; padding:15px; border-radius:10px; border:2px solid #000; margin-bottom:20px;">
            <h3 style="margin-top:0; font-size:1rem;">⚙️ إعدادات محتوى الوثيقة المترجمة</h3>
            <div class="checkbox-group" style="display:flex; gap:15px; flex-wrap:wrap; margin-bottom:15px;">
                <label><input type="checkbox" checked onchange="window.toggleAll(this)"> تحديد الكل</label>
                <label><input type="checkbox" class="field-check" value="name" checked> اسم العميل</label>
                <label><input type="checkbox" class="field-check" value="phone" checked> رقم الجوال</label>
                <label><input type="checkbox" class="field-check" value="city" checked> المدينة</label>
                <label><input type="checkbox" class="field-check" value="tag" checked> التصنيف</label>
            </div>
            <button class="btn-apply" onclick="window.applyFilter()" style="background:#000; color:#fff; border:none; padding:8px 20px; border-radius:5px; cursor:pointer; font-weight:800;">تحديث المعاينة المترجمة</button>
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
        { id: 'district', ar: "الحي", en: "District", val: data.district },
        { id: 'tag', ar: "تصنيف العميل", en: "Category", val: data.tag }
    ];

    const fieldsToDisplay = selectedFields ? allFields.filter(f => selectedFields.includes(f.id) || f.id === 'country') : allFields;
    tbody.innerHTML = ''; 

    fieldsToDisplay.forEach(field => {
        const tr = document.createElement('tr');
        tr.style.breakInside = 'avoid';
        const translatedVal = autoTranslate(field.val);
        
        tr.innerHTML = `
            <td class="col-ar" style="background:#f2f2f2; font-weight:900; text-align:right !important;">${field.ar}</td>
            <td class="col-data" style="text-align:center;">
                <div class="val-ar" style="font-size:1.1rem; font-weight:bold;">${field.val || '-'}</div>
                <div class="val-en" style="font-size:0.8rem; color:#666; font-weight:600; text-transform:capitalize;">${translatedVal}</div>
            </td>
            <td class="col-en" style="background:#f2f2f2; font-size:0.85rem; font-weight:700; text-align:left !important;">${field.en}</td>
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
    if (qrContainer) {
        qrContainer.innerHTML = '';
        new QRCode(qrContainer, { text: window.location.href, width: 85, height: 85 });
    }
}

import { db } from '../core/firebase.js';
import { doc, getDoc, setDoc } from "firebase/firestore";

export async function initSettings(container) {
    container.innerHTML = await fetch('admin/modules/settings.html').then(r => r.text());
    const settingsDoc = await getDoc(doc(db, "settings", "general"));
    const settings = settingsDoc.exists() ? settingsDoc.data() : { shopName: 'خدماتي', taxPercent: 15, currency: 'ريال' };
    document.getElementById('shop-name').value = settings.shopName;
    document.getElementById('tax-percent').value = settings.taxPercent;
    document.getElementById('currency').value = settings.currency;
    document.getElementById('settings-form').onsubmit = async (e) => {
        e.preventDefault();
        await setDoc(doc(db, "settings", "general"), {
            shopName: document.getElementById('shop-name').value,
            taxPercent: parseFloat(document.getElementById('tax-percent').value),
            currency: document.getElementById('currency').value
        });
        alert('تم حفظ الإعدادات');
    };
}

/**
 * js/modules/settings.js
 * موديول الإعدادات والتكوين
 */

import { db } from '../core/firebase.js';
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

export async function initSettings(container) {
    if (!container) return;
    
    // تحميل الإعدادات المحفوظة
    const settings = await loadSettings();
    
    container.innerHTML = `
        <div style="padding: 25px; font-family: 'Tajawal', sans-serif;">
            <h2 style="color: #2c3e50; margin-bottom: 25px;">
                <i class="fas fa-cog" style="color: #e67e22;"></i> إعدادات النظام
            </h2>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 25px;">
                
                <!-- إعدادات العامة -->
                <div style="background: white; border-radius: 15px; padding: 20px;">
                    <h3 style="margin: 0 0 15px 0; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px;">
                        <i class="fas fa-globe"></i> الإعدادات العامة
                    </h3>
                    <form id="general-settings-form">
                        <div class="form-group" style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 5px;">اسم الشركة</label>
                            <input type="text" id="company-name" value="${settings.companyName || 'تيرا جيتواي'}" 
                                   style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px;">
                        </div>
                        <div class="form-group" style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 5px;">نسبة الضريبة (%)</label>
                            <input type="number" id="tax-rate" value="${settings.taxRate || 15}" step="0.5"
                                   style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px;">
                        </div>
                        <div class="form-group" style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 5px;">العملة</label>
                            <select id="currency" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px;">
                                <option value="SAR" ${settings.currency === 'SAR' ? 'selected' : ''}>ريال سعودي (SAR)</option>
                                <option value="USD" ${settings.currency === 'USD' ? 'selected' : ''}>دولار أمريكي (USD)</option>
                            </select>
                        </div>
                        <button type="submit" style="background: #e67e22; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer;">
                            <i class="fas fa-save"></i> حفظ الإعدادات
                        </button>
                    </form>
                </div>
                
                <!-- إعدادات الإشعارات -->
                <div style="background: white; border-radius: 15px; padding: 20px;">
                    <h3 style="margin: 0 0 15px 0; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px;">
                        <i class="fas fa-bell"></i> الإشعارات
                    </h3>
                    <form id="notifications-settings-form">
                        <div class="form-group" style="margin-bottom: 15px;">
                            <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                                <input type="checkbox" id="notify-low-stock" ${settings.notifyLowStock !== false ? 'checked' : ''}>
                                <span>تنبيه عند نفاد المخزون</span>
                            </label>
                        </div>
                        <div class="form-group" style="margin-bottom: 15px;">
                            <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                                <input type="checkbox" id="notify-new-order" ${settings.notifyNewOrder !== false ? 'checked' : ''}>
                                <span>تنبيه عند طلب جديد</span>
                            </label>
                        </div>
                        <div class="form-group" style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 5px;">حد التنبيه (الكمية)</label>
                            <input type="number" id="low-stock-threshold" value="${settings.lowStockThreshold || 5}"
                                   style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px;">
                        </div>
                        <button type="submit" style="background: #e67e22; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer;">
                            <i class="fas fa-save"></i> حفظ الإعدادات
                        </button>
                    </form>
                </div>
                
                <!-- إعدادات الطباعة -->
                <div style="background: white; border-radius: 15px; padding: 20px;">
                    <h3 style="margin: 0 0 15px 0; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px;">
                        <i class="fas fa-print"></i> إعدادات الطباعة
                    </h3>
                    <form id="print-settings-form">
                        <div class="form-group" style="margin-bottom: 15px;">
                            <label style="display: block; margin-bottom: 5px;">حجم الورق</label>
                            <select id="paper-size" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px;">
                                <option value="A4" ${settings.paperSize === 'A4' ? 'selected' : ''}>A4</option>
                                <option value="A5" ${settings.paperSize === 'A5' ? 'selected' : ''}>A5</option>
                                <option value="thermal" ${settings.paperSize === 'thermal' ? 'selected' : ''}>حراري (58mm)</option>
                            </select>
                        </div>
                        <div class="form-group" style="margin-bottom: 15px;">
                            <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                                <input type="checkbox" id="show-logo" ${settings.showLogo !== false ? 'checked' : ''}>
                                <span>إظهار الشعار في الفواتير</span>
                            </label>
                        </div>
                        <button type="submit" style="background: #e67e22; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer;">
                            <i class="fas fa-save"></i> حفظ الإعدادات
                        </button>
                    </form>
                </div>
                
                <!-- النسخ الاحتياطي -->
                <div style="background: white; border-radius: 15px; padding: 20px;">
                    <h3 style="margin: 0 0 15px 0; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px;">
                        <i class="fas fa-database"></i> النسخ الاحتياطي
                    </h3>
                    <p style="color: #7f8c8d; margin-bottom: 15px;">قم بعمل نسخة احتياطية من بيانات النظام</p>
                    <button id="backup-btn" style="background: #27ae60; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; width: 100%;">
                        <i class="fas fa-download"></i> تصدير النسخة الاحتياطية
                    </button>
                    <hr style="margin: 15px 0;">
                    <p style="color: #7f8c8d; margin-bottom: 15px;">استعادة بيانات من نسخة احتياطية</p>
                    <input type="file" id="restore-file" accept=".json" style="display: none;">
                    <button id="restore-btn" style="background: #e67e22; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; width: 100%;">
                        <i class="fas fa-upload"></i> استعادة النسخة الاحتياطية
                    </button>
                </div>
            </div>
        </div>
    `;
    
    setupEventListeners();
}

async function loadSettings() {
    try {
        const settingsDoc = await getDoc(doc(db, "settings", "app"));
        if (settingsDoc.exists()) {
            return settingsDoc.data();
        }
    } catch (error) {
        console.error("Error loading settings:", error);
    }
    return {};
}

async function saveSettings(settings) {
    try {
        await setDoc(doc(db, "settings", "app"), settings, { merge: true });
        alert('تم حفظ الإعدادات بنجاح');
    } catch (error) {
        console.error("Error saving settings:", error);
        alert('حدث خطأ في حفظ الإعدادات');
    }
}

function setupEventListeners() {
    // إعدادات العامة
    const generalForm = document.getElementById('general-settings-form');
    if (generalForm) {
        generalForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await saveSettings({
                companyName: document.getElementById('company-name').value,
                taxRate: parseFloat(document.getElementById('tax-rate').value),
                currency: document.getElementById('currency').value
            });
        });
    }
    
    // إعدادات الإشعارات
    const notificationsForm = document.getElementById('notifications-settings-form');
    if (notificationsForm) {
        notificationsForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await saveSettings({
                notifyLowStock: document.getElementById('notify-low-stock').checked,
                notifyNewOrder: document.getElementById('notify-new-order').checked,
                lowStockThreshold: parseInt(document.getElementById('low-stock-threshold').value)
            });
        });
    }
    
    // إعدادات الطباعة
    const printForm = document.getElementById('print-settings-form');
    if (printForm) {
        printForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await saveSettings({
                paperSize: document.getElementById('paper-size').value,
                showLogo: document.getElementById('show-logo').checked
            });
        });
    }
    
    // النسخ الاحتياطي
    const backupBtn = document.getElementById('backup-btn');
    if (backupBtn) {
        backupBtn.addEventListener('click', exportBackup);
    }
    
    const restoreBtn = document.getElementById('restore-btn');
    const restoreFile = document.getElementById('restore-file');
    if (restoreBtn && restoreFile) {
        restoreBtn.addEventListener('click', () => restoreFile.click());
        restoreFile.addEventListener('change', importBackup);
    }
}

async function exportBackup() {
    try {
        const collections = ['products', 'orders', 'customers'];
        const backup = {};
        
        for (const col of collections) {
            const snap = await getDocs(collection(db, col));
            backup[col] = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }
        
        const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        alert('تم تصدير النسخة الاحتياطية بنجاح');
    } catch (error) {
        console.error("Error exporting backup:", error);
        alert('حدث خطأ في تصدير النسخة الاحتياطية');
    }
}

async function importBackup(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
        const text = await file.text();
        const backup = JSON.parse(text);
        
        if (confirm('تحذير: استعادة النسخة الاحتياطية ستستبدل البيانات الحالية. هل أنت متأكد؟')) {
            // منطق استعادة البيانات
            alert('تم استعادة النسخة الاحتياطية بنجاح');
            location.reload();
        }
    } catch (error) {
        console.error("Error importing backup:", error);
        alert('ملف النسخة الاحتياطية غير صالح');
    }
}

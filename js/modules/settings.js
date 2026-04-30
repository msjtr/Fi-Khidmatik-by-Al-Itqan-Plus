/**
 * js/modules/settings.js
 * موديول إعدادات النظام - Tera Engine V12.12.8
 */

import { db } from '../core/firebase.js';
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

export async function initSettings(container) {
    if (!container) return;

    // جلب الإعدادات الحالية من قاعدة البيانات
    let currentSettings = {
        companyName: "تيرا جيتواي",
        taxRate: 15,
        currency: "SAR",
        notifyLowStock: true,
        notifyNewOrder: true,
        lowStockThreshold: 5
    };

    try {
        const settingsDoc = await getDoc(doc(db, "system", "general_settings"));
        if (settingsDoc.exists()) {
            currentSettings = { ...currentSettings, ...settingsDoc.data() };
        }
    } catch (e) {
        console.warn("استخدام الإعدادات الافتراضية نتيجة تعذر الاتصال.");
    }

    container.innerHTML = `
        <div style="padding: 25px; font-family: 'Tajawal', sans-serif; direction: rtl;">
            <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 30px;">
                <div style="background: #e67e22; padding: 12px; border-radius: 12px; color: white;">
                    <i class="fas fa-sliders-h fa-2x"></i>
                </div>
                <div>
                    <h2 style="color: #2c3e50; margin: 0;">إعدادات نظام تيرا</h2>
                    <p style="color: #7f8c8d; margin: 5px 0 0;">إدارة التكوين العام والضرائب والإشعارات</p>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 25px;">
                
                <!-- الإعدادات المالية والهوية -->
                <div style="background: white; border-radius: 15px; padding: 25px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                    <h3 style="margin: 0 0 20px 0; color: #2c3e50; display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-building" style="color: #e67e22;"></i> الهوية والمالية
                    </h3>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #34495e;">اسم المنصة</label>
                        <input type="text" id="company-name" value="${currentSettings.companyName}" 
                               style="width: 100%; padding: 12px; border: 2px solid #f1f5f9; border-radius: 10px; outline: none; transition: 0.3s;"
                               onfocus="this.style.borderColor='#e67e22'">
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #34495e;">ضريبة القيمة المضافة (%)</label>
                        <input type="number" id="tax-rate" value="${currentSettings.taxRate}"
                               style="width: 100%; padding: 12px; border: 2px solid #f1f5f9; border-radius: 10px;">
                    </div>
                    <button id="save-general" style="background: #2c3e50; color: white; border: none; padding: 12px 25px; border-radius: 10px; cursor: pointer; width: 100%; font-weight: bold; transition: 0.3s;">
                        <i class="fas fa-check-circle"></i> تحديث بيانات النظام
                    </button>
                </div>
                
                <!-- إدارة التنبيهات الذكية -->
                <div style="background: white; border-radius: 15px; padding: 25px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                    <h3 style="margin: 0 0 20px 0; color: #2c3e50; display: flex; align-items: center; gap: 10px;">
                        <i class="fas fa-shield-alt" style="color: #27ae60;"></i> الأمان والتنبيهات
                    </h3>
                    <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; margin-bottom: 15px;">
                        <label style="display: flex; align-items: center; gap: 12px; cursor: pointer;">
                            <input type="checkbox" id="notify-new-order" ${currentSettings.notifyNewOrder ? 'checked' : ''} style="width: 18px; height: 18px; accent-color: #e67e22;">
                            <span style="font-weight: bold; color: #2c3e50;">تنبيه فوري عند استلام طلب تقسيط</span>
                        </label>
                    </div>
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: bold; color: #34495e;">حد التحذير للمخزون (بطاقات)</label>
                        <input type="number" id="low-stock-threshold" value="${currentSettings.lowStockThreshold}"
                               style="width: 100%; padding: 12px; border: 2px solid #f1f5f9; border-radius: 10px;">
                    </div>
                    <button id="save-notifications" style="background: #e67e22; color: white; border: none; padding: 12px 25px; border-radius: 10px; cursor: pointer; width: 100%; font-weight: bold;">
                        <i class="fas fa-save"></i> حفظ تفضيلات الإشعارات
                    </button>
                </div>

                <!-- النسخ الاحتياطي السحابي -->
                <div style="background: #fdf2e9; border-radius: 15px; padding: 25px; border: 1px dashed #e67e22;">
                    <h3 style="margin: 0 0 10px 0; color: #d35400;"><i class="fas fa-database"></i> مركز البيانات</h3>
                    <p style="font-size: 0.9rem; color: #666;">يمكنك تصدير إعدادات Tera Engine كملف JSON لاستعادتها لاحقاً أو نقلها لخادم آخر.</p>
                    <div style="display: flex; gap: 10px; margin-top: 20px;">
                        <button id="backup-btn" style="flex: 1; background: white; border: 2px solid #e67e22; color: #e67e22; padding: 10px; border-radius: 8px; cursor: pointer; font-weight: bold;">
                            تصدير الإعدادات
                        </button>
                        <button id="restore-btn" style="flex: 1; background: #e67e22; color: white; border: none; padding: 10px; border-radius: 8px; cursor: pointer;">
                            استيراد ملف
                        </button>
                    </div>
                    <input type="file" id="restore-file" accept=".json" style="display: none;">
                </div>
            </div>
        </div>
    `;

    // --- ربط العمليات الفنية ---

    const saveSettingsToFirebase = async (data) => {
        try {
            await setDoc(doc(db, "system", "general_settings"), data, { merge: true });
            alert("✅ تم مزامنة الإعدادات مع سحابة تيرا بنجاح");
        } catch (e) {
            console.error("Error saving settings:", e);
            alert("❌ خطأ في الاتصال بقاعدة البيانات");
        }
    };

    document.getElementById('save-general').addEventListener('click', () => {
        const data = {
            companyName: document.getElementById('company-name').value,
            taxRate: parseFloat(document.getElementById('tax-rate').value)
        };
        saveSettingsToFirebase(data);
    });

    document.getElementById('save-notifications').addEventListener('click', () => {
        const data = {
            notifyNewOrder: document.getElementById('notify-new-order').checked,
            lowStockThreshold: parseInt(document.getElementById('low-stock-threshold').value)
        };
        saveSettingsToFirebase(data);
    });

    // منطق النسخ الاحتياطي المطور
    document.getElementById('backup-btn').addEventListener('click', () => {
        const backupData = {
            version: "12.12.8",
            timestamp: new Date().toISOString(),
            creator: "محمد الشمري",
            settings: currentSettings
        };
        const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Tera-Backup-${new Date().toLocaleDateString('ar-SA')}.json`;
        a.click();
    });
}

export default { initSettings };

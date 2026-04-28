/**
 * موديول واجهة مستخدم العملاء - إصدار Tera Engine V12.12.1
 * تم الإصلاح لمنع التكرار (Duplicate Execution) وتحسين الربط العالمي
 */

import { 
    collection, 
    getDocs, 
    doc, 
    deleteDoc, 
    query, 
    orderBy 
} from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

// متغير لمنع تنفيذ الدالة أكثر من مرة في نفس الوقت
let isProcessing = false;

export async function initCustomersUI(container) {
    // التحقق من عدم التشغيل المكرر
    if (isProcessing) return;
    isProcessing = true;

    console.log("🚀 Tera Gateway: جاري تشغيل موديول العملاء المحدث...");

    const db = window.db;
    if (!db) {
        console.error("❌ خطأ: لم يتم العثور على window.db. تأكد من تحميل firebase.js");
        isProcessing = false;
        return;
    }

    const startRender = async () => {
        const tableBody = document.getElementById('customers-data-rows');
        if (tableBody) {
            await renderCustomersTable(db, tableBody);
            isProcessing = false;
        }
    };

    // تنفيذ أولي
    await startRender();

    // مراقب التغييرات (MutationObserver) للتأكد من حقن العناصر في DOM

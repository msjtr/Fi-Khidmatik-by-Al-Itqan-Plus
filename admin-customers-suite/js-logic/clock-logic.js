/**
 * نظام Tera V12 - محرك الساعة الذكي
 * مؤسسة الإتقان بلس - حائل
 */

export function startTeraClock() {
    function updateClock() {
        // 1. محاولة الوصول للعناصر
        const clockElement = document.getElementById('h-clock');
        const dateElement = document.getElementById('h-date');

        // 2. الحماية: إذا لم تجد العناصر، توقف فوراً ولا تظهر خطأ
        if (!clockElement || !dateElement) {
            return; 
        }

        // 3. التحديث فقط في حال وجود العناصر
        const now = new Date();
        
        // تنسيق الوقت (نظام 12 ساعة ص/م ليكون أفضل بصرياً)
        clockElement.innerText = now.toLocaleTimeString('ar-SA', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });

        // تنسيق التاريخ (دمج الهجري والميلادي بأسلوب أنيق)
        const gregorian = now.toLocaleDateString('en-GB'); // 01/05/2026
        const hijri = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-uma', { 
            day: 'numeric', month: 'long', year: 'numeric' 
        }).format(now);
        
        dateElement.innerText = `${hijri} | ${gregorian}`;
    }

    // 4. تشغيل الساعة بأمان فور استدعاء الدالة من main-hub.html
    updateClock();
    
    // 5. التحديث المستمر كل ثانية
    setInterval(updateClock, 1000);
}

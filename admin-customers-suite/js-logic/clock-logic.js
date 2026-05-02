/**
 * نظام Tera V12 - محرك الساعة الذكي (مضاد للفشل)
 */
export function startTeraClock() {
    function updateClock() {
        // 1. البحث عن عناصر الساعة
        const hoursEl = document.getElementById('c-hours');
        const minEl = document.getElementById('c-minutes');
        const secEl = document.getElementById('c-seconds');
        const ampmEl = document.getElementById('c-ampm');
        const hijriEl = document.getElementById('c-hijri');
        const gregEl = document.getElementById('c-greg');

        // 2. الحماية: إذا لم يتم جلب ملف HTML للساعة بعد، توقف وحاول في الثانية القادمة
        if (!hoursEl || !minEl || !secEl || !ampmEl) {
            return; 
        }

        const now = new Date();
        
        // 3. حساب الوقت بنظام 12 ساعة
        let h = now.getHours();
        let m = now.getMinutes();
        let s = now.getSeconds();
        let ampm = h >= 12 ? 'م' : 'ص';
        
        h = h % 12 || 12; // تحويل الصفر إلى 12

        // 4. حقن الوقت في الشاشة
        hoursEl.innerText = String(h).padStart(2, '0');
        minEl.innerText = String(m).padStart(2, '0');
        secEl.innerText = String(s).padStart(2, '0');
        ampmEl.innerText = ampm;

        // 5. حقن التاريخ
        if (hijriEl && gregEl) {
            hijriEl.innerText = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-uma', { 
                day: 'numeric', month: 'long', year: 'numeric' 
            }).format(now);

            gregEl.innerText = new Intl.DateTimeFormat('ar-SA', { 
                day: '2-digit', month: 'long', year: 'numeric' 
            }).format(now);
        }
    }

    // تشغيل التحديث فوراً
    updateClock();
    
    // استمرار التحديث كل ثانية (1000 ملي ثانية)
    setInterval(updateClock, 1000);
}

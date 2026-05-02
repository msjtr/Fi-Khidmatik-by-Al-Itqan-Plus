// =========================================
// منطق الهيدر (Header Logic)
// =========================================

export function initHeaderLogic() {
    
    // 1. نظام العبارات التحفيزية المتغيرة
    const phrases = [
        "يوم مليء بالنجاح والإنجازات! 🚀",
        "الإتقان بلس.. طريقك للتميز 🌟",
        "بداية موفقة لعمل عظيم 💼",
        "نحو أهداف جديدة اليوم 🎯",
        "خدمة العملاء بشغف واحترافية 🤝"
    ];
    
    const phraseElement = document.getElementById('motivational-phrase');
    let currentPhraseIndex = 0;

    if (phraseElement) {
        setInterval(() => {
            // إخفاء النص تدريجياً
            phraseElement.style.opacity = '0';
            
            setTimeout(() => {
                // تغيير النص بعد الاختفاء
                currentPhraseIndex = (currentPhraseIndex + 1) % phrases.length;
                phraseElement.innerText = phrases[currentPhraseIndex];
                // إظهار النص مجدداً
                phraseElement.style.opacity = '1';
            }, 500); // نصف ثانية للتغيير
        }, 7000); // تتغير كل 7 ثواني
    }

    // 2. توليد الأيقونة الافتراضية من الاسم الأول
    const fullNameElement = document.getElementById('display-user-name');
    const avatarElement = document.getElementById('user-avatar-icon');
    
    if (fullNameElement && avatarElement) {
        const fullName = fullNameElement.innerText.trim();
        // أخذ أول حرف من الاسم الأول
        const firstLetter = fullName.charAt(0).toUpperCase();
        avatarElement.innerText = firstLetter;
    }

    // 3. فتح وإغلاق القائمة المنسدلة (Dropdown)
    const triggerBtn = document.getElementById('profile-trigger-btn');
    const dropdownMenu = document.getElementById('user-dropdown-menu');

    if (triggerBtn && dropdownMenu) {
        triggerBtn.addEventListener('click', function(e) {
            e.stopPropagation(); // منع انتقال الضغطة للخلفية
            dropdownMenu.classList.toggle('show');
            triggerBtn.classList.toggle('active');
        });

        // إغلاق القائمة عند الضغط في أي مكان آخر في الشاشة
        document.addEventListener('click', function(e) {
            if (!dropdownMenu.contains(e.target) && !triggerBtn.contains(e.target)) {
                dropdownMenu.classList.remove('show');
                triggerBtn.classList.remove('active');
            }
        });
    }
}

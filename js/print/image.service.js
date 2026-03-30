function sanitizeFileName(text = '') {
    return text
        .toString()
        .trim()
        .replace(/[^\w\u0600-\u06FF]+/g, '_') // يدعم العربي
        .replace(/_+/g, '_');
}

export async function generateImage(element, order) {

    // ⏳ ننتظر عشان CSS يثبت
    await new Promise(resolve => setTimeout(resolve, 300));

    const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        backgroundColor: "#ffffff"
    });

    let quality = 0.9;
    let data;

    // 🎯 ضغط ذكي
    do {
        data = canvas.toDataURL('image/jpeg', quality);
        quality -= 0.05;
    } while (data.length > 300000 && quality > 0.3);

    // 🎯 اسم الملف الاحترافي
    const name = sanitizeFileName(order?.customer?.name || order?.customer || 'عميل');
    const number = sanitizeFileName(order?.orderNumber || '0000');
    const date = sanitizeFileName(order?.date || 'date');

    const fileName = `${name}_${number}_${date}.jpg`;

    const link = document.createElement('a');
    link.href = data;
    link.download = fileName;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

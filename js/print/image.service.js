export async function generateImage(element, order) {

    // ⏳ ننتظر شوي عشان CSS يثبت
    await new Promise(resolve => setTimeout(resolve, 300));

    const canvas = await html2canvas(element, {
        scale: 3, // جودة أعلى
        useCORS: true, // مهم للشعار
        backgroundColor: "#ffffff"
    });

    let quality = 0.9;
    let data;

    // 🎯 ضغط ذكي بدون تخريب الصورة
    do {
        data = canvas.toDataURL('image/jpeg', quality);
        quality -= 0.05;
    } while (data.length > 300000 && quality > 0.3);

    const fileName = `invoice_${order?.orderNumber || 'file'}.jpg`;

    const link = document.createElement('a');
    link.href = data;
    link.download = fileName;

    document.body.appendChild(link); // مهم لبعض المتصفحات
    link.click();
    document.body.removeChild(link);
}

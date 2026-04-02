```javascript
// js/print/print.service.js

export async function printInvoice(element) {
    if (!element) {
        throw new Error('عنصر الفاتورة غير موجود');
    }

    return new Promise((resolve, reject) => {
        try {
            const printWindow = window.open('', '_blank');

            if (!printWindow) {
                throw new Error('لا يمكن فتح نافذة الطباعة');
            }

            // ===== نسخ CSS =====
            const styles = document.querySelectorAll('style, link[rel="stylesheet"]');
            let stylesHTML = '';

            styles.forEach(style => {
                if (style.tagName === 'STYLE') {
                    stylesHTML += `<style>${style.innerHTML}</style>`;
                } else {
                    stylesHTML += `<link rel="stylesheet" href="${style.href}">`;
                }
            });

            // ===== تحسين الطباعة =====
            const additionalStyles = `
            <style>
                @page { size: A4; margin: 1cm; }

                body {
                    direction: rtl;
                    background: #fff;
                    font-family: Arial;
                    margin: 0;
                }

                .invoice-container {
                    width: 794px; /* 🔥 A4 */
                    margin: auto;
                }

                img {
                    max-width: 100%;
                    height: auto;
                    display: block;
                    page-break-inside: avoid;
                }

                .products-table tr {
                    page-break-inside: auto;
                }

                .products-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                @media print {
                    .no-print { display: none !important; }

                    body, .invoice-container {
                        overflow: visible !important;
                    }
                }
            </style>
            `;

            // ===== HTML =====
            let invoiceHTML = element.outerHTML;

            printWindow.document.write(`
                <!DOCTYPE html>
                <html dir="rtl">
                <head>
                    <meta charset="UTF-8">
                    ${stylesHTML}
                    ${additionalStyles}
                </head>
                <body>
                    ${invoiceHTML}

                    <div class="no-print" style="text-align:center;margin-top:20px;">
                        <button onclick="window.print()">🖨️ طباعة</button>
                        <button onclick="window.close()">❌ إغلاق</button>
                    </div>

                    <script>
                        async function waitImages() {
                            const imgs = document.images;
                            const promises = [];

                            for (let img of imgs) {
                                if (img.complete) continue;

                                promises.push(new Promise(res => {
                                    img.onload = res;
                                    img.onerror = res;
                                }));
                            }

                            await Promise.all(promises);
                        }

                        window.onload = async () => {
                            await waitImages();

                            setTimeout(() => {
                                window.focus();
                                window.print();
                            }, 300);
                        };
                    </script>
                </body>
                </html>
            `);

            printWindow.document.close();

            resolve(true);

        } catch (error) {
            console.error(error);
            reject(error);
        }
    });
}
```

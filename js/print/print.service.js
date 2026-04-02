// js/print/print.service.js

export async function printInvoice(element, type = "print") {
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
                    width: 794px;
                    margin: auto;
                }

                img {
                    max-width: 100%;
                    height: auto;
                    display: block;
                    page-break-inside: avoid;
                }

                .products-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .products-table tr {
                    page-break-inside: avoid;
                }

                @media print {
                    .no-print { display: none !important; }
                }
            </style>
            `;

            let invoiceHTML = element.outerHTML;

            // ===== HTML =====
            printWindow.document.write(`
                <!DOCTYPE html>
                <html dir="rtl">
                <head>
                    <meta charset="UTF-8">
                    ${stylesHTML}
                    ${additionalStyles}

                    <!-- PDF -->
                    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>

                    <!-- PNG -->
                    <script src="https://html2canvas.hertzen.com/dist/html2canvas.min.js"></script>
                </head>
                <body>
                    ${invoiceHTML}

                    <div class="no-print" style="text-align:center;margin-top:20px;">
                        <button onclick="handlePrint()">🖨️ طباعة</button>
                        <button onclick="downloadPDF()">📄 PDF</button>
                        <button onclick="downloadPNG()">🖼️ صورة</button>
                        <button onclick="window.close()">❌ إغلاق</button>
                    </div>

                    <script>
                        const TYPE = "${type}";

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

                        function handlePrint() {
                            window.focus();
                            window.print();
                        }

                        function downloadPDF() {
                            const element = document.body;
                            html2pdf().from(element).save("invoice.pdf");
                        }

                        function downloadPNG() {
                            html2canvas(document.body).then(canvas => {
                                const link = document.createElement("a");
                                link.download = "invoice.png";
                                link.href = canvas.toDataURL();
                                link.click();
                            });
                        }

                        window.onload = async () => {
                            await waitImages();

                            setTimeout(() => {

                                if (TYPE === "print") {
                                    handlePrint();
                                }

                                if (TYPE === "pdf") {
                                    downloadPDF();
                                }

                                if (TYPE === "png") {
                                    downloadPNG();
                                }

                            }, 400);
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

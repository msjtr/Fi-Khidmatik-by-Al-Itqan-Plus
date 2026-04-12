export function generateAllQRs(total, seller, vat, website) {
    // باركود الزكاة (ZATCA)
    new QRCode(document.getElementById("zatca-qr"), {
        text: `Seller:${seller}|VAT:${vat}|Total:${total}|Date:${new Date().toISOString()}`,
        width: 100, height: 100
    });
    // باركود رابط الموقع (Khidmatik)
    new QRCode(document.getElementById("web-qr"), {
        text: website,
        width: 80, height: 80, colorDark: "#1e3a5f"
    });
}

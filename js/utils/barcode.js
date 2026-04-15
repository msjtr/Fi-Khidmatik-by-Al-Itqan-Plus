export const generateBarcodeElement = (elementId, code) => {
    if (window.JsBarcode) {
        JsBarcode(`#${elementId}`, code, {
            format: "CODE128",
            lineColor: "#000",
            width: 1.5,
            height: 40,
            displayValue: true
        });
    }
};

export function generateZATCA(data) {

    const canvas = document.getElementById('qrcode');
    const ctx = canvas.getContext('2d');

    canvas.width = 150;
    canvas.height = 150;

    ctx.fillStyle = "#000";
    ctx.fillRect(10, 10, 130, 130);

}

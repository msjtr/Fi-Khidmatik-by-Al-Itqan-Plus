export function initClock() {
    const update = () => {
        const now = new Date();
        document.getElementById('h-clock').innerText = now.toLocaleTimeString('ar-SA');
        document.getElementById('h-date').innerText = now.toLocaleDateString('ar-SA');
    };
    setInterval(update, 1000); update();
}

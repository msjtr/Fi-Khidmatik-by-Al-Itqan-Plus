export async function printHTML(element) {

const win = window.open('', '_blank');

win.document.write(`
<html>
<head>
<link rel="stylesheet" href="/css/print.css">
</head>
<body>
${element.outerHTML}
</body>
</html>
`);

win.document.close();

win.onload = () => {
    win.print();
    win.close();
};

}

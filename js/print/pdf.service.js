// في pdf.service.js
html2canvas(element, {
  scale: 2,             // وضوح أعلى
  windowHeight: element.scrollHeight,  // يجعل اللقطة تشمل كل المحتوى
  logging: false,
}).then(canvas => {
  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const imgWidth = 210; // A4 عرض
  const pageHeight = 297;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }
  pdf.save('invoice.pdf');
});

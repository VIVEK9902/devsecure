const PDFDocument = require('pdfkit');

const streamPdfReport = (scanData, res) => {
  const filename = `devsecure-report-${Date.now()}.pdf`;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

  const doc = new PDFDocument({ margin: 48 });
  doc.pipe(res);

  doc.fontSize(24).text('DevSecure Vulnerability Report', { underline: true });
  doc.moveDown();

  doc.fontSize(12).text(`Scanned URL: ${scanData.url}`);
  doc.text(`Security Score: ${scanData.securityScore}`);
  doc.text(`Risk Level: ${scanData.riskLevel}`);
  doc.text(`Scan Time: ${new Date(scanData.scannedAt).toLocaleString()}`);
  doc.moveDown();

  doc.fontSize(14).text('Detected Vulnerabilities', { underline: true });
  doc.moveDown(0.5);

  if (scanData.issues.length === 0) {
    doc.fontSize(12).text('No obvious vulnerabilities detected in this basic scan.');
  } else {
    scanData.issues.forEach((issue, index) => {
      doc.fontSize(12).text(`${index + 1}. ${issue}`);
    });
  }

  doc.moveDown();
  doc.fontSize(14).text('Open Ports', { underline: true });
  doc.moveDown(0.5);

  if (scanData.openPorts.length === 0) {
    doc.fontSize(12).text('No common open ports detected.');
  } else {
    doc.fontSize(12).text(scanData.openPorts.join(', '));
  }

  doc.end();
};

module.exports = {
  streamPdfReport,
};

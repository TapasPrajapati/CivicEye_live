const PDFDocument = require('pdfkit');
const fs = require('fs');

const generateCasePDF = (caseData) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const buffers = [];
      
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // PDF Content
      doc.fontSize(20).text('Case Report', { align: 'center' });
      doc.moveDown();
      doc.fontSize(14).text(`Case ID: ${caseData.reportId}`);
      doc.text(`Reporter: ${caseData.name}`);
      doc.text(`Crime Type: ${caseData.crimeType}`);
      doc.text(`Status: ${caseData.status}`);
      doc.text(`Date Reported: ${new Date(caseData.createdAt).toLocaleString()}`);
      
      if (caseData.location) {
        doc.moveDown().text(`Location: ${caseData.location}`);
      } else if (caseData.latitude && caseData.longitude) {
        doc.moveDown().text(`Coordinates: ${caseData.latitude}, ${caseData.longitude}`);
      }
      
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generateCasePDF };
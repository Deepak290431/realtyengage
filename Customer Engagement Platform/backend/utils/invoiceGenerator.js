const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class InvoiceGenerator {
  constructor() {
    this.doc = null;
    this.invoiceDir = path.join(__dirname, '../../invoices');

    // Create invoices directory if it doesn't exist
    if (!fs.existsSync(this.invoiceDir)) {
      fs.mkdirSync(this.invoiceDir, { recursive: true });
    }
  }

  generateInvoice(paymentData) {
    return new Promise((resolve, reject) => {
      try {
        const receiptNumber = paymentData.receiptNumber || paymentData._id.toString();
        const fileName = `invoice_${receiptNumber}.pdf`;
        const filePath = path.join(this.invoiceDir, fileName);

        // Create PDF document
        const doc = new PDFDocument({
          margin: 0, // No margin for full-page design
          size: 'A4',
          info: {
            Title: `Official Invoice - ${receiptNumber}`,
            Author: 'RealtyEngage',
            Subject: 'Property Payment Receipt'
          }
        });

        // Pipe to file
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // Professional Design Tokens
        const colors = {
          primary: '#0F172A', // Deep Slate
          brand: '#4F46E5',    // Indigo-600
          success: '#059669',  // Emerald-600
          text: '#334155',     // Slate-700
          muted: '#64748B',    // Slate-500
          border: '#F1F5F9',   // Slate-100
          bg: '#FFFFFF',
          accent: '#F8FAFC'    // Slate-50
        };

        // --- BACKGROUND DECORATION ---
        // Top Brand Strip
        doc.rect(0, 0, 612, 5).fill(colors.brand);

        // --- HEADER ---
        this.generateHeader(doc, paymentData, colors);

        // --- ADDRESSES ---
        this.generateLogistics(doc, paymentData, colors);

        // --- TABLE ---
        this.generateTable(doc, paymentData, colors);

        // --- FOOTER ---
        this.generateFooter(doc, paymentData, colors);

        // Finalize PDF
        doc.end();

        stream.on('finish', () => {
          resolve({
            fileName,
            filePath,
            url: `/invoices/${fileName}`
          });
        });

        stream.on('error', reject);
      } catch (error) {
        reject(error);
      }
    });
  }

  generateHeader(doc, paymentData, colors) {
    // Right side text
    doc.fillColor(colors.primary)
      .fontSize(28)
      .font('Helvetica-Bold')
      .text('INVOICE', 50, 40);

    doc.fontSize(10)
      .font('Helvetica')
      .fillColor(colors.muted)
      .text(`${new Date(paymentData.paidAt || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`, 50, 75);

    // Brand Logo
    doc.fontSize(22)
      .font('Helvetica-Bold')
      .fillColor(colors.brand)
      .text('RealtyEngage', 350, 40, { align: 'right', width: 200 });

    doc.fontSize(9)
      .font('Helvetica')
      .fillColor(colors.muted)
      .text('RE-DEFINING REAL ESTATE', 350, 65, { align: 'right', width: 200 });

    // Header Border
    doc.strokeColor(colors.border)
      .lineWidth(1)
      .moveTo(50, 100)
      .lineTo(550, 100)
      .stroke();
  }

  generateLogistics(doc, paymentData, colors) {
    const { customer, project } = paymentData;

    // Billing Details
    doc.fillColor(colors.brand)
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('BILL TO', 50, 130);

    doc.fillColor(colors.primary)
      .fontSize(12)
      .font('Helvetica-Bold')
      .text(`${customer?.firstName || 'Valued'} ${customer?.lastName || 'Customer'}`, 50, 145);

    doc.fillColor(colors.muted)
      .fontSize(9)
      .font('Helvetica')
      .text(`${customer?.email || 'email@example.com'}`, 50, 160)
      .text(`${customer?.phone || '+91 00000 00000'}`, 50, 172)
      .text(`${customer?.address?.street || 'N/A'}, ${customer?.address?.city || ''}`, 50, 184, { width: 200 });

    // Property Details
    doc.fillColor(colors.brand)
      .fontSize(10)
      .font('Helvetica-Bold')
      .text('PROPERTY DETAILS', 350, 130);

    doc.fillColor(colors.primary)
      .fontSize(12)
      .font('Helvetica-Bold')
      .text(`${project?.name || 'Dream Property'}`, 350, 145);

    doc.fillColor(colors.muted)
      .fontSize(9)
      .font('Helvetica')
      .text(`Location: ${project?.area || 'Prime Location'}`, 350, 160)
      .text(`Category: ${project?.category || 'Residential'}`, 350, 172)
      .text(`Ref Number: ${paymentData.receiptNumber || paymentData._id}`, 350, 184);
  }

  generateTable(doc, paymentData, colors) {
    const tableTop = 230;

    // Header Bar
    doc.rect(50, tableTop, 500, 30).fill(colors.primary);

    doc.fillColor('#FFFFFF')
      .fontSize(9)
      .font('Helvetica-Bold')
      .text('DESCRIPTION', 60, tableTop + 10)
      .text('TYPE', 250, tableTop + 10)
      .text('STATUS', 380, tableTop + 10)
      .text('AMOUNT', 480, tableTop + 10, { align: 'right', width: 60 });

    const items = this.getPaymentItems(paymentData);
    let currentY = tableTop + 45;

    items.forEach((item, index) => {
      doc.fillColor(colors.primary)
        .fontSize(10)
        .font('Helvetica-Bold')
        .text(item.name, 60, currentY);

      doc.fontSize(8)
        .font('Helvetica')
        .fillColor(colors.muted)
        .text(item.description, 60, currentY + 12);

      doc.fontSize(9)
        .fillColor(colors.text)
        .text((paymentData.paymentType || 'GENERAL').toUpperCase().replace('_', ' '), 250, currentY + 5);

      // Status Badge
      const isSuccess = ['success', 'completed'].includes(paymentData.status);
      doc.fillColor(isSuccess ? colors.success : colors.brand)
        .font('Helvetica-Bold')
        .text((paymentData.status || 'PAID').toUpperCase(), 380, currentY + 5);

      doc.fillColor(colors.primary)
        .text(this.formatCurrency(paymentData.amount), 480, currentY + 5, { align: 'right', width: 60 });

      currentY += 40;
    });

    // Separator
    doc.strokeColor(colors.border)
      .moveTo(50, currentY)
      .lineTo(550, currentY)
      .stroke();

    // Summary Box
    currentY += 20;
    const summaryX = 350;

    const gstAmount = paymentData.gstAmount || 0;
    const penaltyAmount = paymentData.penaltyAmount || 0;
    const baseAmount = paymentData.amount - gstAmount - penaltyAmount;

    // Subtotal Row
    doc.fillColor(colors.muted).fontSize(9).font('Helvetica').text('Subtotal:', summaryX, currentY);
    doc.fillColor(colors.primary).font('Helvetica-Bold').text(this.formatCurrency(baseAmount), 480, currentY, { align: 'right', width: 60 });

    if (penaltyAmount > 0) {
      currentY += 20;
      doc.fillColor(colors.muted).font('Helvetica').text('Late Penalty:', summaryX, currentY);
      doc.fillColor('#E11D48').font('Helvetica-Bold').text(this.formatCurrency(penaltyAmount), 480, currentY, { align: 'right', width: 60 });
    }

    if (gstAmount > 0) {
      currentY += 20;
      doc.fillColor(colors.muted).font('Helvetica').text(`GST (${paymentData.gstRate || 18}%):`, summaryX, currentY);
      doc.fillColor(colors.primary).font('Helvetica-Bold').text(this.formatCurrency(gstAmount), 480, currentY, { align: 'right', width: 60 });
    }

    currentY += 30;
    doc.rect(summaryX - 10, currentY - 10, 210, 40).fill(colors.brand);
    doc.fillColor('#FFFFFF').fontSize(14).text('TOTAL PAID', summaryX, currentY);
    doc.fontSize(14).text(this.formatCurrency(paymentData.amount), 450, currentY, { align: 'right', width: 90 });
  }

  generateFooter(doc, paymentData, colors) {
    const footerTop = 720;

    // Payment Info
    doc.fillColor(colors.muted)
      .fontSize(8)
      .font('Helvetica')
      .text('PAYMENT DETAILS:', 50, footerTop - 60);

    doc.fillColor(colors.text)
      .fontSize(8)
      .text(`Method: ${paymentData.method?.toUpperCase() || 'OFFLINE'}`, 50, footerTop - 45)
      .text(`Transaction: ${paymentData.gatewayDetails?.transactionId || paymentData.receiptNumber}`, 50, footerTop - 35);

    // Signature Area
    doc.strokeColor(colors.border)
      .dash(2, { space: 2 })
      .moveTo(400, footerTop - 10)
      .lineTo(550, footerTop - 10)
      .stroke();

    doc.undash()
      .fillColor(colors.muted)
      .fontSize(8)
      .text('Authorized Signature', 400, footerTop, { align: 'center', width: 150 });

    // Official Badge Bottom
    doc.rect(0, 810, 612, 32).fill(colors.primary);
    doc.fillColor('#FFFFFF')
      .fontSize(8)
      .font('Helvetica')
      .text('This is an electronically generated document. No physical signature is required.', 0, 822, { align: 'center', width: 612 });
  }

  formatCurrency(amount) {
    return `₹${Number(amount).toLocaleString('en-IN')}`;
  }

  getPaymentItems(paymentData) {
    const items = [];
    const typeMap = {
      'booking': 'Property Booking Amount',
      'down_payment': 'Down Payment for Purchase',
      'emi': `Installment Payment`,
      'full_payment': 'Complete Property Payment'
    };

    items.push({
      name: typeMap[paymentData.paymentType] || 'Property Transaction',
      description: `Payment for unit in ${paymentData.project?.name || 'RealtyEngage Project'}`,
      amount: paymentData.amount
    });

    return items;
  }

  // Generate simple HTML invoice (alternative to PDF)
  generateHTMLInvoice(paymentData) {
    const { customer, project } = paymentData;
    const date = new Date(paymentData.paidAt || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>Invoice - ${paymentData.receiptNumber}</title>
      <style>
        :root { --primary: #0F172A; --brand: #4F46E5; --bg: #F8FAFC; }
        body { font-family: 'Inter', sans-serif; background: var(--bg); color: #334155; margin: 0; padding: 40px; line-height: 1.6; }
        .invoice-card { background: #fff; max-width: 850px; margin: 0 auto; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); border-radius: 12px; overflow: hidden; position: relative; }
        .top-bar { height: 6px; background: var(--brand); }
        .header { padding: 40px; display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #F1F5F9; }
        .brand { font-size: 24px; font-weight: 800; color: var(--brand); }
        .invoice-title { font-size: 32px; font-weight: 900; color: var(--primary); margin: 0; }
        .logistics { padding: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
        .section-label { font-size: 11px; font-weight: 800; text-transform: uppercase; color: var(--brand); letter-spacing: 1px; margin-bottom: 12px; }
        .info-box h4 { margin: 0; font-size: 18px; color: var(--primary); }
        .info-box p { margin: 4px 0; font-size: 14px; color: #64748B; }
        .table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        .table thead { background: var(--primary); color: #fff; }
        .table th { padding: 15px 20px; text-align: left; font-size: 12px; font-weight: 600; }
        .table td { padding: 20px; border-bottom: 1px solid #F1F5F9; font-size: 14px; }
        .amount-col { text-align: right; font-weight: 700; color: var(--primary); }
        .summary { padding: 20px 40px; background: #fff; display: flex; justify-content: flex-end; }
        .summary-table { width: 300px; }
        .summary-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
        .total-row { background: var(--brand); color: #fff; padding: 15px 20px; border-radius: 8px; margin-top: 20px; font-weight: 800; font-size: 18px; }
        .footer { padding: 40px; text-align: center; font-size: 12px; color: #94A3B8; border-top: 1px solid #F1F5F9; }
        @media print { body { background: #fff; padding: 0; } .invoice-card { box-shadow: none; border-radius: 0; } }
      </style>
    </head>
    <body>
      <div class="invoice-card">
        <div class="top-bar"></div>
        <div class="header">
          <div>
            <h1 class="invoice-title">INVOICE</h1>
            <p style="color: #64748B; font-size: 14px;">Number: ${paymentData.receiptNumber || 'N/A'}</p>
            <p style="color: #64748B; font-size: 14px;">Date: ${date}</p>
          </div>
          <div style="text-align: right;">
            <div class="brand">RealtyEngage</div>
            <p style="margin: 0; font-size: 12px; font-weight: 600;">PREMIUM PROPERTY SOLUTIONS</p>
          </div>
        </div>

        <div class="logistics">
          <div class="info-box">
            <div class="section-label">Bill To</div>
            <h4>${customer.firstName} ${customer.lastName}</h4>
            <p>${customer.email}</p>
            <p>${customer.phone}</p>
            <p>${customer.address?.city || ''}</p>
          </div>
          <div class="info-box">
            <div class="section-label">Property</div>
            <h4>${project.name}</h4>
            <p>${project.area}</p>
            <p>Status: ${project.status.toUpperCase()}</p>
          </div>
        </div>

        <table class="table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Type</th>
              <th style="text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="font-weight: 600;">${this.getPaymentDescription(paymentData)}</td>
              <td>${paymentData.paymentType.toUpperCase()}</td>
              <td class="amount-col">${this.formatCurrency(paymentData.amount)}</td>
            </tr>
          </tbody>
        </table>

        <div class="summary">
          <div class="summary-table">
            <div class="summary-row">
              <span>Subtotal</span>
              <span style="font-weight: 600;">${this.formatCurrency(paymentData.amount)}</span>
            </div>
            <div class="total-row">
              <span>TOTAL PAID</span>
              <span>${this.formatCurrency(paymentData.amount)}</span>
            </div>
          </div>
        </div>

        <div class="footer">
          <p>This is an official document from RealtyEngage Solutions Pvt Ltd.</p>
          <p>Thank you for choosing us for your property journey.</p>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  getPaymentDescription(paymentData) {
    const descriptions = {
      'booking': 'Initial booking amount',
      'down_payment': 'Down payment for property',
      'emi': `EMI Payment installment`,
      'full_payment': 'Full payment for property',
      'other': 'Property payment'
    };
    return descriptions[paymentData.paymentType] || 'Payment';
  }
}

module.exports = InvoiceGenerator;

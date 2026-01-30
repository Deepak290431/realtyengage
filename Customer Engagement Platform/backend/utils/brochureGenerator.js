const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class BrochureGenerator {
    constructor() {
        this.brochureDir = path.join(__dirname, '../../brochures');

        if (!fs.existsSync(this.brochureDir)) {
            fs.mkdirSync(this.brochureDir, { recursive: true });
        }
    }

    generateBrochure(project) {
        return new Promise((resolve, reject) => {
            try {
                const fileName = `brochure_${project._id}.pdf`;
                const filePath = path.join(this.brochureDir, fileName);

                const doc = new PDFDocument({ margin: 0 }); // Margins handled manually for design
                const stream = fs.createWriteStream(filePath);
                doc.pipe(stream);

                // --- PDF DESIGN ---

                // Background / Header Bar
                doc.rect(0, 0, 612, 120).fill('#1a365d');

                // Title
                doc.fillColor('#ffffff')
                    .fontSize(32)
                    .font('Helvetica-Bold')
                    .text(project.name.toUpperCase(), 40, 40);

                doc.fontSize(14)
                    .font('Helvetica')
                    .text(project.area, 40, 80);

                // Main Body
                doc.fillColor('#000000')
                    .fontSize(18)
                    .font('Helvetica-Bold')
                    .text('PROJECT OVERVIEW', 40, 150);

                doc.fontSize(12)
                    .font('Helvetica')
                    .text(project.description || 'No description available.', 40, 180, { width: 532, align: 'justify' });

                // Pricing Info
                doc.fontSize(16)
                    .font('Helvetica-Bold')
                    .text('PRICING & STATUS', 40, 280);

                doc.fontSize(12)
                    .font('Helvetica')
                    .text(`Base Price: ₹${(project.pricing?.basePrice / 100000).toFixed(2)} Lakhs onwards`, 40, 310)
                    .text(`Status: ${project.status?.replace('_', ' ').toUpperCase()}`, 40, 330)
                    .text(`RERA ID: ${project.reraId || 'PRM/KA/RERA/1251'}`, 40, 350);

                // Amenities
                if (project.amenities && project.amenities.length > 0) {
                    doc.fontSize(16)
                        .font('Helvetica-Bold')
                        .text('MASTER AMENITIES', 40, 400);

                    let y = 430;
                    project.amenities.forEach((amenity, index) => {
                        if (y > 600) return; // Prevent overflow for demo
                        doc.fontSize(11)
                            .font('Helvetica')
                            .text(`• ${amenity.name}`, 60, y);
                        y += 20;
                    });
                }

                // Specifications
                if (project.specifications && project.specifications.length > 0) {
                    doc.fontSize(16)
                        .font('Helvetica-Bold')
                        .text('TECHNICAL DETAILS', 300, 400);

                    let y = 430;
                    project.specifications.slice(0, 8).forEach((spec, index) => {
                        doc.fontSize(11)
                            .font('Helvetica')
                            .text(`${spec.label || spec.type}: ${spec.value}`, 300, y);
                        y += 20;
                    });
                }

                // Configurations Table
                if (project.configurations && project.configurations.length > 0) {
                    doc.fontSize(16)
                        .font('Helvetica-Bold')
                        .text('AVAILABLE CONFIGURATIONS', 40, 620);

                    doc.rect(40, 645, 532, 2).fill('#1a365d'); // Table Header Line

                    let y = 660;
                    doc.fillColor('#1a365d').font('Helvetica-Bold').fontSize(10);
                    doc.text('TYPE', 50, y);
                    doc.text('AREA', 150, y);
                    doc.text('PRICE', 300, y);
                    doc.text('UNITS', 450, y);

                    y += 20;
                    doc.fillColor('#444444').font('Helvetica').fontSize(10);
                    project.configurations.forEach(config => {
                        if (y > 750) return;
                        doc.text(config.type, 50, y);
                        doc.text(config.area, 150, y);
                        doc.text(config.price, 300, y);
                        doc.text(config.available.toString(), 450, y);
                        y += 20;
                    });
                }

                // Footer
                doc.rect(0, 772, 612, 20).fill('#f8fafc');
                doc.fillColor('#94a3b8')
                    .fontSize(8)
                    .text('This is an auto-generated brochure by RealtyEngage Platform. Details subject to change.', 0, 780, { align: 'center', width: 612 });

                doc.end();

                stream.on('finish', () => {
                    resolve({
                        fileName,
                        filePath
                    });
                });

                stream.on('error', reject);
            } catch (error) {
                reject(error);
            }
        });
    }
}

module.exports = new BrochureGenerator();

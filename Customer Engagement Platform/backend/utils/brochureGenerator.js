const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

class BrochureGenerator {
    constructor() {
        this.brochureDir = path.join(__dirname, '../../brochures');

        if (!fs.existsSync(this.brochureDir)) {
            fs.mkdirSync(this.brochureDir, { recursive: true });
        }
    }

    async getBufferFromUrl(url) {
        if (!url) return null;

        // Handle Base64
        if (url.startsWith('data:')) {
            try {
                const base64Data = url.split(',')[1];
                return Buffer.from(base64Data, 'base64');
            } catch (err) {
                console.error('Base64 decode error:', err);
                return null;
            }
        }

        // Handle Unsplash broken URLs (common in seeds)
        if (url.includes('source.unsplash.com')) {
            const query = url.split('?')[1] || 'property';
            url = `https://images.unsplash.com/featured/?${query}`;
        }

        // Handle Remote URLs
        return new Promise((resolve) => {
            const client = url.startsWith('https') ? https : http;
            client.get(url, { timeout: 5000 }, (res) => {
                if (res.statusCode !== 200) {
                    resolve(null);
                    return;
                }
                const data = [];
                res.on('data', (chunk) => data.push(chunk));
                res.on('end', () => resolve(Buffer.concat(data)));
                res.on('error', () => resolve(null));
            }).on('error', (err) => {
                console.error(`Image fetch failed for ${url}:`, err.message);
                resolve(null);
            });
        });
    }

    async generateBrochure(project) {
        const fileName = `brochure_${project._id}.pdf`;
        const filePath = path.join(this.brochureDir, fileName);

        return new Promise(async (resolve, reject) => {
            try {
                const doc = new PDFDocument({
                    margin: 0, // We control margins manually for tighter layout
                    size: 'A4'
                });
                const stream = fs.createWriteStream(filePath);
                doc.pipe(stream);

                // --- PDF DESIGN ---
                let currentY = 0;

                // 1. Header Section (Dark Blue)
                doc.rect(0, 0, 595.28, 80).fill('#1a365d'); // Thinner header

                doc.fillColor('#ffffff')
                    .fontSize(28)
                    .font('Helvetica-Bold')
                    .text(project.name.toUpperCase(), 40, 20);

                doc.fontSize(12)
                    .font('Helvetica')
                    .text(project.area || '', 40, 52);

                currentY = 80;

                // 2. Main Image (Zero Gap to Header)
                const primaryImage = project.images?.find(img => img.isPrimary) || project.images?.[0];
                if (primaryImage) {
                    try {
                        const imgBuffer = await this.getBufferFromUrl(primaryImage.url);
                        if (imgBuffer) {
                            doc.image(imgBuffer, 0, currentY, {
                                width: 595.28,
                                height: 300,
                                cover: [595.28, 300]
                            });
                            currentY += 300;
                        }
                    } catch (err) {
                        console.error('Brochure image fetch error:', err);
                        currentY += 10;
                    }
                } else {
                    currentY += 20; // Small space if no image
                }

                // 3. Body Content Area
                currentY += 30; // Margin after image

                // Project Overview Title
                doc.fillColor('#1a365d')
                    .fontSize(16)
                    .font('Helvetica-Bold')
                    .text('PROJECT OVERVIEW', 40, currentY);

                currentY += 22;
                doc.fillColor('#333333')
                    .fontSize(10.5)
                    .font('Helvetica')
                    .text(project.description || 'No description available.', 40, currentY, {
                        width: 515,
                        align: 'justify',
                        lineGap: 3
                    });

                currentY = doc.y + 25; // Dynamic spacing

                // 4. Two-Column Layout for Pricing & Amenities
                const leftColX = 40;
                const rightColX = 310;
                const sectionHeaderY = currentY;

                // Left Column: Pricing
                doc.fillColor('#1a365d')
                    .fontSize(14)
                    .font('Helvetica-Bold')
                    .text('PRICING & STATUS', leftColX, sectionHeaderY);

                doc.fillColor('#333333')
                    .fontSize(10)
                    .font('Helvetica')
                    .text(`Status: ${project.status?.replace('_', ' ').toUpperCase()}`, leftColX, sectionHeaderY + 22)
                    .text(`Base Price: ₹${project.pricing?.basePrice ? (project.pricing.basePrice / 100000).toFixed(2) : 'N/A'} Lakhs onwards`, leftColX, sectionHeaderY + 40)
                    .text(`RERA ID: ${project.reraId || 'PRM/TN/RERA/1254/2026'}`, leftColX, sectionHeaderY + 58);

                // Right Column: Amenities
                let amenitiesEndY = sectionHeaderY;
                if (project.amenities && project.amenities.length > 0) {
                    doc.fillColor('#1a365d')
                        .fontSize(14)
                        .font('Helvetica-Bold')
                        .text('MASTER AMENITIES', rightColX, sectionHeaderY);

                    let amenY = sectionHeaderY + 22;
                    project.amenities.slice(0, 6).forEach((amenity) => {
                        doc.fillColor('#333333')
                            .fontSize(10)
                            .font('Helvetica')
                            .text(`• ${amenity.name}`, rightColX, amenY);
                        amenY += 18;
                    });
                    amenitiesEndY = amenY;
                }

                currentY = Math.max(sectionHeaderY + 80, amenitiesEndY) + 30;

                // 5. Configurations Table
                if (project.configurations && project.configurations.length > 0) {
                    if (currentY > 700) {
                        doc.addPage();
                        currentY = 40;
                    }

                    doc.fillColor('#1a365d')
                        .fontSize(14)
                        .font('Helvetica-Bold')
                        .text('AVAILABLE CONFIGURATIONS', 40, currentY);

                    currentY += 22;

                    // Table Header Line
                    doc.strokeColor('#1a365d').lineWidth(1.5).moveTo(40, currentY).lineTo(555, currentY).stroke();
                    currentY += 8;

                    doc.fillColor('#1a365d').font('Helvetica-Bold').fontSize(9);
                    doc.text('UNIT TYPE', 50, currentY);
                    doc.text('SQ.FT AREA', 180, currentY);
                    doc.text('EXPECTED PRICE', 320, currentY);
                    doc.text('UNITS', 470, currentY);

                    currentY += 18;
                    // Header bottom line
                    doc.strokeColor('#cbd5e1').lineWidth(0.5).moveTo(40, currentY).lineTo(555, currentY).stroke();
                    currentY += 10;

                    doc.fillColor('#444444').font('Helvetica').fontSize(9.5);
                    project.configurations.forEach((config) => {
                        if (currentY > 780) {
                            doc.addPage();
                            currentY = 40;
                        }

                        doc.text(config.type, 50, currentY);
                        doc.text(config.area, 180, currentY);
                        doc.text(config.price, 320, currentY);
                        doc.text(`${config.available}`, 470, currentY);

                        currentY += 22;
                    });
                    // Table Bottom Line
                    doc.strokeColor('#1a365d').lineWidth(0.8).moveTo(40, currentY).lineTo(555, currentY).stroke();
                }

                // 6. Footer (Always at absolute bottom)
                doc.rect(0, 815, 595.28, 27).fill('#f8fafc');
                doc.fillColor('#94a3b8')
                    .fontSize(8)
                    .font('Helvetica')
                    .text('This is an auto-generated brochure by RealtyEngage Platform. Details subject to change.', 0, 825, { align: 'center', width: 595.28 });

                doc.end();

                stream.on('finish', () => resolve({ fileName, filePath }));
                stream.on('error', reject);
            } catch (error) {
                console.error('Brochure generation error:', error);
                reject(error);
            }
        });
    }
}

module.exports = new BrochureGenerator();

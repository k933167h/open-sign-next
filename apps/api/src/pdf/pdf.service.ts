import { Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { fromPath } from 'pdf2pic';
import { PDFDocument } from 'pdf-lib';
import { FormField, FieldType } from '@open-sign/shared';

@Injectable()
export class PdfService {
    private readonly uploadDir = path.join(process.cwd(), 'uploads', 'pdfs');

    constructor() {
        // Ensure upload directory exists
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
    }

    async listTemplates(): Promise<{ id: string; name: string }[]> {
        if (!fs.existsSync(this.uploadDir)) {
            return [];
        }
        const files = fs.readdirSync(this.uploadDir);
        return files
            .filter(file => file.endsWith('.pdf'))
            .map(file => ({
                id: file.replace('.pdf', ''),
                name: file,
            }));
    }

    async deleteTemplate(templateId: string): Promise<void> {
        const filePath = path.join(this.uploadDir, `${templateId}.pdf`);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        } else {
            throw new NotFoundException(`Template ${templateId} not found`);
        }

        // Clean up generated images for this template
        const imagesDir = path.join(this.uploadDir, 'images');
        if (fs.existsSync(imagesDir)) {
            const files = fs.readdirSync(imagesDir);
            for (const file of files) {
                if (file.startsWith(`${templateId}_page_`)) {
                    fs.unlinkSync(path.join(imagesDir, file));
                }
            }
        }
    }

    async getPageImage(templateId: string, page: number): Promise<Buffer> {
        const pdfPath = path.join(this.uploadDir, `${templateId}.pdf`);

        // If file doesn't exist, we fallback to a dummy image
        if (!fs.existsSync(pdfPath)) {
            console.warn(`[PdfService] PDF not found for ${templateId}, returning dummy image`);
            const base64Png = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
            return Buffer.from(base64Png, 'base64');
        }

        try {
            const options = {
                density: 150, // Image density
                saveFilename: `${templateId}_page_${page}`,
                savePath: path.join(this.uploadDir, 'images'), // Temporary directory for images
                format: 'png',
                width: 800, // Fixed width
                // height: 1131,
            };

            // Ensure temp image directory exists
            if (!fs.existsSync(options.savePath)) {
                fs.mkdirSync(options.savePath, { recursive: true });
            }

            const storeAsImage = fromPath(pdfPath, options);
            const resolveData = await storeAsImage(page, { responseType: 'buffer' });
            
            if (!resolveData || !resolveData.buffer) {
                throw new Error('Failed to generate image buffer');
            }

            return Buffer.from(resolveData.buffer);
        } catch (error) {
            console.error('Error converting PDF to image:', error);
            throw new Error('Error converting PDF to image');
        }
    }

    async signPdf(templateId: string, fields: FormField[], signatureBase64?: string): Promise<Buffer> {
        const pdfPath = path.join(this.uploadDir, `${templateId}.pdf`);
        if (!fs.existsSync(pdfPath)) {
            throw new NotFoundException(`Template ${templateId} not found`);
        }

        const pdfBytes = fs.readFileSync(pdfPath);
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const pages = pdfDoc.getPages();

        if (signatureBase64) {
            // 서명 이미지가 있으면 임베드
            const isPng = signatureBase64.includes('image/png');
            const base64Data = signatureBase64.replace(/^data:image\/\w+;base64,/, '');
            const imageBuffer = Buffer.from(base64Data, 'base64');

            let sigImage;
            if (isPng) {
                sigImage = await pdfDoc.embedPng(imageBuffer);
            } else {
                sigImage = await pdfDoc.embedJpg(imageBuffer);
            }

            // 필드 중 SIGNATURE 타입 찾기 (첫 번째 매칭 필드 사용)
            const sigField = fields.find(f => f.type === FieldType.SIGNATURE);

            if (sigField) {
                const pageIndex = Math.max(0, (sigField.page || 1) - 1);
                if (pageIndex < pages.length) {
                    const page = pages[pageIndex];
                    const { width: pageWidth, height: pageHeight } = page.getSize();

                    const absoluteWidth = (sigField.width || 0.2) * pageWidth;
                    const absoluteHeight = (sigField.height || 0.1) * pageHeight;
                    
                    // Web coordinates (0,0 is top-left), pdf-lib coordinates (0,0 is bottom-left)
                    const absoluteX = (sigField.x || 0) * pageWidth;
                    // Y axis inversion
                    const absoluteY = pageHeight - ((sigField.y || 0) * pageHeight) - absoluteHeight;

                    page.drawImage(sigImage, {
                        x: absoluteX,
                        y: absoluteY,
                        width: absoluteWidth,
                        height: absoluteHeight,
                    });
                }
            }
        }

        const savedPdfBytes = await pdfDoc.save();
        return Buffer.from(savedPdfBytes);
    }
}

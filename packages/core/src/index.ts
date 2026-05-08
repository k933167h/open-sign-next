import { PDFDocument, rgb } from 'pdf-lib';
import { FormField, FieldType } from '@open-sign/shared';

export class OpenSignEngine {
    static async stampPdf(pdfBuffer: Uint8Array, fields: FormField[]): Promise<Uint8Array> {
        const pdfDoc = await PDFDocument.load(pdfBuffer);
        const pages = pdfDoc.getPages();

        for (const field of fields) {
            if (!field.value && field.type !== FieldType.CHECKBOX) continue;
            const page = pages[field.page - 1];
            if (!page) continue;

            const { width, height } = page.getSize();
            const x = field.x * width;
            const y = height - (field.y * height) - (field.height * height);

            if (field.type === FieldType.TEXT || field.type === FieldType.DATE) {
                page.drawText(field.value || '', {
                    x, y: y + (field.height * height * 0.2),
                    size: field.height * height * 0.6,
                    color: rgb(0, 0, 0),
                });
            } else if (field.type === FieldType.SIGNATURE && field.value?.startsWith('data:image')) {
                const base64Data = field.value.split(',')[1];
                const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
                const image = await pdfDoc.embedPng(imageBytes);
                page.drawImage(image, { x, y, width: field.width * width, height: field.height * height });
            } else if (field.type === FieldType.CHECKBOX && field.value === 'true') {
                page.drawText('X', { x: x + 2, y: y + 2, size: field.height * height * 0.8 });
            }
        }
        return pdfDoc.save();
    }
}
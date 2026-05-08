import { Controller, Get, Post, Delete, Param, Res, HttpStatus, UseInterceptors, UploadedFile, HttpException, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PdfService } from './pdf.service';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { FormField } from '@open-sign/shared';

@Controller('pdf')
export class PdfController {
    constructor(private readonly pdfService: PdfService) {}

    @Get('list')
    async listPdfs() {
        return this.pdfService.listTemplates();
    }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadPdf(@UploadedFile() file: Express.Multer.File) {
        // Multer(busboy) 기본 설정으로 인해 한글 파일명이 latin1으로 디코딩되어 깨지는 현상 수정
        const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');

        if (!file || !originalName.toLowerCase().endsWith('.pdf')) {
            throw new HttpException('Invalid file type, only PDF is allowed', HttpStatus.BAD_REQUEST);
        }
        const templateId = originalName.replace(/\.pdf$/i, '');
        const uploadDir = path.join(process.cwd(), 'uploads', 'pdfs');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        const filePath = path.join(uploadDir, originalName);
        fs.writeFileSync(filePath, file.buffer);
        return { id: templateId, name: originalName };
    }

    @Delete(':id')
    async deletePdf(@Param('id') id: string) {
        await this.pdfService.deleteTemplate(id);
        return { success: true };
    }

    @Get(':templateId/page/:page')
    async getPdfPage(
        @Param('templateId') templateId: string,
        @Param('page') page: string,
        @Res() res: Response
    ) {
        try {
            const buffer = await this.pdfService.getPageImage(templateId, parseInt(page, 10));
            res.set({
                'Content-Type': 'image/png',
                'Content-Length': buffer.length,
            });
            res.status(HttpStatus.OK).send(buffer);
        } catch (error) {
            console.error('Error in getPdfPage:', error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Error generating PDF page');
        }
    }

    @Post('sign')
    async signPdf(
        @Body() body: { templateId: string; fields: FormField[]; signatureBase64?: string },
        @Res() res: Response
    ) {
        try {
            const { templateId, fields, signatureBase64 } = body;
            const pdfBuffer = await this.pdfService.signPdf(templateId, fields, signatureBase64);
            
            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="signed_${encodeURIComponent(templateId)}.pdf"`,
                'Content-Length': pdfBuffer.length,
            });
            res.status(HttpStatus.OK).send(pdfBuffer);
        } catch (error) {
            console.error('Error in signPdf:', error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Error signing PDF');
        }
    }
}

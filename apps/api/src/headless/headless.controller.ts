import { Controller, Post, Body, Headers, HttpCode, HttpStatus } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { v4 as uuidv4 } from 'uuid';
import { HeadlessSubmitDto } from '@open-sign/shared';

@Controller('v1/headless')
export class HeadlessController {
    constructor(@InjectQueue('pdf-merge') private pdfQueue: Queue) { }

    @Post('submissions')
    @HttpCode(HttpStatus.ACCEPTED)
    async submit(@Body() body: HeadlessSubmitDto, @Headers('x-api-key') apiKey: string) {
        // 실제 환경에서는 apiKey DB 검증 로직 추가
        if (apiKey !== 'test-key') throw new Error('Invalid API Key');

        const submissionId = uuidv4();
        await this.pdfQueue.add('merge-and-webhook', {
            submissionId,
            pdfBuffer: Buffer.from(body.pdfBase64, 'base64'),
            fields: body.fields,
            webhookUrl: body.webhookUrl,
            metadata: body.metadata,
        });

        return { submissionId, status: 'processing' };
    }
}
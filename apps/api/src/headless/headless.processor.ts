import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { createHmac } from 'crypto';
import axios from 'axios';
import { OpenSignEngine } from '@open-sign/core';

@Processor('pdf-merge')
export class HeadlessProcessor extends WorkerHost {
    private readonly secret = process.env.WEBHOOK_SECRET || 'super-secret';

    async process(job: Job) {
        const { submissionId, pdfBuffer, fields, webhookUrl, metadata } = job.data;

        // 1. 코어 엔진 실행
        const finalPdf = await OpenSignEngine.stampPdf(pdfBuffer, fields);

        // 2. 실제 환경에서는 여기서 MinIO/S3에 finalPdf 업로드 후 URL 획득
        const mockDownloadUrl = `https://storage.example.com/${submissionId}.pdf`;

        // 3. Webhook 발송
        const payload = {
            event: 'document.completed',
            submissionId,
            downloadUrl: mockDownloadUrl,
            metadata,
            timestamp: Date.now(),
        };

        const signature = createHmac('sha256', this.secret)
            .update(JSON.stringify(payload))
            .digest('hex');

        await axios.post(webhookUrl, payload, {
            headers: { 'X-OpenSign-Signature': signature },
        });
    }
}
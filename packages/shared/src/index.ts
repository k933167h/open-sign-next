export class HeadlessSubmitDto {
    pdfBase64: string;
    fields: FormField[];
    webhookUrl?: string;
    metadata?: any;
}

export enum FieldType {
    TEXT = 'TEXT',
    DATE = 'DATE',
    CHECKBOX = 'CHECKBOX',
    SIGNATURE = 'SIGNATURE'
}

export interface FormField {
    id: string;
    type: FieldType;
    page: number;
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    value?: string;
}

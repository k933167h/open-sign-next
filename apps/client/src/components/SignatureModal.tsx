import React, { useState } from 'react';
import { SignaturePad } from './SignaturePad';
import { QrSignatureGenerator } from './QrSignatureGenerator';
import { ImageSignatureUploader } from './ImageSignatureUploader';

interface SignatureModalProps {
    isOpen: boolean;
    onSave: (base64: string) => void;
    onClose: () => void;
}

export const SignatureModal: React.FC<SignatureModalProps> = ({ isOpen, onSave, onClose }) => {
    const [activeTab, setActiveTab] = useState<'draw' | 'qr' | 'image'>('draw');

    if (!isOpen) return null;

    const tabStyle = (tab: string) => ({
        padding: '10px 15px',
        cursor: 'pointer',
        borderBottom: activeTab === tab ? '2px solid #007bff' : '2px solid transparent',
        color: activeTab === tab ? '#007bff' : '#666',
        fontWeight: activeTab === tab ? 'bold' : 'normal',
    });

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div style={{
                background: '#fff',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                width: '450px',
                maxWidth: '90%'
            }}>
                <h3 style={{ marginTop: 0, marginBottom: '15px', textAlign: 'center' }}>서명 등록</h3>
                
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', borderBottom: '1px solid #ddd' }}>
                    <div style={tabStyle('draw')} onClick={() => setActiveTab('draw')}>직접 그리기</div>
                    <div style={tabStyle('qr')} onClick={() => setActiveTab('qr')}>QR 바코드</div>
                    <div style={tabStyle('image')} onClick={() => setActiveTab('image')}>이미지 업로드</div>
                </div>

                <div>
                    {activeTab === 'draw' && <SignaturePad onSave={onSave} onCancel={onClose} />}
                    {activeTab === 'qr' && <QrSignatureGenerator onSave={onSave} onCancel={onClose} />}
                    {activeTab === 'image' && <ImageSignatureUploader onSave={onSave} onCancel={onClose} />}
                </div>
            </div>
        </div>
    );
};

import React, { useRef, useState } from 'react';

interface ImageSignatureUploaderProps {
    onSave: (base64: string) => void;
    onCancel: () => void;
}

export const ImageSignatureUploader: React.FC<ImageSignatureUploaderProps> = ({ onSave, onCancel }) => {
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('이미지 파일만 업로드 가능합니다.');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            setImagePreview(base64String);
        };
        reader.readAsDataURL(file);
    };

    const handleSave = () => {
        if (imagePreview) {
            onSave(imagePreview);
        } else {
            alert('먼저 이미지를 업로드해주세요.');
        }
    };

    const handleClear = () => {
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ marginBottom: '15px', width: '100%', maxWidth: '300px', textAlign: 'center' }}>
                <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    id="signature-image-upload"
                />
                <label 
                    htmlFor="signature-image-upload" 
                    style={{ 
                        display: 'inline-block',
                        padding: '10px 20px', 
                        background: '#e2e8f0', 
                        color: '#333', 
                        borderRadius: '4px', 
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        border: '1px solid #cbd5e1'
                    }}
                >
                    이미지 선택하기
                </label>
            </div>

            <div style={{ width: '300px', height: '200px', border: '1px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9f9f9', borderRadius: '8px', overflow: 'hidden' }}>
                {imagePreview ? (
                    <img src={imagePreview} alt="Uploaded Signature Preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                ) : (
                    <span style={{ color: '#aaa', fontSize: '14px' }}>업로드된 이미지가 여기에 표시됩니다</span>
                )}
            </div>

            <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                <button 
                    onClick={handleClear}
                    style={{ padding: '8px 16px', border: '1px solid #ccc', borderRadius: '4px', background: '#f8f9fa', cursor: 'pointer' }}
                >
                    초기화
                </button>
                <button 
                    onClick={onCancel}
                    style={{ padding: '8px 16px', border: 'none', borderRadius: '4px', background: '#6c757d', color: 'white', cursor: 'pointer' }}
                >
                    취소
                </button>
                <button 
                    onClick={handleSave}
                    disabled={!imagePreview}
                    style={{ padding: '8px 16px', border: 'none', borderRadius: '4px', background: imagePreview ? '#007bff' : '#ccc', color: 'white', cursor: imagePreview ? 'pointer' : 'not-allowed' }}
                >
                    저장
                </button>
            </div>
        </div>
    );
};

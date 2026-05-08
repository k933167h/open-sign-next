import React, { useState, useEffect, useRef } from 'react';
import QRCodeStyling from 'qr-code-styling';

interface QrSignatureGeneratorProps {
    onSave: (base64: string) => void;
    onCancel: () => void;
}

export const QrSignatureGenerator: React.FC<QrSignatureGeneratorProps> = ({ onSave, onCancel }) => {
    const [text, setText] = useState('');
    const [qrImage, setQrImage] = useState<string | null>(null);
    const [dotType, setDotType] = useState<string>('rounded');
    const [color, setColor] = useState<string>('#000000');
    const [logoUrl, setLogoUrl] = useState<string>('');
    const qrRef = useRef<any>(null);

    useEffect(() => {
        // Initialize QR Code Styling instance
        qrRef.current = new QRCodeStyling({
            width: 300,
            height: 300,
            data: " ", // Default placeholder
            image: "",
            dotsOptions: {
                color: "#000000",
                type: "rounded"
            },
            backgroundOptions: {
                color: "#ffffff",
            },
            imageOptions: {
                crossOrigin: "anonymous",
                margin: 5
            }
        });
    }, []);

    const generateQR = async () => {
        if (!text.trim()) {
            alert('바코드로 만들 텍스트를 입력해주세요.');
            return;
        }

        if (qrRef.current) {
            qrRef.current.update({
                data: text,
                image: logoUrl || undefined,
                dotsOptions: {
                    color: color,
                    type: dotType as any
                }
            });

            try {
                // Get Blob and convert to Base64
                const buffer = await qrRef.current.getRawData("png");
                if (buffer) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        setQrImage(reader.result as string);
                    };
                    reader.readAsDataURL(buffer);
                }
            } catch (err) {
                console.error(err);
                alert('QR 코드 생성 중 오류가 발생했습니다.');
            }
        }
    };

    const handleSave = () => {
        if (qrImage) {
            onSave(qrImage);
        } else {
            alert('먼저 QR 코드를 생성해주세요.');
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ marginBottom: '15px', width: '100%', maxWidth: '350px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>서명 텍스트</label>
                        <input 
                            type="text" 
                            value={text} 
                            onChange={(e) => setText(e.target.value)} 
                            placeholder="이름, 이메일, 문서번호 등"
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                            onKeyDown={(e) => e.key === 'Enter' && generateQR()}
                        />
                    </div>
                    
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>패턴 스타일</label>
                            <select 
                                value={dotType} 
                                onChange={(e) => setDotType(e.target.value)}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                            >
                                <option value="rounded">둥근 점 (Rounded)</option>
                                <option value="dots">원형 (Dots)</option>
                                <option value="classy">클래식 변형 (Classy)</option>
                                <option value="square">기본 사각형 (Square)</option>
                            </select>
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>메인 색상</label>
                            <input 
                                type="color" 
                                value={color} 
                                onChange={(e) => setColor(e.target.value)} 
                                style={{ width: '100%', padding: '2px', height: '35px', borderRadius: '4px', border: '1px solid #ccc', cursor: 'pointer' }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '12px' }}>중앙 로고 이미지 URL (선택)</label>
                        <input 
                            type="text" 
                            value={logoUrl} 
                            onChange={(e) => setLogoUrl(e.target.value)} 
                            placeholder="https://example.com/logo.png"
                            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                            onKeyDown={(e) => e.key === 'Enter' && generateQR()}
                        />
                    </div>

                    <button 
                        onClick={generateQR}
                        style={{ padding: '10px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        유니크 서명(QR) 생성하기
                    </button>
                </div>
            </div>

            <div style={{ width: '300px', height: '300px', border: '1px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9f9f9', borderRadius: '8px', overflow: 'hidden' }}>
                {qrImage ? (
                    <img src={qrImage} alt="Generated Artistic QR" style={{ maxWidth: '100%', maxHeight: '100%' }} />
                ) : (
                    <span style={{ color: '#aaa', fontSize: '14px', textAlign: 'center', padding: '20px' }}>옵션을 설정하고<br/>생성하기 버튼을 눌러주세요</span>
                )}
            </div>

            <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                <button 
                    onClick={() => { setText(''); setQrImage(null); }}
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
                    disabled={!qrImage}
                    style={{ padding: '8px 16px', border: 'none', borderRadius: '4px', background: qrImage ? '#007bff' : '#ccc', color: 'white', cursor: qrImage ? 'pointer' : 'not-allowed' }}
                >
                    서명으로 사용 (저장)
                </button>
            </div>
        </div>
    );
};

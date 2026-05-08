// apps/client/src/App.tsx
import React, { useState } from 'react';
import { PdfViewer } from '@/components/PdfViewer';
import { PdfManager } from '@/components/PdfManager';
import { FieldManager } from '@/components/FieldManager';
import { SignatureModal } from '@/components/SignatureModal';
import { FormField, FieldType } from '@open-sign/shared';

function App() {
    // 선택된 템플릿 ID (없으면 뷰어를 숨김)
    const [templateId, setTemplateId] = useState<string>('');

    // PDF에 입력할 필드 데이터
    const [fields, setFields] = useState<FormField[]>([
        {
            id: 'name_field',
            type: FieldType.TEXT,
            page: 1,
            x: 0.5,
            y: 0.8,
            width: 0.3,
            height: 0.05,
            value: '김오픈싸인',
        },
        {
            id: 'date_field',
            type: FieldType.DATE,
            page: 1,
            y: 0.7,
            width: 0.2,
            height: 0.05,
        },
        {
            id: 'signature_field_1',
            type: FieldType.SIGNATURE,
            page: 1,
            x: 0.6,
            y: 0.85,
            width: 0.15,
            height: 0.05,
        }
    ]);

    // 서버 전송 결과 확인용 상태
    const [submissionResult, setSubmissionResult] = useState<any>(null);

    // 전자 서명 상태 관리
    const [showSignatureModal, setShowSignatureModal] = useState(false);
    const [mySignature, setMySignature] = useState<string | null>(null);

    // 제출 버튼을 눌렀을 때 실행될 로직
    const handleFinalSubmit = async (filledFields: FormField[]) => {
        console.log('제출된 최종 데이터:', filledFields);
        
        try {
            const response = await fetch('/api/pdf/sign', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    templateId,
                    fields: filledFields,
                    signatureBase64: mySignature
                })
            });

            if (!response.ok) {
                throw new Error('서명된 PDF를 가져오는데 실패했습니다.');
            }

            // PDF 파일 다운로드 처리
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `signed_${templateId}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);

            // UI에 결과 표시
            setSubmissionResult({
                templateId,
                submittedAt: new Date().toISOString(),
                fields: filledFields,
                message: "✅ 서명된 PDF가 성공적으로 다운로드되었습니다."
            });
        } catch (error) {
            console.error(error);
            alert('PDF 서명 중 오류가 발생했습니다.');
        }
    };

    // templateId가 변경되면(새로 선택하거나 삭제 등) 전송 결과 화면도 초기화합니다.
    React.useEffect(() => {
        setSubmissionResult(null);
    }, [templateId]);

    const handleSaveSignature = (base64: string) => {
        setMySignature(base64);
        setShowSignatureModal(false);
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
            <h1>📄 OpenSign Next (Thin Client)</h1>
            <p>이 화면은 무거운 PDF 라이브러리를 로드하지 않습니다. 서버에서 이미지를 가져옵니다.</p>

            <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                <div style={{ flex: '1', minWidth: '350px' }}>
                    <PdfManager onSelect={setTemplateId} currentTemplateId={templateId} />
                    <FieldManager fields={fields} setFields={setFields} />
                    
                    <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', background: '#fff' }}>
                        <h3 style={{ margin: '0 0 15px 0' }}>✍️ 내 서명 (전자 서명)</h3>
                        {mySignature ? (
                            <div style={{ textAlign: 'center' }}>
                                <img src={mySignature} alt="My Signature" style={{ border: '1px solid #eee', background: '#f9f9f9', borderRadius: '4px', maxWidth: '100%', height: 'auto' }} />
                                <div style={{ marginTop: '10px' }}>
                                    <button onClick={() => setShowSignatureModal(true)} style={{ padding: '6px 12px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' }}>
                                        다시 만들기
                                    </button>
                                    <button onClick={() => setMySignature(null)} style={{ padding: '6px 12px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                        서명 지우기
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '20px', border: '1px dashed #ccc', borderRadius: '4px', background: '#f9f9f9' }}>
                                <p style={{ margin: '0 0 10px 0', color: '#666' }}>등록된 서명이 없습니다.</p>
                                <button onClick={() => setShowSignatureModal(true)} style={{ padding: '8px 16px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                    서명 만들기
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ flex: '2', minWidth: '600px' }}>
                    {templateId ? (
                        <div style={{ border: '1px solid #ccc', padding: '10px', background: '#f9f9f9', borderRadius: '8px', marginBottom: '20px' }}>
                            <h3 style={{ marginTop: 0 }}>미리보기: {templateId}</h3>
                            <PdfViewer
                                templateId={templateId}
                                fields={fields}
                                onSubmit={handleFinalSubmit}
                            />
                        </div>
                    ) : (
                        <div style={{ border: '1px dashed #ccc', padding: '50px', textAlign: 'center', color: '#888', borderRadius: '8px', marginBottom: '20px' }}>
                            <p>좌측에서 PDF를 선택하거나 새로 업로드해주세요.</p>
                        </div>
                    )}

                    {submissionResult && (
                        <div style={{ border: '1px solid #28a745', padding: '15px', borderRadius: '8px', background: '#eaffea' }}>
                            <h3 style={{ margin: '0 0 10px 0', color: '#155724' }}>✅ 서버 전송 결과</h3>
                            <pre style={{ background: '#fff', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', overflowX: 'auto', maxHeight: '400px' }}>
                                {JSON.stringify(submissionResult, null, 2)}
                            </pre>
                            <button 
                                onClick={() => setSubmissionResult(null)}
                                style={{ marginTop: '10px', background: '#6c757d', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
                            >
                                결과 닫기
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <SignatureModal 
                isOpen={showSignatureModal} 
                onClose={() => setShowSignatureModal(false)} 
                onSave={handleSaveSignature} 
            />
        </div>
    );
}

export default App;
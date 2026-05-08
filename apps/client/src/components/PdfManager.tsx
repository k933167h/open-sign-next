import React, { useState, useEffect } from 'react';

interface PdfTemplate {
    id: string;
    name: string;
}

export const PdfManager: React.FC<{
    onSelect: (templateId: string) => void;
    currentTemplateId: string;
}> = ({ onSelect, currentTemplateId }) => {
    const [templates, setTemplates] = useState<PdfTemplate[]>([]);
    const [uploading, setUploading] = useState(false);

    const fetchTemplates = async () => {
        try {
            // 브라우저 캐싱 방지를 위해 쿼리 파라미터 추가
            const res = await fetch(`/api/pdf/list?t=${Date.now()}`);
            if (res.ok) {
                const data = await res.json();
                setTemplates(data);
            }
        } catch (error) {
            console.error('Failed to fetch templates:', error);
        }
    };

    useEffect(() => {
        fetchTemplates();
    }, []);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            alert('PDF 파일만 업로드 가능합니다.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        try {
            const res = await fetch('/api/pdf/upload', {
                method: 'POST',
                body: formData,
            });
            if (res.ok) {
                await fetchTemplates();
                // Optionally auto-select the uploaded file
                const data = await res.json();
                onSelect(data.id);
            } else {
                alert('업로드 실패');
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('업로드 중 오류가 발생했습니다.');
        } finally {
            setUploading(false);
            if (e.target) {
                e.target.value = ''; // Reset file input
            }
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!window.confirm('정말 삭제하시겠습니까?')) return;

        try {
            const res = await fetch(`/api/pdf/${encodeURIComponent(id)}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                await fetchTemplates();
                if (currentTemplateId === id) {
                    onSelect(''); // Clear selection if deleted
                }
            } else {
                alert('삭제 실패');
            }
        } catch (error) {
            console.error('Delete error:', error);
        }
    };

    return (
        <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ margin: 0 }}>PDF 관리</h3>
                <div>
                    <input 
                        type="file" 
                        accept="application/pdf" 
                        id="pdf-upload" 
                        style={{ display: 'none' }} 
                        onChange={handleUpload}
                        disabled={uploading}
                    />
                    <label 
                        htmlFor="pdf-upload" 
                        style={{ 
                            background: uploading ? '#ccc' : '#007bff', 
                            color: 'white', 
                            padding: '8px 16px', 
                            borderRadius: '4px', 
                            cursor: uploading ? 'not-allowed' : 'pointer',
                            fontSize: '14px'
                        }}
                    >
                        {uploading ? '업로드 중...' : '새 PDF 업로드'}
                    </label>
                </div>
            </div>

            {templates.length === 0 ? (
                <p style={{ color: '#666', textAlign: 'center', padding: '20px 0' }}>등록된 PDF가 없습니다.</p>
            ) : (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {templates.map(template => (
                        <li 
                            key={template.id}
                            onClick={() => onSelect(template.id)}
                            style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                padding: '10px',
                                borderBottom: '1px solid #eee',
                                background: currentTemplateId === template.id ? '#e6f2ff' : 'transparent',
                                cursor: 'pointer'
                            }}
                        >
                            <span style={{ fontWeight: currentTemplateId === template.id ? 'bold' : 'normal' }}>
                                📄 {template.name}
                            </span>
                            <button 
                                onClick={(e) => handleDelete(template.id, e)}
                                style={{ 
                                    background: '#dc3545', 
                                    color: 'white', 
                                    border: 'none', 
                                    padding: '4px 8px', 
                                    borderRadius: '4px', 
                                    cursor: 'pointer' 
                                }}
                            >
                                삭제
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

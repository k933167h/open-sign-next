import React, { useState, useEffect } from 'react';

import { FormField } from '@open-sign/shared';

export const PdfViewer: React.FC<{ 
    templateId: string, 
    fields?: FormField[], 
    onSubmit?: (fields: FormField[]) => void 
}> = ({ templateId, fields, onSubmit }) => {
    const [pageImg, setPageImg] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);

    // Thin Client: 서버에서 렌더링된 이미지를 가져옴
    useEffect(() => {
        if (!templateId) return;
        setLoading(true);
        // 브라우저 캐시 방지를 위해 현재 시간을 쿼리 스트링으로 추가
        fetch(`/api/pdf/${encodeURIComponent(templateId)}/page/${page}?t=${Date.now()}`)
            .then(res => res.blob())
            .then(blob => {
                const objectUrl = URL.createObjectURL(blob);
                setPageImg(prevImg => {
                    if (prevImg) URL.revokeObjectURL(prevImg);
                    return objectUrl;
                });
                setLoading(false);
            })
            .catch(error => {
                console.error("Error fetching PDF page:", error);
                setLoading(false);
            });
    }, [templateId, page]);

    return (
        <div>
            {loading ? (
                <div style={{ width: '600px', height: '800px', border: '1px solid #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    Loading...
                </div>
            ) : (
                pageImg && <img src={pageImg} style={{ width: '600px', border: '1px solid #ccc' }} alt={`Page ${page}`} />
            )}
            <div style={{ marginTop: 10 }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Prev</button>
                <span> Page {page} </span>
                <button onClick={() => setPage(p => p + 1)}>Next</button>
            </div>
            {onSubmit && (
                <div style={{ marginTop: 20 }}>
                    <button onClick={() => onSubmit(fields || [])}>
                        제출하기
                    </button>
                </div>
            )}
        </div>
    );
};
import React, { useState } from 'react';
import { FormField, FieldType } from '@open-sign/shared';

interface FieldManagerProps {
    fields: FormField[];
    setFields: React.Dispatch<React.SetStateAction<FormField[]>>;
}

export const FieldManager: React.FC<FieldManagerProps> = ({ fields, setFields }) => {
    const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
    const [formData, setFormData] = useState<Partial<FormField>>({
        type: FieldType.TEXT,
        page: 1,
        x: 0,
        y: 0,
        width: 0.1,
        height: 0.05,
        value: ''
    });

    const handleAddOrUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.id) {
            alert('ID를 입력해주세요.');
            return;
        }

        const newField = formData as FormField;

        if (editingFieldId) {
            setFields(fields.map(f => f.id === editingFieldId ? newField : f));
            setEditingFieldId(null);
        } else {
            if (fields.some(f => f.id === newField.id)) {
                alert('동일한 ID가 이미 존재합니다.');
                return;
            }
            setFields([...fields, newField]);
        }

        // Reset form
        setFormData({
            id: '',
            type: FieldType.TEXT,
            page: 1,
            x: 0,
            y: 0,
            width: 0.1,
            height: 0.05,
            value: ''
        });
    };

    const handleEdit = (field: FormField) => {
        setFormData(field);
        setEditingFieldId(field.id);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('삭제하시겠습니까?')) {
            setFields(fields.filter(f => f.id !== id));
            if (editingFieldId === id) {
                setEditingFieldId(null);
                setFormData({ type: FieldType.TEXT, page: 1, x: 0, y: 0, width: 0.1, height: 0.05, value: '' });
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const numberFields = ['page', 'x', 'y', 'width', 'height'];
        
        setFormData({
            ...formData,
            [name]: numberFields.includes(name) ? parseFloat(value) : value
        });
    };

    return (
        <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 15px 0' }}>입력 필드 관리</h3>
            
            <form onSubmit={handleAddOrUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px', background: '#f9f9f9', padding: '10px', borderRadius: '6px' }}>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label style={{ fontSize: '12px' }}>ID</label>
                        <input name="id" value={formData.id || ''} onChange={handleChange} required disabled={!!editingFieldId} style={{ padding: '4px' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label style={{ fontSize: '12px' }}>Type</label>
                        <select name="type" value={formData.type || FieldType.TEXT} onChange={handleChange} style={{ padding: '4px' }}>
                            <option value={FieldType.TEXT}>TEXT</option>
                            <option value={FieldType.DATE}>DATE</option>
                            <option value={FieldType.CHECKBOX}>CHECKBOX</option>
                            <option value={FieldType.SIGNATURE}>SIGNATURE</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label style={{ fontSize: '12px' }}>Page</label>
                        <input name="page" type="number" min="1" value={formData.page || 1} onChange={handleChange} required style={{ padding: '4px', width: '60px' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label style={{ fontSize: '12px' }}>X</label>
                        <input name="x" type="number" step="0.01" min="0" max="1" value={formData.x !== undefined ? formData.x : ''} onChange={handleChange} style={{ padding: '4px', width: '60px' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label style={{ fontSize: '12px' }}>Y</label>
                        <input name="y" type="number" step="0.01" min="0" max="1" value={formData.y !== undefined ? formData.y : ''} onChange={handleChange} style={{ padding: '4px', width: '60px' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label style={{ fontSize: '12px' }}>Width</label>
                        <input name="width" type="number" step="0.01" min="0" max="1" value={formData.width !== undefined ? formData.width : ''} onChange={handleChange} style={{ padding: '4px', width: '60px' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <label style={{ fontSize: '12px' }}>Height</label>
                        <input name="height" type="number" step="0.01" min="0" max="1" value={formData.height !== undefined ? formData.height : ''} onChange={handleChange} style={{ padding: '4px', width: '60px' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <label style={{ fontSize: '12px' }}>Value</label>
                        <input name="value" value={formData.value || ''} onChange={handleChange} style={{ padding: '4px' }} />
                    </div>
                </div>
                <div>
                    <button type="submit" style={{ background: '#28a745', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>
                        {editingFieldId ? '수정 완료' : '추가'}
                    </button>
                    {editingFieldId && (
                        <button type="button" onClick={() => {
                            setEditingFieldId(null);
                            setFormData({ type: FieldType.TEXT, page: 1, x: 0, y: 0, width: 0.1, height: 0.05, value: '' });
                        }} style={{ marginLeft: '10px', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>
                            취소
                        </button>
                    )}
                </div>
            </form>

            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {fields.map(f => (
                    <li key={f.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderBottom: '1px solid #eee' }}>
                        <div>
                            <strong>{f.id}</strong> ({f.type}, p.{f.page})
                            <br />
                            <span style={{ fontSize: '12px', color: '#666' }}>
                                pos: ({f.x}, {f.y}) size: ({f.width}x{f.height}) val: "{f.value}"
                            </span>
                        </div>
                        <div>
                            <button onClick={() => handleEdit(f)} style={{ marginRight: '5px', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>
                                수정
                            </button>
                            <button onClick={() => handleDelete(f.id)} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>
                                삭제
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { tagApi } from '../../api';

export default function SaveModal({ onClose, onSave, initialName = '', initialDescription = '', initialTagIds = [] }) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [selectedTagIds, setSelectedTagIds] = useState(initialTagIds);
  const [tags, setTags] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    tagApi.list().then(r => setTags(r.data.data || r.data)).catch(() => {});
  }, []);

  const toggleTag = (id) => {
    setSelectedTagIds(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
  };

  const handleSave = async () => {
    if (!name.trim()) { setError('Tên template không được để trống.'); return; }
    setSaving(true);
    try {
      await onSave({ name: name.trim(), description: description.trim(), tag_ids: selectedTagIds });
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={overlay}>
      <div style={modal}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Lưu Template</h2>
          <button onClick={onClose} style={closeBtn}><X size={16} /></button>
        </div>

        {error && <div style={errorBox}>{error}</div>}

        <label style={labelStyle}>Tên template *</label>
        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Thiệp FPT Telecom 2026" style={inputStyle} />

        <label style={labelStyle}>Mô tả</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} placeholder="Mô tả ngắn về template..." style={{ ...inputStyle, resize: 'vertical' }} />

        <label style={labelStyle}>Tags</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
          {tags.map(tag => (
            <button key={tag.id} onClick={() => toggleTag(tag.id)} style={{
              padding: '5px 12px', borderRadius: 20, border: `1px solid ${selectedTagIds.includes(tag.id) ? tag.color || 'var(--color-accent)' : 'var(--color-border)'}`,
              background: selectedTagIds.includes(tag.id) ? `${tag.color || 'var(--color-accent)'}22` : 'transparent',
              color: selectedTagIds.includes(tag.id) ? tag.color || 'var(--color-accent-2)' : 'var(--color-text-muted)',
              fontSize: 12, cursor: 'pointer', fontWeight: 500,
            }}>{tag.name}</button>
          ))}
          {!tags.length && <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Chưa có tag. Tạo tag trước tại trang Tags.</span>}
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={secondaryBtn}>Hủy</button>
          <button onClick={handleSave} disabled={saving} style={primaryBtn}>
            <Save size={14} /> {saving ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </div>
    </div>
  );
}

const overlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const modal = { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 14, padding: 28, width: 480, maxWidth: '90vw' };
const closeBtn = { background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: 4 };
const labelStyle = { display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 6, marginTop: 16 };
const inputStyle = { width: '100%', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 8, color: 'var(--color-text)', fontSize: 13, padding: '9px 12px', outline: 'none', boxSizing: 'border-box' };
const errorBox = { background: '#ef444422', border: '1px solid #ef4444', borderRadius: 8, padding: '10px 14px', color: '#ef4444', fontSize: 13, marginBottom: 12 };
const primaryBtn = { display: 'flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 8, border: 'none', background: 'var(--color-accent)', color: 'white', fontWeight: 600, fontSize: 13, cursor: 'pointer' };
const secondaryBtn = { padding: '9px 16px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-text)', fontSize: 13, cursor: 'pointer' };

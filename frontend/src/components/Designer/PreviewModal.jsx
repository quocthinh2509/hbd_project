import { useState } from 'react';
import { X, Loader, RefreshCw } from 'lucide-react';
import { renderApi } from '../../api';

const SAMPLE_DATA = {
  name: 'Nguyễn Văn A',
  birthday: '15/04/1990',
  department: 'Kinh doanh miền Nam',
  position: 'Trưởng phòng',
  wish: 'Chúc mừng sinh nhật! Chúc anh luôn mạnh khỏe, thành công và hạnh phúc bên gia đình.',
  avatar_url: '',
};

export default function PreviewModal({ canvasJson, onClose }) {
  const [data, setData] = useState(SAMPLE_DATA);
  const [previewImg, setPreviewImg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePreview = async () => {
    setLoading(true);
    setError('');
    try {
      const { data: res } = await renderApi.preview({ canvas_json: canvasJson, data });
      setPreviewImg(res.image_base64);
    } catch (err) {
      setError(err.response?.data?.error || 'Render failed. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const update = (field, val) => setData(prev => ({ ...prev, [field]: val }));

  return (
    <div style={overlay}>
      <div style={modal}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Xem trước thiệp</h2>
          <button onClick={onClose} style={closeBtn}><X size={16} /></button>
        </div>

        <div style={{ display: 'flex', gap: 24 }}>
          {/* Form */}
          <div style={{ width: 260, flexShrink: 0 }}>
            {[
              ['Tên NV', 'name'],
              ['Ngày sinh', 'birthday'],
              ['Phòng ban', 'department'],
              ['Chức vụ', 'position'],
            ].map(([label, key]) => (
              <div key={key} style={{ marginBottom: 10 }}>
                <label style={labelStyle}>{label}</label>
                <input type="text" value={data[key]} onChange={e => update(key, e.target.value)} style={inputStyle} />
              </div>
            ))}
            <div style={{ marginBottom: 10 }}>
              <label style={labelStyle}>Lời chúc</label>
              <textarea value={data.wish} onChange={e => update('wish', e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Avatar URL</label>
              <input type="text" value={data.avatar_url} onChange={e => update('avatar_url', e.target.value)} placeholder="https://..." style={inputStyle} />
            </div>

            <button onClick={handlePreview} disabled={loading} style={primaryBtn}>
              {loading ? <Loader size={14} /> : <RefreshCw size={14} />}
              {loading ? 'Đang render...' : 'Render Preview'}
            </button>
          </div>

          {/* Preview image */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-surface-2)', borderRadius: 10, minHeight: 240 }}>
            {error && <div style={{ color: '#ef4444', fontSize: 13, textAlign: 'center', padding: 16 }}>{error}</div>}
            {loading && !error && <Loader size={24} color="var(--color-text-muted)" />}
            {previewImg && !loading && (
              <img src={previewImg} alt="Preview" style={{ maxWidth: '100%', maxHeight: 400, borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }} />
            )}
            {!previewImg && !loading && !error && (
              <div style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>Click "Render Preview" để xem kết quả</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const overlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 };
const modal = { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 14, padding: 28, width: '90vw', maxWidth: 860 };
const closeBtn = { background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: 4 };
const labelStyle = { display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: 4 };
const inputStyle = { width: '100%', background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 7, color: 'var(--color-text)', fontSize: 12, padding: '7px 10px', outline: 'none', boxSizing: 'border-box' };
const primaryBtn = { display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 8, border: 'none', background: 'var(--color-accent)', color: 'white', fontWeight: 600, fontSize: 13, cursor: 'pointer', width: '100%', justifyContent: 'center' };

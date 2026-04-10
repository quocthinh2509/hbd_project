import { useState } from 'react';
import { Save, Eye, Copy, Download, ArrowLeft, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Toolbar({ canvasJson, templateId, onSave, onPreview, onDuplicate, onExportJson, isLoading }) {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [previewing, setPreviewing] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try { await onSave(); } finally { setSaving(false); }
  };

  const handlePreview = async () => {
    setPreviewing(true);
    try { await onPreview(); } finally { setPreviewing(false); }
  };

  return (
    <div style={{
      height: 56, display: 'flex', alignItems: 'center', gap: 8,
      padding: '0 20px',
      background: 'var(--color-surface)',
      borderBottom: '1px solid var(--color-border)',
      flexShrink: 0,
    }}>
      {/* Back */}
      <button onClick={() => navigate('/templates')} style={ghostBtn()}>
        <ArrowLeft size={14} /> Templates
      </button>

      <div style={{ flex: 1 }} />

      {/* Template name indicator */}
      {templateId && (
        <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
          Editing template
        </span>
      )}

      {/* Actions */}
      <button onClick={handlePreview} disabled={previewing} style={ghostBtn()}>
        {previewing ? <Loader size={14} className="spin" /> : <Eye size={14} />}
        Xem trước
      </button>

      {templateId && (
        <button onClick={onDuplicate} style={ghostBtn()}>
          <Copy size={14} /> Nhân bản
        </button>
      )}

      <button onClick={onExportJson} style={ghostBtn()}>
        <Download size={14} /> JSON
      </button>

      <button onClick={handleSave} disabled={saving} style={primaryBtn()}>
        {saving ? <Loader size={14} /> : <Save size={14} />}
        {saving ? 'Đang lưu...' : 'Lưu Template'}
      </button>
    </div>
  );
}

const ghostBtn = () => ({
  display: 'flex', alignItems: 'center', gap: 6,
  padding: '7px 12px', borderRadius: 7,
  border: '1px solid var(--color-border)',
  background: 'transparent', color: 'var(--color-text)',
  fontSize: 12, fontWeight: 500, cursor: 'pointer',
  transition: 'border-color 0.15s',
});

const primaryBtn = () => ({
  display: 'flex', alignItems: 'center', gap: 6,
  padding: '7px 16px', borderRadius: 7, border: 'none',
  background: 'var(--color-accent)', color: 'white',
  fontSize: 12, fontWeight: 600, cursor: 'pointer',
});

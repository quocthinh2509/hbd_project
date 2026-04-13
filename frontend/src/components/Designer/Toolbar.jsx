import { useState } from 'react';
import { Save, Eye, Copy, Download, ArrowLeft, Loader, Grid } from 'lucide-react';

export default function Toolbar({ canvasJson, templateId, onSave, onPreview, onDuplicate, onExportJson, isLoading, onBack, gridSize, onGridSizeChange }) {
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
      <button onClick={onBack} style={ghostBtn()}>
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: gridSize > 0 ? 'var(--color-surface-2)' : 'transparent', borderRadius: 7, padding: '0 4px', border: '1px solid var(--color-border)' }}>
        <Grid size={14} color={gridSize > 0 ? 'var(--color-accent)' : 'var(--color-text)'} style={{ marginLeft: 8 }} />
        <select 
          value={gridSize} 
          onChange={e => onGridSizeChange(Number(e.target.value))}
          style={{ background: 'transparent', border: 'none', color: gridSize > 0 ? 'var(--color-accent)' : 'var(--color-text)', fontSize: 12, fontWeight: 500, padding: '6px 8px', cursor: 'pointer', outline: 'none' }}
        >
          <option value={0} style={{color:'black'}}>Tắt Lưới</option>
          <option value={10} style={{color:'black'}}>Hạt 10px</option>
          <option value={20} style={{color:'black'}}>Hạt 20px</option>
          <option value={30} style={{color:'black'}}>Hạt 30px</option>
          <option value={40} style={{color:'black'}}>Hạt 40px</option>
        </select>
      </div>

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

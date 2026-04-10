import { useState } from 'react';
import { Type, User, Smile, Building2, Calendar, Briefcase, Zap, Image, Square, Circle, Minus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { ELEMENT_DEFAULTS, TEXT_TYPES } from './Canvas';

const ELEMENT_BUTTONS = [
  { type: 'name',     label: 'Tên NV',    icon: User,      group: 'Placeholder' },
  { type: 'wish',     label: 'Lời chúc',  icon: Smile,     group: 'Placeholder' },
  { type: 'dept',     label: 'Phòng ban', icon: Building2, group: 'Placeholder' },
  { type: 'position', label: 'Chức vụ',   icon: Briefcase, group: 'Placeholder' },
  { type: 'date',     label: 'Ngày sinh', icon: Calendar,  group: 'Placeholder' },
  { type: 'text',     label: 'Văn bản',   icon: Type,      group: 'Text' },
  { type: 'logo',     label: 'Logo text', icon: Zap,       group: 'Text' },
  { type: 'avatar',   label: 'Avatar',    icon: Image,     group: 'Hình ảnh' },
  { type: 'rect',     label: 'Hình chữ nhật', icon: Square, group: 'Shape' },
  { type: 'circle',   label: 'Hình tròn', icon: Circle,    group: 'Shape' },
  { type: 'line',     label: 'Đường kẻ',  icon: Minus,     group: 'Shape' },
];

const GRADIENT_PRESETS = [
  { label: 'FPT Blue',   value: 'linear-gradient(135deg, #0a3d7a, #1565c0)' },
  { label: 'FPT Navy',   value: 'linear-gradient(135deg, #0d1b3e, #185FA5)' },
  { label: 'Sunset',     value: 'linear-gradient(135deg, #c0392b, #e74c3c, #f39c12)' },
  { label: 'Emerald',    value: 'linear-gradient(135deg, #1a472a, #27ae60)' },
  { label: 'Purple',     value: 'linear-gradient(135deg, #2c003e, #7b2ff7)' },
  { label: 'Gold',       value: 'linear-gradient(135deg, #7d5a00, #f0c040)' },
  { label: 'Dark',       value: 'linear-gradient(135deg, #0f1117, #1a1d27)' },
];

const FONT_OPTIONS = ['Inter', 'Georgia', 'Arial', 'Roboto', 'Times New Roman', 'Courier New', 'Verdana'];
const AVATAR_SHAPES = [
  { value: 'circle',  label: '⬤' },
  { value: 'square',  label: '■' },
  { value: 'rounded', label: '▣' },
  { value: 'hexagon', label: '⬡' },
  { value: 'diamond', label: '◆' },
  { value: 'star',    label: '★' },
];
const BORDER_STYLES = ['solid', 'dashed', 'double', 'glow', 'none'];

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>{title}</div>
      {children}
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
      <div style={{ width: 72, fontSize: 12, color: 'var(--color-text-muted)', flexShrink: 0 }}>{label}</div>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}

const input = (style = {}) => ({
  width: '100%', background: 'var(--color-surface-2)',
  border: '1px solid var(--color-border)', borderRadius: 6,
  color: 'var(--color-text)', fontSize: 12, padding: '5px 8px',
  outline: 'none', ...style,
});

export default function Sidebar({ canvasJson, setCanvasJson, selectedId, setSelectedId, onAddElement }) {
  const [activeTab, setActiveTab] = useState('elements');

  const card = canvasJson.card || {};
  const elements = canvasJson.elements || [];
  const selectedEl = elements.find(e => e.id === selectedId);

  const updateCard = (updates) => setCanvasJson(prev => ({ ...prev, card: { ...prev.card, ...updates } }));

  const updateElement = (updates) =>
    setCanvasJson(prev => ({
      ...prev,
      elements: prev.elements.map(el => el.id === selectedId ? { ...el, ...updates } : el),
    }));

  const deleteElement = (id) => {
    setCanvasJson(prev => ({ ...prev, elements: prev.elements.filter(el => el.id !== id) }));
    if (selectedId === id) setSelectedId(null);
  };

  const moveElement = (id, dir) => {
    setCanvasJson(prev => {
      const els = [...prev.elements];
      const idx = els.findIndex(e => e.id === id);
      if (dir === 'up' && idx > 0) [els[idx], els[idx - 1]] = [els[idx - 1], els[idx]];
      if (dir === 'down' && idx < els.length - 1) [els[idx], els[idx + 1]] = [els[idx + 1], els[idx]];
      return { ...prev, elements: els };
    });
  };

  const tabs = [
    { id: 'background', label: 'Nền' },
    { id: 'elements',   label: 'Thành phần' },
    { id: 'props',      label: 'Thuộc tính' },
  ];

  return (
    <div style={{
      width: 280, background: 'var(--color-surface)',
      borderRight: '1px solid var(--color-border)',
      display: 'flex', flexDirection: 'column', height: '100%',
    }}>
      {/* Tab Bar */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)' }}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            flex: 1, padding: '12px 0', border: 'none', background: 'none',
            color: activeTab === tab.id ? 'var(--color-accent-2)' : 'var(--color-text-muted)',
            borderBottom: activeTab === tab.id ? '2px solid var(--color-accent-2)' : '2px solid transparent',
            fontWeight: activeTab === tab.id ? 600 : 400, fontSize: 12, cursor: 'pointer',
          }}>{tab.label}</button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px' }}>
        {/* ──── TAB: NỀN ──── */}
        {activeTab === 'background' && (
          <>
            <Section title="Kích thước">
              <Row label="Rộng (px)">
                <input type="number" value={card.width || 800} onChange={e => updateCard({ width: +e.target.value })} style={input()} />
              </Row>
              <Row label="Cao (px)">
                <input type="number" value={card.height || 450} onChange={e => updateCard({ height: +e.target.value })} style={input()} />
              </Row>
              <Row label="Bo góc">
                <input type="text" value={card.borderRadius || '0px'} onChange={e => updateCard({ borderRadius: e.target.value })} style={input()} placeholder="8px" />
              </Row>
            </Section>

            <Section title="Màu nền / Gradient">
              <div style={{ marginBottom: 8 }}>
                <input
                  type="text" placeholder="CSS background..."
                  value={card.background || ''}
                  onChange={e => updateCard({ background: e.target.value })}
                  style={input({ marginBottom: 8 })}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {GRADIENT_PRESETS.map(p => (
                  <button key={p.label} onClick={() => updateCard({ background: p.value })} style={{
                    padding: '8px', borderRadius: 6, border: '2px solid transparent',
                    background: p.value, color: 'white', fontSize: 10, fontWeight: 600,
                    cursor: 'pointer', textShadow: '0 1px 2px rgba(0,0,0,0.6)',
                    transition: 'border-color 0.15s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#2d8ef5'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'transparent'}
                  >{p.label}</button>
                ))}
              </div>
            </Section>
          </>
        )}

        {/* ──── TAB: THÀNH PHẦN ──── */}
        {activeTab === 'elements' && (
          <>
            <Section title="Thêm element">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {ELEMENT_BUTTONS.map(({ type, label, icon: Icon }) => (
                  <button key={type} onClick={() => onAddElement(type)} style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '8px 10px', borderRadius: 7,
                    border: '1px solid var(--color-border)',
                    background: 'var(--color-surface-2)', color: 'var(--color-text)',
                    fontSize: 12, cursor: 'pointer', fontWeight: 500,
                    transition: 'border-color 0.15s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-accent)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border)'}
                  >
                    <Icon size={13} color="var(--color-accent-2)" />
                    {label}
                  </button>
                ))}
              </div>
            </Section>

            <Section title={`Layers (${elements.length})`}>
              {elements.length === 0 && <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>Chưa có element nào.</div>}
              {[...elements].reverse().map((el, i) => (
                <div key={el.id} onClick={() => { setSelectedId(el.id); setActiveTab('props'); }} style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '7px 8px', borderRadius: 7, marginBottom: 4, cursor: 'pointer',
                  background: selectedId === el.id ? 'var(--color-surface-2)' : 'transparent',
                  border: `1px solid ${selectedId === el.id ? 'var(--color-accent)' : 'transparent'}`,
                }}>
                  <span style={{ flex: 1, fontSize: 12, color: 'var(--color-text)' }}>
                    [{el.type}] {el.text?.substring(0, 20) || `${el.size || ''}px`}
                  </span>
                  <button onClick={e => { e.stopPropagation(); moveElement(el.id, 'up'); }} style={iconBtn()}><ChevronUp size={11} /></button>
                  <button onClick={e => { e.stopPropagation(); moveElement(el.id, 'down'); }} style={iconBtn()}><ChevronDown size={11} /></button>
                  <button onClick={e => { e.stopPropagation(); deleteElement(el.id); }} style={iconBtn('#ef444420', '#ef4444')}><Trash2 size={11} /></button>
                </div>
              ))}
            </Section>
          </>
        )}

        {/* ──── TAB: THUỘC TÍNH ──── */}
        {activeTab === 'props' && (
          <>
            {!selectedEl ? (
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)', textAlign: 'center', padding: '24px 0' }}>
                Chọn một element trên canvas để chỉnh sửa.
              </div>
            ) : (
              <>
                <Section title={`Element: ${selectedEl.type}`}>
                  {/* Position */}
                  <Row label="X (px)">
                    <input type="number" value={selectedEl.x || 0} onChange={e => updateElement({ x: +e.target.value })} style={input()} />
                  </Row>
                  <Row label="Y (px)">
                    <input type="number" value={selectedEl.y || 0} onChange={e => updateElement({ y: +e.target.value })} style={input()} />
                  </Row>
                  <Row label="Opacity">
                    <input type="range" min={0} max={100} value={selectedEl.opacity ?? 100} onChange={e => updateElement({ opacity: +e.target.value })} style={{ width: '100%' }} />
                  </Row>
                </Section>

                {/* Text props */}
                {TEXT_TYPES.includes(selectedEl.type) && (
                  <Section title="Văn bản">
                    <Row label="Nội dung">
                      <textarea value={selectedEl.text || ''} onChange={e => updateElement({ text: e.target.value })} rows={3} style={input({ resize: 'vertical' })} />
                    </Row>
                    <Row label="Font">
                      <select value={selectedEl.font || 'Inter'} onChange={e => updateElement({ font: e.target.value })} style={input()}>
                        {FONT_OPTIONS.map(f => <option key={f}>{f}</option>)}
                      </select>
                    </Row>
                    <Row label="Cỡ chữ">
                      <input type="number" value={selectedEl.size || 16} onChange={e => updateElement({ size: +e.target.value })} style={input()} />
                    </Row>
                    <Row label="Màu chữ">
                      <div style={{ display: 'flex', gap: 6 }}>
                        <input type="color" value={selectedEl.color || '#ffffff'} onChange={e => updateElement({ color: e.target.value })} style={{ width: 36, height: 30, border: 'none', cursor: 'pointer', background: 'none' }} />
                        <input type="text" value={selectedEl.color || '#ffffff'} onChange={e => updateElement({ color: e.target.value })} style={input({ flex: 1 })} />
                      </div>
                    </Row>
                    <Row label="Độ rộng">
                      <input type="number" value={selectedEl.width || 200} onChange={e => updateElement({ width: +e.target.value })} style={input()} />
                    </Row>
                    <Row label="Font weight">
                      <select value={selectedEl.weight || 'normal'} onChange={e => updateElement({ weight: e.target.value })} style={input()}>
                        {['300', 'normal', '500', '600', 'bold', '700'].map(w => <option key={w} value={w}>{w}</option>)}
                      </select>
                    </Row>
                    <Row label="Align">
                      <select value={selectedEl.align || 'left'} onChange={e => updateElement({ align: e.target.value })} style={input()}>
                        {['left', 'center', 'right'].map(a => <option key={a}>{a}</option>)}
                      </select>
                    </Row>
                    <Row label="Italic">
                      <input type="checkbox" checked={selectedEl.style === 'italic'} onChange={e => updateElement({ style: e.target.checked ? 'italic' : 'normal' })} />
                    </Row>
                  </Section>
                )}

                {/* Avatar props */}
                {selectedEl.type === 'avatar' && (
                  <Section title="Avatar">
                    <Row label="Kích thước">
                      <input type="range" min={40} max={300} value={selectedEl.size || 150} onChange={e => updateElement({ size: +e.target.value })} style={{ width: '100%' }} />
                    </Row>
                    <Row label="">
                      <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{selectedEl.size || 150}px</span>
                    </Row>
                    <Row label="Hình dạng">
                      <div style={{ display: 'flex', gap: 4 }}>
                        {AVATAR_SHAPES.map(s => (
                          <button key={s.value} onClick={() => updateElement({ shape: s.value })} style={{
                            width: 32, height: 32, borderRadius: 6, border: `2px solid ${selectedEl.shape === s.value ? 'var(--color-accent-2)' : 'var(--color-border)'}`,
                            background: 'var(--color-surface-2)', color: 'var(--color-text)', fontSize: 14, cursor: 'pointer',
                          }}>{s.label}</button>
                        ))}
                      </div>
                    </Row>
                    <Row label="Viền">
                      <input type="range" min={0} max={20} value={selectedEl.borderW || 0} onChange={e => updateElement({ borderW: +e.target.value })} style={{ width: '100%' }} />
                    </Row>
                    <Row label="Màu viền">
                      <div style={{ display: 'flex', gap: 6 }}>
                        <input type="color" value={selectedEl.borderColor || '#ffffff'} onChange={e => updateElement({ borderColor: e.target.value })} style={{ width: 36, height: 30, border: 'none', cursor: 'pointer', background: 'none' }} />
                        <select value={selectedEl.borderStyle || 'solid'} onChange={e => updateElement({ borderStyle: e.target.value })} style={input()}>
                          {BORDER_STYLES.map(s => <option key={s}>{s}</option>)}
                        </select>
                      </div>
                    </Row>
                    <Row label="Nền">
                      <input type="color" value={selectedEl.bg || '#1565c0'} onChange={e => updateElement({ bg: e.target.value })} style={{ width: 36, height: 30, border: 'none', cursor: 'pointer', background: 'none' }} />
                    </Row>
                  </Section>
                )}

                {/* Shape props */}
                {['rect', 'circle', 'line'].includes(selectedEl.type) && (
                  <Section title="Hình trang trí">
                    <Row label="Màu">
                      <div style={{ display: 'flex', gap: 6 }}>
                        <input type="color" value={selectedEl.color || '#ffffff'} onChange={e => updateElement({ color: e.target.value })} style={{ width: 36, height: 30, border: 'none', cursor: 'pointer', background: 'none' }} />
                        <input type="text" value={selectedEl.color || '#ffffff'} onChange={e => updateElement({ color: e.target.value })} style={input({ flex: 1 })} />
                      </div>
                    </Row>
                    {selectedEl.type === 'rect' && <>
                      <Row label="Rộng"><input type="number" value={selectedEl.width || 200} onChange={e => updateElement({ width: +e.target.value })} style={input()} /></Row>
                      <Row label="Cao"><input type="number" value={selectedEl.height || 60} onChange={e => updateElement({ height: +e.target.value })} style={input()} /></Row>
                      <Row label="Bo góc"><input type="number" value={selectedEl.borderRadius || 0} onChange={e => updateElement({ borderRadius: +e.target.value })} style={input()} /></Row>
                    </>}
                    {selectedEl.type === 'circle' && <Row label="Kích thước"><input type="number" value={selectedEl.size || 60} onChange={e => updateElement({ size: +e.target.value })} style={input()} /></Row>}
                    {selectedEl.type === 'line' && <>
                      <Row label="Dài"><input type="number" value={selectedEl.width || 300} onChange={e => updateElement({ width: +e.target.value })} style={input()} /></Row>
                      <Row label="Dày"><input type="number" value={selectedEl.thickness || 2} onChange={e => updateElement({ thickness: +e.target.value })} style={input()} /></Row>
                    </>}
                  </Section>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const iconBtn = (bg = 'transparent', color = 'var(--color-text-muted)') => ({
  width: 22, height: 22, borderRadius: 4, border: 'none',
  background: bg, color, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: 0,
});

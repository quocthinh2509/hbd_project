import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Designer/Sidebar';
import Toolbar from '../../components/Designer/Toolbar';
import SaveModal from '../../components/Designer/SaveModal';
import PreviewModal from '../../components/Designer/PreviewModal';
import { templateApi } from '../../api';

// Vertical render of canvas elements for the canvas area
import { ELEMENT_DEFAULTS, TEXT_TYPES } from '../../components/Designer/Canvas';

const DEFAULT_CANVAS = {
  card: { width: 800, height: 450, background: 'linear-gradient(135deg, #0a3d7a, #1565c0)', borderRadius: '8px' },
  elements: [],
};

// ── Inline Canvas Renderer ──────────────────────────────────────
function LiveCanvas({ canvasJson, selectedId, setSelectedId, setCanvasJson }) {
  const card = canvasJson.card || {};
  const elements = canvasJson.elements || [];

  const onDragEnd = (id, x, y) =>
    setCanvasJson(prev => ({
      ...prev,
      elements: prev.elements.map(el => el.id === id ? { ...el, x: Math.round(x), y: Math.round(y) } : el),
    }));

  const getShape = (el) => {
    const shapeClip = {
      circle: 'circle(50%)',
      hexagon: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
      diamond: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
      star: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
    };
    const shapeBr = { square: '0', rounded: '16px' };
    return { clipPath: shapeClip[el.shape], borderRadius: shapeBr[el.shape] };
  };

  return (
    <div onClick={() => setSelectedId(null)} style={{
      position: 'relative',
      width: card.width || 800,
      height: card.height || 450,
      background: card.background || '#1565c0',
      borderRadius: card.borderRadius || 8,
      overflow: 'hidden',
      boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      flexShrink: 0,
    }}>
      {elements.map(el => {
        const isSelected = selectedId === el.id;
        const opacity = (el.opacity ?? 100) / 100;
        const base = {
          position: 'absolute', left: el.x, top: el.y, opacity,
          cursor: 'move',
          outline: isSelected ? '2px solid #2d8ef5' : '2px solid transparent',
          outlineOffset: 2, userSelect: 'none',
        };

        const onMouseDown = (e) => {
          e.stopPropagation();
          setSelectedId(el.id);
          const sx = e.clientX - el.x, sy = e.clientY - el.y;
          const mv = (ev) => onDragEnd(el.id, ev.clientX - sx, ev.clientY - sy);
          const up = () => { window.removeEventListener('mousemove', mv); window.removeEventListener('mouseup', up); };
          window.addEventListener('mousemove', mv);
          window.addEventListener('mouseup', up);
        };

        if (TEXT_TYPES.includes(el.type)) {
          return (
            <div key={el.id} onMouseDown={onMouseDown} style={{
              ...base, width: el.width || 200,
              fontFamily: `${el.font || 'Inter'}, sans-serif`,
              fontSize: el.size || 16, color: el.color || '#fff',
              fontWeight: el.weight || 'normal', fontStyle: el.style || 'normal',
              textAlign: el.align || 'left', lineHeight: 1.4, whiteSpace: 'pre-wrap', wordWrap: 'break-word',
            }}>{el.text}</div>
          );
        }

        if (el.type === 'avatar') {
          const sz = el.size || 150;
          const { clipPath, borderRadius } = getShape(el);
          return (
            <div key={el.id} onMouseDown={onMouseDown} style={{
              ...base, width: sz, height: sz,
              background: el.bg || '#1565c0',
              clipPath, borderRadius, overflow: 'hidden',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: el.borderW ? `0 0 0 ${el.borderW}px ${el.borderColor || '#fff'}` : undefined,
            }}>
              <svg width={sz * 0.4} height={sz * 0.4} viewBox="0 0 24 24" fill={el.borderColor || '#ffffff66'}>
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
              </svg>
            </div>
          );
        }

        if (el.type === 'rect') return <div key={el.id} onMouseDown={onMouseDown} style={{ ...base, width: el.width || 200, height: el.height || 60, background: el.color || '#ffffff22', borderRadius: el.borderRadius || 0 }} />;
        if (el.type === 'circle') { const d = el.size || 60; return <div key={el.id} onMouseDown={onMouseDown} style={{ ...base, width: d, height: d, background: el.color || '#ffffff22', borderRadius: '50%' }} />; }
        if (el.type === 'line') return <div key={el.id} onMouseDown={onMouseDown} style={{ ...base, width: el.width || 300, height: el.thickness || 2, background: el.color || '#ffffff44' }} />;
        return null;
      })}
    </div>
  );
}

export default function DesignerPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [canvasJson, setCanvasJson] = useState(DEFAULT_CANVAS);
  const [selectedId, setSelectedId] = useState(null);
  const [showSave, setShowSave] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [templateMeta, setTemplateMeta] = useState({ name: '', description: '', tags: [] });
  const [loading, setLoading] = useState(!!id);

  // Load existing template
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    templateApi.get(id).then(({ data }) => {
      setCanvasJson(typeof data.canvas_json === 'string' ? JSON.parse(data.canvas_json) : data.canvas_json);
      setTemplateMeta({ name: data.name, description: data.description || '', tags: data.tags || [] });
    }).catch(() => navigate('/templates')).finally(() => setLoading(false));
  }, [id]);

  const addElement = useCallback((type) => {
    const defaults = ELEMENT_DEFAULTS[type] || {};
    setCanvasJson(prev => ({
      ...prev,
      elements: [...(prev.elements || []), { id: `el_${Date.now()}`, type, x: 40, y: 40, opacity: 100, ...defaults }],
    }));
  }, []);

  const handleSave = async ({ name, description, tag_ids }) => {
    const payload = { name, description, canvas_json: canvasJson, tag_ids };
    if (id) {
      await templateApi.update(id, payload);
    } else {
      const { data } = await templateApi.create(payload);
      navigate(`/templates/${data.id}/edit`, { replace: true });
    }
  };

  const handleDuplicate = async () => {
    if (!id) return;
    const { data } = await templateApi.duplicate(id);
    navigate(`/templates/${data.id}/edit`);
  };

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(canvasJson, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `canvas_${Date.now()}.json`; a.click();
  };

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--color-text-muted)' }}>Loading...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Toolbar */}
      <Toolbar
        canvasJson={canvasJson}
        templateId={id}
        onSave={() => setShowSave(true)}
        onPreview={() => setShowPreview(true)}
        onDuplicate={handleDuplicate}
        onExportJson={handleExportJson}
      />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Sidebar */}
        <Sidebar
          canvasJson={canvasJson}
          setCanvasJson={setCanvasJson}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          onAddElement={addElement}
        />

        {/* Canvas area */}
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'var(--color-bg)', overflow: 'auto',
          backgroundImage: 'radial-gradient(var(--color-border) 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}>
          <LiveCanvas
            canvasJson={canvasJson}
            selectedId={selectedId}
            setSelectedId={setSelectedId}
            setCanvasJson={setCanvasJson}
          />
        </div>
      </div>

      {/* Modals */}
      {showSave && (
        <SaveModal
          onClose={() => setShowSave(false)}
          onSave={handleSave}
          initialName={templateMeta.name}
          initialDescription={templateMeta.description}
          initialTagIds={templateMeta.tags.map(t => t.id)}
        />
      )}
      {showPreview && <PreviewModal canvasJson={canvasJson} onClose={() => setShowPreview(false)} />}
    </div>
  );
}

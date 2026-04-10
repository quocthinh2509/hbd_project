import { useState, useRef, useCallback } from 'react';

const ELEMENT_DEFAULTS = {
  text:     { text: 'Text mới', font: 'Inter', size: 20, color: '#ffffff', weight: 'normal', style: 'normal', align: 'left', width: 200 },
  name:     { text: '{{name}}', font: 'Georgia', size: 36, color: '#ffffff', weight: 'bold', style: 'normal', align: 'left', width: 300 },
  wish:     { text: '{{wish}}', font: 'Georgia', size: 16, color: '#e3f2fd', weight: 'normal', style: 'italic', align: 'left', width: 480 },
  dept:     { text: '{{department}}', font: 'Inter', size: 14, color: '#90caf9', weight: 'normal', style: 'normal', align: 'left', width: 200 },
  date:     { text: '{{birthday}}', font: 'Inter', size: 14, color: '#90caf9', weight: 'normal', style: 'normal', align: 'left', width: 150 },
  position: { text: '{{position}}', font: 'Inter', size: 14, color: '#90caf9', weight: 'normal', style: 'normal', align: 'left', width: 200 },
  logo:     { text: 'FPT Telecom', font: 'Inter', size: 14, color: '#ffffff', weight: '700', style: 'normal', align: 'center', width: 120 },
  avatar:   { size: 150, shape: 'circle', borderW: 3, borderColor: '#ffffff', borderStyle: 'solid', bg: '#1565c0' },
  rect:     { width: 200, height: 60, color: '#ffffff22', borderRadius: 8 },
  circle:   { size: 60, color: '#ffffff22' },
  line:     { width: 300, thickness: 2, color: '#ffffff44' },
};

const TEXT_TYPES = ['text', 'name', 'wish', 'dept', 'date', 'position', 'logo'];

/**
 * Renders a single element on the canvas (live preview)
 */
function CanvasElement({ el, isSelected, onSelect, onDragEnd }) {
  const dragRef = useRef(null);

  const onMouseDown = (e) => {
    e.stopPropagation();
    onSelect(el.id);
    const startX = e.clientX - el.x;
    const startY = e.clientY - el.y;

    const onMove = (ev) => {
      onDragEnd(el.id, ev.clientX - startX, ev.clientY - startY);
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const opacity = (el.opacity !== undefined ? el.opacity : 100) / 100;

  const baseStyle = {
    position: 'absolute',
    left: el.x, top: el.y,
    opacity,
    cursor: 'move',
    outline: isSelected ? '2px solid #2d8ef5' : '2px solid transparent',
    outlineOffset: 2,
    userSelect: 'none',
  };

  // Text elements
  if (TEXT_TYPES.includes(el.type)) {
    return (
      <div onMouseDown={onMouseDown} style={{
        ...baseStyle,
        width: el.width || 200,
        fontFamily: el.font || 'Inter',
        fontSize: el.size || 16,
        color: el.color || '#ffffff',
        fontWeight: el.weight || 'normal',
        fontStyle: el.style || 'normal',
        textAlign: el.align || 'left',
        lineHeight: 1.4,
        wordWrap: 'break-word',
        whiteSpace: 'pre-wrap',
      }}>
        {el.text}
      </div>
    );
  }

  // Avatar
  if (el.type === 'avatar') {
    const size = el.size || 150;
    const shapeClip = {
      circle:  'circle(50% at 50% 50%)',
      hexagon: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
      diamond: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
      star:    'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
    };
    const shapeBr = { square: '0px', rounded: '16px' };

    return (
      <div onMouseDown={onMouseDown} style={{
        ...baseStyle,
        width: size, height: size,
        background: el.bg || '#1565c0',
        clipPath: shapeClip[el.shape] || undefined,
        borderRadius: shapeBr[el.shape] || undefined,
        overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: el.borderW ? `0 0 0 ${el.borderW}px ${el.borderColor || '#fff'}` : undefined,
      }}>
        <svg width={size * 0.45} height={size * 0.45} viewBox="0 0 24 24" fill={el.borderColor || '#ffffff88'}>
          <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
        </svg>
      </div>
    );
  }

  // Rect shape
  if (el.type === 'rect') {
    return (
      <div onMouseDown={onMouseDown} style={{ ...baseStyle, width: el.width || 200, height: el.height || 60, background: el.color || '#ffffff22', borderRadius: el.borderRadius || 0 }} />
    );
  }

  // Circle shape
  if (el.type === 'circle') {
    const d = el.size || 60;
    return (
      <div onMouseDown={onMouseDown} style={{ ...baseStyle, width: d, height: d, background: el.color || '#ffffff22', borderRadius: '50%' }} />
    );
  }

  // Line shape
  if (el.type === 'line') {
    return (
      <div onMouseDown={onMouseDown} style={{ ...baseStyle, width: el.width || 300, height: el.thickness || 2, background: el.color || '#ffffff44' }} />
    );
  }

  return null;
}

/**
 * Main Canvas component
 */
export default function Canvas({ canvasJson, setCanvasJson, selectedId, setSelectedId }) {
  const card = canvasJson.card || {};
  const elements = canvasJson.elements || [];

  const addElement = useCallback((type) => {
    const defaults = ELEMENT_DEFAULTS[type] || {};
    const newEl = {
      id: `el_${Date.now()}`,
      type,
      x: 40, y: 40,
      opacity: 100,
      ...defaults,
    };
    setCanvasJson(prev => ({ ...prev, elements: [...(prev.elements || []), newEl] }));
    setSelectedId(newEl.id);
  }, [setCanvasJson, setSelectedId]);

  const updateElementPos = useCallback((id, x, y) => {
    setCanvasJson(prev => ({
      ...prev,
      elements: prev.elements.map(el => el.id === id ? { ...el, x: Math.round(x), y: Math.round(y) } : el),
    }));
  }, [setCanvasJson]);

  return { addElement, canvasView: (
    <div
      style={{
        position: 'relative',
        width: card.width || 800,
        height: card.height || 450,
        background: card.background || 'linear-gradient(135deg, #0a3d7a, #1565c0)',
        borderRadius: card.borderRadius || 8,
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        flexShrink: 0,
      }}
      onClick={() => setSelectedId(null)}
    >
      {elements.map(el => (
        <CanvasElement
          key={el.id}
          el={el}
          isSelected={selectedId === el.id}
          onSelect={setSelectedId}
          onDragEnd={updateElementPos}
        />
      ))}
    </div>
  )};
}

export { ELEMENT_DEFAULTS, TEXT_TYPES };

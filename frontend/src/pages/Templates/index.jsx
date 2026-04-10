import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Copy, Trash2, Pencil, Tag as TagIcon } from 'lucide-react';
import { templateApi, tagApi } from '../../api';

function TemplateCard({ template, tags, onDuplicate, onDelete }) {
  const navigate = useNavigate();
  const templateTags = tags.filter(t => template.tags?.some(tt => tt.id === t.id));

  return (
    <div style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 12,
      overflow: 'hidden',
      transition: 'border-color 0.2s, transform 0.2s',
      cursor: 'pointer',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      {/* Thumbnail */}
      <div style={{
        height: 160, background: 'var(--color-surface-2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative',
      }}
        onClick={() => navigate(`/templates/${template.id}/edit`)}
      >
        {template.thumbnail_url
          ? <img src={template.thumbnail_url} alt={template.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
              <LayoutTemplateIcon />
              <div style={{ fontSize: 12, marginTop: 6 }}>No preview</div>
            </div>
        }
        {!template.is_active && (
          <div style={{
            position: 'absolute', top: 8, right: 8,
            background: '#ef4444', color: 'white', fontSize: 10,
            padding: '2px 8px', borderRadius: 4, fontWeight: 600,
          }}>INACTIVE</div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '14px 16px' }}>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4, color: 'var(--color-text)' }}>
          {template.name}
        </div>
        {template.description && (
          <div style={{ fontSize: 12, color: 'var(--color-text-muted)', marginBottom: 8, lineHeight: 1.4 }}>
            {template.description}
          </div>
        )}

        {/* Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
          {template.tags?.map(tag => (
            <span key={tag.id} style={{
              background: tag.color ? `${tag.color}22` : 'var(--color-surface-2)',
              color: tag.color || 'var(--color-text-muted)',
              border: `1px solid ${tag.color || 'var(--color-border)'}44`,
              fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 500,
            }}>{tag.name}</span>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => navigate(`/templates/${template.id}/edit`)} style={btnStyle('#185FA5')}>
            <Pencil size={12} /> Edit
          </button>
          <button onClick={() => onDuplicate(template.id)} style={btnStyle('#22263a')}>
            <Copy size={12} /> Clone
          </button>
          <button onClick={() => onDelete(template.id)} style={btnStyle('#ef444422', '#ef4444')}>
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

function LayoutTemplateIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <path d="M3 9h18M9 21V9"/>
    </svg>
  );
}

const btnStyle = (bg, color = 'white') => ({
  display: 'flex', alignItems: 'center', gap: 4,
  padding: '5px 10px', borderRadius: 6, border: 'none',
  background: bg, color, fontSize: 12, cursor: 'pointer',
  fontWeight: 500, transition: 'opacity 0.15s',
});

export default function TemplatesPage() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [tags, setTags] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [filterActive, setFilterActive] = useState('');

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const params = { search: search || undefined, tag: filterTag || undefined };
      if (filterActive !== '') params.is_active = filterActive;
      const { data } = await templateApi.list(params);
      setTemplates(data.data);
      setTotal(data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { tagApi.list().then(r => setTags(r.data.data || r.data)); }, []);
  useEffect(() => { fetchTemplates(); }, [search, filterTag, filterActive]);

  const handleDuplicate = async (id) => {
    await templateApi.duplicate(id);
    fetchTemplates();
  };

  const handleDelete = async (id) => {
    if (!confirm('Ẩn template này?')) return;
    await templateApi.delete(id);
    fetchTemplates();
  };

  return (
    <div style={{ padding: 32 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Templates</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14, margin: '4px 0 0' }}>
            {total} template{total !== 1 ? 's' : ''} found
          </p>
        </div>
        <button
          onClick={() => navigate('/templates/new')}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 18px', borderRadius: 8, border: 'none',
            background: 'var(--color-accent)', color: 'white',
            fontWeight: 600, fontSize: 14, cursor: 'pointer',
          }}
        >
          <Plus size={16} /> New Template
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input
            type="text" placeholder="Tìm kiếm template..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={inputStyle({ paddingLeft: 36 })}
          />
        </div>
        <select value={filterTag} onChange={e => setFilterTag(e.target.value)} style={inputStyle({ width: 200 })}>
          <option value="">All Tags</option>
          {(tags || []).map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
        </select>
        <select value={filterActive} onChange={e => setFilterActive(e.target.value)} style={inputStyle({ width: 150 })}>
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 80, color: 'var(--color-text-muted)' }}>Loading...</div>
      ) : templates.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 80, color: 'var(--color-text-muted)' }}>
          <p>No templates found.</p>
          <button onClick={() => navigate('/templates/new')} style={{ ...btnStyle('var(--color-accent)'), marginTop: 12, padding: '10px 20px' }}>
            <Plus size={14} /> Create first template
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 20,
        }}>
          {templates.map(t => (
            <TemplateCard key={t.id} template={t} tags={tags} onDuplicate={handleDuplicate} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

const inputStyle = (extra = {}) => ({
  background: 'var(--color-surface)',
  border: '1px solid var(--color-border)',
  borderRadius: 8, padding: '9px 12px',
  color: 'var(--color-text)', fontSize: 13,
  outline: 'none', width: '100%',
  ...extra,
});

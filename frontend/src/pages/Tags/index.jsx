import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Check } from 'lucide-react';
import { tagApi } from '../../api';

const TAG_COLORS = ['#185FA5', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

function TagRow({ tag, onEdit, onDelete }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 16px', borderRadius: 10, marginBottom: 6,
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
    }}>
      <div style={{ width: 12, height: 12, borderRadius: '50%', background: tag.color || '#888', flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 13 }}>{tag.name}</div>
        {tag.description && <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{tag.description}</div>}
      </div>
      <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{tag.template_count || 0} templates</div>
      <button onClick={() => onEdit(tag)} style={iconBtn}><Edit2 size={13} /></button>
      <button onClick={() => onDelete(tag.id)} style={{ ...iconBtn, color: '#ef4444' }}><Trash2 size={13} /></button>
    </div>
  );
}

function TagForm({ tag, onSave, onCancel }) {
  const [name, setName] = useState(tag?.name || '');
  const [color, setColor] = useState(tag?.color || TAG_COLORS[0]);
  const [description, setDescription] = useState(tag?.description || '');
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!name.trim()) { setError('Tên tag không được để trống'); return; }
    if (!/^[a-z0-9-]+$/.test(name)) { setError('Tên tag phải là slug (chữ thường, số, dấu gạch ngang)'); return; }
    try {
      await onSave({ name: name.trim(), color, description: description.trim() });
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    }
  };

  return (
    <div style={{
      background: 'var(--color-surface-2)', border: '1px solid var(--color-accent)',
      borderRadius: 10, padding: 16, marginBottom: 12,
    }}>
      {error && <div style={{ color: '#ef4444', fontSize: 12, marginBottom: 10 }}>{error}</div>}
      <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
        <input type="text" placeholder="slug-name (vd: fpt-birthday)" value={name} onChange={e => setName(e.target.value.toLowerCase())} style={{ ...inp, flex: 1 }} />
        <input type="text" placeholder="Mô tả" value={description} onChange={e => setDescription(e.target.value)} style={{ ...inp, flex: 2 }} />
      </div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        {TAG_COLORS.map(c => (
          <button key={c} onClick={() => setColor(c)} style={{
            width: 24, height: 24, borderRadius: '50%', background: c, border: `3px solid ${color === c ? 'white' : 'transparent'}`,
            cursor: 'pointer', boxShadow: color === c ? `0 0 0 2px ${c}` : 'none',
          }} />
        ))}
        <input type="color" value={color} onChange={e => setColor(e.target.value)} style={{ width: 24, height: 24, borderRadius: '50%', border: 'none', cursor: 'pointer', background: 'none' }} />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={handleSave} style={saveBtn}><Check size={13} /> Lưu</button>
        <button onClick={onCancel} style={cancelBtn}><X size={13} /> Hủy</button>
      </div>
    </div>
  );
}

export default function TagsPage() {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editTag, setEditTag] = useState(null);

  const load = () => {
    setLoading(true);
    tagApi.list().then(r => setTags(r.data.data || r.data)).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleSave = async (data) => {
    if (editTag) await tagApi.update(editTag.id, data);
    else await tagApi.create(data);
    setShowForm(false); setEditTag(null); load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Xóa tag này? Tag sẽ bị xóa khỏi tất cả template.')) return;
    await tagApi.delete(id); load();
  };

  const handleEdit = (tag) => { setEditTag(tag); setShowForm(true); };

  return (
    <div style={{ padding: 32, maxWidth: 800 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Tags</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14, margin: '4px 0 0' }}>Quản lý và phân loại template</p>
        </div>
        <button onClick={() => { setEditTag(null); setShowForm(true); }} style={addBtn}>
          <Plus size={15} /> Tạo Tag
        </button>
      </div>

      {showForm && <TagForm tag={editTag} onSave={handleSave} onCancel={() => { setShowForm(false); setEditTag(null); }} />}

      {loading ? (
        <div style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: 60 }}>Loading...</div>
      ) : tags.length === 0 ? (
        <div style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: 60 }}>Chưa có tag nào.</div>
      ) : (
        tags.map(tag => <TagRow key={tag.id} tag={tag} onEdit={handleEdit} onDelete={handleDelete} />)
      )}
    </div>
  );
}

const inp = { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 7, color: 'var(--color-text)', fontSize: 12, padding: '7px 10px', outline: 'none' };
const iconBtn = { background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: 4 };
const saveBtn = { display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 7, border: 'none', background: 'var(--color-accent)', color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer' };
const cancelBtn = { display: 'flex', alignItems: 'center', gap: 5, padding: '7px 12px', borderRadius: 7, border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-text)', fontSize: 12, cursor: 'pointer' };
const addBtn = { display: 'flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 8, border: 'none', background: 'var(--color-accent)', color: 'white', fontWeight: 600, fontSize: 13, cursor: 'pointer' };

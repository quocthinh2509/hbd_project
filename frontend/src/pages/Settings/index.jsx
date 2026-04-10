import { useState } from 'react';
import { Copy, Eye, EyeOff, Shield, Zap, Server } from 'lucide-react';

export default function SettingsPage() {
  const [showKey, setShowKey] = useState(false);
  const apiKey = import.meta.env.VITE_API_KEY || '(configured in .env)';

  const copy = (text) => { navigator.clipboard.writeText(text); };

  return (
    <div style={{ padding: 32, maxWidth: 700 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 4px' }}>Settings</h1>
      <p style={{ color: 'var(--color-text-muted)', fontSize: 14, marginBottom: 32 }}>Cấu hình hệ thống</p>

      {/* API Key */}
      <Card icon={Shield} title="API Authentication">
        <Label>X-API-Key</Label>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ flex: 1, background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '9px 12px', fontSize: 13, fontFamily: 'monospace', letterSpacing: showKey ? 0 : '0.2em', color: 'var(--color-text)' }}>
            {showKey ? apiKey : '●'.repeat(Math.min(apiKey.length, 32))}
          </div>
          <button onClick={() => setShowKey(s => !s)} style={iconBtn}>{showKey ? <EyeOff size={14} /> : <Eye size={14} />}</button>
          <button onClick={() => copy(apiKey)} style={iconBtn}><Copy size={14} /></button>
        </div>
        <p style={hint}>API Key được cấu hình trong biến môi trường <code>API_KEY_SECRET</code> trên server và <code>VITE_API_KEY</code> trên frontend.</p>
      </Card>

      {/* API URLs */}
      <Card icon={Server} title="API Endpoints">
        {[
          ['POST /api/v1/render', 'Render thiệp từ tag + data → binary PNG'],
          ['POST /api/v1/preview', 'Preview từ canvas_json → base64'],
          ['GET /api/v1/templates', 'Danh sách template'],
          ['GET /api/v1/tags', 'Danh sách tag'],
          ['GET /api/v1/logs', 'Render logs'],
          ['GET /api/v1/health', 'Health check (no auth)'],
        ].map(([ep, desc]) => (
          <div key={ep} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid var(--color-border)' }}>
            <code style={{ fontSize: 12, color: 'var(--color-accent-2)' }}>{ep}</code>
            <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{desc}</span>
          </div>
        ))}
      </Card>

      {/* n8n Integration */}
      <Card icon={Zap} title="n8n Integration Guide">
        <pre style={{ background: 'var(--color-bg)', borderRadius: 8, padding: 14, fontSize: 12, overflow: 'auto', color: 'var(--color-text)', lineHeight: 1.6 }}>{`// HTTP Request node settings:
Method: POST
URL: http://your-server:3000/api/v1/render
Header: X-API-Key: <your-api-key>
Response Format: File (Binary)

// Body:
{
  "tag": "fpt-telecom-birthday",
  "data": {
    "name": "{{ $json.fullName }}",
    "birthday": "{{ $json.dob }}",
    "department": "{{ $json.department }}",
    "position": "{{ $json.position }}",
    "wish": "{{ $json.ai_wish }}",
    "avatar_url": "{{ $json.avatar_url }}"
  }
}`}</pre>
      </Card>
    </div>
  );
}

function Card({ icon: Icon, title, children }) {
  return (
    <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 20, marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <Icon size={18} color="var(--color-accent-2)" />
        <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}
function Label({ children }) { return <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{children}</div>; }
const hint = { fontSize: 12, color: 'var(--color-text-muted)', marginTop: 8 };
const iconBtn = { background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)', borderRadius: 7, cursor: 'pointer', padding: 7, display: 'flex', alignItems: 'center' };

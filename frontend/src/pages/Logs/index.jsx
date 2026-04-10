import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { logApi } from '../../api';

function StatusBadge({ status }) {
  const ok = status === 'success';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
      background: ok ? '#22c55e22' : '#ef444422',
      color: ok ? '#22c55e' : '#ef4444',
      border: `1px solid ${ok ? '#22c55e44' : '#ef444444'}`,
    }}>
      {ok ? <CheckCircle size={11} /> : <XCircle size={11} />}
      {status}
    </span>
  );
}

export default function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  const load = () => {
    setLoading(true);
    logApi.list({ status: statusFilter || undefined, limit: 100 })
      .then(r => { setLogs(r.data.data); setTotal(r.data.total); })
      .finally(() => setLoading(false));
  };
  useEffect(load, [statusFilter]);

  const formatDuration = (ms) => ms ? `${ms}ms` : '—';
  const formatDate = (ts) => ts ? new Date(ts).toLocaleString('vi-VN') : '—';

  return (
    <div style={{ padding: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Render Logs</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: 14, margin: '4px 0 0' }}>{total} bản ghi</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={sel}>
            <option value="">All Status</option>
            <option value="success">Success</option>
            <option value="error">Error</option>
          </select>
          <button onClick={load} style={refreshBtn}><RefreshCw size={14} /></button>
        </div>
      </div>

      {loading ? (
        <div style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: 60 }}>Loading...</div>
      ) : (
        <div style={{ background: 'var(--color-surface)', borderRadius: 12, border: '1px solid var(--color-border)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                {['Thời gian', 'Nhân viên', 'Template', 'Status', 'Thời lượng', 'Lỗi'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <>
                  <tr key={log.id}
                    onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                    style={{ borderBottom: '1px solid var(--color-border)', cursor: 'pointer', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--color-surface-2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={td}>{formatDate(log.created_at)}</td>
                    <td style={td}>{log.employee_name || '—'}</td>
                    <td style={td}>{log.template_name || '—'}</td>
                    <td style={td}><StatusBadge status={log.status} /></td>
                    <td style={td}>{formatDuration(log.duration_ms)}</td>
                    <td style={{ ...td, color: '#ef4444', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.error_msg || '—'}</td>
                  </tr>
                  {expandedId === log.id && (
                    <tr key={`${log.id}-detail`}>
                      <td colSpan={6} style={{ padding: '0 16px 16px', background: 'var(--color-surface-2)' }}>
                        <pre style={{ fontSize: 11, color: 'var(--color-text-muted)', whiteSpace: 'pre-wrap', margin: '12px 0 0', padding: 12, background: 'var(--color-bg)', borderRadius: 6, overflowX: 'auto' }}>
                          {JSON.stringify(log.payload, null, 2)}
                        </pre>
                      </td>
                    </tr>
                  )}
                </>
              ))}
              {!logs.length && (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 48, color: 'var(--color-text-muted)' }}>Không có log nào.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const td = { padding: '11px 16px', whiteSpace: 'nowrap' };
const sel = { background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 7, color: 'var(--color-text)', fontSize: 12, padding: '7px 10px', outline: 'none' };
const refreshBtn = { display: 'flex', alignItems: 'center', padding: '7px', borderRadius: 7, border: '1px solid var(--color-border)', background: 'transparent', color: 'var(--color-text-muted)', cursor: 'pointer' };

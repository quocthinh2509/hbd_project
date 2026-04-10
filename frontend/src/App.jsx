import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { LayoutTemplate, Tag, Activity, Settings, Pencil } from 'lucide-react';
import TemplatesPage from './pages/Templates';
import DesignerPage from './pages/Designer';
import TagsPage from './pages/Tags';
import LogsPage from './pages/Logs';
import SettingsPage from './pages/Settings';
import './index.css';

const NAV_ITEMS = [
  { to: '/templates', icon: LayoutTemplate, label: 'Templates' },
  { to: '/tags',      icon: Tag,            label: 'Tags' },
  { to: '/logs',      icon: Activity,       label: 'Logs' },
  { to: '/settings',  icon: Settings,       label: 'Settings' },
];

function Sidebar() {
  return (
    <aside style={{
      width: '220px', minWidth: '220px',
      background: 'var(--color-surface)',
      borderRight: '1px solid var(--color-border)',
      display: 'flex', flexDirection: 'column',
      padding: '24px 0',
    }}>
      {/* Logo */}
      <div style={{ padding: '0 20px 28px', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #185FA5, #2d8ef5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Pencil size={18} color="white" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-text)' }}>Birthday Card</div>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>FPT Telecom</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ padding: '16px 12px', flex: 1 }}>
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', borderRadius: 8, marginBottom: 4,
            textDecoration: 'none',
            color: isActive ? 'white' : 'var(--color-text-muted)',
            background: isActive ? 'var(--color-accent)' : 'transparent',
            fontWeight: isActive ? 600 : 400, fontSize: 14,
            transition: 'all 0.15s ease',
          })}>
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: '16px 20px', borderTop: '1px solid var(--color-border)' }}>
        <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>v1.0 – 04/2026</div>
      </div>
    </aside>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        <Sidebar />
        <main style={{ flex: 1, overflow: 'auto', background: 'var(--color-bg)' }}>
          <Routes>
            <Route path="/" element={<Navigate to="/templates" replace />} />
            <Route path="/templates" element={<TemplatesPage />} />
            <Route path="/templates/new" element={<DesignerPage />} />
            <Route path="/templates/:id/edit" element={<DesignerPage />} />
            <Route path="/tags" element={<TagsPage />} />
            <Route path="/logs" element={<LogsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

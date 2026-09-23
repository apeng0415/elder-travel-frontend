import { NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useApp } from '@/store/store-context';
import { MessageCircle, BedDouble, HeartPulse, User, LogOut } from 'lucide-react';

const TABS = [
  { to: '/elder', end: true, label: 'AI 助手', icon: MessageCircle },
  { to: '/elder/homestays', label: '找民宿', icon: BedDouble },
  { to: '/elder/health', label: '健康', icon: HeartPulse },
  { to: '/elder/me', label: '我的', icon: User },
];

export default function ElderlyLayout() {
  const { logout } = useApp();
  const navigate = useNavigate();

  // 直接从 localStorage 读登录信息（不依赖 useApp 的 currentUser）
  const storedRole = localStorage.getItem('role');
  const storedUsername = localStorage.getItem('username');

  // 没登录，或者不是老人，弹回登录页
  if (!storedRole || storedRole !== 'elder') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-orange-50/40 pb-24">
      <header className="sticky top-0 z-10 bg-card/90 backdrop-blur border-b px-4 py-3 flex items-center justify-between">
        <div>
          <div className="text-xl font-bold">您好，{storedUsername || '朋友'}</div>
          <div className="text-muted-foreground text-base">已为您开启适老化大字号模式</div>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem('user_id');
            localStorage.removeItem('username');
            localStorage.removeItem('role');
            logout();
            navigate('/');
          }}
          className="flex items-center gap-1 text-base text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-5 w-5" /> 退出
        </button>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 py-4">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 inset-x-0 z-20 border-t bg-card">
        <div className="mx-auto max-w-3xl grid grid-cols-4">
          {TABS.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              end={t.end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-3 text-base ${
                  isActive ? 'text-primary font-semibold' : 'text-muted-foreground'
                }`
              }
            >
              <t.icon className="h-7 w-7" />
              {t.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
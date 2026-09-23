import { NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { MessageCircle, BedDouble, HeartPulse, User, MoreHorizontal } from 'lucide-react';

const TABS = [
  { to: '/elder', end: true, label: 'AI 助手', icon: MessageCircle },
  { to: '/elder/homestays', label: '找民宿', icon: BedDouble },
  { to: '/elder/health', label: '健康', icon: HeartPulse },
  { to: '/elder/me', label: '我的', icon: User },
];

export default function ElderlyLayout() {
  const navigate = useNavigate();

  const storedRole = localStorage.getItem('role');

  if (!storedRole || storedRole !== 'elder') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-20">
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="h-12 flex items-center justify-between px-4">
          <div className="w-16" />
          <div className="text-base font-medium text-gray-800">
            欢迎 {localStorage.getItem('name') || '朋友'}
          </div>
          <div className="w-16 flex justify-end">
            <button
              onClick={() => {
                localStorage.removeItem('user_id');
                localStorage.removeItem('username');
                localStorage.removeItem('role');
                localStorage.removeItem('name');
                navigate('/');
              }}
              className="text-gray-500"
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-3 py-3">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 inset-x-0 z-20 bg-white border-t border-gray-200">
        <div className="mx-auto max-w-3xl grid grid-cols-4">
          {TABS.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              end={t.end}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-2 ${
                  isActive ? 'text-[#E8722A]' : 'text-gray-400'
                }`
              }
            >
              <t.icon className="h-6 w-6" />
              <span className="text-xs mt-0.5">{t.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
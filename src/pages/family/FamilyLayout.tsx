import { NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { HeartHandshake, LayoutDashboard, CalendarDays, HeartPulse, Bell, MoreHorizontal } from 'lucide-react';

export default function FamilyLayout() {
  const navigate = useNavigate();

  const storedRole = localStorage.getItem('role');

  if (!storedRole || storedRole !== 'family') {
    return <Navigate to="/" replace />;
  }

  const TABS = [
    { to: '/family', end: true, label: '概览', icon: LayoutDashboard },
    { to: '/family/trips', label: '老人行程', icon: CalendarDays },
    { to: '/family/health', label: '老人健康', icon: HeartPulse },
    { to: '/family/alerts', label: '异常通知', icon: Bell },
    { to: '/family/book', label: '代预约', icon: HeartHandshake },
  ];

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-20">
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="h-12 flex items-center justify-between px-4">
          <div className="w-16" />
          <div className="text-base font-medium text-gray-800">家属关怀端</div>
          <div className="w-16 flex justify-end">
            <button
              onClick={() => {
                localStorage.removeItem('user_id');
                localStorage.removeItem('username');
                localStorage.removeItem('role');
                navigate('/');
              }}
              className="text-gray-500"
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl px-3 py-3">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 inset-x-0 z-20 bg-white border-t border-gray-200">
        <div
          className="mx-auto max-w-4xl grid"
          style={{ gridTemplateColumns: `repeat(${TABS.length}, 1fr)` }}
        >
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
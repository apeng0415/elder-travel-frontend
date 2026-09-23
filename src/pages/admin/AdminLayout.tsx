import { NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, BedDouble, CalendarDays, Bell, Megaphone, MoreHorizontal } from 'lucide-react';

const MENU = [
  { to: '/admin', end: true, label: '看板', icon: LayoutDashboard },
  { to: '/admin/users', label: '用户', icon: Users },
  { to: '/admin/homestays', label: '民宿', icon: BedDouble },
  { to: '/admin/bookings', label: '预约', icon: CalendarDays },
  { to: '/admin/tags', label: '标签', icon: Bell },
  { to: '/admin/notices', label: '公告', icon: Megaphone },
];

export default function AdminLayout() {
  const navigate = useNavigate();

  const storedRole = localStorage.getItem('role');

  if (!storedRole || storedRole !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-20">
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="h-12 flex items-center justify-between px-4">
          <div className="w-16" />
          <div className="text-base font-medium text-gray-800">管理后台</div>
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
          style={{ gridTemplateColumns: `repeat(${MENU.length}, 1fr)` }}
        >
          {MENU.map((m) => (
            <NavLink
              key={m.to}
              to={m.to}
              end={m.end}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-2 ${
                  isActive ? 'text-[#E8722A]' : 'text-gray-400'
                }`
              }
            >
              <m.icon className="h-5 w-5" />
              <span className="text-xs mt-0.5">{m.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
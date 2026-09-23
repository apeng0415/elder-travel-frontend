import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { HeartHandshake } from 'lucide-react';
import { API_BASE } from '@/config';

const DEMO = [
  { role: 'elderly' as const, label: '老人', name: '张爷爷', phone: '13800138001', desc: 'AI 助手 · 预约 · 健康' },
  { role: 'family' as const, label: '家属', name: '李女士', phone: '13800138002', desc: '远程关注老人' },
  { role: 'admin' as const, label: '管理员', name: '系统管理员', phone: '13800138000', desc: '数据看板 · 管理' },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [pwd, setPwd] = useState('');

  const doLogin = async (p: string, pw: string) => {
    try {
      const resp = await fetch(`${API_BASE}/api/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: p, password: pw }),
      });
      const data = await resp.json();

      if (data.status !== 'success') {
        toast.error(data.message || '账号或密码错误');
        return;
      }

      localStorage.setItem('user_id', String(data.user_id));
      localStorage.setItem('username', data.username);
      localStorage.setItem('role', data.role);
      localStorage.setItem('name', data.name || data.username);

      toast.success(`欢迎，${data.name || data.username}`);
      if (data.role === 'elder') navigate('/elder');
      else if (data.role === 'family') navigate('/family');
      else navigate('/admin');
    } catch (err) {
      console.error(err);
      toast.error('登录失败，请检查后端');
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* 小程序风格导航栏 */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="h-12 flex items-center justify-center">
          <div className="text-base font-medium text-gray-800">登录</div>
        </div>
      </header>

      {/* 中间内容，限制最大宽度 400px，模拟手机 */}
      <div className="mx-auto max-w-md">
        {/* 顶部 Logo 区 */}
        <div className="pt-8 pb-6 text-center">
          <div className="inline-flex items-center gap-2 text-[#E8722A] mb-3">
            <HeartHandshake className="h-7 w-7" />
            <span className="text-sm font-medium tracking-wide">金苗计划 · 智慧旅居</span>
          </div>
          <div className="text-2xl font-bold text-gray-800">乡村旅居适老化</div>
          <div className="text-sm text-gray-500 mt-2">预约与健康关怀系统</div>
        </div>

        {/* 登录卡片 */}
        <div className="px-4">
          <div className="bg-white rounded-xl p-5 space-y-4">
            <div className="space-y-2">
              <div className="text-sm text-gray-600">手机号</div>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="请输入手机号"
                className="w-full h-11 px-3 rounded-lg bg-gray-50 border border-gray-200 text-base outline-none focus:border-[#E8722A]"
              />
            </div>

            <div className="space-y-2">
              <div className="text-sm text-gray-600">密码</div>
              <input
                type="password"
                value={pwd}
                onChange={(e) => setPwd(e.target.value)}
                placeholder="请输入密码"
                className="w-full h-11 px-3 rounded-lg bg-gray-50 border border-gray-200 text-base outline-none focus:border-[#E8722A]"
              />
            </div>

            <button
              onClick={() => doLogin(phone, pwd)}
              className="w-full h-11 rounded-lg bg-[#E8722A] text-white text-base font-medium active:opacity-80"
            >
              登录
            </button>

            <div className="text-center text-sm text-gray-500 pt-2">
              还没有账号？{' '}
              <Link to="/register" className="text-[#E8722A] font-medium">
                立即注册
              </Link>
            </div>
          </div>
        </div>

        {/* 演示账号 */}
        <div className="px-4 mt-6">
          <div className="text-sm text-gray-500 mb-3">演示账号（点击一键进入）</div>
          <div className="space-y-2">
            {DEMO.map((d) => (
              <button
                key={d.role}
                onClick={() => doLogin(d.phone, '123456')}
                className="w-full bg-white rounded-xl p-4 text-left active:bg-gray-50"
              >
                <div className="flex items-center justify-between">
                  <span className="text-base font-medium text-gray-800">
                    以{d.label}身份体验 · {d.name}
                  </span>
                  <span className="text-xs text-gray-500 bg-gray-100 rounded px-2 py-0.5">
                    {d.phone}
                  </span>
                </div>
                <div className="text-sm text-gray-500 mt-1">{d.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="h-8" />
      </div>
    </div>
  );
}

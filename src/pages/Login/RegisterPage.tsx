import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { API_BASE } from '@/config';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('elder');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [loading, setLoading] = useState(false);

  const doRegister = async () => {
    if (!username || !password) {
      toast.error('账号和密码不能为空');
      return;
    }
    if (password.length < 6) {
      toast.error('密码至少 6 位');
      return;
    }
    setLoading(true);
    try {
      const regResp = await fetch(`${API_BASE}/api/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          password,
          role,
          phone: username,
          age: age ? Number(age) : null,
          name,
        }),
      });
      const regData = await regResp.json();
      if (regData.status !== 'success') {
        toast.error(regData.message || '注册失败');
        setLoading(false);
        return;
      }

      const loginResp = await fetch(`${API_BASE}/api/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const loginData = await loginResp.json();

      localStorage.setItem('user_id', String(loginData.user_id));
      localStorage.setItem('username', loginData.username);
      localStorage.setItem('role', loginData.role);
      localStorage.setItem('name', loginData.name || loginData.username);

      toast.success('注册成功！');
      if (loginData.role === 'elder') navigate('/elder');
      else if (loginData.role === 'family') navigate('/family');
      else navigate('/admin');
    } catch (err) {
      console.error(err);
      toast.error('注册失败，请检查后端');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* 小程序风格导航栏 */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="h-12 flex items-center justify-center">
          <div className="text-base font-medium text-gray-800">注册</div>
        </div>
      </header>

      {/* 中间内容，限制最大宽度 400px，模拟手机 */}
      <div className="mx-auto max-w-md">
        <div className="px-4 py-4">
          <div className="bg-white rounded-xl p-5 space-y-4">
            <div className="space-y-2">
              <div className="text-sm text-gray-600">姓名</div>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="请输入姓名"
                className="w-full h-11 px-3 rounded-lg bg-gray-50 border border-gray-200 text-base outline-none focus:border-[#E8722A]"
              />
            </div>

            <div className="space-y-2">
              <div className="text-sm text-gray-600">手机号（账号）</div>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="请输入手机号"
                className="w-full h-11 px-3 rounded-lg bg-gray-50 border border-gray-200 text-base outline-none focus:border-[#E8722A]"
              />
            </div>

            <div className="space-y-2">
              <div className="text-sm text-gray-600">密码</div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="至少 6 位"
                className="w-full h-11 px-3 rounded-lg bg-gray-50 border border-gray-200 text-base outline-none focus:border-[#E8722A]"
              />
            </div>

            <div className="space-y-2">
              <div className="text-sm text-gray-600">身份</div>
              <div className="flex gap-2">
                {[
                  { v: 'elder', l: '老人' },
                  { v: 'family', l: '家属' },
                  { v: 'admin', l: '管理员' },
                ].map((r) => (
                  <button
                    key={r.v}
                    onClick={() => setRole(r.v)}
                    className={`flex-1 h-11 rounded-lg text-base ${
                      role === r.v
                        ? 'bg-[#E8722A] text-white'
                        : 'bg-gray-50 border border-gray-200 text-gray-700'
                    }`}
                  >
                    {r.l}
                  </button>
                ))}
              </div>
            </div>

            {role === 'elder' && (
              <div className="space-y-2">
                <div className="text-sm text-gray-600">年龄（可选）</div>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="例如 70"
                  className="w-full h-11 px-3 rounded-lg bg-gray-50 border border-gray-200 text-base outline-none focus:border-[#E8722A]"
                />
              </div>
            )}

            <button
              onClick={doRegister}
              disabled={loading}
              className="w-full h-11 rounded-lg bg-[#E8722A] text-white text-base font-medium active:opacity-80 disabled:opacity-50"
            >
              {loading ? '注册中...' : '注册并登录'}
            </button>

            <div className="text-center text-sm text-gray-500 pt-2">
              已有账号？{' '}
              <Link to="/" className="text-[#E8722A] font-medium">
                去登录
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
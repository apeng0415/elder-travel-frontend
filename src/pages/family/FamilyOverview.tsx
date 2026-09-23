import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Link2, BellRing } from 'lucide-react';
import { API_BASE } from '@/config';

interface Elder {
  id: number;
  username: string;
  profile__age?: number;
  profile__phone?: string;
  profile__name?: string;
}

export default function FamilyOverview() {
  const navigate = useNavigate();
  const [elders, setElders] = useState<Elder[]>([]);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(true);

  const familyId = Number(localStorage.getItem('user_id') || '0');

  // 加载绑定的老人
  const loadElders = async () => {
    setLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/api/family/my_elders/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ family_id: familyId }),
      });
      const res = await resp.json();
      if (res.status === 'success') {
        setElders(res.data || []);
      }
    } catch (err) {
      console.error('加载绑定老人失败：', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadElders();
  }, []);

  // 绑定老人
  const doBind = async () => {
    if (!phone.trim()) {
      toast.error('请输入老人手机号');
      return;
    }
    try {
      const resp = await fetch(`${API_BASE}/api/family/bind/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ family_id: familyId, elder_username: phone.trim() }),
      });
      const res = await resp.json();
      if (res.status === 'success') {
        toast.success('绑定成功');
        setPhone('');
        loadElders();
      } else {
        toast.error(res.message || '绑定失败');
      }
    } catch (err) {
      console.error(err);
      toast.error('绑定失败，请检查后端');
    }
  };

  // 还没绑定老人
  if (!loading && elders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Link2 className="h-6 w-6 text-primary" /> 绑定老人账号
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-muted-foreground text-base">
            输入老人注册时使用的手机号，即可远程关注 TA 的行程与健康。
          </p>
          <Input
            inputMode="numeric"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="老人手机号，如 13800138001"
            className="h-12 text-base"
          />
          <Button className="w-full h-12 text-base" onClick={doBind}>
            绑定
          </Button>
        </CardContent>
      </Card>
    );
  }

  const elder = elders[0];

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">
            老人：{elder?.profile__name || elder?.username || '未命名'}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2 text-center">
          <div>
            <div className="text-3xl font-bold text-primary">{elders.length}</div>
            <div className="text-muted-foreground">绑定老人</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary">
              {elder?.profile__age ?? '—'}
            </div>
            <div className="text-muted-foreground">年龄</div>
          </div>
        </CardContent>
      </Card>

      {/* 快捷入口 */}
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          onClick={() => navigate('/family/trips')}
          className="rounded-xl border bg-card p-4 text-left hover:shadow-md text-lg"
        >
          查看老人行程
        </button>
        <button
          onClick={() => navigate('/family/health')}
          className="rounded-xl border bg-card p-4 text-left hover:shadow-md text-lg"
        >
          查看老人健康
        </button>
        <button
          onClick={() => navigate('/family/book')}
          className="rounded-xl border bg-card p-4 text-left hover:shadow-md text-lg"
        >
          代老人预约
        </button>
        <button
          onClick={() => navigate('/family/alerts')}
          className="rounded-xl border bg-card p-4 text-left hover:shadow-md text-lg"
        >
          异常通知
        </button>
      </div>
    </div>
  );
}
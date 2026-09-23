import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, HeartPulse, Clock } from 'lucide-react';
import { API_BASE } from '@/config';

interface AlertItem {
  id: string;
  elder_name: string;
  type: string;
  content: string;
  date: string;
  level: string;
}

export default function FamilyAlerts() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);

  const familyId = Number(localStorage.getItem('user_id') || '0');

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/api/family/alerts/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ family_id: familyId }),
      });
      const res = await resp.json();
      if (res.status === 'success') {
        setAlerts(res.data || []);
      }
    } catch (err) {
      console.error('加载异常通知失败：', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">
          异常通知（{alerts.length}）
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading && (
          <p className="text-muted-foreground text-base">加载中...</p>
        )}

        {!loading && alerts.length === 0 && (
          <p className="text-muted-foreground text-base">暂无异常，一切正常。</p>
        )}

        {alerts.map((a) => (
          <div
            key={a.id}
            className="flex items-start justify-between gap-3 rounded-lg bg-red-50 border border-red-200 px-4 py-3"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-lg font-medium text-red-700">
                  {a.elder_name} · {a.type}
                </div>
                <div className="text-base text-red-600 mt-1">{a.content}</div>
                <div className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> {a.date}
                </div>
              </div>
            </div>
            <Badge variant="destructive">需关注</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Footprints, MapPin, CheckCircle, Pill } from 'lucide-react';
import { API_BASE } from '@/config';

interface RoutePoint {
  time: string;
  place: string;
  lng: number;
  lat: number;
}

interface HealthData {
  date: string;
  steps: number;
  route: RoutePoint[];
  feeling: string;
  medicine: string;
  streak: number;
  sedentary: boolean;
  minutes_since_active: number;
}

export default function FamilyHealth() {
  const [elderName, setElderName] = useState('');
  const [elderId, setElderId] = useState<number | null>(null);
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);

  const familyId = Number(localStorage.getItem('user_id') || '0');

  // 1. 先拿绑定的老人
  useEffect(() => {
    const loadElder = async () => {
      try {
        const resp = await fetch(`${API_BASE}/api/family/my_elders/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ family_id: familyId }),
        });
        const res = await resp.json();
        if (res.status === 'success' && res.data.length > 0) {
          const elder = res.data[0];
          setElderId(elder.id);
          setElderName(elder.profile__name || elder.username);
        }
      } catch (err) {
        console.error('加载老人失败：', err);
      }
    };
    loadElder();
  }, []);

  // 2. 用老人的 id 拉健康数据
  useEffect(() => {
    if (!elderId) return;
    const loadHealth = async () => {
      setLoading(true);
      try {
        const resp = await fetch(`${API_BASE}/api/health/today/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: elderId }),
        });
        const res = await resp.json();
        if (res.status === 'success') {
          setData(res.data);
        }
      } catch (err) {
        console.error('加载健康数据失败：', err);
      } finally {
        setLoading(false);
      }
    };
    loadHealth();
  }, [elderId]);

  // 3. 高德地图初始化
  useEffect(() => {
    if (!data?.route || data.route.length === 0) return;
    const initMap = () => {
      const AMapLoader = (window as any).AMapLoader;
      AMapLoader.load({
        key: 'b383e7b2728aa10262b7fd390eab9497',
        version: '2.0',
      }).then((AMap: any) => {
        const map = new AMap.Map('family-amap', {
          zoom: 15,
          center: [data.route[0].lng, data.route[0].lat],
        });
        const path = data.route.map((p) => [p.lng, p.lat]);
        const polyline = new AMap.Polyline({
          path,
          strokeColor: '#f97316',
          strokeWeight: 5,
          strokeStyle: 'dashed',
        });
        map.add(polyline);
        data.route.forEach((p) => {
          const marker = new AMap.Marker({
            position: [p.lng, p.lat],
            label: {
              content: `<div style="padding:2px 6px;background:#fff;border:1px solid #f97316;border-radius:4px;font-size:12px;">${p.time} ${p.place}</div>`,
              direction: 'top',
            },
          });
          map.add(marker);
        });
        map.setFitView();
      });
    };
    if ((window as any).AMapLoader) {
      initMap();
    } else {
      const timer = setInterval(() => {
        if ((window as any).AMapLoader) {
          clearInterval(timer);
          initMap();
        }
      }, 200);
    }
  }, [data]);

  if (!elderId && !loading) {
    return (
      <p className="text-muted-foreground text-lg">请先绑定老人账号。</p>
    );
  }

  const stepGoal = 6000;
  const stepPercent = data ? Math.min(100, Math.round((data.steps / stepGoal) * 100)) : 0;
  const hasWarning = data?.feeling && ['头疼', '头晕', '疼', '难受', '不舒服', '恶心', '乏力', '心慌'].some((kw) => data.feeling.includes(kw));

  return (
    <div className="space-y-4">
      {/* 标题 */}
      <h1 className="text-2xl font-bold">{elderName || '老人'} 的健康</h1>

      {/* 异常提醒 */}
      {hasWarning && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 flex items-start gap-3">
          <AlertCircle className="h-6 w-6 text-red-500 mt-0.5 flex-shrink-0" />
          <div>
            <div className="font-semibold text-red-700 text-lg">老人反馈身体不适</div>
            <div className="text-red-600 text-base mt-1">{data?.feeling}</div>
          </div>
        </div>
      )}

      {/* 久坐提醒 */}
      {data?.sedentary && (
        <div className="rounded-xl bg-orange-50 border border-orange-200 p-4 flex items-start gap-3">
          <AlertCircle className="h-6 w-6 text-orange-500 mt-0.5 flex-shrink-0" />
          <div className="text-orange-700 text-base">
            老人已经 {data.minutes_since_active} 分钟没活动了，建议打电话提醒一下。
          </div>
        </div>
      )}

      {/* 今日步数 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Footprints className="h-6 w-6 text-primary" /> 今日步数
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-3 mb-3">
            <div className="text-4xl font-bold text-primary">{data?.steps ?? 0}</div>
            <div className="text-muted-foreground mb-1">/ {stepGoal} 步</div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-orange-400 to-orange-600 h-4 rounded-full"
              style={{ width: `${stepPercent}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* 活动轨迹 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <MapPin className="h-6 w-6 text-primary" /> 今日活动轨迹
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div id="family-amap" className="w-full h-64 rounded-xl overflow-hidden border" />
        </CardContent>
      </Card>

      {/* 今日签到 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <CheckCircle className="h-6 w-6 text-primary" /> 今日签到
            {data?.streak ? (
              <span className="text-base text-orange-600 font-normal ml-2">
                已连续签到 {data.streak} 天
              </span>
            ) : null}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-lg bg-orange-50 p-4">
            <div className="text-sm text-orange-600 font-medium mb-1">身体感受</div>
            <div className="text-lg">{data?.feeling || '今天还没签到'}</div>
          </div>
          <div className="rounded-lg bg-blue-50 p-4">
            <div className="text-sm text-blue-600 font-medium mb-1 flex items-center gap-1">
              <Pill className="h-4 w-4" /> 服药情况
            </div>
            <div className="text-lg">{data?.medicine || '今天还没记录'}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
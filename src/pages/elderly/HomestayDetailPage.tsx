import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, ArrowLeft, CheckCircle, Wifi, Car, Utensils, Coffee } from 'lucide-react';
import { API_BASE } from '@/config';
import { toast } from 'sonner';

interface Homestay {
  id: number;
  name: string;
  city: string;
  district: string;
  address: string;
  price: number;
  has_elevator: boolean;
  near_hospital: boolean;
  description: string;
  rating: number;
  image_url: string;
  images: string;       // JSON 字符串
  facilities: string;   // JSON 字符串
  nearby: string;       // JSON 字符串
}

export default function HomestayDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<Homestay | null>(null);
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem('user_id') || '1';

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const resp = await fetch(`${API_BASE}/api/search_homestay/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });
        const res = await resp.json();
        if (res.status === 'success') {
          const found = (res.data || []).find((h: Homestay) => String(h.id) === String(id));
          setData(found || null);
        }
      } catch (err) {
        console.error('加载详情失败：', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const doBooking = async () => {
    if (!data) return;
    try {
      const today = new Date();
      const checkIn = today.toISOString().slice(0, 10);
      const checkOut = new Date(today.getTime() + 3 * 24 * 3600 * 1000).toISOString().slice(0, 10);

      const resp = await fetch(`${API_BASE}/api/booking/create/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: Number(userId),
          homestay_id: data.id,
          check_in: checkIn,
          check_out: checkOut,
          guests: 1,
        }),
      });
      const res = await resp.json();
      if (res.status === 'success') {
        toast.success('预约成功！可在「我的」里查看');
      } else {
        toast.error(res.message || '预约失败');
      }
    } catch (err) {
      console.error(err);
      toast.error('预约失败，请检查后端');
    }
  };

  if (loading) return <div className="p-6 text-center text-muted-foreground text-lg">加载中...</div>;
  if (!data) return (
    <div className="p-6 text-center space-y-4">
      <p className="text-muted-foreground text-lg">找不到这家民宿</p>
      <Button onClick={() => navigate(-1)}>返回</Button>
    </div>
  );

  // 解析 JSON 字段
  let images: string[] = [];
  let facilities: string[] = [];
  let nearby: { name: string; distance: string }[] = [];
  try { images = JSON.parse(data.images || '[]'); } catch {}
  try { facilities = JSON.parse(data.facilities || '[]'); } catch {}
  try { nearby = JSON.parse(data.nearby || '[]'); } catch {}

  // 如果没有多张图，用主图兜底
  if (images.length === 0 && data.image_url) images = [data.image_url];

  // 携程风格：主图 + 4 张小图
  const mainImage = images[0];
  const thumbs = images.slice(1, 5);

  return (
    <div className="space-y-4">
      {/* 返回按钮 */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-base text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-5 w-5" /> 返回民宿列表
      </button>

      {/* 携程风格图片墙 */}
      <div className="grid grid-cols-4 gap-2 rounded-xl overflow-hidden">
        <div className="col-span-4 md:col-span-2 md:row-span-2">
          <img src={mainImage} alt={data.name} className="w-full h-64 md:h-96 object-cover rounded-xl" />
        </div>
        {thumbs.map((img, idx) => (
          <div key={idx} className="hidden md:block">
            <img src={img} alt="" className="w-full h-44 object-cover rounded-xl" />
          </div>
        ))}
      </div>

      {/* 标题 + 评分 */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">{data.name}</h1>
        <div className="flex items-center gap-4 mt-2 text-base">
          <span className="flex items-center gap-1 text-orange-600 font-semibold">
            <Star className="h-5 w-5 fill-orange-500 text-orange-500" />
            {data.rating}
          </span>
          <span className="flex items-center gap-1 text-muted-foreground">
            <MapPin className="h-5 w-5" />
            {data.city} · {data.district}
          </span>
        </div>
        <div className="text-muted-foreground text-base mt-2">
          📍 {data.address}
        </div>
      </div>

      {/* 设施标签 */}
      {facilities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">酒店设施</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {facilities.map((f, idx) => (
                <div key={idx} className="flex items-center gap-2 text-base">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  {f}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 附近地标 */}
      {nearby.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">附近地标</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {nearby.map((n, idx) => (
                <div key={idx} className="flex items-center justify-between text-base border-b pb-2">
                  <span className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" /> {n.name}
                  </span>
                  <span className="text-muted-foreground">{n.distance}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 民宿介绍 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">民宿介绍</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-base leading-relaxed text-muted-foreground">
            {data.description || '暂无介绍'}
          </p>
        </CardContent>
      </Card>

      {/* 预约按钮 */}
      <Button className="w-full h-16 text-xl" size="lg" onClick={doBooking}>
        立即预约（¥{data.price}/晚）
      </Button>
    </div>
  );
}
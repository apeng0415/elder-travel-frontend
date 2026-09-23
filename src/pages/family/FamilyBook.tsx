import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import HomestayCard from '@/components/HomestayCard';
import { API_BASE } from '@/config';

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
}

export default function FamilyBook() {
  const [elderName, setElderName] = useState('');
  const [elderId, setElderId] = useState<number | null>(null);
  const [homestays, setHomestays] = useState<Homestay[]>([]);
  const [picked, setPicked] = useState<number | null>(null);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');

  const familyId = Number(localStorage.getItem('user_id') || '0');

  // 先查绑定老人
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
        console.error(err);
      }
    };
    loadElder();
  }, []);

  // 加载湛江民宿列表
  useEffect(() => {
    const loadHomestays = async () => {
      try {
        const resp = await fetch(`${API_BASE}/api/search_homestay/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ city: '湛江' }),
        });
        const res = await resp.json();
        if (res.status === 'success') {
          setHomestays(res.data || []);
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadHomestays();
  }, []);

  const confirm = async () => {
    if (!picked || !checkIn || !checkOut) {
      toast.error('请选择民宿和日期');
      return;
    }
    if (!elderId) {
      toast.error('请先绑定老人账号');
      return;
    }
    try {
      const resp = await fetch(`${API_BASE}/api/booking/create/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: elderId,
          homestay_id: picked,
          check_in: checkIn,
          check_out: checkOut,
          guests: 1,
        }),
      });
      const res = await resp.json();
      if (res.status === 'success') {
        toast.success(`已为 ${elderName} 提交预约`);
        setPicked(null);
        setCheckIn('');
        setCheckOut('');
      } else {
        toast.error(res.message || '预约失败');
      }
    } catch (err) {
      console.error(err);
      toast.error('预约失败，请检查后端');
    }
  };

  if (!elderId) {
    return <p className="text-muted-foreground text-lg">请先绑定老人账号。</p>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">为 {elderName} 代预约</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1 sm:col-span-2">
            <Label className="text-base">选择民宿</Label>
            <select
              value={picked ?? ''}
              onChange={(e) => setPicked(Number(e.target.value))}
              className="h-12 w-full rounded-md border bg-background px-3 text-base"
            >
              <option value="">请选择民宿</option>
              {homestays.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}（¥{h.price}/晚）
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <Label className="text-base">入住</Label>
            <Input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="h-12 text-base"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-base">退房</Label>
            <Input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="h-12 text-base"
            />
          </div>

          <Button className="sm:col-span-2 h-12 text-lg" onClick={confirm}>
            提交代预约
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        {homestays.map((h) => (
          <button key={h.id} onClick={() => setPicked(h.id)} className="text-left">
            <HomestayCard
              homestay={h}
              highlightReason={picked === h.id ? '已选择' : undefined}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
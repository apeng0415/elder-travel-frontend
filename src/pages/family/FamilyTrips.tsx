import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, MapPin } from 'lucide-react';
import { API_BASE } from '@/config';

const STATUS_LABEL: Record<string, string> = {
  pending: '待确认',
  confirmed: '已确认',
  cancelled: '已取消',
  completed: '已完成',
};

interface Booking {
  id: number;
  homestay__name: string;
  homestay__city: string;
  check_in: string;
  check_out: string;
  guests: number;
  status: string;
  remark: string;
}

export default function FamilyTrips() {
  const [elderName, setElderName] = useState('');
  const [elderId, setElderId] = useState<number | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

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

  // 用老人 id 查预约
  useEffect(() => {
    if (!elderId) return;
    const loadBookings = async () => {
      setLoading(true);
      try {
        const resp = await fetch(`${API_BASE}/api/booking/my/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: elderId }),
        });
        const res = await resp.json();
        if (res.status === 'success') {
          setBookings(res.data || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadBookings();
  }, [elderId]);

  if (!elderId && !loading) {
    return <p className="text-muted-foreground text-lg">请先绑定老人账号。</p>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">
          {elderName || '老人'} 的行程（{bookings.length}）
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading && <p className="text-muted-foreground text-base">加载中...</p>}

        {!loading && bookings.length === 0 && (
          <p className="text-muted-foreground text-base">暂无行程记录。</p>
        )}

        {bookings.map((b) => (
          <div
            key={b.id}
            className="flex items-center justify-between rounded-lg bg-muted/60 px-4 py-3"
          >
            <div>
              <div className="text-lg font-medium">{b.homestay__name}</div>
              <div className="text-muted-foreground text-base flex items-center gap-1 mt-1">
                <CalendarDays className="h-4 w-4" />
                {b.check_in} 至 {b.check_out}
              </div>
              <div className="text-muted-foreground text-base flex items-center gap-1 mt-1">
                <MapPin className="h-4 w-4" />
                {b.homestay__city}
              </div>
            </div>
            <Badge
              variant={
                b.status === 'confirmed'
                  ? 'secondary'
                  : b.status === 'cancelled'
                  ? 'outline'
                  : 'default'
              }
            >
              {STATUS_LABEL[b.status] || b.status}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
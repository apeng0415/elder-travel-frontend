import { useEffect, useState } from 'react';
import { Phone, Plus, Trash2, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { API_BASE } from '@/config';

const STATUS_LABEL: Record<string, string> = {
  pending: '待确认',
  confirmed: '已确认',
  cancelled: '已取消',
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

interface Contact {
  id: number;
  name: string;
  relation: string;
  phone: string;
}

export default function MePage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [contactOpen, setContactOpen] = useState(false);
  const [cName, setCName] = useState('');
  const [cRel, setCRel] = useState('');
  const [cPhone, setCPhone] = useState('');

  const userId = Number(localStorage.getItem('user_id') || '1');
  const username = localStorage.getItem('username') || '朋友';

  // 加载我的预约
  const loadBookings = async () => {
    try {
      const resp = await fetch(`${API_BASE}/api/booking/my/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });
      const res = await resp.json();
      if (res.status === 'success') {
        setBookings(res.data || []);
      }
    } catch (err) {
      console.error('加载预约失败：', err);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  // 取消预约
  const cancelBooking = async (bookingId: number) => {
    try {
      const resp = await fetch(`${API_BASE}/api/booking/cancel/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ booking_id: bookingId }),
      });
      const res = await resp.json();
      if (res.status === 'success') {
        toast.success('已取消预约');
        loadBookings();
      } else {
        toast.error(res.message || '取消失败');
      }
    } catch (err) {
      console.error(err);
      toast.error('取消失败');
    }
  };

  const saveContact = () => {
    if (!cName || !cPhone) {
      toast.error('请填写联系人姓名和电话');
      return;
    }
    setContacts([...contacts, { id: Date.now(), name: cName, relation: cRel || '亲属', phone: cPhone }]);
    toast.success('已添加紧急联系人');
    setContactOpen(false);
    setCName('');
    setCRel('');
    setCPhone('');
  };

  const deleteContact = (id: number) => {
    setContacts(contacts.filter((c) => c.id !== id));
    toast.success('已删除');
  };

  const sos = () => {
    toast.error('已发起紧急呼叫！正在通知紧急联系人');
  };

  return (
    <div className="space-y-5">
      {/* 一键紧急呼叫 */}
      <button
        onClick={sos}
        className="w-full h-32 rounded-2xl bg-destructive text-destructive-foreground flex flex-col items-center justify-center shadow-lg active:scale-[0.98] transition"
      >
        <AlertTriangle className="h-10 w-10 mb-1" />
        <span className="text-2xl font-bold">一键紧急呼叫</span>
        <span className="text-base opacity-90">长按/点击即可联系紧急联系人</span>
      </button>

      {/* 个人信息 */}
      <Card>
        <CardHeader><CardTitle className="text-xl">我的信息</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 text-lg">
          <div>姓名：{localStorage.getItem('name') || '未填写'}</div>
          <div>账号：{username}</div>
        </CardContent>
      </Card>

      {/* 我的预约 */}
      <Card>
        <CardHeader><CardTitle className="text-xl">我的预约</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {bookings.length === 0 && (
            <p className="text-muted-foreground text-lg">还没有预约，去「找民宿」看看吧。</p>
          )}
          {bookings.map((b) => (
            <div key={b.id} className="flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2">
              <div>
                <div className="text-lg font-medium">{b.homestay__name}</div>
                <div className="text-muted-foreground text-base">
                  {b.check_in} 至 {b.check_out}
                </div>
              </div>
              <div className="flex items-center gap-2">
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
                {(b.status === 'pending' || b.status === 'confirmed') && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-base"
                    onClick={() => cancelBooking(b.id)}
                  >
                    取消
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 紧急联系人 */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle className="text-xl">紧急联系人</CardTitle>
          <Dialog open={contactOpen} onOpenChange={setContactOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="h-10 text-base">
                <Plus className="h-5 w-5" /> 添加
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-xl">添加紧急联系人</DialogTitle>
                <DialogDescription className="text-base">
                  紧急情况时会优先联系此人
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-3 py-2">
                <div className="space-y-1">
                  <Label className="text-base">姓名</Label>
                  <Input value={cName} onChange={(e) => setCName(e.target.value)} className="h-11 text-base" />
                </div>
                <div className="space-y-1">
                  <Label className="text-base">关系</Label>
                  <Input value={cRel} onChange={(e) => setCRel(e.target.value)} className="h-11 text-base" />
                </div>
                <div className="space-y-1">
                  <Label className="text-base">电话</Label>
                  <Input value={cPhone} onChange={(e) => setCPhone(e.target.value)} className="h-11 text-base" />
                </div>
              </div>
              <DialogFooter>
                <Button className="h-11 text-base" onClick={saveContact}>保存</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="space-y-2">
          {contacts.length === 0 && (
            <p className="text-muted-foreground text-base">还没有添加紧急联系人</p>
          )}
          {contacts.map((c) => (
            <div key={c.id} className="flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2">
              <div className="flex items-center gap-2 text-lg">
                <Phone className="h-5 w-5 text-primary" />
                {c.name}（{c.relation}）· {c.phone}
              </div>
              <Button variant="ghost" size="icon" onClick={() => deleteContact(c.id)}>
                <Trash2 className="h-5 w-5 text-destructive" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
import { useApp } from '@/store/store-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

const STATUS_LABEL: Record<string, string> = { pending: '待确认', confirmed: '已确认', cancelled: '已取消' };

export default function BookingsAdminPage() {
  const { bookings, homestays, users, confirmBooking, cancelBooking } = useApp();
  return (
    <Card>
      <CardHeader><CardTitle className="text-xl">预约管理（{bookings.length}）</CardTitle></CardHeader>
      <CardContent className="w-full overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">老人</TableHead>
              <TableHead className="whitespace-nowrap">民宿</TableHead>
              <TableHead className="whitespace-nowrap">入住</TableHead>
              <TableHead className="whitespace-nowrap">状态</TableHead>
              <TableHead className="whitespace-nowrap">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((b) => (
              <TableRow key={b.id}>
                <TableCell>{users.find((u) => u.id === b.elderlyId)?.name}</TableCell>
                <TableCell>{homestays.find((h) => h.id === b.homestayId)?.name}</TableCell>
                <TableCell>{b.checkIn} 至 {b.checkOut}</TableCell>
                <TableCell><Badge variant={b.status === 'confirmed' ? 'secondary' : b.status === 'cancelled' ? 'outline' : 'default'}>{STATUS_LABEL[b.status]}</Badge></TableCell>
                <TableCell className="space-x-1">
                  {b.status === 'pending' && (
                    <Button size="sm" onClick={() => { confirmBooking(b.id); toast.success('已确认'); }}>确认</Button>
                  )}
                  {(b.status === 'pending' || b.status === 'confirmed') && (
                    <Button size="sm" variant="outline" onClick={() => { cancelBooking(b.id); toast.success('已取消'); }}>取消</Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

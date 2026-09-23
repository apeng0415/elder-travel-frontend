import { useState } from 'react';
import { useApp } from '@/store/store-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';

export default function HomestaysAdminPage() {
  const { homestays, addHomestay, deleteHomestay } = useApp();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [tags, setTags] = useState('');
  const [elevator, setElevator] = useState(false);
  const [nearHospital, setNearHospital] = useState(false);

  const save = () => {
    if (!name || !price) { toast.error('请填写名称和价格'); return; }
    addHomestay({
      name, desc: '', price: Number(price), rating: 4.5,
      tags: tags.split(/[,，]/).map((t) => t.trim()).filter(Boolean),
      elevator, nearHospital, barrierFree: elevator, quiet: true, mealStyle: '家常',
      gradient: 'from-orange-400 to-rose-500',
      weekCrowd: [30, 32, 35, 40, 55, 70, 62],
    });
    toast.success('已添加民宿');
    setOpen(false); setName(''); setPrice(''); setTags(''); setElevator(false); setNearHospital(false);
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-xl">民宿管理（{homestays.length}）</CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="h-10"><Plus className="h-5 w-5" /> 新增民宿</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle className="text-xl">新增民宿</DialogTitle></DialogHeader>
            <div className="grid gap-3 py-2">
              <div className="space-y-1"><Label className="text-base">名称</Label><Input value={name} onChange={(e) => setName(e.target.value)} className="h-11" /></div>
              <div className="space-y-1"><Label className="text-base">价格（元/晚）</Label><Input inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value)} className="h-11" /></div>
              <div className="space-y-1"><Label className="text-base">适老化标签（逗号分隔）</Label><Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="电梯便利,近医院,安静" className="h-11" /></div>
              <label className="flex items-center gap-2 text-base"><input type="checkbox" checked={elevator} onChange={(e) => setElevator(e.target.checked)} /> 有电梯</label>
              <label className="flex items-center gap-2 text-base"><input type="checkbox" checked={nearHospital} onChange={(e) => setNearHospital(e.target.checked)} /> 近医院</label>
            </div>
            <DialogFooter><Button className="h-11" onClick={save}>保存</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="w-full overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">名称</TableHead>
              <TableHead className="whitespace-nowrap">价格</TableHead>
              <TableHead className="whitespace-nowrap">适老化标签</TableHead>
              <TableHead className="whitespace-nowrap">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {homestays.map((h) => (
              <TableRow key={h.id}>
                <TableCell className="font-medium">{h.name}</TableCell>
                <TableCell>¥{h.price}</TableCell>
                <TableCell className="max-w-[240px]">
                  <div className="flex flex-wrap gap-1">
                    {h.tags.map((t) => <Badge key={t} variant="secondary">{t}</Badge>)}
                  </div>
                </TableCell>
                <TableCell>
                  <Button size="icon" variant="ghost" onClick={() => { deleteHomestay(h.id); toast.success('已删除'); }}>
                    <Trash2 className="h-5 w-5 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

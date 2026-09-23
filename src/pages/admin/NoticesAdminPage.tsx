import { useState } from 'react';
import { useApp } from '@/store/store-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';

export default function NoticesAdminPage() {
  const { notices, addNotice, deleteNotice } = useApp();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const save = () => {
    if (!title) { toast.error('请填写标题'); return; }
    addNotice({ title, content });
    toast.success('公告已发布');
    setTitle(''); setContent('');
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader><CardTitle className="text-xl">发布公告</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="公告标题" value={title} onChange={(e) => setTitle(e.target.value)} className="h-11 text-base" />
          <Textarea placeholder="公告内容" value={content} onChange={(e) => setContent(e.target.value)} className="text-base" rows={4} />
          <Button className="h-11 text-base" onClick={save}>发布</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-xl">公告列表（{notices.length}）</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {notices.map((n) => (
            <div key={n.id} className="flex items-start justify-between rounded-lg bg-muted/60 p-3">
              <div>
                <div className="font-medium">{n.title}</div>
                <div className="text-muted-foreground text-sm">{n.content}</div>
                <div className="text-muted-foreground text-xs">{n.createdAt}</div>
              </div>
              <Button size="icon" variant="ghost" onClick={() => { deleteNotice(n.id); toast.success('已删除'); }}>
                <Trash2 className="h-5 w-5 text-destructive" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

import { useApp } from '@/store/store-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function TagsAdminPage() {
  const { reviews, homestays, reviewTag } = useApp();
  return (
    <Card>
      <CardHeader><CardTitle className="text-xl">评价标签审核</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {reviews.map((r) => {
          const h = homestays.find((x) => x.id === r.homestayId);
          return (
            <div key={r.id} className="rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">{h?.name} · {r.userName}</span>
                <Badge variant={r.approved ? 'secondary' : 'destructive'}>{r.approved ? '已通过' : '待审核'}</Badge>
              </div>
              <p className="mt-1 text-muted-foreground">{r.content}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {r.tags.map((t) => <Badge key={t} variant="outline">{t}</Badge>)}
                {!r.approved && (
                  <Button size="sm" className="ml-auto" onClick={() => { reviewTag(r.id, true); toast.success('已通过'); }}>通过</Button>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

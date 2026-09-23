import { useEffect, useState } from 'react';
import HomestayCard from '@/components/HomestayCard';
import { Badge } from '@/components/ui/badge';
import { ThumbsUp } from 'lucide-react';
import { API_BASE } from '@/config';

type Filter = 'elevator' | 'hospital' | 'quiet';

export default function HomestaysPage() {
  const [list, setList] = useState<any[]>([]);
  const [filters, setFilters] = useState<Filter[]>([]);
  const [loading, setLoading] = useState(false);

  const toggle = (f: Filter) =>
    setFilters((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));

  const loadHomestays = async () => {
    setLoading(true);
    try {
      const body: any = { city: '湛江' };
      if (filters.includes('elevator')) body.has_elevator = true;
      if (filters.includes('hospital')) body.near_hospital = true;

      const resp = await fetch(`${API_BASE}/api/search_homestay/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const res = await resp.json();
      if (res.status === 'success') {
        setList(res.data || []);
      }
    } catch (err) {
      console.error('加载民宿失败：', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHomestays();
  }, [filters]);

  const FILTERS: { key: Filter; label: string }[] = [
    { key: 'elevator', label: '有电梯' },
    { key: 'hospital', label: '近医院' },
    { key: 'quiet', label: '安静' },
  ];

  return (
    <div className="space-y-5">
      {/* 筛选栏 */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button key={f.key} onClick={() => toggle(f.key)}>
            <Badge variant={filters.includes(f.key) ? 'default' : 'outline'} className="px-3 py-1.5 text-base">
              {f.label}
            </Badge>
          </button>
        ))}
      </div>

      {/* 为您智能推荐 */}
      {filters.length === 0 && list.length > 0 && (
        <section>
          <h2 className="flex items-center gap-2 text-xl font-semibold mb-2">
            <ThumbsUp className="h-5 w-5 text-primary" /> 为您智能推荐
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {list.slice(0, 2).map((h) => (
              <HomestayCard key={h.id} homestay={h} highlightReason="为您智能推荐" />
            ))}
          </div>
        </section>
      )}

      {/* 全部民宿 */}
      <section>
        <h2 className="text-xl font-semibold mb-2">全部民宿（{list.length}）</h2>
        {loading ? (
          <p className="text-muted-foreground text-lg">加载中...</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {list.map((h) => (
              <HomestayCard key={h.id} homestay={h} />
            ))}
          </div>
        )}
        {!loading && list.length === 0 && (
          <p className="text-muted-foreground text-lg">没有符合条件的民宿，试试取消筛选。</p>
        )}
      </section>
    </div>
  );
}
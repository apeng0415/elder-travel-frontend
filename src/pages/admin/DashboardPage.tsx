import { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { API_BASE } from '@/config';

interface Stats {
  total_users: number;
  total_elders: number;
  total_families: number;
  total_homestays: number;
  total_bookings: number;
  avg_price: number;
  status_data: Record<string, number>;
  city_data: { city: string; count: number }[];
  trend: { date: string; count: number }[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const resp = await fetch(`${API_BASE}/api/admin/stats/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });
        const res = await resp.json();
        if (res.status === 'success') setStats(res.data);
      } catch (err) {
        console.error('加载统计数据失败：', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <p className="text-muted-foreground text-lg">加载中...</p>;
  if (!stats) return <p className="text-muted-foreground text-lg">加载失败</p>;

  // 顶部数据卡片
  const cards = [
    { label: '总用户数', value: stats.total_users },
    { label: '老人用户', value: stats.total_elders },
    { label: '家属账号', value: stats.total_families },
    { label: '民宿总数', value: stats.total_homestays },
    { label: '预约总数', value: stats.total_bookings },
    { label: '平均价格', value: `¥${stats.avg_price}` },
  ];

  // 预约状态饼图
  const statusLabels: Record<string, string> = {
    pending: '待确认',
    confirmed: '已确认',
    cancelled: '已取消',
    completed: '已完成',
  };
  const statusPieData = Object.entries(stats.status_data).map(([k, v]) => ({
    name: statusLabels[k] || k,
    value: v,
  }));

  // 城市分布柱状图
  const cityOption = {
    tooltip: {},
    grid: { left: 60, right: 16, top: 20, bottom: 24 },
    xAxis: { type: 'category', data: stats.city_data.map((c) => c.city) },
    yAxis: { type: 'value' },
    series: [
      {
        type: 'bar',
        data: stats.city_data.map((c) => c.count),
        itemStyle: { color: '#E8722A' },
      },
    ],
  };

  // 7 天趋势折线图
  const trendOption = {
    tooltip: { trigger: 'axis' },
    grid: { left: 40, right: 16, top: 20, bottom: 24 },
    xAxis: { type: 'category', data: stats.trend.map((t) => t.date) },
    yAxis: { type: 'value' },
    series: [
      {
        type: 'line',
        smooth: true,
        data: stats.trend.map((t) => t.count),
        areaStyle: { opacity: 0.2 },
        itemStyle: { color: '#E8722A' },
      },
    ],
  };

  return (
    <div className="space-y-4">
      {/* 顶部卡片 */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((k) => (
          <Card key={k.label}>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-primary">{k.value}</div>
              <div className="text-muted-foreground">{k.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* 7 天预约趋势 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">最近 7 天预约趋势</CardTitle>
          </CardHeader>
          <CardContent>
            <ReactECharts style={{ height: 260 }} option={trendOption} />
          </CardContent>
        </Card>

        {/* 预约状态分布 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">预约状态分布</CardTitle>
          </CardHeader>
          <CardContent>
            <ReactECharts
              style={{ height: 260 }}
              option={{
                tooltip: {},
                legend: { bottom: 0 },
                series: [
                  {
                    type: 'pie',
                    radius: ['40%', '70%'],
                    data: statusPieData,
                    color: ['#E8722A', '#6B93B8', '#D64545', '#5FA66A'],
                  },
                ],
              }}
            />
          </CardContent>
        </Card>
      </div>

      {/* 民宿城市分布 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">民宿城市分布</CardTitle>
        </CardHeader>
        <CardContent>
          <ReactECharts style={{ height: 260 }} option={cityOption} />
        </CardContent>
      </Card>
    </div>
  );
}
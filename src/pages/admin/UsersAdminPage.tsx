import { useApp } from '@/store/store-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function UsersAdminPage() {
  const { users, toggleUserStatus } = useApp();
  return (
    <Card>
      <CardHeader><CardTitle className="text-xl">用户管理（{users.length}）</CardTitle></CardHeader>
      <CardContent className="w-full overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="whitespace-nowrap">姓名</TableHead>
              <TableHead className="whitespace-nowrap">角色</TableHead>
              <TableHead className="whitespace-nowrap">手机号</TableHead>
              <TableHead className="whitespace-nowrap">状态</TableHead>
              <TableHead className="whitespace-nowrap">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.name}</TableCell>
                <TableCell>{u.role === 'elderly' ? '老人' : u.role === 'family' ? '家属' : '管理员'}</TableCell>
                <TableCell>{u.phone}</TableCell>
                <TableCell>
                  <Badge variant={u.status === 'disabled' ? 'destructive' : 'secondary'}>
                    {u.status === 'disabled' ? '已禁用' : '正常'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {u.role !== 'admin' && (
                    <Button size="sm" variant="outline" onClick={() => toggleUserStatus(u.id)}>
                      {u.status === 'disabled' ? '启用' : '禁用'}
                    </Button>
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

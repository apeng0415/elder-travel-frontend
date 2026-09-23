import { useApp } from '@/store/store-context';
import type { IUser } from '@/data/types';

export function useElderly(): IUser | undefined {
  const { currentUser, users } = useApp();
  return users.find((u) => u.id === currentUser?.boundElderlyId);
}

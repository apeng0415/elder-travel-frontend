import { createContext, useContext } from 'react';
import type {
  IAlert, IBooking, IContact, IHealthRecord, IHomestay, INotice, IReview, IUser, Role,
} from '@/data/types';

export interface IAppState {
  users: IUser[];
  homestays: IHomestay[];
  reviews: IReview[];
  bookings: IBooking[];
  health: IHealthRecord[];
  contacts: IContact[];
  notices: INotice[];
  alerts: IAlert[];
  currentUser: IUser | null;
}

export interface IAppActions {
  login: (phone: string, password: string) => IUser | null;
  logout: () => void;
  addBooking: (b: Omit<IBooking, 'id' | 'createdAt' | 'status'>) => void;
  cancelBooking: (id: string) => void;
  confirmBooking: (id: string) => void;
  addHealth: (h: Omit<IHealthRecord, 'id'>) => void;
  addContact: (c: Omit<IContact, 'id'>) => void;
  deleteContact: (id: string) => void;
  updateProfile: (patch: Partial<IUser>) => void;
  addHomestay: (h: Omit<IHomestay, 'id'>) => void;
  updateHomestay: (id: string, patch: Partial<IHomestay>) => void;
  deleteHomestay: (id: string) => void;
  toggleUserStatus: (id: string) => void;
  reviewTag: (id: string, approved: boolean) => void;
  addNotice: (n: Omit<INotice, 'id' | 'createdAt'>) => void;
  deleteNotice: (id: string) => void;
  sendSos: (elderlyId: string) => void;
  markAlertsRead: (elderlyId: string) => void;
  bindFamily: (elderlyId: string) => void;
}

export type IAppContext = IAppState & IAppActions;

export const AppContext = createContext<IAppContext | null>(null);

export function useApp(): IAppContext {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export type { Role };

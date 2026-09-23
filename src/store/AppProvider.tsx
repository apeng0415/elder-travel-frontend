import { useEffect, useMemo, useState } from 'react';
import { AppContext, type IAppContext, type IAppState } from './store-context';
import {
  SEED_ALERTS, SEED_BOOKINGS, SEED_CONTACTS, SEED_HEALTH, SEED_HOMESTAYS,
  SEED_NOTICES, SEED_REVIEWS, SEED_USERS,
} from '@/data/seed';
import type {
  IBooking, IContact, IHealthRecord, IHomestay, INotice, IUser,
} from '@/data/types';

const NS = 'rural-elderly-care';

function loadState(): IAppState {
  try {
    const raw = localStorage.getItem(`${NS}:state`);
    if (raw) return JSON.parse(raw) as IAppState;
  } catch { /* ignore */ }
  return {
    users: SEED_USERS,
    homestays: SEED_HOMESTAYS,
    reviews: SEED_REVIEWS,
    bookings: SEED_BOOKINGS,
    health: SEED_HEALTH,
    contacts: SEED_CONTACTS,
    notices: SEED_NOTICES,
    alerts: SEED_ALERTS,
    currentUser: null,
  };
}

function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function rid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e4)}`;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<IAppState>(loadState);

  useEffect(() => {
    try { localStorage.setItem(`${NS}:state`, JSON.stringify(state)); } catch { /* ignore */ }
  }, [state]);

  const value = useMemo<IAppContext>(() => ({
    ...state,
    login(phone: string, password: string) {
      const u = state.users.find((x) => x.phone === phone && x.password === password);
      if (u && u.status === 'disabled') return null;
      if (u) setState((s) => ({ ...s, currentUser: u }));
      return u ?? null;
    },
    logout() {
      setState((s) => ({ ...s, currentUser: null }));
    },
    addBooking(b: Omit<IBooking, 'id' | 'createdAt' | 'status'>) {
      const booking: IBooking = { ...b, id: rid('b'), status: 'pending', createdAt: today() };
      setState((s) => ({ ...s, bookings: [...s.bookings, booking] }));
    },
    cancelBooking(id: string) {
      setState((s) => ({ ...s, bookings: s.bookings.map((x) => (x.id === id ? { ...x, status: 'cancelled' as const } : x)) }));
    },
    confirmBooking(id: string) {
      setState((s) => ({ ...s, bookings: s.bookings.map((x) => (x.id === id ? { ...x, status: 'confirmed' as const } : x)) }));
    },
    addHealth(h: Omit<IHealthRecord, 'id'>) {
      setState((s) => ({ ...s, health: [...s.health, { ...h, id: rid('hg') }] }));
    },
    addContact(c: Omit<IContact, 'id'>) {
      setState((s) => ({ ...s, contacts: [...s.contacts, { ...c, id: rid('c') }] }));
    },
    deleteContact(id: string) {
      setState((s) => ({ ...s, contacts: s.contacts.filter((x) => x.id !== id) }));
    },
    updateProfile(patch: Partial<IUser>) {
      setState((s) => ({
        ...s,
        currentUser: s.currentUser ? { ...s.currentUser, ...patch } : s.currentUser,
        users: s.users.map((u) => (u.id === s.currentUser?.id ? { ...u, ...patch } : u)),
      }));
    },
    addHomestay(h: Omit<IHomestay, 'id'>) {
      setState((s) => ({ ...s, homestays: [...s.homestays, { ...h, id: rid('h') }] }));
    },
    updateHomestay(id: string, patch: Partial<IHomestay>) {
      setState((s) => ({ ...s, homestays: s.homestays.map((x) => (x.id === id ? { ...x, ...patch } : x)) }));
    },
    deleteHomestay(id: string) {
      setState((s) => ({ ...s, homestays: s.homestays.filter((x) => x.id !== id) }));
    },
    toggleUserStatus(id: string) {
      setState((s) => ({
        ...s,
        users: s.users.map((u) => (u.id === id ? { ...u, status: u.status === 'disabled' ? 'active' : 'disabled' } : u)),
      }));
    },
    reviewTag(id: string, approved: boolean) {
      setState((s) => ({ ...s, reviews: s.reviews.map((r) => (r.id === id ? { ...r, approved } : r)) }));
    },
    addNotice(n: Omit<INotice, 'id' | 'createdAt'>) {
      setState((s) => ({ ...s, notices: [...s.notices, { ...n, id: rid('n'), createdAt: today() }] }));
    },
    deleteNotice(id: string) {
      setState((s) => ({ ...s, notices: s.notices.filter((x) => x.id !== id) }));
    },
    sendSos(elderlyId: string) {
      setState((s) => ({
        ...s,
        alerts: [{
          id: rid('a'), elderlyId, type: 'sos' as const, read: false,
          message: '紧急呼叫已发起，已通知紧急联系人。', createdAt: today(),
        }, ...s.alerts],
      }));
    },
    markAlertsRead(elderlyId: string) {
      setState((s) => ({ ...s, alerts: s.alerts.map((a) => (a.elderlyId === elderlyId ? { ...a, read: true } : a)) }));
    },
    bindFamily(elderlyId: string) {
      setState((s) => ({
        ...s,
        users: s.users.map((u) => (u.role === 'family' && u.id === s.currentUser?.id ? { ...u, boundElderlyId: elderlyId } : u)),
        currentUser: s.currentUser?.role === 'family' ? { ...s.currentUser, boundElderlyId: elderlyId } : s.currentUser,
      }));
    },
  }), [state]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

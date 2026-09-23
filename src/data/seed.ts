import type {
  IAlert, IBooking, IContact, IHealthRecord, IHomestay, INotice, IReview, IUser,
} from './types';

export const SEED_USERS: IUser[] = [
  { id: 'u-elderly-zhang', name: '张爷爷', role: 'elderly', phone: '13800138001', password: '123456', age: 70, useWheelchair: false, chronic: '高血压', preference: 'quiet', emergencyContact: '女儿 13800138002', status: 'active' },
  { id: 'u-family-li', name: '李女士', role: 'family', phone: '13800138002', password: '123456', boundElderlyId: 'u-elderly-zhang', status: 'active' },
  { id: 'u-admin', name: '系统管理员', role: 'admin', phone: '13800138000', password: '123456', status: 'active' },
];

export const SEED_HOMESTAYS: IHomestay[] = [
  { id: 'h1', name: '青山绿水民宿', desc: '山脚下独栋小院，有电梯直达客房，离镇卫生院步行10分钟，院落安静。', price: 268, rating: 4.8, tags: ['电梯便利', '近医院', '安静', '饭菜清淡'], elevator: true, nearHospital: true, barrierFree: true, quiet: true, mealStyle: '清淡', gradient: 'from-emerald-400 to-teal-600', weekCrowd: [30, 32, 35, 40, 55, 70, 62] },
  { id: 'h2', name: '竹溪人家', desc: '溪边竹楼，环境清幽，饭菜地道农家味，一楼平层无障碍。', price: 198, rating: 4.6, tags: ['安静', '无障碍', '轮椅方便'], elevator: false, nearHospital: false, barrierFree: true, quiet: true, mealStyle: '家常', gradient: 'from-lime-400 to-green-600', weekCrowd: [45, 48, 50, 52, 66, 80, 74] },
  { id: 'h3', name: '半山别院', desc: '半山腰观景房，风景绝佳，但需走一段台阶，无电梯。', price: 358, rating: 4.5, tags: ['风景好', '热闹', '无电梯'], elevator: false, nearHospital: false, barrierFree: false, quiet: false, mealStyle: '重口', gradient: 'from-orange-400 to-rose-500', weekCrowd: [60, 62, 65, 70, 82, 92, 88] },
  { id: 'h4', name: '湖畔人家', desc: '临湖而建，村委会旁，就医方便，适合慢节奏养老小住。', price: 228, rating: 4.7, tags: ['近医院', '电梯便利', '安静'], elevator: true, nearHospital: true, barrierFree: true, quiet: true, mealStyle: '清淡', gradient: 'from-sky-400 to-blue-600', weekCrowd: [25, 28, 30, 33, 48, 65, 58] },
  { id: 'h5', name: '石屋山居', desc: '老石屋改造，院落热闹，常有游客喝茶聊天，无电梯。', price: 168, rating: 4.3, tags: ['热闹', '农家菜', '无电梯'], elevator: false, nearHospital: false, barrierFree: false, quiet: false, mealStyle: '家常', gradient: 'from-amber-400 to-orange-600', weekCrowd: [70, 72, 75, 78, 88, 95, 90] },
  { id: 'h6', name: '梯田人家', desc: '梯田景观房，带电梯的新楼，老板热心，适合老人长住。', price: 288, rating: 4.9, tags: ['电梯便利', '安静', '近医院', '饭菜清淡'], elevator: true, nearHospital: true, barrierFree: true, quiet: true, mealStyle: '清淡', gradient: 'from-teal-400 to-cyan-600', weekCrowd: [35, 36, 38, 42, 58, 72, 66] },
];

export const SEED_REVIEWS: IReview[] = [
  { id: 'r1', homestayId: 'h1', userName: '王奶奶', content: '有电梯，腿脚不便也方便，离卫生院很近，老板做饭很清淡。', tags: ['电梯便利', '近医院', '饭菜清淡'], approved: true },
  { id: 'r2', homestayId: 'h1', userName: '刘叔', content: '院子特别安静，睡的好，适合养老住几天。', tags: ['安静'], approved: true },
  { id: 'r3', homestayId: 'h2', userName: '陈阿姨', content: '一楼平层，轮椅能进，溪水边很清净。', tags: ['无障碍', '轮椅方便', '安静'], approved: true },
  { id: 'r4', homestayId: 'h3', userName: '小赵', content: '风景好但要爬台阶，老人来不太方便。', tags: ['无电梯'], approved: true },
  { id: 'r5', homestayId: 'h4', userName: '孙爷爷', content: '电梯房，旁边就是卫生室，心里踏实。', tags: ['电梯便利', '近医院'], approved: true },
  { id: 'r6', homestayId: 'h6', userName: '周奶奶', content: '新楼有电梯，饭菜软烂清淡，住着舒服。', tags: ['电梯便利', '饭菜清淡', '安静'], approved: true },
  { id: 'r7', homestayId: 'h5', userName: '游客小林', content: '院子热闹，晚上有点吵。', tags: ['热闹'], approved: false },
];

function recentDates(n: number): string[] {
  const out: string[] = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

// 14 天健康记录（张爷爷）
export const SEED_HEALTH: IHealthRecord[] = recentDates(14).map((date, i) => ({
  id: `hg-${i}`,
  elderlyId: 'u-elderly-zhang',
  date,
  systolic: 128 + (i % 5) * 3,
  diastolic: 80 + (i % 3) * 2,
  glucose: 6.1 + (i % 4) * 0.3,
  medication: '硝苯地平 1片',
}));

export const SEED_BOOKINGS: IBooking[] = [
  { id: 'b1', elderlyId: 'u-elderly-zhang', homestayId: 'h1', checkIn: offsetDate(5), checkOut: offsetDate(10), guests: 1, status: 'confirmed', createdAt: offsetDate(-2) },
];

export const SEED_CONTACTS: IContact[] = [
  { id: 'c1', elderlyId: 'u-elderly-zhang', name: '李女士', relation: '女儿', phone: '13800138002' },
];

export const SEED_NOTICES: INotice[] = [
  { id: 'n1', title: '秋季旅居优惠', content: '9-10月入住适老化民宿享8折，详情咨询前台。', createdAt: offsetDate(-3) },
  { id: 'n2', title: '安全提示', content: '夜间出行请穿反光衣物，紧急呼叫按钮在首页最下方。', createdAt: offsetDate(-1) },
];

export const SEED_ALERTS: IAlert[] = [
  { id: 'a1', elderlyId: 'u-elderly-zhang', type: 'inactive', message: '张爷爷已 3 天未登录系统，请家属留意。', createdAt: offsetDate(-1), read: false },
];

function offsetDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

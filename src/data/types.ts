// EXPORTS:
// IUser{id,name,role,phone,password,age,useWheelchair,chronic,preference,emergencyContact,boundElderlyId,status}
// IHomestay{id,name,desc,price,rating,tags,elevator,nearHospital,barrierFree,quiet,mealStyle,gradient,weekCrowd[]}
// IReview{id,homestayId,userName,content,tags[],approved}
// IBooking{id,elderlyId,homestayId,checkIn,checkOut,guests,status,createdAt}
// IHealthRecord{id,elderlyId,date,systolic,diastolic,glucose,medication}
// IContact{id,elderlyId,name,relation,phone}
// INotice{id,title,content,createdAt}
// IAlert{id,elderlyId,type,message,createdAt,read}
// IChatMessage{id,role,text,homestays?,crowd?}

export type Role = 'elderly' | 'family' | 'admin';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';

export interface IUser {
  id: string;
  name: string;
  role: Role;
  phone: string;
  password: string;
  // elderly profile
  age?: number;
  useWheelchair?: boolean;
  chronic?: string;
  preference?: 'quiet' | 'lively';
  emergencyContact?: string;
  // family binding
  boundElderlyId?: string;
  status?: 'active' | 'disabled';
}

export interface IHomestay {
  id: string;
  name: string;
  desc: string;
  price: number;
  rating: number;
  tags: string[];
  elevator: boolean;
  nearHospital: boolean;
  barrierFree: boolean;
  quiet: boolean;
  mealStyle: string;
  gradient: string; // tailwind gradient classes for card header
  weekCrowd: number[]; // 7 days 0-100 popularity
}

export interface IReview {
  id: string;
  homestayId: string;
  userName: string;
  content: string;
  tags: string[];
  approved: boolean;
}

export interface IBooking {
  id: string;
  elderlyId: string;
  homestayId: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string;
  guests: number;
  status: BookingStatus;
  createdAt: string;
}

export interface IHealthRecord {
  id: string;
  elderlyId: string;
  date: string;
  systolic: number;
  diastolic: number;
  glucose: number;
  medication: string;
}

export interface IContact {
  id: string;
  elderlyId: string;
  name: string;
  relation: string;
  phone: string;
}

export interface INotice {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export interface IAlert {
  id: string;
  elderlyId: string;
  type: 'inactive' | 'health' | 'sos';
  message: string;
  createdAt: string;
  read: boolean;
}

export interface IChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  homestays?: IHomestay[];
  crowd?: { name: string; days: string[]; values: number[] };
}


export type UserType = 'ichki' | 'tashqi';

export type LibrarySection = 
  | 'Direktor qabuli' 
  | 'Xizmat Ko\'rsatish Bo\'limi' 
  | 'Axborot-Kutubxona Resurslarini Butlash' 
  | 'Ilmiy-Uslubiy va Axborot-Ma\'lumot'
  | 'Elektron axborot resurslar bo\'limi'
  | 'Xorijiy Axborot-Kutubxona Resurslari'
  | 'ARM ga tashrif';

export interface Visitor {
  id?: string;
  firstName: string;
  lastName: string;
  userType: UserType;
  faculty?: string;
  department?: string;
  group?: string;
  section: LibrarySection;
  visitDate: string; // YYYY-MM-DD
  createdAt: any; // Firestore Timestamp
  updatedAt?: any;
}

export type ViewState = 'dashboard' | 'register' | 'edit' | 'history' | 'stats' | 'ranking';

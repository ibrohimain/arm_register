
import React, { useState, useEffect } from 'react';
import { registerVisitor, updateVisitor } from '../services/visitorService';
import { LibrarySection, UserType, Visitor } from '../types';

interface VisitorFormProps {
  initialData?: Visitor;
  onSuccess: () => void;
  onCancel: () => void;
}

const VisitorForm: React.FC<VisitorFormProps> = ({ initialData, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    userType: 'ichki' as UserType,
    faculty: '',
    department: '',
    group: '',
    section: 'Xizmat Ko\'rsatish Bo\'limi' as LibrarySection,
    visitDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        firstName: initialData.firstName,
        lastName: initialData.lastName,
        userType: initialData.userType,
        faculty: initialData.faculty || '',
        department: initialData.department || '',
        group: initialData.group || '',
        section: initialData.section,
        visitDate: initialData.visitDate
      });
    }
  }, [initialData]);

  const faculties = [
    'Kibersport',
    'Energetika muxandisligi',
    'Sanoat texnalogiyalari',
    'Transport va Kimyo muxandisligi',
    'Qurilish muxandisligi'
  ];

  const departments = [
    'Transport vositalari muhandisligi',
    'Transport logistikasi',
    'Kimyoviy texnologiya',
    'Kimyo',
    'Umumtexnika fanlari',
    'Ijtimoiy fanlar',
    'Qurilish muhandisligi',
    'Yo‘l muhandisligi',
    'Qurilish materiallari va konstruksiyalari',
    'Muhandislik kommunikatsiyalari',
    'Arxitekturaviy loyihalash',
    'To‘qimqchilik mahsulotlari texnologiyasi',
    'Tabiiy tolalar va matoga ishlov berish texnologiyalari',
    'Qishloq xo‘jalik va oziq – ovqat texnika texnologiyalari',
    'Ekologiya va mehnat muxofazasi',
    'Energetika va elektr texnologiyasi',
    'Metrologiya va standartlashtirish',
    'Fizika',
    'Oliy matemetika',
    'Kompyuter va dasturiy injiniring',
    'Jismoniy tarbiya',
    'Radioelektronika',
    'Iqtisodiyot va menejment',
    'O‘zbek va xorijiy tillar'
  ];

  const sections: LibrarySection[] = [
    'Direktor qabuli',
    'Xizmat Ko\'rsatish Bo\'limi',
    'Axborot-Kutubxona Resurslarini Butlash',
    'Ilmiy-Uslubiy va Axborot-Ma\'lumot',
    'Elektron axborot resurslar bo\'limi',
    'Xorijiy Axborot-Kutubxona Resurslari',
    'ARM ga tashrif'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.userType === 'ichki') {
      if (!formData.faculty && !formData.department) {
        alert("Iltimos, Fakultet yoki Kafedradan kamida bittasini tanlang!");
        return;
      }
    }

    setLoading(true);
    try {
      if (initialData?.id) {
        await updateVisitor(initialData.id, formData);
      } else {
        await registerVisitor(formData);
      }
      onSuccess();
    } catch (error) {
      alert("Xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  };

  const isFacultyFilled = !!formData.faculty;
  const isDeptFilled = !!formData.department;

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mb-12">
      <div className={`p-6 border-b border-gray-100 ${initialData ? 'bg-amber-50' : 'bg-blue-50'}`}>
        <h2 className={`text-xl font-bold ${initialData ? 'text-amber-900' : 'text-blue-900'}`}>
          {initialData ? "Tashrif ma'lumotlarini tahrirlash" : "Yangi tashrifchini ro'yxatga olish"}
        </h2>
        <p className={`text-sm mt-1 ${initialData ? 'text-amber-700' : 'text-blue-700'}`}>
          Barcha maydonlarni to'g'ri to'ldirganingizga ishonch hosil qiling.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Ismi</label>
            <input 
              required
              type="text" 
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
              value={formData.firstName}
              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              placeholder="Aziz"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Familyasi</label>
            <input 
              required
              type="text" 
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
              value={formData.lastName}
              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              placeholder="Karimov"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Tashrif kuni</label>
            <input 
              required
              type="date" 
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
              value={formData.visitDate}
              onChange={(e) => setFormData({...formData, visitDate: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Foydalanuvchi turi</label>
            <div className="flex gap-4 p-2.5 border border-gray-300 rounded-lg bg-gray-50 h-[46px] items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="userType" 
                  className="text-blue-600 focus:ring-blue-500 h-4 w-4"
                  checked={formData.userType === 'ichki'}
                  onChange={() => setFormData({...formData, userType: 'ichki'})}
                />
                <span className="text-xs font-medium text-gray-700">Ichki</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="userType" 
                  className="text-blue-600 focus:ring-blue-500 h-4 w-4"
                  checked={formData.userType === 'tashqi'}
                  onChange={() => setFormData({...formData, userType: 'tashqi'})}
                />
                <span className="text-xs font-medium text-gray-700">Tashqi</span>
              </label>
            </div>
          </div>
        </div>

        {formData.userType === 'ichki' && (
          <div className="p-6 bg-blue-50/50 rounded-xl border border-blue-100 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-2 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs font-medium text-blue-700 italic">
                {!isFacultyFilled && !isDeptFilled ? "Fakultet yoki Kafedradan kamida bittasini tanlang." : "Bajarildi."}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center justify-between">
                  Fakultet 
                  {!isDeptFilled && <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest">Majburiy*</span>}
                </label>
                <select 
                  className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all ${!isFacultyFilled && !isDeptFilled ? 'border-blue-300 ring-1 ring-blue-100' : 'border-gray-300'}`}
                  value={formData.faculty}
                  onChange={(e) => setFormData({...formData, faculty: e.target.value})}
                >
                  <option value="">Fakultetni tanlang</option>
                  {faculties.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center justify-between">
                  Kafedra
                  {!isFacultyFilled && <span className="text-[10px] text-red-500 font-bold uppercase tracking-widest">Majburiy*</span>}
                </label>
                <select 
                  className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all ${!isFacultyFilled && !isDeptFilled ? 'border-blue-300 ring-1 ring-blue-100' : 'border-gray-300'}`}
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                >
                  <option value="">Kafedrani tanlang</option>
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-gray-700">Guruh</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                  value={formData.group}
                  onChange={(e) => setFormData({...formData, group: e.target.value})}
                  placeholder="Guruh raqami (masalan: 12-21)"
                />
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Foydalanadigan bo'limi</label>
          <select 
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
            value={formData.section}
            onChange={(e) => setFormData({...formData, section: e.target.value as LibrarySection})}
          >
            {sections.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="flex items-center justify-end gap-4 pt-8 border-t border-gray-100">
          <button 
            type="button" 
            onClick={onCancel}
            className="px-8 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            Bekor qilish
          </button>
          <button 
            disabled={loading}
            type="submit" 
            className={`px-10 py-2.5 rounded-lg text-white font-bold shadow-md transition-all flex items-center gap-3 disabled:opacity-70 ${initialData ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {loading ? (
               <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : null}
            {loading ? 'Saqlanmoqda...' : (initialData ? 'Yangilash' : 'Ro\'yxatdan o\'tkazish')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VisitorForm;

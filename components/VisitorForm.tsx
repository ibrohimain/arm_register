
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
  const [mode, setMode] = useState<'single' | 'bulk'>('single');
  const [bulkNames, setBulkNames] = useState('');
  
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
      setMode('single');
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
      if (mode === 'single') {
        if (initialData?.id) {
          await updateVisitor(initialData.id, formData);
        } else {
          await registerVisitor(formData);
        }
      } else {
        // Guruhli kiritish logikasi
        const lines = bulkNames.split('\n').filter(line => line.trim().length > 0);
        if (lines.length === 0) {
          alert("Kamida bitta ism kiriting!");
          setLoading(false);
          return;
        }

        for (const line of lines) {
          const parts = line.trim().split(/\s+/);
          const firstName = parts[0] || '';
          const lastName = parts.slice(1).join(' ') || '';
          
          await registerVisitor({
            ...formData,
            firstName,
            lastName
          });
        }
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
    <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden mb-12">
      <div className={`p-8 border-b border-gray-100 ${initialData ? 'bg-amber-50' : 'bg-blue-600'}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className={`text-2xl font-black ${initialData ? 'text-amber-900' : 'text-white'}`}>
              {initialData ? "Tahrirlash" : "Ro'yxatga olish"}
            </h2>
            <p className={`text-sm mt-1 font-medium ${initialData ? 'text-amber-700' : 'text-blue-100'}`}>
              {mode === 'single' ? "Yakka tartibda kiritish" : "Guruhli tashrifni kiritish (Jamoaviy)"}
            </p>
          </div>
          
          {!initialData && (
            <div className="flex bg-white/20 p-1 rounded-xl backdrop-blur-md">
              <button 
                type="button"
                onClick={() => setMode('single')}
                className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${mode === 'single' ? 'bg-white text-blue-600 shadow-sm' : 'text-white hover:bg-white/10'}`}
              >
                Yakka
              </button>
              <button 
                type="button"
                onClick={() => setMode('bulk')}
                className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${mode === 'bulk' ? 'bg-white text-blue-600 shadow-sm' : 'text-white hover:bg-white/10'}`}
              >
                Guruhli
              </button>
            </div>
          )}
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        {mode === 'single' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Ismi</label>
              <input 
                required
                type="text" 
                className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium text-gray-700 bg-gray-50/50"
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                placeholder="Aziz"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Familyasi</label>
              <input 
                required
                type="text" 
                className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium text-gray-700 bg-gray-50/50"
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                placeholder="Karimov"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-2 animate-in fade-in slide-in-from-right-4 duration-500">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 flex justify-between">
              <span>Foydalanuvchilar ro'yxati</span>
              <span className="text-blue-500">Har birini yangi qatordan yozing</span>
            </label>
            <textarea 
              required
              rows={6}
              className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium text-gray-700 bg-gray-50/50 leading-relaxed"
              value={bulkNames}
              onChange={(e) => setBulkNames(e.target.value)}
              placeholder="Azizov Aziz&#10;Karimov Jamshid&#10;Alieva Madina..."
            ></textarea>
            <p className="text-[10px] text-gray-400 italic">Namuna: Ism Familiya (yoki shunchaki Ism)</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Tashrif kuni</label>
            <input 
              required
              type="date" 
              className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium text-gray-700 bg-gray-50/50"
              value={formData.visitDate}
              onChange={(e) => setFormData({...formData, visitDate: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Foydalanuvchi turi</label>
            <div className="flex gap-4 p-4 border border-gray-200 rounded-2xl bg-gray-50/50 h-[60px] items-center">
              <label className="flex-1 flex items-center justify-center gap-2 cursor-pointer py-2 rounded-xl transition-all hover:bg-white">
                <input 
                  type="radio" 
                  name="userType" 
                  className="text-blue-600 focus:ring-blue-500 h-4 w-4"
                  checked={formData.userType === 'ichki'}
                  onChange={() => setFormData({...formData, userType: 'ichki'})}
                />
                <span className="text-xs font-black text-gray-600 uppercase tracking-wider">Ichki</span>
              </label>
              <label className="flex-1 flex items-center justify-center gap-2 cursor-pointer py-2 rounded-xl transition-all hover:bg-white">
                <input 
                  type="radio" 
                  name="userType" 
                  className="text-blue-600 focus:ring-blue-500 h-4 w-4"
                  checked={formData.userType === 'tashqi'}
                  onChange={() => setFormData({...formData, userType: 'tashqi'})}
                />
                <span className="text-xs font-black text-gray-600 uppercase tracking-wider">Tashqi</span>
              </label>
            </div>
          </div>
        </div>

        {formData.userType === 'ichki' && (
          <div className="p-8 bg-blue-50/30 rounded-[2rem] border border-blue-100/50 space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest ml-1 flex justify-between">
                  Fakultet 
                  {!isDeptFilled && <span className="text-red-400">Majburiy*</span>}
                </label>
                <select 
                  className={`w-full px-5 py-4 rounded-2xl border bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all text-sm font-bold ${!isFacultyFilled && !isDeptFilled ? 'border-blue-300' : 'border-gray-200'}`}
                  value={formData.faculty}
                  onChange={(e) => setFormData({...formData, faculty: e.target.value})}
                >
                  <option value="">Fakultetni tanlang</option>
                  {faculties.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest ml-1 flex justify-between">
                  Kafedra
                  {!isFacultyFilled && <span className="text-red-400">Majburiy*</span>}
                </label>
                <select 
                  className={`w-full px-5 py-4 rounded-2xl border bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all text-sm font-bold ${!isFacultyFilled && !isDeptFilled ? 'border-blue-300' : 'border-gray-200'}`}
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                >
                  <option value="">Kafedrani tanlang</option>
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest ml-1">Guruh raqami</label>
                <input 
                  type="text" 
                  className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all font-bold text-gray-700"
                  value={formData.group}
                  onChange={(e) => setFormData({...formData, group: e.target.value})}
                  placeholder="Masalan: 12-21"
                />
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Foydalanadigan bo'limi</label>
          <select 
            className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-blue-100 outline-none bg-gray-50/50 font-bold text-gray-700 transition-all"
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
            className="px-8 py-4 rounded-2xl border border-gray-200 text-gray-500 font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-all active:scale-95"
          >
            Bekor qilish
          </button>
          <button 
            disabled={loading}
            type="submit" 
            className={`px-12 py-4 rounded-2xl text-white font-black text-xs uppercase tracking-widest shadow-xl transition-all flex items-center gap-3 disabled:opacity-70 active:scale-95 ${initialData ? 'bg-amber-600 shadow-amber-100' : 'bg-blue-600 shadow-blue-100'}`}
          >
            {loading ? (
               <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : null}
            {loading ? 'Saqlanmoqda...' : (initialData ? 'O\'zgarishlarni saqlash' : mode === 'bulk' ? 'Barchasini kiritish' : 'Ro\'yxatdan o\'tkazish')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VisitorForm;

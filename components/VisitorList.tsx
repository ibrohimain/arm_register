
import React, { useState, useMemo } from 'react';
import { Visitor } from '../types';

interface VisitorListProps {
  visitors: Visitor[];
  loading: boolean;
  onEdit: (visitor: Visitor) => void;
  onDelete: (id: string) => void;
}

const VisitorList: React.FC<VisitorListProps> = ({ visitors, loading, onEdit, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredVisitors = useMemo(() => {
    if (!searchTerm.trim()) return visitors;
    const term = searchTerm.toLowerCase();
    return visitors.filter(v => 
      v.firstName.toLowerCase().includes(term) || 
      v.lastName.toLowerCase().includes(term) || 
      (v.faculty && v.faculty.toLowerCase().includes(term)) ||
      (v.group && v.group.toLowerCase().includes(term)) ||
      (v.department && v.department.toLowerCase().includes(term))
    );
  }, [visitors, searchTerm]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-100 border-t-blue-600"></div>
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Ma'lumotlar yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Control Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative group w-full md:max-w-md">
          <input 
            type="text" 
            placeholder="Ism, fakultet yoki guruh bo'yicha qidirish..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium text-gray-700 shadow-sm"
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        
        <div className="text-sm font-bold text-gray-400 uppercase tracking-widest px-4">
          Jami: <span className="text-blue-600">{filteredVisitors.length} ta yozuv</span>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Tashrif buyuruvchi</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Ma'lumotlar</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Foydalangan bo'lim</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Vaqti</th>
                <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredVisitors.map((v) => (
                <tr key={v.id} className="hover:bg-blue-50/30 transition-all group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black shadow-inner transition-transform group-hover:scale-110 ${v.userType === 'ichki' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                        {v.firstName ? v.firstName[0] : ''}{v.lastName ? v.lastName[0] : ''}
                      </div>
                      <div>
                        <div className="text-sm font-black text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">{v.firstName} {v.lastName}</div>
                        <div className={`text-[10px] font-black uppercase tracking-widest mt-1 inline-block px-2 py-0.5 rounded ${v.userType === 'ichki' ? 'bg-blue-50 text-blue-500' : 'bg-amber-50 text-amber-500'}`}>
                          {v.userType}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="text-xs font-bold text-gray-700 truncate max-w-[200px]" title={v.faculty}>
                      {v.faculty || <span className="text-gray-300 italic font-normal">Kiritilmagan</span>}
                    </div>
                    <div className="text-[10px] font-medium text-gray-400 mt-1">
                      {v.department ? v.department : <span className="text-gray-300 italic">Kafedra yo'q</span>}
                      {v.group && <span className="ml-2 px-1.5 py-0.5 bg-gray-100 rounded text-gray-500 font-bold">{v.group}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl uppercase tracking-wider border border-indigo-100/50">
                      {v.section}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <div className="text-xs font-black text-gray-700">{v.visitDate}</div>
                    <div className="text-[10px] font-bold text-gray-400 mt-0.5">
                      {v.createdAt && typeof v.createdAt.toDate === 'function' 
                        ? v.createdAt.toDate().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }) 
                        : '??:??'}
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                      <button 
                        onClick={() => onEdit(v)}
                        className="p-2.5 bg-white text-blue-500 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-sm border border-gray-100"
                        title="Tahrirlash"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => v.id && onDelete(v.id)}
                        className="p-2.5 bg-white text-red-500 hover:bg-red-600 hover:text-white rounded-xl transition-all shadow-sm border border-gray-100"
                        title="O'chirish"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredVisitors.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-32 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-dashed border-gray-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                      </div>
                      <p className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">Ma'lumotlar mavjud emas</p>
                      <p className="text-xs text-gray-300 mt-2">Qidiruv so'zini tekshiring yoki yangi tashrif qo'shing.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default VisitorList;

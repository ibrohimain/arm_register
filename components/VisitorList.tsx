
import React from 'react';
import { Visitor } from '../types';

interface VisitorListProps {
  visitors: Visitor[];
  loading: boolean;
  onEdit: (visitor: Visitor) => void;
  onDelete: (id: string) => void;
}

const VisitorList: React.FC<VisitorListProps> = ({ visitors, loading, onEdit, onDelete }) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-100 border-t-blue-600"></div>
        <p className="text-sm font-medium text-gray-400">Ma'lumotlar yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50/50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Foydalanuvchi</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Ma'lumoti</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Bo'lim</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Sana</th>
              <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Amallar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {visitors.map((v) => (
              <tr key={v.id} className="hover:bg-blue-50/30 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black shadow-sm group-hover:scale-105 transition-transform ${v.userType === 'ichki' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                      {v.firstName ? v.firstName[0] : '?'}{v.lastName ? v.lastName[0] : ''}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900 leading-tight">{v.firstName} {v.lastName}</div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${v.userType === 'ichki' ? 'bg-blue-500' : 'bg-orange-500'}`}></span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{v.userType}</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-xs font-bold text-gray-700 truncate max-w-[200px]" title={v.faculty}>
                    {v.faculty || <span className="text-gray-300 italic font-normal">Fakultet yo'q</span>}
                  </div>
                  <div className="text-[10px] font-medium text-gray-400 truncate max-w-[200px]" title={v.department}>
                    {v.department || <span className="text-gray-300 italic">Kafedra yo'q</span>}
                    {v.group ? ` • Guruh: ${v.group}` : ''}
                  </div>
                </td>
                <td className="px-6 py-4">
                   <div className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg inline-block uppercase tracking-wider">
                    {v.section}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-center">
                    <div className="text-xs font-black text-gray-700">{v.visitDate}</div>
                    <div className="text-[9px] font-medium text-gray-400">
                      {v.createdAt && typeof v.createdAt.toDate === 'function' 
                        ? v.createdAt.toDate().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }) 
                        : 'Vaqt noma\'lum'}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                    <button 
                      onClick={() => onEdit(v)}
                      className="p-2 text-blue-500 hover:bg-blue-100 rounded-xl transition-colors"
                      title="Tahrirlash"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => v.id && onDelete(v.id)}
                      className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-colors"
                      title="O'chirish"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {visitors.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-24 text-center">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="p-4 bg-gray-50 rounded-full text-gray-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                    </div>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Hozircha ma'lumotlar mavjud emas</p>
                    <p className="text-xs text-gray-300">Firebase bazangizda 'arm_visitors' kolleksiyasini tekshiring.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VisitorList;


import React, { useMemo, useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts';
import { Visitor } from '../types';

interface StatisticsProps {
  visitors: Visitor[];
}

type Period = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'all';

const Statistics: React.FC<StatisticsProps> = ({ visitors }) => {
  const [period, setPeriod] = useState<Period>('all');

  // Ma'lumotlarni vaqt bo'yicha filtrlash
  const filteredVisitors = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return visitors.filter(v => {
      if (period === 'all') return true;
      
      const vDate = new Date(v.visitDate);
      
      if (period === 'daily') {
        return vDate.getTime() === today.getTime();
      }
      
      if (period === 'weekly') {
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        return vDate >= weekAgo;
      }
      
      if (period === 'monthly') {
        return vDate.getMonth() === now.getMonth() && vDate.getFullYear() === now.getFullYear();
      }
      
      if (period === 'yearly') {
        return vDate.getFullYear() === now.getFullYear();
      }
      
      return true;
    });
  }, [visitors, period]);

  const sectionData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredVisitors.forEach(v => {
      counts[v.section] = (counts[v.section] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [filteredVisitors]);

  const facultyData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredVisitors.filter(v => v.faculty).forEach(v => {
      counts[v.faculty!] = (counts[v.faculty!] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredVisitors]);

  const departmentData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredVisitors.filter(v => v.department).forEach(v => {
      counts[v.department!] = (counts[v.department!] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [filteredVisitors]);

  const topFaculty = useMemo(() => facultyData[0] || { name: 'Ma\'lumot yo\'q', value: 0 }, [facultyData]);
  const topDepartment = useMemo(() => departmentData[0] || { name: 'Ma\'lumot yo\'q', value: 0 }, [departmentData]);

  const COLORS = ['#2563eb', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'];

  // Ma'lumotlarni CSV ko'rinishida yuklab olish
  const downloadCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Hisobot Turi: " + period.toUpperCase() + "\n";
    csvContent += "Sana: " + new Date().toLocaleString() + "\n\n";
    
    csvContent += "BO'LIMLAR BO'YICHA\nBo'lim,Tashriflar Soni\n";
    sectionData.forEach(row => { csvContent += `${row.name},${row.value}\n`; });
    
    csvContent += "\nFAKULTETLAR REYTINGI\nFakultet,Tashriflar Soni\n";
    facultyData.forEach(row => { csvContent += `${row.name},${row.value}\n`; });
    
    csvContent += "\nKAFEDRALAR REYTINGI\nKafedra,Tashriflar Soni\n";
    departmentData.forEach(row => { csvContent += `${row.name},${row.value}\n`; });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ARM_Hisobot_${period}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      {/* Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-wrap gap-2 p-1 bg-gray-50 rounded-xl border border-gray-100">
          {(['all', 'daily', 'weekly', 'monthly', 'yearly'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                period === p 
                ? 'bg-white text-blue-600 shadow-sm border border-gray-100' 
                : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {p === 'all' ? 'Hammasi' : 
               p === 'daily' ? 'Kunlik' : 
               p === 'weekly' ? 'Haftalik' : 
               p === 'monthly' ? 'Oylik' : 'Yillik'}
            </button>
          ))}
        </div>
        
        <button 
          onClick={downloadCSV}
          className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-emerald-100 transition-all active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Hisobotni yuklab olish (.csv)
        </button>
      </div>

      {/* Top Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden group">
          <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
            <svg className="w-48 h-48" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3L1 9L12 15L21 10.09V17H23V9L12 3M12 5.19L19.31 9.19L12 13.19L4.69 9.19L12 5.19M12 16L1 10L12 4L23 10L12 16Z" />
            </svg>
          </div>
          <div className="relative z-10">
            <p className="text-blue-100 text-xs font-black uppercase tracking-widest mb-2 opacity-80">Eng faol fakultet</p>
            <h4 className="text-2xl font-black mb-6 leading-tight drop-shadow-sm">{topFaculty.name}</h4>
            <div className="flex items-end gap-3">
              <span className="text-5xl font-black">{topFaculty.value}</span>
              <span className="mb-2 text-blue-100 font-bold opacity-80">tashrif</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden group">
          <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
            <svg className="w-48 h-48" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17 20H22V18C22 15.79 20.21 14 18 14H17V20M2 20H7V14H6C3.79 14 2 15.79 2 18V20M15 20V12H9V20H15M11 20V14H13V20H11M12 11C13.66 11 15 9.66 15 8C15 6.34 13.66 5 12 5C10.34 5 9 6.34 9 8C9 9.66 10.34 11 12 11M6 13C7.66 13 9 11.66 9 10C9 8.34 7.66 7 6 7C4.34 7 3 8.34 3 10C3 11.66 4.34 13 6 13M18 13C19.66 13 21 11.66 21 10C21 8.34 19.66 7 18 7C16.34 7 15 8.34 15 10C15 11.66 16.34 13 18 13Z" />
            </svg>
          </div>
          <div className="relative z-10">
            <p className="text-indigo-100 text-xs font-black uppercase tracking-widest mb-2 opacity-80">Eng faol kafedra</p>
            <h4 className="text-2xl font-black mb-6 leading-tight drop-shadow-sm">{topDepartment.name}</h4>
            <div className="flex items-end gap-3">
              <span className="text-5xl font-black">{topDepartment.value}</span>
              <span className="mb-2 text-indigo-100 font-bold opacity-80">tashrif</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Section Shares */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-black mb-8 text-gray-900 flex items-center gap-2">
            <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
            Bo'limlar ulushi
          </h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sectionData}
                  cx="50%"
                  cy="45%"
                  labelLine={false}
                  label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  innerRadius={60}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {sectionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: '20px', fontSize: '11px', fontWeight: 'bold' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Faculty Chart */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-black mb-8 text-gray-900 flex items-center gap-2">
            <span className="w-2 h-6 bg-emerald-600 rounded-full"></span>
            Fakultetlar faolligi
          </h3>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={facultyData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 10, fill: '#6b7280', fontWeight: 'bold' }} />
                <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="value" fill="#2563eb" radius={[0, 8, 8, 0]} barSize={20}>
                   {facultyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Department Chart - Full Width */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-black mb-10 text-gray-900 flex items-center gap-2">
          <span className="w-2 h-6 bg-purple-600 rounded-full"></span>
          Kafedralar kesimida (Top 10)
        </h3>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={departmentData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end" 
                interval={0} 
                height={150} 
                tick={{ fontSize: 9, fill: '#6b7280', fontWeight: '600' }} 
              />
              <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} />
              <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
              <Bar dataKey="value" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Helper info */}
      <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 text-center">
        <p className="text-sm text-gray-500 italic">
          Statistik ma'lumotlar tanlangan davr ({period === 'all' ? 'barcha vaqt' : period === 'daily' ? 'bugun' : period === 'weekly' ? 'oxirgi 7 kun' : period === 'monthly' ? 'shu oy' : 'shu yil'}) uchun ko'rsatilmoqda.
        </p>
      </div>
    </div>
  );
};

export default Statistics;

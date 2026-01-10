
import React, { useState, useEffect } from 'react';
import { Visitor } from '../types';
import { getVisitorInsights } from '../services/aiService';
import StatsCard from './StatsCard';

interface DashboardProps {
  visitors: Visitor[];
  loading: boolean;
  onRefresh: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ visitors, loading, onRefresh }) => {
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayVisitors = visitors.filter(v => v.visitDate === todayStr);

  const internalCount = visitors.filter(v => v.userType === 'ichki').length;
  const externalCount = visitors.filter(v => v.userType === 'tashqi').length;

  const handleGetInsight = async () => {
    if (visitors.length === 0) return;
    setAiLoading(true);
    const insight = await getVisitorInsights(visitors.slice(0, 25));
    setAiInsight(insight);
    setAiLoading(false);
  };

  // Barcha bo'limlar ro'yxati va ularning ranglari
  const sectionList = [
    { name: 'ARM ga tashrif', color: 'bg-blue-500' },
    { name: 'Xizmat Ko\'rsatish Bo\'limi', color: 'bg-indigo-500' },
    { name: 'Elektron axborot resurslar bo\'limi', color: 'bg-emerald-500' },
    { name: 'Ilmiy-Uslubiy va Axborot-Ma\'lumot', color: 'bg-purple-500' },
    { name: 'Direktor qabuli', color: 'bg-rose-500' },
    { name: 'Axborot-Kutubxona Resurslarini Butlash', color: 'bg-amber-500' },
    { name: 'Xorijiy Axborot-Kutubxona Resurslari', color: 'bg-teal-500' }
  ];

  const recentVisitors = visitors.slice(0, 5);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Top Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatsCard 
          title="Bugungi tashriflar" 
          value={todayVisitors.length.toString()} 
          icon="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          color="blue"
          subtitle="Oxirgi 24 soat ichida"
        />
        <StatsCard 
          title="Jami tashriflar" 
          value={visitors.length.toString()} 
          icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          color="green"
          subtitle="Tizim ochilgandan buyon"
        />
        <StatsCard 
          title="Ichki a'zolar" 
          value={internalCount.toString()} 
          icon="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          color="purple"
          subtitle="Talaba va xodimlar"
        />
        <StatsCard 
          title="Tashqi mehmonlar" 
          value={externalCount.toString()} 
          icon="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
          color="orange"
          subtitle="Chetki foydalanuvchilar"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* AI Insights Panel */}
        <div className="lg:col-span-8 bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:scale-110 transition-transform pointer-events-none">
            <svg className="w-64 h-64" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
          </div>

          <div className="flex items-center justify-between mb-8 relative z-10">
            <div>
              <h3 className="text-xl font-black text-gray-900 flex items-center gap-3">
                <span className="p-2 bg-yellow-100 text-yellow-600 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </span>
                Aqlli AI Tahlili
              </h3>
              <p className="text-sm text-gray-400 mt-1">Gemini AI markaz faoliyatini tahlil qiladi</p>
            </div>
            <button 
              onClick={handleGetInsight}
              disabled={aiLoading || visitors.length === 0}
              className="flex items-center gap-2 text-sm bg-blue-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 disabled:opacity-50 active:scale-95"
            >
              {aiLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Tahlil qilinmoqda...
                </>
              ) : (
                'Tahlilni boshlash'
              )}
            </button>
          </div>
          
          <div className={`flex-1 min-h-[220px] rounded-2xl p-6 transition-all duration-500 ${aiInsight ? 'bg-blue-50/50 border border-blue-100' : 'bg-gray-50 border border-dashed border-gray-200 flex items-center justify-center'}`}>
            {aiInsight ? (
              <div className="prose prose-blue max-w-none">
                <div className="text-gray-700 leading-relaxed whitespace-pre-line text-sm md:text-base font-medium">
                  {aiInsight}
                </div>
              </div>
            ) : (
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-300">
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-400 text-sm font-medium">Hozircha tahlil yo'q. Tugmani bosing!</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="lg:col-span-4 space-y-6">
          {/* Section Distribution */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
              Bo'limlar tahlili
            </h3>
            <div className="space-y-4">
              {sectionList.map(section => {
                const count = visitors.filter(v => v.section === section.name).length;
                const percentage = visitors.length > 0 ? (count / visitors.length) * 100 : 0;
                return (
                  <div key={section.name} className="group">
                    <div className="flex justify-between text-[10px] font-bold mb-1">
                      <span className="text-gray-600 truncate mr-2 group-hover:text-blue-600 transition-colors">{section.name}</span>
                      <span className="text-gray-900">{count}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className={`${section.color} h-full rounded-full transition-all duration-700 ease-out`} 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Activity Feed */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Jonli tasma
              </h3>
              <span className="animate-pulse w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
            </div>
            <div className="space-y-4">
              {recentVisitors.map((v, i) => (
                <div key={v.id || i} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors group">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-black shadow-sm group-hover:scale-110 transition-transform ${v.userType === 'ichki' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                    {v.firstName[0]}{v.lastName[0]}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-xs font-bold text-gray-900 truncate">{v.firstName} {v.lastName}</p>
                    <p className="text-[10px] text-gray-400 font-medium truncate">{v.section}</p>
                  </div>
                  <div className="text-[9px] font-bold text-gray-300">
                    {v.createdAt ? v.createdAt.toDate().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' }) : 'Hozir'}
                  </div>
                </div>
              ))}
              {recentVisitors.length === 0 && (
                <p className="text-center py-4 text-xs text-gray-400 font-medium italic">Hali tashriflar yo'q</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

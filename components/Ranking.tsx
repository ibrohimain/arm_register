
import React, { useMemo, useState } from 'react';
import { Visitor } from '../types';

interface RankingProps {
  visitors: Visitor[];
}

interface ScoreItem {
  name: string;
  points: number;
  subText?: string;
  count1?: number; // Visits
  count2?: number; // Section activities
}

type RankingTab = 'users' | 'faculties' | 'departments';

const Ranking: React.FC<RankingProps> = ({ visitors }) => {
  const [activeTab, setActiveTab] = useState<RankingTab>('users');

  // 1. Foydalanuvchilar ballarini hisoblash
  const userScores = useMemo(() => {
    const scores: Record<string, ScoreItem> = {};
    visitors.forEach(v => {
      const key = `${v.firstName} ${v.lastName}`;
      if (!scores[key]) {
        scores[key] = { name: key, points: 0, subText: v.faculty || v.department || 'Tashqi', count1: 0, count2: 0 };
      }
      if (v.section === 'ARM ga tashrif') {
        scores[key].points += 1;
        scores[key].count1! += 1;
      } else {
        scores[key].points += 2;
        scores[key].count2! += 1;
      }
    });
    return Object.values(scores).sort((a, b) => b.points - a.points);
  }, [visitors]);

  // 2. Fakultetlar ballarini hisoblash
  const facultyScores = useMemo(() => {
    const scores: Record<string, ScoreItem> = {};
    visitors.forEach(v => {
      if (v.faculty) {
        if (!scores[v.faculty]) {
          scores[v.faculty] = { name: v.faculty, points: 0, subText: 'Fakultet', count1: 0, count2: 0 };
        }
        if (v.section === 'ARM ga tashrif') {
          scores[v.faculty].points += 1;
          scores[v.faculty].count1! += 1;
        } else {
          scores[v.faculty].points += 2;
          scores[v.faculty].count2! += 1;
        }
      }
    });
    return Object.values(scores).sort((a, b) => b.points - a.points);
  }, [visitors]);

  // 3. Kafedralar ballarini hisoblash
  const deptScores = useMemo(() => {
    const scores: Record<string, ScoreItem> = {};
    visitors.forEach(v => {
      if (v.department) {
        if (!scores[v.department]) {
          scores[v.department] = { name: v.department, points: 0, subText: 'Kafedra', count1: 0, count2: 0 };
        }
        if (v.section === 'ARM ga tashrif') {
          scores[v.department].points += 1;
          scores[v.department].count1! += 1;
        } else {
          scores[v.department].points += 2;
          scores[v.department].count2! += 1;
        }
      }
    });
    return Object.values(scores).sort((a, b) => b.points - a.points);
  }, [visitors]);

  const currentScores = activeTab === 'users' ? userScores : activeTab === 'faculties' ? facultyScores : deptScores;
  const topThree = currentScores.slice(0, 3);
  const rest = currentScores.slice(3);

  const renderPodium = () => (
    <div className="flex flex-col md:flex-row items-center md:items-end justify-center gap-6 pt-12 pb-8">
      {/* 2-o'rin */}
      {topThree[1] && (
        <div className="w-full md:w-64 bg-white p-6 rounded-2xl shadow-md border-t-4 border-gray-300 text-center order-2 md:order-1 animate-in slide-in-from-bottom-6 transition-transform hover:scale-105">
          <div className="w-14 h-14 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl font-bold border-2 border-gray-200">2</div>
          <h4 className="font-bold text-gray-800 truncate px-2">{topThree[1].name}</h4>
          <p className="text-[10px] text-gray-400 uppercase tracking-tighter mb-2">{topThree[1].subText}</p>
          <div className="text-xl font-black text-gray-700">{topThree[1].points} <span className="text-xs font-normal text-gray-400">ball</span></div>
        </div>
      )}

      {/* 1-o'rin */}
      {topThree[0] && (
        <div className="w-full md:w-72 bg-gradient-to-b from-yellow-50 to-white p-8 rounded-2xl shadow-xl border-t-8 border-yellow-400 text-center relative z-10 order-1 md:order-2 animate-in fade-in zoom-in duration-700 transition-transform hover:scale-110">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
            G'olib
          </div>
          <div className="w-20 h-20 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl font-black border-4 border-yellow-300 shadow-inner">1</div>
          <h4 className="font-black text-gray-900 text-xl truncate px-2">{topThree[0].name}</h4>
          <p className="text-xs text-yellow-700 mb-4 font-bold">{topThree[0].subText}</p>
          <div className="text-4xl font-black text-yellow-600">{topThree[0].points} <span className="text-lg font-normal text-yellow-700">ball</span></div>
        </div>
      )}

      {/* 3-o'rin */}
      {topThree[2] && (
        <div className="w-full md:w-64 bg-white p-6 rounded-2xl shadow-md border-t-4 border-orange-300 text-center order-3 md:order-3 animate-in slide-in-from-bottom-4 transition-transform hover:scale-105">
          <div className="w-14 h-14 bg-orange-50 text-orange-400 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl font-bold border-2 border-orange-100">3</div>
          <h4 className="font-bold text-gray-800 truncate px-2">{topThree[2].name}</h4>
          <p className="text-[10px] text-gray-400 uppercase tracking-tighter mb-2">{topThree[2].subText}</p>
          <div className="text-xl font-black text-orange-600">{topThree[2].points} <span className="text-xs font-normal text-orange-400">ball</span></div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-8 pb-10">
      {/* Tab Selector */}
      <div className="flex flex-wrap gap-2 justify-center bg-gray-100 p-1 rounded-2xl w-fit mx-auto shadow-inner">
        <button 
          onClick={() => setActiveTab('users')}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'users' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Foydalanuvchilar
        </button>
        <button 
          onClick={() => setActiveTab('faculties')}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'faculties' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Fakultetlar
        </button>
        <button 
          onClick={() => setActiveTab('departments')}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'departments' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Kafedralar
        </button>
      </div>

      {renderPodium()}

      {/* Full Leaderboard Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
          <h3 className="font-bold text-gray-800 flex items-center gap-2 capitalize">
            {activeTab === 'users' ? 'Barcha foydalanuvchilar' : activeTab === 'faculties' ? 'Fakultetlar' : 'Kafedralar'} reytingi
          </h3>
          <span className="text-xs font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded-full uppercase">
            {currentScores.length} ta natija
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-[10px] uppercase text-gray-400 font-bold border-b border-gray-100">
              <tr>
                <th className="px-8 py-4">№</th>
                <th className="px-8 py-4">Nomi</th>
                <th className="px-8 py-4 text-center">Tashrif/Xarakatlar</th>
                <th className="px-8 py-4 text-right">Umumiy Ball</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentScores.map((item, index) => (
                <tr key={item.name} className={`hover:bg-blue-50/30 transition-colors group ${index < 3 ? 'bg-blue-50/10' : ''}`}>
                  <td className="px-8 py-5">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0 ? 'bg-yellow-400 text-white shadow-sm' : 
                      index === 1 ? 'bg-gray-300 text-white shadow-sm' : 
                      index === 2 ? 'bg-orange-300 text-white shadow-sm' : 
                      'bg-gray-100 text-gray-400 group-hover:bg-blue-200 group-hover:text-blue-700 transition-colors'
                    }`}>
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="text-sm font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{item.name}</div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">{item.subText}</div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex justify-center gap-2">
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] font-bold text-gray-600">{item.count1}</span>
                        <span className="text-[8px] text-gray-400 uppercase">Tashrif</span>
                      </div>
                      <div className="w-px h-6 bg-gray-200 self-center"></div>
                      <div className="flex flex-col items-center">
                        <span className="text-[10px] font-bold text-blue-600">{item.count2}</span>
                        <span className="text-[8px] text-gray-400 uppercase">Bo'lim</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <span className="text-lg font-black text-gray-900 group-hover:text-blue-700 transition-colors">
                      {item.points}
                      <span className="text-[10px] font-medium text-gray-400 ml-1">ball</span>
                    </span>
                  </td>
                </tr>
              ))}
              {currentScores.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-8 py-20 text-center text-gray-400 italic">
                    Hozircha ma'lumotlar mavjud emas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Point Rules Reminder */}
      <div className="bg-blue-600 rounded-3xl p-8 text-white shadow-xl shadow-blue-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
          </svg>
        </div>
        <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Ballar qanday hisoblanadi?
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
          <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
            <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mb-1">ARM ga tashrif</p>
            <p className="text-2xl font-black">1 ball</p>
            <p className="text-blue-100 text-[10px] mt-2 italic">Faqatgina markazga kirganlik uchun beriladi.</p>
          </div>
          <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
            <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mb-1">Bo'limlarda ishlash</p>
            <p className="text-2xl font-black">2 ball</p>
            <p className="text-blue-100 text-[10px] mt-2 italic">Xizmat ko'rsatish, elektron resurslar va boshqa ixtisoslashgan bo'limlardan foydalanganlik uchun.</p>
          </div>
        </div>
        <p className="mt-6 text-sm text-blue-100/80 font-medium">
          * Har bir foydalanuvchining ballari u tegishli bo'lgan <span className="text-white font-bold">Fakultet</span> va <span className="text-white font-bold">Kafedra</span>ning umumiy hisobiga ham qo'shib boriladi.
        </p>
      </div>
    </div>
  );
};

export default Ranking;

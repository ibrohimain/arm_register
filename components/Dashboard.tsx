
import React, { useState, useEffect } from 'react';
import { Visitor, Note } from '../types';
import { getRecentNotes, addNote, deleteNote } from '../services/noteService';
import { auth } from '../firebase';
import StatsCard from './StatsCard';

interface DashboardProps {
  visitors: Visitor[];
  loading: boolean;
  onRefresh: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ visitors, loading, onRefresh }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [notesLoading, setNotesLoading] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    setNotesLoading(true);
    const data = await getRecentNotes();
    setNotes(data);
    setNotesLoading(false);
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    try {
      await addNote(newNote, auth.currentUser?.email || 'Admin');
      setNewNote('');
      fetchNotes();
    } catch (error) {
      alert("Qayd qo'shishda xato!");
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (window.confirm("Ushbu eslatmani o'chirmoqchimisiz?")) {
      await deleteNote(id);
      fetchNotes();
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const todayVisitors = visitors.filter(v => v.visitDate === todayStr);
  const internalCount = visitors.filter(v => v.userType === 'ichki').length;
  const externalCount = visitors.filter(v => v.userType === 'tashqi').length;

  const sectionList = [
    { name: 'ARM ga tashrif', color: 'bg-blue-500' },
    { name: 'Xizmat Ko\'rsatish Bo\'limi', color: 'bg-indigo-500' },
    { name: 'Elektron axborot resurslar bo\'limi', color: 'bg-emerald-500' },
    { name: 'Ilmiy-Uslubiy va Axborot-Ma\'lumot', color: 'bg-purple-500' },
    { name: 'Direktor qabuli', color: 'bg-rose-500' },
    { name: 'Axborot-Kutubxona Resurslarini Butlash', color: 'bg-amber-500' },
    { name: 'Xorijiy Axborot-Kutubxona Resurslari', color: 'bg-teal-500' }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatsCard title="Bugungi tashriflar" value={todayVisitors.length.toString()} icon="M12 4.354a4 4 0 110 5.292" color="blue" subtitle="Oxirgi 24 soat" />
        <StatsCard title="Jami tashriflar" value={visitors.length.toString()} icon="M17 20h5v-2a3 3 0 00-5.356-1.857" color="green" subtitle="Umumiy statistika" />
        <StatsCard title="Ichki a'zolar" value={internalCount.toString()} icon="M19 21V5a2 2 0 00-2-2" color="purple" subtitle="Talaba/Xodim" />
        <StatsCard title="Tashqi mehmonlar" value={externalCount.toString()} icon="M21 12a9 9 0 01-9 9" color="orange" subtitle="Mehmonlar" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* System Notes Panel */}
        <div className="lg:col-span-8 bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex flex-col relative overflow-hidden group">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-black text-gray-900 flex items-center gap-3">
                <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </span>
                Tizim Qaydlari va Eslatmalar
              </h3>
              <p className="text-sm text-gray-400 mt-1">Xodimlar uchun muhim kunlik xabarnomalar</p>
            </div>
          </div>

          <form onSubmit={handleAddNote} className="mb-6 flex gap-2">
            <input 
              type="text" 
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Muhim eslatma yozing..."
              className="flex-1 bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-sm font-medium"
            />
            <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-100">
              Qo'shish
            </button>
          </form>
          
          <div className="flex-1 min-h-[300px] space-y-3">
            {notesLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : notes.length > 0 ? (
              notes.map(note => (
                <div key={note.id} className="bg-gray-50 border border-gray-100 p-4 rounded-2xl flex items-start justify-between group/note hover:bg-white hover:shadow-md transition-all">
                  <div className="flex-1">
                    <p className="text-sm text-gray-700 font-medium leading-relaxed">{note.content}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{note.author}</span>
                      <span className="text-[10px] text-gray-300">•</span>
                      <span className="text-[10px] text-gray-400">
                        {note.createdAt && typeof note.createdAt.toDate === 'function' ? note.createdAt.toDate().toLocaleString() : 'Hozir'}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => note.id && handleDeleteNote(note.id)}
                    className="p-2 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover/note:opacity-100"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-300 py-10">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-sm font-bold uppercase tracking-widest">Hozircha qaydlar yo'q</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              </svg>
              Bo'limlar kesimi
            </h3>
            <div className="space-y-4">
              {sectionList.map(section => {
                const count = visitors.filter(v => v.section === section.name).length;
                const percentage = visitors.length > 0 ? (count / visitors.length) * 100 : 0;
                return (
                  <div key={section.name}>
                    <div className="flex justify-between text-[10px] font-bold mb-1 uppercase tracking-tight">
                      <span className="text-gray-500 truncate mr-2">{section.name}</span>
                      <span className="text-gray-900">{count}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div className={`${section.color} h-full rounded-full`} style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

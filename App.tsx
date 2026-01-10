
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase';
import { ViewState, Visitor } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import VisitorForm from './components/VisitorForm';
import VisitorList from './components/VisitorList';
import Statistics from './components/Statistics';
import Ranking from './components/Ranking';
import Login from './components/Login';
import { getAllVisitors, deleteVisitor } from './services/visitorService';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeView, setActiveView] = useState<ViewState>('dashboard');
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const fetchVisitors = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getAllVisitors();
      setVisitors(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchVisitors();
    }
  }, [user]);

  const handleRegistrationSuccess = () => {
    fetchVisitors();
    setSelectedVisitor(null);
    setActiveView('history');
  };

  const handleEditClick = (visitor: Visitor) => {
    setSelectedVisitor(visitor);
    setActiveView('edit');
  };

  const handleDeleteClick = async (id: string) => {
    // Shaxsiy tasdiqlash oynasi
    const confirmed = window.confirm("Haqiqatan ham ushbu foydalanuvchi tashrifini o'chirib tashlamoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi.");
    if (confirmed) {
      try {
        await deleteVisitor(id);
        fetchVisitors(); // Ro'yxatni yangilash
      } catch (error) {
        alert("Xatolik: Ma'lumotni o'chirib bo'lmadi.");
      }
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-6"></div>
        <p className="text-sm font-black text-gray-400 uppercase tracking-[0.3em] animate-pulse">Yuklanmoqda...</p>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-50 text-gray-900 overflow-x-hidden">
      <Sidebar activeView={activeView} onViewChange={(view) => {
        setActiveView(view);
        if (view !== 'edit') setSelectedVisitor(null);
      }} />
      
      <main className="flex-1 w-full max-w-full overflow-hidden p-4 md:p-8 pt-20 lg:pt-8 relative">
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="animate-in slide-in-from-left duration-700">
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
              {activeView === 'dashboard' ? 'Asosiy panel' : 
               activeView === 'register' ? 'Yangi tashrif' : 
               activeView === 'edit' ? 'Tahrirlash' : 
               activeView === 'history' ? 'Tashriflar boshqaruvi' : 
               activeView === 'stats' ? 'Statistik tahlil' : 'Ballar reytingi'}
            </h1>
            <p className="text-sm md:text-base font-bold text-gray-400 mt-1 uppercase tracking-widest">ARM ADMIN v2.5</p>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
             <button 
              onClick={() => {
                setSelectedVisitor(null);
                setActiveView('register');
              }}
              className="flex-1 md:flex-none justify-center bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-blue-200 transition-all active:scale-95 flex items-center gap-3"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Tashrif qo'shish
            </button>
            <button 
              onClick={fetchVisitors}
              disabled={loading}
              className="p-4 bg-white border border-gray-100 rounded-2xl text-gray-500 hover:text-blue-600 transition-all shadow-md active:scale-90 disabled:opacity-50"
              title="Ma'lumotlarni yangilash"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </header>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
          {activeView === 'dashboard' && <Dashboard visitors={visitors} loading={loading} onRefresh={fetchVisitors} />}
          {(activeView === 'register' || activeView === 'edit') && (
            <VisitorForm 
              initialData={selectedVisitor || undefined} 
              onSuccess={handleRegistrationSuccess} 
              onCancel={() => {
                setSelectedVisitor(null);
                setActiveView('history');
              }} 
            />
          )}
          {activeView === 'history' && (
            <VisitorList 
              visitors={visitors} 
              loading={loading} 
              onEdit={handleEditClick} 
              onDelete={handleDeleteClick} 
            />
          )}
          {activeView === 'stats' && <Statistics visitors={visitors} />}
          {activeView === 'ranking' && <Ranking visitors={visitors} />}
        </div>
      </main>
    </div>
  );
};

export default App;

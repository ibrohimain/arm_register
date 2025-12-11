// src/pages/MyVisits.jsx
import { useState, useEffect } from 'react';
import { db } from '../firebase.js';
import { collection, query, where, getDocs } from "firebase/firestore";
import { format } from 'date-fns';
import { Search, User, Calendar, BookOpen, Building } from 'lucide-react';

const MyVisits = () => {
  const [ism, setIsm] = useState('');
  const [familiya, setFamiliya] = useState('');
  const [tashriflar, setTashriflar] = useState([]);
  const [loading, setLoading] = useState(false);
  const [found, setFound] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!ism.trim() || !familiya.trim()) {
      alert("Iltimos, ism va familiyangizni to‘liq kiriting");
      return;
    }

    setLoading(true);
    setFound(false);

    try {
      const q = query(
        collection(db, "visitors"),
        where("ism", "==", ism.trim()),
        where("familiya", "==", familiya.trim())
      );

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => doc.data());

      // Sana bo‘yicha tartiblash
      data.sort((a, b) => {
        const dateA = new Date(a.sana.split('.').reverse().join('-'));
        const dateB = new Date(b.sana.split('.').reverse().join('-'));
        return dateB - dateA;
      });

      setTashriflar(data);
      setFound(true);
    } catch (err) {
      alert("Ma'lumot topilmadi yoki xatolik yuz berdi");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Sarlavha */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
            Mening tashriflarim
          </h1>
          <p className="text-xl text-gray-700">
            JizPI Axborot-Resurs Markaziga qilgan tashriflaringizni ko‘ring
          </p>
        </div>

        {/* Qidiruv formasi */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <User className="absolute left-4 top-5 text-gray-400 w-6 h-6" />
              <input
                type="text"
                placeholder="Ismingiz (masalan: Ali)"
                value={ism}
                onChange={(e) => setIsm(e.target.value)}
                className="w-full pl-14 pr-6 py-5 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none text-lg"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
              />
            </div>
            <div className="relative">
              <User className="absolute left-4 top-5 text-gray-400 w-6 h-6" />
              <input
                type="text"
                placeholder="Familiyangiz (masalan: Valiev)"
                value={familiya}
                onChange={(e) => setFamiliya(e.target.value)}
                className="w-full pl-14 pr-6 py-5 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:outline-none text-lg"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
              />
            </div>
          </div>

          <button
            onClick={handleSearch}
            disabled={loading}
            className="mt-6 w-full py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-xl rounded-2xl hover:from-blue-700 hover:to-purple-700 transition transform hover:scale-105 flex items-center justify-center gap-3"
          >
            <Search className="w-6 h-6" />
            {loading ? "Qidirilmoqda..." : "TASHRIQLARIMNI KO‘RISH"}
          </button>
        </div>

        {/* Natijalar */}
        {found && (
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 text-center">
              <h2 className="text-3xl font-bold">
                {ism} {familiya}
              </h2>
              <p className="text-xl mt-2">Jami: {tashriflar.length} marta tashrif</p>
            </div>

            {tashriflar.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <p className="text-2xl">Hech qanday tashrif topilmadi</p>
              </div>
            ) : (
              <div className="divide-y">
                {tashriflar.map((t, i) => (
                  <div key={i} className="p-6 hover:bg-gray-50 transition">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-lg">
                      <div className="flex items-center gap-3">
                        <Calendar className="text-blue-600" />
                        <span className="font-semibold">{t.sana}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <BookOpen className="text-purple-600" />
                        <span>{t.resurs}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Building className="text-green-600" />
                        <span>{t.fakultet || "—"}</span>
                      </div>
                      <div className="text-right font-bold text-blue-600">
                        №{t.tartib}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyVisits;
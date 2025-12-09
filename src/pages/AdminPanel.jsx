// src/pages/AdminPanel.jsx   ← TO‘LIQ YANGI VERSIYA (NUSXA OLING!)

import { useState, useEffect } from 'react';
import { db, auth } from "../firebase.js";
import { 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  doc, 
  deleteDoc 
} from "firebase/firestore";
import { useNavigate } from 'react-router-dom';
import EntryForm from '../components/EntryForm';
import * as XLSX from 'xlsx';

const AdminPanel = () => {
  const [visitors, setVisitors] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedResurs, setSelectedResurs] = useState("");
  const navigate = useNavigate();

  const resurslar = [
    "Direktor qabuli",
    "Ilmiy zal",
    "Elektron axborot bo'limi",
    "O'quv zali",
    "ARM fondidan kitob olish",
    "Kitob hadya etish",
    "Bo'limlarda shaxsiy va jamoaviy ish"
  ];

  // Real-time ma'lumot olish
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (!user) navigate('/login');
    });

    const q = query(collection(db, "visitors"), orderBy("createdAt", "desc"));
    const unsubscribeData = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setVisitors(data);
      setFiltered(data);
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeData();
    };
  }, [navigate]);

  // Filter va qidiruv
  useEffect(() => {
    let result = [...visitors];

    if (search) {
      const s = search.toLowerCase();
      result = result.filter(v =>
        v.ism?.toLowerCase().includes(s) ||
        v.familiya?.toLowerCase().includes(s) ||
        v.guruh?.toLowerCase().includes(s)
      );
    }

    if (selectedDate) {
      const formatted = new Date(selectedDate).toLocaleDateString('uz-UZ');
      result = result.filter(v => v.sana === formatted);
    }

    if (selectedResurs) {
      result = result.filter(v => v.resurs === selectedResurs);
    }

    setFiltered(result);
  }, [search, selectedDate, selectedResurs, visitors]);

  // O‘CHIRISH FUNKSIYASI
  const handleDelete = async (id, ism, familiya) => {
    if (!window.confirm(`${ism} ${familiya} haqidagi ma'lumotni rostdan ham o‘chirmoqchimisiz?\nBu amal qaytarilmaydi!`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, "visitors", id));
      alert("Ma'lumot muvaffaqiyatli o‘chirildi!");
    } catch (err) {
      console.error("O‘chirish xatosi:", err);
      alert("Xato yuz berdi: " + err.message);
    }
  };

  // Excel export
  const exportToExcel = () => {
    const dataForExcel = filtered.map((v, i) => ({
      '№': i + 1,
      'Sana': v.sana,
      'Tartib': v.tartib,
      'Ism': v.ism,
      'Familiya': v.familiya,
      'To‘liq F.I.Sh': `${v.ism} ${v.familiya}`,
      'Guruh': v.guruh,
      'Fakultet': v.fakultet,
      'Resurs': v.resurs,
      'Turi': v.ichkiTashqi
    }));

    const ws = XLSX.utils.json_to_sheet(dataForExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Foydalanuvchilar");

    const today = new Date().toLocaleDateString('uz-UZ').replace(/\./g, '-');
    XLSX.writeFile(wb, `ARM_hisobot_${selectedResurs || 'hammasi'}_${today}.xlsx`);
  };

  const today = new Date().toLocaleDateString('uz-UZ');
  const todayCount = visitors.filter(v => v.sana === today).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black-50 to-purple-50 dark:bg-gray-900 p-4 md:p-8 border-black">
      <div className="max-w-7xl mx-auto bg-[white] p-10 rounded-2xl shadow-2xl">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-black">
            Axborot resurs markazi 
          </h1>
          <button
            onClick={() => auth.signOut().then(() => navigate('/login'))}
            className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition transform hover:scale-105 cursor-pointer"
          >
            Chiqish
          </button>
        </div>

        {/* Statistika */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-2xl text-white shadow-xl">
            <h3 className="text-xl">Bugun</h3>
            <p className="text-5xl font-bold mt-2">{todayCount}</p>
          </div>
          <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 rounded-2xl text-white shadow-xl">
            <h3 className="text-xl">Jami</h3>
            <p className="text-5xl font-bold mt-2">{visitors.length}</p>
          </div>
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 rounded-2xl text-white shadow-xl">
            <h3 className="text-xl">Tanlangan resurs</h3>
            <p className="text-2xl font-bold mt-2">{selectedResurs || "Hammasi"}</p>
          </div>
          <div className="bg-gradient-to-r from-orange-600 to-red-600 p-6 rounded-2xl text-white shadow-xl">
            <h3 className="text-xl">Natija</h3>
            <p className="text-5xl font-bold mt-2">{filtered.length}</p>
          </div>
        </div>

        {/* Filterlar */}
        <div className="bg-white dark:bg-[#e5e4e4] p-6 rounded-2xl shadow-xl mb-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-black">Filterlar</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <input
              type="text"
              placeholder="Ism, familiya yoki guruh..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="p-4 border-2 border-gray-300 dark:border-blue-600 rounded-xl focus:border-blue-500 dark:bg-white-700 outline-none"
            />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="p-4 border-2 border-gray-300 dark:border-blue-600 rounded-xl focus:border-blue-500 dark:bg-white-700 outline-none"
            />
            <select
              value={selectedResurs}
              onChange={(e) => setSelectedResurs(e.target.value)}
             className="p-4 border-2 border-gray-300 dark:border-blue-600 rounded-xl focus:border-blue-500 dark:bg-white-700 outline-none"
            >
              <option value="">Barcha resurslar</option>
              {resurslar.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <button
              onClick={() => {
                setSearch("");
                setSelectedDate("");
                setSelectedResurs("");
              }}
              className="px-6 py-4 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-bold"
            >
              Tozalash
            </button>
          </div>
        </div>

        {/* Forma */}
        <EntryForm />

        {/* Jadval + O‘chirish */}
        <div className="mt-12 bg-white dark:bg-[#e5e4e4] rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-6 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-2xl font-bold">Foydalanuvchilar ({filtered.length})</h2>
            <button onClick={exportToExcel} className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl flex items-center gap-2">
              Excel yuklab olish
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-100 dark:bg-gray-400">
                <tr>
                  <th className="px-6 py-4">№</th>
                  <th className="px-6 py-4">Sana</th>
                  <th className="px-6 py-4">Tartib</th>
                  <th className="px-6 py-4">F.I.Sh</th>
                  <th className="px-6 py-4">Guruh</th>
                  <th className="px-6 py-4">Fakultet</th>
                  <th className="px-6 py-4">Resurs</th>
                  <th className="px-6 py-4">Turi</th>
                  <th className="px-6 py-4 text-center">Amallar</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="9" className="text-center py-16 text-gray-500 text-xl">Yuklanmoqda...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan="9" className="text-center py-16 text-gray-500 text-xl">Ma'lumot topilmadi</td></tr>
                ) : (
                  filtered.map((v, i) => (
                    <tr key={v.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                      <td className="px-6 py-4">{i + 1}</td>
                      <td className="px-6 py-4">{v.sana}</td>
                      <td className="px-6 py-4 font-bold text-blue-600">{v.tartib}</td>
                      <td className="px-6 py-4 font-medium">{v.ism} {v.familiya}</td>
                      <td className="px-6 py-4">{v.guruh}</td>
                      <td className="px-6 py-4">{v.fakultet}</td>
                      <td className="px-6 py-4 text-sm">{v.resurs}</td>
                      <td className="px-6 py-4">
                        <span className={`px-4 py-1 rounded-full text-xs font-medium ${v.ichkiTashqi === 'ichki' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'}`}>
                          {v.ichkiTashqi}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleDelete(v.id, v.ism, v.familiya)}
                          className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition transform hover:scale-110 shadow-md"
                        >
                          O‘chirish
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminPanel;
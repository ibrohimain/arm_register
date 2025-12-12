// src/pages/AdminPanel.jsx  ← 2025-YIL SUPER VERSIYASI + TAHRIRLASH FUNKSIYASI (takomillashtirilgan)
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { db, auth } from "../firebase.js";
import {
  collection, onSnapshot, query, orderBy, doc, deleteDoc, updateDoc
} from "firebase/firestore";
import { useNavigate } from 'react-router-dom';
import EntryForm from '../components/EntryForm';
import * as XLSX from 'xlsx';
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval, subDays, subMonths, addMonths,
  isSameDay, startOfWeek, endOfWeek
} from 'date-fns';
import { uz } from 'date-fns/locale';
import {
  Users, Calendar, TrendingUp, Download, LogOut, Filter, PieChart,
  Activity, Award, FileText, ChevronLeft, ChevronRight, ArrowUpDown, Trophy, Edit3
} from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Konstanta — komponent tashqarisida
const RESURSLAR_STATIC = [
  "Direktor qabuli","ARMga tashrif","Elektron axborot resurslar bo'limi", "Xorijiy axborot bo'limi",
  "Ilmiy zal", "ARM fondidan kitob olish va o'qish", "O'quv zali", "Kitob hadya etish",
  "Bo'limlarda shaxsiy va jamoaviy ish"
];

const ITEMS_PER_PAGE = 20;
const SEARCH_DEBOUNCE_MS = 300;

const AdminPanel = () => {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters / UI
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedResurs, setSelectedResurs] = useState("");
  const [selectedFakultet, setSelectedFakultet] = useState("");
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

  const navigate = useNavigate();

  // Edit modal
  const [editingVisitor, setEditingVisitor] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Debounce ref
  const searchTimeout = useRef(null);

  // Build fakultetlar from visitors (memo)
  const fakultetlar = useMemo(() => {
    const unique = [...new Set(visitors.map(v => v.fakultet).filter(Boolean))];
    return unique.sort();
  }, [visitors]);

  // Firestore real-time subscription — ONLY on mount
  useEffect(() => {
    // auth check
    const unsubAuth = auth.onAuthStateChanged(user => {
      if (!user) navigate('/login');
    });

    const q = query(collection(db, "visitors"), orderBy("createdAt", "desc"));
    const unsubData = onSnapshot(q, snap => {
      try {
        const data = snap.docs.map(d => {
          const raw = d.data();
          return {
            id: d.id,
            ...raw,
            // createdAt may be undefined for legacy items
            createdAt: raw.createdAt ? raw.createdAt.toDate() : null
          };
        });
        setVisitors(data);
        setLoading(false);
        setError(null);
      } catch (err) {
        setError("Ma'lumotlarni olishda xato: " + err.message);
        setLoading(false);
      }
    }, err => {
      setError("Snapshot xatosi: " + err.message);
      setLoading(false);
    });

    return () => {
      // cleanup in reverse order (unsubscribe snapshot then auth)
      try { unsubData(); } catch (e) {}
      try { unsubAuth(); } catch (e) {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]); // only navigate as dep

  // Debounce effect for searchTerm -> debouncedSearch
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setCurrentPage(1); // reset page when new search applied
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [searchTerm]);

  // Reset page when other filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedDate, selectedResurs, selectedFakultet]);

  // Statistics (memoized)
  const stats = useMemo(() => {
    const todayStr = format(new Date(), 'dd.MM.yyyy');
    const dailyVisits = {};

    visitors.forEach(v => {
      const sana = (v.sana || '').toString().trim();
      if (sana && sana.length === 10) {
        dailyVisits[sana] = (dailyVisits[sana] || 0) + (v.groupSize || 1);
      }
    });

    let todayCount = dailyVisits[todayStr] || 0;
    const todayFromTimestamp = visitors.reduce((acc, v) => acc + (v.createdAt && isSameDay(v.createdAt, new Date()) ? (v.groupSize || 1) : 0), 0);
    if (todayCount === 0 && todayFromTimestamp > 0) todayCount = todayFromTimestamp;

    const thisMonthStart = startOfMonth(new Date());
    const lastMonthStart = startOfMonth(subMonths(new Date(), 1));

    const monthCount = visitors.reduce((acc, v) => acc + (v.createdAt && v.createdAt >= thisMonthStart ? (v.groupSize || 1) : 0), 0);
    const lastMonthCount = visitors.reduce((acc, v) => acc + (v.createdAt && v.createdAt >= lastMonthStart && v.createdAt < thisMonthStart ? (v.groupSize || 1) : 0), 0);
    const totalCount = visitors.reduce((acc, v) => acc + (v.groupSize || 1), 0);

    const resursStat = RESURSLAR_STATIC.map(r => ({
      name: r,
      count: visitors.reduce((acc, v) => acc + (v.resurs === r ? (v.groupSize || 1) : 0), 0),
      percent: totalCount ? Math.round((visitors.reduce((acc, v) => acc + (v.resurs === r ? (v.groupSize || 1) : 0), 0) / totalCount) * 100) : 0
    }));

    const fakultetStat = fakultetlar.map(f => ({
      name: f,
      count: visitors.reduce((acc, v) => acc + (v.fakultet === f ? (v.groupSize || 1) : 0), 0),
      percent: totalCount ? Math.round((visitors.reduce((acc, v) => acc + (v.fakultet === f ? (v.groupSize || 1) : 0), 0) / totalCount) * 100) : 0
    }));

    const ichkiCount = visitors.reduce((acc, v) => acc + (v.ichkiTashqi === 'ichki' ? (v.groupSize || 1) : 0), 0);
    const tashqiCount = totalCount - ichkiCount;

    const last30Days = eachDayOfInterval({ start: subDays(new Date(), 29), end: new Date() })
      .map(d => ({
        date: format(d, 'dd'),
        fullDate: format(d, 'dd.MM.yyyy'),
        count: dailyVisits[format(d, 'dd.MM.yyyy')] || 0,
        isToday: isSameDay(d, new Date())
      }))
      .reverse();

    const maxDay = Object.entries(dailyVisits).sort((a, b) => b[1] - a[1])[0] || ['-', 0];

    // monthly top
    const monthlyVisits = {};
    visitors.forEach(v => {
      if (v.createdAt) {
        const monthKey = format(v.createdAt, 'yyyy-MM');
        if (!monthlyVisits[monthKey]) monthlyVisits[monthKey] = {};
        const fak = v.fakultet || "Noma'lum";
        monthlyVisits[monthKey][fak] = (monthlyVisits[monthKey][fak] || 0) + (v.groupSize || 1);
      }
    });

    const monthlyTop = Object.entries(monthlyVisits)
      .map(([month, faks]) => {
        const sorted = Object.entries(faks)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map((item, idx) => ({
            rank: idx + 1,
            fakultet: item[0],
            count: item[1]
          }));

        return {
          monthKey: month,
          monthName: format(new Date(`${month}-01`), 'MMMM yyyy', { locale: uz }),
          top3: sorted
        };
      })
      .sort((a, b) => a.monthKey.localeCompare(b.monthKey));

    return {
      todayCount,
      monthCount,
      lastMonthCount,
      totalCount,
      resursStat,
      fakultetStat,
      ichkiPercent: totalCount ? Math.round((ichkiCount / totalCount) * 100) : 0,
      tashqiPercent: totalCount ? Math.round((tashqiCount / totalCount) * 100) : 0,
      last30Days,
      maxDay,
      growth: lastMonthCount ? Math.round(((monthCount - lastMonthCount) / lastMonthCount) * 100) : 0,
      dailyVisits,
      monthlyTop
    };
  }, [visitors, fakultetlar]);

  // Filtering + Sorting (memoized)
  const sortedAndFiltered = useMemo(() => {
    let result = [...visitors];

    // Search: use debouncedSearch
    if (debouncedSearch) {
      const s = debouncedSearch.toLowerCase();
      result = result.filter(v =>
        `${v.ism || ''} ${v.familiya || ''} ${v.guruh || ''} ${v.fakultet || ''}`.toLowerCase().includes(s)
      );
    }

    if (selectedDate) {
      // selectedDate is yyyy-MM-dd (from date input or calendar)
      try {
        const formatted = format(new Date(selectedDate), 'dd.MM.yyyy');
        result = result.filter(v => v.sana === formatted);
      } catch (e) { /* invalid date */ }
    }

    if (selectedResurs) result = result.filter(v => v.resurs === selectedResurs);
    if (selectedFakultet) result = result.filter(v => v.fakultet === selectedFakultet);

    // Sorting helper
    const compare = (a, b) => {
      const key = sortConfig.key;
      let aVal = a[key];
      let bVal = b[key];

      // special for createdAt
      if (key === 'createdAt') {
        aVal = a.createdAt || new Date(0);
        bVal = b.createdAt || new Date(0);
        return (aVal < bVal ? -1 : aVal > bVal ? 1 : 0) * (sortConfig.direction === 'asc' ? 1 : -1);
      }

      // numeric fields (tartib, groupSize)
      if (key === 'tartib' || key === 'groupSize') {
        const aNum = parseInt(aVal || '0', 10);
        const bNum = parseInt(bVal || '0', 10);
        return (aNum - bNum) * (sortConfig.direction === 'asc' ? 1 : -1);
      }

      // fallback string compare
      const aStr = (aVal || '').toString();
      const bStr = (bVal || '').toString();
      return aStr.localeCompare(bStr, undefined, { numeric: true }) * (sortConfig.direction === 'asc' ? 1 : -1);
    };

    result.sort(compare);
    return result;
  }, [visitors, debouncedSearch, selectedDate, selectedResurs, selectedFakultet, sortConfig]);

  // Pagination
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedAndFiltered.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedAndFiltered, currentPage]);

  const totalPages = Math.ceil(sortedAndFiltered.length / ITEMS_PER_PAGE) || 1;

  // Handlers
  const requestSort = useCallback((key) => {
    setSortConfig(prev => {
      let direction = 'desc';
      if (prev.key === key && prev.direction === 'desc') direction = 'asc';
      return { key, direction };
    });
  }, []);

  const handleDelete = useCallback(async (id, ism, familiya) => {
    if (window.confirm(`${ism} ${familiya} ni o'chirishni tasdiqlang?`)) {
      try {
        await deleteDoc(doc(db, "visitors", id));
      } catch (err) {
        alert("Xato: " + err.message);
      }
    }
  }, []);

  const handleEdit = useCallback((visitor) => {
    setEditingVisitor(visitor);
    setIsEditModalOpen(true);
  }, []);

  const handleSaveEdit = useCallback(async (id, updatedData) => {
    try {
      await updateDoc(doc(db, "visitors", id), {
  ...updatedData,
  updatedAt: new Date(),
  // Agar groupSize 1 bo'lsa yoki yo'q bo'lsa — maydonni o'chiramiz
  ...(updatedData.groupSize > 1 ? { groupSize: Number(updatedData.groupSize) } : { groupSize: null }),
});
      setIsEditModalOpen(false);
    } catch (err) {
      alert("Yangilashda xato: " + err.message);
    }
  }, []);

  // Exports
  const exportToExcel = useCallback(() => {
    const data = sortedAndFiltered.map((v, i) => ({
      '№': i + 1,
      'Sana': v.sana || '',
      'Tartib': v.tartib || '',
      'F.I.Sh': v.groupSize ? `Jamoa: ${v.groupSize} kishi` : `${v.ism || ''} ${v.familiya || ''}`,
      'Guruh': v.guruh || '',
      'Fakultet': v.fakultet || '',
      'Resurs': v.resurs || '',
      'Turi': v.ichkiTashqi || ''
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Hisobot");
    XLSX.writeFile(wb, `ARM_Hisobot_${format(new Date(), 'dd-MM-yyyy')}.xlsx`);
  }, [sortedAndFiltered]);

  const exportToPDF = useCallback(() => {
    const pdf = new jsPDF();
    pdf.setFontSize(18);
    pdf.text("JizPI ARM Hisoboti", 20, 20);
    pdf.setFontSize(12);
    pdf.text(`Sana: ${format(new Date(), 'dd.MM.yyyy')}`, 20, 30);
    pdf.text(`Jami: ${stats.totalCount} ta tashrif`, 20, 40);

    const dailyEntries = Object.entries(stats.dailyVisits || {})
      .sort((a, b) => {
        // sort by date ascending dd.MM.yyyy
        const aParts = a[0].split('.').map(Number).reverse(); // yyyy,MM,dd
        const bParts = b[0].split('.').map(Number).reverse();
        return aParts.join('') - bParts.join('');
      });

    pdf.autoTable({
      head: [['Kun', 'Tashriflar']],
      body: dailyEntries.map(([kun, son]) => [kun, son]),
      startY: 50
    });

    pdf.addPage();
    pdf.text("Resurs bo'yicha statistika", 20, 20);
    pdf.autoTable({
      head: [['Resurs', 'Son', 'Foiz']],
      body: stats.resursStat.map(r => [r.name, r.count, `${r.percent}%`])
    });

    pdf.addPage();
    pdf.text("Fakultet bo'yicha statistika", 20, 20);
    pdf.autoTable({
      head: [['Fakultet', 'Son', 'Foiz']],
      body: stats.fakultetStat.map(f => [f.name, f.count, `${f.percent}%`])
    });

    pdf.save(`ARM_Hisobot_${format(new Date(), 'dd-MM-yyyy')}.pdf`);
  }, [stats]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            JizPI ARM Admin Panel (2025)
          </h1>
          <button
            onClick={() => auth.signOut().then(() => navigate('/login')).catch(err => setError("Chiqishda xato: " + err.message))}
            className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition flex items-center gap-2"
          >
            <LogOut size={20} /> Chiqish
          </button>
        </div>

        {error && <div className="bg-red-100 p-4 rounded-xl text-red-700">{error}</div>}

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard icon={Activity} title="Bugun" value={stats.todayCount} subtitle="ta tashrif" color="from-blue-500 to-indigo-600" />
          <StatCard icon={TrendingUp} title="Bu oy" value={stats.monthCount} subtitle={`O'sish: ${stats.growth > 0 ? '+' : ''}${stats.growth}%`} color="from-green-500 to-emerald-600" />
          <StatCard icon={Users} title="Jami" value={stats.totalCount} subtitle="barcha tashriflar" color="from-purple-500 to-pink-600" />
          <StatCard icon={Award} title="Eng faol kun" value={stats.maxDay[1]} subtitle={stats.maxDay[0]} color="from-orange-500 to-red-600" />
        </div>

        {/* Top-3 + Calendar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* TOP-3 */}
          <div className="bg-white p-6 rounded-3xl shadow-xl">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-800">
              <Trophy className="text-yellow-500" size={32} />
              Har oy eng faol fakultetlar (TOP-3)
            </h3>
            <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
              {stats.monthlyTop.length === 0 ? (
                <p className="text-center text-gray-500 py-12">Hozircha ma'lumot yo'q</p>
              ) : (
                stats.monthlyTop.map((monthData, i) => (
                  <div key={i} className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-5 shadow-md hover:shadow-xl transition-all">
                    <h4 className="font-bold text-lg text-indigo-700 mb-4">{monthData.monthName}</h4>
                    <div className="space-y-3">
                      {monthData.top3.map((item) => (
                        <div key={item.rank} className="flex items-center justify-between p-4 bg-white rounded-xl shadow hover:scale-105 transition-all">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg
                              ${item.rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                                item.rank === 2 ? 'bg-gradient-to-br from-gray-400 to-gray-600' :
                                  'bg-gradient-to-br from-orange-600 to-red-700'}`}
                            >
                              #{item.rank}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800">{item.fakultet}</p>
                              <p className="text-sm text-gray-600">
                                {item.rank === 1 ? "Oltin medal" : item.rank === 2 ? "Kumush medal" : "Bronza medal"}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-3xl font-bold text-indigo-600">{item.count}</p>
                            <p className="text-sm text-gray-600">tashrif</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Kalendar */}
          <div className="bg-white p-6 rounded-3xl shadow-xl">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Calendar /> Kalendar</h3>
            <div className="flex justify-between mb-4">
              <button onClick={() => setCalendarDate(subMonths(calendarDate, 1))} className="p-2 bg-gray-200 rounded hover:bg-gray-300"><ChevronLeft /></button>
              <span className="text-lg font-bold">{format(calendarDate, 'MMMM yyyy', { locale: uz })}</span>
              <button onClick={() => setCalendarDate(addMonths(calendarDate, 1))} className="p-2 bg-gray-200 rounded hover:bg-gray-300"><ChevronRight /></button>
            </div>
            <div className="grid grid-cols-7 gap-2 text-center text-sm">
              {['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sha', 'Ya'].map(day => <div key={day} className="font-bold text-gray-700">{day}</div>)}
              {(() => {
                const monthStart = startOfMonth(calendarDate);
                const monthEnd = endOfMonth(calendarDate);
                const weekStart = startOfWeek(monthStart, { locale: uz });
                const weekEnd = endOfWeek(monthEnd, { locale: uz });
                const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
                return days.map((day, i) => {
                  const formatted = format(day, 'dd.MM.yyyy');
                  const count = stats.dailyVisits[formatted] || 0;
                  const isCurrentMonth = day.getMonth() === calendarDate.getMonth();
                  return (
                    <button
                      key={i}
                      onClick={() => isCurrentMonth && setSelectedDate(format(day, 'yyyy-MM-dd'))}
                      className={`p-3 rounded-full text-sm font-medium transition-all
                        ${!isCurrentMonth ? 'text-gray-400' : ''}
                        ${count > 0 ? 'bg-indigo-100 hover:bg-indigo-200 text-indigo-700' : 'hover:bg-gray-100'}
                        ${isSameDay(day, new Date()) ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}`}
                      disabled={!isCurrentMonth}
                    >
                      {format(day, 'd')}
                      {count > 0 && <div className="text-xs mt-1 font-bold">{count}</div>}
                    </button>
                  );
                });
              })()}
            </div>
          </div>
        </div>

        {/* Pie charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StatPieChart title="Resurs bo'yicha" data={stats.resursStat} />
          <StatPieChart title="Fakultet bo'yicha" data={stats.fakultetStat} />
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-3xl shadow-xl">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Filter /> Filterlar</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input type="text" placeholder="Qidiruv (F.I.Sh, guruh)..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="p-4 border rounded-xl" />
            <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="p-4 border rounded-xl" />
            <select value={selectedResurs} onChange={e => setSelectedResurs(e.target.value)} className="p-4 border rounded-xl">
              <option value="">Barcha resurslar</option>
              {RESURSLAR_STATIC.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <select value={selectedFakultet} onChange={e => setSelectedFakultet(e.target.value)} className="p-4 border rounded-xl">
              <option value="">Barcha fakultetlar</option>
              {fakultetlar.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <button onClick={() => { setSearchTerm(""); setDebouncedSearch(""); setSelectedDate(""); setSelectedResurs(""); setSelectedFakultet(""); setCurrentPage(1); }}
            className="mt-4 px-6 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-700">
            Filterlarni tozalash
          </button>
        </div>

        <EntryForm />

        {/* Table */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b">
            <h3 className="text-xl font-bold">Tashrifchilar ro'yxati ({sortedAndFiltered.length})</h3>
            <div className="flex gap-4">
              <button onClick={exportToExcel} className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700">
                <Download size={20} /> Excel
              </button>
              <button onClick={exportToPDF} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700">
                <FileText size={20} /> PDF
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-4">№</th>
                  <th className="p-4 cursor-pointer" onClick={() => requestSort('sana')}>Sana <ArrowUpDown size={16} className="inline" /></th>
                  <th className="p-4 cursor-pointer" onClick={() => requestSort('tartib')}>Tartib</th>
                  <th className="p-4 cursor-pointer" onClick={() => requestSort('ism')}>F.I.Sh</th>
                  <th className="p-4 cursor-pointer" onClick={() => requestSort('guruh')}>Guruh</th>
                  <th className="p-4 cursor-pointer" onClick={() => requestSort('fakultet')}>Fakultet</th>
                  <th className="p-4 cursor-pointer" onClick={() => requestSort('resurs')}>Resurs</th>
                  <th className="p-4 cursor-pointer" onClick={() => requestSort('ichkiTashqi')}>Turi</th>
                  <th className="p-4">Amallar</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="9" className="text-center p-12">Yuklanmoqda...</td></tr>
                ) : paginatedData.length === 0 ? (
                  <tr><td colSpan="9" className="text-center p-12 text-gray-500">Ma'lumot topilmadi</td></tr>
                ) : (
                  paginatedData.map((v, i) => (
                    <tr key={v.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">{(currentPage - 1) * ITEMS_PER_PAGE + i + 1}</td>
                      <td className="p-4">{v.sana}</td>
                      <td className="p-4">{v.tartib}</td>
                      <td className="p-4 font-medium">
                        {v.groupSize ? `Jamoa: ${v.groupSize} kishi` : `${v.ism} ${v.familiya}`}
                      </td>
                      <td className="p-4">{v.guruh}</td>
                      <td className="p-4">{v.fakultet}</td>
                      <td className="p-4">{v.resurs}</td>
                      <td className="p-4">{v.ichkiTashqi}</td>
                      <td className="p-4 space-x-2 grid grid-cols-1 gap-1">
                        <button
                          onClick={() => handleEdit(v)}
                          className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm flex items-center"
                        >
                          <Edit3 size={16} /> Tahrirlash
                        </button>
                        <button
                          onClick={() => handleDelete(v.id, v.ism, v.familiya)}
                          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                        >
                          O'chirish
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="p-6 flex justify-center items-center gap-8 border-t">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                className="p-3 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300">
                <ChevronLeft />
              </button>
              <span className="font-medium text-lg">Sahifa {currentPage} / {totalPages}</span>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                className="p-3 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300">
                <ChevronRight />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* EDIT MODAL */}
      {isEditModalOpen && (
        <EditModal
          visitor={editingVisitor}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
};

// Helper components
const StatCard = ({ icon: Icon, title, value, subtitle, color }) => (
  <div className={`p-6 rounded-3xl text-white shadow-xl bg-gradient-to-br ${color} transform hover:scale-105 transition-all`}>
    <div className="flex justify-between items-start">
      <div>
        <p className="opacity-90 text-sm">{title}</p>
        <p className="text-5xl font-bold mt-2">{value}</p>
        <p className="text-sm opacity-80 mt-2">{subtitle}</p>
      </div>
      <Icon size={48} className="opacity-40" />
    </div>
  </div>
);

// Avoid mutating props inside component
const StatPieChart = ({ title, data }) => {
  const sorted = useMemo(() => {
    return Array.isArray(data) ? [...data].sort((a, b) => b.count - a.count) : [];
  }, [data]);

  return (
    <div className="bg-white p-6 rounded-3xl shadow-xl">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><PieChart /> {title}</h3>
      <div className="space-y-4">
        {sorted.map((item, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="w-48 truncate text-sm font-medium">{item.name}</div>
            <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600" style={{ width: `${item.percent}%` }}></div>
            </div>
            <div className="w-24 text-right">
              <span className="font-bold text-indigo-700">{item.count}</span>
              <span className="text-gray-500 ml-1">({item.percent}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// EditModal (updated for groupSize)
const EditModal = ({ visitor, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    ism: '', familiya: '', guruh: '', fakultet: '', resurs: '', ichkiTashqi: 'ichki', sana: '', tartib: '', groupSize: 1
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visitor) {
      setFormData({
        ism: visitor.ism || '',
        familiya: visitor.familiya || '',
        guruh: visitor.guruh || '',
        fakultet: visitor.fakultet || '',
        resurs: visitor.resurs || '',
        ichkiTashqi: visitor.ichkiTashqi || 'ichki',
        sana: visitor.sana || '',
        tartib: visitor.tartib || '',
        groupSize: visitor.groupSize || 1
      });
    }
  }, [visitor]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // basic validation
    if (!formData.fakultet.trim()) {
      alert("Fakultet to'ldirilishi shart.");
      return;
    }
    if (formData.groupSize > 1 && !formData.guruh.trim()) {
      alert("Jamoa uchun guruh raqami shart.");
      return;
    }
    if (formData.groupSize <= 1 && (!formData.ism.trim() || !formData.familiya.trim())) {
      alert("Individual uchun Ism va Familiya to'ldirilishi shart.");
      return;
    }
    setSaving(true);
    try {
      await onSave(visitor.id, formData);
    } catch (err) {
      alert("Yangilashda xato: " + (err.message || err));
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm">
      <div className="w-full max-w-3xl transform transition-all duration-300 scale-100 opacity-100 animate-in fade-in zoom-in">
        <div className="relative overflow-hidden bg-white rounded-3xl shadow-2xl">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-white bg-opacity-20 rounded-2xl backdrop-blur-sm">
                  <Edit3 size={32} />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">Tashrifchini tahrirlash</h2>
                  <p className="text-white text-opacity-90 mt-1">
                    {visitor?.groupSize ? `Jamoa: ${visitor.groupSize} kishi` : `${visitor?.ism} ${visitor?.familiya}`} • {visitor?.sana}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-3 hover:bg-white hover:bg-opacity-20 rounded-full transition-all duration-200"
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-7">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Group Size (1 = Individual)</label>
                <input type="number" min="1" name="groupSize" value={formData.groupSize} onChange={handleChange} required className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-indigo-500" />
              </div>
              <div className="group">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Guruh</label>
                <input type="text" name="guruh" value={formData.guruh} onChange={handleChange} className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-purple-500" placeholder="241-21" />
              </div>
            </div>

            {formData.groupSize <= 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Ism</label>
                  <input type="text" name="ism" value={formData.ism} onChange={handleChange} required className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-indigo-500" placeholder="Abdulla" />
                </div>
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Familiya</label>
                  <input type="text" name="familiya" value={formData.familiya} onChange={handleChange} required className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-purple-500" placeholder="Karimov" />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Fakultet / Kafedra</label>
                <input type="text" name="fakultet" value={formData.fakultet} onChange={handleChange} required className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl" placeholder="Axborot texnologiyalari fakulteti" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Foydalanilgan resurs</label>
                <select name="resurs" value={formData.resurs} onChange={handleChange} required className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl appearance-none">
                  <option value="">Tanlang</option>
                  {RESURSLAR_STATIC.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tashrif turi</label>
                <div className="grid grid-cols-2 gap-4">
                  <label className="flex items-center p-4 bg-gray-50 rounded-2xl cursor-pointer border-2">
                    <input type="radio" name="ichkiTashqi" value="ichki" checked={formData.ichkiTashqi === 'ichki'} onChange={handleChange} className="sr-only" />
                    <span className="font-medium text-gray-700">Ichki</span>
                  </label>
                  <label className="flex items-center p-4 bg-gray-50 rounded-2xl cursor-pointer border-2">
                    <input type="radio" name="ichkiTashqi" value="tashqi" checked={formData.ichkiTashqi === 'tashqi'} onChange={handleChange} className="sr-only" />
                    <span className="font-medium text-gray-700">Tashqi</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Sana</label>
                <input type="text" name="sana" value={formData.sana} onChange={handleChange} required placeholder="11.12.2025" className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl font-mono text-lg" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tartib raqami</label>
                <input type="text" name="tartib" value={formData.tartib} onChange={handleChange} placeholder="145" className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl font-mono text-lg" />
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-8 border-t border-gray-200">
              <button type="button" onClick={onClose} disabled={saving} className="px-8 py-4 bg-gray-100 text-gray-700 font-semibold rounded-2xl hover:bg-gray-200">Bekor qilish</button>
              <button type="submit" disabled={saving} className="px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-2xl hover:from-indigo-700 hover:to-purple-700 shadow-lg flex items-center gap-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                {saving ? 'Saqlanmoqda...' : 'Saqlash va yangilash'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
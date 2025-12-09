// src/components/EntryForm.jsx

import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { db } from '../firebase.js';   // .js qo‘shilgan!
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  orderBy, 
  limit, 
  getDocs 
} from "firebase/firestore";

const EntryForm = ({ refreshData }) => {
  const [loading, setLoading] = useState(false);

  const getTodayCount = async () => {
    const today = new Date().toLocaleDateString('uz-UZ');
    const q = query(
      collection(db, "visitors"),
      orderBy("createdAt", "desc"),
      limit(500)
    );
    const snapshot = await getDocs(q);
    const todayEntries = snapshot.docs
      .map(doc => doc.data())
      .filter(data => data.sana === today);
    return todayEntries.length + 1;
  };

  const formik = useFormik({
    initialValues: {
      ism: '',
      familiya: '',
      guruh: '',
      fakultet: '',
      resurs: '',
      ichkiTashqi: 'ichki',
    },
    validationSchema: Yup.object({
      ism: Yup.string().required("Ism kiritish shart"),
      familiya: Yup.string().required("Familiya kiritish shart"),
      guruh: Yup.string().required("Guruh raqami shart"),
      fakultet: Yup.string().required("Fakultet kiritish shart"),
      resurs: Yup.string().required("Foydalanilgan resursni tanlang"),
    }),
    onSubmit: async (values, { resetForm }) => {
      setLoading(true);
      try {
        const tartib = await getTodayCount();

        await addDoc(collection(db, "visitors"), {
          ...values,
          sana: new Date().toLocaleDateString('uz-UZ'),
          tartib: tartib,
          createdAt: serverTimestamp(),
        });

        alert("Ma'lumot muvaffaqiyatli qo'shildi!");
        resetForm();
        if (refreshData) refreshData();
      } catch (err) {
        console.error(err);
        alert("Xato: " + err.message);
      } finally {
        setLoading(false);
      }
    },
  });

  // 6 ta resurs – qisqa va tushunarli
  const resurslar = [
    "Direktor qabuli",
    "Ilmiy zal",
    "Elektron axborot bo'limi",
    "O'quv zali",
    "ARM fondidan kitob olish",
    "Kitob hadya etish",
    "Bo'limlarda shaxsiy va jamoaviy ish"
  ];

  return (
    <div className="max-w-[100%] mx-auto p-6 bg-white dark:bg-[#e5e4e4] rounded-xl shadow-xl">
      <h2 className="text-3xl font-bold text-center mb-8 text-blue-600 dark:text-blue-400">
        Yangi foydalanuvchi qo'shish
      </h2>

      <form onSubmit={formik.handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Ism */}
        <div>
          <input
            placeholder="Ism"
            {...formik.getFieldProps('ism')}
            className="w-full p-4 border rounded-lg dark:border-blue-600 focus:ring-4 focus:ring-blue-500 outline-none text-lg"
          />
          {formik.touched.ism && formik.errors.ism && <p className="text-red-500 text-sm mt-1">{formik.errors.ism}</p>}
        </div>

        {/* Familiya */}
        <div>
          <input
            placeholder="Familiya"
            {...formik.getFieldProps('familiya')}
            className="w-full p-4 border rounded-lg dark:border-blue-600 focus:ring-4 focus:ring-blue-500 outline-none text-lg"
          />
          {formik.touched.familiya && formik.errors.familiya && <p className="text-red-500 text-sm mt-1">{formik.errors.familiya}</p>}
        </div>

        {/* Guruh */}
        <div>
          <input
            placeholder="Guruh (511-22)"
            {...formik.getFieldProps('guruh')}
            className="w-full p-4 border rounded-lg dark:border-blue-600 focus:ring-4 focus:ring-blue-500 outline-none text-lg"
          />
          {formik.touched.guruh && formik.errors.guruh && <p className="text-red-500 text-sm mt-1">{formik.errors.guruh}</p>}
        </div>

        {/* Fakultet – o‘zi yozadi */}
        <div>
          <input
            placeholder="Fakultet nomi"
            {...formik.getFieldProps('fakultet')}
            className="w-full p-4 border rounded-lg dark:border-blue-600 focus:ring-4 focus:ring-blue-500 outline-none text-lg"
          />
          {formik.touched.fakultet && formik.errors.fakultet && <p className="text-red-500 text-sm mt-1">{formik.errors.fakultet}</p>}
        </div>

        {/* Resurs – dropdown */}
        <div>
          <select
            {...formik.getFieldProps('resurs')}
            className="w-full p-4 border rounded-lg dark:border-blue-600 focus:ring-4 focus:ring-blue-500 outline-none text-lg"
          >
            <option value="">Foydalanilgan resursni tanlang</option>
            {resurslar.map((r, i) => (
              <option key={i} value={r}>{r}</option>
            ))}
          </select>
          {formik.touched.resurs && formik.errors.resurs && <p className="text-red-500 text-sm mt-1">{formik.errors.resurs}</p>}
        </div>

        {/* Ichki / Tashqi */}
        <div>
          <select
            {...formik.getFieldProps('ichkiTashqi')}
            className="w-full p-4 border rounded-lg dark:border-blue-600 focus:ring-4 focus:ring-blue-500 outline-none text-lg"
          >
            <option value="ichki">Ichki foydalanuvchi</option>
            <option value="tashqi">Tashqi foydalanuvchi</option>
          </select>
        </div>

        {/* Tugma */}
        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-xl rounded-lg text-xl shadow-xl transition transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Saqlanmoqda..." : "KIRITISH"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EntryForm;
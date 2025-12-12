// src/components/EntryForm.jsx

import { useState, useMemo } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { db } from "../firebase.js";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
} from "firebase/firestore";

const FAKULTETLAR = [
  "Transport va Kimyo muhandisligi",
  "Qurilish muhandisligi",
  "Energetika muhandisligi",
  "Kibersport",
  "Sanoat texnologiyalari",
  "Boshqa"
];

const EntryForm = ({ refreshData }) => {
  const [loading, setLoading] = useState(false);
  const [selectedFakultet, setSelectedFakultet] = useState("");
  const [customKafedra, setCustomKafedra] = useState("");
  const [isGroup, setIsGroup] = useState(false);

  const today = new Date().toLocaleDateString("uz-UZ");

  const resurslar = useMemo(
    () =>
      [
        "ARM fondidan kitob olish va o'qish",
        "ARMga tashrif",
        "Bo'limlarda shaxsiy va jamoaviy ish",
        "Direktor qabuli",
        "Elektron axborot resurslar bo'limi",
        "Ilmiy zal",
        "Kitob hadya etish",
        "O'quv zali",
        "Xorijiy axborot bo'limi",
      ].sort(),
    []
  );

  const getTodayCount = async () => {
    const visitorsRef = collection(db, "visitors");
    const q = query(visitorsRef, where("sana", "==", today));
    const snapshot = await getDocs(q);
    return snapshot.size + 1;
  };

  const validationSchema = Yup.object({
    guruh: Yup.string().required("Guruh raqami shart"),
    resurs: Yup.string().required("Resurs tanlanishi shart"),
    ichkiTashqi: Yup.string().required("Turi tanlanishi shart"),
    groupSize: Yup.number().when('isGroup', {
      is: true,
      then: (schema) => schema.min(2, "Jamoa kamida 2 kishi bo'lishi kerak").required("Jamoa soni shart"),
      otherwise: (schema) => schema.min(1).default(1)
    }),
    ism: Yup.string().when('isGroup', {
      is: false,
      then: (schema) => schema.required("Ism kiritish shart"),
    }),
    familiya: Yup.string().when('isGroup', {
      is: false,
      then: (schema) => schema.required("Familiya kiritish shart"),
    }),
  });

  const formik = useFormik({
    initialValues: {
      ism: "",
      familiya: "",
      guruh: "",
      resurs: "",
      ichkiTashqi: "ichki",
      groupSize: 1,
      isGroup: false,
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      setLoading(true);

      try {
        const tartib = await getTodayCount();

        const fakultetValue = selectedFakultet === "Boshqa" && customKafedra.trim() 
          ? customKafedra 
          : `${selectedFakultet}${customKafedra.trim() ? ` - ${customKafedra}` : ''}`;

        if (!fakultetValue.trim()) {
          throw new Error("Fakultet yoki kafedra kiritilishi shart");
        }

        await addDoc(collection(db, "visitors"), {
  ism: values.isGroup ? "Jamoa" : values.ism,
  familiya: values.isGroup ? "" : values.familiya,
  guruh: values.guruh,
  fakultet: fakultetValue,
  resurs: values.resurs,
  ichkiTashqi: values.ichkiTashqi,
  sana: today,
  tartib,
  createdAt: serverTimestamp(),

  // Faqat jamoa bo'lsa groupSize qo'shamiz, aks holda umuman qo'shmaymiz
  ...(values.isGroup && { groupSize: Number(values.groupSize) }),
});

        alert("Ma'lumot muvaffaqiyatli qo'shildi!");
        resetForm();
        setSelectedFakultet("");
        setCustomKafedra("");
        setIsGroup(false);
        refreshData?.();
      } catch (err) {
        console.error(err);
        alert(`Xato: ${err.message}`);
      } finally {
        setLoading(false);
      }
    },
  });

  const FormInput = ({ id, label, placeholder, type = "text" }) => (
    <div className="flex flex-col">
      <label
        htmlFor={id}
        className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        {...formik.getFieldProps(id)}
        className="w-full p-4 border rounded-lg dark:border-blue-600 dark:bg-gray-700 dark:text-white focus:ring-4 focus:ring-blue-500 outline-none text-lg"
      />
      {formik.touched[id] && formik.errors[id] && (
        <p className="text-red-500 text-sm mt-1">{formik.errors[id]}</p>
      )}
    </div>
  );

  return (
    <div className="max-w-full mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-xl">
      <h2 className="text-3xl font-bold text-center mb-8 text-blue-600 dark:text-blue-400">
        Yangi foydalanuvchi qo'shish
      </h2>

      <form
        onSubmit={formik.handleSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Toggle for Individual / Jamoaviy */}
        <div className="md:col-span-2 flex justify-center mb-4">
          <button
            type="button"
            onClick={() => {
              setIsGroup(!isGroup);
              formik.setFieldValue('isGroup', !isGroup);
              if (!isGroup) {
                formik.setFieldValue('ism', '');
                formik.setFieldValue('familiya', '');
              }
            }}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            {isGroup ? "Individual rejimga o'tish" : "Jamoaviy rejimga o'tish"}
          </button>
        </div>

        {isGroup ? (
          <>
            <FormInput id="groupSize" label="Jamoa soni (nechta kishi)" placeholder="10" type="number" />
            <FormInput id="guruh" label="Guruh (511-22)" placeholder="511-22" />
          </>
        ) : (
          <>
            <FormInput id="ism" label="Ism" placeholder="Ism" />
            <FormInput id="familiya" label="Familiya" placeholder="Familiya" />
            <FormInput id="guruh" label="Guruh (511-22)" placeholder="511-22" />
          </>
        )}

        {/* Fakultet select + custom kafedra */}
        <div className="flex flex-col">
          <label className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Fakultet
          </label>
          <select
            value={selectedFakultet}
            onChange={(e) => setSelectedFakultet(e.target.value)}
            className="w-full p-4 border rounded-lg dark:border-blue-600 dark:bg-gray-700 dark:text-white focus:ring-4 focus:ring-blue-500 outline-none text-lg"
          >
            <option value="">Tanlang</option>
            {FAKULTETLAR.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Kafedra (qo'lda kiriting, agar kerak bo'lsa)
          </label>
          <input
            type="text"
            value={customKafedra}
            onChange={(e) => setCustomKafedra(e.target.value)}
            placeholder="Kafedra nomi (majburiy emas)"
            className="w-full p-4 border rounded-lg dark:border-blue-600 dark:bg-gray-700 dark:text-white focus:ring-4 focus:ring-blue-500 outline-none text-lg"
          />
        </div>

        {/* RESURS */}
        <div className="flex flex-col">
          <label className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Foydalanilgan resurs
          </label>
          <select
            id="resurs"
            {...formik.getFieldProps("resurs")}
            className="w-full p-4 border rounded-lg dark:border-blue-600 dark:bg-gray-700 dark:text-white focus:ring-4 focus:ring-blue-500 outline-none text-lg"
          >
            <option value="">Tanlang</option>
            {resurslar.map((r, i) => (
              <option key={i} value={r}>
                {r}
              </option>
            ))}
          </select>
          {formik.touched.resurs && formik.errors.resurs && (
            <p className="text-red-500 text-sm mt-1">{formik.errors.resurs}</p>
          )}
        </div>

        {/* ICHKI / TASHQI */}
        <div className="flex flex-col">
          <label className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            Foydalanuvchi turi
          </label>
          <select
            id="ichkiTashqi"
            {...formik.getFieldProps("ichkiTashqi")}
            className="w-full p-4 border rounded-lg dark:border-blue-600 dark:bg-gray-700 dark:text-white focus:ring-4 focus:ring-blue-500 outline-none text-lg"
          >
            <option value="ichki">Ichki foydalanuvchi</option>
            <option value="tashqi">Tashqi foydalanuvchi</option>
          </select>
        </div>

        {/* TUGMA */}
        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={loading || !formik.isValid || !selectedFakultet}
            className="w-full py-5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-xl rounded-lg shadow-xl transition transform hover:scale-105 disabled:opacity-60 disabled:hover:scale-100"
          >
            {loading ? "Saqlanmoqda..." : "KIRITISH"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EntryForm;
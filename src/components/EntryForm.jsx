// src/components/EntryForm.jsx

import { useState, useMemo } from "react";
import { Formik, Form, Field, useField, ErrorMessage } from "formik"; // <--- Formik, Form, Field qo'shildi
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
  "Boshqa",
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
    ism: Yup.string().when("isGroup", {
      is: false,
      then: (schema) => schema.required("Ism shart"),
    }),
    familiya: Yup.string().when("isGroup", {
      is: false,
      then: (schema) => schema.required("Familiya shart"),
    }),
    guruh: Yup.string().required("Guruh kiritish shart"),
    resurs: Yup.string().required("Resurs tanlanishi shart"),
    ichkiTashqi: Yup.string().required(),
    groupSize: Yup.string().when("isGroup", {
      is: true,
      then: (schema) =>
        schema
          .matches(/^\d+$/, "Faqat raqam kiriting")
          .required("Jamoa soni shart"),
    }),
  });

  const initialValues = {
    ism: "",
    familiya: "",
    guruh: "",
    resurs: "",
    ichkiTashqi: "ichki",
    isGroup: false,
    groupSize: "",
  };

  // Custom Input komponenti (useField bilan)
  const CustomInput = ({ label, placeholder, type = "text", onlyNumber = false, ...props }) => {
    const [field, meta] = useField(props);

    const handleChange = (e) => {
      let value = e.target.value;
      if (onlyNumber && !/^\d*$/.test(value)) {
        return; // faqat raqamlarga ruxsat
      }
      field.onChange(e); // Formikning o'z onChange
    };

    return (
      <div className="flex flex-col">
        <label className="mb-2 text-sm font-medium">{label}</label>
        <input
          {...field}
          type={type}
          placeholder={placeholder}
          onChange={handleChange}
          className="w-full p-4 border rounded-lg dark:border-blue-600 dark:bg-gray-700 dark:text-white"
        />
        {meta.touched && meta.error && (
          <p className="text-red-500 text-sm mt-1">{meta.error}</p>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-full mx-auto p-6 bg-white dark:bg-gray-800 rounded-xl shadow-xl">
      <h2 className="text-3xl font-bold text-center mb-8 text-blue-600 dark:text-blue-400">
        Yangi foydalanuvchi qo'shish
      </h2>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={async (values, { resetForm }) => {
          setLoading(true);
          try {
            const tartib = await getTodayCount();

            const fakultetValue =
              selectedFakultet === "Boshqa" && customKafedra.trim()
                ? customKafedra
                : `${selectedFakultet}${customKafedra.trim() ? ` - ${customKafedra}` : ""}`;

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
            alert("Xato: " + err.message);
          } finally {
            setLoading(false);
          }
        }}
      >
        {({ values, isValid, isSubmitting }) => (
          <Form className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* GROUP TOGGLE */}
            <div className="md:col-span-2 flex justify-center mb-4">
              <button
                type="button"
                onClick={() => {
                  const newIsGroup = !isGroup;
                  setIsGroup(newIsGroup);
                  values.isGroup = newIsGroup;
                  values.groupSize = "";
                }}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
              >
                {isGroup ? "Individual rejim" : "Jamoaviy rejim"}
              </button>
            </div>

            {/* INPUTLAR */}
            {isGroup ? (
              <>
                <CustomInput
                  name="groupSize"
                  label="Jamoa soni"
                  placeholder="10"
                  onlyNumber={true}
                />
                <CustomInput name="guruh" label="Guruh" placeholder="511-22" />
              </>
            ) : (
              <>
                <CustomInput name="ism" label="Ism" placeholder="Ismingiz" />
                <CustomInput name="familiya" label="Familiya" placeholder="Familiyangiz" />
                <CustomInput name="guruh" label="Guruh" placeholder="511-22" />
              </>
            )}

            {/* FAKULTET */}
            <div className="flex flex-col">
              <label className="mb-2 text-sm font-medium">Fakultet</label>
              <select
                value={selectedFakultet}
                onChange={(e) => setSelectedFakultet(e.target.value)}
                className="w-full p-4 border rounded-lg dark:border-blue-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Tanlang</option>
                {FAKULTETLAR.map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            {/* KAFEDRA */}
            <div className="flex flex-col">
              <label className="mb-2 text-sm font-medium">Kafedra (ixtiyoriy)</label>
              <input
                value={customKafedra}
                onChange={(e) => setCustomKafedra(e.target.value)}
                placeholder="Kafedra nomi"
                className="w-full p-4 border rounded-lg dark:border-blue-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* RESURS */}
            <div className="flex flex-col">
              <label className="mb-2">Foydalanilgan resurs</label>
              <Field
                as="select"
                name="resurs"
                className="w-full p-4 border rounded-lg dark:border-blue-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Tanlang</option>
                {resurslar.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </Field>
              <ErrorMessage name="resurs" component="p" className="text-red-500 text-sm mt-1" />
            </div>

            {/* ICHKI / TASHQI */}
            <div className="flex flex-col">
              <label className="mb-2">Foydalanuvchi turi</label>
              <Field
                as="select"
                name="ichkiTashqi"
                className="w-full p-4 border rounded-lg dark:border-blue-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="ichki">Ichki foydalanuvchi</option>
                <option value="tashqi">Tashqi foydalanuvchi</option>
              </Field>
            </div>

            {/* SUBMIT */}
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={loading || !isValid || !selectedFakultet || isSubmitting}
                className="w-full py-5 bg-blue-600 text-white text-xl rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
              >
                {loading ? "Saqlanmoqda..." : "KIRITISH"}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default EntryForm;
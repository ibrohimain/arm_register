// src/App.jsx  ← TO‘LIQ TO‘G‘RI VERSIYA

import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminPanel from './pages/AdminPanel';
import { auth } from "./firebase.js";
import { onAuthStateChanged } from "firebase/auth";  // ← YANGI QATOR: v9 uchun
import { useEffect, useState } from 'react';
import './App.css'

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {  // ← onAuthStateChanged(auth, ...)
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-3xl font-bold text-blue-600">Yuklanmoqda...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/admin" />} />
      <Route path="/admin" element={user ? <AdminPanel /> : <Navigate to="/login" />} />
      <Route path="*" element={<Navigate to="/admin" />} />
    </Routes>
  );
}

export default App;
import { useState } from "react";
// import { auth } from "firebase/auth";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase.js";
import { useNavigate } from "react-router-dom";
import { LogIn, Mail, Lock, Loader2 } from "lucide-react"; // lucide-react o‘rnatilgan bo‘lishi kerak

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/admin');
    } catch (err) {
      alert('Login yoki parol xato!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center px-4 py-12">
      {/* Orqa fon qorong‘i effekt
      <div className="absolute inset-0 bg-black/20"></div>

      {/* Asosiy karta */}
      <div className="relative w-full max-w-md">
        {/* Glassmorphism effektli karta */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-10">
          {/* Logotip va sarlavha */}
          <div className="text-center mb-10">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <LogIn className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">
              ARM Admin Panel
            </h1>
            <p className="text-white/80 text-lg">
              Jizzax Axborot Resurs Markazi
            </p>
          </div>

          {/* Forma */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Mail className="w-5 h-5 text-white/70" />
              </div>
              <input
                type="email"
                placeholder="Email manzili"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-14 pr-6 py-5 bg-white/20 border border-white/30 rounded-2xl text-white placeholder-white/70 focus:outline-none focus:ring-4 focus:ring-white/40 focus:border-transparent transition-all duration-300 backdrop-blur-md"
              />
              <small className="text-white/70 text-xs mt-2 block text-center">
                Masalan: admin@arm.uz
              </small>
            </div>

            {/* Parol */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Lock className="w-5 h-5 text-white/70" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Parol"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-14 pr-16 py-5 bg-white/20 border border-white/30 rounded-2xl text-white placeholder-white/70 focus:outline-none focus:ring-4 focus:ring-white/40 focus:border-transparent transition-all duration-300 backdrop-blur-md"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-5 flex items-center text-white/70 hover:text-white transition"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            {/* Kirish tugmasi */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 px-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transform transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Kirilmoqda...
                </>
              ) : (
                <>
                  <LogIn className="w-6 h-6" />
                  KIRISH
                </>
              )}
            </button>
          </form>

          {/* Qo‘shimcha havola */}
          <div className="mt-8 text-center">
            <p className="text-white/70 text-sm">
              Parolni unutdingizmi? →{" "}
              <a href="#" className="text-white font-semibold hover:underline">
                Administrator bilan bog‘laning
              </a>
            </p>
          </div>

          {/* Pastki qism */}
          <div className="mt-10 text-center text-white/60 text-sm">
            © 2025 Jizpi Axborot Resurs Markazi. Barcha huquqlar himoyalangan.
          </div>
        </div>

        {/* Qo‘shimcha dekorativ elementlar */}
        <div className="absolute -top-10 -left-10 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl -z-10"></div>
        <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-pink-500/30 rounded-full blur-3xl -z-10"></div>
      </div>
    </div>
  );
};

export default Login;
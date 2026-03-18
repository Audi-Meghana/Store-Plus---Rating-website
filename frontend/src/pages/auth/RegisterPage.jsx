import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Store, Mail, Lock, User, AlertCircle, CheckCircle } from "lucide-react";
import useAuthStore from "../../store/authStore";
import { register } from "../../services/authService";

const RegisterPage = () => {
  const navigate    = useNavigate();
  const { setAuth } = useAuthStore();

  const [formData, setFormData] = useState({
    name:            "",
    email:           "",
    password:        "",
    confirmPassword: "",
    role:            "user",
    shopName:        "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState("");

  const passwordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: "", color: "" };
    let score = 0;
    if (pwd.length >= 8)          score++;
    if (/[A-Z]/.test(pwd))        score++;
    if (/[0-9]/.test(pwd))        score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    const map = [
      { label: "Weak",        color: "bg-red-400"    },
      { label: "Fair",        color: "bg-orange-400" },
      { label: "Good",        color: "bg-yellow-400" },
      { label: "Strong",      color: "bg-green-400"  },
      { label: "Very Strong", color: "bg-green-500"  },
    ];
    return { score, ...map[score] };
  };

  const strength = passwordStrength(formData.password);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await register({
        name:     formData.name.trim(),
        email:    formData.email.trim(),
        password: formData.password,
        role:     formData.role,
        shopName: formData.shopName.trim() || undefined,
      });

      // ✅ Handle every possible shape the server might return:
      // Shape 1: { data: { data: { user, accessToken } } }
      // Shape 2: { data: { user, accessToken } }
      // Shape 3: { data: { data: { user, token } } }
      const body  = res?.data?.data ?? res?.data ?? {};
      const user  = body?.user;
      const token = body?.accessToken ?? body?.token;

      if (!user || !token) {
        setError("Invalid response from server. Please try again.");
        return;
      }

      setAuth(user, token);

      if      (user.role === "admin")      navigate("/admin/dashboard", { replace: true });
      else if (user.role === "shop_owner") navigate("/owner/dashboard", { replace: true });
      else                                 navigate("/",                { replace: true });

    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <Store size={22} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">StorePulse</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-gray-500 mt-1 text-sm">Join thousands of users on StorePulse</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">

          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            {[
              { value: "user",       label: "I'm a Customer" },
              { value: "shop_owner", label: "I Own a Shop"   },
            ].map((r) => (
              <button key={r.value} type="button"
                onClick={() => setFormData({ ...formData, role: r.value })}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                  formData.role === r.value ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}>
                {r.label}
              </button>
            ))}
          </div>

          {formData.role === "shop_owner" && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Shop name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Store size={17} className="text-gray-400" />
                </div>
                <input type="text" name="shopName" value={formData.shopName}
                  onChange={handleChange} placeholder="Your shop name (optional)"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-5">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User size={17} className="text-gray-400" />
                </div>
                <input type="text" name="name" value={formData.name}
                  onChange={handleChange} placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail size={17} className="text-gray-400" />
                </div>
                <input type="email" name="email" value={formData.email}
                  onChange={handleChange} placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock size={17} className="text-gray-400" />
                </div>
                <input type={showPassword ? "text" : "password"} name="password"
                  value={formData.password} onChange={handleChange}
                  placeholder="Min. 8 characters"
                  className="w-full pl-10 pr-11 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {formData.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1,2,3,4].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength.score ? strength.color : "bg-gray-200"}`} />
                    ))}
                  </div>
                  <p className="text-xs text-gray-400">Strength: <span className="font-medium text-gray-600">{strength.label}</span></p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock size={17} className="text-gray-400" />
                </div>
                <input type={showConfirm ? "text" : "password"} name="confirmPassword"
                  value={formData.confirmPassword} onChange={handleChange}
                  placeholder="Re-enter password"
                  className="w-full pl-10 pr-11 py-3 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600">
                  {showConfirm ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
                {formData.confirmPassword && (
                  <div className="absolute inset-y-0 right-8 flex items-center pr-1">
                    {formData.password === formData.confirmPassword
                      ? <CheckCircle size={16} className="text-green-500" />
                      : <AlertCircle size={16} className="text-red-400" />}
                  </div>
                )}
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg mt-2">
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Creating account...
                </>
              ) : "Create account"}
            </button>
          </form>

          <p className="text-xs text-center text-gray-400 mt-4">
            By signing up, you agree to our{" "}
            <span className="text-blue-600 cursor-pointer">Terms of Service</span> and{" "}
            <span className="text-blue-600 cursor-pointer">Privacy Policy</span>
          </p>
        </div>

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
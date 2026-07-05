import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLogin } from '../hooks/uselogin';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartBar,faLayerGroup,faUsers,faShoppingCart,faUser,faLock,faEye,
    faEyeSlash,faExclamationCircle,faSpinner } from '@fortawesome/free-solid-svg-icons';

const LayersIcon = () => <FontAwesomeIcon icon={faLayerGroup} />;
const UsersIcon = () => <FontAwesomeIcon icon={faUsers} />;
const ShoppingCartIcon = () => <FontAwesomeIcon icon={faShoppingCart} />;

const ERP_MODULES = [
  { icon: LayersIcon,       label: 'Inventory',       desc: 'Real-time stock, suppliers & purchase orders' },
  { icon: UsersIcon,        label: 'Human Resources',  desc: 'Payroll, attendance, leave & org chart' },
  { icon: ShoppingCartIcon, label: 'Sales',            desc: 'Orders, customers, returns & revenue' },
];

// 1. تحديد شروط التحقق من البيانات (Validation Schema)
const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, error: apiError } = useLogin();

  // 2. إعداد React Hook Form
  const { register, handleSubmit, formState: { errors, isValid } } = useForm({
    resolver: zodResolver(loginSchema),
    mode: 'onChange', // للتحقق من البيانات فوراً أثناء الكتابة
    defaultValues: { username: '', password: '' }
  });

  // 3. دالة الإرسال عند نجاح الـ Validation
  const onSubmit = (data) => {
    login(data.username, data.password);
  };

  return (
    <div className="min-h-screen flex">
      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex lg:w-[46%] bg-slate-900 flex-col justify-between p-12 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: 'radial-gradient(circle, #94a3b8 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-500 flex items-center justify-center text-white">
            <FontAwesomeIcon icon={faChartBar} />
          </div>
          <span className="text-white font-semibold text-lg tracking-tight">NexusERP</span>
        </div>

        {/* Headline */}
        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white leading-[1.2] mb-4">
            Every department.<br />One system.
          </h1>
          <p className="text-slate-400 text-base leading-relaxed max-w-xs">
            A unified platform connecting your inventory, workforce, and sales operations in real time.
          </p>
        </div>

        {/* Module cards */}
        <div className="relative z-10 space-y-2.5">
          {ERP_MODULES.map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="flex items-center gap-4 rounded-xl bg-white/0.04 border border-white/[0.07] px-5 py-4 backdrop-blur-sm"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center shrink-0 text-blue-400">
                <Icon />
              </div>
              <div>
                <p className="text-white text-sm font-medium leading-none mb-1">{label}</p>
                <p className="text-slate-500 text-xs leading-snug">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL — Login Form ── */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 px-6 py-12">
        <div className="w-full max-w-md">

          {/* Mobile-only logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white">
              <FontAwesomeIcon icon={faChartBar} />
            </div>
            <span className="font-semibold text-slate-800 text-lg">NexusERP</span>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-1">Welcome back</h2>
          <p className="text-slate-500 text-sm mb-8">Sign in to your organization account</p>

          {/* استخدام handleSubmit الخاص بـ RHF */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">

            {/* API Error banner */}
            {apiError && (
              <div role="alert" className="flex items-start gap-2.5 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm">
                <FontAwesomeIcon icon={faExclamationCircle} />
                <span>{apiError}</span>
              </div>
            )}

            {/* Username field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-1.5">
                Username
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <FontAwesomeIcon icon={faUser} />
                </span>
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  placeholder="your_username"
                  {...register('username')} // ربط الحقل بـ RHF
                  className={`w-full pl-10 pr-4 py-2.5 rounded-lg border bg-white text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors ${
                    errors.username ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200'
                  }`}
                />
              </div>
              {/* عرض رسالة الخطأ الخاصة بالحقل */}
              {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
            </div>

            {/* Password field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <FontAwesomeIcon icon={faLock} />
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  {...register('password')} // ربط الحقل بـ RHF
                  className={`w-full pl-10 pr-11 py-2.5 rounded-lg border bg-white text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors ${
                    errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200'
                  }`}
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <FontAwesomeIcon icon={faEyeSlash} /> : <FontAwesomeIcon icon={faEye} />}
                </button>
              </div>
              {/* عرض رسالة الخطأ الخاصة بالحقل */}
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading || !isValid} // زر الإرسال معطل لو كان هناك خطأ أو في حالة تحميل
              className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          {/* Register link */}
          <p className="mt-8 text-center text-xs text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

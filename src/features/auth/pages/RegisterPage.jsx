import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRegister } from '../hooks/useRegister';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartBar, faUser, faEnvelope, faPhone, faLock, faEye,
        faEyeSlash, faExclamationCircle, faCheck,faTimes } from '@fortawesome/free-solid-svg-icons';

const UserIcon = () => <FontAwesomeIcon icon={faUser}/>;
const MailIcon = () => <FontAwesomeIcon icon={faEnvelope} />;
const PhoneIcon = () => <FontAwesomeIcon icon={faPhone} />;
const LockIcon = () => <FontAwesomeIcon icon={faLock} />;

const ERP_MODULES = [
  { label: 'Inventory',       desc: 'Products, suppliers & stock tracking' },
  { label: 'Human Resources', desc: 'Employees, payroll & leave management' },
  { label: 'Sales',           desc: 'Orders, customers & return processing' },
];

const NAME_FIELDS = [
                { id: 'firstname', label: 'First name', placeholder: 'Ali' },
                { id: 'lastname',  label: 'Last name',  placeholder: 'Hassan' },
];

const CONTACT_FIELDS = [
              { id: 'username', label: 'Username', icon: UserIcon, type: 'text', autoComplete: 'username', placeholder: 'ali_hassan' },
              { id: 'email',    label: 'Email address', icon: MailIcon, type: 'email', autoComplete: 'email', placeholder: 'ali@company.com' },
              { id: 'phone',    label: 'Phone number', icon: PhoneIcon, type: 'tel', autoComplete: 'tel', placeholder: '01012345678', hint: 'Egyptian format: 01012345678 or 201012345678' },
];

const STRENGTH_RULES = [
  { test: (p) => p.length >= 8,    label: '8+ characters' },
  { test: (p) => /[A-Z]/.test(p),  label: 'Uppercase letter' },
  { test: (p) => /[a-z]/.test(p),  label: 'Lowercase letter' },
  { test: (p) => /\d/.test(p),     label: 'Number' },
  { test: (p) => /[\W()]/.test(p),  label: 'Special character (!@#…)' },
];

function getStrength(password) {
  if (!password) return { score: 0, label: '', color: '' };
  const score = STRENGTH_RULES.filter((r) => r.test(password)).length;
  if (score <= 2) return { score, label: 'Weak',   color: 'bg-red-400' };
  if (score === 3) return { score, label: 'Fair',   color: 'bg-amber-400' };
  if (score === 4) return { score, label: 'Good',   color: 'bg-blue-500' };
  return                  { score, label: 'Strong', color: 'bg-emerald-500' };
}

// 1. بناء هيكل التحقق بالكامل (Validation Schema) مع Zod
const registerSchema = z.object({
  firstname: z.string().min(1, 'First name is required'),
  lastname: z.string().min(1, 'Last name is required'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .regex(/^\w+$/, 'Letters, numbers, and underscores only'),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().regex(/^(01|201)[0-2,5]\d{8}$/, 'Enter a valid Egyptian phone number'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirm_password: z.string()
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"], // تحديد مكان ظهور الخطأ
});

// 2. مكون الـ Field أصبح أكثر ذكاءً ويستقبل خطأ Zod مباشرة
function Field({ id, label, icon: Icon, error, hint, children }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <Icon />
          </span>
        )}
        {children}
      </div>
      {hint  && !error && <p className="mt-1.5 text-xs text-slate-400">{hint}</p>}
      {error && <p className="mt-1.5 text-xs text-red-500">{error.message}</p>}
    </div>
  );
}

export default function RegisterPage() {
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { register: apiRegister, isLoading, error: apiError } = useRegister();

  // 3. تعريف الـ Form وإدارته من React Hook Form
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur', // يتم التحقق فور مغادرة الحقل لحفظ الأداء وتحسين الـ UX
  });

  // لمراقبة كلمة السر الحالية لحساب القوة (Strength Meter)
  const currentPassword = watch('password', '');
  const strength = getStrength(currentPassword);

  const onSubmit = (data) => {
    apiRegister(data);
  };

  // دالة لتوليد كلاسات الـ Input بناءً على وجود خطأ أم لا
  const getInputClass = (fieldName, hasIcon = true) => `
    w-full ${hasIcon ? 'pl-10' : 'px-4'} py-2.5 rounded-lg border text-slate-900 text-sm placeholder-slate-400 bg-white focus:outline-none focus:ring-2 transition-colors 
    ${errors[fieldName] 
      ? 'border-red-300 focus:border-red-400 focus:ring-red-100' 
      : 'border-slate-200 focus:border-blue-500 focus:ring-blue-500/20'
    }
  `;

  return (
    <div className="min-h-screen flex">
      {/* ── LEFT PANEL — Branding ── */}
      <div className="hidden lg:flex lg:w-[38%] bg-slate-900 flex-col justify-between p-12 relative overflow-hidden shrink-0">
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'radial-gradient(circle, #94a3b8 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-500 flex items-center justify-center text-white">
            <FontAwesomeIcon icon={faChartBar} />
          </div>
          <span className="text-white font-semibold text-lg tracking-tight">NexusERP</span>
        </div>

        <div className="relative z-10">
          <h1 className="text-4xl font-bold text-white leading-[1.2] mb-4">
            Start managing<br />your business.
          </h1>
          <p className="text-slate-400 text-base leading-relaxed max-w-xs">
            Create your owner account to set up your organization and invite your team.
          </p>
        </div>

        <div className="relative z-10 space-y-3">
          {ERP_MODULES.map(({ label, desc }) => (
            <div key={label} className="flex items-start gap-3 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.07]">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
              <div>
                <p className="text-white text-sm font-medium">{label}</p>
                <p className="text-slate-500 text-xs mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT PANEL — Registration Form ── */}
      <div className="flex-1 flex items-start justify-center bg-gray-50 px-6 py-10 overflow-y-auto">
        <div className="w-full max-w-lg">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white">
              <FontAwesomeIcon icon={faChartBar} />
            </div>
            <span className="font-semibold text-slate-800 text-lg">NexusERP</span>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-1">Create your account</h2>
          <p className="text-slate-500 text-sm mb-8">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">Sign in</Link>
          </p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            {/* API error banner */}
            {apiError && (
              <div role="alert" className="flex items-start gap-2.5 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm">
                <FontAwesomeIcon icon={faExclamationCircle} />
                <span>{apiError}</span>
              </div>
            )}

            {/* Name row */}
            <div className="grid grid-cols-2 gap-3">
              {NAME_FIELDS.map(({ id, label, placeholder }) => (
                <Field key={id} id={id} label={label} error={errors[id]}>
                  <input
                    id={id}
                    type="text"
                    placeholder={placeholder}
                    {...register(id)}
                    className={getInputClass(id, false)}
                  />
                </Field>
              ))}
            </div>

            {/* Contact fields (username, email, phone) rendered via map */}
            {CONTACT_FIELDS.map(({ id, label, icon, type, autoComplete, placeholder, hint }) => (
              <Field key={id} id={id} label={label} icon={icon} error={errors[id]} hint={hint}>
                <input
                  id={id}
                  type={type}
                  autoComplete={autoComplete}
                  placeholder={placeholder}
                  {...register(id)}
                  className={getInputClass(id)}
                />
              </Field>
            ))}

            {/* Password */}
            <div>
              <Field id="password" label="Password" icon={LockIcon} error={errors.password}>
                <input
                  id="password"
                  type={showPwd ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  {...register('password')}
                  className={`${getInputClass('password')} pr-11`}
                />
                <button
                  type="button"
                  aria-label={showPwd ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPwd ? <FontAwesomeIcon icon={faEyeSlash} /> : <FontAwesomeIcon icon={faEye}/>}
                </button>
              </Field>

              {/* Password strength meter */}
              {currentPassword && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1 flex-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                            i <= strength.score ? strength.color : 'bg-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className={`text-xs font-medium w-12 text-right transition-colors duration-300 ${
                      strength.score <= 2 ? 'text-red-500' :
                      strength.score === 3 ? 'text-amber-500' :
                      strength.score === 4 ? 'text-blue-500' : 'text-emerald-600'
                    }`}>
                      {strength.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    {STRENGTH_RULES.map((rule) => {
                      const passed = rule.test(currentPassword);
                      return (
                        <div key={rule.label} className={`flex items-center gap-1.5 text-xs transition-colors ${passed ? 'text-emerald-600' : 'text-slate-400'}`}>
                          <span className={`flex items-center justify-center w-3.5 h-3.5 rounded-full ${passed ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                            {passed ? <FontAwesomeIcon icon={faCheck} /> : <FontAwesomeIcon icon={faTimes} />}
                          </span>
                          {rule.label}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <Field id="confirm_password" label="Confirm password" icon={LockIcon} error={errors.confirm_password}>
              <input
                id="confirm_password"
                type={showConfirm ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="••••••••"
                {...register('confirm_password')}
                className={`${getInputClass('confirm_password')} pr-11`}
              />
              <button
                type="button"
                aria-label={showConfirm ? 'Hide password' : 'Show password'}
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showConfirm ? <FontAwesomeIcon icon={faEyeSlash} /> : <FontAwesomeIcon icon={faEye} />}
              </button>
            </Field>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                  </svg>
                  Creating account…
                </>
              ) : (
                'Create account'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-400">
            By registering, you become the Owner of a new organization.
          </p>
        </div>
      </div>
    </div>
  );
}
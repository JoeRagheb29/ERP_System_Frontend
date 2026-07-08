import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

const VARIANT_STYLES = {
  primary:
    'bg-blue-600 hover:bg-blue-700 text-white shadow-sm disabled:opacity-50',
  danger:
    'bg-red-600 hover:bg-red-700 text-white shadow-sm disabled:opacity-50',
  ghost:
    'text-slate-500 hover:bg-slate-100 disabled:opacity-50',
  'ghost-danger':
    'text-slate-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50',
};

export default function Button({
  children,
  variant = 'ghost',
  loading = false,
  disabled = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) {
  const base = 'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors';
  const variantClass = VARIANT_STYLES[variant] ?? VARIANT_STYLES.ghost;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${base} ${variantClass} ${className}`}
      {...props}
    >
      {loading && <FontAwesomeIcon icon={faSpinner} className="animate-spin w-4 h-4" />}
      {children}
    </button>
  );
}

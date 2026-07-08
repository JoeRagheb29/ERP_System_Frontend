export default function UserAvatar({ user, className = '', size = 'md' }) {
  const initials = [user?.first_name, user?.last_name]
    .filter(Boolean)
    .map((name) => name[0].toUpperCase())
    .join('') || user?.username?.[0]?.toUpperCase() || '?';

  const colorMap = {
    A: 'bg-red-500/15 text-red-600',
    B: 'bg-orange-500/15 text-orange-600',
    C: 'bg-amber-500/15 text-amber-600',
    D: 'bg-emerald-500/15 text-emerald-600',
    E: 'bg-teal-500/15 text-teal-600',
    F: 'bg-cyan-500/15 text-cyan-600',
    G: 'bg-blue-500/15 text-blue-600',
    H: 'bg-indigo-500/15 text-indigo-600',
    I: 'bg-violet-500/15 text-violet-600',
    J: 'bg-purple-500/15 text-purple-600',
    K: 'bg-pink-500/15 text-pink-600',
    L: 'bg-rose-500/15 text-rose-600',
  };

  const color = colorMap[initials[0]] ?? 'bg-slate-100 text-slate-600';

  const sizeClasses = {
    sm: 'w-8 h-8 rounded-lg text-xs',
    md: 'w-9 h-9 rounded-xl text-sm',
    lg: 'w-10 h-10 rounded-xl text-base',
  };

  return (
    <div className={`${sizeClasses[size] ?? sizeClasses.md} flex items-center justify-center font-bold shrink-0 ${color} ${className}`}>
      {initials}
    </div>
  );
}

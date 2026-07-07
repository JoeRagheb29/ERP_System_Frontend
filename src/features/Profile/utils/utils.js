
export function getDisplayName(user) {
  if (!user) return 'User Name';
  if (user.first_name || user.last_name) {
    return `${user.first_name ?? ''} ${user.last_name ?? ''}`.trim();
  }
  return user.name || user.username || 'User Name';
}

export function getInitials(user) {
  const name = getDisplayName(user);
  if (!name) return 'U';

  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return initials.slice(0, 2) || 'U';
}

export function formatDate(value) {
  if (!value) return 'Not available';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

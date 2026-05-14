export function uuid() {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = Math.random() * 16 | 0;
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
      });
}

export function today() {
  return new Date().toISOString().slice(0, 10);
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${y}/${m}/${d}`;
}

export function thisYear() {
  return new Date().getFullYear();
}

export function entryYear(entry) {
  const d = entry.completedDate || entry.startDate || entry.createdAt;
  return new Date(d).getFullYear();
}

export function typeLabel(type) {
  return type === 'book' ? '📚 書籍' : '🎬 影片';
}

export function typeIcon(type) {
  return type === 'book' ? '📚' : '🎬';
}

export function starsHTML(rating) {
  return Array.from({ length: 5 }, (_, i) =>
    `<span class="star ${i < rating ? 'filled' : ''}">★</span>`
  ).join('');
}

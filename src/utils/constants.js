export const LEVEL_COLORS = {
  A1: { bg: '#10b981', light: '#d1fae5', text: '#065f46' },
  A2: { bg: '#06b6d4', light: '#cffafe', text: '#155e75' },
  B1: { bg: '#8b5cf6', light: '#ede9fe', text: '#5b21b6' },
  B2: { bg: '#f59e0b', light: '#fef3c7', text: '#92400e' },
  C1: { bg: '#ef4444', light: '#fee2e2', text: '#991b1b' },
  C2: { bg: '#ec4899', light: '#fce7f3', text: '#9d174d' },
};

export const GOETHE_NAMES = {
  A1: 'Goethe-Zertifikat A1 (Start Deutsch 1)',
  A2: 'Goethe-Zertifikat A2',
  B1: 'Goethe-Zertifikat B1',
  B2: 'Goethe-Zertifikat B2',
  C1: 'Goethe-Zertifikat C1',
  C2: 'Goethe-Zertifikat C2 (GDS)',
};

export function getLevelName(level, language) {
  if (!language) {
    try { language = localStorage.getItem('dm_ui_language') || 'en'; } catch { language = 'en'; }
  }
  const names = {
    it: { A1: 'Principiante', A2: 'Elementare', B1: 'Intermedio', B2: 'Intermedio superiore', C1: 'Avanzato', C2: 'Padronanza' },
    en: { A1: 'Beginner', A2: 'Elementary', B1: 'Intermediate', B2: 'Upper Intermediate', C1: 'Advanced', C2: 'Mastery' },
    de: { A1: 'Anfänger', A2: 'Grundstufe', B1: 'Mittelstufe', B2: 'Obere Mittelstufe', C1: 'Fortgeschritten', C2: 'Beherrschung' },
  };
  return (names[language] || names.en)[level] || level;
}

export function fisherYatesShuffle(array) {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

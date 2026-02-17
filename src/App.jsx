import React, { useState, useMemo, useCallback, Suspense, useEffect, Component } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation, useSearchParams, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './components/Toast';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Footer from './components/Footer';
import { useLanguage } from './contexts/LanguageContext';
import { trackPageView } from './utils/analytics';
import { isEnabled as notificationsEnabled, getReminderTime, scheduleReminder } from './utils/notifications';

// Error Boundary to catch rendering errors in lazy-loaded pages
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    if (import.meta.env.DEV) console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReload = () => {
    try {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('dm_quiz_')) keysToRemove.push(key);
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
    } catch {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const lang = (navigator.language || '').slice(0, 2);
      const msgs = {
        it: { title: 'Qualcosa è andato storto', retry: 'Riprova', reload: 'Ricarica' },
        de: { title: 'Etwas ist schiefgelaufen', retry: 'Erneut versuchen', reload: 'Neu laden' },
        en: { title: 'Something went wrong', retry: 'Retry', reload: 'Reload' },
      };
      const m = msgs[lang] || msgs.en;
      return (
        <div className="error-boundary">
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <h2>{m.title}</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
            {this.state.error?.message || ''}
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button onClick={() => { this.setState({ hasError: false, error: null }); }}>
              {m.retry}
            </button>
            <button onClick={this.handleReload}>
              {m.reload}
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Lazy load all pages for code splitting
const HomePage = React.lazy(() => import('./pages/HomePage'));
const VocabularyPage = React.lazy(() => import('./pages/VocabularyPage'));
const GrammarPage = React.lazy(() => import('./pages/GrammarPage'));
const VerbsPage = React.lazy(() => import('./pages/VerbsPage'));
const QuizPage = React.lazy(() => import('./pages/QuizPage'));
const PracticePage = React.lazy(() => import('./pages/PracticePage'));
const SpecialVerbsPage = React.lazy(() => import('./pages/SpecialVerbsPage'));
const FavoritesPage = React.lazy(() => import('./pages/FavoritesPage'));
const ReadingPage = React.lazy(() => import('./pages/ReadingPage'));
const StoriesPage = React.lazy(() => import('./pages/StoriesPage'));
const LessonsPage = React.lazy(() => import('./pages/LessonsPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const FlashcardsPage = React.lazy(() => import('./pages/FlashcardsPage'));
const WritingPage = React.lazy(() => import('./pages/WritingPage'));
const ListeningPage = React.lazy(() => import('./pages/ListeningPage'));
const PathsPage = React.lazy(() => import('./pages/PathsPage'));
const EssentialWordsPage = React.lazy(() => import('./pages/EssentialWordsPage'));
const VerbPrefixesPage = React.lazy(() => import('./pages/VerbPrefixesPage'));
const VerbsPrepositionsPage = React.lazy(() => import('./pages/VerbsPrepositionsPage'));
const WerdenPage = React.lazy(() => import('./pages/WerdenPage'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const DonaPage = React.lazy(() => import('./pages/DonaPage'));
const PlacementTestPage = React.lazy(() => import('./pages/PlacementTestPage'));
const AdminPage = React.lazy(() => import('./pages/AdminPage'));
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage'));

// Page name translation keys mapping
const PAGE_NAME_KEYS = {
  home: 'nav.home', vocabulary: 'vocabulary', grammar: 'grammar', reading: 'reading',
  stories: 'stories', quiz: 'quiz', verbs: 'verbs', 'special-verbs': 'specialVerbs.title',
  practice: 'practice.title', favorites: 'favorites.title', lessons: 'lessons.title', profile: 'profile',
  flashcards: 'flashcards', writing: 'writing', listening: 'listening', paths: 'paths',
  'essential-words': 'essentialWords.title', 'verb-prefixes': 'verbPrefixes.title',
  'werden': 'werden.title', 'placement-test': 'placement.title', login: 'login.signin',
  dona: 'profile.donateNow', admin: 'admin.title',
  'verbs-prepositions': 'verbsPrepositions.title'
};

// Map page names to URL paths
const PAGE_TO_PATH = {
  home: '/', login: '/login', vocabulary: '/vocabulary', grammar: '/grammar',
  verbs: '/verbs', quiz: '/quiz', practice: '/practice', 'special-verbs': '/special-verbs',
  favorites: '/favorites', reading: '/reading', stories: '/stories', lessons: '/lessons',
  profile: '/profile', flashcards: '/flashcards', writing: '/writing', listening: '/listening',
  paths: '/paths', 'essential-words': '/essential-words', 'verb-prefixes': '/verb-prefixes',
  werden: '/werden', 'placement-test': '/placement-test', dona: '/dona', admin: '/admin',
  'verbs-prepositions': '/verbs-prepositions'
};

// Reverse mapping: path to page name
const PATH_TO_PAGE = {};
Object.entries(PAGE_TO_PATH).forEach(([page, path]) => { PATH_TO_PAGE[path] = page; });

// Page title suffixes for SEO
const PAGE_TITLES = {
  home: 'DeutschMaster - Learn German Free | A1-C2',
  vocabulary: 'Vocabulary', grammar: 'Grammar', verbs: 'Verb Conjugations',
  quiz: 'Quiz', practice: 'Practice', 'special-verbs': 'Special Verbs',
  favorites: 'Saved Words', reading: 'Reading', stories: 'Stories',
  lessons: 'Lessons', profile: 'Profile', flashcards: 'Flashcards',
  writing: 'Writing', listening: 'Listening', paths: 'Learning Paths',
  'essential-words': 'Essential Words', 'verb-prefixes': 'Verb Prefixes',
  werden: 'Werden', 'placement-test': 'Placement Test', dona: 'Support',
  login: 'Sign In', admin: 'Admin',
  'verbs-prepositions': 'Verbs with Prepositions'
};

// Dynamic meta descriptions for SEO
const PAGE_DESCRIPTIONS = {
  home: 'Learn German free online from A1 to C2. Vocabulary, grammar, verb conjugations, quizzes, flashcards, stories and more.',
  vocabulary: 'German vocabulary lists organized by CEFR level. Learn and practice words from A1 beginner to C2 mastery.',
  grammar: 'German grammar rules with examples and exercises. Master cases, articles, word order and more.',
  verbs: 'German verb conjugations in all tenses. Präsens, Präteritum, Perfekt, Futur, Konjunktiv and Imperativ.',
  quiz: 'Test your German knowledge with interactive quizzes. Multiple choice and open-ended questions.',
  practice: 'Practice German vocabulary with spaced repetition. Review difficult words and track progress.',
  'special-verbs': 'Master German modal verbs, reflexive verbs and irregular verbs with conjugation tables.',
  reading: 'German reading comprehension texts for all levels. Improve reading skills with graded texts.',
  stories: 'Read German stories and fairy tales. Interactive stories with vocabulary support.',
  lessons: 'Structured German lessons from beginner to advanced. Learn step by step.',
  flashcards: 'German flashcards with spaced repetition. Learn vocabulary efficiently.',
  writing: 'German writing practice. Build sentences and improve your written German.',
  listening: 'German listening exercises. Improve pronunciation and comprehension.',
  paths: 'Guided German learning paths from A1 to C2. Follow structured courses.',
  'essential-words': 'Most common German words by frequency. Essential vocabulary for each CEFR level.',
  'verb-prefixes': 'German separable and inseparable verb prefixes. Master trennbare and untrennbare Verben.',
  werden: 'Master the German verb "werden" in all its uses: future, passive, subjunctive.',
  'placement-test': 'Find your German level with our placement test. Get placed from A1 to C2.',
  dona: 'Support DeutschMaster development. Help keep German learning free for everyone.',
  'verbs-prepositions': 'German verbs with prepositions. Learn which prepositions go with which verbs and their cases.',
};

// Loading fallback component for lazy-loaded pages
const PageLoadingFallback = () => {
  const { t } = useLanguage();
  return (
    <div role="status" aria-live="polite" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <div style={{ textAlign: 'center' }}>
        <div aria-hidden="true" style={{ width: '48px', height: '48px', border: '3px solid rgba(108,92,231,0.3)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{t('loadingPage')}</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
};

/**
 * Custom hook that wraps react-router's useNavigate.
 * Provides the same onNavigate(page, options) API that all child pages use.
 * Under the hood, navigates to proper URLs with search params and router state.
 */
function useAppNavigate() {
  const routerNavigate = useNavigate();

  return useCallback((page, options = {}) => {
    const path = PAGE_TO_PATH[page] || `/${page}`;
    const searchParams = new URLSearchParams();
    const state = {};

    // Level goes in URL search params (for SEO & deep linking)
    if (options.level) searchParams.set('level', options.level);

    // Complex objects go in router state (not serializable to URL)
    if (options.topic) state.topic = options.topic;
    if (options.reading) state.reading = options.reading;
    if (options.lesson) state.lesson = options.lesson;
    if (options.story) state.story = options.story;
    if (options.module) state.module = options.module;
    if (options.difficultOnly) searchParams.set('difficult', '1');

    const search = searchParams.toString();
    const fullPath = search ? `${path}?${search}` : path;

    routerNavigate(fullPath, { state: Object.keys(state).length > 0 ? state : undefined });
    window.scrollTo(0, 0);
    trackPageView(page);
  }, [routerNavigate]);
}

/**
 * Wrapper component for each route page.
 * Extracts level from search params and state objects from router state,
 * then passes them as props to the page component.
 */
function PageWrapper({ component: PageComponent, pageName }) {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const onNavigate = useAppNavigate();

  const level = searchParams.get('level') || null;
  const state = location.state || {};

  // Update document title, meta description, and canonical URL
  useEffect(() => {
    const suffix = PAGE_TITLES[pageName];
    if (pageName === 'home') {
      document.title = suffix || 'DeutschMaster';
    } else if (suffix) {
      const levelStr = level ? ` ${level}` : '';
      document.title = `${suffix}${levelStr} | DeutschMaster`;
    }
    // Dynamic meta description
    const desc = PAGE_DESCRIPTIONS[pageName];
    if (desc) {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) { meta = document.createElement('meta'); meta.name = 'description'; document.head.appendChild(meta); }
      meta.content = level ? `${desc} Level ${level}.` : desc;
    }
    // Dynamic canonical URL
    const base = 'https://deutschemaster.vercel.app';
    const path = PAGE_TO_PATH[pageName] || '/';
    const canonicalUrl = level ? `${base}${path}?level=${level}` : `${base}${path}`;
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
    canonical.href = canonicalUrl;
    // Update OG URL
    let ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.content = canonicalUrl;
    // Dynamic BreadcrumbList structured data
    const breadcrumbLd = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': [
        { '@type': 'ListItem', position: 1, name: 'Home', item: base + '/' }
      ]
    };
    if (pageName !== 'home') {
      breadcrumbLd.itemListElement.push({
        '@type': 'ListItem', position: 2,
        name: PAGE_TITLES[pageName] || pageName,
        item: `${base}${path}`
      });
      if (level) {
        breadcrumbLd.itemListElement.push({
          '@type': 'ListItem', position: 3,
          name: `Level ${level}`,
          item: canonicalUrl
        });
      }
    }
    let ldScript = document.getElementById('breadcrumb-ld');
    if (!ldScript) {
      ldScript = document.createElement('script');
      ldScript.id = 'breadcrumb-ld';
      ldScript.type = 'application/ld+json';
      document.head.appendChild(ldScript);
    }
    ldScript.textContent = JSON.stringify(breadcrumbLd);
  }, [pageName, level]);

  // Build props based on what each page expects
  const props = { onNavigate };
  if (level) props.level = level;
  if (state.topic) props.topic = state.topic;
  if (state.reading) props.reading = state.reading;
  if (state.lesson) props.selectedLesson = state.lesson;
  if (state.story) props.story = state.story;
  if (state.module) props.selectedVerb = state.module;

  return <PageComponent {...props} />;
}

function AppContent() {
  const { loading } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const onNavigate = useAppNavigate();

  // Re-initialize notification reminders on app load
  useEffect(() => {
    if (notificationsEnabled()) {
      const cleanup = scheduleReminder(getReminderTime());
      return cleanup;
    }
  }, []);

  // Derive current page name from URL path
  const currentPage = PATH_TO_PAGE[location.pathname] || 'home';
  const [searchParams] = useSearchParams();
  const selectedLevel = searchParams.get('level') || null;

  const goBack = useCallback(() => {
    window.history.back();
  }, []);

  const breadcrumbs = useMemo(() => {
    if (currentPage === 'home' || currentPage === 'login') return [];
    const crumbs = [{ label: t('nav.home'), onClick: () => onNavigate('home') }];
    crumbs.push({ label: PAGE_NAME_KEYS[currentPage] ? t(PAGE_NAME_KEYS[currentPage]) : currentPage, onClick: () => onNavigate(currentPage) });
    if (selectedLevel) crumbs.push({ label: selectedLevel, onClick: () => onNavigate(currentPage, { level: selectedLevel }) });
    const state = location.state || {};
    if (state.module) crumbs.push({ label: state.module.name || state.module.infinitiv || 'Verb', onClick: null });
    if (state.topic) crumbs.push({ label: state.topic.name || 'Topic', onClick: null });
    if (state.reading) crumbs.push({ label: state.reading.title || 'Text', onClick: null });
    if (state.lesson) crumbs.push({ label: state.lesson.title || 'Lesson', onClick: null });
    if (state.story) crumbs.push({ label: state.story.title || 'Story', onClick: null });
    return crumbs;
  }, [currentPage, selectedLevel, location.state, t, onNavigate]);

  // Focus management: move focus to main content after SPA navigation
  // MUST be before the early return to respect React's Rules of Hooks
  useEffect(() => {
    if (!loading) {
      const mainEl = document.getElementById('main-content');
      if (mainEl) {
        mainEl.focus({ preventScroll: true });
      }
    }
  }, [location.pathname, loading]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', border: '3px solid rgba(108,92,231,0.3)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{t('loading')}</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  const showBack = currentPage !== 'home';
  const isLoginPage = currentPage === 'login';
  const isNotFound = !PATH_TO_PAGE[location.pathname] && location.pathname !== '/';

  return (
    <div className="app">
      <a href="#main-content" className="skip-to-content">Skip to content</a>
      {!isLoginPage && !isNotFound && <Header currentPage={currentPage} onNavigate={onNavigate} onBack={goBack} showBack={showBack} breadcrumbs={breadcrumbs} />}
      <main id="main-content" className="main-content" tabIndex="-1" role="main">
        <ErrorBoundary>
        <Suspense fallback={<PageLoadingFallback />}>
          <Routes>
            <Route path="/" element={<PageWrapper component={HomePage} pageName="home" />} />
            <Route path="/login" element={<PageWrapper component={LoginPage} pageName="login" />} />
            <Route path="/vocabulary" element={<PageWrapper component={VocabularyPage} pageName="vocabulary" />} />
            <Route path="/grammar" element={<PageWrapper component={GrammarPage} pageName="grammar" />} />
            <Route path="/verbs" element={<PageWrapper component={VerbsPage} pageName="verbs" />} />
            <Route path="/quiz" element={<PageWrapper component={QuizPage} pageName="quiz" />} />
            <Route path="/practice" element={<PageWrapper component={PracticePage} pageName="practice" />} />
            <Route path="/special-verbs" element={<PageWrapper component={SpecialVerbsPage} pageName="special-verbs" />} />
            <Route path="/favorites" element={<PageWrapper component={FavoritesPage} pageName="favorites" />} />
            <Route path="/reading" element={<PageWrapper component={ReadingPage} pageName="reading" />} />
            <Route path="/stories" element={<PageWrapper component={StoriesPage} pageName="stories" />} />
            <Route path="/lessons" element={<PageWrapper component={LessonsPage} pageName="lessons" />} />
            <Route path="/profile" element={<PageWrapper component={ProfilePage} pageName="profile" />} />
            <Route path="/flashcards" element={<PageWrapper component={FlashcardsPage} pageName="flashcards" />} />
            <Route path="/writing" element={<PageWrapper component={WritingPage} pageName="writing" />} />
            <Route path="/listening" element={<PageWrapper component={ListeningPage} pageName="listening" />} />
            <Route path="/paths" element={<PageWrapper component={PathsPage} pageName="paths" />} />
            <Route path="/essential-words" element={<PageWrapper component={EssentialWordsPage} pageName="essential-words" />} />
            <Route path="/verb-prefixes" element={<PageWrapper component={VerbPrefixesPage} pageName="verb-prefixes" />} />
            <Route path="/verbs-prepositions" element={<PageWrapper component={VerbsPrepositionsPage} pageName="verbs-prepositions" />} />
            <Route path="/werden" element={<PageWrapper component={WerdenPage} pageName="werden" />} />
            <Route path="/placement-test" element={<PageWrapper component={PlacementTestPage} pageName="placement-test" />} />
            <Route path="/dona" element={<PageWrapper component={DonaPage} pageName="dona" />} />
            <Route path="/admin" element={<PageWrapper component={AdminPage} pageName="admin" />} />
            <Route path="*" element={<NotFoundPage onNavigate={onNavigate} />} />
          </Routes>
        </Suspense>
        </ErrorBoundary>
      </main>
      {!isLoginPage && !isNotFound && <BottomNav currentPage={currentPage} onNavigate={onNavigate} />}
      {!isLoginPage && !isNotFound && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

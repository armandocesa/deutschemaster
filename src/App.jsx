import React, { useState, useMemo, useCallback, Suspense, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Footer from './components/Footer';
import { useLanguage } from './contexts/LanguageContext';
import { trackPageView } from './utils/analytics';

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
  dona: 'profile.donateNow', admin: 'admin.title'
};

// Loading fallback component for lazy-loaded pages
const PageLoadingFallback = () => {
  const { t } = useLanguage();
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f0f14', color: '#eeeef2' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: '48px', height: '48px', border: '3px solid rgba(108,92,231,0.3)', borderTopColor: '#6c5ce7', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ fontSize: '14px', color: '#8888a0' }}>{t('loadingPage')}</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
};

function AppContent() {
  const { loading } = useAuth();
  const { t } = useLanguage();
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedReading, setSelectedReading] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [selectedStory, setSelectedStory] = useState(null);

  const navigate = useCallback((page, options = {}) => {
    setCurrentPage(page);
    setSelectedLevel(options.level || null);
    setSelectedModule(options.module || null);
    setSelectedTopic(options.topic || null);
    setSelectedReading(options.reading || null);
    setSelectedLesson(options.lesson || null);
    setSelectedStory(options.story || null);
    window.scrollTo(0, 0);

    // Track page view
    trackPageView(page);
  }, []);

  const goBack = useCallback(() => {
    if (currentPage === 'login') { setCurrentPage('home'); return; }
    if (selectedStory) { setSelectedStory(null); return; }
    if (selectedLesson) { setSelectedLesson(null); return; }
    if (selectedReading) { setSelectedReading(null); return; }
    if (selectedTopic) { setSelectedTopic(null); return; }
    if (selectedModule) { setSelectedModule(null); return; }
    if (selectedLevel && currentPage !== 'home') { setSelectedLevel(null); return; }
    setCurrentPage('home');
    setSelectedLevel(null);
    window.scrollTo(0, 0);
  }, [selectedStory, selectedLesson, selectedReading, selectedTopic, selectedModule, selectedLevel, currentPage]);

  const breadcrumbs = useMemo(() => {
    if (currentPage === 'home' || currentPage === 'login') return [];
    const crumbs = [{ label: t('nav.home'), onClick: () => navigate('home') }];
    crumbs.push({ label: PAGE_NAME_KEYS[currentPage] ? t(PAGE_NAME_KEYS[currentPage]) : currentPage, onClick: () => navigate(currentPage) });
    if (selectedLevel) crumbs.push({ label: selectedLevel, onClick: () => navigate(currentPage, { level: selectedLevel }) });
    if (selectedModule && currentPage === 'vocabulary') crumbs.push({ label: selectedModule.name || 'Modulo', onClick: null });
    if (selectedTopic) crumbs.push({ label: selectedTopic.name || 'Argomento', onClick: null });
    if (selectedReading) crumbs.push({ label: selectedReading.title || 'Testo', onClick: null });
    if (selectedLesson) crumbs.push({ label: selectedLesson.title || 'Lezione', onClick: null });
    if (selectedStory) crumbs.push({ label: selectedStory.title || 'Storia', onClick: null });
    return crumbs;
  }, [currentPage, selectedLevel, selectedModule, selectedTopic, selectedReading, selectedLesson, t]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f0f14', color: '#eeeef2' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', border: '3px solid rgba(108,92,231,0.3)', borderTopColor: '#6c5ce7', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ fontSize: '14px', color: '#8888a0' }}>{t('loading')}</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  const showBack = currentPage !== 'home';
  const isLoginPage = currentPage === 'login';

  // List of valid pages for route validation
  const validPages = [
    'home', 'login', 'vocabulary', 'grammar', 'verbs', 'quiz', 'practice',
    'special-verbs', 'favorites', 'reading', 'stories', 'lessons', 'profile', 'flashcards',
    'writing', 'listening', 'paths', 'essential-words', 'verb-prefixes', 'werden', 'placement-test', 'dona', 'admin'
  ];

  const isValidPage = validPages.includes(currentPage);
  const shouldShow404 = currentPage && !isValidPage && currentPage !== 'home';

  return (
    <div className="app">
      {!isLoginPage && !shouldShow404 && <Header currentPage={currentPage} onNavigate={navigate} onBack={goBack} showBack={showBack} breadcrumbs={breadcrumbs} />}
      <main className="main-content">
        <Suspense fallback={<PageLoadingFallback />}>
          {shouldShow404 && <NotFoundPage onNavigate={navigate} />}
          {currentPage === 'login' && <LoginPage onNavigate={navigate} />}
          {currentPage === 'home' && <HomePage onNavigate={navigate} />}
          {currentPage === 'vocabulary' && <VocabularyPage level={selectedLevel} module={selectedModule} onNavigate={navigate} />}
          {currentPage === 'grammar' && <GrammarPage level={selectedLevel} topic={selectedTopic} onNavigate={navigate} />}
          {currentPage === 'verbs' && <VerbsPage selectedVerb={selectedModule} onNavigate={navigate} />}
          {currentPage === 'quiz' && <QuizPage level={selectedLevel} onNavigate={navigate} />}
          {currentPage === 'practice' && <PracticePage onNavigate={navigate} />}
          {currentPage === 'special-verbs' && <SpecialVerbsPage onNavigate={navigate} />}
          {currentPage === 'favorites' && <FavoritesPage onNavigate={navigate} />}
          {currentPage === 'reading' && <ReadingPage level={selectedLevel} reading={selectedReading} onNavigate={navigate} />}
          {currentPage === 'stories' && <StoriesPage level={selectedLevel} story={selectedStory} onNavigate={navigate} />}
          {currentPage === 'lessons' && <LessonsPage selectedLesson={selectedLesson} onNavigate={navigate} />}
          {currentPage === 'profile' && <ProfilePage onNavigate={navigate} />}
          {currentPage === 'flashcards' && <FlashcardsPage onNavigate={navigate} />}
          {currentPage === 'writing' && <WritingPage onNavigate={navigate} />}
          {currentPage === 'listening' && <ListeningPage onNavigate={navigate} />}
          {currentPage === 'paths' && <PathsPage onNavigate={navigate} />}
          {currentPage === 'essential-words' && <EssentialWordsPage level={selectedLevel} onNavigate={navigate} />}
          {currentPage === 'verb-prefixes' && <VerbPrefixesPage onNavigate={navigate} />}
          {currentPage === 'werden' && <WerdenPage onNavigate={navigate} />}
          {currentPage === 'placement-test' && <PlacementTestPage onNavigate={navigate} />}
          {currentPage === 'dona' && <DonaPage onNavigate={navigate} />}
          {currentPage === 'admin' && <AdminPage onNavigate={navigate} />}
        </Suspense>
      </main>
      {!isLoginPage && !shouldShow404 && <BottomNav currentPage={currentPage} onNavigate={navigate} />}
      {!isLoginPage && !shouldShow404 && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

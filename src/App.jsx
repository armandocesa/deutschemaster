import React, { useState, useMemo, useCallback, Suspense } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Footer from './components/Footer';

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
const NotFoundPage = React.lazy(() => import('./pages/NotFoundPage'));

const PAGE_NAMES = {
  home: 'Home', vocabulary: 'Vocabolario', grammar: 'Grammatica', reading: 'Lettura',
  quiz: 'Quiz', verbs: 'Verbi', 'special-verbs': 'Verbi Speciali', practice: 'Pratica',
  favorites: 'Salvate', lessons: 'Lezioni', profile: 'Profilo', flashcards: 'Flashcards',
  writing: 'Scrittura', listening: 'Ascolto', paths: 'Percorsi',
  'essential-words': 'Parole Essenziali', 'verb-prefixes': 'Prefissi Verbali',
  'werden': 'Il Verbo Werden', login: 'Login', dona: 'Supporta Deutsche Master'
};

// Loading fallback component for lazy-loaded pages
const PageLoadingFallback = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f0f14', color: '#eeeef2' }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{ width: '48px', height: '48px', border: '3px solid rgba(108,92,231,0.3)', borderTopColor: '#6c5ce7', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
      <p style={{ fontSize: '14px', color: '#8888a0' }}>Caricamento della pagina...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  </div>
);

function AppContent() {
  const { loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedReading, setSelectedReading] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);

  const navigate = useCallback((page, options = {}) => {
    setCurrentPage(page);
    setSelectedLevel(options.level || null);
    setSelectedModule(options.module || null);
    setSelectedTopic(options.topic || null);
    setSelectedReading(options.reading || null);
    setSelectedLesson(options.lesson || null);
    window.scrollTo(0, 0);
  }, []);

  const goBack = useCallback(() => {
    if (currentPage === 'login') { setCurrentPage('home'); return; }
    if (selectedLesson) { setSelectedLesson(null); return; }
    if (selectedReading) { setSelectedReading(null); return; }
    if (selectedTopic) { setSelectedTopic(null); return; }
    if (selectedModule) { setSelectedModule(null); return; }
    if (selectedLevel && currentPage !== 'home') { setSelectedLevel(null); return; }
    setCurrentPage('home');
    setSelectedLevel(null);
    window.scrollTo(0, 0);
  }, [selectedLesson, selectedReading, selectedTopic, selectedModule, selectedLevel, currentPage]);

  const breadcrumbs = useMemo(() => {
    if (currentPage === 'home' || currentPage === 'login') return [];
    const crumbs = [{ label: 'Home', onClick: () => navigate('home') }];
    crumbs.push({ label: PAGE_NAMES[currentPage] || currentPage, onClick: () => navigate(currentPage) });
    if (selectedLevel) crumbs.push({ label: selectedLevel, onClick: () => navigate(currentPage, { level: selectedLevel }) });
    if (selectedModule && currentPage === 'vocabulary') crumbs.push({ label: selectedModule.name || 'Modulo', onClick: null });
    if (selectedTopic) crumbs.push({ label: selectedTopic.name || 'Argomento', onClick: null });
    if (selectedReading) crumbs.push({ label: selectedReading.title || 'Testo', onClick: null });
    if (selectedLesson) crumbs.push({ label: selectedLesson.title || 'Lezione', onClick: null });
    return crumbs;
  }, [currentPage, selectedLevel, selectedModule, selectedTopic, selectedReading, selectedLesson]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f0f14', color: '#eeeef2' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', border: '3px solid rgba(108,92,231,0.3)', borderTopColor: '#6c5ce7', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ fontSize: '14px', color: '#8888a0' }}>Caricamento...</p>
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
    'special-verbs', 'favorites', 'reading', 'lessons', 'profile', 'flashcards',
    'writing', 'listening', 'paths', 'essential-words', 'verb-prefixes', 'werden', 'dona'
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
          {currentPage === 'lessons' && <LessonsPage selectedLesson={selectedLesson} onNavigate={navigate} />}
          {currentPage === 'profile' && <ProfilePage onNavigate={navigate} />}
          {currentPage === 'flashcards' && <FlashcardsPage onNavigate={navigate} />}
          {currentPage === 'writing' && <WritingPage onNavigate={navigate} />}
          {currentPage === 'listening' && <ListeningPage onNavigate={navigate} />}
          {currentPage === 'paths' && <PathsPage onNavigate={navigate} />}
          {currentPage === 'essential-words' && <EssentialWordsPage level={selectedLevel} onNavigate={navigate} />}
          {currentPage === 'verb-prefixes' && <VerbPrefixesPage onNavigate={navigate} />}
          {currentPage === 'werden' && <WerdenPage onNavigate={navigate} />}
          {currentPage === 'dona' && <DonaPage onNavigate={navigate} />}
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

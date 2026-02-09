import React, { useState, useMemo, useCallback } from 'react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import VocabularyPage from './pages/VocabularyPage';
import GrammarPage from './pages/GrammarPage';
import VerbsPage from './pages/VerbsPage';
import QuizPage from './pages/QuizPage';
import PracticePage from './pages/PracticePage';
import SpecialVerbsPage from './pages/SpecialVerbsPage';
import FavoritesPage from './pages/FavoritesPage';
import ReadingPage from './pages/ReadingPage';
import LessonsPage from './pages/LessonsPage';
import ProfilePage from './pages/ProfilePage';
import FlashcardsPage from './pages/FlashcardsPage';
import WritingPage from './pages/WritingPage';
import ListeningPage from './pages/ListeningPage';
import PathsPage from './pages/PathsPage';
import EssentialWordsPage from './pages/EssentialWordsPage';
import VerbPrefixesPage from './pages/VerbPrefixesPage';
import WerdenPage from './pages/WerdenPage';

const PAGE_NAMES = {
  home: 'Home', vocabulary: 'Vocabolario', grammar: 'Grammatica', reading: 'Lettura',
  quiz: 'Quiz', verbs: 'Verbi', 'special-verbs': 'Verbi Speciali', practice: 'Pratica',
  favorites: 'Salvate', lessons: 'Lezioni', profile: 'Profilo', flashcards: 'Flashcards',
  writing: 'Scrittura', listening: 'Ascolto', paths: 'Percorsi',
  'essential-words': 'Parole Essenziali', 'verb-prefixes': 'Prefissi Verbali',
  'werden': 'Il Verbo Werden'
};

export default function App() {
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
    if (currentPage === 'home') return [];
    const crumbs = [{ label: 'Home', onClick: () => navigate('home') }];
    crumbs.push({ label: PAGE_NAMES[currentPage] || currentPage, onClick: () => navigate(currentPage) });
    if (selectedLevel) crumbs.push({ label: selectedLevel, onClick: () => navigate(currentPage, { level: selectedLevel }) });
    if (selectedModule && currentPage === 'vocabulary') crumbs.push({ label: selectedModule.name || 'Modulo', onClick: null });
    if (selectedTopic) crumbs.push({ label: selectedTopic.name || 'Argomento', onClick: null });
    if (selectedReading) crumbs.push({ label: selectedReading.title || 'Testo', onClick: null });
    if (selectedLesson) crumbs.push({ label: selectedLesson.title || 'Lezione', onClick: null });
    return crumbs;
  }, [currentPage, selectedLevel, selectedModule, selectedTopic, selectedReading, selectedLesson]);

  const showBack = currentPage !== 'home';

  return (
    <div className="app">
      <Header currentPage={currentPage} onNavigate={navigate} onBack={goBack} showBack={showBack} breadcrumbs={breadcrumbs} />
      <main className="main-content">
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
      </main>
      <BottomNav currentPage={currentPage} onNavigate={navigate} />
      <Footer />
    </div>
  );
}

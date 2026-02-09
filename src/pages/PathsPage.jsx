import React, { useState, useEffect } from 'react';
import { useData } from '../DataContext';
import { LEVEL_COLORS } from '../utils/constants';

// Complete path data with all 6 CEFR levels
const PATHS_DATA = [
  {
    id: 'a1',
    level: 'A1',
    name: 'Grundstufe I',
    subtitle: 'Principiante',
    color: '#10b981',
    stages: [
      {
        id: 'a1_1',
        name: 'Primi Passi',
        icon: '👋',
        activities: [
          { type: 'lesson', id: 'lesson_1', label: 'Lezione 1: Sich vorstellen', target: { page: 'lessons', lesson: 1 } },
          { type: 'lesson', id: 'lesson_2', label: 'Lezione 2: Grüße', target: { page: 'lessons', lesson: 2 } },
          { type: 'vocab', id: 'vocab_a1_1', label: 'Vocabolario: Saluti', target: { page: 'vocabulary', level: 'A1' } },
          { type: 'grammar', id: 'grammar_a1_1', label: 'Grammatica: Artikel', target: { page: 'grammar', level: 'A1' } },
          { type: 'quiz', id: 'quiz_a1_1', label: 'Mini Quiz A1', target: { page: 'quiz', level: 'A1' } },
        ]
      },
      {
        id: 'a1_2',
        name: 'Vita Quotidiana',
        icon: '🏠',
        activities: [
          { type: 'lesson', id: 'lesson_3', label: 'Lezione 3-5', target: { page: 'lessons', lesson: 3 } },
          { type: 'vocab', id: 'vocab_a1_2', label: 'Vocabolario: Casa e Famiglia', target: { page: 'vocabulary', level: 'A1' } },
          { type: 'grammar', id: 'grammar_a1_2', label: 'Grammatica: Verbi regolari', target: { page: 'grammar', level: 'A1' } },
          { type: 'writing', id: 'write_a1_1', label: 'Esercizio di Scrittura', target: { page: 'writing' } },
          { type: 'quiz', id: 'quiz_a1_2', label: 'Quiz: Vita Quotidiana', target: { page: 'quiz', level: 'A1' } },
        ]
      },
      {
        id: 'a1_3',
        name: 'Al Ristorante',
        icon: '🍽️',
        activities: [
          { type: 'lesson', id: 'lesson_6', label: 'Lezioni 6-8', target: { page: 'lessons', lesson: 6 } },
          { type: 'vocab', id: 'vocab_a1_3', label: 'Vocabolario: Cibo e Bevande', target: { page: 'vocabulary', level: 'A1' } },
          { type: 'listening', id: 'listen_a1_1', label: 'Esercizio di Ascolto', target: { page: 'listening' } },
          { type: 'flashcard', id: 'flash_a1_1', label: 'Flashcards A1', target: { page: 'flashcards' } },
          { type: 'reading', id: 'read_a1_1', label: 'Lettura A1', target: { page: 'reading', level: 'A1' } },
        ]
      },
      {
        id: 'a1_4',
        name: 'Checkpoint A1',
        icon: '🏆',
        activities: [
          { type: 'lesson', id: 'lesson_9', label: 'Lezioni 9-14', target: { page: 'lessons', lesson: 9 } },
          { type: 'quiz', id: 'quiz_a1_final', label: 'Test Finale A1', target: { page: 'quiz', level: 'A1' } },
          { type: 'reading', id: 'read_a1_2', label: 'Comprensione A1', target: { page: 'reading', level: 'A1' } },
        ]
      },
    ]
  },
  {
    id: 'a2',
    level: 'A2',
    name: 'Grundstufe II',
    subtitle: 'Elementare',
    color: '#06b6d4',
    stages: [
      {
        id: 'a2_1',
        name: 'In Viaggio',
        icon: '✈️',
        activities: [
          { type: 'lesson', id: 'lesson_a2_1', label: 'Lezione 1: Trasporti', target: { page: 'lessons', lesson: 15 } },
          { type: 'lesson', id: 'lesson_a2_2', label: 'Lezione 2: Albergo', target: { page: 'lessons', lesson: 16 } },
          { type: 'vocab', id: 'vocab_a2_1', label: 'Vocabolario: Viaggio', target: { page: 'vocabulary', level: 'A2' } },
          { type: 'grammar', id: 'grammar_a2_1', label: 'Grammatica: Präteritum', target: { page: 'grammar', level: 'A2' } },
          { type: 'listening', id: 'listen_a2_1', label: 'Dialoghi di Viaggio', target: { page: 'listening' } },
        ]
      },
      {
        id: 'a2_2',
        name: 'Shopping',
        icon: '🛍️',
        activities: [
          { type: 'lesson', id: 'lesson_a2_3', label: 'Lezione 3-4: Negozi', target: { page: 'lessons', lesson: 17 } },
          { type: 'vocab', id: 'vocab_a2_2', label: 'Vocabolario: Abbigliamento', target: { page: 'vocabulary', level: 'A2' } },
          { type: 'grammar', id: 'grammar_a2_2', label: 'Grammatica: Comparativi', target: { page: 'grammar', level: 'A2' } },
          { type: 'writing', id: 'write_a2_1', label: 'Esercizio: Descrizioni', target: { page: 'writing' } },
          { type: 'flashcard', id: 'flash_a2_1', label: 'Flashcards A2', target: { page: 'flashcards' } },
        ]
      },
      {
        id: 'a2_3',
        name: 'Al Lavoro',
        icon: '💼',
        activities: [
          { type: 'lesson', id: 'lesson_a2_5', label: 'Lezione 5-6: Lavoro', target: { page: 'lessons', lesson: 18 } },
          { type: 'vocab', id: 'vocab_a2_3', label: 'Vocabolario: Professioni', target: { page: 'vocabulary', level: 'A2' } },
          { type: 'grammar', id: 'grammar_a2_3', label: 'Grammatica: Passivo', target: { page: 'grammar', level: 'A2' } },
          { type: 'reading', id: 'read_a2_1', label: 'Testi A2', target: { page: 'reading', level: 'A2' } },
          { type: 'quiz', id: 'quiz_a2_1', label: 'Quiz A2', target: { page: 'quiz', level: 'A2' } },
        ]
      },
      {
        id: 'a2_4',
        name: 'Checkpoint A2',
        icon: '🏆',
        activities: [
          { type: 'lesson', id: 'lesson_a2_final', label: 'Lezioni 7-12', target: { page: 'lessons', lesson: 19 } },
          { type: 'quiz', id: 'quiz_a2_final', label: 'Test Finale A2', target: { page: 'quiz', level: 'A2' } },
          { type: 'reading', id: 'read_a2_2', label: 'Comprensione A2', target: { page: 'reading', level: 'A2' } },
        ]
      },
    ]
  },
  {
    id: 'b1',
    level: 'B1',
    name: 'Mittelstufe I',
    subtitle: 'Intermedio',
    color: '#8b5cf6',
    stages: [
      {
        id: 'b1_1',
        name: 'Media e Cultura',
        icon: '📺',
        activities: [
          { type: 'lesson', id: 'lesson_b1_1', label: 'Lezione 1: Cinema', target: { page: 'lessons', lesson: 25 } },
          { type: 'lesson', id: 'lesson_b1_2', label: 'Lezione 2: Letteratura', target: { page: 'lessons', lesson: 26 } },
          { type: 'vocab', id: 'vocab_b1_1', label: 'Vocabolario: Cultura', target: { page: 'vocabulary', level: 'B1' } },
          { type: 'grammar', id: 'grammar_b1_1', label: 'Grammatica: Konjunktiv', target: { page: 'grammar', level: 'B1' } },
          { type: 'listening', id: 'listen_b1_1', label: 'Ascolto: Interviste', target: { page: 'listening' } },
        ]
      },
      {
        id: 'b1_2',
        name: 'Salute',
        icon: '🏥',
        activities: [
          { type: 'lesson', id: 'lesson_b1_3', label: 'Lezione 3-4: Medicina', target: { page: 'lessons', lesson: 27 } },
          { type: 'vocab', id: 'vocab_b1_2', label: 'Vocabolario: Salute', target: { page: 'vocabulary', level: 'B1' } },
          { type: 'grammar', id: 'grammar_b1_2', label: 'Grammatica: Infinitiv mit zu', target: { page: 'grammar', level: 'B1' } },
          { type: 'writing', id: 'write_b1_1', label: 'Esercizio: Discussioni', target: { page: 'writing' } },
          { type: 'reading', id: 'read_b1_1', label: 'Articoli B1', target: { page: 'reading', level: 'B1' } },
        ]
      },
      {
        id: 'b1_3',
        name: 'Mondo del Lavoro',
        icon: '🌍',
        activities: [
          { type: 'lesson', id: 'lesson_b1_5', label: 'Lezione 5-6: Carriera', target: { page: 'lessons', lesson: 28 } },
          { type: 'vocab', id: 'vocab_b1_3', label: 'Vocabolario: Economia', target: { page: 'vocabulary', level: 'B1' } },
          { type: 'grammar', id: 'grammar_b1_3', label: 'Grammatica: Subjunktiv', target: { page: 'grammar', level: 'B1' } },
          { type: 'flashcard', id: 'flash_b1_1', label: 'Flashcards B1', target: { page: 'flashcards' } },
          { type: 'quiz', id: 'quiz_b1_1', label: 'Quiz B1', target: { page: 'quiz', level: 'B1' } },
        ]
      },
      {
        id: 'b1_4',
        name: 'Checkpoint B1',
        icon: '🏆',
        activities: [
          { type: 'lesson', id: 'lesson_b1_final', label: 'Lezioni 7-14', target: { page: 'lessons', lesson: 29 } },
          { type: 'quiz', id: 'quiz_b1_final', label: 'Test Finale B1', target: { page: 'quiz', level: 'B1' } },
          { type: 'reading', id: 'read_b1_2', label: 'Comprensione B1', target: { page: 'reading', level: 'B1' } },
        ]
      },
    ]
  },
  {
    id: 'b2',
    level: 'B2',
    name: 'Mittelstufe II',
    subtitle: 'Intermedio Superiore',
    color: '#f59e0b',
    stages: [
      {
        id: 'b2_1',
        name: 'Politica e Società',
        icon: '🏛️',
        activities: [
          { type: 'lesson', id: 'lesson_b2_1', label: 'Lezione 1: Politica', target: { page: 'lessons', lesson: 35 } },
          { type: 'lesson', id: 'lesson_b2_2', label: 'Lezione 2: Diritti', target: { page: 'lessons', lesson: 36 } },
          { type: 'vocab', id: 'vocab_b2_1', label: 'Vocabolario: Politica', target: { page: 'vocabulary', level: 'B2' } },
          { type: 'grammar', id: 'grammar_b2_1', label: 'Grammatica: Passiv Präteritum', target: { page: 'grammar', level: 'B2' } },
          { type: 'listening', id: 'listen_b2_1', label: 'Discussioni Politiche', target: { page: 'listening' } },
        ]
      },
      {
        id: 'b2_2',
        name: 'Ambiente',
        icon: '🌱',
        activities: [
          { type: 'lesson', id: 'lesson_b2_3', label: 'Lezione 3-4: Ecologia', target: { page: 'lessons', lesson: 37 } },
          { type: 'vocab', id: 'vocab_b2_2', label: 'Vocabolario: Ambiente', target: { page: 'vocabulary', level: 'B2' } },
          { type: 'grammar', id: 'grammar_b2_2', label: 'Grammatica: Konditional', target: { page: 'grammar', level: 'B2' } },
          { type: 'writing', id: 'write_b2_1', label: 'Saggio: Ambiente', target: { page: 'writing' } },
          { type: 'reading', id: 'read_b2_1', label: 'Testi Complessi', target: { page: 'reading', level: 'B2' } },
        ]
      },
      {
        id: 'b2_3',
        name: 'Economia',
        icon: '📈',
        activities: [
          { type: 'lesson', id: 'lesson_b2_5', label: 'Lezione 5-6: Finanza', target: { page: 'lessons', lesson: 38 } },
          { type: 'vocab', id: 'vocab_b2_3', label: 'Vocabolario: Economia', target: { page: 'vocabulary', level: 'B2' } },
          { type: 'grammar', id: 'grammar_b2_3', label: 'Grammatica: Partizipien', target: { page: 'grammar', level: 'B2' } },
          { type: 'flashcard', id: 'flash_b2_1', label: 'Flashcards B2', target: { page: 'flashcards' } },
          { type: 'quiz', id: 'quiz_b2_1', label: 'Quiz B2', target: { page: 'quiz', level: 'B2' } },
        ]
      },
      {
        id: 'b2_4',
        name: 'Checkpoint B2',
        icon: '🏆',
        activities: [
          { type: 'lesson', id: 'lesson_b2_final', label: 'Lezioni 7-14', target: { page: 'lessons', lesson: 39 } },
          { type: 'quiz', id: 'quiz_b2_final', label: 'Test Finale B2', target: { page: 'quiz', level: 'B2' } },
          { type: 'reading', id: 'read_b2_2', label: 'Comprensione B2', target: { page: 'reading', level: 'B2' } },
        ]
      },
    ]
  },
  {
    id: 'c1',
    level: 'C1',
    name: 'Oberstufe I',
    subtitle: 'Avanzato',
    color: '#ef4444',
    stages: [
      {
        id: 'c1_1',
        name: 'Letteratura',
        icon: '📚',
        activities: [
          { type: 'lesson', id: 'lesson_c1_1', label: 'Lezione 1: Goethe', target: { page: 'lessons', lesson: 45 } },
          { type: 'lesson', id: 'lesson_c1_2', label: 'Lezione 2: Schiller', target: { page: 'lessons', lesson: 46 } },
          { type: 'vocab', id: 'vocab_c1_1', label: 'Vocabolario: Letterario', target: { page: 'vocabulary', level: 'C1' } },
          { type: 'grammar', id: 'grammar_c1_1', label: 'Grammatica: Stil Avanzato', target: { page: 'grammar', level: 'C1' } },
          { type: 'reading', id: 'read_c1_1', label: 'Analisi Testuale', target: { page: 'reading', level: 'C1' } },
        ]
      },
      {
        id: 'c1_2',
        name: 'Scienza',
        icon: '🔬',
        activities: [
          { type: 'lesson', id: 'lesson_c1_3', label: 'Lezione 3-4: Ricerca', target: { page: 'lessons', lesson: 47 } },
          { type: 'vocab', id: 'vocab_c1_2', label: 'Vocabolario: Scientifico', target: { page: 'vocabulary', level: 'C1' } },
          { type: 'grammar', id: 'grammar_c1_2', label: 'Grammatica: Discorso Accademico', target: { page: 'grammar', level: 'C1' } },
          { type: 'writing', id: 'write_c1_1', label: 'Articolo Accademico', target: { page: 'writing' } },
          { type: 'listening', id: 'listen_c1_1', label: 'Conferenze Scientifiche', target: { page: 'listening' } },
        ]
      },
      {
        id: 'c1_3',
        name: 'Filosofia',
        icon: '🧠',
        activities: [
          { type: 'lesson', id: 'lesson_c1_5', label: 'Lezione 5-6: Kant', target: { page: 'lessons', lesson: 48 } },
          { type: 'vocab', id: 'vocab_c1_3', label: 'Vocabolario: Filosofico', target: { page: 'vocabulary', level: 'C1' } },
          { type: 'grammar', id: 'grammar_c1_3', label: 'Grammatica: Argomentazione', target: { page: 'grammar', level: 'C1' } },
          { type: 'flashcard', id: 'flash_c1_1', label: 'Flashcards C1', target: { page: 'flashcards' } },
          { type: 'quiz', id: 'quiz_c1_1', label: 'Quiz C1', target: { page: 'quiz', level: 'C1' } },
        ]
      },
      {
        id: 'c1_4',
        name: 'Checkpoint C1',
        icon: '🏆',
        activities: [
          { type: 'lesson', id: 'lesson_c1_final', label: 'Lezioni 7-14', target: { page: 'lessons', lesson: 49 } },
          { type: 'quiz', id: 'quiz_c1_final', label: 'Test Finale C1', target: { page: 'quiz', level: 'C1' } },
          { type: 'reading', id: 'read_c1_2', label: 'Comprensione C1', target: { page: 'reading', level: 'C1' } },
        ]
      },
    ]
  },
  {
    id: 'c2',
    level: 'C2',
    name: 'Oberstufe II',
    subtitle: 'Padronanza',
    color: '#ec4899',
    stages: [
      {
        id: 'c2_1',
        name: 'Linguistica',
        icon: '🗣️',
        activities: [
          { type: 'lesson', id: 'lesson_c2_1', label: 'Lezione 1: Semantica', target: { page: 'lessons', lesson: 55 } },
          { type: 'lesson', id: 'lesson_c2_2', label: 'Lezione 2: Pragmatica', target: { page: 'lessons', lesson: 56 } },
          { type: 'vocab', id: 'vocab_c2_1', label: 'Vocabolario: Linguistica', target: { page: 'vocabulary', level: 'C2' } },
          { type: 'grammar', id: 'grammar_c2_1', label: 'Grammatica: Uso Idiomatico', target: { page: 'grammar', level: 'C2' } },
          { type: 'reading', id: 'read_c2_1', label: 'Testi Specialistici', target: { page: 'reading', level: 'C2' } },
        ]
      },
      {
        id: 'c2_2',
        name: 'Cultura Avanzata',
        icon: '🎭',
        activities: [
          { type: 'lesson', id: 'lesson_c2_3', label: 'Lezione 3-4: Arte', target: { page: 'lessons', lesson: 57 } },
          { type: 'vocab', id: 'vocab_c2_2', label: 'Vocabolario: Culturale', target: { page: 'vocabulary', level: 'C2' } },
          { type: 'grammar', id: 'grammar_c2_2', label: 'Grammatica: Varianti Stilistiche', target: { page: 'grammar', level: 'C2' } },
          { type: 'writing', id: 'write_c2_1', label: 'Critica Letteraria', target: { page: 'writing' } },
          { type: 'listening', id: 'listen_c2_1', label: 'Seminari Universitari', target: { page: 'listening' } },
        ]
      },
      {
        id: 'c2_3',
        name: 'Maestria',
        icon: '👑',
        activities: [
          { type: 'lesson', id: 'lesson_c2_5', label: 'Lezione 5-6: Mastery', target: { page: 'lessons', lesson: 58 } },
          { type: 'vocab', id: 'vocab_c2_3', label: 'Vocabolario: Specialistico', target: { page: 'vocabulary', level: 'C2' } },
          { type: 'grammar', id: 'grammar_c2_3', label: 'Grammatica: Eccellenza', target: { page: 'grammar', level: 'C2' } },
          { type: 'flashcard', id: 'flash_c2_1', label: 'Flashcards C2', target: { page: 'flashcards' } },
          { type: 'quiz', id: 'quiz_c2_1', label: 'Quiz C2', target: { page: 'quiz', level: 'C2' } },
        ]
      },
      {
        id: 'c2_4',
        name: 'Checkpoint C2',
        icon: '👑',
        activities: [
          { type: 'lesson', id: 'lesson_c2_final', label: 'Lezioni 7-14', target: { page: 'lessons', lesson: 59 } },
          { type: 'quiz', id: 'quiz_c2_final', label: 'Test Finale C2', target: { page: 'quiz', level: 'C2' } },
          { type: 'reading', id: 'read_c2_2', label: 'Comprensione C2', target: { page: 'reading', level: 'C2' } },
        ]
      },
    ]
  },
];

// Activity type icons
const ACTIVITY_ICONS = {
  lesson: '📖',
  vocab: '📝',
  grammar: '📐',
  writing: '✏️',
  listening: '🎧',
  flashcard: '🃏',
  quiz: '❓',
  reading: '📚',
};

const PathsPage = ({ onNavigate }) => {
  const { user } = useData();
  const [selectedPath, setSelectedPath] = useState('a1');
  const [expandedStage, setExpandedStage] = useState(null);
  const [pathProgress, setPathProgress] = useState({});

  useEffect(() => {
    const saved = (() => { try { return JSON.parse(localStorage.getItem('dm_path_progress')); } catch { return null; } })();
    setPathProgress(saved || {});
  }, []);

  const currentPathData = PATHS_DATA.find(p => p.id === selectedPath);

  // Calculate completion stats
  const calculateCompletion = (stages) => {
    let total = 0;
    let completed = 0;
    stages.forEach(stage => {
      stage.activities.forEach(activity => {
        total++;
        if (pathProgress[`${stage.id}_${activity.id}`]) {
          completed++;
        }
      });
    });
    return { completed, total, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
  };

  const calculateStageCompletion = (stage) => {
    let total = stage.activities.length;
    let completed = 0;
    stage.activities.forEach(activity => {
      if (pathProgress[`${stage.id}_${activity.id}`]) {
        completed++;
      }
    });
    return { completed, total, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
  };

  // Check if stage is locked (previous stage < 60% complete)
  const isStageLocked = (stageIndex) => {
    if (stageIndex === 0) return false;
    const prevStage = currentPathData.stages[stageIndex - 1];
    const prevCompletion = calculateStageCompletion(prevStage);
    return prevCompletion.percentage < 60;
  };

  const handleActivityClick = (activity, stageId) => {
    const key = `${stageId}_${activity.id}`;
    const updated = { ...pathProgress, [key]: true };
    setPathProgress(updated);
    localStorage.setItem('dm_path_progress', JSON.stringify(updated));

    if (activity.target.lesson !== undefined) {
      onNavigate(activity.target.page, { lesson: activity.target.lesson });
    } else if (activity.target.level) {
      onNavigate(activity.target.page, { level: activity.target.level });
    } else {
      onNavigate(activity.target.page);
    }
  };

  const currentCompletion = calculateCompletion(currentPathData.stages);

  return (
    <div style={{
      backgroundColor: '#0f0f14',
      color: '#eeeef2',
      minHeight: '100vh',
      padding: '0',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      {/* Header */}
      <div style={{
        padding: '20px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        backgroundColor: '#191920',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h1 style={{ margin: '0 0 20px 0', fontSize: '28px', fontWeight: '700' }}>
            Percorsi di Apprendimento
          </h1>
          <p style={{ margin: '0', color: '#8888a0', fontSize: '14px' }}>
            Segui i tuoi progressi attraverso i livelli Goethe-Zertifikat
          </p>
        </div>
      </div>

      {/* Level Tabs */}
      <div style={{
        padding: '20px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        overflow: 'auto',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
        }}>
          {PATHS_DATA.map((path) => {
            const pathCompletion = calculateCompletion(path.stages);
            const isSelected = selectedPath === path.id;

            return (
              <button
                key={path.id}
                onClick={() => {
                  setSelectedPath(path.id);
                  setExpandedStage(null);
                }}
                style={{
                  padding: '12px 20px',
                  borderRadius: '12px',
                  border: 'none',
                  backgroundColor: isSelected ? path.color : '#22222d',
                  color: isSelected ? '#fff' : '#eeeef2',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: isSelected ? `0 4px 12px ${path.color}40` : 'none',
                }}
              >
                <span style={{ fontSize: '16px' }}>{path.level}</span>
                <span style={{ fontSize: '12px', opacity: 0.7 }}>
                  {pathCompletion.percentage}%
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '40px 20px',
      }}>
        {currentPathData && (
          <div>
            {/* Path Header */}
            <div style={{ marginBottom: '40px' }}>
              <h2 style={{
                margin: '0 0 8px 0',
                fontSize: '24px',
                fontWeight: '700',
              }}>
                {currentPathData.name}
              </h2>
              <p style={{
                margin: '0 0 20px 0',
                color: '#8888a0',
                fontSize: '14px',
              }}>
                {currentPathData.subtitle}
              </p>

              {/* Progress Bar */}
              <div style={{
                backgroundColor: '#22222d',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{
                    backgroundColor: '#14141f',
                    borderRadius: '8px',
                    height: '8px',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      backgroundColor: currentPathData.color,
                      height: '100%',
                      width: `${currentCompletion.percentage}%`,
                      transition: 'width 0.3s ease',
                    }} />
                  </div>
                </div>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  minWidth: '60px',
                  textAlign: 'right',
                }}>
                  {currentCompletion.completed}/{currentCompletion.total}
                </div>
              </div>
            </div>

            {/* Stages */}
            <div style={{ position: 'relative' }}>
              {currentPathData.stages.map((stage, stageIndex) => {
                const stageCompletion = calculateStageCompletion(stage);
                const isExpanded = expandedStage === stage.id;
                const isLocked = isStageLocked(stageIndex);

                return (
                  <div key={stage.id} style={{ marginBottom: '0' }}>
                    {/* Connector Line (before stage) */}
                    {stageIndex > 0 && (
                      <div style={{
                        width: '2px',
                        height: '16px',
                        backgroundColor: isLocked ? '#4a4a5a' : currentPathData.color,
                        opacity: isLocked ? 0.4 : 1,
                        margin: '0 auto',
                        borderStyle: isLocked ? 'dashed' : 'solid',
                        display: 'block',
                      }} />
                    )}

                    {/* Stage Card */}
                    <div
                      onClick={() => !isLocked && setExpandedStage(isExpanded ? null : stage.id)}
                      style={{
                        display: 'flex',
                        gap: '16px',
                        marginBottom: '24px',
                        cursor: isLocked ? 'not-allowed' : 'pointer',
                        opacity: isLocked ? 0.5 : 1,
                      }}
                    >
                      {/* Stage Circle */}
                      <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        backgroundColor: currentPathData.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '28px',
                        flexShrink: 0,
                        boxShadow: `0 4px 16px ${currentPathData.color}40`,
                      }}>
                        {stage.icon}
                      </div>

                      {/* Stage Info */}
                      <div style={{
                        flex: 1,
                        backgroundColor: '#22222d',
                        borderRadius: '12px',
                        padding: '16px',
                        border: `1px solid ${isExpanded ? currentPathData.color + '40' : 'rgba(255,255,255,0.07)'}`,
                        transition: 'all 0.3s ease',
                      }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '8px',
                        }}>
                          <h3 style={{
                            margin: '0',
                            fontSize: '16px',
                            fontWeight: '600',
                          }}>
                            {stage.name}
                          </h3>
                          <span style={{
                            fontSize: '12px',
                            color: '#8888a0',
                          }}>
                            {stageCompletion.completed}/{stageCompletion.total}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div style={{
                          backgroundColor: '#14141f',
                          borderRadius: '6px',
                          height: '6px',
                          overflow: 'hidden',
                        }}>
                          <div style={{
                            backgroundColor: currentPathData.color,
                            height: '100%',
                            width: `${stageCompletion.percentage}%`,
                            transition: 'width 0.3s ease',
                          }} />
                        </div>

                        {/* Chevron */}
                        <div style={{
                          position: 'absolute',
                          right: '20px',
                          top: '50%',
                          transform: `translateY(-50%) rotate(${isExpanded ? 90 : 0}deg)`,
                          transition: 'transform 0.3s ease',
                          fontSize: '20px',
                          color: currentPathData.color,
                        }}>
                          ›
                        </div>
                      </div>
                    </div>

                    {/* Expanded Activities */}
                    {isExpanded && !isLocked && (
                      <div style={{
                        marginLeft: '30px',
                        marginBottom: '24px',
                        borderLeft: `2px solid ${currentPathData.color}40`,
                        paddingLeft: '24px',
                      }}>
                        {stage.activities.map((activity) => {
                          const activityKey = `${stage.id}_${activity.id}`;
                          const isCompleted = pathProgress[activityKey];

                          return (
                            <div
                              key={activity.id}
                              onClick={() => handleActivityClick(activity, stage.id)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '12px 16px',
                                marginBottom: '8px',
                                backgroundColor: '#22222d',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                border: '1px solid rgba(255,255,255,0.07)',
                                transition: 'all 0.2s ease',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#2a2a35';
                                e.currentTarget.style.borderColor = `${currentPathData.color}40`;
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#22222d';
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
                              }}
                            >
                              {/* Activity Icon */}
                              <span style={{ fontSize: '16px' }}>
                                {ACTIVITY_ICONS[activity.type] || '•'}
                              </span>

                              {/* Activity Label */}
                              <span style={{
                                flex: 1,
                                fontSize: '14px',
                                fontWeight: '500',
                                textDecoration: isCompleted ? 'line-through' : 'none',
                                opacity: isCompleted ? 0.6 : 1,
                              }}>
                                {activity.label}
                              </span>

                              {/* Completion Check */}
                              <div style={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                backgroundColor: isCompleted ? '#00b894' : 'transparent',
                                border: `2px solid ${isCompleted ? '#00b894' : '#4a4a5a'}`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '12px',
                                color: isCompleted ? '#fff' : 'transparent',
                                flexShrink: 0,
                              }}>
                                {isCompleted && '✓'}
                              </div>

                              {/* Chevron */}
                              <span style={{
                                fontSize: '16px',
                                color: '#8888a0',
                                marginLeft: '4px',
                              }}>
                                ›
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Locked Stage Message */}
                    {isLocked && (
                      <div style={{
                        marginLeft: '30px',
                        marginBottom: '24px',
                        padding: '12px 16px',
                        backgroundColor: '#22222d',
                        borderRadius: '8px',
                        borderLeft: '2px solid #4a4a5a',
                        paddingLeft: '24px',
                        color: '#8888a0',
                        fontSize: '13px',
                      }}>
                        🔒 Completa il percorso precedente per continuare (minimo 60%)
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Completion Badge */}
            {currentCompletion.percentage === 100 && (
              <div style={{
                marginTop: '40px',
                padding: '24px',
                backgroundColor: currentPathData.color + '20',
                borderRadius: '12px',
                border: `2px solid ${currentPathData.color}`,
                textAlign: 'center',
              }}>
                <div style={{
                  fontSize: '32px',
                  marginBottom: '8px',
                }}>
                  🎉
                </div>
                <div style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  marginBottom: '4px',
                }}>
                  Percorso Completato!
                </div>
                <div style={{
                  color: '#8888a0',
                  fontSize: '14px',
                }}>
                  Congratulazioni! Hai completato tutti gli esercizi di {currentPathData.name}.
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PathsPage;

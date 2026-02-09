import React, { useState, useEffect } from 'react';
import Icons from '../components/Icons';
import { LEVEL_COLORS, fisherYatesShuffle } from '../utils/constants';
import { useData } from '../DataContext';
import { getDifficultWords, updateQuizStats, markWordStatus, markGrammarStatus, isReviewQuestion, saveReviewQuestion, removeReviewQuestion } from '../utils/storage';
import { addXP, recordActivity, addToReview } from '../utils/gamification';

export default function QuizPage({ level, onNavigate }) {
  const { VOCABULARY_DATA, GRAMMAR_DATA } = useData();
  const [quizState, setQuizState] = useState('setup');
  const [quizType, setQuizType] = useState('vocabulary');
  const [quizLevel, setQuizLevel] = useState(level || 'A1');
  const [difficultOnly, setDifficultOnly] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState({});

  useEffect(() => { if (level) setQuizLevel(level); }, [level]);

  const getUsedQuestions = (type, lvl) => { try { return JSON.parse(localStorage.getItem(`dm_quiz_${type}_${lvl}`)) || []; } catch { return []; } };
  const saveUsedQuestions = (type, lvl, used) => { localStorage.setItem(`dm_quiz_${type}_${lvl}`, JSON.stringify(used)); };

  const findSimilarAnswers = (correct, allAnswers, count = 3) => {
    const c = correct.toLowerCase().trim();
    return allAnswers.filter(a => a.toLowerCase().trim() !== c)
      .map(a => { const ans = a.toLowerCase().trim(); let sc = 0; if(ans[0]===c[0])sc+=3; if(Math.abs(ans.length-c.length)<=3)sc+=2; if(ans.slice(-2)===c.slice(-2))sc+=2; const common=[...c].filter(ch=>ans.includes(ch)).length; sc+=(common/c.length)*2; return{answer:a,score:sc}; })
      .sort((a,b) => b.score - a.score).slice(0, count).map(s => s.answer);
  };

  const generateQuestions = (type, lvl, count) => {
    const qs = [];
    let usedIds = getUsedQuestions(type, lvl);
    if (type === 'vocabulary') {
      let allWords = [];
      const wordsByMod = {};
      if (difficultOnly) { allWords = getDifficultWords().filter(w => w.type === 'word'); }
      else {
        const levelData = VOCABULARY_DATA.levels?.[lvl];
        levelData?.modules?.forEach(m => { const mod = m.name||m.category||'x'; wordsByMod[mod]=m.words||[]; m.words?.forEach(w => allWords.push({...w, mod})); });
      }
      let available = allWords.filter(w => !usedIds.includes(w.german));
      if (available.length < count) { usedIds = []; available = allWords; }
      const selected = fisherYatesShuffle(available).slice(0, count);
      const allItalian = [...new Set(allWords.map(w => w.italian))];
      selected.forEach(word => {
        const sameMod = (wordsByMod[word.mod]||[]).filter(w => w.italian !== word.italian).map(w => w.italian);
        const wrongAnswers = sameMod.length >= 3 ? findSimilarAnswers(word.italian, sameMod, 3) : findSimilarAnswers(word.italian, allItalian, 3);
        qs.push({ question: `Cosa significa "${word.german}"?`, correctAnswer: word.italian, options: fisherYatesShuffle([word.italian, ...wrongAnswers]), type: 'vocabulary', wordId: word.german });
        usedIds.push(word.german);
      });
      saveUsedQuestions(type, lvl, usedIds);
    } else {
      const levelData = GRAMMAR_DATA.levels?.[lvl];
      const allEx = [];
      levelData?.topics?.forEach(t => { t.exercises?.forEach((ex, i) => allEx.push({...ex, id: `${t.id}_${i}`, topicId: t.id})); });
      let available = allEx.filter(ex => !usedIds.includes(ex.id));
      if (available.length < count) { usedIds = []; available = allEx; }
      const selected = fisherYatesShuffle(available).slice(0, count);
      selected.forEach(ex => { qs.push({question: ex.question, correctAnswer: ex.answer, explanation: ex.explanation, type: 'grammar', isOpen: true, grammarId: ex.topicId}); usedIds.push(ex.id); });
      saveUsedQuestions(type, lvl, usedIds);
    }
    return qs;
  };

  const startQuiz = () => { const q = generateQuestions(quizType, quizLevel, 10); setQuestions(q); setCurrentQuestion(0); setScore(0); setAnswers({}); setQuizState('playing'); };

  const handleAnswer = (answer) => {
    if (answers[currentQuestion] !== undefined) return;
    setAnswers(prev => ({...prev, [currentQuestion]: answer}));
    const q = questions[currentQuestion];
    const na = typeof answer === 'string' ? answer.toLowerCase().trim() : answer;
    const nc = typeof q.correctAnswer === 'string' ? q.correctAnswer.toLowerCase().trim() : q.correctAnswer;
    const isCorrect = q.isOpen ? na === nc : answer === q.correctAnswer;
    if (isCorrect) { setScore(s => s + 1); addXP(10, 'quiz_correct'); }
    updateQuizStats(isCorrect);
    if (q.wordId) { markWordStatus(q.wordId, isCorrect); if (!isCorrect) addToReview(q.wordId, q.question.replace('Cosa significa "','').replace('"?',''), q.correctAnswer); }
    if (q.grammarId) markGrammarStatus(q.grammarId, isCorrect);
    recordActivity();
  };

  const prevQuestion = () => { if (currentQuestion > 0) setCurrentQuestion(currentQuestion - 1); };
  const nextQuestion = () => { if (currentQuestion < questions.length - 1) setCurrentQuestion(currentQuestion + 1); else setQuizState('finished'); };
  const toggleSaveQuestion = () => { const q = questions[currentQuestion]; if (isReviewQuestion(q.question)) removeReviewQuestion(q.question); else saveReviewQuestion(q); };

  useEffect(() => {
    if (quizState !== 'playing') return;
    const handler = (e) => {
      const current = questions[currentQuestion];
      const hasAnswered = answers[currentQuestion] !== undefined;
      if (!current) return;
      if (!hasAnswered && !current.isOpen && current.options) { const num = parseInt(e.key); if (num >= 1 && num <= current.options.length) { handleAnswer(current.options[num - 1]); return; } }
      if (e.key === 'Enter' && hasAnswered) nextQuestion();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [quizState, currentQuestion, answers, questions]);

  if (quizState === 'setup') {
    return (
      <div className="quiz-page">
        <h1 className="page-title">Quiz</h1>
        <p className="page-subtitle">Metti alla prova le tue conoscenze</p>
        <div className="quiz-setup">
          <div className="setup-section"><h3>Tipo di quiz</h3>
            <div className="setup-options">
              <button className={`setup-option ${quizType==='vocabulary'?'active':''}`} onClick={() => setQuizType('vocabulary')}><Icons.Book />Vocabolario</button>
              <button className={`setup-option ${quizType==='grammar'?'active':''}`} onClick={() => setQuizType('grammar')}><Icons.Grammar />Grammatica</button>
            </div>
          </div>
          <div className="setup-section"><h3>Livello</h3>
            <div className="setup-options levels">
              {Object.entries(LEVEL_COLORS).map(([lvl, colors]) => (
                <button key={lvl} className={`setup-option level ${quizLevel===lvl?'active':''}`} style={{'--level-color': colors.bg}} onClick={() => setQuizLevel(lvl)}>{lvl}</button>
              ))}
            </div>
          </div>
          <button className="start-quiz-btn" onClick={startQuiz}>Inizia Quiz</button>
        </div>
      </div>
    );
  }

  if (quizState === 'finished') {
    const percentage = Math.round((score / questions.length) * 100);
    const quizXP = score * 10 + 50;
    return (
      <div className="quiz-page">
        <div className="quiz-finished">
          <div className="score-circle"><span className="score-value">{percentage}%</span></div>
          <h2>Quiz completato!</h2>
          <p className="score-text">{score} risposte corrette su {questions.length}</p>
          <p style={{color:'var(--accent)',fontWeight:700,fontSize:'16px',margin:'8px 0'}}>+{quizXP} XP</p>
          <div className="quiz-actions">
            <button className="retry-btn" onClick={startQuiz}>Riprova</button>
            <button className="back-btn" onClick={() => setQuizState('setup')}>Nuovo quiz</button>
          </div>
        </div>
      </div>
    );
  }

  const current = questions[currentQuestion];
  const selectedAnswer = answers[currentQuestion];
  const hasAnswered = selectedAnswer !== undefined;
  const isCorrect = current?.isOpen ? (typeof selectedAnswer==='string'?selectedAnswer.toLowerCase().trim():selectedAnswer)===(typeof current?.correctAnswer==='string'?current.correctAnswer.toLowerCase().trim():current?.correctAnswer) : selectedAnswer === current?.correctAnswer;

  return (
    <div className="quiz-page">
      <div className="quiz-header">
        {currentQuestion > 0 && <button className="quiz-nav-btn" onClick={prevQuestion}><Icons.Back /> Indietro</button>}
        <span className="question-number">Domanda {currentQuestion + 1} di {questions.length}</span>
        <button className={`save-question-btn ${isReviewQuestion(current?.question)?'saved':''}`} onClick={toggleSaveQuestion}>{isReviewQuestion(current?.question) ? <Icons.StarFilled /> : <Icons.Star />}</button>
      </div>
      <div className="quiz-progress"><div className="progress-bar"><div className="progress-fill" style={{width: `${((currentQuestion+1)/questions.length)*100}%`}} /></div></div>
      <div className="quiz-card">
        <p className="quiz-question">{current?.question}</p>
        {current?.isOpen ? (
          <div className="open-answer">
            {!hasAnswered ? (
              <>
                <input type="text" className="quiz-input" placeholder="La tua risposta..." onKeyDown={(e) => { if(e.key==='Enter'&&e.target.value)handleAnswer(e.target.value); }} />
                <button className="submit-answer-btn" onClick={() => { const input=document.querySelector('.open-answer .quiz-input'); if(input&&input.value)handleAnswer(input.value); }}>Verifica</button>
              </>
            ) : (
              <div className={`quiz-feedback ${isCorrect?'correct':'incorrect'}`}>
                <div className="result-icon">{isCorrect ? <Icons.Check /> : <Icons.X />}</div>
                <p className="your-answer">La tua risposta: {selectedAnswer}</p>
                <p className="correct-answer">Risposta corretta: {current.correctAnswer}</p>
                {current.explanation && <p className="explanation">{current.explanation}</p>}
              </div>
            )}
          </div>
        ) : (
          <div className="quiz-options">
            {current?.options?.map((option, idx) => (
              <button key={idx} className={`quiz-option ${hasAnswered?(option===current.correctAnswer?'correct':option===selectedAnswer?'incorrect':''):''}`} onClick={() => !hasAnswered&&handleAnswer(option)} disabled={hasAnswered}>
                <span style={{color:'var(--text-secondary)',marginRight:'8px',fontWeight:600}}>{idx+1}.</span> {option}
              </button>
            ))}
          </div>
        )}
        {hasAnswered && <button className="next-btn" onClick={nextQuestion}>{currentQuestion < questions.length-1 ? 'Prossima domanda' : 'Vedi risultati'}</button>}
      </div>
    </div>
  );
}

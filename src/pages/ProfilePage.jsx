import React, { useState, useMemo } from 'react';
import {
  getStreak,
  getStreakCalendar,
  getXP,
  getXPHistory,
  getDailyGoal,
  setDailyGoal,
  checkDailyGoal,
  getBadges,
} from '../utils/gamification';
import { getQuizStats, getProgressStats, getDifficultWords } from '../utils/storage';

const ProfilePage = ({ onNavigate }) => {
  const dailyGoalData = getDailyGoal();
  const [selectedGoal, setSelectedGoal] = useState(dailyGoalData.target || 50);
  const goalOptions = [10, 30, 50, 100, 150];

  // Fetch all data
  const xpData = useMemo(() => getXP(), []);
  const streakData = useMemo(() => getStreak(), []);
  const today = new Date();
  const streakCalendar = useMemo(() => getStreakCalendar(today.getFullYear(), today.getMonth() + 1), []);
  const xpHistory = useMemo(() => getXPHistory(30), []);
  const quizStats = useMemo(() => getQuizStats(), []);
  const progressStats = useMemo(() => getProgressStats(), []);
  const difficultWords = useMemo(() => getDifficultWords(), []);
  const badges = useMemo(() => getBadges(), []);

  const level = xpData.level || 1;

  // Get level name
  const getLevelName = (lvl) => {
    if (lvl <= 5) return 'Principiante';
    if (lvl <= 10) return 'Studente';
    if (lvl <= 20) return 'Intermedio';
    if (lvl <= 35) return 'Avanzato';
    if (lvl <= 50) return 'Esperto';
    return 'Maestro';
  };

  const levelName = getLevelName(level);

  // Handle goal change
  const handleGoalChange = (goal) => {
    setSelectedGoal(goal);
    setDailyGoal(goal);
  };

  // Get today's XP progress
  const todayXP = xpData.todayXP || 0;

  // Get today's date info for calendar
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const currentDay = today.getDate();

  const longestStreak = streakData.longestStreak || 0;

  // Build calendar grid for current month
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const activeSet = new Set(
      (streakCalendar || [])
        .filter((d) => d.active)
        .map((d) => d.day)
    );

    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        active: activeSet.has(i),
        isToday: i === currentDay,
      });
    }

    return days;
  }, [currentMonth, currentYear, currentDay, streakCalendar]);

  // Calculate XP for last 7 days
  const last7DaysXP = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toDateString();
      const xp = xpHistory.find((entry) => new Date(entry.date).toDateString() === dateStr)?.xp || 0;
      data.push({
        day: ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'][date.getDay()],
        xp,
        isToday: i === 0,
      });
    }
    return data;
  }, [xpHistory]);

  const maxXPInWeek = useMemo(() => Math.max(...last7DaysXP.map((d) => d.xp), 100), [last7DaysXP]);

  // Get total words studied
  const totalWordsStudied = useMemo(() => {
    return (progressStats?.wordsCorrect || 0) + (progressStats?.wordsIncorrect || 0);
  }, [progressStats]);

  // Get correct answers percentage
  const correctAnswersPercentage = useMemo(() => {
    if (!quizStats || quizStats.totalAnswered === 0) return 0;
    return Math.round((quizStats.correctAnswers / quizStats.totalAnswered) * 100);
  }, [quizStats]);

  // Get quizzes completed
  const quizzesCompleted = useMemo(() => {
    if (!quizStats || quizStats.totalAnswered === 0) return 0;
    return Math.floor(quizStats.totalAnswered / 10);
  }, [quizStats]);

  // Get saved words count
  const savedWordsCount = useMemo(() => difficultWords?.length || 0, [difficultWords]);

  // Get goal streak
  const goalStreak = useMemo(() => {
    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const entry = xpHistory.find((e) => e.date === dateStr);
      if (entry && entry.xp >= selectedGoal) {
        streak += 1;
      } else {
        break;
      }
    }
    return streak;
  }, [xpHistory, selectedGoal]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        padding: '24px 16px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: 'var(--text-primary)',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        {/* HEADER SECTION */}
        <div
          style={{
            marginBottom: '40px',
            textAlign: 'center',
          }}
        >
          <h1
            style={{
              fontSize: '32px',
              fontWeight: '700',
              marginBottom: '24px',
              color: 'var(--text-primary)',
            }}
          >
            Il tuo Profilo
          </h1>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '32px',
              flexWrap: 'wrap',
            }}
          >
            {/* XP Display */}
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: '14px',
                  color: 'var(--text-secondary)',
                  marginBottom: '12px',
                  fontWeight: '500',
                }}
              >
                PUNTI ESPERIENZA
              </div>
              <div
                style={{
                  fontSize: '48px',
                  fontWeight: '700',
                  color: 'var(--accent)',
                }}
              >
                {(xpData.totalXP || 0).toLocaleString()}
              </div>
            </div>

            {/* Level Badge */}
            <div
              style={{
                width: '160px',
                height: '160px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3)',
                color: 'white',
              }}
            >
              <div style={{ fontSize: '56px', fontWeight: '700' }}>{level}</div>
              <div
                style={{
                  fontSize: '14px',
                  marginTop: '8px',
                  opacity: '0.95',
                  fontWeight: '500',
                }}
              >
                {levelName}
              </div>
            </div>
          </div>
        </div>

        {/* STREAK SECTION */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '28px',
            marginBottom: '32px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '16px',
            }}
          >
            <span style={{ fontSize: '48px' }}>🔥</span>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: '44px',
                  fontWeight: '700',
                  color: 'var(--text-primary)',
                }}
              >
                {streakData.currentStreak || 0}
              </div>
              <div
                style={{
                  fontSize: '14px',
                  color: 'var(--text-secondary)',
                  marginTop: '4px',
                }}
              >
                Longest streak: {longestStreak} giorni
              </div>
            </div>
          </div>

          {/* Mini Calendar */}
          <div style={{ marginTop: '24px' }}>
            <h3
              style={{
                fontSize: '14px',
                fontWeight: '600',
                color: 'var(--text-secondary)',
                marginBottom: '16px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              {new Date(currentYear, currentMonth).toLocaleString('it-IT', {
                month: 'long',
                year: 'numeric',
              })}
            </h3>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '8px',
              }}
            >
              {['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'].map((dayName) => (
                <div
                  key={dayName}
                  style={{
                    textAlign: 'center',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: 'var(--text-secondary)',
                    marginBottom: '8px',
                  }}
                >
                  {dayName}
                </div>
              ))}

              {calendarDays.map((dayObj, idx) =>
                dayObj === null ? (
                  <div key={`empty-${idx}`} />
                ) : (
                  <div
                    key={dayObj.day}
                    style={{
                      aspectRatio: '1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 'var(--radius)',
                      fontSize: '12px',
                      fontWeight: '600',
                      background: dayObj.active ? 'var(--success)' : 'var(--bg)',
                      color: dayObj.active ? 'white' : 'var(--text-primary)',
                      border: dayObj.isToday ? '2px solid var(--accent)' : 'none',
                      cursor: 'default',
                      transition: 'all 0.2s',
                    }}
                  >
                    {dayObj.day}
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* DAILY GOAL SECTION */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '28px',
            marginBottom: '32px',
          }}
        >
          <h2
            style={{
              fontSize: '18px',
              fontWeight: '700',
              marginBottom: '24px',
              color: 'var(--text-primary)',
            }}
          >
            Obiettivo Giornaliero
          </h2>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '32px',
              marginBottom: '32px',
              flexWrap: 'wrap',
            }}
          >
            {/* Circular Progress */}
            <div
              style={{
                position: 'relative',
                width: '140px',
                height: '140px',
                flex: '0 0 auto',
              }}
            >
              <svg
                width="140"
                height="140"
                style={{ transform: 'rotate(-90deg)', overflow: 'visible' }}
              >
                {/* Background circle */}
                <circle
                  cx="70"
                  cy="70"
                  r="60"
                  fill="none"
                  stroke="var(--bg)"
                  strokeWidth="8"
                />

                {/* Progress circle */}
                <circle
                  cx="70"
                  cy="70"
                  r="60"
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 60}`}
                  strokeDashoffset={`${
                    2 * Math.PI * 60 * (1 - Math.min(todayXP, selectedGoal) / selectedGoal)
                  }`}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.3s' }}
                />
              </svg>

              <div
                style={{
                  position: 'absolute',
                  inset: '0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                }}
              >
                <div
                  style={{
                    fontSize: '24px',
                    fontWeight: '700',
                    color: 'var(--text-primary)',
                  }}
                >
                  {todayXP} / {selectedGoal}
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    color: 'var(--text-secondary)',
                    marginTop: '4px',
                  }}
                >
                  XP
                </div>
              </div>
            </div>

            {/* Goal Selector */}
            <div>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: 'var(--text-secondary)',
                  marginBottom: '16px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Scegli Obiettivo
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  flexWrap: 'wrap',
                }}
              >
                {goalOptions.map((goal) => (
                  <button
                    key={goal}
                    onClick={() => handleGoalChange(goal)}
                    style={{
                      padding: '12px 20px',
                      borderRadius: 'var(--radius)',
                      border:
                        selectedGoal === goal
                          ? '2px solid var(--accent)'
                          : '1px solid var(--border)',
                      background:
                        selectedGoal === goal ? 'var(--accent)' : 'var(--bg-card-hover)',
                      color:
                        selectedGoal === goal
                          ? 'white'
                          : 'var(--text-primary)',
                      fontWeight: '600',
                      fontSize: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      if (selectedGoal !== goal) {
                        e.target.style.borderColor = 'var(--accent)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedGoal !== goal) {
                        e.target.style.borderColor = 'var(--border)';
                      }
                    }}
                  >
                    {goal} XP
                  </button>
                ))}
              </div>

              <div
                style={{
                  marginTop: '16px',
                  fontSize: '14px',
                  color: 'var(--text-secondary)',
                }}
              >
                Streak: <span style={{ fontWeight: '700', color: 'var(--accent)' }}>{goalStreak}</span>{' '}
                giorni
              </div>
            </div>
          </div>
        </div>

        {/* STATISTICS SECTION */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            marginBottom: '32px',
          }}
        >
          {[
            { label: 'Parole Studiate', value: totalWordsStudied },
            { label: 'Risposte Corrette', value: `${correctAnswersPercentage}%` },
            { label: 'Quiz Completati', value: quizzesCompleted },
            { label: 'Parole Salvate', value: savedWordsCount },
            { label: 'XP Totali', value: (xpData.totalXP || 0).toLocaleString() },
            { label: 'Livello', value: level },
          ].map((stat, idx) => (
            <div
              key={idx}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                padding: '20px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: '13px',
                  color: 'var(--text-secondary)',
                  fontWeight: '600',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '12px',
                }}
              >
                {stat.label}
              </div>
              <div
                style={{
                  fontSize: '32px',
                  fontWeight: '700',
                  color: 'var(--accent)',
                }}
              >
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* XP WEEKLY CHART */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '28px',
            marginBottom: '32px',
          }}
        >
          <h2
            style={{
              fontSize: '18px',
              fontWeight: '700',
              marginBottom: '24px',
              color: 'var(--text-primary)',
            }}
          >
            XP Questa Settimana
          </h2>

          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-around',
              height: '200px',
              gap: '16px',
            }}
          >
            {last7DaysXP.map((dayData, idx) => {
              const heightPercentage = maxXPInWeek > 0 ? (dayData.xp / maxXPInWeek) * 100 : 0;

              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    flex: 1,
                    gap: '12px',
                  }}
                >
                  <div
                    style={{
                      width: '100%',
                      height: `${heightPercentage}%`,
                      minHeight: '8px',
                      borderRadius: 'var(--radius)',
                      background: dayData.isToday
                        ? 'var(--accent)'
                        : 'var(--accent)',
                      opacity: dayData.isToday ? '1' : '0.5',
                      transition: 'all 0.3s',
                      cursor: 'default',
                    }}
                    title={`${dayData.xp} XP`}
                  />
                  <div
                    style={{
                      fontSize: '12px',
                      color: dayData.isToday
                        ? 'var(--accent)'
                        : 'var(--text-secondary)',
                      fontWeight: dayData.isToday ? '700' : '500',
                    }}
                  >
                    {dayData.day}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* BADGES SECTION */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '28px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
            }}
          >
            <h2
              style={{
                fontSize: '18px',
                fontWeight: '700',
                color: 'var(--text-primary)',
              }}
            >
              Distintivi
            </h2>
            <span
              style={{
                fontSize: '14px',
                color: 'var(--text-secondary)',
                fontWeight: '600',
              }}
            >
              {badges.filter((b) => b.unlocked).length} di {badges.length} sbloccati
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
              gap: '16px',
            }}
          >
            {badges.map((badge, idx) => (
              <div
                key={idx}
                style={{
                  position: 'relative',
                  background: 'var(--bg)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  padding: '20px',
                  textAlign: 'center',
                  opacity: badge.unlocked ? '1' : '0.6',
                  filter: badge.unlocked ? 'grayscale(0%)' : 'grayscale(100%)',
                  transition: 'all 0.3s',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = badge.unlocked
                    ? 'translateY(-4px)'
                    : 'none';
                  e.currentTarget.style.boxShadow = badge.unlocked
                    ? '0 12px 24px rgba(59, 130, 246, 0.15)'
                    : 'none';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {!badge.unlocked && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: '0',
                      borderRadius: 'var(--radius)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '32px',
                      zIndex: '2',
                    }}
                  >
                    🔒
                  </div>
                )}

                <div
                  style={{
                    fontSize: '48px',
                    marginBottom: '12px',
                    filter: !badge.unlocked ? 'brightness(0.5)' : 'none',
                  }}
                >
                  {badge.icon}
                </div>

                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: '700',
                    color: 'var(--text-primary)',
                    marginBottom: '6px',
                  }}
                >
                  {badge.name}
                </div>

                <div
                  style={{
                    fontSize: '12px',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.4',
                  }}
                >
                  {badge.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

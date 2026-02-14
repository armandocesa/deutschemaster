import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export default function WerdenPage({ onNavigate }) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedExercise, setExpandedExercise] = useState(null);
  const [exerciseAnswers, setExerciseAnswers] = useState({});
  const [selectedExample, setSelectedExample] = useState(null);

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => { window.speechSynthesis.cancel(); };
  }, []);

  // Speech synthesis function
  const speakGerman = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'de-DE';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  // Toggle exercise answer visibility
  const toggleExerciseAnswer = (exerciseId) => {
    setExpandedExercise(expandedExercise === exerciseId ? null : exerciseId);
  };

  // Color scheme for different use cases
  const colors = {
    werden: { bg: '#1a4d2e', border: '#52b788', text: '#d8f3dc' },
    futur: { bg: '#003d5c', border: '#0096c7', text: '#caf0f8' },
    passiv: { bg: '#5a3a1a', border: '#f4a261', text: '#ffe8c6' },
    konjunktiv: { bg: '#3a2a5a', border: '#c77dff', text: '#e6d5ff' },
  };

  // Component for conjugation table
  const ConjugationTable = ({ tense, pronouns, conjugations, color }) => (
    <div className="mt-4 mb-6">
      <h4 className="text-lg font-semibold mb-3" style={{ color: colors[color].text }}>
        {tense}
      </h4>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <tbody>
            {pronouns.map((pronoun, idx) => (
              <tr key={pronoun} style={{ backgroundColor: idx % 2 === 0 ? 'var(--bg-card-hover)' : 'var(--bg-card)' }}>
                <td className="p-3 font-semibold text-gray-300 border-b border-gray-600 w-24">
                  {pronoun}
                </td>
                <td className="p-3 text-right border-b border-gray-600">
                  <span
                    className="font-mono font-semibold cursor-pointer hover:opacity-80 transition"
                    style={{ color: colors[color].text }}
                    onClick={() => speakGerman(conjugations[idx])}
                    title={t('werden.clickToHear')}
                  >
                    {conjugations[idx]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Component for examples
  const ExampleBox = ({ german, translation, color, audio = true }) => (
    <div
      className="p-4 rounded-lg my-3 border-l-4"
      style={{
        backgroundColor: colors[color].bg,
        borderColor: colors[color].border,
      }}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <p className="text-sm text-gray-300 mb-1">{t('werden.deutsch')}</p>
          <p
            className="font-medium mb-2 cursor-pointer hover:opacity-80 flex items-center gap-2"
            style={{ color: colors[color].text }}
          >
            {german}
            {audio && (
              <button
                onClick={() => speakGerman(german)}
                className="text-xs px-2 py-1 rounded hover:opacity-70"
                style={{ backgroundColor: colors[color].border, color: 'var(--bg-primary)' }}
              >
                🔊
              </button>
            )}
          </p>
          <p className="text-sm text-gray-400">{t('werden.translationLabel')} {translation}</p>
        </div>
      </div>
    </div>
  );

  // Component for exercise
  const ExerciseBox = ({ id, title, question, answer, hint, color }) => (
    <div
      className="p-4 rounded-lg my-3 border-l-4"
      style={{
        backgroundColor: colors[color].bg,
        borderColor: colors[color].border,
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="font-semibold mb-2" style={{ color: colors[color].text }}>
            {title}
          </p>
          <p className="text-sm text-gray-300 mb-3">{question}</p>
          {hint && <p className="text-xs text-gray-400 italic mb-2">{t('werden.hint')} {hint}</p>}
          <button
            onClick={() => toggleExerciseAnswer(id)}
            className="text-sm px-3 py-1 rounded transition"
            style={{
              backgroundColor: colors[color].border,
              color: 'var(--bg-primary)',
              fontWeight: 'bold',
            }}
          >
            {expandedExercise === id ? `✓ ${t('werden.hideAnswer')}` : t('werden.showAnswer')}
          </button>
          {expandedExercise === id && (
            <div className="mt-3 p-2 rounded" style={{ backgroundColor: 'var(--bg-card-hover)' }}>
              <p className="text-sm font-mono mb-1">
                <span className="text-yellow-300">{t('werden.answer')}</span> {answer}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Section 1: Overview/Cheat Sheet
  const OverviewSection = () => (
    <div>
      <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-bold text-blue-100 mb-4">
          {t('werden.title')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-black bg-opacity-40 p-4 rounded">
            <p className="font-semibold text-blue-300 mb-2">{t('werden.mainUses')}</p>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>✓ {t('werden.overview_use1')}</li>
              <li>✓ {t('werden.overview_use2')}</li>
              <li>✓ {t('werden.overview_use3')}</li>
              <li>✓ {t('werden.overview_use4')}</li>
              <li>✓ {t('werden.overview_use5')}</li>
              <li>✓ {t('werden.overview_use6')}</li>
            </ul>
          </div>
          <div className="bg-black bg-opacity-40 p-4 rounded">
            <p className="font-semibold text-blue-300 mb-2">{t('werden.irregularForms')}</p>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>{t('werden.overview_present')} ich <span className="text-yellow-300 font-mono">werde</span></li>
              <li>{t('werden.overview_prateritum')} ich <span className="text-yellow-300 font-mono">wurde</span></li>
              <li>Partizip II: <span className="text-yellow-300 font-mono">geworden</span> {t('werden.overview_partizipMain')}</li>
              <li>Partizip II: <span className="text-yellow-300 font-mono">worden</span> {t('werden.overview_partizipPassive')}</li>
              <li>Konjunktiv II: <span className="text-yellow-300 font-mono">würde</span></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-blue-200 mb-4">{t('werden.crucialDifferences')}</h3>
        <div className="space-y-3 text-sm">
          <div>
            <p className="font-semibold text-yellow-300">{t('werden.overview_gewordenVsWorden')}</p>
            <p className="text-gray-300">
              <span className="text-green-400">geworden</span> {t('werden.overview_gewordenDesc')}
            </p>
            <p className="text-gray-300">
              <span className="text-orange-400">worden</span> {t('werden.overview_wordenDesc')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // Section 2: Werden as main verb
  const WerdenVerbSection = () => (
    <div>
      <h2 className="text-2xl font-bold text-gray-100 mb-6">
        {t('werden.main_title')}
      </h2>

      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold mb-3" style={{ color: colors.werden.text }}>
          {t('werden.description')}
        </h3>
        <p className="text-gray-300 text-sm leading-relaxed">
          {t('werden.main_desc')}
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <ConjugationTable
            tense={t('werden.main_prasens')}
            pronouns={['ich', 'du', 'er/sie/es', 'wir', 'ihr', 'sie/Sie']}
            conjugations={['werde', 'wirst', 'wird', 'werden', 'werdet', 'werden']}
            color="werden"
          />
          <ExampleBox german="Ich werde müde." translation={t('werden.main_ex1')} color="werden" />
          <ExampleBox german="Du wirst älter." translation={t('werden.main_ex2')} color="werden" />
          <ExampleBox german="Das Wetter wird schön." translation={t('werden.main_ex3')} color="werden" />
        </div>

        <div>
          <ConjugationTable
            tense={t('werden.main_prateritum')}
            pronouns={['ich', 'du', 'er/sie/es', 'wir', 'ihr', 'sie/Sie']}
            conjugations={['wurde', 'wurdest', 'wurde', 'wurden', 'wurdet', 'wurden']}
            color="werden"
          />
          <ExampleBox german="Ich wurde krank." translation={t('werden.main_ex4')} color="werden" />
          <ExampleBox german="Es wurde dunkel." translation={t('werden.main_ex5')} color="werden" />
          <ExampleBox german="Sie wurden sehr glücklich." translation={t('werden.main_ex6')} color="werden" />
        </div>

        <div>
          <ConjugationTable
            tense={t('werden.main_perfekt')}
            pronouns={['ich', 'du', 'er/sie/es', 'wir', 'ihr', 'sie/Sie']}
            conjugations={['bin geworden', 'bist geworden', 'ist geworden', 'sind geworden', 'seid geworden', 'sind geworden']}
            color="werden"
          />
          <ExampleBox german="Ich bin älter geworden." translation={t('werden.main_ex7')} color="werden" />
          <ExampleBox german="Sie ist Ärztin geworden." translation={t('werden.main_ex8')} color="werden" />
        </div>

        <div>
          <ConjugationTable
            tense={t('werden.main_plusquam')}
            pronouns={['ich', 'du', 'er/sie/es', 'wir', 'ihr', 'sie/Sie']}
            conjugations={['war geworden', 'warst geworden', 'war geworden', 'waren geworden', 'wart geworden', 'waren geworden']}
            color="werden"
          />
          <ExampleBox german="Ich war müde geworden." translation={t('werden.main_ex9')} color="werden" />
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-700">
        <h3 className="text-xl font-semibold text-gray-100 mb-4">{t('werden.exercises')}</h3>
        <ExerciseBox id="werden_ex1" title={`${t('werden.exercise')} 1`} question={t('werden.main_exercise1_q')} answer="Du wirst 18 Jahre alt." hint={t('werden.main_exercise1_hint')} color="werden" />
        <ExerciseBox id="werden_ex2" title={`${t('werden.exercise')} 2`} question={t('werden.main_exercise2_q')} answer="Das Licht wird immer schwächer." hint={t('werden.main_exercise2_hint')} color="werden" />
        <ExerciseBox id="werden_ex3" title={`${t('werden.exercise')} 3`} question={t('werden.main_exercise3_q')} answer="Ich wurde krank und musste zum Arzt gehen." hint={t('werden.main_exercise3_hint')} color="werden" />
      </div>
    </div>
  );

  // Section 3: Futur I
  const FuturISection = () => (
    <div>
      <h2 className="text-2xl font-bold text-gray-100 mb-6">{t('werden.futurI_title')}</h2>

      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold mb-3" style={{ color: colors.futur.text }}>
          {t('werden.formation')}
        </h3>
        <div className="space-y-2 text-sm text-gray-300">
          <p>
            <span className="font-semibold text-blue-300">{t('werden.formation')}:</span> {t('werden.futurI_formation')}
          </p>
          <p>
            <span className="font-semibold text-blue-300">{t('werden.futurI_uses')}</span>
          </p>
          <ul className="list-disc list-inside ml-2">
            <li>{t('werden.futurI_use1')}</li>
            <li>{t('werden.futurI_use2')}</li>
            <li>{t('werden.futurI_use3')}</li>
          </ul>
        </div>
      </div>

      <div>
        <ConjugationTable
          tense={t('werden.futurI_complete')}
          pronouns={['ich', 'du', 'er/sie/es', 'wir', 'ihr', 'sie/Sie']}
          conjugations={['werde lernen', 'wirst lernen', 'wird lernen', 'werden lernen', 'werdet lernen', 'werden lernen']}
          color="futur"
        />

        <h4 className="text-lg font-semibold mt-6 mb-4" style={{ color: colors.futur.text }}>
          {t('werden.futurI_planned')}
        </h4>
        <ExampleBox german="Morgen werde ich ins Kino gehen." translation={t('werden.futurI_ex1')} color="futur" />
        <ExampleBox german="Nächste Woche werden wir nach Rom fahren." translation={t('werden.futurI_ex2')} color="futur" />
        <ExampleBox german="Er wird um 10 Uhr ankommen." translation={t('werden.futurI_ex3')} color="futur" />

        <h4 className="text-lg font-semibold mt-6 mb-4" style={{ color: colors.futur.text }}>
          {t('werden.futurI_promises')}
        </h4>
        <ExampleBox german="Ich werde dir helfen!" translation={t('werden.futurI_ex4')} color="futur" />
        <ExampleBox german="Es wird regnen." translation={t('werden.futurI_ex5')} color="futur" />

        <h4 className="text-lg font-semibold mt-6 mb-4" style={{ color: colors.futur.text }}>
          {t('werden.futurI_assumptions')}
        </h4>
        <ExampleBox german="Er wird wohl zu Hause sein. (Das stimmt wahrscheinlich)" translation={t('werden.futurI_ex6')} color="futur" />
        <ExampleBox german="Du wirst schon recht haben. (Suppongo che tu abbia ragione)" translation={t('werden.futurI_ex7')} color="futur" />
      </div>

      <div className="mt-8 pt-6 border-t border-gray-700">
        <h3 className="text-xl font-semibold text-gray-100 mb-4">{t('werden.exercises')}</h3>
        <ExerciseBox id="futuri_ex1" title={`${t('werden.exercise')} 1`} question={t('werden.futurI_exercise1_q')} answer="Ich werde ein Buch lesen." hint={t('werden.futurI_exercise1_hint')} color="futur" />
        <ExerciseBox id="futuri_ex2" title={`${t('werden.exercise')} 2`} question={t('werden.futurI_exercise2_q')} answer="Sie werden nach Berlin gehen." hint={t('werden.futurI_exercise2_hint')} color="futur" />
        <ExerciseBox id="futuri_ex3" title={`${t('werden.exercise')} 3`} question={t('werden.futurI_exercise3_q')} answer="Der Chef wird schon im Büro sein." hint={t('werden.futurI_exercise3_hint')} color="futur" />
      </div>
    </div>
  );

  // Section 4: Futur II
  const FuturIISection = () => (
    <div>
      <h2 className="text-2xl font-bold text-gray-100 mb-6">{t('werden.futurII_title')}</h2>

      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold mb-3" style={{ color: colors.futur.text }}>
          {t('werden.formation')}
        </h3>
        <div className="space-y-2 text-sm text-gray-300">
          <p>
            <span className="font-semibold text-blue-300">{t('werden.formation')}:</span> {t('werden.futurII_formation')}
          </p>
          <p>
            <span className="font-semibold text-blue-300">{t('werden.futurI_uses')}</span>
          </p>
          <ul className="list-disc list-inside ml-2">
            <li>{t('werden.futurII_use1')}</li>
            <li>{t('werden.futurII_use2')}</li>
            <li>{t('werden.futurII_use3')}</li>
          </ul>
        </div>
      </div>

      <div>
        <h4 className="text-lg font-semibold mt-6 mb-4" style={{ color: colors.futur.text }}>
          {t('werden.futurII_transitive')}
        </h4>
        <ConjugationTable
          tense="Futur II - Beispiel: lernen"
          pronouns={['ich', 'du', 'er/sie/es', 'wir', 'ihr', 'sie/Sie']}
          conjugations={['werde gelernt haben', 'wirst gelernt haben', 'wird gelernt haben', 'werden gelernt haben', 'werdet gelernt haben', 'werden gelernt haben']}
          color="futur"
        />
        <ExampleBox german="Bis morgen werde ich das Buch gelesen haben." translation={t('werden.futurII_ex1')} color="futur" />
        <ExampleBox german="Sie werden die Arbeit bis Freitag beendet haben." translation={t('werden.futurII_ex2')} color="futur" />

        <h4 className="text-lg font-semibold mt-6 mb-4" style={{ color: colors.futur.text }}>
          {t('werden.futurII_movement')}
        </h4>
        <ConjugationTable
          tense="Futur II - Beispiel: gehen"
          pronouns={['ich', 'du', 'er/sie/es', 'wir', 'ihr', 'sie/Sie']}
          conjugations={['werde gegangen sein', 'wirst gegangen sein', 'wird gegangen sein', 'werden gegangen sein', 'werdet gegangen sein', 'werden gegangen sein']}
          color="futur"
        />
        <ExampleBox german="Er wird schon nach Hause gegangen sein." translation={t('werden.futurII_ex3')} color="futur" />
        <ExampleBox german="Um 18 Uhr werde ich angekommen sein." translation={t('werden.futurII_ex4')} color="futur" />

        <h4 className="text-lg font-semibold mt-6 mb-4" style={{ color: colors.futur.text }}>
          {t('werden.futurII_pastAssumptions')}
        </h4>
        <ExampleBox german="Du wirst das Geld schon bekommen haben." translation={t('werden.futurII_ex5')} color="futur" />
        <ExampleBox german="Sie wird den Film schon gesehen haben." translation={t('werden.futurII_ex6')} color="futur" />
      </div>

      <div className="mt-8 pt-6 border-t border-gray-700">
        <h3 className="text-xl font-semibold text-gray-100 mb-4">{t('werden.exercises')}</h3>
        <ExerciseBox id="futurii_ex1" title={`${t('werden.exercise')} 1`} question={t('werden.futurII_exercise1_q')} answer="Ich werde die E-Mail geschrieben haben." hint={t('werden.futurII_exercise1_hint')} color="futur" />
        <ExerciseBox id="futurii_ex2" title={`${t('werden.exercise')} 2`} question={t('werden.futurII_exercise2_q')} answer="Er wird das Projekt schon vollendet haben." hint={t('werden.futurII_exercise2_hint')} color="futur" />
        <ExerciseBox id="futurii_ex3" title={`${t('werden.exercise')} 3`} question={t('werden.futurII_exercise3_q')} answer="Bis zum Wochenende werden wir nach München gegangen sein." hint={t('werden.futurII_exercise3_hint')} color="futur" />
      </div>
    </div>
  );

  // Section 5: Passiv
  const PassivSection = () => (
    <div>
      <h2 className="text-2xl font-bold text-gray-100 mb-6">{t('werden.passiv_title')}</h2>

      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold mb-3" style={{ color: colors.passiv.text }}>
          {t('werden.passiv_withWerden')}
        </h3>
        <div className="space-y-2 text-sm text-gray-300">
          <p>{t('werden.passiv_desc')}</p>
          <p className="font-semibold text-orange-400 mt-3">{t('werden.passiv_warning')}</p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="text-lg font-semibold mt-6 mb-4" style={{ color: colors.passiv.text }}>
            {t('werden.passiv_prasens')}
          </h4>
          <ConjugationTable
            tense="Präsens Passiv - Beispiel: schreiben"
            pronouns={['ich', 'du', 'er/sie/es', 'wir', 'ihr', 'sie/Sie']}
            conjugations={['werde geschrieben', 'wirst geschrieben', 'wird geschrieben', 'werden geschrieben', 'werdet geschrieben', 'werden geschrieben']}
            color="passiv"
          />
          <ExampleBox german="Das Buch wird gelesen." translation={t('werden.passiv_ex1')} color="passiv" />
          <ExampleBox german="Der Brief wird geschrieben." translation={t('werden.passiv_ex2')} color="passiv" />
          <ExampleBox german="Der Kuchen wird gebacken." translation={t('werden.passiv_ex3')} color="passiv" />
        </div>

        <div>
          <h4 className="text-lg font-semibold mt-6 mb-4" style={{ color: colors.passiv.text }}>
            {t('werden.passiv_prateritum')}
          </h4>
          <ConjugationTable
            tense="Präteritum Passiv"
            pronouns={['ich', 'du', 'er/sie/es', 'wir', 'ihr', 'sie/Sie']}
            conjugations={['wurde geschrieben', 'wurdest geschrieben', 'wurde geschrieben', 'wurden geschrieben', 'wurdet geschrieben', 'wurden geschrieben']}
            color="passiv"
          />
          <ExampleBox german="Das Haus wurde gebaut." translation={t('werden.passiv_ex4')} color="passiv" />
          <ExampleBox german="Das Projekt wurde geplant." translation={t('werden.passiv_ex5')} color="passiv" />
        </div>

        <div>
          <h4 className="text-lg font-semibold mt-6 mb-4" style={{ color: colors.passiv.text }}>
            {t('werden.passiv_perfekt')}
          </h4>
          <ConjugationTable
            tense="Perfekt Passiv"
            pronouns={['ich', 'du', 'er/sie/es', 'wir', 'ihr', 'sie/Sie']}
            conjugations={['bin gelesen worden', 'bist gelesen worden', 'ist gelesen worden', 'sind gelesen worden', 'seid gelesen worden', 'sind gelesen worden']}
            color="passiv"
          />
          <ExampleBox german="Das Buch ist gelesen worden." translation={t('werden.passiv_ex6')} color="passiv" />
          <ExampleBox german="Wir sind eingeladen worden." translation={t('werden.passiv_ex7')} color="passiv" />
        </div>

        <div>
          <h4 className="text-lg font-semibold mt-6 mb-4" style={{ color: colors.passiv.text }}>
            {t('werden.passiv_plusquam')}
          </h4>
          <ConjugationTable
            tense="Plusquamperfekt Passiv"
            pronouns={['ich', 'du', 'er/sie/es', 'wir', 'ihr', 'sie/Sie']}
            conjugations={['war gelesen worden', 'warst gelesen worden', 'war gelesen worden', 'waren gelesen worden', 'wart gelesen worden', 'waren gelesen worden']}
            color="passiv"
          />
          <ExampleBox german="Das Haus war gebaut worden." translation={t('werden.passiv_ex8')} color="passiv" />
        </div>

        <div>
          <h4 className="text-lg font-semibold mt-6 mb-4" style={{ color: colors.passiv.text }}>
            {t('werden.passiv_futurI')}
          </h4>
          <ConjugationTable
            tense="Futur I Passiv"
            pronouns={['ich', 'du', 'er/sie/es', 'wir', 'ihr', 'sie/Sie']}
            conjugations={['werde geschrieben', 'wirst geschrieben', 'wird geschrieben', 'werden geschrieben', 'werdet geschrieben', 'werden geschrieben']}
            color="passiv"
          />
          <ExampleBox german="Das Buch wird gelesen werden." translation={t('werden.passiv_ex9')} color="passiv" />
        </div>

        <div>
          <h4 className="text-lg font-semibold mt-6 mb-4" style={{ color: colors.passiv.text }}>
            {t('werden.passiv_agent')}
          </h4>
          <ExampleBox german="Das Buch wird von Maria gelesen." translation={t('werden.passiv_ex10')} color="passiv" />
          <ExampleBox german="Der Schüler wurde vom Lehrer korrigiert." translation={t('werden.passiv_ex11')} color="passiv" />
          <ExampleBox german="Das Fenster wurde durch den Stein zerbrochen." translation={t('werden.passiv_ex12')} color="passiv" />
          <ExampleBox german="Die Arbeit wird durch die neue Technologie vereinfacht." translation={t('werden.passiv_ex13')} color="passiv" />
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-700">
        <h3 className="text-xl font-semibold text-gray-100 mb-4">{t('werden.exercises')}</h3>
        <ExerciseBox id="passiv_ex1" title={`${t('werden.exercise')} 1`} question={t('werden.passiv_exercise1_q')} answer="Das Haus wird vom Maler gemalt." hint={t('werden.passiv_exercise1_hint')} color="passiv" />
        <ExerciseBox id="passiv_ex2" title={`${t('werden.exercise')} 2`} question={t('werden.passiv_exercise2_q')} answer="Das Spiel wurde am Samstag gespielt." hint={t('werden.passiv_exercise2_hint')} color="passiv" />
        <ExerciseBox id="passiv_ex3" title={`${t('werden.exercise')} 3`} question={t('werden.passiv_exercise3_q')} answer="Der Koffer ist gepackt worden." hint={t('werden.passiv_exercise3_hint')} color="passiv" />
        <ExerciseBox id="passiv_ex4" title={`${t('werden.exercise')} 4`} question={t('werden.passiv_exercise4_q')} answer="Die Stadt wurde durch das Erdbeben zerstört." hint={t('werden.passiv_exercise4_hint')} color="passiv" />
      </div>
    </div>
  );

  // Section 6: Konjunktiv II with würde
  const KonjunktivSection = () => (
    <div>
      <h2 className="text-2xl font-bold text-gray-100 mb-6">{t('werden.konj_title')}</h2>

      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold mb-3" style={{ color: colors.konjunktiv.text }}>
          {t('werden.konj_conditional')}
        </h3>
        <div className="space-y-2 text-sm text-gray-300">
          <p>{t('werden.konj_desc')}</p>
          <p className="font-semibold text-purple-400 mt-3">{t('werden.konj_formation')}</p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="text-lg font-semibold mt-6 mb-4" style={{ color: colors.konjunktiv.text }}>
            {t('werden.konj_conjugation')}
          </h4>
          <ConjugationTable
            tense={t('werden.konj_wurdeInfinitive')}
            pronouns={['ich', 'du', 'er/sie/es', 'wir', 'ihr', 'sie/Sie']}
            conjugations={['würde machen', 'würdest machen', 'würde machen', 'würden machen', 'würdet machen', 'würden machen']}
            color="konjunktiv"
          />

          <h4 className="text-lg font-semibold mt-6 mb-4" style={{ color: colors.konjunktiv.text }}>
            {t('werden.konj_polite')}
          </h4>
          <ExampleBox german="Würdest du mir helfen?" translation={t('werden.konj_ex1')} color="konjunktiv" />
          <ExampleBox german="Ich würde einen Kaffee trinken." translation={t('werden.konj_ex2')} color="konjunktiv" />
          <ExampleBox german="Das würde mir sehr gefallen." translation={t('werden.konj_ex3')} color="konjunktiv" />

          <h4 className="text-lg font-semibold mt-6 mb-4" style={{ color: colors.konjunktiv.text }}>
            {t('werden.konj_unreal')}
          </h4>
          <ExampleBox german="Wenn ich mehr Geld hätte, würde ich eine Reise machen." translation={t('werden.konj_ex4')} color="konjunktiv" />
          <ExampleBox german="Wenn du früher aufstehen würdest, würdest du nicht zu spät kommen." translation={t('werden.konj_ex5')} color="konjunktiv" />
          <ExampleBox german="Was würdest du an meiner Stelle tun?" translation={t('werden.konj_ex6')} color="konjunktiv" />

          <h4 className="text-lg font-semibold mt-6 mb-4" style={{ color: colors.konjunktiv.text }}>
            {t('werden.konj_wishes')}
          </h4>
          <ExampleBox german="Ich würde lieber ins Kino gehen." translation={t('werden.konj_ex7')} color="konjunktiv" />
          <ExampleBox german="Sie würden gerne in Italien leben." translation={t('werden.konj_ex8')} color="konjunktiv" />

          <h4 className="text-lg font-semibold mt-6 mb-4" style={{ color: colors.konjunktiv.text }}>
            {t('werden.konj_difference')}
          </h4>
          <div className="bg-gray-700 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-300 mb-2">{t('werden.konj_directForms')}</p>
            <ul className="text-sm text-gray-300 space-y-1">
              <li><span className="text-purple-300 font-mono">gehen</span> → <span className="text-purple-300 font-mono">ginge</span> {t('werden.konj_directGehen')}</li>
              <li><span className="text-purple-300 font-mono">kommen</span> → <span className="text-purple-300 font-mono">käme</span> {t('werden.konj_directKommen')}</li>
              <li><span className="text-purple-300 font-mono">haben</span> → <span className="text-purple-300 font-mono">hätte</span> {t('werden.konj_directHaben')}</li>
              <li><span className="text-purple-300 font-mono">sein</span> → <span className="text-purple-300 font-mono">wäre</span> {t('werden.konj_directSein')}</li>
            </ul>
            <p className="text-sm text-gray-300 mt-3">{t('werden.konj_modernNote')}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-700">
        <h3 className="text-xl font-semibold text-gray-100 mb-4">{t('werden.exercises')}</h3>
        <ExerciseBox id="konj_ex1" title={`${t('werden.exercise')} 1`} question={t('werden.konj_exercise1_q')} answer="Würden Sie mir helfen?" hint={t('werden.konj_exercise1_hint')} color="konjunktiv" />
        <ExerciseBox id="konj_ex2" title={`${t('werden.exercise')} 2`} question={t('werden.konj_exercise2_q')} answer="würde ich einen Film schauen" hint={t('werden.konj_exercise2_hint')} color="konjunktiv" />
        <ExerciseBox id="konj_ex3" title={`${t('werden.exercise')} 3`} question={t('werden.konj_exercise3_q')} answer="würde mir nicht gefallen" hint={t('werden.konj_exercise3_hint')} color="konjunktiv" />
      </div>
    </div>
  );

  // Section 7: Fixed expressions
  const FixedExpressionsSection = () => (
    <div>
      <h2 className="text-2xl font-bold text-gray-100 mb-6">{t('werden.expr_title')}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { german: 'Es wird Zeit', meaning: t('werden.expr1_meaning'), example: t('werden.expr1_example') },
          { german: 'Mir wird schlecht', meaning: t('werden.expr2_meaning'), example: t('werden.expr2_example') },
          { german: 'Krank/alt/groß werden', meaning: t('werden.expr3_meaning'), example: t('werden.expr3_example') },
          { german: 'Bekannt/berühmt werden', meaning: t('werden.expr4_meaning'), example: t('werden.expr4_example') },
          { german: 'Verrückt werden', meaning: t('werden.expr5_meaning'), example: t('werden.expr5_example') },
          { german: 'Was ist aus ihm geworden?', meaning: t('werden.expr6_meaning'), example: t('werden.expr6_example') },
          { german: 'Zu viel für jemanden werden', meaning: t('werden.expr7_meaning'), example: t('werden.expr7_example') },
          { german: 'Es wird dunkel/hell', meaning: t('werden.expr8_meaning'), example: t('werden.expr8_example') },
        ].map((expr, idx) => (
          <div
            key={idx}
            className="p-4 rounded-lg"
            style={{
              backgroundColor: colors.werden.bg,
              borderLeft: `4px solid ${colors.werden.border}`,
            }}
          >
            <p className="font-semibold mb-2" style={{ color: colors.werden.text }}>
              {expr.german}
            </p>
            <p className="text-sm text-gray-300">{expr.meaning}</p>
            <p className="text-sm text-gray-400 mt-2">{expr.example}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-gray-700">
        <h3 className="text-xl font-semibold text-gray-100 mb-4">{t('werden.exercises')}</h3>
        <ExerciseBox id="fixed_ex1" title={`${t('werden.exercise')} 1`} question={t('werden.expr_exercise1_q')} answer="Es wird Zeit zu gehen. / Es wird Zeit, zu gehen." hint={t('werden.expr_exercise1_hint')} color="werden" />
        <ExerciseBox id="fixed_ex2" title={`${t('werden.exercise')} 2`} question={t('werden.expr_exercise2_q')} answer="Mir wird schwindlig." hint={t('werden.expr_exercise2_hint')} color="werden" />
        <ExerciseBox id="fixed_ex3" title={`${t('werden.exercise')} 3`} question={t('werden.expr_exercise3_q')} answer="Was ist aus deiner Schwester geworden?" hint={t('werden.expr_exercise3_hint')} color="werden" />
      </div>
    </div>
  );

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        minHeight: '100vh',
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: 'var(--bg-card)',
          borderBottom: '1px solid var(--border-hover)',
          padding: '20px',
        }}
      >
        <button
          onClick={() => onNavigate('home')}
          className="text-blue-400 hover:text-blue-300 text-sm mb-4 transition"
        >
          ← {t('werden.back')}
        </button>
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
          {t('werden.title')}
        </h1>
        <p className="text-gray-400 mt-2">{t('werden.all')}</p>
      </div>

      {/* Tab Navigation */}
      <div
        className="sticky top-0 z-10 flex overflow-x-auto gap-0 border-b"
        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--text-tertiary)' }}
      >
        {[
          { id: 'overview', label: t('werden.overview') },
          { id: 'werden', label: t('werden.mainVerb') },
          { id: 'futuri', label: t('werden.futurI') },
          { id: 'futurii', label: t('werden.futurII') },
          { id: 'passiv', label: t('werden.passive') },
          { id: 'konjunktiv', label: t('werden.konjunktiv') },
          { id: 'expressions', label: t('werden.fixedExpressions') },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="px-4 py-3 text-sm font-medium transition border-b-2 whitespace-nowrap hover:opacity-80"
            style={{
              borderColor: activeTab === tab.id ? '#0096c7' : 'transparent',
              color: activeTab === tab.id ? '#0096c7' : 'var(--text-secondary)',
              backgroundColor: activeTab === tab.id ? 'rgba(0, 150, 199, 0.1)' : 'transparent',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: '30px', maxWidth: '1200px', margin: '0 auto' }}>
        {activeTab === 'overview' && <OverviewSection />}
        {activeTab === 'werden' && <WerdenVerbSection />}
        {activeTab === 'futuri' && <FuturISection />}
        {activeTab === 'futurii' && <FuturIISection />}
        {activeTab === 'passiv' && <PassivSection />}
        {activeTab === 'konjunktiv' && <KonjunktivSection />}
        {activeTab === 'expressions' && <FixedExpressionsSection />}
      </div>

      {/* Footer */}
      <div
        style={{
          backgroundColor: 'var(--bg-card)',
          borderTop: '1px solid var(--border-hover)',
          padding: '20px',
          textAlign: 'center',
          marginTop: '40px',
        }}
      >
        <p className="text-sm text-gray-400">{t('werden.footer1')}</p>
        <p className="text-xs text-gray-500 mt-2">{t('werden.footer2')}</p>
      </div>
    </div>
  );
}

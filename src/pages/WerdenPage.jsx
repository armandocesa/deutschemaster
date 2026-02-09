import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export default function WerdenPage({ onNavigate }) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedExercise, setExpandedExercise] = useState(null);
  const [exerciseAnswers, setExerciseAnswers] = useState({});
  const [selectedExample, setSelectedExample] = useState(null);

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
              <tr key={pronoun} style={{ backgroundColor: idx % 2 === 0 ? '#2a2a35' : '#22222d' }}>
                <td className="p-3 font-semibold text-gray-300 border-b border-gray-600 w-24">
                  {pronoun}
                </td>
                <td className="p-3 text-right border-b border-gray-600">
                  <span
                    className="font-mono font-semibold cursor-pointer hover:opacity-80 transition"
                    style={{ color: colors[color].text }}
                    onClick={() => speakGerman(conjugations[idx])}
                    title="Click to hear pronunciation"
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
  const ExampleBox = ({ german, italian, color, audio = true }) => (
    <div
      className="p-4 rounded-lg my-3 border-l-4"
      style={{
        backgroundColor: colors[color].bg,
        borderColor: colors[color].border,
      }}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <p className="text-sm text-gray-300 mb-1">Deutsch:</p>
          <p
            className="font-medium mb-2 cursor-pointer hover:opacity-80 flex items-center gap-2"
            style={{ color: colors[color].text }}
          >
            {german}
            {audio && (
              <button
                onClick={() => speakGerman(german)}
                className="text-xs px-2 py-1 rounded hover:opacity-70"
                style={{ backgroundColor: colors[color].border, color: '#0f0f14' }}
              >
                🔊
              </button>
            )}
          </p>
          <p className="text-sm text-gray-400">Italiano: {italian}</p>
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
          {hint && <p className="text-xs text-gray-400 italic mb-2">Suggerimento: {hint}</p>}
          <button
            onClick={() => toggleExerciseAnswer(id)}
            className="text-sm px-3 py-1 rounded transition"
            style={{
              backgroundColor: colors[color].border,
              color: '#0f0f14',
              fontWeight: 'bold',
            }}
          >
            {expandedExercise === id ? '✓ Nascondi risposta' : 'Mostra risposta'}
          </button>
          {expandedExercise === id && (
            <div className="mt-3 p-2 rounded" style={{ backgroundColor: '#2a2a35' }}>
              <p className="text-sm font-mono mb-1">
                <span className="text-yellow-300">Risposta:</span> {answer}
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
          Guida Completa al Verbo "Werden"
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-black bg-opacity-40 p-4 rounded">
            <p className="font-semibold text-blue-300 mb-2">6 Usi Principali:</p>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>✓ Verbo principale (diventare)</li>
              <li>✓ Futur I (futuro semplice)</li>
              <li>✓ Futur II (futuro anteriore)</li>
              <li>✓ Passivo (vieni fatto)</li>
              <li>✓ Konjunktiv II con würde</li>
              <li>✓ Espressioni fisse</li>
            </ul>
          </div>
          <div className="bg-black bg-opacity-40 p-4 rounded">
            <p className="font-semibold text-blue-300 mb-2">Forme Irregolari:</p>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>Presente: ich <span className="text-yellow-300 font-mono">werde</span></li>
              <li>Präteritum: ich <span className="text-yellow-300 font-mono">wurde</span></li>
              <li>Partizip II: <span className="text-yellow-300 font-mono">geworden</span> (principale)</li>
              <li>Partizip II: <span className="text-yellow-300 font-mono">worden</span> (passivo)</li>
              <li>Konjunktiv II: <span className="text-yellow-300 font-mono">würde</span></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-blue-200 mb-4">Differenze Cruciali</h3>
        <div className="space-y-3 text-sm">
          <div>
            <p className="font-semibold text-yellow-300">Geworden vs. Worden</p>
            <p className="text-gray-300">
              <span className="text-green-400">geworden</span> = Partizip II del verbo principale (Ich bin
              alt geworden - Sono diventato vecchio)
            </p>
            <p className="text-gray-300">
              <span className="text-orange-400">worden</span> = Partizip II nel passivo (Das Haus wurde gebaut worden
              - La casa è stata costruita)
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
        Werden come Verbo Principale (Diventare)
      </h2>

      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold mb-3" style={{ color: colors.werden.text }}>
          Descrizione
        </h3>
        <p className="text-gray-300 text-sm leading-relaxed">
          Quando "werden" è usato come verbo principale, significa "diventare" e descrive un cambiamento di stato.
          È un verbo irregolare che cambia completamente al präteritum.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <ConjugationTable
            tense="Präsens (Presente)"
            pronouns={['ich', 'du', 'er/sie/es', 'wir', 'ihr', 'sie/Sie']}
            conjugations={['werde', 'wirst', 'wird', 'werden', 'werdet', 'werden']}
            color="werden"
          />
          <ExampleBox
            german="Ich werde müde."
            italian="Sto diventando stanco."
            color="werden"
          />
          <ExampleBox
            german="Du wirst älter."
            italian="Stai invecchiando."
            color="werden"
          />
          <ExampleBox
            german="Das Wetter wird schön."
            italian="Il tempo sta diventando bello."
            color="werden"
          />
        </div>

        <div>
          <ConjugationTable
            tense="Präteritum (Passato Semplice)"
            pronouns={['ich', 'du', 'er/sie/es', 'wir', 'ihr', 'sie/Sie']}
            conjugations={['wurde', 'wurdest', 'wurde', 'wurden', 'wurdet', 'wurden']}
            color="werden"
          />
          <ExampleBox
            german="Ich wurde krank."
            italian="Diventai malato."
            color="werden"
          />
          <ExampleBox
            german="Es wurde dunkel."
            italian="Si fece scuro."
            color="werden"
          />
          <ExampleBox
            german="Sie wurden sehr glücklich."
            italian="Divennero molto felici."
            color="werden"
          />
        </div>

        <div>
          <ConjugationTable
            tense="Perfekt (Passato Prossimo)"
            pronouns={['ich', 'du', 'er/sie/es', 'wir', 'ihr', 'sie/Sie']}
            conjugations={[
              'bin geworden',
              'bist geworden',
              'ist geworden',
              'sind geworden',
              'seid geworden',
              'sind geworden',
            ]}
            color="werden"
          />
          <ExampleBox
            german="Ich bin älter geworden."
            italian="Sono diventato più vecchio."
            color="werden"
          />
          <ExampleBox
            german="Sie ist Ärztin geworden."
            italian="È diventata dottoressa."
            color="werden"
          />
        </div>

        <div>
          <ConjugationTable
            tense="Plusquamperfekt (Trapassato)"
            pronouns={['ich', 'du', 'er/sie/es', 'wir', 'ihr', 'sie/Sie']}
            conjugations={[
              'war geworden',
              'warst geworden',
              'war geworden',
              'waren geworden',
              'wart geworden',
              'waren geworden',
            ]}
            color="werden"
          />
          <ExampleBox
            german="Ich war müde geworden."
            italian="Ero diventato stanco."
            color="werden"
          />
        </div>
      </div>

      {/* Exercises for Werden as main verb */}
      <div className="mt-8 pt-6 border-t border-gray-700">
        <h3 className="text-xl font-semibold text-gray-100 mb-4">Esercizi</h3>
        <ExerciseBox
          id="werden_ex1"
          title="Esercizio 1"
          question="Completa: 'Du ___ 18 Jahre alt.' (Tu compi 18 anni)"
          answer="Du wirst 18 Jahre alt."
          hint="Presente, 2ª persona singolare"
          color="werden"
        />
        <ExerciseBox
          id="werden_ex2"
          title="Esercizio 2"
          question="Completa: 'Das Licht ___ immer schwächer.' (La luce diventa sempre più debole)"
          answer="Das Licht wird immer schwächer."
          hint="Presente, 3ª persona singolare"
          color="werden"
        />
        <ExerciseBox
          id="werden_ex3"
          title="Esercizio 3"
          question="Completa al passato: 'Ich ___ krank und musste zum Arzt gehen.' (Diventai malato)"
          answer="Ich wurde krank und musste zum Arzt gehen."
          hint="Präteritum"
          color="werden"
        />
      </div>
    </div>
  );

  // Section 3: Futur I
  const FuturISection = () => (
    <div>
      <h2 className="text-2xl font-bold text-gray-100 mb-6">Futur I (Futuro Semplice)</h2>

      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold mb-3" style={{ color: colors.futur.text }}>
          Formazione e Uso
        </h3>
        <div className="space-y-2 text-sm text-gray-300">
          <p>
            <span className="font-semibold text-blue-300">Formazione:</span> werden (coniugato) + infinito
          </p>
          <p>
            <span className="font-semibold text-blue-300">Usi:</span>
          </p>
          <ul className="list-disc list-inside ml-2">
            <li>Azioni future pianificate</li>
            <li>Promesse e previsioni</li>
            <li>Assunzioni e probabilità (con "schon", "wohl")</li>
          </ul>
        </div>
      </div>

      <div>
        <ConjugationTable
          tense="Futur I Completo"
          pronouns={['ich', 'du', 'er/sie/es', 'wir', 'ihr', 'sie/Sie']}
          conjugations={[
            'werde lernen',
            'wirst lernen',
            'wird lernen',
            'werden lernen',
            'werdet lernen',
            'werden lernen',
          ]}
          color="futur"
        />

        <h4 className="text-lg font-semibold mt-6 mb-4" style={{ color: colors.futur.text }}>
          Azioni Future Pianificate
        </h4>
        <ExampleBox
          german="Morgen werde ich ins Kino gehen."
          italian="Domani andrò al cinema."
          color="futur"
        />
        <ExampleBox
          german="Nächste Woche werden wir nach Rom fahren."
          italian="La prossima settimana andremo a Roma."
          color="futur"
        />
        <ExampleBox
          german="Er wird um 10 Uhr ankommen."
          italian="Arriverà alle 10."
          color="futur"
        />

        <h4 className="text-lg font-semibold mt-6 mb-4" style={{ color: colors.futur.text }}>
          Promesse e Previsioni
        </h4>
        <ExampleBox
          german="Ich werde dir helfen!"
          italian="Ti aiuterò!"
          color="futur"
        />
        <ExampleBox
          german="Es wird regnen."
          italian="Pioverà."
          color="futur"
        />

        <h4 className="text-lg font-semibold mt-6 mb-4" style={{ color: colors.futur.text }}>
          Assunzioni e Probabilità
        </h4>
        <ExampleBox
          german="Er wird wohl zu Hause sein. (Das stimmt wahrscheinlich)"
          italian="Probabilmente sarà a casa."
          color="futur"
        />
        <ExampleBox
          german="Du wirst schon recht haben. (Suppongo che tu abbia ragione)"
          italian="Avrai probabilmente ragione."
          color="futur"
        />
      </div>

      {/* Exercises for Futur I */}
      <div className="mt-8 pt-6 border-t border-gray-700">
        <h3 className="text-xl font-semibold text-gray-100 mb-4">Esercizi</h3>
        <ExerciseBox
          id="futuri_ex1"
          title="Esercizio 1"
          question="Completa al Futur I: 'Ich ___ ein Buch lesen.' (Leggerò un libro)"
          answer="Ich werde ein Buch lesen."
          hint="1ª persona singolare"
          color="futur"
        />
        <ExerciseBox
          id="futuri_ex2"
          title="Esercizio 2"
          question="Trasforma in futuro: 'Sie gehen nach Berlin.' (Loro andranno a Berlino)"
          answer="Sie werden nach Berlin gehen."
          hint="3ª persona plurale di 'gehen'"
          color="futur"
        />
        <ExerciseBox
          id="futuri_ex3"
          title="Esercizio 3"
          question="Assunzione al futuro: 'Der Chef ___ schon im Büro sein.' (Il capo sarà probabilmente in ufficio)"
          answer="Der Chef wird schon im Büro sein."
          hint="Con 'schon' per probabilità"
          color="futur"
        />
      </div>
    </div>
  );

  // Section 4: Futur II
  const FuturIISection = () => (
    <div>
      <h2 className="text-2xl font-bold text-gray-100 mb-6">Futur II (Futuro Anteriore)</h2>

      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold mb-3" style={{ color: colors.futur.text }}>
          Formazione e Uso
        </h3>
        <div className="space-y-2 text-sm text-gray-300">
          <p>
            <span className="font-semibold text-blue-300">Formazione:</span> werden + Partizip II + haben/sein
          </p>
          <p>
            <span className="font-semibold text-blue-300">Usi:</span>
          </p>
          <ul className="list-disc list-inside ml-2">
            <li>Azioni future che saranno completate</li>
            <li>Assunzioni forti su azioni passate</li>
            <li>Azioni completate entro un momento futuro specifico</li>
          </ul>
        </div>
      </div>

      <div>
        <h4 className="text-lg font-semibold mt-6 mb-4" style={{ color: colors.futur.text }}>
          Con Verbi Transitori (haben)
        </h4>
        <ConjugationTable
          tense="Futur II - Beispiel: lernen"
          pronouns={['ich', 'du', 'er/sie/es', 'wir', 'ihr', 'sie/Sie']}
          conjugations={[
            'werde gelernt haben',
            'wirst gelernt haben',
            'wird gelernt haben',
            'werden gelernt haben',
            'werdet gelernt haben',
            'werden gelernt haben',
          ]}
          color="futur"
        />
        <ExampleBox
          german="Bis morgen werde ich das Buch gelesen haben."
          italian="Entro domani avrò letto il libro."
          color="futur"
        />
        <ExampleBox
          german="Sie werden die Arbeit bis Freitag beendet haben."
          italian="Avranno terminato il lavoro entro venerdì."
          color="futur"
        />

        <h4 className="text-lg font-semibold mt-6 mb-4" style={{ color: colors.futur.text }}>
          Con Verbi di Movimento (sein)
        </h4>
        <ConjugationTable
          tense="Futur II - Beispiel: gehen"
          pronouns={['ich', 'du', 'er/sie/es', 'wir', 'ihr', 'sie/Sie']}
          conjugations={[
            'werde gegangen sein',
            'wirst gegangen sein',
            'wird gegangen sein',
            'werden gegangen sein',
            'werdet gegangen sein',
            'werden gegangen sein',
          ]}
          color="futur"
        />
        <ExampleBox
          german="Er wird schon nach Hause gegangen sein."
          italian="Sarà già andato a casa."
          color="futur"
        />
        <ExampleBox
          german="Um 18 Uhr werde ich angekommen sein."
          italian="Sarò arrivato entro le 18."
          color="futur"
        />

        <h4 className="text-lg font-semibold mt-6 mb-4" style={{ color: colors.futur.text }}>
          Assunzioni su Azioni Passate
        </h4>
        <ExampleBox
          german="Du wirst das Geld schon bekommen haben. (Suppongo che tu abbia ricevuto i soldi)"
          italian="Avrai già ricevuto i soldi."
          color="futur"
        />
        <ExampleBox
          german="Sie wird den Film schon gesehen haben."
          italian="Avrà già visto il film."
          color="futur"
        />
      </div>

      {/* Exercises for Futur II */}
      <div className="mt-8 pt-6 border-t border-gray-700">
        <h3 className="text-xl font-semibold text-gray-100 mb-4">Esercizi</h3>
        <ExerciseBox
          id="futurii_ex1"
          title="Esercizio 1"
          question="Completa al Futur II: 'Ich ___ die E-Mail geschrieben ___.' (Avrò scritto l'email)"
          answer="Ich werde die E-Mail geschrieben haben."
          hint="Partizip II di 'schreiben' è 'geschrieben'"
          color="futur"
        />
        <ExerciseBox
          id="futurii_ex2"
          title="Esercizio 2"
          question="Assunzione: 'Er ___ das Projekt ___ vollendet ___.' (Avrà probabilmente completato il progetto)"
          answer="Er wird das Projekt schon vollendet haben."
          hint="Con 'schon' per assunzione"
          color="futur"
        />
        <ExerciseBox
          id="futurii_ex3"
          title="Esercizio 3"
          question="Completa: 'Bis zum Wochenende ___ wir nach München ___ ___.' (Entro il weekend saremo andati a Monaco)"
          answer="Bis zum Wochenende werden wir nach München gegangen sein."
          hint="Verbo di movimento con 'sein'"
          color="futur"
        />
      </div>
    </div>
  );

  // Section 5: Passiv
  const PassivSection = () => (
    <div>
      <h2 className="text-2xl font-bold text-gray-100 mb-6">Passiv (Vorgangspassiv)</h2>

      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold mb-3" style={{ color: colors.passiv.text }}>
          Passivo con Werden
        </h3>
        <div className="space-y-2 text-sm text-gray-300">
          <p>
            Il passivo tedesco (Vorgangspassiv) usa "werden" + Partizip II per descrivere azioni passive.
            Diversamente dall'italiano che usa "venire" o "essere", il tedesco preferisce "werden".
          </p>
          <p className="font-semibold text-orange-400 mt-3">
            ATTENZIONE: Nel Perfekt passivo si usa "worden" NON "geworden"!
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="text-lg font-semibold mt-6 mb-4" style={{ color: colors.passiv.text }}>
            Präsens Passiv (Presente)
          </h4>
          <ConjugationTable
            tense="Präsens Passiv - Beispiel: schreiben"
            pronouns={['ich', 'du', 'er/sie/es', 'wir', 'ihr', 'sie/Sie']}
            conjugations={[
              'werde geschrieben',
              'wirst geschrieben',
              'wird geschrieben',
              'werden geschrieben',
              'werdet geschrieben',
              'werden geschrieben',
            ]}
            color="passiv"
          />
          <ExampleBox
            german="Das Buch wird gelesen."
            italian="Il libro viene letto."
            color="passiv"
          />
          <ExampleBox
            german="Der Brief wird geschrieben."
            italian="La lettera viene scritta."
            color="passiv"
          />
          <ExampleBox
            german="Der Kuchen wird gebacken."
            italian="La torta viene preparata."
            color="passiv"
          />
        </div>

        <div>
          <h4 className="text-lg font-semibold mt-6 mb-4" style={{ color: colors.passiv.text }}>
            Präteritum Passiv (Passato)
          </h4>
          <ConjugationTable
            tense="Präteritum Passiv"
            pronouns={['ich', 'du', 'er/sie/es', 'wir', 'ihr', 'sie/Sie']}
            conjugations={[
              'wurde geschrieben',
              'wurdest geschrieben',
              'wurde geschrieben',
              'wurden geschrieben',
              'wurdet geschrieben',
              'wurden geschrieben',
            ]}
            color="passiv"
          />
          <ExampleBox
            german="Das Haus wurde gebaut."
            italian="La casa è stata costruita."
            color="passiv"
          />
          <ExampleBox
            german="Das Projekt wurde geplant."
            italian="Il progetto è stato pianificato."
            color="passiv"
          />
        </div>

        <div>
          <h4 className="text-lg font-semibold mt-6 mb-4" style={{ color: colors.passiv.text }}>
            Perfekt Passiv (Passato Prossimo) - ATTENZIONE: "worden" non "geworden"!
          </h4>
          <ConjugationTable
            tense="Perfekt Passiv"
            pronouns={['ich', 'du', 'er/sie/es', 'wir', 'ihr', 'sie/Sie']}
            conjugations={[
              'bin gelesen worden',
              'bist gelesen worden',
              'ist gelesen worden',
              'sind gelesen worden',
              'seid gelesen worden',
              'sind gelesen worden',
            ]}
            color="passiv"
          />
          <ExampleBox
            german="Das Buch ist gelesen worden."
            italian="Il libro è stato letto."
            color="passiv"
          />
          <ExampleBox
            german="Wir sind eingeladen worden."
            italian="Siamo stati invitati."
            color="passiv"
          />
        </div>

        <div>
          <h4 className="text-lg font-semibold mt-6 mb-4" style={{ color: colors.passiv.text }}>
            Plusquamperfekt Passiv (Trapassato)
          </h4>
          <ConjugationTable
            tense="Plusquamperfekt Passiv"
            pronouns={['ich', 'du', 'er/sie/es', 'wir', 'ihr', 'sie/Sie']}
            conjugations={[
              'war gelesen worden',
              'warst gelesen worden',
              'war gelesen worden',
              'waren gelesen worden',
              'wart gelesen worden',
              'waren gelesen worden',
            ]}
            color="passiv"
          />
          <ExampleBox
            german="Das Haus war gebaut worden."
            italian="La casa era stata costruita."
            color="passiv"
          />
        </div>

        <div>
          <h4 className="text-lg font-semibold mt-6 mb-4" style={{ color: colors.passiv.text }}>
            Futur I Passiv
          </h4>
          <ConjugationTable
            tense="Futur I Passiv"
            pronouns={['ich', 'du', 'er/sie/es', 'wir', 'ihr', 'sie/Sie']}
            conjugations={[
              'werde geschrieben',
              'wirst geschrieben',
              'wird geschrieben',
              'werden geschrieben',
              'werdet geschrieben',
              'werden geschrieben',
            ]}
            color="passiv"
          />
          <ExampleBox
            german="Das Buch wird gelesen werden."
            italian="Il libro verrà letto."
            color="passiv"
          />
        </div>

        <div>
          <h4 className="text-lg font-semibold mt-6 mb-4" style={{ color: colors.passiv.text }}>
            Con Agente (von + Dativo / durch + Accusativo)
          </h4>
          <ExampleBox
            german="Das Buch wird von Maria gelesen."
            italian="Il libro viene letto da Maria."
            color="passiv"
          />
          <ExampleBox
            german="Der Schüler wurde vom Lehrer korrigiert."
            italian="Lo studente è stato corretto dall'insegnante."
            color="passiv"
          />
          <ExampleBox
            german="Das Fenster wurde durch den Stein zerbrochen."
            italian="La finestra è stata rotta dalla pietra."
            color="passiv"
          />
          <ExampleBox
            german="Die Arbeit wird durch die neue Technologie vereinfacht."
            italian="Il lavoro è semplificato dalla nuova tecnologia."
            color="passiv"
          />
        </div>
      </div>

      {/* Exercises for Passiv */}
      <div className="mt-8 pt-6 border-t border-gray-700">
        <h3 className="text-xl font-semibold text-gray-100 mb-4">Esercizi</h3>
        <ExerciseBox
          id="passiv_ex1"
          title="Esercizio 1"
          question="Trasforma in passivo (Präsens): 'Der Maler malt das Haus.' (Il pittore dipinge la casa)"
          answer="Das Haus wird vom Maler gemalt."
          hint="Usa 'von + Dativum' per l'agente"
          color="passiv"
        />
        <ExerciseBox
          id="passiv_ex2"
          title="Esercizio 2"
          question="Completa al Präteritum Passiv: 'Das Spiel ___ am Samstag ___.' (La partita è stata giocata sabato)"
          answer="Das Spiel wurde am Samstag gespielt."
          hint="Partizip II di 'spielen' è 'gespielt'"
          color="passiv"
        />
        <ExerciseBox
          id="passiv_ex3"
          title="Esercizio 3"
          question="Completa al Perfekt Passiv: 'Der Koffer ___ gepackt ___.' (La valigia è stata preparata)"
          answer="Der Koffer ist gepackt worden."
          hint="RICORDA: 'worden' non 'geworden' nel passivo!"
          color="passiv"
        />
        <ExerciseBox
          id="passiv_ex4"
          title="Esercizio 4"
          question="Completa: 'Die Stadt ___ durch das Erdbeben zerstört ___.' (La città è stata distrutta dal terremoto)"
          answer="Die Stadt wurde durch das Erdbeben zerstört."
          hint="Usa 'durch + Akkusativum' per causa/mezzo"
          color="passiv"
        />
      </div>
    </div>
  );

  // Section 6: Konjunktiv II with würde
  const KonjunktivSection = () => (
    <div>
      <h2 className="text-2xl font-bold text-gray-100 mb-6">Konjunktiv II mit Würde</h2>

      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold mb-3" style={{ color: colors.konjunktiv.text }}>
          Condizionale Tedesco
        </h3>
        <div className="space-y-2 text-sm text-gray-300">
          <p>
            Il Konjunktiv II con "würde" è il modo condizionale tedesco. Viene usato per esprimere
            ipotesi, desideri irreali e richieste cortesi.
          </p>
          <p className="font-semibold text-purple-400 mt-3">
            Formazione: würde (coniugato) + Infinito
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="text-lg font-semibold mt-6 mb-4" style={{ color: colors.konjunktiv.text }}>
            Coniugazione di Würde
          </h4>
          <ConjugationTable
            tense="Würde + Infinito"
            pronouns={['ich', 'du', 'er/sie/es', 'wir', 'ihr', 'sie/Sie']}
            conjugations={[
              'würde machen',
              'würdest machen',
              'würde machen',
              'würden machen',
              'würdet machen',
              'würden machen',
            ]}
            color="konjunktiv"
          />

          <h4 className="text-lg font-semibold mt-6 mb-4" style={{ color: colors.konjunktiv.text }}>
            Richieste Cortesi e Suggerimenti
          </h4>
          <ExampleBox
            german="Würdest du mir helfen?"
            italian="Mi aiuteresti?"
            color="konjunktiv"
          />
          <ExampleBox
            german="Ich würde einen Kaffee trinken."
            italian="Berrei un caffè."
            color="konjunktiv"
          />
          <ExampleBox
            german="Das würde mir sehr gefallen."
            italian="Mi piacerebbe molto."
            color="konjunktiv"
          />

          <h4 className="text-lg font-semibold mt-6 mb-4" style={{ color: colors.konjunktiv.text }}>
            Condizioni Irreali (Ipotesi)
          </h4>
          <ExampleBox
            german="Wenn ich mehr Geld hätte, würde ich eine Reise machen."
            italian="Se avessi più soldi, farei un viaggio."
            color="konjunktiv"
          />
          <ExampleBox
            german="Wenn du früher aufstehen würdest, würdest du nicht zu spät kommen."
            italian="Se ti svegliassi prima, non arriveresti tardi."
            color="konjunktiv"
          />
          <ExampleBox
            german="Was würdest du an meiner Stelle tun?"
            italian="Cosa faresti al mio posto?"
            color="konjunktiv"
          />

          <h4 className="text-lg font-semibold mt-6 mb-4" style={{ color: colors.konjunktiv.text }}>
            Desideri e Preferenze
          </h4>
          <ExampleBox
            german="Ich würde lieber ins Kino gehen."
            italian="Preferirei andare al cinema."
            color="konjunktiv"
          />
          <ExampleBox
            german="Sie würden gerne in Italien leben."
            italian="Loro gradirebbero vivere in Italia."
            color="konjunktiv"
          />

          <h4 className="text-lg font-semibold mt-6 mb-4" style={{ color: colors.konjunktiv.text }}>
            Differenza tra Würde e Konjunktiv II Diretto
          </h4>
          <div className="bg-gray-700 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-300 mb-2">
              Molti verbi hanno forme dirette di Konjunktiv II (senza würde):
            </p>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>
                <span className="text-purple-300 font-mono">gehen</span> →{' '}
                <span className="text-purple-300 font-mono">ginge</span> (andrei)
              </li>
              <li>
                <span className="text-purple-300 font-mono">kommen</span> →{' '}
                <span className="text-purple-300 font-mono">käme</span> (verrei)
              </li>
              <li>
                <span className="text-purple-300 font-mono">haben</span> →{' '}
                <span className="text-purple-300 font-mono">hätte</span> (avrei)
              </li>
              <li>
                <span className="text-purple-300 font-mono">sein</span> →{' '}
                <span className="text-purple-300 font-mono">wäre</span> (sarei)
              </li>
            </ul>
            <p className="text-sm text-gray-300 mt-3">
              Tuttavia, "würde" è più comune nel tedesco moderno, specialmente per i verbi regolari.
            </p>
          </div>
        </div>
      </div>

      {/* Exercises for Konjunktiv */}
      <div className="mt-8 pt-6 border-t border-gray-700">
        <h3 className="text-xl font-semibold text-gray-100 mb-4">Esercizi</h3>
        <ExerciseBox
          id="konj_ex1"
          title="Esercizio 1"
          question="Trasforma in Konjunktiv II: 'Können Sie mir helfen?' (Potrebbe aiutarmi?)"
          answer="Würden Sie mir helfen?"
          hint="2ª persona plurale (forma di cortesia)"
          color="konjunktiv"
        />
        <ExerciseBox
          id="konj_ex2"
          title="Esercizio 2"
          question="Completa: 'Wenn ich Zeit hätte, ___ ich einen Film schauen.' (Se avessi tempo, guarderei un film)"
          answer="würde ich einen Film schauen"
          hint="Condizione irreale con würde"
          color="konjunktiv"
        />
        <ExerciseBox
          id="konj_ex3"
          title="Esercizio 3"
          question="Completa: 'Das ___-___ mir nicht gefallen.' (Non mi piacerebbe)"
          answer="würde mir nicht gefallen"
          hint="1ª persona singolare di würde"
          color="konjunktiv"
        />
      </div>
    </div>
  );

  // Section 7: Fixed expressions
  const FixedExpressionsSection = () => (
    <div>
      <h2 className="text-2xl font-bold text-gray-100 mb-6">Espressioni Fisse con Werden</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          className="p-4 rounded-lg"
          style={{
            backgroundColor: colors.werden.bg,
            borderLeft: `4px solid ${colors.werden.border}`,
          }}
        >
          <p className="font-semibold mb-2" style={{ color: colors.werden.text }}>
            Es wird Zeit
          </p>
          <p className="text-sm text-gray-300">È ora</p>
          <p className="text-sm text-gray-400 mt-2">
            Es wird Zeit zum Abendessen. (È ora di cenare)
          </p>
        </div>

        <div
          className="p-4 rounded-lg"
          style={{
            backgroundColor: colors.werden.bg,
            borderLeft: `4px solid ${colors.werden.border}`,
          }}
        >
          <p className="font-semibold mb-2" style={{ color: colors.werden.text }}>
            Mir wird schlecht
          </p>
          <p className="text-sm text-gray-300">Mi sento male</p>
          <p className="text-sm text-gray-400 mt-2">
            Mir wird schwindlig. (Mi gira la testa)
          </p>
        </div>

        <div
          className="p-4 rounded-lg"
          style={{
            backgroundColor: colors.werden.bg,
            borderLeft: `4px solid ${colors.werden.border}`,
          }}
        >
          <p className="font-semibold mb-2" style={{ color: colors.werden.text }}>
            Krank/alt/groß werden
          </p>
          <p className="text-sm text-gray-300">Ammalarsi / Invecchiare / Crescere</p>
          <p className="text-sm text-gray-400 mt-2">
            Das Kind wird immer größer. (Il bambino cresce sempre più)
          </p>
        </div>

        <div
          className="p-4 rounded-lg"
          style={{
            backgroundColor: colors.werden.bg,
            borderLeft: `4px solid ${colors.werden.border}`,
          }}
        >
          <p className="font-semibold mb-2" style={{ color: colors.werden.text }}>
            Bekannt/berühmt werden
          </p>
          <p className="text-sm text-gray-300">Diventare celebre / Diventare famoso</p>
          <p className="text-sm text-gray-400 mt-2">
            Sie ist über Nacht bekannt geworden. (È diventata celebre da un giorno all'altro)
          </p>
        </div>

        <div
          className="p-4 rounded-lg"
          style={{
            backgroundColor: colors.werden.bg,
            borderLeft: `4px solid ${colors.werden.border}`,
          }}
        >
          <p className="font-semibold mb-2" style={{ color: colors.werden.text }}>
            Verrückt/verrückt werden
          </p>
          <p className="text-sm text-gray-300">Impazzire</p>
          <p className="text-sm text-gray-400 mt-2">
            Ich werde noch verrückt! (Sto impazzendo!)
          </p>
        </div>

        <div
          className="p-4 rounded-lg"
          style={{
            backgroundColor: colors.werden.bg,
            borderLeft: `4px solid ${colors.werden.border}`,
          }}
        >
          <p className="font-semibold mb-2" style={{ color: colors.werden.text }}>
            Was ist aus ihm geworden?
          </p>
          <p className="text-sm text-gray-300">Che fine ha fatto?</p>
          <p className="text-sm text-gray-400 mt-2">
            Was ist aus deinem Schulfreund geworden? (Che fine ha fatto il tuo compagno di scuola?)
          </p>
        </div>

        <div
          className="p-4 rounded-lg"
          style={{
            backgroundColor: colors.werden.bg,
            borderLeft: `4px solid ${colors.werden.border}`,
          }}
        >
          <p className="font-semibold mb-2" style={{ color: colors.werden.text }}>
            Zu viel für jemanden werden
          </p>
          <p className="text-sm text-gray-300">Diventare troppo per qualcuno</p>
          <p className="text-sm text-gray-400 mt-2">
            Die Arbeit wird mir zu viel. (Il lavoro mi diventa troppo)
          </p>
        </div>

        <div
          className="p-4 rounded-lg"
          style={{
            backgroundColor: colors.werden.bg,
            borderLeft: `4px solid ${colors.werden.border}`,
          }}
        >
          <p className="font-semibold mb-2" style={{ color: colors.werden.text }}>
            Es wird dunkel/hell
          </p>
          <p className="text-sm text-gray-300">Si fa buio/luminoso</p>
          <p className="text-sm text-gray-400 mt-2">
            Es wird langsam dunkel. (Si fa lentamente buio)
          </p>
        </div>
      </div>

      {/* Exercises for fixed expressions */}
      <div className="mt-8 pt-6 border-t border-gray-700">
        <h3 className="text-xl font-semibold text-gray-100 mb-4">Esercizi</h3>
        <ExerciseBox
          id="fixed_ex1"
          title="Esercizio 1"
          question="Traduci: 'È ora di andare.' (Pista: Es wird Zeit)"
          answer="Es wird Zeit zu gehen. / Es wird Zeit, zu gehen."
          hint="Espressione 'Es wird Zeit'"
          color="werden"
        />
        <ExerciseBox
          id="fixed_ex2"
          title="Esercizio 2"
          question="Completa: '___ mir schwindlig.' (Mi gira la testa)"
          answer="Mir wird schwindlig."
          hint="Espressione personalizzata con 'mir wird'"
          color="werden"
        />
        <ExerciseBox
          id="fixed_ex3"
          title="Esercizio 3"
          question="Traduci: 'Che fine ha fatto tua sorella?' (Pista: Was ist aus... geworden)"
          answer="Was ist aus deiner Schwester geworden?"
          hint="Espressione con perfetto di werden"
          color="werden"
        />
      </div>
    </div>
  );

  return (
    <div
      style={{
        backgroundColor: '#0f0f14',
        color: '#eeeef2',
        minHeight: '100vh',
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: '#22222d',
          borderBottom: '1px solid #444450',
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
        style={{ backgroundColor: '#22222d', borderColor: '#444450' }}
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
              color: activeTab === tab.id ? '#0096c7' : '#999fa8',
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
          backgroundColor: '#22222d',
          borderTop: '1px solid #444450',
          padding: '20px',
          textAlign: 'center',
          marginTop: '40px',
        }}
      >
        <p className="text-sm text-gray-400">
          Deutsche Master - Impara il tedesco in modo interattivo
        </p>
        <p className="text-xs text-gray-500 mt-2">
          Clicca sulla pronuncia per ascoltare gli esempi tedeschi
        </p>
      </div>
    </div>
  );
}

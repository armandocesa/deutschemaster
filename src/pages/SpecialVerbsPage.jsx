import React, { useState, useEffect } from 'react';
import Icons from '../components/Icons';
import { useLevelAccess } from '../hooks/useLevelAccess';
import { speak } from '../utils/speech';
import { saveDifficultWord, isDifficultWord, removeDifficultWord } from '../utils/storage';
import { useLanguage } from '../contexts/LanguageContext';

// Modalverben data
const MODALVERBEN = [
  {
    verb: 'können',
    italian: 'potere',
    present: ['ich kann', 'du kannst', 'er/sie/es kann', 'wir können', 'ihr könnt', 'sie/Sie können'],
    preterite: ['ich konnte', 'du konntest', 'er/sie/es konnte', 'wir konnten', 'ihr konntet', 'sie/Sie konnten'],
    examples: [
      { german: 'Ich kann Deutsch sprechen.', italian: 'Posso parlare tedesco.', level: 'A1' },
      { german: 'Kannst du mir helfen?', italian: 'Puoi aiutarmi?', level: 'A1' }
    ]
  },
  {
    verb: 'müssen',
    italian: 'dovere',
    present: ['ich muss', 'du musst', 'er/sie/es muss', 'wir müssen', 'ihr müsst', 'sie/Sie müssen'],
    preterite: ['ich musste', 'du musstest', 'er/sie/es musste', 'wir mussten', 'ihr musstet', 'sie/Sie mussten'],
    examples: [
      { german: 'Ich muss zur Schule gehen.', italian: 'Devo andare a scuola.', level: 'A1' },
      { german: 'Du musst heute arbeiten.', italian: 'Devi lavorare oggi.', level: 'A1' }
    ]
  },
  {
    verb: 'sollen',
    italian: 'dovere (obbligo)',
    present: ['ich soll', 'du sollst', 'er/sie/es soll', 'wir sollen', 'ihr sollt', 'sie/Sie sollen'],
    preterite: ['ich sollte', 'du solltest', 'er/sie/es sollte', 'wir sollten', 'ihr solltet', 'sie/Sie sollten'],
    examples: [
      { german: 'Du sollst deine Hausaufgaben machen.', italian: 'Dovresti fare i tuoi compiti.', level: 'A2' },
      { german: 'Sie sollen hier bleiben.', italian: 'Dovrebbero stare qui.', level: 'A2' }
    ]
  },
  {
    verb: 'wollen',
    italian: 'volere',
    present: ['ich will', 'du willst', 'er/sie/es will', 'wir wollen', 'ihr wollt', 'sie/Sie wollen'],
    preterite: ['ich wollte', 'du wolltest', 'er/sie/es wollte', 'wir wollten', 'ihr wolltet', 'sie/Sie wollten'],
    examples: [
      { german: 'Ich will ins Kino gehen.', italian: 'Voglio andare al cinema.', level: 'A1' },
      { german: 'Was willst du essen?', italian: 'Cosa vuoi mangiare?', level: 'A1' }
    ]
  },
  {
    verb: 'dürfen',
    italian: 'potere (permesso)',
    present: ['ich darf', 'du darfst', 'er/sie/es darf', 'wir dürfen', 'ihr dürft', 'sie/Sie dürfen'],
    preterite: ['ich durfte', 'du durftest', 'er/sie/es durfte', 'wir durften', 'ihr durftet', 'sie/Sie durften'],
    examples: [
      { german: 'Du darfst hier spielen.', italian: 'Puoi giocare qui.', level: 'A2' },
      { german: 'Darf ich fragen?', italian: 'Posso chiedere?', level: 'A1' }
    ]
  },
  {
    verb: 'mögen',
    italian: 'piacere / volere',
    present: ['ich mag', 'du magst', 'er/sie/es mag', 'wir mögen', 'ihr mögt', 'sie/Sie mögen'],
    preterite: ['ich mochte', 'du mochtest', 'er/sie/es mochte', 'wir mochten', 'ihr mochtet', 'sie/Sie mochten'],
    examples: [
      { german: 'Ich mag Schokolade.', italian: 'Mi piace il cioccolato.', level: 'A1' },
      { german: 'Magst du Kaffee?', italian: 'Ti piace il caffè?', level: 'A1' }
    ]
  }
];

// Reflexive Verben data
const REFLEXIVE_VERBEN = [
  {
    verb: 'sich waschen',
    italian: 'lavarsi',
    type: 'accusative',
    present: ['ich wasche mich', 'du wäschst dich', 'er/sie/es wäscht sich', 'wir waschen uns', 'ihr wascht euch', 'sie/Sie waschen sich'],
    examples: [
      { german: 'Ich wasche mich vor dem Essen.', italian: 'Mi lavo prima di mangiare.', level: 'A1' },
      { german: 'Wir waschen uns die Hände.', italian: 'Ci laviamo le mani.', level: 'A1' }
    ]
  },
  {
    verb: 'sich freuen',
    italian: 'essere contento / rallegrarsi',
    type: 'accusative',
    present: ['ich freue mich', 'du freust dich', 'er/sie/es freut sich', 'wir freuen uns', 'ihr freut euch', 'sie/Sie freuen sich'],
    examples: [
      { german: 'Ich freue mich auf die Ferien.', italian: 'Non vedo l\'ora delle vacanze.', level: 'A1' },
      { german: 'Sie freuen sich über das Geschenk.', italian: 'Sono felici del regalo.', level: 'A2' }
    ]
  },
  {
    verb: 'sich erinnern',
    italian: 'ricordarsi',
    type: 'genitive (dative in modern German)',
    present: ['ich erinnere mich', 'du erinnerst dich', 'er/sie/es erinnert sich', 'wir erinnern uns', 'ihr erinnert euch', 'sie/Sie erinnern sich'],
    examples: [
      { german: 'Ich erinnere mich an meinen Großvater.', italian: 'Mi ricordo di mio nonno.', level: 'A2' },
      { german: 'Erinnerst du dich daran?', italian: 'Te lo ricordi?', level: 'A2' }
    ]
  },
  {
    verb: 'sich setzen',
    italian: 'sedersi',
    type: 'accusative',
    present: ['ich setze mich', 'du setzt dich', 'er/sie/es setzt sich', 'wir setzen uns', 'ihr setzt euch', 'sie/Sie setzen sich'],
    examples: [
      { german: 'Ich setze mich auf den Stuhl.', italian: 'Mi siedo sulla sedia.', level: 'A1' },
      { german: 'Setzt euch hin!', italian: 'Sedetevi!', level: 'A1' }
    ]
  },
  {
    verb: 'sich befinden',
    italian: 'trovarsi',
    type: 'accusative',
    present: ['ich befinde mich', 'du befindest dich', 'er/sie/es befindet sich', 'wir befinden uns', 'ihr befindet euch', 'sie/Sie befinden sich'],
    examples: [
      { german: 'Das Theater befindet sich in der Nähe.', italian: 'Il teatro si trova vicino.', level: 'A2' },
      { german: 'Wo befindest du dich?', italian: 'Dove ti trovi?', level: 'A2' }
    ]
  },
  {
    verb: 'sich interessieren',
    italian: 'interessarsi',
    type: 'dative',
    present: ['ich interessiere mich', 'du interessierst dich', 'er/sie/es interessiert sich', 'wir interessieren uns', 'ihr interessiert euch', 'sie/Sie interessieren sich'],
    examples: [
      { german: 'Ich interessiere mich für Musik.', italian: 'Mi interessa la musica.', level: 'A2' },
      { german: 'Interessierst du dich für Sport?', italian: 'Ti interessa lo sport?', level: 'A2' }
    ]
  }
];

// Verben mit Präpositionen - top 30+
const VERBEN_MIT_PRÄPOSITIONEN = [
  { german: 'warten auf', italian: 'aspettare', example: 'Ich warte auf dich.' },
  { german: 'denken an', italian: 'pensare a', example: 'Ich denke an dich.' },
  { german: 'sich freuen über', italian: 'essere contento di', example: 'Ich freue mich über das Geschenk.' },
  { german: 'sich freuen auf', italian: 'non vedere l\'ora', example: 'Ich freue mich auf das Wochenende.' },
  { german: 'sich interessieren für', italian: 'interessarsi di', example: 'Ich interessiere mich für Musik.' },
  { german: 'sorgen für', italian: 'prendersi cura di', example: 'Sie sorgt für ihre Familie.' },
  { german: 'kämpfen für', italian: 'lottare per', example: 'Wir kämpfen für Freiheit.' },
  { german: 'danken für', italian: 'ringraziare per', example: 'Ich danke dir für deine Hilfe.' },
  { german: 'sich bedanken für', italian: 'ringraziare per', example: 'Er bedankt sich für das Geschenk.' },
  { german: 'bitten um', italian: 'chiedere', example: 'Ich bitte dich um Hilfe.' },
  { german: 'fragen nach', italian: 'chiedere di', example: 'Sie fragt nach dir.' },
  { german: 'suchen nach', italian: 'cercare', example: 'Ich suche nach meinem Schlüssel.' },
  { german: 'sich fürchten vor', italian: 'aver paura di', example: 'Ich fürchte mich vor der Dunkelheit.' },
  { german: 'warnen vor', italian: 'avvertire di', example: 'Sie warnt dich vor Gefahr.' },
  { german: 'schützen vor', italian: 'proteggere da', example: 'Das Dach schützt uns vor Regen.' },
  { german: 'sich schämen für', italian: 'vergognarsi di', example: 'Ich schäme mich für meinen Fehler.' },
  { german: 'sich schämen vor', italian: 'vergognarsi di fronte a', example: 'Ich schäme mich vor dir.' },
  { german: 'sich einigen auf', italian: 'mettersi d\'accordo su', example: 'Wir einigen uns auf einen Preis.' },
  { german: 'sich verlassen auf', italian: 'fare affidamento su', example: 'Du kannst dich auf mich verlassen.' },
  { german: 'bestehen auf', italian: 'insistere su', example: 'Sie besteht auf ihrer Meinung.' },
  { german: 'bestehen aus', italian: 'essere composto di', example: 'Das Team besteht aus zehn Spielern.' },
  { german: 'verzeihen für', italian: 'perdonare per', example: 'Ich verzeihe dir für deinen Fehler.' },
  { german: 'sich irren in', italian: 'sbagliarsi in', example: 'Ich irre mich in der Zeit.' },
  { german: 'sich verlieben in', italian: 'innamorarsi di', example: 'Sie verliebt sich in ihn.' },
  { german: 'glauben an', italian: 'credere in', example: 'Ich glaube an dich.' },
  { german: 'hindern an', italian: 'impedire', example: 'Nichts hindert mich daran.' },
  { german: 'leiden unter', italian: 'soffrire di', example: 'Er leidet unter Kopfschmerzen.' },
  { german: 'beginnen mit', italian: 'iniziare con', example: 'Wir beginnen mit dem Unterricht.' },
  { german: 'enden mit', italian: 'finire con', example: 'Das Buch endet mit einer Überraschung.' },
  { german: 'umgehen mit', italian: 'trattare', example: 'Wie gehst du mit Stress um?' },
  { german: 'umgeben von', italian: 'circondato da', example: 'Das Haus ist von Bäumen umgeben.' },
  { german: 'sich einlassen auf', italian: 'impegnarsi in', example: 'Ich lasse mich auf das Abenteuer ein.' }
];

// Top 50 irregular verbs
const IRREGULAR_VERBEN = [
  { present: 'sein', preterite: 'war', perfect: 'bin gewesen', italian: 'essere' },
  { present: 'haben', preterite: 'hatte', perfect: 'habe gehabt', italian: 'avere' },
  { present: 'gehen', preterite: 'ging', perfect: 'bin gegangen', italian: 'andare' },
  { present: 'kommen', preterite: 'kam', perfect: 'bin gekommen', italian: 'venire' },
  { present: 'sehen', preterite: 'sah', perfect: 'habe gesehen', italian: 'vedere' },
  { present: 'nehmen', preterite: 'nahm', perfect: 'habe genommen', italian: 'prendere' },
  { present: 'geben', preterite: 'gab', perfect: 'habe gegeben', italian: 'dare' },
  { present: 'sprechen', preterite: 'sprach', perfect: 'habe gesprochen', italian: 'parlare' },
  { present: 'stehen', preterite: 'stand', perfect: 'habe gestanden', italian: 'stare in piedi' },
  { present: 'laufen', preterite: 'lief', perfect: 'bin gelaufen', italian: 'correre' },
  { present: 'tragen', preterite: 'trug', perfect: 'habe getragen', italian: 'portare' },
  { present: 'halten', preterite: 'hielt', perfect: 'habe gehalten', italian: 'tenere' },
  { present: 'fallen', preterite: 'fiel', perfect: 'bin gefallen', italian: 'cadere' },
  { present: 'lassen', preterite: 'ließ', perfect: 'habe gelassen', italian: 'lasciare' },
  { present: 'lesen', preterite: 'las', perfect: 'habe gelesen', italian: 'leggere' },
  { present: 'schreiben', preterite: 'schrieb', perfect: 'habe geschrieben', italian: 'scrivere' },
  { present: 'schlafen', preterite: 'schlief', perfect: 'habe geschlafen', italian: 'dormire' },
  { present: 'essen', preterite: 'aß', perfect: 'habe gegessen', italian: 'mangiare' },
  { present: 'beginnen', preterite: 'begann', perfect: 'habe begonnen', italian: 'cominciare' },
  { present: 'finden', preterite: 'fand', perfect: 'habe gefunden', italian: 'trovare' },
  { present: 'denken', preterite: 'dachte', perfect: 'habe gedacht', italian: 'pensare' },
  { present: 'bringen', preterite: 'brachte', perfect: 'habe gebracht', italian: 'portare' },
  { present: 'kennen', preterite: 'kannte', perfect: 'habe gekannt', italian: 'conoscere' },
  { present: 'lieben', preterite: 'liebte', perfect: 'habe geliebt', italian: 'amare' },
  { present: 'fragen', preterite: 'fragte', perfect: 'habe gefragt', italian: 'chiedere' },
  { present: 'fahren', preterite: 'fuhr', perfect: 'bin gefahren', italian: 'andare (auto)' },
  { present: 'fliegen', preterite: 'flog', perfect: 'bin geflogen', italian: 'volare' },
  { present: 'verstehen', preterite: 'verstand', perfect: 'habe verstanden', italian: 'capire' },
  { present: 'vergessen', preterite: 'vergaß', perfect: 'habe vergessen', italian: 'dimenticare' },
  { present: 'wissen', preterite: 'wusste', perfect: 'habe gewusst', italian: 'sapere' },
  { present: 'helfen', preterite: 'half', perfect: 'habe geholfen', italian: 'aiutare' },
  { present: 'ziehen', preterite: 'zog', perfect: 'habe gezogen', italian: 'tirare' },
  { present: 'schießen', preterite: 'schoss', perfect: 'habe geschossen', italian: 'sparare' },
  { present: 'bieten', preterite: 'bot', perfect: 'habe geboten', italian: 'offrire' },
  { present: 'bitten', preterite: 'bat', perfect: 'habe gebeten', italian: 'chiedere' },
  { present: 'brechen', preterite: 'brach', perfect: 'habe gebrochen', italian: 'rompere' },
  { present: 'sterben', preterite: 'starb', perfect: 'bin gestorben', italian: 'morire' },
  { present: 'werfen', preterite: 'warf', perfect: 'habe geworfen', italian: 'lanciare' },
  { present: 'winken', preterite: 'winkte', perfect: 'habe gewinkt', italian: 'agitare la mano' },
  { present: 'zeichnen', preterite: 'zeichnete', perfect: 'habe gezeichnet', italian: 'disegnare' },
  { present: 'sitzen', preterite: 'saß', perfect: 'habe gesessen', italian: 'sedere' },
  { present: 'zwingen', preterite: 'zwang', perfect: 'habe gezwungen', italian: 'forzare' },
  { present: 'schwimmen', preterite: 'schwamm', perfect: 'bin geschwommen', italian: 'nuotare' },
  { present: 'singen', preterite: 'sang', perfect: 'habe gesungen', italian: 'cantare' },
  { present: 'springen', preterite: 'sprang', perfect: 'bin gesprungen', italian: 'saltare' },
  { present: 'trinken', preterite: 'trank', perfect: 'habe getrunken', italian: 'bere' },
  { present: 'schießen', preterite: 'schoss', perfect: 'habe geschossen', italian: 'sparare' },
  { present: 'stellen', preterite: 'stellte', perfect: 'habe gestellt', italian: 'mettere' },
  { present: 'spreizen', preterite: 'spreizte', perfect: 'habe gespreizt', italian: 'allargare' },
  { present: 'reißen', preterite: 'riss', perfect: 'habe gerissen', italian: 'strappare' },
  { present: 'schneiden', preterite: 'schnitt', perfect: 'habe geschnitten', italian: 'tagliare' }
];

// Modal Card Component
function ModalCard({ modal, onToggleFavorite, saved }) {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      overflow: 'hidden',
      marginBottom: '12px'
    }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%',
          background: 'none',
          border: 'none',
          padding: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          color: 'var(--text-primary)',
          fontSize: '15px',
          fontWeight: 700,
          textAlign: 'left',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(99, 102, 241, 0.05)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
      >
        <div>
          <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--accent)' }}>
            {modal.verb}
          </div>
          <div style={{
            fontSize: '12px',
            color: 'var(--text-secondary)',
            fontWeight: 400,
            marginTop: '2px'
          }}>
            {modal.italian}
          </div>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(modal.verb);
            }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              padding: '4px',
              color: saved ? 'var(--accent)' : 'var(--text-secondary)',
              transition: 'color 0.2s'
            }}
          >
            {saved ? <Icons.StarFilled /> : <Icons.Star />}
          </button>
          <span style={{
            fontSize: '12px',
            color: 'var(--text-secondary)',
            transition: 'transform 0.2s',
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)'
          }}>
            ▼
          </span>
        </div>
      </button>

      {expanded && (
        <div style={{
          borderTop: '1px solid var(--border)',
          padding: '12px',
          background: 'rgba(99, 102, 241, 0.02)'
        }}>
          <div style={{ marginBottom: '12px' }}>
            <div style={{
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--text-secondary)',
              marginBottom: '8px',
              textTransform: 'uppercase'
            }}>
              {t('specialVerbs.present')}
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px'
            }}>
              {modal.present.map((conj, idx) => (
                <div key={idx} style={{
                  fontSize: '12px',
                  color: 'var(--text-primary)',
                  fontFamily: 'monospace',
                  padding: '6px',
                  background: 'var(--bg-primary)',
                  borderRadius: '4px',
                  border: '1px solid var(--border)'
                }}>
                  {conj}
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <div style={{
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--text-secondary)',
              marginBottom: '8px',
              textTransform: 'uppercase'
            }}>
              {t('specialVerbs.preterite')}
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px'
            }}>
              {modal.preterite.map((conj, idx) => (
                <div key={idx} style={{
                  fontSize: '12px',
                  color: 'var(--text-primary)',
                  fontFamily: 'monospace',
                  padding: '6px',
                  background: 'var(--bg-primary)',
                  borderRadius: '4px',
                  border: '1px solid var(--border)'
                }}>
                  {conj}
                </div>
              ))}
            </div>
          </div>

          {modal.examples && modal.examples.length > 0 && (
            <div>
              <div style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--text-secondary)',
                marginBottom: '8px',
                textTransform: 'uppercase'
              }}>
                {t('specialVerbs.examples')}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {modal.examples.map((example, idx) => (
                  <div key={idx} style={{
                    padding: '8px',
                    background: 'var(--bg-primary)',
                    borderRadius: '4px',
                    border: '1px solid var(--border)',
                    fontSize: '12px'
                  }}>
                    <div style={{
                      color: 'var(--text-primary)',
                      marginBottom: '4px',
                      fontStyle: 'italic'
                    }}>
                      "{example.german}"
                    </div>
                    <div style={{
                      color: 'var(--text-secondary)',
                      fontSize: '11px'
                    }}>
                      {example.italian}
                    </div>
                    <button
                      onClick={() => speak(example.german)}
                      style={{
                        marginTop: '6px',
                        background: 'rgba(99, 102, 241, 0.1)',
                        border: '1px solid rgba(99, 102, 241, 0.3)',
                        borderRadius: '3px',
                        padding: '4px 8px',
                        cursor: 'pointer',
                        color: 'var(--accent)',
                        fontSize: '11px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Icons.Volume /> {t('specialVerbs.listen')}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Reflexive Verb Card Component
function ReflexiveCard({ verb, onToggleFavorite, saved }) {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      overflow: 'hidden',
      marginBottom: '12px'
    }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%',
          background: 'none',
          border: 'none',
          padding: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          color: 'var(--text-primary)',
          fontSize: '15px',
          fontWeight: 700,
          textAlign: 'left',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(99, 102, 241, 0.05)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
      >
        <div>
          <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--accent)' }}>
            {verb.verb}
          </div>
          <div style={{
            fontSize: '12px',
            color: 'var(--text-secondary)',
            fontWeight: 400,
            marginTop: '2px'
          }}>
            {verb.italian}
          </div>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(verb.verb);
            }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px',
              padding: '4px',
              color: saved ? 'var(--accent)' : 'var(--text-secondary)',
              transition: 'color 0.2s'
            }}
          >
            {saved ? <Icons.StarFilled /> : <Icons.Star />}
          </button>
          <span style={{
            fontSize: '12px',
            color: 'var(--text-secondary)',
            transition: 'transform 0.2s',
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)'
          }}>
            ▼
          </span>
        </div>
      </button>

      {expanded && (
        <div style={{
          borderTop: '1px solid var(--border)',
          padding: '12px',
          background: 'rgba(99, 102, 241, 0.02)'
        }}>
          <div style={{ marginBottom: '12px' }}>
            <div style={{
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--text-secondary)',
              marginBottom: '8px',
              textTransform: 'uppercase'
            }}>
              {t('specialVerbs.type')}: {verb.type}
            </div>
            <div style={{
              fontSize: '12px',
              color: 'var(--text-primary)',
              padding: '8px',
              background: 'var(--bg-primary)',
              borderRadius: '4px',
              border: '1px solid var(--border)'
            }}>
              {t('specialVerbs.reflexivePronouns')}: mich, dich, sich, uns, euch, sich
            </div>
          </div>

          <div style={{ marginBottom: '12px' }}>
            <div style={{
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--text-secondary)',
              marginBottom: '8px',
              textTransform: 'uppercase'
            }}>
              {t('specialVerbs.present')}
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '8px'
            }}>
              {verb.present.map((conj, idx) => (
                <div key={idx} style={{
                  fontSize: '12px',
                  color: 'var(--text-primary)',
                  fontFamily: 'monospace',
                  padding: '6px',
                  background: 'var(--bg-primary)',
                  borderRadius: '4px',
                  border: '1px solid var(--border)'
                }}>
                  {conj}
                </div>
              ))}
            </div>
          </div>

          {verb.examples && verb.examples.length > 0 && (
            <div>
              <div style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--text-secondary)',
                marginBottom: '8px',
                textTransform: 'uppercase'
              }}>
                {t('specialVerbs.examples')}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {verb.examples.map((example, idx) => (
                  <div key={idx} style={{
                    padding: '8px',
                    background: 'var(--bg-primary)',
                    borderRadius: '4px',
                    border: '1px solid var(--border)',
                    fontSize: '12px'
                  }}>
                    <div style={{
                      color: 'var(--text-primary)',
                      marginBottom: '4px',
                      fontStyle: 'italic'
                    }}>
                      "{example.german}"
                    </div>
                    <div style={{
                      color: 'var(--text-secondary)',
                      fontSize: '11px'
                    }}>
                      {example.italian}
                    </div>
                    <button
                      onClick={() => speak(example.german)}
                      style={{
                        marginTop: '6px',
                        background: 'rgba(99, 102, 241, 0.1)',
                        border: '1px solid rgba(99, 102, 241, 0.3)',
                        borderRadius: '3px',
                        padding: '4px 8px',
                        cursor: 'pointer',
                        color: 'var(--accent)',
                        fontSize: '11px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Icons.Volume /> {t('specialVerbs.listen')}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SpecialVerbsPage({ onNavigate }) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('modalverben');
  const [savedVerbs, setSavedVerbs] = useState(new Set());
  const { canAccessLevel, requiresAuth } = useLevelAccess();

  useEffect(() => {
    setSavedVerbs(new Set(
      MODALVERBEN.map(m => m.verb).filter(v => isDifficultWord(v))
    ));
  }, []);

  const toggleFavorite = (verbName) => {
    if (savedVerbs.has(verbName)) {
      removeDifficultWord(verbName);
      setSavedVerbs(new Set([...savedVerbs].filter(v => v !== verbName)));
    } else {
      saveDifficultWord({ verb: verbName }, 'verb');
      setSavedVerbs(new Set([...savedVerbs, verbName]));
    }
  };

  const tabs = [
    { id: 'modalverben', label: t('specialVerbs.modalverbs'), count: MODALVERBEN.length },
    { id: 'reflexive', label: t('specialVerbs.reflexive'), count: REFLEXIVE_VERBEN.length },
    { id: 'prepositionen', label: t('specialVerbs.prepositions'), count: VERBEN_MIT_PRÄPOSITIONEN.length },
    { id: 'irregular', label: t('specialVerbs.irregular'), count: IRREGULAR_VERBEN.length }
  ];

  return (
    <div style={{ background: 'var(--bg-primary)' }}>
      <div style={{
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border)',
        padding: '16px 20px',
        marginBottom: '16px'
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 800,
          color: 'var(--text-primary)',
          margin: '0 0 12px 0'
        }}>
          {t('specialVerbs.title')}
        </h1>
        <p style={{
          fontSize: '13px',
          color: 'var(--text-secondary)',
          margin: 0
        }}>
          {t('specialVerbs.subtitle')}
        </p>
      </div>

      <div style={{
        display: 'flex',
        gap: '8px',
        padding: '12px 20px',
        borderBottom: '1px solid var(--border)',
        overflowX: 'auto'
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius)',
              border: activeTab === tab.id ? '2px solid var(--accent)' : '1px solid var(--border)',
              background: activeTab === tab.id ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
              color: activeTab === tab.id ? 'var(--accent)' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s'
            }}
          >
            {tab.label} <span style={{ fontSize: '11px', opacity: 0.7 }}>({tab.count})</span>
          </button>
        ))}
      </div>

      <div style={{ padding: '16px 20px' }}>
        {activeTab === 'modalverben' && (
          <div>
            {MODALVERBEN.map((modal, idx) => (
              <ModalCard
                key={idx}
                modal={modal}
                onToggleFavorite={toggleFavorite}
                saved={savedVerbs.has(modal.verb)}
              />
            ))}
          </div>
        )}

        {activeTab === 'reflexive' && (
          <div>
            {REFLEXIVE_VERBEN.map((verb, idx) => (
              <ReflexiveCard
                key={idx}
                verb={verb}
                onToggleFavorite={toggleFavorite}
                saved={savedVerbs.has(verb.verb)}
              />
            ))}
          </div>
        )}

        {activeTab === 'prepositionen' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '12px'
          }}>
            {VERBEN_MIT_PRÄPOSITIONEN.map((item, idx) => (
              <div key={idx} style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                padding: '12px'
              }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: 'var(--accent)',
                  marginBottom: '4px'
                }}>
                  {item.german}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                  marginBottom: '8px'
                }}>
                  {item.italian}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: 'var(--text-primary)',
                  fontStyle: 'italic',
                  padding: '8px',
                  background: 'rgba(99, 102, 241, 0.05)',
                  borderRadius: '4px',
                  borderLeft: '2px solid var(--accent)'
                }}>
                  "{item.example}"
                </div>
                <button
                  onClick={() => speak(item.example)}
                  style={{
                    marginTop: '8px',
                    background: 'rgba(99, 102, 241, 0.1)',
                    border: '1px solid rgba(99, 102, 241, 0.3)',
                    borderRadius: '3px',
                    padding: '4px 8px',
                    cursor: 'pointer',
                    color: 'var(--accent)',
                    fontSize: '11px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    width: '100%',
                    justifyContent: 'center'
                  }}
                >
                  <Icons.Volume /> {t('specialVerbs.listen')}
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'irregular' && (
          <div>
            <div style={{
              overflowX: 'auto',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              background: 'var(--bg-card)'
            }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '12px'
              }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border)' }}>
                    <th style={{
                      padding: '12px',
                      textAlign: 'left',
                      color: 'var(--accent)',
                      fontWeight: 700,
                      background: 'rgba(99, 102, 241, 0.05)'
                    }}>{t('specialVerbs.infinitive')}</th>
                    <th style={{
                      padding: '12px',
                      textAlign: 'left',
                      color: 'var(--accent)',
                      fontWeight: 700,
                      background: 'rgba(99, 102, 241, 0.05)'
                    }}>Präteritum</th>
                    <th style={{
                      padding: '12px',
                      textAlign: 'left',
                      color: 'var(--accent)',
                      fontWeight: 700,
                      background: 'rgba(99, 102, 241, 0.05)'
                    }}>Perfekt</th>
                    <th style={{
                      padding: '12px',
                      textAlign: 'left',
                      color: 'var(--accent)',
                      fontWeight: 700,
                      background: 'rgba(99, 102, 241, 0.05)'
                    }}>{t('specialVerbs.translationCol')}</th>
                  </tr>
                </thead>
                <tbody>
                  {IRREGULAR_VERBEN.map((verb, idx) => (
                    <tr key={idx} style={{
                      borderBottom: '1px solid var(--border)',
                      background: idx % 2 === 0 ? 'transparent' : 'rgba(99, 102, 241, 0.02)'
                    }}>
                      <td style={{
                        padding: '10px 12px',
                        color: 'var(--text-primary)',
                        fontFamily: 'monospace',
                        fontWeight: 600
                      }}>
                        {verb.present}
                      </td>
                      <td style={{
                        padding: '10px 12px',
                        color: 'var(--text-primary)',
                        fontFamily: 'monospace'
                      }}>
                        {verb.preterite}
                      </td>
                      <td style={{
                        padding: '10px 12px',
                        color: 'var(--text-primary)',
                        fontFamily: 'monospace'
                      }}>
                        {verb.perfect}
                      </td>
                      <td style={{
                        padding: '10px 12px',
                        color: 'var(--text-secondary)',
                        fontSize: '11px'
                      }}>
                        {verb.italian}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

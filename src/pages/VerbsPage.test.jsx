import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import VerbsPage from './VerbsPage';

vi.mock('../contexts/LanguageContext', () => ({
  useLanguage: () => ({
    language: 'en',
    t: (key) => {
      const map = {
        'verbs.title': 'Verbs',
        'verbs.subtitle': 'verbs available',
        'verbs.search': 'Search verbs...',
        'verbs.noResults': 'No results found',
        'verbs.auxiliary': 'Auxiliary',
        'verbs.irregular': 'Irregular',
        'verbs.listen': 'Listen',
      };
      return map[key] || key;
    },
  }),
}));

vi.mock('../DataContext', () => ({
  useData: () => ({
    VERBS_DATA: {
      verbs: [
        {
          infinitiv: 'gehen',
          italiano: 'andare',
          hilfsverb: 'sein',
          irregular: true,
          konjugation: {
            präsens: { ich: 'gehe', du: 'gehst', er: 'geht', wir: 'gehen', ihr: 'geht', sie: 'gehen' },
            präteritum: { ich: 'ging', du: 'gingst', er: 'ging', wir: 'gingen', ihr: 'gingt', sie: 'gingen' },
          },
        },
        {
          infinitiv: 'machen',
          italiano: 'fare',
          hilfsverb: 'haben',
          irregular: false,
          konjugation: {
            präsens: { ich: 'mache', du: 'machst', er: 'macht', wir: 'machen', ihr: 'macht', sie: 'machen' },
          },
        },
        {
          infinitiv: 'sein',
          italiano: 'essere',
          hilfsverb: 'sein',
          irregular: true,
          konjugation: {
            präsens: { ich: 'bin', du: 'bist', er: 'ist', wir: 'sind', ihr: 'seid', sie: 'sind' },
          },
        },
      ],
    },
  }),
}));

vi.mock('../utils/storage', () => ({
  isDifficultWord: () => false,
  saveDifficultWord: vi.fn(),
  removeDifficultWord: vi.fn(),
}));

vi.mock('../utils/speech', () => ({ speak: vi.fn() }));

vi.mock('../components/Icons', () => ({
  default: new Proxy({}, {
    get: (_, name) => () => <span data-testid={`icon-${name.toLowerCase()}`} />,
  }),
}));

describe('VerbsPage', () => {
  let onNavigate;

  beforeEach(() => {
    onNavigate = vi.fn();
  });

  describe('Verb List View', () => {
    it('renders title', () => {
      render(<VerbsPage onNavigate={onNavigate} />);
      expect(screen.getByText('Verbs')).toBeTruthy();
    });

    it('shows verb count', () => {
      render(<VerbsPage onNavigate={onNavigate} />);
      expect(screen.getByText(/3 verbs available/)).toBeTruthy();
    });

    it('renders all verbs', () => {
      render(<VerbsPage onNavigate={onNavigate} />);
      expect(screen.getAllByText('gehen').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('machen')).toBeTruthy();
      expect(screen.getAllByText('sein').length).toBeGreaterThanOrEqual(1);
    });

    it('shows translations', () => {
      render(<VerbsPage onNavigate={onNavigate} />);
      expect(screen.getByText('andare')).toBeTruthy();
      expect(screen.getByText('fare')).toBeTruthy();
      expect(screen.getByText('essere')).toBeTruthy();
    });

    it('shows auxiliary verb badges', () => {
      render(<VerbsPage onNavigate={onNavigate} />);
      expect(screen.getAllByText('sein').length).toBeGreaterThanOrEqual(2); // verb name + aux badge
      expect(screen.getAllByText('haben').length).toBeGreaterThanOrEqual(1);
    });

    it('shows irregular badges', () => {
      render(<VerbsPage onNavigate={onNavigate} />);
      expect(screen.getAllByText('irr.').length).toBe(2); // gehen + sein
    });

    it('has search input', () => {
      render(<VerbsPage onNavigate={onNavigate} />);
      expect(screen.getByPlaceholderText('Search verbs...')).toBeTruthy();
    });

    it('filters verbs by search', () => {
      render(<VerbsPage onNavigate={onNavigate} />);
      fireEvent.change(screen.getByPlaceholderText('Search verbs...'), { target: { value: 'geh' } });
      expect(screen.getByText('gehen')).toBeTruthy();
      expect(screen.queryByText('machen')).toBeNull();
    });

    it('navigates to verb detail on click', () => {
      render(<VerbsPage onNavigate={onNavigate} />);
      fireEvent.click(screen.getByText('gehen'));
      expect(onNavigate).toHaveBeenCalledWith('verbs', expect.objectContaining({ module: expect.objectContaining({ infinitiv: 'gehen' }) }));
    });

    it('shows empty state for no results', () => {
      render(<VerbsPage onNavigate={onNavigate} />);
      fireEvent.change(screen.getByPlaceholderText('Search verbs...'), { target: { value: 'zzzzz' } });
      expect(screen.getByText('No results found')).toBeTruthy();
    });
  });

  describe('Verb Detail View', () => {
    const verb = {
      infinitiv: 'gehen',
      italiano: 'andare',
      hilfsverb: 'sein',
      irregular: true,
      konjugation: {
        präsens: { ich: 'gehe', du: 'gehst', er: 'geht', wir: 'gehen', ihr: 'geht', sie: 'gehen' },
        präteritum: { ich: 'ging', du: 'gingst', er: 'ging', wir: 'gingen', ihr: 'gingt', sie: 'gingen' },
      },
    };

    it('renders verb title', () => {
      render(<VerbsPage selectedVerb={verb} onNavigate={onNavigate} />);
      expect(screen.getAllByText('gehen').length).toBeGreaterThanOrEqual(1);
    });

    it('shows meaning', () => {
      render(<VerbsPage selectedVerb={verb} onNavigate={onNavigate} />);
      expect(screen.getByText('andare')).toBeTruthy();
    });

    it('shows conjugation table', () => {
      render(<VerbsPage selectedVerb={verb} onNavigate={onNavigate} />);
      expect(screen.getByText('gehe')).toBeTruthy();
      expect(screen.getByText('gehst')).toBeTruthy();
    });

    it('shows tense tabs', () => {
      render(<VerbsPage selectedVerb={verb} onNavigate={onNavigate} />);
      expect(screen.getByText('Präsens')).toBeTruthy();
      expect(screen.getByText('Präteritum')).toBeTruthy();
    });

    it('switches tense on tab click', () => {
      render(<VerbsPage selectedVerb={verb} onNavigate={onNavigate} />);
      fireEvent.click(screen.getByText('Präteritum'));
      expect(screen.getAllByText('ging').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('gingst')).toBeTruthy();
    });
  });
});

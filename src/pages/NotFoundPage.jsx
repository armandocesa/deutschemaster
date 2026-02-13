import React from 'react';
import Icons from '../components/Icons';
import { useLanguage } from '../contexts/LanguageContext';

export default function NotFoundPage({ onNavigate }) {
  const { t } = useLanguage();
  return (
    <div style={{
      background: 'var(--bg-primary)',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '40px 20px',
        textAlign: 'center',
        maxWidth: '500px',
        width: '100%'
      }}>
        <div style={{
          fontSize: '64px',
          marginBottom: '20px',
          color: 'var(--accent)',
          fontWeight: 800
        }}>
          404
        </div>

        <h1 style={{
          fontSize: '28px',
          fontWeight: 800,
          color: 'var(--text-primary)',
          margin: '0 0 12px 0'
        }}>
          {t('notFound.title')}
        </h1>

        <p style={{
          fontSize: '14px',
          color: 'var(--text-secondary)',
          margin: '0 0 20px 0',
          lineHeight: 1.6
        }}>
          {t('notFound.message')}
        </p>

        <button
          onClick={() => onNavigate('home')}
          style={{
            background: 'var(--accent)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius)',
            padding: '12px 24px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s',
            boxShadow: '0 2px 8px rgba(108, 92, 231, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(108, 92, 231, 0.4)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(108, 92, 231, 0.3)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <Icons.Home /> {t('notFound.homeButton')}
        </button>
      </div>
    </div>
  );
}

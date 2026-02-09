import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function LoginPage({ onNavigate }) {
  const { signup, login, loginWithGoogle, firebaseEnabled } = useAuth();
  const { t } = useLanguage();
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!firebaseEnabled) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.logo}>DE</div>
          <h1 style={styles.title}>{t('login.title')}</h1>
          <div style={{ padding: '20px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '12px', textAlign: 'center' }}>
            <p style={{ margin: '0 0 8px', fontWeight: 600, color: '#f59e0b' }}>{t('login.firebaseDisabled')}</p>
            <p style={{ margin: 0, fontSize: '13px', color: '#8888a0' }}>
              {t('login.firebaseDisabledMessage')}
            </p>
          </div>
          <button onClick={() => onNavigate('home')} style={{ ...styles.btn, ...styles.btnPrimary, marginTop: '20px' }}>
            {t('login.continueWithoutAccount')}
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignup) {
        await signup(email, password, displayName);
      } else {
        await login(email, password);
      }
      onNavigate('home');
    } catch (err) {
      const messages = {
        'auth/email-already-in-use': t('login.emailAlreadyInUse'),
        'auth/invalid-email': t('login.invalidEmail'),
        'auth/weak-password': t('login.weakPassword'),
        'auth/user-not-found': t('login.userNotFound'),
        'auth/wrong-password': t('login.wrongPassword'),
        'auth/invalid-credential': t('login.invalidCredential'),
        'auth/too-many-requests': t('login.tooManyRequests'),
      };
      setError(messages[err.code] || err.message);
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
      onNavigate('home');
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(t('login.googleError'));
      }
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>DE</div>
        <h1 style={styles.title}>{t('login.title')}</h1>
        <p style={styles.subtitle}>
          {isSignup ? t('login.createAccount') : t('login.signIn')}
        </p>

        {error && (
          <div style={styles.error}>{error}</div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          {isSignup && (
            <div style={styles.field}>
              <label style={styles.label}>{t('login.name')}</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={t('login.yourName')}
                style={styles.input}
              />
            </div>
          )}

          <div style={styles.field}>
            <label style={styles.label}>{t('login.email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('login.yourEmail')}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>{t('login.password')}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isSignup ? t('login.minPassword') : t('login.yourPassword')}
              required
              minLength={6}
              style={styles.input}
            />
          </div>

          <button type="submit" disabled={loading} style={{ ...styles.btn, ...styles.btnPrimary, opacity: loading ? 0.7 : 1 }}>
            {loading ? t('login.loading') : isSignup ? t('login.signup') : t('login.signin')}
          </button>
        </form>

        <div style={styles.divider}>
          <span style={styles.dividerLine} />
          <span style={styles.dividerText}>{t('login.or')}</span>
          <span style={styles.dividerLine} />
        </div>

        <button onClick={handleGoogle} disabled={loading} style={{ ...styles.btn, ...styles.btnGoogle }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          {t('login.continueGoogle')}
        </button>

        <div style={styles.switchMode}>
          {isSignup ? t('login.switchToSignin') : t('login.switchToSignup')}
          <button onClick={() => { setIsSignup(!isSignup); setError(''); }} style={styles.switchBtn}>
            {isSignup ? t('login.signin') : t('login.signup')}
          </button>
        </div>

        <button onClick={() => onNavigate('home')} style={styles.skipBtn}>
          {t('login.continueWithoutAccount')}
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    backgroundColor: '#0f0f14',
  },
  card: {
    width: '100%',
    maxWidth: '400px',
    padding: '40px 32px',
    backgroundColor: '#191920',
    borderRadius: '16px',
    border: '1px solid rgba(255,255,255,0.07)',
  },
  logo: {
    width: '60px',
    height: '60px',
    borderRadius: '16px',
    background: 'linear-gradient(135deg, #6c5ce7, #a29bfe)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    fontWeight: 900,
    color: 'white',
    margin: '0 auto 16px',
    letterSpacing: '-1px',
  },
  title: {
    textAlign: 'center',
    fontSize: '24px',
    fontWeight: 800,
    color: '#eeeef2',
    margin: '0 0 4px',
  },
  subtitle: {
    textAlign: 'center',
    fontSize: '14px',
    color: '#8888a0',
    margin: '0 0 24px',
  },
  error: {
    padding: '12px 16px',
    backgroundColor: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: '8px',
    color: '#ef4444',
    fontSize: '13px',
    marginBottom: '16px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#a0a0b8',
  },
  input: {
    padding: '12px 16px',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.1)',
    backgroundColor: '#22222d',
    color: '#eeeef2',
    fontSize: '15px',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  btn: {
    padding: '14px',
    borderRadius: '10px',
    border: 'none',
    fontSize: '15px',
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    transition: 'opacity 0.2s',
    width: '100%',
  },
  btnPrimary: {
    background: 'linear-gradient(135deg, #6c5ce7, #a29bfe)',
    color: 'white',
    marginTop: '8px',
  },
  btnGoogle: {
    backgroundColor: '#22222d',
    color: '#eeeef2',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    margin: '20px 0',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  dividerText: {
    fontSize: '12px',
    color: '#8888a0',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  switchMode: {
    textAlign: 'center',
    fontSize: '13px',
    color: '#8888a0',
    marginTop: '20px',
  },
  switchBtn: {
    background: 'none',
    border: 'none',
    color: '#a29bfe',
    fontWeight: 700,
    cursor: 'pointer',
    fontSize: '13px',
    marginLeft: '4px',
  },
  skipBtn: {
    background: 'none',
    border: 'none',
    color: '#8888a0',
    cursor: 'pointer',
    fontSize: '12px',
    marginTop: '16px',
    width: '100%',
    textAlign: 'center',
    padding: '8px',
  },
};

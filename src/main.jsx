import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { DataProvider } from './DataContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { initSession, endSession, syncQueuedEvents } from './utils/analytics';
import './styles/variables.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/pages/common.css';
import './styles/pages/other.css';
import './styles/responsive.css';

// Initialize analytics session on app load
initSession();

// Periodically sync queued events (every 30 seconds)
const syncInterval = setInterval(() => {
  syncQueuedEvents();
}, 30000);

// End session, sync events, and clean up on page unload
window.addEventListener('beforeunload', () => {
  endSession();
  syncQueuedEvents();
  clearInterval(syncInterval);
});

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, info) { if (import.meta.env.DEV) console.error('Root ErrorBoundary:', error, info); }
  render() {
    if (this.state.hasError) {
      const lang = (navigator.language || '').slice(0, 2);
      const msgs = { it: { t: 'Qualcosa è andato storto', r: 'Ricarica la pagina' }, de: { t: 'Etwas ist schiefgelaufen', r: 'Seite neu laden' }, en: { t: 'Something went wrong', r: 'Reload page' } };
      const m = msgs[lang] || msgs.en;
      return (
        <div className="error-boundary">
          <h2>{m.t}</h2>
          {this.state.error?.message && <p style={{color:'#999',fontSize:'14px'}}>{this.state.error.message}</p>}
          <button onClick={() => window.location.reload()}>{m.r}</button>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <LanguageProvider>
      <DataProvider>
        <App />
      </DataProvider>
    </LanguageProvider>
  </ErrorBoundary>
);

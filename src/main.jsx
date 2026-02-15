import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { DataProvider } from './DataContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { scheduleReminder, getReminderTime } from './utils/notifications';
import { initSession, endSession, syncQueuedEvents } from './utils/analytics';
import './styles/variables.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/pages.css';
import './styles/responsive.css';

// Initialize analytics session on app load
initSession();

// Initialize notifications on app load
if ('Notification' in window) {
  const reminderTime = getReminderTime();
  const cleanupReminder = scheduleReminder(reminderTime);

  // Store cleanup function for potential later use
  window.__notificationCleanup = cleanupReminder;
}

// End session and sync on page unload
window.addEventListener('beforeunload', () => {
  endSession();
  syncQueuedEvents();
});

// Periodically sync queued events (every 30 seconds)
const syncInterval = setInterval(() => {
  syncQueuedEvents();
}, 30000);

// Clean up interval on page unload
window.addEventListener('beforeunload', () => {
  clearInterval(syncInterval);
});

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error, info) { if (import.meta.env.DEV) console.error('ErrorBoundary:', error, info); }
  render() {
    if (this.state.hasError) {
      const lang = (navigator.language || '').slice(0, 2);
      const msgs = { it: { t: 'Qualcosa è andato storto', r: 'Ricarica la pagina' }, de: { t: 'Etwas ist schiefgelaufen', r: 'Seite neu laden' }, en: { t: 'Something went wrong', r: 'Reload page' } };
      const m = msgs[lang] || msgs.en;
      return (
        <div className="error-boundary">
          <h2>{m.t}</h2>
          <button onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}>{m.r}</button>
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

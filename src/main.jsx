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
setInterval(() => {
  syncQueuedEvents();
}, 30000);

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error, info) { if (import.meta.env.DEV) console.error('ErrorBoundary:', error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <p style={{color: 'var(--text-secondary)'}}>An unexpected error occurred.</p>
          <button onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}>Reload page</button>
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

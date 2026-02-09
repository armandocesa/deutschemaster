import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { DataProvider } from './DataContext';
import './styles/variables.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/components.css';
import './styles/pages.css';
import './styles/responsive.css';

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error, info) { console.error('ErrorBoundary:', error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Qualcosa &egrave; andato storto</h2>
          <p style={{color: 'var(--text-secondary)'}}>Si &egrave; verificato un errore imprevisto.</p>
          <button onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}>Ricarica la pagina</button>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <DataProvider>
      <App />
    </DataProvider>
  </ErrorBoundary>
);

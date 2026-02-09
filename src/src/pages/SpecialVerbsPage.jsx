import React from 'react';

export default function SpecialVerbsPage({ onNavigate }) {
  return (
    <div className="special-verbs-page">
      <h1 className="page-title">Verbi Speciali</h1>
      <p className="page-subtitle">Separabili, non separabili e con preposizioni</p>
      <div className="empty-state">
        <p>Contenuto in arrivo!</p>
        <p style={{fontSize:'14px',marginTop:'10px',color:'var(--text-secondary)'}}>I verbi speciali saranno disponibili presto.</p>
      </div>
    </div>
  );
}

import React from 'react';
import Icons from './Icons';

export default function BottomNav({ currentPage, onNavigate }) {
  return (
    <div className="bottom-nav">
      <button className={`bottom-nav-item ${currentPage === 'home' ? 'active' : ''}`} onClick={() => onNavigate('home')}><Icons.Home /><span>Home</span></button>
      <button className={`bottom-nav-item ${currentPage === 'verbs' || currentPage === 'special-verbs' ? 'active' : ''}`} onClick={() => onNavigate('verbs')}><Icons.Verb /><span>Verbi</span></button>
      <button className={`bottom-nav-item ${currentPage === 'practice' ? 'active' : ''}`} onClick={() => onNavigate('practice')}><Icons.Practice /><span>Pratica</span></button>
      <button className={`bottom-nav-item ${currentPage === 'favorites' ? 'active' : ''}`} onClick={() => onNavigate('favorites')}><Icons.Star /><span>Salvate</span></button>
      <button className={`bottom-nav-item ${currentPage === 'lessons' ? 'active' : ''}`} onClick={() => onNavigate('lessons')}><Icons.Lessons /><span>Lezioni</span></button>
    </div>
  );
}

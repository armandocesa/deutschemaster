import React from 'react';
import Icons from './Icons';
import { useLanguage } from '../contexts/LanguageContext';

export default function LevelAccessModal({ isOpen, level, onClose, onLoginClick }) {
  const { t } = useLanguage();
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <Icons.X />
        </button>

        <div className="modal-header">
          <div className="modal-icon">🔒</div>
          <h2>{t('levelAccess.protected')}</h2>
        </div>

        <div className="modal-body">
          <p className="modal-text">
            {t('levelAccess.onlyRegistered')} <strong>{level}</strong> {t('levelAccess.isPrivate')}
          </p>
          <p className="modal-subtext">
            {t('levelAccess.signUpFree')}
          </p>
        </div>

        <div className="modal-actions">
          <button className="modal-btn-primary" onClick={onLoginClick}>
            {t('levelAccess.signIn')}
          </button>
          <button className="modal-btn-secondary" onClick={onClose}>
            {t('levelAccess.cancel')}
          </button>
        </div>

        <p className="modal-footer-text">
          {t('levelAccess.freeLevel')}
        </p>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.2s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .modal-content {
          background-color: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 32px 24px;
          max-width: 400px;
          width: 90%;
          position: relative;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .modal-close-btn {
          position: absolute;
          top: 16px;
          right: 16px;
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s ease;
        }

        .modal-close-btn:hover {
          color: var(--text-primary);
        }

        .modal-header {
          text-align: center;
          margin-bottom: 24px;
        }

        .modal-icon {
          font-size: 48px;
          margin-bottom: 12px;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .modal-body {
          margin-bottom: 28px;
        }

        .modal-text {
          margin: 0 0 12px 0;
          font-size: 15px;
          color: var(--text-primary);
          line-height: 1.6;
        }

        .modal-subtext {
          margin: 0;
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        .modal-actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 16px;
        }

        .modal-btn-primary {
          padding: 12px 20px;
          background-color: var(--accent);
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .modal-btn-primary:hover {
          background-color: #5f4dd1;
        }

        .modal-btn-secondary {
          padding: 12px 20px;
          background-color: var(--bg-secondary);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
          border-radius: 6px;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .modal-btn-secondary:hover {
          background-color: rgba(108, 92, 231, 0.1);
        }

        .modal-footer-text {
          margin: 0;
          text-align: center;
          font-size: 12px;
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  );
}

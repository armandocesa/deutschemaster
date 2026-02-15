import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const DonaPage = ({ onNavigate }) => {
  const { t } = useLanguage();
  const paypalEmail = 'armandocesa@gmail.com';
  const donationAmounts = [3, 5, 10, 20];

  const handleDonation = (amount) => {
    window.open(`https://paypal.me/${paypalEmail}/${amount}`, '_blank');
  };

  const handleCustomDonation = () => {
    window.open(`https://paypal.me/${paypalEmail}`, '_blank');
  };

  return (
    <div className="dona-container">
      <div className="dona-inner">
        {/* HEADER SECTION */}
        <div className="dona-header">
          <h1 className="dona-header-title">
            {t('dona.title')}
          </h1>

          <p className="dona-header-subtitle">
            {t('dona.subtitle')}
          </p>
        </div>

        {/* DESCRIPTION SECTION */}
        <div className="dona-description-box">
          <div className="dona-description-text">
            <p>
              {t('dona.description')}
            </p>
            <p>
              {t('dona.descriptionSupport')}
            </p>
            <ul className="dona-description-list">
              <li className="dona-description-item">
                {t('dona.addContent')}
              </li>
              <li className="dona-description-item">
                {t('dona.improveQuality')}
              </li>
              <li className="dona-description-item">
                {t('dona.keepServers')}
              </li>
              <li className="dona-description-item">
                {t('dona.noAds')}
              </li>
            </ul>
            <p className="dona-description-note">
              {t('dona.donationThank')}
            </p>
          </div>
        </div>

        {/* DONATION AMOUNTS SECTION */}
        <div className="dona-amounts-section">
          <h2 className="dona-amounts-title">
            {t('dona.chooseAmount')}
          </h2>

          <div className="dona-amounts-grid">
            {donationAmounts.map((amount) => (
              <button
                key={amount}
                onClick={() => handleDonation(amount)}
                className="dona-amount-btn"
              >
                <span className="dona-amount-value">€{amount}</span>
                <span className="dona-amount-label">{t('dona.donateNow')}</span>
              </button>
            ))}
          </div>

          <button
            onClick={handleCustomDonation}
            className="dona-custom-btn"
          >
            {t('dona.customAmount')}
          </button>
        </div>

        {/* WHY DONATE SECTION */}
        <div className="dona-why-box">
          <h2 className="dona-why-title">
            {t('dona.whyDonate')}
          </h2>

          <div className="dona-benefits-grid">
            {[
              {
                icon: '🎓',
                title: t('dona.freeContent'),
                description: t('dona.freeDescription'),
              },
              {
                icon: '📺',
                title: t('dona.noAdvertisements'),
                description: t('dona.noAdsDescription'),
              },
              {
                icon: '⚡',
                title: t('dona.continuousUpdates'),
                description: t('dona.updatesDescription'),
              },
              {
                icon: '🚀',
                title: t('dona.fullPotential'),
                description: t('dona.potentialDescription'),
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="dona-benefit-card"
              >
                <div className="dona-benefit-icon">
                  {item.icon}
                </div>
                <h3 className="dona-benefit-title">
                  {item.title}
                </h3>
                <p className="dona-benefit-description">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* FOOTER NOTE */}
        <div className="dona-footer">
          <p className="dona-footer-text">
            {t('dona.paypalNote')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DonaPage;

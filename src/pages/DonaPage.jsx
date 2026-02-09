import React from 'react';

const DonaPage = ({ onNavigate }) => {
  const paypalEmail = 'armandocesa@gmail.com';
  const donationAmounts = [3, 5, 10, 20];

  const handleDonation = (amount) => {
    window.open(`https://paypal.me/${paypalEmail}/${amount}`, '_blank');
  };

  const handleCustomDonation = () => {
    window.open(`https://paypal.me/${paypalEmail}`, '_blank');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        padding: '24px 16px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: 'var(--text-primary)',
      }}
    >
      <div
        style={{
          maxWidth: '800px',
          margin: '0 auto',
        }}
      >
        {/* HEADER SECTION */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: '48px',
          }}
        >
          <h1
            style={{
              fontSize: '36px',
              fontWeight: '700',
              marginBottom: '12px',
              color: 'var(--text-primary)',
            }}
          >
            Supporta Deutsche Master
          </h1>

          <p
            style={{
              fontSize: '16px',
              color: 'var(--text-secondary)',
              margin: '0',
              lineHeight: '1.6',
            }}
          >
            Aiutaci a mantenere l'app gratuita per tutti
          </p>
        </div>

        {/* DESCRIPTION SECTION */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '28px',
            marginBottom: '32px',
          }}
        >
          <div
            style={{
              fontSize: '15px',
              lineHeight: '1.8',
              color: 'var(--text-primary)',
            }}
          >
            <p>
              Deutsche Master è un'app completamente gratuita creata per aiutare studenti come te a imparare il tedesco in modo efficace e divertente.
            </p>
            <p>
              Se trovi Deutsche Master utile, considera di supportarci con una donazione. I tuoi contributi ci aiutano a:
            </p>
            <ul
              style={{
                margin: '16px 0',
                paddingLeft: '24px',
              }}
            >
              <li style={{ marginBottom: '8px' }}>
                Aggiungere nuovi contenuti e lezioni
              </li>
              <li style={{ marginBottom: '8px' }}>
                Migliorare la qualità dell'app
              </li>
              <li style={{ marginBottom: '8px' }}>
                Mantenere i server attivi e veloci
              </li>
              <li>
                Rimanere completamente senza pubblicità
              </li>
            </ul>
            <p style={{ marginTop: '16px', color: 'var(--text-secondary)', fontSize: '14px' }}>
              Ogni donazione, grande o piccola, fa una differenza. Grazie per il tuo supporto!
            </p>
          </div>
        </div>

        {/* DONATION AMOUNTS SECTION */}
        <div
          style={{
            marginBottom: '32px',
          }}
        >
          <h2
            style={{
              fontSize: '18px',
              fontWeight: '700',
              marginBottom: '20px',
              color: 'var(--text-primary)',
            }}
          >
            Scegli un Importo
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '16px',
              marginBottom: '20px',
            }}
          >
            {donationAmounts.map((amount) => (
              <button
                key={amount}
                onClick={() => handleDonation(amount)}
                style={{
                  padding: '20px 16px',
                  borderRadius: 'var(--radius)',
                  border: '2px solid var(--accent)',
                  background: 'linear-gradient(135deg, rgba(108,92,231,0.1), rgba(162,155,254,0.1))',
                  color: 'var(--text-primary)',
                  fontSize: '16px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--accent)';
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(108,92,231,0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(108,92,231,0.1), rgba(162,155,254,0.1))';
                  e.currentTarget.style.color = 'var(--text-primary)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <span style={{ fontSize: '24px' }}>€{amount}</span>
                <span style={{ fontSize: '12px', opacity: '0.8' }}>Dona ora</span>
              </button>
            ))}
          </div>

          <button
            onClick={handleCustomDonation}
            style={{
              width: '100%',
              padding: '16px 20px',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              background: 'var(--bg-card)',
              color: 'var(--text-primary)',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent)';
              e.currentTarget.style.background = 'var(--accent)';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border)';
              e.currentTarget.style.background = 'var(--bg-card)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
          >
            Importo Personalizzato
          </button>
        </div>

        {/* WHY DONATE SECTION */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '28px',
          }}
        >
          <h2
            style={{
              fontSize: '18px',
              fontWeight: '700',
              marginBottom: '24px',
              color: 'var(--text-primary)',
            }}
          >
            Perché Donare?
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '24px',
            }}
          >
            {[
              {
                icon: '🎓',
                title: 'Contenuti Gratuiti',
                description: 'Accesso illimitato a tutte le lezioni senza costi',
              },
              {
                icon: '📺',
                title: 'Senza Pubblicità',
                description: 'Un\'esperienza di apprendimento pulita e priva di distrazioni',
              },
              {
                icon: '⚡',
                title: 'Aggiornamenti Continui',
                description: 'Nuovi contenuti, correzioni e miglioramenti regolari',
              },
              {
                icon: '🚀',
                title: 'Pieno Potenziale',
                description: 'Tutti gli esercizi e le funzionalità sempre disponibili',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  padding: '20px',
                  background: 'var(--bg)',
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--border)',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    fontSize: '40px',
                    marginBottom: '12px',
                  }}
                >
                  {item.icon}
                </div>
                <h3
                  style={{
                    fontSize: '14px',
                    fontWeight: '700',
                    marginBottom: '8px',
                    color: 'var(--text-primary)',
                  }}
                >
                  {item.title}
                </h3>
                <p
                  style={{
                    fontSize: '13px',
                    color: 'var(--text-secondary)',
                    margin: '0',
                    lineHeight: '1.5',
                  }}
                >
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* FOOTER NOTE */}
        <div
          style={{
            marginTop: '32px',
            padding: '20px',
            textAlign: 'center',
            borderRadius: 'var(--radius)',
            background: 'rgba(108,92,231,0.05)',
            border: '1px solid rgba(108,92,231,0.2)',
          }}
        >
          <p
            style={{
              margin: '0',
              fontSize: '13px',
              color: 'var(--text-secondary)',
              lineHeight: '1.6',
            }}
          >
            Le donazioni sono effettuate tramite PayPal in modo sicuro. Sei libero di scegliere qualsiasi importo o di non donare se non sei in grado.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DonaPage;

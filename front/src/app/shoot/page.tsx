// src/app/page.tsx (Mode Selection Page)
'use client'
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

const ModeSelectionPage: React.FC = () => {
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [notification, setNotification] = useState({
    message: '',
    show: false,
    warning: false
  });

  const router = useRouter();
  
  const timeoutRefs = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach(clearTimeout);
    };
  }, []);

  const handleModeSelect = (mode: string) => {
    setSelectedMode(mode);
  };

  const handlePlay = () => {
    if (!selectedMode) {
      setNotification({
        message: 'Veuillez sélectionner un mode de jeu',
        show: true,
        warning: true
      });
      
      timeoutRefs.current.push(
        setTimeout(() => {
          setNotification({ ...notification, show: false });
        }, 3000)
      );
      return;
    }
    
    const modeNames: Record<string, string> = {
      'bot': '1 vs Bot',
      'local': '1 vs 1 Local',
      'online': '1 vs 1 Online'
    };
    
    setNotification({
      message: `Chargement du mode "${modeNames[selectedMode]}" en cours...`,
      show: true,
      warning: false
    });

    timeoutRefs.current.push(
      setTimeout(() => {
        if (selectedMode === 'bot' || selectedMode === 'local') {
          router.push(`/customisation?mode=${selectedMode}`);
        } else {
          router.push('/online-matchmaking');
        }
      }, 1500)
    );
  };

  useEffect(() => {
    // Définition du fond animé identique à GameCustomisation
    document.body.style.background = 
      'linear-gradient(135deg, #1a2a6c, #b21f1f, #1a2a6c)',
    document.body.style.backgroundSize = '400% 400%';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.minHeight = '100vh';
})

  return (
    <div style={styles.container}>
      <div style={styles.notificationContainer}>
        <div 
          style={{
            ...styles.notification,
            ...(notification.show ? styles.notificationShow : {}),
            ...(notification.warning ? styles.notificationWarning : {})
          }}
        >
          {notification.message}
        </div>
      </div>

      <h1 style={styles.title}>CHOISISSEZ VOTRE MODE DE JEU</h1>
      <p style={styles.subtitle}>Sélectionnez votre style de partie et affrontez vos amis ou l'IA</p>
      
      <div style={styles.modesContainer}>
        <div 
          style={{
            ...styles.modeCard,
            ...(selectedMode === 'local' ? styles.modeCardSelected : {})
          }}
          onClick={() => handleModeSelect('local')}
        >
          <div style={styles.modeIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              <path d="M21 21v-2a4 4 0 0 0-3-3.85"></path>
            </svg>
          </div>
          <div style={styles.modeOverlay}>
            <div style={styles.modeName}>1 vs 1 Local</div>
            <div style={styles.modeDescription}>Affrontez un ami sur le même écran</div>
          </div>
        </div>
        
        <div 
          style={{
            ...styles.modeCard,
            ...(selectedMode === 'bot' ? styles.modeCardSelected : {})
          }}
          onClick={() => handleModeSelect('bot')}
        >
          <div style={styles.modeIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              <circle cx="12" cy="15" r="1"></circle>
            </svg>
          </div>
          <div style={styles.modeOverlay}>
            <div style={styles.modeName}>1 vs Bot</div>
            <div style={styles.modeDescription}>Défiez l'intelligence artificielle</div>
          </div>
        </div>
        
        <div 
          style={{
            ...styles.modeCard,
            ...(selectedMode === 'online' ? styles.modeCardSelected : {})
          }}
          onClick={() => handleModeSelect('online')}
        >
          <div style={styles.modeIcon}>
            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
          </div>
          <div style={styles.modeOverlay}>
            <div style={styles.modeName}>1 vs 1 Online</div>
            <div style={styles.modeDescription}>Jouez contre des adversaires en ligne</div>
          </div>
        </div>
      </div>
      
      <button 
        style={{
          ...styles.playButton,
          ...(!selectedMode ? styles.playButtonDisabled : {})
        }}
        disabled={!selectedMode}
        onClick={handlePlay}
      >
        CONTINUER
      </button>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: '900px',
    width: '100%',
    textAlign: 'center',
    margin: '0 auto',
    padding: '20px',
    position: 'relative',
    zIndex: 1,
  },
  title: {
    fontSize: '2.8rem',
    marginBottom: '10px',
    textShadow: '0 0 10px #ff6600, 0 0 20px #ff3300',
    letterSpacing: '1.5px',
    color: 'white',
  },
  subtitle: {
    fontSize: '1.2rem',
    marginBottom: '15px',
    color: '#ffcc00',
  },
  modesContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '30px',
    margin: '40px 0',
    flexWrap: 'wrap',
  },
  modeCard: {
    width: '250px',
    height: '300px',
    borderRadius: '15px',
    overflow: 'hidden',
    position: 'relative',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
    transition: 'all 0.3s ease',
    background: 'linear-gradient(135deg, #1e3c72, #2a5298)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  modeCardSelected: {
    transform: 'scale(1.05)',
    boxShadow: '0 0 20px #00ccff, 0 0 30px rgba(0, 200, 255, 0.7)',
    border: '3px solid #00ccff',
  },
  modeIcon: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  modeOverlay: {
    background: 'rgba(0, 0, 0, 0.7)',
    padding: '20px',
  },
  modeName: {
    fontSize: '1.6rem',
    fontWeight: 'bold',
    color: 'white',
    marginBottom: '10px',
  },
  modeDescription: {
    fontSize: '1rem',
    color: '#ddd',
  },
  playButton: {
    background: 'linear-gradient(to right, #ff8c00, #ff6600)',
    color: 'white',
    border: 'none',
    padding: '15px 40px',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    borderRadius: '30px',
    cursor: 'pointer',
    marginTop: '20px',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(255, 102, 0, 0.4)',
    position: 'relative',
    zIndex: 2,
  },
  playButtonDisabled: {
    opacity: '0.6',
    cursor: 'not-allowed',
    background: 'linear-gradient(to right, #555, #333)',
  },
  notification: {
    position: 'fixed',
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '15px 30px',
    borderRadius: '8px',
    background: 'rgba(50, 50, 50, 0.9)',
    color: 'white',
    zIndex: 1000,
    opacity: 0,
    transition: 'opacity 0.3s ease',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)',
  },
  notificationShow: {
    opacity: 1,
  },
  notificationWarning: {
    background: 'rgba(200, 50, 50, 0.9)',
  },
  notificationContainer: {
    position: 'relative',
    height: '40px',
    marginBottom: '20px'
  }
};

export default ModeSelectionPage;
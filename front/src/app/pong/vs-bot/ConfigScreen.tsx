import React, { useState } from 'react';

const styles = {
  configScreen: {
    backgroundColor: 'rgba(22, 33, 62, 0.8)',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0 0 20px rgba(76, 201, 240, 0.5)',
    width: '400px',
    maxWidth: '90%',
    textAlign: 'center',
  },
  configTitle: {
    fontSize: '1.8rem',
    marginBottom: '20px',
    color: '#4cc9f0',
  },
  configForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '15px',
  },
  label: {
    marginBottom: '5px',
    color: '#e6e6e6',
    textAlign: 'left',
  },
  colorInput: {
    width: '100%',
    padding: '8px',
    borderRadius: '5px',
    border: '1px solid #4cc9f0',
    backgroundColor: 'rgba(26, 26, 46, 0.7)',
    color: '#e6e6e6',
  },
  rangeInput: {
    width: '100%',
  },
  rangeValue: {
    display: 'inline-block',
    minWidth: '30px',
    textAlign: 'center',
    color: '#4cc9f0',
    fontWeight: 'bold',
  },
  botToggle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '15px 0',
  },
  toggleLabel: {
    marginLeft: '10px',
    fontSize: '1rem',
    color: '#e6e6e6',
  },
  startButton: {
    padding: '15px 40px',
    fontSize: '1.2rem',
    backgroundColor: '#4cc9f0',
    color: '#16213e',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold',
    marginTop: '10px',
    transition: 'all 0.3s',
    boxShadow: '0 0 15px rgba(76, 201, 240, 0.5)',
    '&:hover': {
      backgroundColor: '#3ab0d0',
      transform: 'scale(1.05)',
    }
  }
};

const ConfigScreen = ({ onConfigSubmit }) => {
  const [config, setConfig] = useState({
    leftPaddleColor: '#4cc9f0',
    rightPaddleColor: '#f72585',
    ballColor: '#ffffff',
    leftPaddleSpeed: 20,
    rightPaddleSpeed: 8,
    botEnabled: true, // Activé par défaut
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfigSubmit(config);
  };

  return (
    <div style={styles.configScreen}>
      <h2 style={styles.configTitle}>Configuration du jeu</h2>
      <form onSubmit={handleSubmit} style={styles.configForm}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Couleur raquette gauche:</label>
          <input
            type="color"
            name="leftPaddleColor"
            value={config.leftPaddleColor}
            onChange={handleChange}
            style={styles.colorInput}
          />
        </div>
        
        <div style={styles.inputGroup}>
          <label style={styles.label}>Couleur raquette droite:</label>
          <input
            type="color"
            name="rightPaddleColor"
            value={config.rightPaddleColor}
            onChange={handleChange}
            style={styles.colorInput}
          />
        </div>
        
        <div style={styles.inputGroup}>
          <label style={styles.label}>Couleur de la balle:</label>
          <input
            type="color"
            name="ballColor"
            value={config.ballColor}
            onChange={handleChange}
            style={styles.colorInput}
          />
        </div>
        
        <div style={styles.inputGroup}>
          <label style={styles.label}>
            Vitesse raquette gauche: <span style={styles.rangeValue}>{config.leftPaddleSpeed}</span>
          </label>
          <input
            type="range"
            name="leftPaddleSpeed"
            min="5"
            max="15"
            value={config.leftPaddleSpeed}
            onChange={handleChange}
            style={styles.rangeInput}
          />
        </div>
        
        <div style={styles.botToggle}>
          <input
            type="checkbox"
            id="botEnabled"
            name="botEnabled"
            checked={config.botEnabled}
            onChange={handleChange}
          />
          <label htmlFor="botEnabled" style={styles.toggleLabel}>
            Activer le bot (Joueur 2)
          </label>
        </div>
        
        <button type="submit" style={styles.startButton}>
          Démarrer le jeu
        </button>
      </form>
    </div>
  );
};

export default ConfigScreen;
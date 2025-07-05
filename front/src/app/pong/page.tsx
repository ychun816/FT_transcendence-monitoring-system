"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#1a1a2e',
    color: '#e6e6e6',
    fontFamily: 'Arial, sans-serif',
    padding: '20px',
    position: 'relative',
    overflow: 'hidden',
  },
  title: {
    fontSize: '2.5rem',
    marginBottom: '40px',
    color: '#4cc9f0',
    textShadow: '0 0 10px rgba(76, 201, 240, 0.7)',
    zIndex: 2,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: '1.2rem',
    marginBottom: '30px',
    color: '#f72585',
    textAlign: 'center',
    maxWidth: '800px',
  },
  modesContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '25px',
    width: '100%',
    maxWidth: '1200px',
    zIndex: 2,
  },
  gameMode: {
    position: 'relative',
    padding: '25px',
    borderRadius: '15px',
    overflow: 'hidden',
    border: '2px solid #4cc9f0',
    backgroundColor: 'rgba(22, 33, 62, 0.7)',
    boxShadow: '0 0 15px rgba(76, 201, 240, 0.4)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    minHeight: '180px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 0 25px rgba(247, 37, 133, 0.7)',
      borderColor: '#f72585',
      backgroundColor: 'rgba(26, 26, 46, 0.8)',
    }
  },
  modeTitle: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#fff',
    textShadow: '0 0 8px rgba(76, 201, 240, 0.9)',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  modeIcon: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    backgroundColor: '#f72585',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1rem',
  },
  modeDescription: {
    fontSize: '0.95rem',
    color: '#e6e6e6',
    lineHeight: '1.5',
  },
  modeBadge: {
    position: 'absolute',
    top: '10px',
    right: '10px',
    padding: '5px 10px',
    borderRadius: '15px',
    fontSize: '0.8rem',
    fontWeight: 'bold',
    backgroundColor: '#4cc9f0',
    color: '#16213e',
  },
  animatedBall: {
    position: 'absolute',
    borderRadius: '50%',
    boxShadow: '0 0 15px rgba(247, 37, 133, 0.7)',
    zIndex: 1,
  },
};

export default function PongModesPage() {
  const router = useRouter();

  const [balls] = useState(() => {
    return Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 50 + 20,
      color: i % 3 === 0 ? '#4cc9f0' : i % 3 === 1 ? '#f72585' : '#9d4edd',
    }));
  });

  const gameModes = [
    {
      title: "Pong vs Bot",
      description: "Affrontez une intelligence artificielle dans un duel en 1vs1. Choisissez le niveau de difficulté.",
      path: "/pong/vs-bot",
      badge: "Solo"
    },
    {
      title: "1 vs 1 Local",
      description: "Duel classique à deux joueurs sur le même appareil. Joueur 1 contre Joueur 2.",
      path: "/pong/1vs1-local",
      badge: "Local"
    },
    {
      title: "2 vs 2 Local",
      description: "Match en équipe à quatre joueurs sur le même appareil. Deux contre deux sur le même écran.",
      path: "/pong/2vs2-local",
      badge: "Local"
    },
    {
      title: "1 vs 1 En Ligne",
      description: "Affrontez un adversaire aléatoire ou un ami en ligne.",
      path: "/pong/1vs1-online",
      badge: "En Ligne"
    },
    {
      title: "2 vs 2 En Ligne",
      description: "Formez une équipe avec un ami et affrontez d'autres duos en ligne. Coordination requise!",
      path: "/pong/2vs2-online",
      badge: "En Ligne"
    },
    {
      title: "Tournoi de Pong",
      description: "Participez à un tournoi éliminatoire avec jusqu'à 16 joueurs.",
      path: "/pong/tournament",
      badge: "En Ligne"
    }
  ];

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Modes de Jeu Pong</h1>
      <p style={styles.subtitle}>
        Choisissez votre mode de jeu préféré et plongez dans l'expérience ultime de Pong!
      </p>
      
      <div style={styles.modesContainer}>
        {gameModes.map((mode, index) => (
          <div 
            key={index}
            style={styles.gameMode}
            onClick={() => router.push(mode.path)}
          >
            <div style={styles.modeBadge}>{mode.badge}</div>
            <h2 style={styles.modeTitle}>
              <span style={styles.modeIcon}>{index + 1}</span>
              {mode.title}
            </h2>
            <p style={styles.modeDescription}>{mode.description}</p>
          </div>
        ))}
      </div>
      
      {/* Balles animées en arrière-plan */}
      {balls.map(ball => (
        <div
          key={ball.id}
          style={{
            ...styles.animatedBall,
            left: `${ball.x}%`,
            top: `${ball.y}%`,
            width: ball.size,
            height: ball.size,
            backgroundColor: `rgba(${
              ball.color === '#4cc9f0' ? '76, 201, 240' : 
              ball.color === '#f72585' ? '247, 37, 133' : '157, 78, 221'
            }, ${0.2 + Math.random() * 0.3})`,
            animation: `move${ball.id} ${15 + Math.random() * 20}s infinite alternate ease-in-out`,
          }}
        />
      ))}
      
      <style jsx global>{`
        @keyframes float {
          0% { transform: translate(0, 0); }
          100% { transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px); }
        }
        
        ${balls.map((ball, i) => `
          @keyframes move${i} {
            0% { transform: translate(0, 0); }
            100% { transform: translate(${Math.random() * 200 - 100}px, ${Math.random() * 200 - 100}px); }
          }
        `).join('')}
      `}</style>
    </div>
  );
}
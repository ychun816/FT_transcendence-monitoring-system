"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const TournamentPage = () => {
  const router = useRouter();
  
  const [players] = useState([
    { id: 1, name: 'Alex Martin', avatar: 'AM' },
    { id: 2, name: 'Sophie Dubois', avatar: 'SD' },
    { id: 3, name: 'Jean Dupont', avatar: 'JD' },
    { id: 4, name: 'Marie Curie', avatar: 'MC' },
    { id: 5, name: 'Thomas Edison', avatar: 'TE' },
    { id: 6, name: 'Camille Rousseau', avatar: 'CR' },
    { id: 7, name: 'Lucas Bernard', avatar: 'LB' },
    { id: 8, name: 'Emma Laurent', avatar: 'EL' }
  ]);
  
  const [matches, setMatches] = useState([
    { id: 1, round: 'quart', player1Id: 1, player2Id: 2, winnerId: null, score: null },
    { id: 2, round: 'quart', player1Id: 3, player2Id: 4, winnerId: null, score: null },
    { id: 3, round: 'quart', player1Id: 5, player2Id: 6, winnerId: null, score: null },
    { id: 4, round: 'quart', player1Id: 7, player2Id: 8, winnerId: null, score: null },
    { id: 5, round: 'demi', player1Id: null, player2Id: null, winnerId: null, score: null },
    { id: 6, round: 'demi', player1Id: null, player2Id: null, winnerId: null, score: null },
    { id: 7, round: 'finale', player1Id: null, player2Id: null, winnerId: null, score: null }
  ]);
  
  const [activeMatch, setActiveMatch] = useState<number | null>(null);
  const [scores, setScores] = useState<{[key: number]: [number, number]}>({});
  const [tournamentWinner, setTournamentWinner] = useState<number | null>(null);
  
  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    color: '#e6e6e6',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    position: 'relative',
    overflow: 'hidden'
  };

  const cardStyle = {
    background: 'rgba(30, 30, 46, 0.7)',
    borderRadius: '15px',
    padding: '25px',
    marginBottom: '25px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(76, 201, 240, 0.2)',
    zIndex: 2,
    position: 'relative'
  };

  const buttonStyle = {
    background: 'linear-gradient(45deg, #4cc9f0, #4361ee)',
    border: 'none',
    color: 'white',
    padding: '12px 25px',
    borderRadius: '50px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
  };

  const [balls] = useState(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 50 + 30,
      speedX: (Math.random() - 0.5) * 0.8,
      speedY: (Math.random() - 0.5) * 0.8,
      color: i % 2 === 0 ? '#4cc9f0' : '#f72585',
    }));
  });

  useEffect(() => {
    const updatedMatches = [...matches];
    
    updatedMatches[4] = {
      ...updatedMatches[4],
      player1Id: getMatchWinner(1),
      player2Id: getMatchWinner(2)
    };
    
    updatedMatches[5] = {
      ...updatedMatches[5],
      player1Id: getMatchWinner(3),
      player2Id: getMatchWinner(4)
    };
    
    updatedMatches[6] = {
      ...updatedMatches[6],
      player1Id: getMatchWinner(5),
      player2Id: getMatchWinner(6)
    };
    
    const finalWinner = getMatchWinner(7);
    if (finalWinner) {
      setTournamentWinner(finalWinner);
    }
    
    setMatches(updatedMatches);
  }, [scores]);

  const getMatchWinner = (matchId: number) => {
    const match = matches.find(m => m.id === matchId);
    if (!match || !scores[matchId]) return null;
    
    const [score1, score2] = scores[matchId];
    return score1 > score2 ? match.player1Id : match.player2Id;
  };

  const getPlayer = (playerId: number | null) => {
    if (!playerId) return null;
    return players.find(p => p.id === playerId);
  };

  const recordScore = (matchId: number, score1: number, score2: number) => {
    if (score1 < 0 || score2 < 0) return;
    
    setScores(prev => ({
      ...prev,
      [matchId]: [score1, score2]
    }));
    setActiveMatch(null);
  };

  const renderMatch = (match: any) => {
    const player1 = getPlayer(match.player1Id);
    const player2 = getPlayer(match.player2Id);
    const matchScore = scores[match.id];
    const winnerId = getMatchWinner(match.id);
    
    return (
      <div 
        key={match.id}
        style={{
          background: 'rgba(22, 33, 62, 0.5)',
          borderRadius: '10px',
          padding: '15px',
          margin: '10px 0',
          border: activeMatch === match.id 
            ? '2px solid #f72585' 
            : winnerId 
              ? '2px solid #4cf06e' 
              : '1px solid rgba(76, 201, 240, 0.3)',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          position: 'relative',
          zIndex: 2
        }}
        onClick={() => !matchScore && setActiveMatch(match.id)}
      >
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '5px'
        }}>
          <span style={{ fontSize: '0.8rem', color: '#4cc9f0' }}>
            Match {match.id} • {match.round === 'quart' ? 'Quart de finale' : match.round === 'demi' ? 'Demi-finale' : 'Finale'}
          </span>
          {matchScore && (
            <span style={{ 
              fontSize: '0.8rem', 
              color: winnerId ? '#4cf06e' : '#f72585',
              fontWeight: 'bold'
            }}>
              {winnerId ? 'Terminé' : 'À venir'}
            </span>
          )}
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ 
              width: '30px', 
              height: '30px', 
              borderRadius: '50%', 
              background: player1 ? 'linear-gradient(45deg, #4cc9f0, #4361ee)' : 'rgba(76, 201, 240, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.9rem',
            }}>
              {player1 ? player1.avatar : '?'}
            </div>
            <span style={{ fontWeight: winnerId === player1?.id ? 'bold' : 'normal' }}>
              {player1 ? player1.name : 'À déterminer'}
            </span>
          </div>
          
          {matchScore ? (
            <div style={{ 
              display: 'flex', 
              gap: '10px', 
              fontWeight: 'bold',
              fontSize: '1.2rem'
            }}>
              <span style={{ 
                color: matchScore[0] > matchScore[1] ? '#4cf06e' : '#e6e6e6',
                minWidth: '20px',
                textAlign: 'center'
              }}>
                {matchScore[0]}
              </span>
              <span>-</span>
              <span style={{ 
                color: matchScore[1] > matchScore[0] ? '#4cf06e' : '#e6e6e6',
                minWidth: '20px',
                textAlign: 'center'
              }}>
                {matchScore[1]}
              </span>
            </div>
          ) : (
            <span style={{ color: '#aaa' }}>VS</span>
          )}
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontWeight: winnerId === player2?.id ? 'bold' : 'normal' }}>
              {player2 ? player2.name : 'À déterminer'}
            </span>
            <div style={{ 
              width: '30px', 
              height: '30px', 
              borderRadius: '50%', 
              background: player2 ? 'linear-gradient(45deg, #4cc9f0, #4361ee)' : 'rgba(76, 201, 240, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.9rem',
            }}>
              {player2 ? player2.avatar : '?'}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={containerStyle}>
      {}
      {balls.map(ball => (
        <div
          key={ball.id}
          style={{
            position: 'absolute',
            borderRadius: '50%',
            left: `${ball.x}%`,
            top: `${ball.y}%`,
            width: ball.size,
            height: ball.size,
            backgroundColor: `rgba(${ball.color === '#4cc9f0' ? '76, 201, 240' : '247, 37, 133'}, ${0.2 + Math.random() * 0.3})`,
            animation: `move${ball.id} ${15 + Math.random() * 20}s infinite alternate ease-in-out`,
            zIndex: 1,
          }}
        />
      ))}
      
      <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '2.5rem', color: '#4cc9f0', textShadow: '0 0 10px rgba(76, 201, 240, 0.7)' }}>
            Tournoi Pong 1vs1
          </h1>
          <button 
            onClick={() => router.push('/')}
            style={{
              ...buttonStyle,
              background: 'rgba(247, 37, 133, 0.2)',
              border: '1px solid rgba(247, 37, 133, 0.5)'
            }}
          >
            Retour à l'accueil
          </button>
        </div>

        <div style={{ ...cardStyle, marginBottom: '30px' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '20px',
            marginTop: '20px'
          }}>
            {}
            <div>
              <h3 style={{ color: '#4cc9f0', marginBottom: '15px', textAlign: 'center' }}>Quarts de finale</h3>
              {matches.filter(m => m.round === 'quart').map(renderMatch)}
            </div>
            
            {}
            <div>
              <h3 style={{ color: '#4cc9f0', marginBottom: '15px', textAlign: 'center' }}>Demi-finales</h3>
              {matches.filter(m => m.round === 'demi').map(renderMatch)}
            </div>
            
            {}
            <div>
              <h3 style={{ color: '#4cc9f0', marginBottom: '15px', textAlign: 'center' }}>Finale</h3>
              {matches.filter(m => m.round === 'finale').map(renderMatch)}
              
              {tournamentWinner && (
                <div style={{ 
                  background: 'rgba(76, 240, 110, 0.1)', 
                  border: '2px solid #4cf06e',
                  borderRadius: '10px',
                  padding: '20px',
                  marginTop: '20px',
                  textAlign: 'center'
                }}>
                  <h3 style={{ color: '#4cf06e', marginBottom: '10px' }}>Vainqueur du tournoi</h3>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
                    <div style={{ 
                      width: '50px', 
                      height: '50px', 
                      borderRadius: '50%', 
                      background: 'linear-gradient(45deg, #4cc9f0, #4361ee)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2rem',
                    }}>
                      {getPlayer(tournamentWinner)?.avatar}
                    </div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                      {getPlayer(tournamentWinner)?.name}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {}
        {activeMatch !== null && (
          <div style={cardStyle}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              Enregistrer le score
            </h2>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '30px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ 
                  width: '50px', 
                  height: '50px', 
                  borderRadius: '50%', 
                  background: 'linear-gradient(45deg, #4cc9f0, #4361ee)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                }}>
                  {getPlayer(matches.find(m => m.id === activeMatch)?.player1Id)?.avatar}
                </div>
                <div>
                  <div style={{ fontWeight: 'bold' }}>
                    {getPlayer(matches.find(m => m.id === activeMatch)?.player1Id)?.name}
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                <input
                  type="number"
                  min="0"
                  value={scores[activeMatch]?.[0] || 0}
                  onChange={(e) => {
                    const newScore = parseInt(e.target.value) || 0;
                    setScores(prev => ({
                      ...prev,
                      [activeMatch]: [newScore, prev[activeMatch]?.[1] || 0]
                    }));
                  }}
                  style={{
                    width: '70px',
                    padding: '12px',
                    borderRadius: '10px',
                    border: '1px solid rgba(76, 201, 240, 0.3)',
                    background: 'rgba(22, 33, 62, 0.5)',
                    color: '#fff',
                    fontSize: '18px',
                    textAlign: 'center'
                  }}
                />
                <span style={{ fontSize: '1.5rem' }}>-</span>
                <input
                  type="number"
                  min="0"
                  value={scores[activeMatch]?.[1] || 0}
                  onChange={(e) => {
                    const newScore = parseInt(e.target.value) || 0;
                    setScores(prev => ({
                      ...prev,
                      [activeMatch]: [prev[activeMatch]?.[0] || 0, newScore]
                    }));
                  }}
                  style={{
                    width: '70px',
                    padding: '12px',
                    borderRadius: '10px',
                    border: '1px solid rgba(76, 201, 240, 0.3)',
                    background: 'rgba(22, 33, 62, 0.5)',
                    color: '#fff',
                    fontSize: '18px',
                    textAlign: 'center'
                  }}
                />
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div>
                  <div style={{ fontWeight: 'bold' }}>
                    {getPlayer(matches.find(m => m.id === activeMatch)?.player2Id)?.name}
                  </div>
                </div>
                <div style={{ 
                  width: '50px', 
                  height: '50px', 
                  borderRadius: '50%', 
                  background: 'linear-gradient(45deg, #4cc9f0, #4361ee)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                }}>
                  {getPlayer(matches.find(m => m.id === activeMatch)?.player2Id)?.avatar}
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
              <button 
                style={{ 
                  ...buttonStyle,
                  background: 'rgba(247, 37, 133, 0.2)',
                  border: '1px solid rgba(247, 37, 133, 0.5)'
                }}
                onClick={() => setActiveMatch(null)}
              >
                Annuler
              </button>
              <button 
                style={{ 
                  ...buttonStyle,
                  background: 'linear-gradient(45deg, #4cc9f0, #4361ee)',
                }}
                onClick={() => {
                  const score1 = scores[activeMatch]?.[0] || 0;
                  const score2 = scores[activeMatch]?.[1] || 0;
                  recordScore(activeMatch, score1, score2);
                }}
              >
                Enregistrer le score
              </button>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes float {
          0% { transform: translate(0, 0); }
          100% { transform: translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px); }
        }
        
        ${balls.map(ball => `
          @keyframes move${ball.id} {
            0% { transform: translate(0, 0); }
            100% { transform: translate(${Math.random() * 200 - 100}px, ${Math.random() * 200 - 100}px); }
          }
        `).join('')}
      `}</style>
    </div>
  );
};

export default TournamentPage;
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiUser, FiMail, FiLock, FiUsers, FiUserPlus, FiSettings, FiCheck, FiX } from 'react-icons/fi';

const ProfilePage = () => {
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);
  
  const [email, setEmail] = useState('user@example.com');
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [friendRequests, setFriendRequests] = useState([
    { id: 1, name: 'Alex Martin', avatar: null, mutualFriends: 5 },
    { id: 2, name: 'Sophie Dubois', avatar: null, mutualFriends: 3 },
  ]);
  
  const [friends, setFriends] = useState([
    { id: 1, name: 'Jean Dupont', avatar: null, online: true },
    { id: 2, name: 'Marie Curie', avatar: null, online: false },
    { id: 3, name: 'Thomas Edison', avatar: null, online: true },
  ]);
  
  const [searchResults, setSearchResults] = useState([
    { id: 1, name: 'Camille Rousseau', avatar: null, mutualFriends: 2 },
    { id: 2, name: 'Lucas Bernard', avatar: null, mutualFriends: 4 },
  ]);

  const handleEmailChange = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setEmail(newEmail);
      setNewEmail('');
      setIsLoading(false);
      alert('Adresse email mise à jour avec succès!');
    }, 1000);
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('Les mots de passe ne correspondent pas!');
      return;
    }
    
    setIsLoading(true);
    setTimeout(() => {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setIsLoading(false);
      alert('Mot de passe mis à jour avec succès!');
    }, 1000);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchResults([
      { id: 1, name: 'Camille Rousseau', avatar: null, mutualFriends: 2 },
      { id: 2, name: 'Lucas Bernard', avatar: null, mutualFriends: 4 },
      { id: 3, name: searchQuery, avatar: null, mutualFriends: 0 },
    ]);
  };

  const sendFriendRequest = (id: number) => {
    alert(`Demande d'ami envoyée à ${searchResults.find(u => u.id === id)?.name}`);
    setSearchResults(searchResults.filter(u => u.id !== id));
  };

  const acceptFriendRequest = (id: number) => {
    const request = friendRequests.find(r => r.id === id);
    if (request) {
      setFriends([...friends, { id: Date.now(), name: request.name, avatar: null, online: true }]);
      setFriendRequests(friendRequests.filter(r => r.id !== id));
      alert(`Vous êtes maintenant ami avec ${request.name}!`);
    }
  };

  const declineFriendRequest = (id: number) => {
    setFriendRequests(friendRequests.filter(r => r.id !== id));
  };

  const containerStyle = {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    color: '#e6e6e6',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  };

  const cardStyle = {
    background: 'rgba(30, 30, 46, 0.7)',
    borderRadius: '15px',
    padding: '25px',
    marginBottom: '25px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(76, 201, 240, 0.2)',
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

  const inputStyle = {
    width: '100%',
    padding: '14px',
    borderRadius: '10px',
    border: '1px solid rgba(76, 201, 240, 0.3)',
    background: 'rgba(22, 33, 62, 0.5)',
    color: '#fff',
    marginBottom: '15px',
    fontSize: '16px',
  };

  return (
    <div style={containerStyle}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '2.5rem', color: '#4cc9f0', textShadow: '0 0 10px rgba(76, 201, 240, 0.7)' }}>
            Mon Profil
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

        {/* Navigation par onglets */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', flexWrap: 'wrap' }}>
          <button 
            style={{ 
              ...buttonStyle, 
              background: activeTab === 'profile' ? 'rgba(76, 201, 240, 0.3)' : 'rgba(76, 201, 240, 0.1)',
              padding: '10px 20px',
            }}
            onClick={() => setActiveTab('profile')}
          >
            <FiUser /> Profil
          </button>
          <button 
            style={{ 
              ...buttonStyle, 
              background: activeTab === 'email' ? 'rgba(247, 37, 133, 0.3)' : 'rgba(247, 37, 133, 0.1)',
              padding: '10px 20px',
            }}
            onClick={() => setActiveTab('email')}
          >
            <FiMail /> Changer l'email
          </button>
          <button 
            style={{ 
              ...buttonStyle, 
              background: activeTab === 'password' ? 'rgba(106, 76, 240, 0.3)' : 'rgba(106, 76, 240, 0.1)',
              padding: '10px 20px',
            }}
            onClick={() => setActiveTab('password')}
          >
            <FiLock /> Changer le mot de passe
          </button>
          <button 
            style={{ 
              ...buttonStyle, 
              background: activeTab === 'friends' ? 'rgba(76, 240, 110, 0.3)' : 'rgba(76, 240, 110, 0.1)',
              padding: '10px 20px',
            }}
            onClick={() => setActiveTab('friends')}
          >
            <FiUsers /> Amis
          </button>
        </div>

        {/* Section Profil */}
        {activeTab === 'profile' && (
          <div style={cardStyle}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FiUser /> Informations du compte
            </h2>
            
            <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '250px' }}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#4cc9f0' }}>Nom complet</label>
                  <div style={{ padding: '12px', background: 'rgba(22, 33, 62, 0.5)', borderRadius: '8px' }}>
                    John Doe
                  </div>
                </div>
                
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#4cc9f0' }}>Adresse email</label>
                  <div style={{ padding: '12px', background: 'rgba(22, 33, 62, 0.5)', borderRadius: '8px' }}>
                    {email}
                  </div>
                </div>
                
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: '#4cc9f0' }}>Date d'inscription</label>
                  <div style={{ padding: '12px', background: 'rgba(22, 33, 62, 0.5)', borderRadius: '8px' }}>
                    15 janvier 2023
                  </div>
                </div>
              </div>
              
              <div style={{ flex: 1, minWidth: '250px' }}>
                <div style={{ 
                  width: '120px', 
                  height: '120px', 
                  borderRadius: '50%', 
                  background: 'linear-gradient(45deg, #4cc9f0, #4361ee)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 25px',
                  fontSize: '3rem',
                }}>
                  JD
                </div>
                
                <button 
                  style={{ 
                    ...buttonStyle, 
                    width: '100%',
                    background: 'rgba(76, 201, 240, 0.2)',
                    border: '1px solid rgba(76, 201, 240, 0.5)'
                  }}
                >
                  <FiSettings /> Modifier l'avatar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Section Changer l'email */}
        {activeTab === 'email' && (
          <div style={cardStyle}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FiMail /> Changer l'adresse email
            </h2>
            
            <div style={{ marginBottom: '20px', padding: '15px', background: 'rgba(247, 37, 133, 0.1)', borderRadius: '10px' }}>
              <p><strong>Email actuel:</strong> {email}</p>
            </div>
            
            <form onSubmit={handleEmailChange}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#f72585' }}>Nouvelle adresse email</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                  style={inputStyle}
                  placeholder="Entrez votre nouvelle adresse email"
                />
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#f72585' }}>Confirmez votre mot de passe</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  style={inputStyle}
                  placeholder="Entrez votre mot de passe actuel"
                />
              </div>
              
              <button 
                type="submit" 
                style={{ 
                  ...buttonStyle,
                  background: 'linear-gradient(45deg, #f72585, #b5179e)',
                  opacity: isLoading ? 0.7 : 1,
                  cursor: isLoading ? 'not-allowed' : 'pointer'
                }}
                disabled={isLoading}
              >
                {isLoading ? 'Traitement en cours...' : 'Mettre à jour mon email'}
              </button>
            </form>
          </div>
        )}

        {/* Section Changer le mot de passe */}
        {activeTab === 'password' && (
          <div style={cardStyle}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FiLock /> Changer le mot de passe
            </h2>
            
            <form onSubmit={handlePasswordChange}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#7209b7' }}>Mot de passe actuel</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  style={inputStyle}
                  placeholder="Entrez votre mot de passe actuel"
                />
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#7209b7' }}>Nouveau mot de passe</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  style={inputStyle}
                  placeholder="Entrez votre nouveau mot de passe"
                />
              </div>
              
              <div style={{ marginBottom: '25px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#7209b7' }}>Confirmez le nouveau mot de passe</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  style={inputStyle}
                  placeholder="Confirmez votre nouveau mot de passe"
                />
              </div>
              
              <button 
                type="submit" 
                style={{ 
                  ...buttonStyle,
                  background: 'linear-gradient(45deg, #7209b7, #560bad)',
                  opacity: isLoading ? 0.7 : 1,
                  cursor: isLoading ? 'not-allowed' : 'pointer'
                }}
                disabled={isLoading}
              >
                {isLoading ? 'Traitement en cours...' : 'Mettre à jour mon mot de passe'}
              </button>
            </form>
          </div>
        )}

        {/* Section Amis */}
        {activeTab === 'friends' && (
          <div style={cardStyle}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FiUsers /> Gérer mes relations
            </h2>
            
            {/* Recherche d'amis */}
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ fontSize: '1.4rem', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FiUserPlus /> Ajouter des amis
              </h3>
              
              <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ ...inputStyle, marginBottom: 0 }}
                  placeholder="Rechercher par nom ou email"
                />
                <button 
                  type="submit" 
                  style={{ 
                    ...buttonStyle, 
                    background: 'linear-gradient(45deg, #4cc9f0, #4361ee)',
                    padding: '10px 20px',
                  }}
                >
                  Rechercher
                </button>
              </form>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
                {searchResults.map(user => (
                  <div key={user.id} style={{ 
                    background: 'rgba(22, 33, 62, 0.5)', 
                    padding: '15px', 
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px'
                  }}>
                    <div style={{ 
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '50%', 
                      background: 'linear-gradient(45deg, #4cc9f0, #4361ee)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2rem',
                    }}>
                      {user.name.charAt(0)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'bold' }}>{user.name}</div>
                      <div style={{ fontSize: '0.9rem', color: '#aaa' }}>
                        {user.mutualFriends} ami{user.mutualFriends > 1 ? 's' : ''} en commun
                      </div>
                    </div>
                    <button 
                      onClick={() => sendFriendRequest(user.id)}
                      style={{ 
                        background: 'rgba(76, 240, 110, 0.2)', 
                        border: '1px solid rgba(76, 240, 110, 0.5)',
                        borderRadius: '50%',
                        width: '35px',
                        height: '35px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      <FiUserPlus style={{ color: '#4cf06e' }} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Demandes d'amis en attente */}
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ fontSize: '1.4rem', marginBottom: '15px' }}>Demandes d'amis ({friendRequests.length})</h3>
              
              {friendRequests.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#aaa' }}>
                  Aucune demande d'ami en attente
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
                  {friendRequests.map(request => (
                    <div key={request.id} style={{ 
                      background: 'rgba(22, 33, 62, 0.5)', 
                      padding: '15px', 
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '15px'
                    }}>
                      <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '50%', 
                        background: 'linear-gradient(45deg, #f72585, #b5179e)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2rem',
                      }}>
                        {request.name.charAt(0)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'bold' }}>{request.name}</div>
                        <div style={{ fontSize: '0.9rem', color: '#aaa' }}>
                          {request.mutualFriends} ami{request.mutualFriends > 1 ? 's' : ''} en commun
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <button 
                          onClick={() => acceptFriendRequest(request.id)}
                          style={{ 
                            background: 'rgba(76, 240, 110, 0.2)', 
                            border: '1px solid rgba(76, 240, 110, 0.5)',
                            borderRadius: '50%',
                            width: '35px',
                            height: '35px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                          }}
                        >
                          <FiCheck style={{ color: '#4cf06e' }} />
                        </button>
                        <button 
                          onClick={() => declineFriendRequest(request.id)}
                          style={{ 
                            background: 'rgba(247, 37, 133, 0.2)', 
                            border: '1px solid rgba(247, 37, 133, 0.5)',
                            borderRadius: '50%',
                            width: '35px',
                            height: '35px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                          }}
                        >
                          <FiX style={{ color: '#f72585' }} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Liste d'amis */}
            <div>
              <h3 style={{ fontSize: '1.4rem', marginBottom: '15px' }}>Mes amis ({friends.length})</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
                {friends.map(friend => (
                  <div key={friend.id} style={{ 
                    background: 'rgba(22, 33, 62, 0.5)', 
                    padding: '15px', 
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    position: 'relative'
                  }}>
                    <div style={{ 
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '50%', 
                      background: 'linear-gradient(45deg, #4cc9f0, #4361ee)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.2rem',
                    }}>
                      {friend.name.charAt(0)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'bold' }}>{friend.name}</div>
                      <div style={{ fontSize: '0.9rem', color: friend.online ? '#4cf06e' : '#aaa' }}>
                        {friend.online ? 'En ligne' : 'Hors ligne'}
                      </div>
                    </div>
                    {friend.online && (
                      <div style={{
                        position: 'absolute',
                        top: '15px',
                        right: '15px',
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        background: '#4cf06e',
                        boxShadow: '0 0 10px rgba(76, 240, 110, 0.7)'
                      }} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
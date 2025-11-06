import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { matchesAPI, messagesAPI } from '../services/api';
import type { Message, MatchListItem } from '../services/api';
import { useAuth } from '../context/AuthContext';

const MessagesPage = () => {
  const [searchParams] = useSearchParams();
  const matchIdParam = searchParams.get('match');
  const [matches, setMatches] = useState<MatchListItem[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(
    matchIdParam ? parseInt(matchIdParam) : null
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageContent, setMessageContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadMatches();
  }, []);

  useEffect(() => {
    if (selectedMatchId) {
      loadMessages(selectedMatchId);
      // Auto-refresh messages every 5 seconds
      const interval = setInterval(() => {
        loadMessages(selectedMatchId);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedMatchId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMatches = async () => {
    try {
      setLoading(true);
      const response = await matchesAPI.getMatches();
      setMatches(response.data.matches);
      if (!selectedMatchId && response.data.matches.length > 0) {
        setSelectedMatchId(response.data.matches[0].match_id);
      }
    } catch (error) {
      console.error('Error loading matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (matchId: number) => {
    try {
      const response = await messagesAPI.getMessages(matchId);
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const getPhotoUrl = (url?: string) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${window.location.origin}${url}`;
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMatchId || !messageContent.trim() || sending) return;

    try {
      setSending(true);
      await messagesAPI.sendMessage(selectedMatchId, messageContent.trim());
      setMessageContent('');
      await loadMessages(selectedMatchId);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Messages</h1>
      </div>
      <div className="messages-layout" style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '24px', height: 'calc(100vh - 200px)' }}>
        {/* Matches List */}
        <div className="glass-card" style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 200px)' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div className="loader"></div>
            </div>
          ) : matches.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
              <p style={{ fontSize: '18px', marginBottom: '8px' }}>💑</p>
              <p>No matches yet</p>
              <p style={{ fontSize: '12px', marginTop: '8px' }}>Start swiping to find your match!</p>
            </div>
          ) : (
            matches.map((match) => {
              const photoUrl = getPhotoUrl(match.profile_picture_url);
              return (
                <div
                  key={match.match_id}
                  onClick={() => setSelectedMatchId(match.match_id)}
                  style={{
                    padding: '16px',
                    marginBottom: '12px',
                    cursor: 'pointer',
                    borderRadius: '12px',
                    background: selectedMatchId === match.match_id ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                    border: selectedMatchId === match.match_id ? '1px solid var(--glass-border)' : 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (selectedMatchId !== match.match_id) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedMatchId !== match.match_id) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <div
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                      background: photoUrl ? 'transparent' : 'linear-gradient(135deg, var(--primary-color), var(--primary-light))',
                      overflow: 'hidden',
                      flexShrink: 0,
                    }}
                  >
                    {photoUrl ? (
                      <img
                        src={photoUrl}
                        alt={`${match.first_name} ${match.last_name}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      '💑'
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>{match.first_name} {match.last_name}</h3>
                    {match.location_city && (
                      <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        📍 {match.location_city}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Chat Container */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {selectedMatchId ? (
            <>
              <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {messages.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                    <p style={{ fontSize: '18px', marginBottom: '8px' }}>💬</p>
                    <p>No messages yet</p>
                    <p style={{ fontSize: '12px', marginTop: '8px' }}>Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const showTimestamp = index === 0 || 
                      new Date(msg.created_at).getTime() - new Date(messages[index - 1].created_at).getTime() > 300000; // 5 minutes
                    return (
                      <div key={msg.id}>
                        {showTimestamp && (
                          <div style={{ textAlign: 'center', margin: '8px 0', fontSize: '11px', color: 'var(--text-secondary)' }}>
                            {formatTime(msg.created_at)}
                          </div>
                        )}
                        <div
                          style={{
                            maxWidth: '70%',
                            padding: '12px 16px',
                            borderRadius: '16px',
                            alignSelf: msg.sender_id === user?.id ? 'flex-end' : 'flex-start',
                            background: msg.sender_id === user?.id
                              ? 'linear-gradient(135deg, var(--primary-color), var(--primary-light))'
                              : 'rgba(255, 255, 255, 0.15)',
                            color: msg.sender_id === user?.id ? 'white' : 'var(--text-primary)',
                            wordWrap: 'break-word',
                          }}
                        >
                          {msg.content}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>
              <form onSubmit={sendMessage} style={{ padding: '20px', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '12px' }}>
                <input
                  type="text"
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder="Type a message..."
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    background: 'rgba(255, 255, 255, 0.15)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '12px',
                    color: 'var(--text-primary)',
                    fontFamily: 'inherit',
                  }}
                />
                <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '12px 24px' }} disabled={sending || !messageContent.trim()}>
                  {sending ? 'Sending...' : 'Send'}
                </button>
              </form>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
              <p>Select a match to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;


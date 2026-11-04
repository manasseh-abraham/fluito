import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Avatar from '../components/Avatar';
import SafetyActions from '../components/SafetyActions';
import { BackIcon, MoreIcon, SendIcon } from '../components/Icons';
import { matchesAPI, messagesAPI } from '../services/api';
import type { Message, MatchListItem } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';

const MessagesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const matchIdParam = searchParams.get('match');
  const [matches, setMatches] = useState<MatchListItem[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(
    matchIdParam ? parseInt(matchIdParam, 10) : null
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageContent, setMessageContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { showToast, ToastContainer } = useToast();
  const [safetyOpen, setSafetyOpen] = useState(false);

  useEffect(() => {
    const fromQuery = matchIdParam ? parseInt(matchIdParam, 10) : null;
    setSelectedMatchId(Number.isFinite(fromQuery) ? fromQuery : null);
  }, [matchIdParam]);

  useEffect(() => {
    void loadMatches();
  }, []);

  useEffect(() => {
    if (!selectedMatchId) {
      setMessages([]);
      return;
    }
    void loadMessages(selectedMatchId);
    const interval = setInterval(() => {
      void loadMessages(selectedMatchId);
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedMatchId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMatches = async () => {
    try {
      setLoading(true);
      const response = await matchesAPI.getMatches();
      setMatches(response.data.matches);
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

  const sendMessage = async (event: React.FormEvent) => {
    event.preventDefault();
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

  const openThread = (matchId: number) => {
    setSelectedMatchId(matchId);
    setSearchParams({ match: String(matchId) });
  };

  const closeThread = () => {
    setSelectedMatchId(null);
    setSearchParams({});
  };

  const selectedMatch = matches.find((item) => item.match_id === selectedMatchId) ?? null;

  if (selectedMatchId) {
    return (
      <div className="messages-screen">
        <ToastContainer />
        <div className="thread">
          <div className="thread-header">
            <button type="button" className="btn-icon" onClick={closeThread} aria-label="Back to messages">
              <BackIcon />
            </button>
            {selectedMatch && (
              <Avatar
                src={selectedMatch.profile_picture_url}
                name={`${selectedMatch.first_name} ${selectedMatch.last_name}`}
                size={36}
              />
            )}
            <strong>
              {selectedMatch ? `${selectedMatch.first_name} ${selectedMatch.last_name}` : 'Chat'}
            </strong>
            {selectedMatch && (
              <button
                type="button"
                className="btn-icon"
                aria-label="Block or report"
                onClick={() => setSafetyOpen(true)}
              >
                <MoreIcon size={18} />
              </button>
            )}
          </div>
          <div className="thread-log">
            {messages.length === 0 ? (
              <div className="centered-state">
                <p>Say hello — start the conversation.</p>
              </div>
            ) : (
              messages.map((msg, index) => {
                const showTimestamp =
                  index === 0 ||
                  new Date(msg.created_at).getTime() - new Date(messages[index - 1].created_at).getTime() >
                    300000;
                const mine = msg.sender_id === user?.id;
                return (
                  <div key={msg.id}>
                    {showTimestamp && <div className="msg-time">{formatTime(msg.created_at)}</div>}
                    <div className={`bubble-row${mine ? ' mine' : ''}`}>
                      <div className={`bubble${mine ? ' mine' : ' theirs'}`}>{msg.content}</div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
          <form className="composer" onSubmit={sendMessage}>
            <input
              type="text"
              value={messageContent}
              onChange={(event) => setMessageContent(event.target.value)}
              placeholder="Type a message..."
              autoComplete="off"
            />
            <button
              type="submit"
              className="send-btn"
              disabled={sending || !messageContent.trim()}
              aria-label="Send"
            >
              <SendIcon />
            </button>
          </form>
        </div>
        {safetyOpen && selectedMatch && (
          <SafetyActions
            displayName={`${selectedMatch.first_name} ${selectedMatch.last_name}`}
            matchId={selectedMatch.match_id}
            targetUserId={selectedMatch.other_user_id}
            onClose={() => setSafetyOpen(false)}
            onDone={(action) => {
              setSafetyOpen(false);
              showToast(action === 'reported' ? 'Report submitted and user blocked' : 'User blocked', 'info');
              closeThread();
              setMessages([]);
              void loadMatches();
            }}
          />
        )}
      </div>
    );
  }

  return (
    <div className="messages-screen">
      <ToastContainer />
      <div className="convo-list">
        <h1 className="screen-title">Messages</h1>
        {loading ? (
          <div className="centered-state">
            <div className="loader" />
          </div>
        ) : matches.length === 0 ? (
          <div className="centered-state">
            <h2>No messages yet</h2>
            <p>When you match, your conversations will land here.</p>
          </div>
        ) : (
          matches.map((match) => {
            const name = `${match.first_name} ${match.last_name}`;
            return (
              <button
                key={match.match_id}
                type="button"
                className="convo-item"
                onClick={() => openThread(match.match_id)}
              >
                <Avatar src={match.profile_picture_url} name={name} size={56} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <h3>{name}</h3>
                  <p>{match.bio || (match.location_city ? match.location_city : 'Say hello')}</p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MessagesPage;

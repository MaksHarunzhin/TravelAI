import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import api from './api';

const AuthContext = createContext(null);

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

// Роли пользователей (реализация RBAC)
const ROLES = {
  USER: 'user',
  MODERATOR: 'moderator',
  ADMIN: 'admin'
};

// Права доступа для ролей
const PERMISSIONS = {
  [ROLES.USER]: ['chat', 'view_places', 'leave_review'],
  [ROLES.MODERATOR]: ['chat', 'view_places', 'leave_review', 'moderate_reviews', 'view_reports'],
  [ROLES.ADMIN]: ['chat', 'view_places', 'leave_review', 'moderate_reviews', 'view_reports', 'manage_users', 'manage_places']
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('travel_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const result = await api.login(email, password);

    if (result.success && result.user) {
      setUser(result.user);
      localStorage.setItem('travel_user', JSON.stringify(result.user));
      if (result.token) {
        localStorage.setItem('travel_token', result.token);
      }
      return { success: true };
    }

    return { success: false, error: result.error || 'В разработке' };
  };

  const register = async (name, email, password) => {
    const result = await api.register(name, email, password);

    if (result.success && result.user) {
      setUser(result.user);
      localStorage.setItem('travel_user', JSON.stringify(result.user));
      return { success: true };
    }

    return { success: false, error: result.error || 'В разработке' };
  };

  const logout = async () => {
    await api.logout();
    setUser(null);
    localStorage.removeItem('travel_user');
    localStorage.removeItem('travel_token');
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    return PERMISSIONS[user.role]?.includes(permission) || false;
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, hasPermission, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// ============================================
// COMPONENTS: Icons
// ============================================

const Icons = {
  Send: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
    </svg>
  ),
  User: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  Shield: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  ),
  Map: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  Star: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  ),
  Check: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <path d="M20 6L9 17l-5-5"/>
    </svg>
  ),
  X: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <path d="M18 6L6 18M6 6l12 12"/>
    </svg>
  ),
  Menu: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 12h18M3 6h18M3 18h18"/>
    </svg>
  ),
  Logout: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
    </svg>
  ),
  Bot: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="11" width="18" height="10" rx="2"/>
      <circle cx="12" cy="5" r="2"/>
      <path d="M12 7v4"/>
      <circle cx="8" cy="16" r="1" fill="currentColor"/>
      <circle cx="16" cy="16" r="1" fill="currentColor"/>
    </svg>
  )
};

// ============================================
// COMPONENTS: Auth Forms
// ============================================

const AuthPage = ({ onSwitchToChat }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = isLogin
      ? await login(email, password)
      : await register(name, email, password);

    setLoading(false);

    if (!result.success) {
      setError(result.error || 'Произошла ошибка');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <div className="auth-logo">
            <Icons.Map />
            <span>TravelAdvisor</span>
          </div>
          <h1>{isLogin ? 'Вход в систему' : 'Регистрация'}</h1>
          <p>Персональные рекомендации мест отдыха</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="form-group">
              <label>Имя</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Введите ваше имя"
                required={!isLogin}
              />
            </div>
          )}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@mail.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Минимум 6 символов"
              required
            />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Загрузка...' : (isLogin ? 'Войти' : 'Зарегистрироваться')}
          </button>
        </form>

        <div className="auth-switch">
          {isLogin ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}
          <button onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Зарегистрироваться' : 'Войти'}
          </button>
        </div>

        <div className="auth-demo">
          <p>Функционал авторизации в разработке</p>
        </div>
      </div>
    </div>
  );
};

// ============================================
// COMPONENTS: Chat
// ============================================

const ChatMessage = ({ message, isUser }) => (
  <div className={`chat-message ${isUser ? 'user' : 'bot'}`}>
    <div className="message-avatar">
      {isUser ? <Icons.User /> : <Icons.Bot />}
    </div>
    <div className="message-content">
      <div className="message-text">{message.text}</div>
      {message.places && (
        <div className="message-places">
          {message.places.map((place, idx) => (
            <PlaceCard key={idx} place={place} compact />
          ))}
        </div>
      )}
      <div className="message-time">{message.time}</div>
    </div>
  </div>
);

const PlaceCard = ({ place, compact }) => (
  <div className={`place-card ${compact ? 'compact' : ''}`}>
    <div className="place-image" style={{ backgroundImage: `url(${place.image})` }}>
      <div className="place-category">{place.category}</div>
    </div>
    <div className="place-info">
      <h3>{place.name}</h3>
      <div className="place-rating">
        <Icons.Star />
        <span>{place.rating}</span>
        <span className="reviews-count">({place.reviewsCount} отзывов)</span>
      </div>
      <p>{place.description}</p>
      {!compact && (
        <div className="place-tags">
          {place.tags?.map((tag, idx) => (
            <span key={idx} className="tag">{tag}</span>
          ))}
        </div>
      )}
    </div>
  </div>
);

const ChatPanel = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: `Привет, ${user?.name || 'друг'}! Я ваш персональный помощник по поиску мест для отдыха и развлечений. Функционал чата в разработке.`,
      isUser: false,
      time: 'Сейчас'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const loadHistory = async () => {
      const history = await api.getChatHistory();
      if (Array.isArray(history) && history.length > 0) {
        setMessages(history);
      }
    };
    loadHistory();
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: input,
      isUser: true,
      time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    const response = await api.sendMessage(input);

    setIsTyping(false);

    if (response.success && response.message) {
      setMessages(prev => [...prev, response.message]);
    } else {
      const botMessage = {
        id: Date.now() + 1,
        text: response.error || 'В разработке',
        isUser: false,
        time: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMessage]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-panel">
      <div className="chat-messages">
        {messages.map(msg => (
          <ChatMessage key={msg.id} message={msg} isUser={msg.isUser} />
        ))}
        {isTyping && (
          <div className="chat-message bot">
            <div className="message-avatar"><Icons.Bot /></div>
            <div className="message-content">
              <div className="typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-container">
        <div className="chat-input">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Спросите о местах для отдыха..."
            rows={1}
          />
          <button onClick={handleSend} disabled={!input.trim()}>
            <Icons.Send />
          </button>
        </div>
        <div className="chat-hints">
          <button onClick={() => setInput('Посоветуй хороший ресторан')}>Рестораны</button>
          <button onClick={() => setInput('Где погулять в парке?')}>Парки</button>
          <button onClick={() => setInput('Какие музеи посетить?')}>Музеи</button>
        </div>
      </div>
    </div>
  );
};

// ============================================
// COMPONENTS: Users Management (Admin)
// ============================================

const UsersManagement = ({ users, setUsers }) => {
  const { user: currentUser } = useAuth();
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', role: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleEdit = (user) => {
    setEditingUser(user.id);
    setEditForm({ name: user.name, email: user.email, role: user.role });
    setError('');
  };

  const handleCancel = () => {
    setEditingUser(null);
    setEditForm({ name: '', email: '', role: '' });
    setError('');
  };

  const handleSave = async (userId) => {
    setSaving(true);
    setError('');

    const originalUser = users.find(u => u.id === userId);
    const updates = {};

    if (editForm.name !== originalUser.name) updates.name = editForm.name;
    if (editForm.email !== originalUser.email) updates.email = editForm.email;
    if (editForm.role !== originalUser.role) updates.role = editForm.role;

    if (Object.keys(updates).length === 0) {
      handleCancel();
      setSaving(false);
      return;
    }

    const result = await api.updateUser(userId, updates);
    setSaving(false);

    if (result.id) {
      setUsers(prev => prev.map(u => u.id === userId ? result : u));
      handleCancel();
    } else {
      setError(result.detail || result.error || 'Ошибка сохранения');
    }
  };

  const handleDelete = async (userId) => {
    const user = users.find(u => u.id === userId);
    if (!window.confirm(`Удалить пользователя ${user.name} (${user.email})?`)) {
      return;
    }

    const result = await api.deleteUser(userId);
    if (result.success) {
      setUsers(prev => prev.filter(u => u.id !== userId));
    } else {
      setError(result.detail || result.error || 'Ошибка удаления');
    }
  };

  const getRoleName = (role) => {
    switch (role) {
      case 'admin': return 'Админ';
      case 'moderator': return 'Модератор';
      default: return 'Пользователь';
    }
  };

  if (users.length === 0) {
    return <div className="empty-state">Нет пользователей</div>;
  }

  return (
    <div className="users-management">
      <p className="admin-note">Управление учётными данными пользователей</p>

      {error && <div className="mod-error">{error}</div>}

      <table className="users-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Имя</th>
            <th>Email</th>
            <th>Роль</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id} className={editingUser === u.id ? 'editing' : ''}>
              <td>{u.id}</td>
              <td>
                {editingUser === u.id ? (
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="edit-input"
                  />
                ) : u.name}
              </td>
              <td>
                {editingUser === u.id ? (
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="edit-input"
                  />
                ) : u.email}
              </td>
              <td>
                {editingUser === u.id ? (
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    className="edit-select"
                    disabled={u.id === currentUser?.id}
                  >
                    <option value="user">Пользователь</option>
                    <option value="moderator">Модератор</option>
                    <option value="admin">Админ</option>
                  </select>
                ) : (
                  <span className={`role-badge ${u.role}`}>{getRoleName(u.role)}</span>
                )}
              </td>
              <td>
                {editingUser === u.id ? (
                  <div className="action-buttons">
                    <button
                      className="btn-save"
                      onClick={() => handleSave(u.id)}
                      disabled={saving}
                    >
                      {saving ? '...' : <Icons.Check />}
                    </button>
                    <button
                      className="btn-cancel"
                      onClick={handleCancel}
                      disabled={saving}
                    >
                      <Icons.X />
                    </button>
                  </div>
                ) : (
                  <div className="action-buttons">
                    <button
                      className="btn-edit"
                      onClick={() => handleEdit(u)}
                      title="Редактировать"
                    >
                      Изменить
                    </button>
                    {u.id !== currentUser?.id && (
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(u.id)}
                        title="Удалить"
                      >
                        <Icons.X />
                      </button>
                    )}
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ============================================
// COMPONENTS: Moderator Panel
// ============================================

const ModeratorPanel = () => {
  const { hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState('reviews');
  const [pendingReviews, setPendingReviews] = useState([]);
  const [reports, setReports] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ pending_reviews: 0, reports_count: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError('');

      const statsResult = await api.getModerationStats();
      if (statsResult.pending_reviews !== undefined) {
        setStats(statsResult);
      }

      const queueResult = await api.getModerationQueue();
      if (queueResult.error) {
        setError(queueResult.error);
      } else if (queueResult.reviews) {
        setPendingReviews(queueResult.reviews);
      }

      const reportsResult = await api.getReports();
      if (reportsResult.reports) {
        setReports(reportsResult.reports);
      }

      if (hasPermission('manage_users')) {
        const usersResult = await api.getUsers();
        if (usersResult.users) {
          setUsers(usersResult.users);
        }
      }

      setLoading(false);
    };

    loadData();
  }, [hasPermission]);

  const handleApprove = async (id) => {
    const result = await api.moderateReview(id, 'approve');
    if (result.error) {
      setError(result.error);
    } else {
      setPendingReviews(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleReject = async (id) => {
    const result = await api.moderateReview(id, 'reject');
    if (result.error) {
      setError(result.error);
    } else {
      setPendingReviews(prev => prev.filter(r => r.id !== id));
    }
  };

  if (!hasPermission('moderate_reviews')) {
    return (
      <div className="access-denied">
        <Icons.Shield />
        <h2>Доступ запрещён</h2>
        <p>У вас нет прав для просмотра этой страницы</p>
      </div>
    );
  }

  return (
    <div className="moderator-panel">
      <div className="mod-header">
        <h2><Icons.Shield /> Панель модератора</h2>
        <div className="mod-stats">
          <div className="stat">
            <span className="stat-value">{stats.pending_reviews}</span>
            <span className="stat-label">На проверке</span>
          </div>
          <div className="stat">
            <span className="stat-value">{stats.reports_count}</span>
            <span className="stat-label">Жалобы</span>
          </div>
        </div>
      </div>

      {error && <div className="mod-error">{error}</div>}

      <div className="mod-tabs">
        <button
          className={activeTab === 'reviews' ? 'active' : ''}
          onClick={() => setActiveTab('reviews')}
        >
          Отзывы на модерации
        </button>
        <button
          className={activeTab === 'reports' ? 'active' : ''}
          onClick={() => setActiveTab('reports')}
        >
          Жалобы
        </button>
        {hasPermission('manage_users') && (
          <button
            className={activeTab === 'users' ? 'active' : ''}
            onClick={() => setActiveTab('users')}
          >
            Пользователи
          </button>
        )}
      </div>

      <div className="mod-content">
        {loading ? (
          <div className="empty-state">Загрузка...</div>
        ) : (
          <>
            {activeTab === 'reviews' && (
              <div className="reviews-list">
                {pendingReviews.length === 0 ? (
                  <div className="empty-state">В разработке</div>
                ) : (
                  pendingReviews.map(review => (
                    <div key={review.id} className="review-card">
                      <div className="review-header">
                        <div className="review-meta">
                          <strong>{review.user}</strong>
                          <span className="review-place">{review.place}</span>
                        </div>
                        <div className="review-rating">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={i < review.rating ? 'filled' : ''}>
                              <Icons.Star />
                            </span>
                          ))}
                        </div>
                      </div>
                      <p className="review-text">{review.text}</p>
                      <div className="review-footer">
                        <span className="review-date">{review.date}</span>
                        <div className="review-actions">
                          <button className="btn-approve" onClick={() => handleApprove(review.id)}>
                            <Icons.Check /> Одобрить
                          </button>
                          <button className="btn-reject" onClick={() => handleReject(review.id)}>
                            <Icons.X /> Отклонить
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'reports' && (
              <div className="reports-list">
                {reports.length === 0 ? (
                  <div className="empty-state">В разработке</div>
                ) : (
                  reports.map(report => (
                    <div key={report.id} className="report-card">
                      <div className="report-type">{report.type}</div>
                      <p>{report.content}</p>
                      <div className="report-meta">
                        <span>Отправил: {report.reporter}</span>
                        <span>{report.date}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'users' && hasPermission('manage_users') && (
              <UsersManagement users={users} setUsers={setUsers} />
            )}
          </>
        )}
      </div>
    </div>
  );
};

// ============================================
// COMPONENTS: Navigation & Layout
// ============================================

const Navbar = ({ currentView, setCurrentView }) => {
  const { user, logout, hasPermission } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Icons.Map />
        <span>TravelAdvisor</span>
      </div>

      <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
        <button
          className={currentView === 'chat' ? 'active' : ''}
          onClick={() => { setCurrentView('chat'); setMenuOpen(false); }}
        >
          Чат
        </button>

        {hasPermission('moderate_reviews') && (
          <button
            className={currentView === 'moderator' ? 'active' : ''}
            onClick={() => { setCurrentView('moderator'); setMenuOpen(false); }}
          >
            <Icons.Shield /> Модерация
          </button>
        )}
      </div>

      <div className="nav-user">
        <div className="user-info">
          <span className="user-name">{user?.name}</span>
          <span className={`user-role ${user?.role}`}>{
            user?.role === 'admin' ? 'Админ' :
            user?.role === 'moderator' ? 'Модератор' : 'Пользователь'
          }</span>
        </div>
        <button className="btn-logout" onClick={logout} title="Выйти">
          <Icons.Logout />
        </button>
      </div>

      <button className="nav-menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
        <Icons.Menu />
      </button>
    </nav>
  );
};

const MainApp = () => {
  const [currentView, setCurrentView] = useState('chat');

  return (
    <div className="app-container">
      <Navbar currentView={currentView} setCurrentView={setCurrentView} />
      <main className="main-content">
        {currentView === 'chat' && <ChatPanel />}
        {currentView === 'moderator' && <ModeratorPanel />}
      </main>
    </div>
  );
};

// ============================================
// MAIN APP
// ============================================

const App = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <p>Загрузка...</p>
      </div>
    );
  }

  return user ? <MainApp /> : <AuthPage />;
};

// Обёртка с провайдером
const AppWrapper = () => (
  <AuthProvider>
    <App />
  </AuthProvider>
);

export default AppWrapper;

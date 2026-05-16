import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiCalendar, FiTarget, FiAward, FiTrendingUp, FiEdit2, FiSave, FiX } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './Profile.css';

const API_URL = 'https://cursovaya-u3w7.onrender.com';

const quotes = [
  "«Цель — это мечта с дедлайном» — Наполеон Хилл",
  "«Неважно, как медленно ты идёшь, главное — не останавливаться» — Конфуций",
  "«Успех — это сумма маленьких усилий, повторяемых день за днём» — Роберт Кольер",
  "«Единственный способ сделать великую работу — любить то, что ты делаешь» — Стив Джобс",
  "«Будущее зависит от того, что ты делаешь сегодня» — Махатма Ганди",
  "«Дисциплина — это мост между целями и достижениями» — Джим Рон",
  "«Начинай с малого, но мечтай о великом» — Зиг Зиглар"
];

const Profile = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [stats, setStats] = useState({ total: 0, completed: 0, active: 0 });
  const [quote, setQuote] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/goals`);
      const goals = response.data;
      setStats({
        total: goals.length,
        completed: goals.filter(g => g.status === 'completed').length,
        active: goals.filter(g => g.status === 'active').length
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');
    
    if (!username.trim()) {
      setError('Имя пользователя не может быть пустым');
      return;
    }

    try {
      await axios.put(`${API_URL}/api/auth/update`, { username, email });
      setSuccess('Профиль обновлён');
      setEditing(false);
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка обновления');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Неизвестно';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <motion.div 
      className="profile-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="profile-header">
        <h1>ПРОФИЛЬ</h1>
      </div>

      <div className="profile-grid">
        {/* Карточка пользователя */}
        <motion.div 
          className="profile-card"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="profile-avatar">
            <FiUser />
          </div>
          
          {error && <div className="auth-error">{error}</div>}
          {success && <div className="auth-success">{success}</div>}

          {editing ? (
            <div className="profile-edit-form">
              <div className="form-group">
                <label>ИМЯ ПОЛЬЗОВАТЕЛЯ</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-field"
                />
              </div>
              <div className="form-group">
                <label>EMAIL</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                />
              </div>
              <div className="profile-actions">
                <button onClick={handleSave} className="btn btn-primary">
                  <FiSave /> СОХРАНИТЬ
                </button>
                <button onClick={() => setEditing(false)} className="btn btn-secondary">
                  <FiX /> ОТМЕНА
                </button>
              </div>
            </div>
          ) : (
            <div className="profile-info">
              <h2>{user?.username}</h2>
              <div className="profile-details">
                <div className="profile-detail">
                  <FiMail />
                  <span>{user?.email}</span>
                </div>
                <div className="profile-detail">
                  <FiCalendar />
                  <span>Регистрация: {formatDate(user?.created_at)}</span>
                </div>
              </div>
              <button onClick={() => setEditing(true)} className="btn btn-secondary" style={{ width: '100%', marginTop: '16px' }}>
                <FiEdit2 /> РЕДАКТИРОВАТЬ
              </button>
            </div>
          )}
        </motion.div>

        {/* Статистика */}
        <motion.div 
          className="profile-stats"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <FiTarget />
              </div>
              <div className="stat-info">
                <h3>{stats.total}</h3>
                <p>ВСЕГО ЦЕЛЕЙ</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon success">
                <FiAward />
              </div>
              <div className="stat-info">
                <h3>{stats.completed}</h3>
                <p>ЗАВЕРШЕНО</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon warning">
                <FiTrendingUp />
              </div>
              <div className="stat-info">
                <h3>{stats.active}</h3>
                <p>В ПРОЦЕССЕ</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Цитата */}
        <motion.div 
          className="profile-quote"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <p className="quote-text">{quote}</p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Profile;
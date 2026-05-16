import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiUserPlus } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password.length < 6) {
      setError('Пароль должен быть не менее 6 символов');
      return;
    }
    
    setLoading(true);

    try {
      await register(username, email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      className="auth-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="auth-card">
        <h1>РЕГИСТРАЦИЯ</h1>
        <p className="auth-subtitle">Создайте новый аккаунт</p>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>ИМЯ ПОЛЬЗОВАТЕЛЯ</label>
            <div className="input-with-icon">
              <FiUser className="input-icon" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field"
                placeholder="username"
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>EMAIL</label>
            <div className="input-with-icon">
              <FiMail className="input-icon" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="your@email.com"
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>ПАРОЛЬ</label>
            <div className="input-with-icon">
              <FiLock className="input-icon" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="Минимум 6 символов"
                required
              />
            </div>
          </div>
          
          <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
            <FiUserPlus />
            {loading ? 'РЕГИСТРАЦИЯ...' : 'ЗАРЕГИСТРИРОВАТЬСЯ'}
          </button>
        </form>
        
        <p className="auth-link">
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </div>
    </motion.div>
  );
};

export default Register;
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiLogIn } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
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
        <h1>ВХОД</h1>
        <p className="auth-subtitle">Войдите в свой аккаунт</p>
        
        {error && <div className="auth-error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
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
                placeholder="••••••"
                required
              />
            </div>
          </div>
          
          <button type="submit" className="btn btn-primary auth-btn" disabled={loading}>
            <FiLogIn />
            {loading ? 'ВХОД...' : 'ВОЙТИ'}
          </button>
        </form>
        
        <p className="auth-link">
          Нет аккаунта? <Link to="/register">Регистрация</Link>
        </p>
      </div>
    </motion.div>
  );
};

export default Login;
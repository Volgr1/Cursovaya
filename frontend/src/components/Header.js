import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiTarget, FiHome, FiList, FiPlus, FiBarChart2, FiLogOut, FiUser, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import './Header.css';

const Header = () => {
  const location = useLocation();
  const { user, logout, deleteAccount } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Вы уверены? Все ваши цели будут удалены безвозвратно!')) {
      try {
        await deleteAccount();
        navigate('/register');
      } catch (error) {
        alert('Ошибка при удалении аккаунта');
      }
    }
  };

  const navItems = [
    { path: '/', icon: <FiHome />, label: 'Dashboard' },
    { path: '/goals', icon: <FiList />, label: 'Goals' },
    { path: '/goals/new', icon: <FiPlus />, label: 'New Goal' },
    { path: '/analytics', icon: <FiBarChart2 />, label: 'Analytics' },
  ];

  return (
    <motion.header 
      className="header"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
    >
      <div className="header-container">
        <Link to="/" className="logo">
          <FiTarget className="logo-icon" />
          <span>GoalTracker</span>
        </Link>
        
        <nav className="nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
              {location.pathname === item.path && (
                <motion.div className="active-indicator" layoutId="activeIndicator" />
              )}
            </Link>
          ))}
          
          <Link to="/profile" className="nav-link" style={{ gap: '8px' }}>
            <FiUser />
            <span>{user?.username}</span>
          </Link>
          
          <button onClick={handleDeleteAccount} className="nav-link" style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--danger)' }}>
            <FiTrash2 />
            <span>Delete</span>
          </button>
          
          <button onClick={handleLogout} className="nav-link" style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
            <FiLogOut />
            <span>Exit</span>
          </button>
        </nav>
      </div>
    </motion.header>
  );
};

export default Header;
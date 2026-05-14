import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiTarget, FiHome, FiList, FiPlus, FiBarChart2 } from 'react-icons/fi';
import './Header.css';

const Header = () => {
  const location = useLocation();
  
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
        </nav>
      </div>
    </motion.header>
  );
};

export default Header;
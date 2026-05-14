import React from 'react';
import { FiTarget, FiGithub, FiMail, FiHeart } from 'react-icons/fi';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <div className="footer-logo">
            <FiTarget />
            <span>GoalTracker</span>
          </div>
          <p>Transform your goals into achievements with SMART & OKR methodology</p>
        </div>
        
        <div className="footer-section">
          <h4>Quick Links</h4>
          <a href="/about">About</a>
          <a href="/help">Help Center</a>
          <a href="/privacy">Privacy Policy</a>
        </div>
        
        <div className="footer-section">
          <h4>Connect</h4>
          <div className="social-links">
            <a href="#"><FiGithub /></a>
            <a href="#"><FiMail /></a>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>Made with <FiHeart className="heart-icon" /> for tracking success</p>
        <p>&copy; 2024 GoalTracker. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
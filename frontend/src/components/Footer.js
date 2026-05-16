import React from 'react';
import { FiTarget, FiGithub, FiMail } from 'react-icons/fi';
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
          <h4>Resources</h4>
          <a href="https://ru.wikipedia.org/wiki/SMART" target="_blank" rel="noopener noreferrer">SMART Methodology</a>
          <a href="https://ru.wikipedia.org/wiki/OKR" target="_blank" rel="noopener noreferrer">OKR Framework</a>
          <a href="https://react.dev" target="_blank" rel="noopener noreferrer">React Documentation</a>
        </div>
        
        <div className="footer-section">
          <h4>Connect</h4>
          <div className="social-links">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" title="GitHub">
              <FiGithub />
            </a>
            <a href="mailto:goal-tracker@example.com" title="Email">
              <FiMail />
            </a>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>© 2026 GoalTracker. Diploma Project</p>
      </div>
    </footer>
  );
};

export default Footer;
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiEdit2, FiCheckCircle, FiCircle, FiClock, FiTarget } from 'react-icons/fi';
import axios from 'axios';
import './GoalDetail.css';

const GoalDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [goal, setGoal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGoal();
  }, [id]);

  const calculateProgress = (goalData) => {
  const hasMilestones = goalData.milestones && goalData.milestones.length > 0;
  const hasKeyResults = goalData.keyResults && goalData.keyResults.length > 0;
  
  let progress = 0;
  
  // Прогресс по milestones
  if (hasMilestones) {
    const totalMilestones = goalData.milestones.length;
    const completedMilestones = goalData.milestones.filter(m => m.completed).length;
    const milestoneProgress = (completedMilestones / totalMilestones) * 100;
    const weight = hasKeyResults ? 50 : 100;
    progress += (milestoneProgress * weight) / 100;
  }
  
  // Прогресс по keyResults
  if (hasKeyResults) {
    const totalKR = goalData.keyResults.length;
    const krProgressSum = goalData.keyResults.reduce((sum, kr) => {
      const target = parseFloat(kr.targetValue) || 1;
      const current = parseFloat(kr.currentValue) || 0;
      return sum + Math.min(100, (current / Math.max(1, target)) * 100);
    }, 0);
    const krProgress = totalKR > 0 ? (krProgressSum / totalKR) : 0;
    const weight = hasMilestones ? 50 : 100;
    progress += (krProgress * weight) / 100;
  }
  
  if (!hasMilestones && !hasKeyResults) return 0;
  
  return Math.round(Math.min(100, Math.max(0, progress)));
};

  const fetchGoal = async () => {
    try {
      const response = await axios.get(`https://cursovaya-u3w7.onrender.com/api/goals/${id}`);
      const goalData = response.data;
      
      // Рассчитываем прогресс
      const calculatedProgress = calculateProgress(goalData);
      
      // Обновляем прогресс на сервере если изменился
      if (calculatedProgress !== goalData.progress) {
        await axios.put(`https://cursovaya-u3w7.onrender.com/api/goals/${id}`, {
          ...goalData,
          progress: calculatedProgress
        });
        goalData.progress = calculatedProgress;
      }
      
      setGoal(goalData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching goal:', error);
      navigate('/404');
    }
  };

  const toggleMilestone = async (milestoneId) => {
    try {
      const updatedMilestones = goal.milestones.map(m => {
        if (m.id === milestoneId) {
          return {
            ...m,
            completed: !m.completed,
            completedDate: !m.completed ? new Date().toISOString() : null
          };
        }
        return m;
      });
      
      const updatedGoal = {
        ...goal,
        milestones: updatedMilestones
      };
      
      // Рассчитываем новый прогресс
      const newProgress = calculateProgress(updatedGoal);
      
      const response = await axios.put(`https://cursovaya-u3w7.onrender.com/api/goals/${id}`, {
        ...updatedGoal,
        progress: newProgress
      });
      
      setGoal(response.data);
    } catch (error) {
      console.error('Error updating milestone:', error);
    }
  };

  const updateKeyResult = async (krId, value) => {
    try {
      const updatedKeyResults = goal.keyResults.map(kr => {
        if (kr.id === krId) {
          return { ...kr, currentValue: parseFloat(value) || 0 };
        }
        return kr;
      });
      
      const updatedGoal = {
        ...goal,
        keyResults: updatedKeyResults
      };
      
      // Рассчитываем новый прогресс
      const newProgress = calculateProgress(updatedGoal);
      
      // Автоматически завершаем цель если прогресс 100%
      const newStatus = newProgress >= 100 ? 'completed' : goal.status;
      
      const response = await axios.put(`https://cursovaya-u3w7.onrender.com/api/goals/${id}`, {
        ...updatedGoal,
        progress: newProgress,
        status: newStatus
      });
      
      setGoal(response.data);
    } catch (error) {
      console.error('Error updating key result:', error);
    }
  };

  const updateStatus = async (newStatus) => {
    try {
      const response = await axios.put(`https://cursovaya-u3w7.onrender.com/api/goals/${id}`, {
        ...goal,
        status: newStatus,
        progress: newStatus === 'completed' ? 100 : goal.progress
      });
      setGoal(response.data);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <motion.div 
          className="loading-spinner"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  if (!goal) return null;

  const completedMilestones = goal.milestones.filter(m => m.completed).length;
  const totalMilestones = goal.milestones.length;
  const milestoneProgress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

  return (
    <motion.div 
      className="goal-detail"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="detail-header">
        <button onClick={() => navigate('/goals')} className="btn btn-secondary">
          <FiArrowLeft /> НАЗАД
        </button>
        <Link to={`/goals/${id}/edit`} className="btn btn-primary">
          <FiEdit2 /> РЕДАКТИРОВАТЬ
        </Link>
      </div>

      <div className="detail-content">
        <motion.div 
          className="goal-main-info"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="goal-title-section">
            <h1>{goal.title}</h1>
            <span className={`badge badge-${goal.type}`}>{goal.type.toUpperCase()}</span>
          </div>
          
          <p className="goal-description">{goal.description || 'Без описания'}</p>
          
          <div className="goal-meta">
            <div className="meta-item">
              <FiTarget />
              <span>КАТЕГОРИЯ: {goal.category}</span>
            </div>
            <div className="meta-item">
              <FiClock />
              <span>СОЗДАНА: {new Date(goal.createdAt).toLocaleDateString('ru-RU')}</span>
            </div>
            {goal.endDate && (
              <div className="meta-item">
                <FiClock />
                <span>ДЕДЛАЙН: {new Date(goal.endDate).toLocaleDateString('ru-RU')}</span>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
            <button 
              className={`btn ${goal.status === 'active' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => updateStatus('active')}
              style={{ fontSize: '11px', padding: '6px 12px' }}
            >
              В ПРОЦЕССЕ
            </button>
            <button 
              className={`btn ${goal.status === 'completed' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => updateStatus('completed')}
              style={{ fontSize: '11px', padding: '6px 12px' }}
            >
              ЗАВЕРШЕНО
            </button>
            <button 
              className={`btn ${goal.status === 'archived' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => updateStatus('archived')}
              style={{ fontSize: '11px', padding: '6px 12px' }}
            >
              АРХИВ
            </button>
          </div>

          <div className="overall-progress">
            <div className="progress-header">
              <h3>ОБЩИЙ ПРОГРЕСС</h3>
              <span className="progress-percentage">{goal.progress}%</span>
            </div>
            <div className="progress-bar large">
              <motion.div 
                className="progress-fill"
                initial={{ width: 0 }}
                animate={{ width: `${goal.progress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>
        </motion.div>

        <div className="detail-grid">
          <motion.div 
            className="milestones-section"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="section-header">
              <h2>ВЕХИ ({completedMilestones}/{totalMilestones})</h2>
              <div className="progress-bar small" style={{ width: '120px' }}>
                <div 
                  className="progress-fill" 
                  style={{ width: `${milestoneProgress}%` }}
                />
              </div>
            </div>
            
            <div className="milestones-list">
              {goal.milestones.map((milestone, index) => (
                <motion.div 
                  key={milestone.id}
                  className={`milestone-item ${milestone.completed ? 'completed' : ''}`}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  onClick={() => toggleMilestone(milestone.id)}
                >
                  <div className="milestone-checkbox">
                    {milestone.completed ? (
                      <FiCheckCircle className="check-icon completed" />
                    ) : (
                      <FiCircle className="check-icon" />
                    )}
                  </div>
                  <div className="milestone-content">
                    <h4>{milestone.title}</h4>
                    {milestone.targetDate && (
                      <span className="milestone-date">
                        <FiClock />
                        {new Date(milestone.targetDate).toLocaleDateString('ru-RU')}
                      </span>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            className="key-results-section"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <h2>КЛЮЧЕВЫЕ РЕЗУЛЬТАТЫ</h2>
            
            <div className="key-results-list">
              {goal.keyResults.map((kr, index) => (
                <motion.div 
                  key={kr.id}
                  className="kr-card"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <div className="kr-header">
                    <h4>{kr.title}</h4>
                    <span className="kr-progress">
                      {Math.round(((parseFloat(kr.currentValue) || 0) / (parseFloat(kr.targetValue) || 1)) * 100)}%
                    </span>
                  </div>
                  
                  <div className="kr-values">
                    <div className="kr-input-group">
                      <label>ТЕКУЩЕЕ</label>
                      <input
                        type="number"
                        value={kr.currentValue}
                        onChange={(e) => updateKeyResult(kr.id, e.target.value)}
                        className="input-field"
                      />
                    </div>
                    <div className="kr-separator">/</div>
                    <div className="kr-input-group">
                      <label>ЦЕЛЬ</label>
                      <input
                        type="number"
                        value={kr.targetValue}
                        disabled
                        className="input-field disabled"
                      />
                    </div>
                    <span className="kr-unit">{kr.unit}</span>
                  </div>
                  
                  <div className="progress-bar">
                    <motion.div 
                      className="progress-fill"
                      initial={{ width: 0 }}
                      style={{ width: `${Math.min(100, ((parseFloat(kr.currentValue) || 0) / (parseFloat(kr.targetValue) || 1)) * 100)}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default GoalDetail;
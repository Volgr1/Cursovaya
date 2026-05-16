import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiTarget, FiClock, FiCheckCircle, FiArchive } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './GoalsList.css';

const GoalsList = () => {
  const [goals, setGoals] = useState([]);
  const [filter, setFilter] = useState('all');

  const [loading, setLoading] = useState(true);

  const { user } = useAuth();

useEffect(() => {
  if (user) {
    fetchGoals();
  }
}, [user]);

  const fetchGoals = async () => {
    try {
      const response = await axios.get('https://cursovaya-u3w7.onrender.com/api/goals');
      setGoals(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching goals:', error);
      setLoading(false);
    }
  };

  const deleteGoal = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить эту цель?')) {
      try {
        await axios.delete(`https://cursovaya-u3w7.onrender.com/api/goals/${id}`);
        setGoals(goals.filter(goal => goal.id !== id));
      } catch (error) {
        console.error('Error deleting goal:', error);
      }
    }
  };
  const archiveGoal = async (id) => {
  try {
    const goal = goals.find(g => g.id === id);
    await axios.put(`https://cursovaya-u3w7.onrender.com/api/goals/${id}`, {
      ...goal,
      status: 'archived'
    });
    fetchGoals();
  } catch (error) {
    console.error('Error archiving goal:', error);
  }
};

const filteredGoals = goals.filter(goal => {
  if (filter === 'all') return goal.status !== 'archived';
  if (filter === 'active') return goal.status === 'active';
  if (filter === 'completed') return goal.status === 'completed';
  if (filter === 'archived') return goal.status === 'archived';
  if (filter === 'okr') return goal.type === 'okr' && goal.status !== 'archived';
  if (filter === 'smart') return goal.type === 'smart' && goal.status !== 'archived';
  return true;
});

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return <FiCheckCircle className="status-icon completed" />;
      case 'active': return <FiClock className="status-icon active" />;
      default: return <FiTarget className="status-icon" />;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
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
        <p>Загрузка целей...</p>
      </div>
    );
  }

  return (
    <motion.div 
      className="goals-list-page"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="page-header">
        <div>
          <h1>Мои цели</h1>
          <p>Управляйте своими целями и отслеживайте прогресс</p>
        </div>
        <Link to={`/goals/new${filter !== 'all' && filter !== 'active' && filter !== 'completed' && filter !== 'archived' ? `?type=${filter}` : ''}`} className="btn btn-primary">
  <FiPlus /> Создать цель
</Link>
      </div>

      <div className="filters">
        {['all', 'active', 'completed', 'okr', 'smart', 'archived'].map(filterType => (
          <button
            key={filterType}
            className={`filter-btn ${filter === filterType ? 'active' : ''}`}
            onClick={() => setFilter(filterType)}
          >
            {filterType === 'all' && 'Все'}
{filterType === 'active' && 'Активные'}
{filterType === 'completed' && 'Завершённые'}
{filterType === 'okr' && 'OKR'}
{filterType === 'smart' && 'SMART'}
{filterType === 'archived' && 'Архив'}
          </button>
        ))}
      </div>

      <motion.div className="goals-grid" layout>
  <AnimatePresence>
    {filteredGoals.length === 0 ? (
      <motion.div 
  className="empty-state"
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
>
  <FiTarget className="empty-icon" />
  <h3>
    {filter === 'all' && 'Нет целей'}
    {filter === 'active' && 'Нет активных целей'}
    {filter === 'completed' && 'Нет завершённых целей'}
    {filter === 'okr' && 'Нет OKR целей'}
    {filter === 'smart' && 'Нет SMART целей'}
    {filter === 'archived' && 'Архив пуст'}
  </h3>
  <p>
    {filter === 'all' && 'Создайте свою первую цель, чтобы начать отслеживание'}
    {filter === 'active' && 'У вас пока нет активных целей'}
    {filter === 'completed' && 'У вас пока нет завершённых целей'}
    {filter === 'okr' && 'У вас пока нет целей типа OKR'}
    {filter === 'smart' && 'У вас пока нет целей типа SMART'}
    {filter === 'archived' && 'Архивированных целей нет'}
  </p>
  {filter !== 'archived' && filter !== 'completed' && (
  <Link to={`/goals/new${(filter === 'okr' || filter === 'smart') ? `?type=${filter}` : ''}`} className="btn btn-primary">
    <FiPlus /> Создать цель
  </Link>
)}
</motion.div>
          ) : (
            filteredGoals.map(goal => (
              <motion.div
                key={goal.id}
                className="goal-card"
                variants={itemVariants}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -5 }}
              >
                <div className="goal-card-header">
                  <div className="goal-type-badge">
                    <span className={`badge badge-${goal.type}`}>
                      {goal.type.toUpperCase()}
                    </span>
                    <span className={`badge badge-category`}>
                      {goal.category}
                    </span>
                  </div>
                  {getStatusIcon(goal.status)}
                </div>
                
                <h3 className="goal-card-title">{goal.title}</h3>
                <p className="goal-card-description">
                  {goal.description || 'Без описания'}
                </p>
                
                <div className="goal-progress-section">
                  <div className="progress-header">
                    <span>Прогресс</span>
                    <span className="progress-value">{goal.progress}%</span>
                  </div>
                  <div className="progress-bar">
                    <motion.div 
                      className="progress-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${goal.progress}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                </div>

                <div className="goal-card-footer">
                  <div className="goal-dates">
                    {goal.endDate && (
                      <span className="date">
                        <FiClock />
                        {new Date(goal.endDate).toLocaleDateString('ru-RU')}
                      </span>
                    )}
                  </div>
                  <div className="goal-actions">
  <Link to={`/goals/${goal.id}`} className="btn-icon" title="Просмотр">
    <FiTarget />
  </Link>
  <Link to={`/goals/${goal.id}/edit`} className="btn-icon" title="Редактировать">
    <FiEdit2 />
  </Link>
  <button 
    className="btn-icon" 
    onClick={() => archiveGoal(goal.id)}
    title="В архив"
  >
    <FiArchive />
  </button>
  <button 
    className="btn-icon delete" 
    onClick={() => deleteGoal(goal.id)}
    title="Удалить"
  >
    <FiTrash2 />
  </button>
</div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default GoalsList;
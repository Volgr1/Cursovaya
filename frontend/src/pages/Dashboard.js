import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiTarget, FiTrendingUp, FiAward, FiClock } from 'react-icons/fi';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = () => {
  const [goals, setGoals] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    avgProgress: 0
  });
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
    const fetchedGoals = response.data;
    
    // Исключаем архивированные цели из всей статистики
    const activeAndCompletedGoals = fetchedGoals.filter(g => g.status !== 'archived');
    
    // Показываем только активные цели на дашборде
    const activeGoals = activeAndCompletedGoals.filter(g => g.status === 'active');
    setGoals(activeGoals.slice(0, 3));
    
    // Считаем статистику только по неархивированным целям
    const total = activeAndCompletedGoals.length;
    const completed = activeAndCompletedGoals.filter(g => g.status === 'completed').length;
    const inProgress = activeAndCompletedGoals.filter(g => g.status === 'active').length;
    const avgProgress = total > 0 
  ? Math.round(activeAndCompletedGoals.reduce((acc, g) => acc + (g.progress || 0), 0) / total)
  : 0;
    
    setStats({ total, completed, inProgress, avgProgress });
    setLoading(false);
  } catch (error) {
    console.error('Error fetching goals:', error);
    setLoading(false);
  }
};

  // Динамические данные для пирога
  const getPieData = () => {
    const okrCount = goals.filter(g => g.type === 'okr').length;
    const smartCount = goals.filter(g => g.type === 'smart').length;
    
    // Если есть данные в goals
    if (goals.length > 0) {
      return [
        { name: 'OKR', value: okrCount, color: '#0D0D0D' },
        { name: 'SMART', value: smartCount, color: '#999999' }
      ];
    }
    
    // Если goals пустые, но есть статистика
    if (stats.total > 0) {
      // Делаем запрос для получения всех целей
      return [
        { name: 'OKR', value: stats.total - stats.completed, color: '#0D0D0D' },
        { name: 'SMART', value: stats.completed, color: '#999999' }
      ];
    }
    
    return [];
  };

  const pieData = getPieData();

  // Данные для распределения по статусам
  const getStatusPieData = () => {
    return [
      { name: 'Completed', value: stats.completed, color: '#1A7F37' },
      { name: 'In Progress', value: stats.inProgress, color: '#0D0D0D' },
      { name: 'Not Started', value: Math.max(0, stats.total - stats.completed - stats.inProgress), color: '#E5E5E5' }
    ];
  };

  const statusPieData = getStatusPieData();

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
      </div>
    );
  }

  return (
    <motion.div 
      className="dashboard"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="dashboard-header">
        <h1>Welcome back!</h1>
        <p>Track your progress and achieve your goals</p>
      </div>

      <div className="stats-grid">
        <motion.div className="stat-card" variants={itemVariants}>
          <div className="stat-icon">
            <FiTarget />
          </div>
          <div className="stat-info">
            <h3>{stats.total}</h3>
            <p>TOTAL GOALS</p>
          </div>
        </motion.div>

        <motion.div className="stat-card" variants={itemVariants}>
          <div className="stat-icon success">
            <FiAward />
          </div>
          <div className="stat-info">
            <h3>{stats.completed}</h3>
            <p>COMPLETED</p>
          </div>
        </motion.div>

        <motion.div className="stat-card" variants={itemVariants}>
          <div className="stat-icon warning">
            <FiClock />
          </div>
          <div className="stat-info">
            <h3>{stats.inProgress}</h3>
            <p>IN PROGRESS</p>
          </div>
        </motion.div>

        <motion.div className="stat-card" variants={itemVariants}>
          <div className="stat-icon primary">
            <FiTrendingUp />
          </div>
          <div className="stat-info">
            <h3>{stats.avgProgress}%</h3>
            <p>AVG PROGRESS</p>
          </div>
        </motion.div>
      </div>

      <div className="dashboard-grid">
        <motion.div className="recent-goals" variants={itemVariants}>
          <div className="card-header">
            <h2>RECENT GOALS</h2>
            <Link to="/goals" className="btn-link">VIEW ALL</Link>
          </div>
          
          {goals.length === 0 ? (
            <div className="empty-state">
              <p>No goals yet. Start by creating your first goal!</p>
              <Link to="/goals/new" className="btn btn-primary">CREATE GOAL</Link>
            </div>
          ) : (
            goals.map((goal, index) => (
              <Link to={`/goals/${goal.id}`} key={goal.id} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                <motion.div 
                  className="goal-item"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="goal-info">
                    <h3>{goal.title}</h3>
                    <span className={`badge badge-${goal.type}`}>{goal.type.toUpperCase()}</span>
                  </div>
                  <div className="goal-progress">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill" 
                        style={{ width: `${goal.progress}%` }}
                      />
                    </div>
                    <span>{goal.progress}%</span>
                  </div>
                </motion.div>
              </Link>
            ))
          )}
        </motion.div>

        <motion.div className="chart-card" variants={itemVariants}>
          <h2>GOALS DISTRIBUTION</h2>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '16px' }}>
                {pieData.map((entry) => (
                  <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '12px', height: '12px', background: entry.color }} />
                    <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#999' }}>
                      {entry.name}: {entry.value}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state">
              <p>Create goals to see statistics</p>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
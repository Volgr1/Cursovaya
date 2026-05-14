import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiPieChart, FiTarget, FiAward } from 'react-icons/fi';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import axios from 'axios';
import './Analytics.css';

const Analytics = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/goals');
      setGoals(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching goals:', error);
      setLoading(false);
    }
  };

  // Статистика
  const totalGoals = goals.length;
  const completedGoals = goals.filter(g => g.status === 'completed').length;
  const activeGoals = goals.filter(g => g.status === 'active').length;
  const avgProgress = totalGoals > 0 ? Math.round(goals.reduce((acc, g) => acc + g.progress, 0) / totalGoals) : 0;

  // Распределение по категориям
  const categoryData = goals.reduce((acc, goal) => {
    const existingCategory = acc.find(item => item.name === goal.category);
    if (existingCategory) {
      existingCategory.value++;
    } else {
      acc.push({ name: goal.category, value: 1 });
    }
    return acc;
  }, []);

  // Распределение по типам
  const typeData = [
    { name: 'OKR', value: goals.filter(g => g.type === 'okr').length },
    { name: 'SMART', value: goals.filter(g => g.type === 'smart').length }
  ];

  // Прогресс по целям (для графика)
  const progressData = goals.map(goal => ({
    name: goal.title.length > 15 ? goal.title.substring(0, 15) + '...' : goal.title,
    progress: goal.progress,
    fullName: goal.title
  }));

  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  const TYPE_COLORS = ['#6366f1', '#10b981'];

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
      className="analytics-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="page-header">
        <h1>Аналитика и статистика</h1>
        <p>Обзор ваших целей и прогресса</p>
      </div>

      <div className="stats-grid">
        <motion.div 
          className="stat-card"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="stat-icon">
            <FiTarget />
          </div>
          <div className="stat-info">
            <h3>{totalGoals}</h3>
            <p>Всего целей</p>
          </div>
        </motion.div>

        <motion.div 
          className="stat-card"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="stat-icon success">
            <FiAward />
          </div>
          <div className="stat-info">
            <h3>{completedGoals}</h3>
            <p>Завершено</p>
          </div>
        </motion.div>

        <motion.div 
          className="stat-card"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="stat-icon warning">
            <FiTrendingUp />
          </div>
          <div className="stat-info">
            <h3>{activeGoals}</h3>
            <p>В процессе</p>
          </div>
        </motion.div>

        <motion.div 
          className="stat-card"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="stat-icon primary">
            <FiPieChart />
          </div>
          <div className="stat-info">
            <h3>{avgProgress}%</h3>
            <p>Средний прогресс</p>
          </div>
        </motion.div>
      </div>

      <div className="charts-grid">
        <motion.div 
          className="chart-card"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h2>Прогресс по целям</h2>
          {progressData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ 
                    background: '#1e293b', 
                    border: '1px solid #334155',
                    borderRadius: '0.5rem'
                  }} 
                />
                <Bar dataKey="progress" fill="#6366f1" radius={[8, 8, 0, 0]}>
                  {progressData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data">
              <p>Нет данных для отображения</p>
            </div>
          )}
        </motion.div>

        <motion.div 
          className="chart-card"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <h2>Распределение по категориям</h2>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data">
              <p>Нет данных для отображения</p>
            </div>
          )}
        </motion.div>

        <motion.div 
          className="chart-card"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <h2>OKR vs SMART</h2>
          {goals.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={typeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {typeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={TYPE_COLORS[index % TYPE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data">
              <p>Нет данных для отображения</p>
            </div>
          )}
        </motion.div>

        <motion.div 
          className="chart-card"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <h2>Сводка</h2>
          <div className="summary-list">
            <div className="summary-item">
              <span>Самая прогрессивная цель</span>
              <strong>
                {goals.length > 0 
                  ? goals.reduce((max, goal) => goal.progress > max.progress ? goal : max).title 
                  : 'Нет целей'}
              </strong>
            </div>
            <div className="summary-item">
              <span>Всего вех завершено</span>
              <strong>
                {goals.reduce((acc, goal) => 
                  acc + goal.milestones.filter(m => m.completed).length, 0
                )}
              </strong>
            </div>
            <div className="summary-item">
              <span>Среднее значение KR</span>
              <strong>
                {goals.length > 0 
                  ? Math.round(goals.reduce((acc, goal) => 
                      acc + goal.keyResults.reduce((sum, kr) => 
                        sum + (kr.currentValue / kr.targetValue * 100), 0
                      ) / goal.keyResults.length, 0
                    ) / goals.length)
                  : 0}%
              </strong>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Analytics;
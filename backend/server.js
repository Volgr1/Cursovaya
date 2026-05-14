const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Замени на свой URL от MockAPI
const MOCKAPI_BASE_URL = 'https://6a05c29caa826ca75c0a8930.mockapi.io';

app.use(cors());
app.use(express.json());

// ============= GOALS API =============

// Получить все цели
app.get('/api/goals', async (req, res) => {
  try {
    const response = await axios.get(`${MOCKAPI_BASE_URL}/goals`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching goals:', error);
    res.status(500).json({ error: 'Failed to fetch goals' });
  }
});

// Получить одну цель
app.get('/api/goals/:id', async (req, res) => {
  try {
    const response = await axios.get(`${MOCKAPI_BASE_URL}/goals/${req.params.id}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching goal:', error);
    res.status(404).json({ error: 'Goal not found' });
  }
});

// Создать новую цель
app.post('/api/goals', async (req, res) => {
  try {
    const { title, description, type, category, endDate, milestones, keyResults } = req.body;
    
    const newGoal = {
      title,
      description: description || '',
      type: type || 'smart',
      category: category || 'personal',
      status: 'active',
      progress: 0,
      startDate: new Date().toISOString().split('T')[0],
      endDate: endDate || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      milestones: milestones || [],
      keyResults: keyResults || []
    };
    
    const response = await axios.post(`${MOCKAPI_BASE_URL}/goals`, newGoal);
    res.status(201).json(response.data);
  } catch (error) {
    console.error('Error creating goal:', error);
    res.status(500).json({ error: 'Failed to create goal' });
  }
});

// Обновить цель
app.put('/api/goals/:id', async (req, res) => {
  try {
    const { title, description, progress, status, milestones, keyResults } = req.body;
    
    // Сначала получаем текущую цель
    const currentGoal = await axios.get(`${MOCKAPI_BASE_URL}/goals/${req.params.id}`);
    
    const updateData = {
      title: title || currentGoal.data.title,
      description: description !== undefined ? description : currentGoal.data.description,
      progress: progress !== undefined ? progress : currentGoal.data.progress,
      status: status || currentGoal.data.status,
      milestones: milestones || currentGoal.data.milestones,
      keyResults: keyResults || currentGoal.data.keyResults,
      updatedAt: new Date().toISOString()
    };
    
    const response = await axios.put(`${MOCKAPI_BASE_URL}/goals/${req.params.id}`, updateData);
    res.json(response.data);
  } catch (error) {
    console.error('Error updating goal:', error);
    res.status(500).json({ error: 'Failed to update goal' });
  }
});

// Обновить конкретную milestone в цели
app.patch('/api/goals/:goalId/milestones/:milestoneId', async (req, res) => {
  try {
    const { completed } = req.body;
    
    // Получаем текущую цель
    const currentGoal = await axios.get(`${MOCKAPI_BASE_URL}/goals/${req.params.goalId}`);
    const goal = currentGoal.data;
    
    // Обновляем нужную milestone
    const updatedMilestones = goal.milestones.map(m => {
      if (m.id === req.params.milestoneId) {
        return {
          ...m,
          completed: completed,
          completedDate: completed ? new Date().toISOString() : null
        };
      }
      return m;
    });
    
    // Обновляем всю цель
    const response = await axios.put(`${MOCKAPI_BASE_URL}/goals/${req.params.goalId}`, {
      ...goal,
      milestones: updatedMilestones,
      updatedAt: new Date().toISOString()
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Error updating milestone:', error);
    res.status(500).json({ error: 'Failed to update milestone' });
  }
});

// Обновить конкретный key result в цели
app.patch('/api/goals/:goalId/keyresults/:krId', async (req, res) => {
  try {
    const { currentValue } = req.body;
    
    // Получаем текущую цель
    const currentGoal = await axios.get(`${MOCKAPI_BASE_URL}/goals/${req.params.goalId}`);
    const goal = currentGoal.data;
    
    // Обновляем нужный key result
    const updatedKeyResults = goal.keyResults.map(kr => {
      if (kr.id === req.params.krId) {
        return {
          ...kr,
          currentValue: currentValue
        };
      }
      return kr;
    });
    
    // Обновляем всю цель
    const response = await axios.put(`${MOCKAPI_BASE_URL}/goals/${req.params.goalId}`, {
      ...goal,
      keyResults: updatedKeyResults,
      updatedAt: new Date().toISOString()
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Error updating key result:', error);
    res.status(500).json({ error: 'Failed to update key result' });
  }
});

// Удалить цель
app.delete('/api/goals/:id', async (req, res) => {
  try {
    await axios.delete(`${MOCKAPI_BASE_URL}/goals/${req.params.id}`);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting goal:', error);
    res.status(500).json({ error: 'Failed to delete goal' });
  }
});

// ============= ANALYTICS API =============

// Получить аналитику
app.get('/api/analytics', async (req, res) => {
  try {
    const response = await axios.get(`${MOCKAPI_BASE_URL}/analytics`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Обновить аналитику
app.put('/api/analytics/:id', async (req, res) => {
  try {
    const response = await axios.put(`${MOCKAPI_BASE_URL}/analytics/${req.params.id}`, {
      ...req.body,
      lastUpdated: new Date().toISOString()
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error updating analytics:', error);
    res.status(500).json({ error: 'Failed to update analytics' });
  }
});

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
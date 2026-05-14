import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { FiPlus, FiTrash2, FiSave, FiArrowLeft, FiTarget, FiTrendingUp } from 'react-icons/fi';
import axios from 'axios';
import './GoalEditor.css';

const GoalEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
const typeParam = searchParams.get('type');
  const isEditing = !!id;
  
  // Шаг 1: выбор типа цели (только для новых целей)
 const [step, setStep] = useState(isEditing ? 2 : (typeParam ? 2 : 1));
const [selectedType, setSelectedType] = useState(typeParam || 'smart');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'smart',
    category: 'personal',
    endDate: '',
    milestones: [{ id: Date.now().toString(), title: '', targetDate: '' }],
    keyResults: [{ id: Date.now().toString(), title: '', targetValue: 100, unit: '%' }]
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEditing) {
      fetchGoal();
    }
  }, [id]);

  const fetchGoal = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:3001/api/goals/${id}`);
      const goal = response.data;
      setSelectedType(goal.type || 'smart');
      setFormData({
        title: goal.title || '',
        description: goal.description || '',
        type: goal.type || 'smart',
        category: goal.category || 'personal',
        endDate: goal.endDate || '',
        milestones: goal.milestones && goal.milestones.length > 0 
          ? goal.milestones 
          : [{ id: Date.now().toString(), title: '', targetDate: '' }],
        keyResults: goal.keyResults && goal.keyResults.length > 0 
          ? goal.keyResults 
          : [{ id: Date.now().toString(), title: '', targetValue: 100, unit: '%' }]
      });
    } catch (error) {
      console.error('Error fetching goal:', error);
      navigate('/404');
    } finally {
      setLoading(false);
    }
  };

  const selectType = (type) => {
    setSelectedType(type);
    setFormData({ ...formData, type });
    setStep(2);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addMilestone = () => {
    setFormData({
      ...formData,
      milestones: [...formData.milestones, { id: Date.now().toString(), title: '', targetDate: '' }]
    });
  };

  const removeMilestone = (id) => {
    setFormData({
      ...formData,
      milestones: formData.milestones.filter(m => m.id !== id)
    });
  };

  const updateMilestone = (id, field, value) => {
    setFormData({
      ...formData,
      milestones: formData.milestones.map(m => 
        m.id === id ? { ...m, [field]: value } : m
      )
    });
  };

  const addKeyResult = () => {
    setFormData({
      ...formData,
      keyResults: [...formData.keyResults, { id: Date.now().toString(), title: '', targetValue: 100, unit: '%' }]
    });
  };

  const removeKeyResult = (id) => {
    setFormData({
      ...formData,
      keyResults: formData.keyResults.filter(kr => kr.id !== id)
    });
  };

  const updateKeyResult = (id, field, value) => {
    setFormData({
      ...formData,
      keyResults: formData.keyResults.map(kr => 
        kr.id === id ? { ...kr, [field]: value } : kr
      )
    });
  };
const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
  const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Проверка: должна быть хотя бы одна веха или один ключевой результат
  if (formData.milestones.length === 0 && formData.keyResults.length === 0) {
    alert(selectedType === 'okr' 
      ? 'Добавьте хотя бы одну веху или ключевой результат' 
      : 'Добавьте хотя бы один шаг выполнения'
    );
    return;
  }
  
  // Проверка для OKR: key results должны быть заполнены если есть
  if (selectedType === 'okr' && formData.keyResults.length > 0) {
    const emptyKR = formData.keyResults.find(kr => !kr.title.trim());
    if (emptyKR) {
      alert('Заполните все ключевые результаты или удалите пустые');
      return;
    }
  }
  
  // Проверка: milestones должны быть заполнены если есть
  if (formData.milestones.length > 0) {
    const emptyMilestone = formData.milestones.find(m => !m.title.trim());
    if (emptyMilestone) {
      alert('Заполните все вехи/шаги или удалите пустые');
      return;
    }
  }
  
  try {
    if (isEditing) {
      await axios.put(`http://localhost:3001/api/goals/${id}`, formData);
    } else {
      await axios.post('http://localhost:3001/api/goals', formData);
    }
    navigate('/goals');
  } catch (error) {
    console.error('Error saving goal:', error);
    alert('Ошибка при сохранении цели');
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
      className="goal-editor"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="editor-header">
        <button onClick={() => step === 1 ? navigate('/goals') : setStep(1)} className="btn btn-secondary">
          <FiArrowLeft /> {step === 1 ? 'НАЗАД' : 'К ВЫБОРУ ТИПА'}
        </button>
        <h1>{isEditing ? 'РЕДАКТИРОВАНИЕ ЦЕЛИ' : 'НОВАЯ ЦЕЛЬ'}</h1>
      </div>

      {/* Шаг 1: Выбор типа цели */}
      {step === 1 && !isEditing && (
        <motion.div 
          className="type-selection"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2>ВЫБЕРИТЕ ТИП ЦЕЛИ</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px', fontSize: '14px' }}>
            От типа цели зависит структура её создания
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'var(--border)', border: '1px solid var(--border)' }}>
            <motion.div
              className="type-card"
              onClick={() => selectType('okr')}
              whileHover={{ backgroundColor: '#F8F8F8' }}
              style={{ 
                background: 'var(--surface)', 
                padding: '40px 32px', 
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              <div style={{ fontSize: '32px', marginBottom: '16px', color: 'var(--text)' }}>
                <FiTrendingUp />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px', letterSpacing: '-0.01em' }}>OKR</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.6', marginBottom: '16px' }}>
                Objectives & Key Results — амбициозная цель с измеримыми ключевыми результатами
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>• Вдохновляющая цель</span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>• Ключевые результаты (KRs)</span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>• Вехи для отслеживания</span>
              </div>
            </motion.div>

            <motion.div
              className="type-card"
              onClick={() => selectType('smart')}
              whileHover={{ backgroundColor: '#F8F8F8' }}
              style={{ 
                background: 'var(--surface)', 
                padding: '40px 32px', 
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              <div style={{ fontSize: '32px', marginBottom: '16px', color: 'var(--text)' }}>
                <FiTarget />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '12px', letterSpacing: '-0.01em' }}>SMART</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.6', marginBottom: '16px' }}>
                Specific, Measurable, Achievable, Relevant, Time-bound — конкретная измеримая задача
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>• Конкретная задача</span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>• Чёткие критерии успеха</span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>• Дедлайн и вехи</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Шаг 2: Форма создания */}
      {(step === 2 || isEditing) && (
        <form onSubmit={handleSubmit} className="editor-form">
          <div className="form-section">
            <h2>
              {selectedType === 'okr' ? 'OKR — ЦЕЛИ И КЛЮЧЕВЫЕ РЕЗУЛЬТАТЫ' : 'SMART — КОНКРЕТНАЯ ЗАДАЧА'}
            </h2>
            
            <div className="form-group">
              <label>{selectedType === 'okr' ? 'OBJECTIVE (АМБИЦИОЗНАЯ ЦЕЛЬ)' : 'НАЗВАНИЕ ЦЕЛИ'}</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="input-field"
                placeholder={selectedType === 'okr' ? 'Например: Стать лучшим разработчиком в компании' : 'Например: Выучить React до уровня Middle'}
                required
              />
            </div>

            <div className="form-group">
              <label>ОПИСАНИЕ</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="input-field"
                rows="3"
                placeholder={selectedType === 'okr' ? 'Почему эта цель важна? Какой результат вы хотите достичь?' : 'Опишите цель подробнее. Как вы поймёте что достигли её?'}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>КАТЕГОРИЯ</label>
                <select name="category" value={formData.category} onChange={handleChange} className="input-field">
                  <option value="personal">Личное</option>
                  <option value="education">Образование</option>
                  <option value="career">Карьера</option>
                  <option value="health">Здоровье</option>
                  <option value="finance">Финансы</option>
                </select>
              </div>

              <div className="form-group">
                <label>ДЕДЛАЙН</label>
                <input
  type="date"
  name="endDate"
  value={formData.endDate}
  onChange={handleChange}
  className="input-field"
  min={getTodayDate()}
/>
              </div>
            </div>
          </div>

          {/* Секция Key Results — только для OKR */}
         {/* Секция Key Results — только для OKR */}
{selectedType === 'okr' && (
  formData.keyResults.length > 0 ? (
    <div className="form-section">
      <div className="section-header">
        <h2>КЛЮЧЕВЫЕ РЕЗУЛЬТАТЫ (KEY RESULTS)</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="button" onClick={addKeyResult} className="btn btn-secondary">
            <FiPlus /> ДОБАВИТЬ
          </button>
          <button 
            type="button" 
            onClick={() => setFormData({ ...formData, keyResults: [] })}
            className="btn btn-secondary"
          >
            УБРАТЬ ВСЕ
          </button>
        </div>
      </div>
      <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '20px', marginTop: '-12px', lineHeight: '1.6' }}>
        <p style={{ marginBottom: '8px' }}><strong>Ключевые результаты</strong> — измеримые показатели успеха. Отвечают на вопрос <strong>«СКОЛЬКО?»</strong></p>
        <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Пример: «Провести 5 технических собеседований», «Увеличить продажи на 30%»</p>
      </div>
      
      {formData.keyResults.map((kr, index) => (
        <motion.div 
          key={kr.id}
          className="kr-item"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="form-row">
            <div className="form-group flex-1">
              <label>КЛЮЧЕВОЙ РЕЗУЛЬТАТ {index + 1}</label>
              <input
                type="text"
                value={kr.title}
                onChange={(e) => updateKeyResult(kr.id, 'title', e.target.value)}
                className="input-field"
                placeholder="Например: Провести 5 технических собеседований"
              />
            </div>
            <div className="form-group">
              <label>ЦЕЛЬ</label>
              <input
                type="number"
                value={kr.targetValue}
                onChange={(e) => updateKeyResult(kr.id, 'targetValue', e.target.value)}
                className="input-field"
              />
            </div>
            <div className="form-group">
              <label>ЕД.</label>
              <input
                type="text"
                value={kr.unit}
                onChange={(e) => updateKeyResult(kr.id, 'unit', e.target.value)}
                className="input-field"
                placeholder="шт/%/кг"
              />
            </div>
            <button 
              type="button" 
              onClick={() => removeKeyResult(kr.id)}
              className="btn-icon delete"
            >
              <FiTrash2 />
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  ) : (
    <div className="form-section">
      <button 
        type="button" 
        onClick={addKeyResult}
        className="btn btn-secondary"
        style={{ width: '100%', justifyContent: 'center', padding: '16px' }}
      >
        <FiPlus /> ДОБАВИТЬ КЛЮЧЕВЫЕ РЕЗУЛЬТАТЫ
      </button>
    </div>
  )
)}
          {/* Секция Milestones — для обоих типов */}
{formData.milestones.length > 0 ? (
  <div className="form-section">
    <div className="section-header">
      <h2>{selectedType === 'okr' ? 'ВЕХИ (MILESTONES)' : 'ЭТАПЫ ВЫПОЛНЕНИЯ'}</h2>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button type="button" onClick={addMilestone} className="btn btn-secondary">
          <FiPlus /> ДОБАВИТЬ
        </button>
        <button 
          type="button" 
          onClick={() => setFormData({ ...formData, milestones: [] })}
          className="btn btn-secondary"
        >
          УБРАТЬ ВСЕ
        </button>
      </div>
    </div>
    <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '20px', marginTop: '-12px', lineHeight: '1.6' }}>
      {selectedType === 'okr' ? (
        <>
          <p style={{ marginBottom: '8px' }}><strong>Вехи</strong> — контрольные точки во времени. Отвечают на вопрос <strong>«КОГДА И ЧТО?»</strong></p>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Пример: «Пройти курс по найму к 1 июля», «Запустить проект к 15 сентября»</p>
        </>
      ) : (
        <>
          <p style={{ marginBottom: '8px' }}><strong>Шаги</strong> — конкретные действия для выполнения задачи</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Пример: «Купить абонемент в зал», «Найти учебные материалы»</p>
        </>
      )}
    </div>
    
    {formData.milestones.map((milestone, index) => (
      <motion.div 
        key={milestone.id}
        className="milestone-item"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <div className="form-row">
          <div className="form-group flex-1">
            <label>{selectedType === 'okr' ? `ВЕХА ${index + 1}` : `ШАГ ${index + 1}`}</label>
            <input
              type="text"
              value={milestone.title}
              onChange={(e) => updateMilestone(milestone.id, 'title', e.target.value)}
              className="input-field"
              placeholder={selectedType === 'okr' ? 'Например: Пройти курс по найму' : 'Например: Купить абонемент в зал'}
            />
          </div>
          <div className="form-group">
            <label>ДАТА</label>
            <input
              type="date"
              value={milestone.targetDate}
              onChange={(e) => updateMilestone(milestone.id, 'targetDate', e.target.value)}
              className="input-field"
              min={getTodayDate()}
            />
          </div>
          <button 
            type="button" 
            onClick={() => removeMilestone(milestone.id)}
            className="btn-icon delete"
          >
            <FiTrash2 />
          </button>
        </div>
      </motion.div>
    ))}
  </div>
) : (
  <div className="form-section">
    <button 
      type="button" 
      onClick={addMilestone}
      className="btn btn-secondary"
      style={{ width: '100%', justifyContent: 'center', padding: '16px' }}
    >
      <FiPlus /> ДОБАВИТЬ {selectedType === 'okr' ? 'ВЕХИ' : 'ЭТАПЫ'}
    </button>
  </div>
)}

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              <FiSave /> {isEditing ? 'СОХРАНИТЬ' : 'СОЗДАТЬ ЦЕЛЬ'}
            </button>
          </div>
        </form>
      )}
    </motion.div>
  );
};

export default GoalEditor;
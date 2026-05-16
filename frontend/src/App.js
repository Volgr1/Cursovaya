import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import GoalsList from './pages/GoalsList';
import GoalEditor from './pages/GoalEditor';
import GoalDetail from './pages/GoalDetail';
import Analytics from './pages/Analytics';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import './styles/global.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Routes>
            {/* Публичные страницы без Header/Footer */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/404" element={<NotFound />} />
            
            {/* Защищённые страницы с Header и Footer */}
            <Route path="*" element={
              <ProtectedRoute>
                <>
                  <Header />
                  <main className="main-content">
                    <AnimatePresence mode="wait">
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/goals" element={<GoalsList />} />
                        <Route path="/goals/new" element={<GoalEditor />} />
                        <Route path="/goals/:id" element={<GoalDetail />} />
                        <Route path="/goals/:id/edit" element={<GoalEditor />} />
                        <Route path="/analytics" element={<Analytics />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </AnimatePresence>
                  </main>
                  <Footer />
                </>
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
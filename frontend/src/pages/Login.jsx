import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiAlertCircle, FiArrowRight } from 'react-icons/fi';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <motion.div 
        className="auth-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="auth-header">
          <div className="auth-logo">
            <span className="logo-accent">A</span>daptZip
          </div>
          <h1>Welcome Back</h1>
          <p>Login to access your adaptive compression dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <motion.div className="error-message" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <FiAlertCircle /> {error}
            </motion.div>
          )}

          <div className="form-group">
            <label>Email Address</label>
            <div className="input-with-icon">
              <FiMail className="input-icon" />
              <input 
                type="email" 
                placeholder="name@company.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div className="label-row">
              <label>Password</label>
            </div>
            <div className="input-with-icon">
              <FiLock className="input-icon" />
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Logging in...' : (
              <>
                Continue <FiArrowRight />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/signup">Create one for free</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

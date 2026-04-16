import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { FiUser, FiMail, FiLock, FiAlertCircle, FiArrowRight, FiShield, FiRefreshCw } from 'react-icons/fi';
import './Login.css'; // Reuse common auth styles

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    captchaAnswer: ''
  });
  const [captcha, setCaptcha] = useState({ id: '', question: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signup, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/dashboard');
    fetchCaptcha();
  }, [user, navigate]);

  const fetchCaptcha = async () => {
    try {
      const res = await api.get('/auth/captcha');
      setCaptcha(res.data);
    } catch (err) {
      console.error('Failed to fetch captcha');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }
    
    setLoading(true);
    setError('');
    
    try {
      await signup({
        ...formData,
        captchaId: captcha.captchaId
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed. Please try again.');
      fetchCaptcha(); // Refresh captcha on error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <motion.div 
        className="auth-card signup-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="auth-header">
          <div className="auth-logo">
            <span className="logo-accent">A</span>daptZip
          </div>
          <h1>Create Account</h1>
          <p>Join the future of high-performance scientific data archiving</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <motion.div className="error-message" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <FiAlertCircle /> {error}
            </motion.div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label>Full Name</label>
              <div className="input-with-icon">
                <FiUser className="input-icon" />
                <input 
                  type="text" 
                  name="name"
                  placeholder="John Doe" 
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <div className="input-with-icon">
              <FiMail className="input-icon" />
              <input 
                type="email" 
                name="email"
                placeholder="john@example.com" 
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Password (min 8 chars)</label>
              <div className="input-with-icon">
                <FiLock className="input-icon" />
                <input 
                  type="password" 
                  name="password"
                  placeholder="••••••••" 
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Confirm Password</label>
              <div className="input-with-icon">
                <FiLock className="input-icon" />
                <input 
                  type="password" 
                  name="confirmPassword"
                  placeholder="••••••••" 
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-group captcha-group">
            <label>High-Security Verification</label>
            <div className="captcha-box">
              <span className="captcha-question">{captcha.question || 'Loading...'}</span>
              <button type="button" onClick={fetchCaptcha} className="refresh-captcha">
                <FiRefreshCw />
              </button>
            </div>
            <div className="input-with-icon">
              <FiShield className="input-icon" />
              <input 
                type="number" 
                name="captchaAnswer"
                placeholder="Enter answer" 
                value={formData.captchaAnswer}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? 'Creating Account...' : (
              <>
                Create Account <FiArrowRight />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Login here</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;

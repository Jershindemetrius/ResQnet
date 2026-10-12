import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  
  // Demo accounts for testing
  const demoAccounts = [
    { email: 'citizen@resqnet.com', password: 'citizen123', role: 'Citizen', name: 'John Citizen' },
    { email: 'volunteer@resqnet.com', password: 'volunteer123', role: 'Volunteer', name: 'Sarah Volunteer' },
    { email: 'provider@resqnet.com', password: 'provider123', role: 'Resource Provider', name: 'Mike Provider' },
    { email: 'coordinator@resqnet.com', password: 'coordinator123', role: 'Emergency Coordinator', name: 'Emma Coordinator' },
    { email: 'admin@resqnet.com', password: 'admin123', role: 'Administrator', name: 'Admin User' }
  ];

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');

  // Load remembered email on component mount
  useState(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setFormData(prev => ({ ...prev, email: rememberedEmail }));
      setRememberMe(true);
    }
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (generalError) {
      setGeneralError('');
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!formData.email.includes('@') || !formData.email.includes('.')) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Role validation
    if (!formData.role) {
      newErrors.role = 'Please select a role';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    setGeneralError('');

    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    // Simulate API call with 1 second delay
    setTimeout(() => {
      // Find matching account
      const account = demoAccounts.find(
        acc => acc.email.toLowerCase() === formData.email.toLowerCase() && 
               acc.password === formData.password
      );

      if (!account) {
        setGeneralError('Invalid email or password.');
        setLoading(false);
        return;
      }

      // Check if role matches
      if (account.role !== formData.role) {
        setGeneralError('Invalid role selected for this account.');
        setLoading(false);
        return;
      }

      // Successful login
      const userData = {
        name: account.name,
        email: account.email,
        role: account.role,
        loginTime: new Date().toISOString()
      };
      
      localStorage.setItem('currentUser', JSON.stringify(userData));
      
      // Handle remember me
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', formData.email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      // Redirect based on role
      const roleRoutes = {
        'Citizen': '/citizen-dashboard',
        'Volunteer': '/volunteer-dashboard',
        'Resource Provider': '/provider-dashboard',
        'Emergency Coordinator': '/coordinator-dashboard',
        'Administrator': '/admin-dashboard'
      };

      const dashboardRoute = roleRoutes[account.role] || '/';
      
      setTimeout(() => {
        navigate(dashboardRoute);
      }, 500);
    }, 1000);
  };

  // Handle clear/reset
  const handleClear = () => {
    setFormData({
      email: '',
      password: '',
      role: ''
    });
    setErrors({});
    setGeneralError('');
    setShowPassword(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          {/* Logo and Header */}
          <div className="auth-header">
            <div className="logo-circle">
              <Icon icon="mdi:lifebuoy" className="logo-icon" />
            </div>
            <h1 className="auth-title">ResQNet</h1>
            <p className="auth-subtitle">Community Emergency Resource Management System</p>
          </div>

          <h2 className="form-title">Welcome Back</h2>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="auth-form">
            {/* General Error Message */}
            {generalError && (
              <div className="alert-error">
                <Icon icon="mdi:alert-circle-outline" />
                <span>{generalError}</span>
              </div>
            )}

            {/* Email Field */}
            <div className="input-group">
              <label htmlFor="email" className="input-label">
                <Icon icon="mdi:email-outline" />
                Email or Username
              </label>
              <input
                type="text"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email or username"
                className={`input-field ${errors.email ? 'input-error' : ''}`}
                disabled={loading}
              />
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            {/* Password Field */}
            <div className="input-group">
              <label htmlFor="password" className="input-label">
                <Icon icon="mdi:lock-outline" />
                Password
              </label>
              <div className="input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className={`input-field ${errors.password ? 'input-error' : ''}`}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="input-icon-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <Icon icon={showPassword ? 'mdi:eye-off-outline' : 'mdi:eye-outline'} />
                </button>
              </div>
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>

            {/* Role Selection */}
            <div className="input-group">
              <label htmlFor="role" className="input-label">
                <Icon icon="mdi:account-group-outline" />
                Role
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={`input-field select-field ${errors.role ? 'input-error' : ''}`}
                disabled={loading}
              >
                <option value="">Select Role</option>
                <option value="Citizen">Citizen</option>
                <option value="Volunteer">Volunteer</option>
                <option value="Resource Provider">Resource Provider</option>
                <option value="Emergency Coordinator">Emergency Coordinator</option>
                <option value="Administrator">Administrator</option>
              </select>
              {errors.role && <span className="error-text">{errors.role}</span>}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="form-options">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading}
                />
                <span className="checkbox-label">Remember me</span>
              </label>
              <a href="/forgot-password" className="link-text">
                Forgot password?
              </a>
            </div>

            {/* Action Buttons */}
            <div className="button-group">
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Icon icon="mdi:loading" className="spin-icon" />
                    Logging in...
                  </>
                ) : (
                  <>
                    <Icon icon="mdi:login" />
                    Login
                  </>
                )}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleClear}
                disabled={loading}
              >
                <Icon icon="mdi:close-circle-outline" />
                Clear
              </button>
            </div>
          </form>

          {/* Sign Up Link */}
          <div className="auth-footer">
            <p className="footer-text">
              Don't have an account? <a href="/signup" className="link-text">Sign Up</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;


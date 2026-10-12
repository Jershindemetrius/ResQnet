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
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);
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

    // Check if all fields are filled
    if (!formData.email || !formData.password || !formData.role) {
      setGeneralError('Please fill in all fields.');
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
      // Store user data in localStorage
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

      // Show success message
      setGeneralError('');
      
      // Redirect based on role
      const roleRoutes = {
        'Citizen': '/citizen-dashboard',
        'Volunteer': '/volunteer-dashboard',
        'Resource Provider': '/provider-dashboard',
        'Emergency Coordinator': '/coordinator-dashboard',
        'Administrator': '/admin-dashboard'
      };

      const dashboardRoute = roleRoutes[account.role] || '/';
      
      // Navigate to dashboard
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

  // Quick login with demo account
  const quickLogin = (account) => {
    setFormData({
      email: account.email,
      password: account.password,
      role: account.role
    });
    setShowDemoAccounts(false);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          {/* Logo and Header */}
          <div className="login-header">
            <div className="logo-container">
              <Icon icon="mdi:lifebuoy" className="logo-icon" />
            </div>
            <h1 className="app-title">ResQNet</h1>
            <p className="app-subtitle">Community Emergency Resource Management System</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="login-form">
            {/* General Error Message */}
            {generalError && (
              <div className={`alert ${generalError.includes('successful') ? 'alert-success' : 'alert-error'}`}>
                <Icon icon={generalError.includes('successful') ? 'mdi:check-circle' : 'mdi:alert-circle'} />
                <span>{generalError}</span>
              </div>
            )}

            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="email">
                <Icon icon="mdi:email" />
                Email or Username
              </label>
              <input
                type="text"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className={errors.email ? 'error' : ''}
                disabled={loading}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label htmlFor="password">
                <Icon icon="mdi:lock" />
                Password
              </label>
              <div className="password-input-container">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className={errors.password ? 'error' : ''}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <Icon icon={showPassword ? 'mdi:eye-off' : 'mdi:eye'} />
                </button>
              </div>
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            {/* Role Selection */}
            <div className="form-group">
              <label htmlFor="role">
                <Icon icon="mdi:account-group" />
                Role
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className={errors.role ? 'error' : ''}
                disabled={loading}
              >
                <option value="">Select Role</option>
                <option value="Citizen">Citizen</option>
                <option value="Volunteer">Volunteer</option>
                <option value="Resource Provider">Resource Provider</option>
                <option value="Emergency Coordinator">Emergency Coordinator</option>
                <option value="Administrator">Administrator</option>
              </select>
              {errors.role && <span className="error-message">{errors.role}</span>}
            </div>

            {/* Remember Me */}
            <div className="form-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading}
                />
                <span>Remember me</span>
              </label>
              <a href="/forgot-password" className="forgot-link">
                Forgot password?
              </a>
            </div>

            {/* Action Buttons */}
            <div className="form-actions">
              <button
                type="submit"
                className="btn-login"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Icon icon="mdi:loading" className="spin" />
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
                className="btn-clear"
                onClick={handleClear}
                disabled={loading}
              >
                <Icon icon="mdi:close-circle" />
                Clear
              </button>
            </div>
          </form>

          {/* Demo Accounts Section */}
          <div className="demo-section">
            <button
              className="demo-toggle"
              onClick={() => setShowDemoAccounts(!showDemoAccounts)}
            >
              <Icon icon={showDemoAccounts ? 'mdi:chevron-up' : 'mdi:chevron-down'} />
              {showDemoAccounts ? 'Hide' : 'Show'} Demo Accounts
            </button>
            
            {showDemoAccounts && (
              <div className="demo-accounts">
                <p className="demo-info">
                  <Icon icon="mdi:information" />
                  Click any account to quick-fill the form
                </p>
                <div className="demo-accounts-grid">
                  {demoAccounts.map((account, index) => (
                    <div
                      key={index}
                      className="demo-account-card"
                      onClick={() => quickLogin(account)}
                    >
                      <div className="demo-account-role">
                        <Icon icon="mdi:account-circle" />
                        {account.role}
                      </div>
                      <div className="demo-account-details">
                        <small>{account.email}</small>
                        <small>{account.password}</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sign Up Link */}
          <div className="signup-link">
            <p>
              Don't have an account?{' '}
              <a href="/signup">Sign Up</a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="login-footer">
          <p>© 2026 ResQNet | Community Emergency Resource Management System</p>
        </footer>
      </div>
    </div>
  );
};

export default Login;

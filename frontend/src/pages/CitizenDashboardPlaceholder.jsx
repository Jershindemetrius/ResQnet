import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';

const CitizenDashboardPlaceholder = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(currentUser));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/login');
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <Icon icon="mdi:lifebuoy" style={styles.logo} />
          <h1 style={styles.title}>ResQNet - Citizen Dashboard</h1>
        </div>
        <button onClick={handleLogout} style={styles.logoutBtn}>
          <Icon icon="mdi:logout" style={{ marginRight: '8px' }} />
          Logout
        </button>
      </div>
      
      <div style={styles.content}>
        <div style={styles.welcomeCard}>
          <Icon icon="mdi:account-circle" style={styles.welcomeIcon} />
          <h2 style={styles.welcomeTitle}>Welcome, {user.name}!</h2>
          <p style={styles.welcomeText}>Role: {user.role}</p>
          <p style={styles.email}>{user.email}</p>
        </div>

        <div style={styles.infoCard}>
          <Icon icon="mdi:information" style={styles.infoIcon} />
          <h3>Citizen Dashboard - Coming Soon</h3>
          <p>Features that will be available:</p>
          <ul style={styles.featureList}>
            <li><Icon icon="mdi:check" style={styles.checkIcon} /> Report Emergency Requests</li>
            <li><Icon icon="mdi:check" style={styles.checkIcon} /> View My Emergency Requests</li>
            <li><Icon icon="mdi:check" style={styles.checkIcon} /> Track Request Status</li>
            <li><Icon icon="mdi:check" style={styles.checkIcon} /> Cancel Pending Requests</li>
            <li><Icon icon="mdi:check" style={styles.checkIcon} /> Update Profile Information</li>
          </ul>
        </div>

        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <Icon icon="mdi:clipboard-alert" style={{ ...styles.statIcon, color: '#e74c3c' }} />
            <h4>My Requests</h4>
            <p style={styles.statValue}>0</p>
          </div>
          <div style={styles.statCard}>
            <Icon icon="mdi:clock-outline" style={{ ...styles.statIcon, color: '#f39c12' }} />
            <h4>Pending</h4>
            <p style={styles.statValue}>0</p>
          </div>
          <div style={styles.statCard}>
            <Icon icon="mdi:check-circle" style={{ ...styles.statIcon, color: '#27ae60' }} />
            <h4>Resolved</h4>
            <p style={styles.statValue}>0</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  header: {
    background: 'white',
    padding: '20px 40px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  logo: {
    width: '40px',
    height: '40px',
    color: '#e74c3c',
  },
  title: {
    margin: 0,
    fontSize: '24px',
    color: '#2c3e50',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 20px',
    background: '#e74c3c',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  },
  content: {
    maxWidth: '1200px',
    margin: '40px auto',
    padding: '0 20px',
  },
  welcomeCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '40px',
    textAlign: 'center',
    marginBottom: '24px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
  welcomeIcon: {
    width: '80px',
    height: '80px',
    color: '#3498db',
    marginBottom: '16px',
  },
  welcomeTitle: {
    margin: '0 0 8px 0',
    fontSize: '32px',
    color: '#2c3e50',
  },
  welcomeText: {
    margin: '8px 0',
    fontSize: '18px',
    color: '#7f8c8d',
  },
  email: {
    margin: '8px 0 0 0',
    fontSize: '14px',
    color: '#95a5a6',
  },
  infoCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '32px',
    marginBottom: '24px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
  infoIcon: {
    width: '32px',
    height: '32px',
    color: '#3498db',
    marginBottom: '16px',
  },
  featureList: {
    listStyle: 'none',
    padding: 0,
    marginTop: '20px',
  },
  checkIcon: {
    color: '#27ae60',
    marginRight: '8px',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
  },
  statCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    textAlign: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
  statIcon: {
    width: '48px',
    height: '48px',
    marginBottom: '12px',
  },
  statValue: {
    fontSize: '36px',
    fontWeight: '700',
    margin: '12px 0 0 0',
    color: '#2c3e50',
  },
};

export default CitizenDashboardPlaceholder;

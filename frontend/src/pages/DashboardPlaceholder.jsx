import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';

const DashboardPlaceholder = ({ roleType }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const roleConfig = {
    'Citizen': {
      title: 'Citizen Dashboard',
      icon: 'mdi:account-circle',
      color: '#3498db',
      features: [
        'Report Emergency Requests',
        'View My Emergency Requests',
        'Track Request Status',
        'Cancel Pending Requests',
        'Update Profile Information'
      ],
      stats: [
        { label: 'My Requests', value: '0', icon: 'mdi:clipboard-alert', color: '#e74c3c' },
        { label: 'Pending', value: '0', icon: 'mdi:clock-outline', color: '#f39c12' },
        { label: 'Resolved', value: '0', icon: 'mdi:check-circle', color: '#27ae60' }
      ]
    },
    'Volunteer': {
      title: 'Volunteer Dashboard',
      icon: 'mdi:account-hard-hat',
      color: '#3498db',
      features: [
        'View Assigned Emergencies',
        'Update Availability Status',
        'Manage Skills and Location',
        'View Emergency Response History',
        'Update Emergency Status'
      ],
      stats: [
        { label: 'Assigned Tasks', value: '0', icon: 'mdi:clipboard-check', color: '#3498db' },
        { label: 'Completed', value: '0', icon: 'mdi:check-circle', color: '#27ae60' },
        { label: 'Availability', value: 'Available', icon: 'mdi:account-check', color: '#27ae60' }
      ]
    },
    'Resource Provider': {
      title: 'Resource Provider Dashboard',
      icon: 'mdi:package-variant',
      color: '#27ae60',
      features: [
        'Add Emergency Resources',
        'Update Resource Availability',
        'View Assigned Resources',
        'Manage Resource Inventory',
        'Track Resource Usage'
      ],
      stats: [
        { label: 'Total Resources', value: '0', icon: 'mdi:package', color: '#27ae60' },
        { label: 'Available', value: '0', icon: 'mdi:check-circle', color: '#27ae60' },
        { label: 'In Use', value: '0', icon: 'mdi:truck-fast', color: '#f39c12' }
      ]
    },
    'Emergency Coordinator': {
      title: 'Emergency Coordinator Dashboard',
      icon: 'mdi:shield-account',
      color: '#e74c3c',
      features: [
        'View All Emergency Requests',
        'Prioritize Emergencies',
        'Use Automatic Resource Matching',
        'Assign Resources and Volunteers',
        'Update Emergency Status',
        'Mark Emergencies as Resolved',
        'Access Dashboard Analytics'
      ],
      stats: [
        { label: 'Active Emergencies', value: '0', icon: 'mdi:alert-circle', color: '#e74c3c' },
        { label: 'Critical', value: '0', icon: 'mdi:alert', color: '#c0392b' },
        { label: 'Resolved Today', value: '0', icon: 'mdi:check-all', color: '#27ae60' }
      ]
    },
    'Administrator': {
      title: 'Administrator Dashboard',
      icon: 'mdi:shield-crown',
      color: '#9b59b6',
      features: [
        'Full System Access',
        'Manage All Users',
        'Manage Resources and Volunteers',
        'View Comprehensive Reports',
        'System Configuration',
        'User Role Management',
        'Access All Dashboards'
      ],
      stats: [
        { label: 'Total Users', value: '0', icon: 'mdi:account-group', color: '#9b59b6' },
        { label: 'Active Emergencies', value: '0', icon: 'mdi:alert', color: '#e74c3c' },
        { label: 'System Status', value: 'Online', icon: 'mdi:server', color: '#27ae60' }
      ]
    }
  };

  const config = roleConfig[roleType] || roleConfig['Citizen'];

  useEffect(() => {
    // Check if user is logged in
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
      navigate('/login');
      return;
    }
    const userData = JSON.parse(currentUser);
    setUser(userData);

    // Verify role matches
    if (userData.role !== roleType) {
      navigate('/login');
    }
  }, [navigate, roleType]);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/login');
  };

  const handleBackToMain = () => {
    navigate('/');
  };

  if (!user) {
    return (
      <div style={styles.loading}>
        <Icon icon="mdi:loading" style={{ width: '48px', height: '48px' }} className="spin" />
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <Icon icon="mdi:lifebuoy" style={styles.logo} />
          <h1 style={styles.title}>ResQNet - {config.title}</h1>
        </div>
        <div style={styles.headerActions}>
          <button onClick={handleBackToMain} style={styles.mainDashboardBtn}>
            <Icon icon="mdi:view-dashboard" style={{ marginRight: '8px' }} />
            Main Dashboard
          </button>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            <Icon icon="mdi:logout" style={{ marginRight: '8px' }} />
            Logout
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div style={styles.content}>
        {/* Welcome Card */}
        <div style={styles.welcomeCard}>
          <Icon icon={config.icon} style={{ ...styles.welcomeIcon, color: config.color }} />
          <h2 style={styles.welcomeTitle}>Welcome, {user.name}!</h2>
          <p style={styles.welcomeText}>Role: {user.role}</p>
          <p style={styles.email}>{user.email}</p>
          <div style={styles.badge}>
            <Icon icon="mdi:shield-check" style={{ marginRight: '6px' }} />
            {roleType}
          </div>
        </div>

        {/* Info Card */}
        <div style={styles.infoCard}>
          <div style={styles.infoHeader}>
            <Icon icon="mdi:information" style={styles.infoIcon} />
            <h3 style={styles.infoTitle}>{config.title} - Coming Soon</h3>
          </div>
          <p style={styles.infoSubtitle}>Features that will be available:</p>
          <ul style={styles.featureList}>
            {config.features.map((feature, index) => (
              <li key={index} style={styles.featureItem}>
                <Icon icon="mdi:check-circle" style={styles.checkIcon} />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Stats Grid */}
        <h3 style={styles.sectionTitle}>Quick Stats</h3>
        <div style={styles.statsGrid}>
          {config.stats.map((stat, index) => (
            <div key={index} style={styles.statCard}>
              <Icon icon={stat.icon} style={{ ...styles.statIcon, color: stat.color }} />
              <h4 style={styles.statLabel}>{stat.label}</h4>
              <p style={{ ...styles.statValue, color: stat.color }}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Coming Soon Notice */}
        <div style={styles.comingSoonCard}>
          <Icon icon="mdi:rocket-launch" style={styles.rocketIcon} />
          <h3>Dashboard Under Development</h3>
          <p>This dashboard is currently being built. All features will be available soon!</p>
          <p style={styles.timestamp}>You logged in at: {new Date(user.loginTime).toLocaleString()}</p>
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
  loading: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    fontSize: '18px',
  },
  header: {
    background: 'white',
    padding: '20px 40px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '16px',
  },
  headerContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  headerActions: {
    display: 'flex',
    gap: '12px',
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
  mainDashboardBtn: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 20px',
    background: '#3498db',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
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
    margin: '8px 0',
    fontSize: '14px',
    color: '#95a5a6',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '8px 16px',
    background: '#e3f2fd',
    color: '#1976d2',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '600',
    marginTop: '16px',
  },
  infoCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '32px',
    marginBottom: '32px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
  infoHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
  },
  infoIcon: {
    width: '32px',
    height: '32px',
    color: '#3498db',
  },
  infoTitle: {
    margin: 0,
    fontSize: '24px',
    color: '#2c3e50',
  },
  infoSubtitle: {
    margin: '8px 0 16px 0',
    fontSize: '16px',
    color: '#7f8c8d',
  },
  featureList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'grid',
    gap: '12px',
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '15px',
    color: '#2c3e50',
  },
  checkIcon: {
    width: '20px',
    height: '20px',
    color: '#27ae60',
    marginRight: '12px',
    flexShrink: 0,
  },
  sectionTitle: {
    color: 'white',
    fontSize: '24px',
    marginBottom: '20px',
    textAlign: 'center',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '32px',
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
  statLabel: {
    margin: '8px 0',
    fontSize: '14px',
    color: '#7f8c8d',
    fontWeight: '600',
  },
  statValue: {
    fontSize: '36px',
    fontWeight: '700',
    margin: '8px 0 0 0',
  },
  comingSoonCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '40px',
    textAlign: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
  rocketIcon: {
    width: '64px',
    height: '64px',
    color: '#f39c12',
    marginBottom: '16px',
  },
  timestamp: {
    marginTop: '16px',
    fontSize: '13px',
    color: '#95a5a6',
  },
};

export default DashboardPlaceholder;

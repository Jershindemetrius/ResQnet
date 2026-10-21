import { useState, useEffect, useMemo } from 'react';
import { Icon } from '@iconify/react';
import './AdminView.css';
import {
  initialUsers,
  initialEmergencies,
  initialConfig,
  initialAuditLogs,
  threatLevels
} from '../data/mockAdminData.js';
import { getStoredOrders } from '../data/ambulanceOrderStore.js';

export default function AdminView({ initialTab = 'overview' }) {
  const normalizeTab = (tab) => {
    if (tab === 'emergencies' || tab === 'dispatches') return 'orders';
    if (tab === 'fleet') return 'incidents';
    if (tab === 'telemetry' || tab === 'telematics') return 'overview';
    return tab || 'overview';
  };

  // Navigation & View State
  const [activeTab, setActiveTab] = useState(() => normalizeTab(initialTab));

  useEffect(() => {
    setActiveTab(normalizeTab(initialTab));
  }, [initialTab]);

  const [threatLevel, setThreatLevel] = useState('LEVEL_1_NORMAL');
  const [activeBroadcast, setActiveBroadcast] = useState(null);

  // Core Data States (persisted in localStorage or initial dataset)
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('resqnet_admin_users');
    return saved ? JSON.parse(saved) : initialUsers;
  });

  const [emergencies, setEmergencies] = useState(() => {
    const saved = localStorage.getItem('resqnet_admin_emergencies');
    return saved ? JSON.parse(saved) : initialEmergencies;
  });

  const [config, setConfig] = useState(() => {
    const saved = localStorage.getItem('resqnet_admin_config');
    return saved ? JSON.parse(saved) : initialConfig;
  });

  const [auditLogs, setAuditLogs] = useState(() => {
    const saved = localStorage.getItem('resqnet_admin_audit');
    return saved ? JSON.parse(saved) : initialAuditLogs;
  });

  // Ambulance Driver Orders Intake State
  const [driverOrders, setDriverOrders] = useState(() => getStoredOrders());
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');

  useEffect(() => {
    const sync = () => setDriverOrders(getStoredOrders());
    window.addEventListener('resqnet:orders-changed', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('resqnet:orders-changed', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const orderStats = useMemo(() => {
    const total = driverOrders.length;
    const taken = driverOrders.filter(o => o.status !== 'PENDING');
    const enRoute = driverOrders.filter(o => ['TAKEN', 'EN_ROUTE', 'ARRIVED', 'IN_TRANSIT'].includes(o.status));
    const completed = driverOrders.filter(o => o.status === 'COMPLETED');
    const pending = driverOrders.filter(o => o.status === 'PENDING');
    const rate = total > 0 ? ((taken.length / total) * 100).toFixed(1) : 0;
    return {
      total,
      takenCount: taken.length,
      enRouteCount: enRoute.length,
      completedCount: completed.length,
      pendingCount: pending.length,
      rate
    };
  }, [driverOrders]);

  // User Filter & Search State
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [userStatusFilter, setUserStatusFilter] = useState('ALL');

  // Audit Logs Filter State
  const [auditSearch, setAuditSearch] = useState('');
  const [auditSeverityFilter, setAuditSeverityFilter] = useState('ALL');

  // Modals State
  const [modalType, setModalType] = useState(null); // 'ADD_USER', 'EDIT_USER', 'DELETE_USER', 'RESET_PWD', 'BROADCAST', 'BACKUP'
  const [selectedUser, setSelectedUser] = useState(null);
  const [backupProgress, setBackupProgress] = useState(0);
  const [backupRunning, setBackupRunning] = useState(false);

  // Form States
  const [userFormData, setUserFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    role: 'VOLUNTEER',
    location: 'Kovilpatti',
    status: 'ACTIVE'
  });

  const [broadcastFormData, setBroadcastFormData] = useState({
    title: 'Severe Weather Warning: Flash Flood Alert',
    audience: 'ALL_SUBSCRIBERS',
    priority: 'HIGH',
    message: 'High precipitation alert for South Block sector. Citizens near embankments move to designated shelter points.'
  });

  // Toasts Feedback State
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('resqnet_admin_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('resqnet_admin_emergencies', JSON.stringify(emergencies));
  }, [emergencies]);

  useEffect(() => {
    localStorage.setItem('resqnet_admin_config', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem('resqnet_admin_audit', JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Log Audit Action Helper
  const logAudit = (action, category, severity, target, status = 'SUCCESS') => {
    const newLog = {
      id: `LOG-${Math.floor(100 + Math.random() * 900)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actor: 'admin',
      category,
      severity,
      action,
      target,
      status
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch =
        u.fullName.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.phone.includes(userSearch) ||
        u.location.toLowerCase().includes(userSearch.toLowerCase());
      const matchesRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
      const matchesStatus = userStatusFilter === 'ALL' || u.status === userStatusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, userSearch, userRoleFilter, userStatusFilter]);

  // Filtered Audit Logs
  const filteredAuditLogs = useMemo(() => {
    return auditLogs.filter(log => {
      const matchesSearch =
        log.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
        log.target.toLowerCase().includes(auditSearch.toLowerCase()) ||
        log.actor.toLowerCase().includes(auditSearch.toLowerCase());
      const matchesSeverity = auditSeverityFilter === 'ALL' || log.severity === auditSeverityFilter;
      return matchesSearch && matchesSeverity;
    });
  }, [auditLogs, auditSearch, auditSeverityFilter]);

  // User Stats Calculation
  const userStats = useMemo(() => {
    return {
      total: users.length,
      coordinators: users.filter(u => u.role === 'COORDINATOR').length,
      volunteers: users.filter(u => u.role === 'VOLUNTEER').length,
      providers: users.filter(u => u.role === 'RESOURCE_PROVIDER').length,
      citizens: users.filter(u => u.role === 'CITIZEN').length,
      suspended: users.filter(u => u.status === 'SUSPENDED').length
    };
  }, [users]);

  // Emergency Stats
  const emergencyStats = useMemo(() => {
    const active = emergencies.filter(e => e.status !== 'RESOLVED');
    return {
      totalActive: active.length,
      critical: active.filter(e => e.priority === 'CRITICAL').length,
      high: active.filter(e => e.priority === 'HIGH').length,
      medium: active.filter(e => e.priority === 'MEDIUM').length,
      low: active.filter(e => e.priority === 'LOW').length,
      resolved: emergencies.filter(e => e.status === 'RESOLVED').length
    };
  }, [emergencies]);

  // User Management Actions
  const handleOpenAddUser = () => {
    setUserFormData({
      fullName: '',
      username: '',
      email: '',
      phone: '',
      role: 'VOLUNTEER',
      location: 'Kovilpatti',
      status: 'ACTIVE'
    });
    setModalType('ADD_USER');
  };

  const handleOpenEditUser = (user) => {
    setSelectedUser(user);
    setUserFormData({
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      phone: user.phone,
      role: user.role,
      location: user.location,
      status: user.status
    });
    setModalType('EDIT_USER');
  };

  const handleSaveAddUser = (e) => {
    e.preventDefault();
    if (!userFormData.fullName || !userFormData.username || !userFormData.email) {
      addToast('Please fill in all mandatory fields', 'warn');
      return;
    }
    const newUser = {
      userId: `USR-0${users.length + 1}`,
      ...userFormData,
      lastLogin: 'Never',
      createdAt: new Date().toISOString().split('T')[0],
      badge: userFormData.role === 'ADMINISTRATOR' ? 'Admin' : 'New Member'
    };
    setUsers(prev => [newUser, ...prev]);
    logAudit(`New User Account Created (${newUser.username})`, 'USER_MGMT', 'INFO', `ID: ${newUser.userId}, Role: ${newUser.role}`);
    addToast(`User ${newUser.fullName} created successfully`);
    setModalType(null);
  };

  const handleSaveEditUser = (e) => {
    e.preventDefault();
    setUsers(prev => prev.map(u => (u.userId === selectedUser.userId ? { ...u, ...userFormData } : u)));
    logAudit(`User Profile Modified (${selectedUser.username})`, 'USER_MGMT', 'INFO', `Updated role to ${userFormData.role}, status: ${userFormData.status}`);
    addToast(`User ${selectedUser.username} updated successfully`);
    setModalType(null);
  };

  const handleToggleUserStatus = (user) => {
    const nextStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    setUsers(prev => prev.map(u => (u.userId === user.userId ? { ...u, status: nextStatus } : u)));
    logAudit(
      `User Status Altered (${user.username})`,
      'USER_MGMT',
      nextStatus === 'SUSPENDED' ? 'WARNING' : 'INFO',
      `Status toggled from ${user.status} to ${nextStatus}`
    );
    addToast(`Account for ${user.username} is now ${nextStatus}`, nextStatus === 'ACTIVE' ? 'success' : 'warn');
  };

  const handleDeleteUser = () => {
    if (!selectedUser) return;
    setUsers(prev => prev.filter(u => u.userId !== selectedUser.userId));
    logAudit(`User Account Deleted (${selectedUser.username})`, 'USER_MGMT', 'WARNING', `Deleted ID: ${selectedUser.userId}`);
    addToast(`User ${selectedUser.username} removed from system`, 'warn');
    setModalType(null);
  };

  // Emergency Overrides
  const handleOverrideStatus = (requestId, newStatus) => {
    setEmergencies(prev => prev.map(e => (e.requestId === requestId ? { ...e, status: newStatus } : e)));
    logAudit(`Emergency Status Override`, 'EMERGENCY', 'WARNING', `${requestId} forced to ${newStatus}`);
    addToast(`${requestId} status updated to ${newStatus}`);
  };

  const handleOverridePriority = (requestId, newPriority) => {
    setEmergencies(prev => prev.map(e => (e.requestId === requestId ? { ...e, priority: newPriority } : e)));
    logAudit(`Emergency Priority Override`, 'EMERGENCY', 'WARNING', `${requestId} priority changed to ${newPriority}`);
    addToast(`${requestId} priority updated to ${newPriority}`);
  };

  // Broadcast Alert Actions
  const handleTriggerBroadcast = (e) => {
    e.preventDefault();
    const alertBanner = {
      id: Date.now(),
      title: broadcastFormData.title,
      priority: broadcastFormData.priority,
      message: broadcastFormData.message,
      time: 'Just now'
    };
    setActiveBroadcast(alertBanner);
    logAudit(`Civil Defense Broadcast Issued`, 'SECURITY', 'CRITICAL', `Target: ${broadcastFormData.audience} | ${broadcastFormData.title}`);
    addToast(`Emergency Broadcast dispatched to ${broadcastFormData.audience}`, 'warn');
    setModalType(null);
  };

  // Database Backup Simulator
  const handleStartBackup = () => {
    setBackupRunning(true);
    setBackupProgress(10);
    const interval = setInterval(() => {
      setBackupProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setBackupRunning(false);
          logAudit('Database Snapshot Exported', 'BACKUP', 'INFO', `Generated snapshot resqnet_db_${Date.now()}.sql`);
          addToast('Database snapshot archived successfully');
          return 100;
        }
        return prev + 25;
      });
    }, 400);
  };

  // Download Simulated Backup File
  const handleDownloadBackupFile = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      version: "ResQNet-v2.4",
      exportTimestamp: new Date().toISOString(),
      users,
      emergencies,
      config,
      auditLogs
    }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `resqnet_db_snapshot_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addToast('Backup snapshot JSON downloaded to device');
  };

  // Export Users as CSV
  const handleExportUsersCsv = () => {
    const headers = 'User ID,Full Name,Username,Email,Phone,Role,Location,Status,Created At\n';
    const rows = users.map(u => `"${u.userId}","${u.fullName}","${u.username}","${u.email}","${u.phone}","${u.role}","${u.location}","${u.status}","${u.createdAt}"`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `resqnet_users_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    addToast('User directory exported to CSV');
  };

  // Reset to Factory Demo State
  const handleResetDemoData = () => {
    if (window.confirm('Reset all admin configuration, users, and override data to initial factory defaults?')) {
      localStorage.removeItem('resqnet_admin_users');
      localStorage.removeItem('resqnet_admin_emergencies');
      localStorage.removeItem('resqnet_admin_config');
      localStorage.removeItem('resqnet_admin_audit');
      setUsers(initialUsers);
      setEmergencies(initialEmergencies);
      setConfig(initialConfig);
      setAuditLogs(initialAuditLogs);
      setActiveBroadcast(null);
      addToast('System restored to default factory baseline');
    }
  };

  return (
    <div className="admin-page">
      {/* --------------------------------------------------------------------
          TOP COMMAND BAR & CONTROLS
          -------------------------------------------------------------------- */}
      <section className="admin-command-bar">
        <div className="command-bar-main">
          <div className="command-brand-wrap">
            <div className="command-shield-icon">
              <Icon icon="mdi:shield-crown" width="32" height="32" />
            </div>
            <div className="command-title-wrap">
              <h1>
                ResQNet Central Command
                <span className="command-badge">Level 5 Root</span>
              </h1>
              <p className="command-subtitle">
                <span className="command-status-dot"></span>
                System Operational &bull; Auth Session: <strong style={{ color: '#fff' }}>admin@resqnet.com</strong>
              </p>
            </div>
          </div>

          <div className="command-actions">
            <button
              className="admin-btn admin-btn-broadcast"
              onClick={() => setModalType('BROADCAST')}
              title="Issue emergency broadcast alert"
            >
              <Icon icon="mdi:bullhorn" width="18" height="18" />
              Emergency Broadcast
            </button>

            <button
              className="admin-btn admin-btn-secondary"
              onClick={() => {
                setBackupProgress(0);
                setBackupRunning(false);
                setModalType('BACKUP');
              }}
              title="Snapshot current system state"
            >
              <Icon icon="mdi:database-sync" width="18" height="18" />
              Backup DB
            </button>

            <button
              className="admin-btn admin-btn-secondary"
              onClick={handleResetDemoData}
              title="Reset data to factory baseline"
            >
              <Icon icon="mdi:refresh" width="18" height="18" />
              Reset State
            </button>
          </div>
        </div>

        {/* DEFCON Threat Selector Strip */}
        <div className="command-threat-strip">
          <div className="threat-selector-wrap">
            <span className="threat-label">System Readiness:</span>
            <div className="threat-pills">
              {Object.entries(threatLevels).map(([key, t]) => (
                <button
                  key={key}
                  className={`threat-pill ${threatLevel === key ? 'active' : ''}`}
                  style={{
                    backgroundColor: threatLevel === key ? t.color : undefined
                  }}
                  onClick={() => {
                    setThreatLevel(key);
                    logAudit(`Threat Level Changed to ${t.level}`, 'SECURITY', 'WARNING', t.label);
                    addToast(`Readiness updated to ${t.level} (${t.label})`, 'info');
                  }}
                >
                  {t.level}: {t.label}
                </button>
              ))}
            </div>
          </div>

          <div className="command-meta-info">
            <div className="command-meta-item">
              <Icon icon="mdi:clock-outline" width="16" height="16" />
              <span>SLA Target: <strong>&lt; 5 mins</strong></span>
            </div>
            <div className="command-meta-item">
              <Icon icon="mdi:server-network" width="16" height="16" />
              <span>Node Latency: <strong>14ms</strong></span>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------------------
          ACTIVE EMERGENCY BROADCAST BANNER (IF TRIGGERED)
          -------------------------------------------------------------------- */}
      {activeBroadcast && (
        <aside className="admin-broadcast-banner">
          <div className="banner-left">
            <div className="banner-pulse-icon">
              <Icon icon="mdi:alert-octagon" width="24" height="24" />
            </div>
            <div className="banner-content">
              <h4>
                <span>🚨 CIVIL DEFENSE ALERT: {activeBroadcast.title}</span>
                <span style={{ fontSize: '11px', background: 'rgba(0,0,0,0.25)', padding: '2px 8px', borderRadius: '4px' }}>
                  {activeBroadcast.priority}
                </span>
              </h4>
              <p>{activeBroadcast.message}</p>
            </div>
          </div>
          <button
            className="banner-close"
            onClick={() => setActiveBroadcast(null)}
            title="Dismiss active broadcast"
          >
            <Icon icon="mdi:close" width="20" height="20" />
          </button>
        </aside>
      )}

      {/* --------------------------------------------------------------------
          ADMIN NAVIGATION TABS
          -------------------------------------------------------------------- */}
      <nav className="admin-tabs-nav" aria-label="Admin console navigation">
        <button
          className={`admin-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <Icon icon="mdi:view-dashboard-outline" width="18" height="18" />
          Command Overview
        </button>

        <button
          className={`admin-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <Icon icon="mdi:account-group" width="18" height="18" />
          User &amp; RBAC Directory
          <span className="tab-badge">{users.length}</span>
        </button>

        <button
          className={`admin-tab-btn ${activeTab === 'config' ? 'active' : ''}`}
          onClick={() => setActiveTab('config')}
        >
          <Icon icon="mdi:tune" width="18" height="18" />
          Matching Engine &amp; Rules
        </button>

        <button
          className={`admin-tab-btn ${activeTab === 'incidents' ? 'active' : ''}`}
          onClick={() => setActiveTab('incidents')}
        >
          <Icon icon="mdi:shield-alert" width="18" height="18" />
          Incident Command Override
          <span className="tab-badge">{emergencyStats.totalActive}</span>
        </button>

        <button
          className={`admin-tab-btn ${activeTab === 'audit' ? 'active' : ''}`}
          onClick={() => setActiveTab('audit')}
        >
          <Icon icon="mdi:history" width="18" height="18" />
          Audit Trail &amp; Logs
        </button>

        <button
          className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          <Icon icon="mdi:ambulance" width="18" height="18" />
          Driver Orders Intake
          <span className="tab-badge">{driverOrders.length}</span>
        </button>
      </nav>

      {/* ====================================================================
          TAB 1: COMMAND OVERVIEW & NODE HEALTH
          ==================================================================== */}
      {activeTab === 'overview' && (
        <div className="tab-pane-fade">
          {/* Top KPI Cards */}
          <div className="admin-kpi-grid">
            <div className="admin-kpi-card">
              <div className="kpi-top">
                <span className="kpi-title">Active Emergencies</span>
                <div className="kpi-icon-wrap red">
                  <Icon icon="mdi:alert-circle" width="22" height="22" />
                </div>
              </div>
              <div className="kpi-value">{emergencyStats.totalActive}</div>
              <div className="kpi-subtext">
                <span className="kpi-badge warn">● {emergencyStats.critical} Critical</span>
                <span>{emergencyStats.high} High &bull; {emergencyStats.resolved} Resolved</span>
              </div>
            </div>

            <div className="admin-kpi-card">
              <div className="kpi-top">
                <span className="kpi-title">Total Users Enrolled</span>
                <div className="kpi-icon-wrap blue">
                  <Icon icon="mdi:account-multiple" width="22" height="22" />
                </div>
              </div>
              <div className="kpi-value">{userStats.total}</div>
              <div className="kpi-subtext">
                <span className="kpi-badge up">+{userStats.volunteers} Volunteers</span>
                <span>{userStats.coordinators} Coordinators</span>
              </div>
            </div>

            <div className="admin-kpi-card">
              <div className="kpi-top">
                <span className="kpi-title">Ambulance Driver Intake</span>
                <div className="kpi-icon-wrap red" style={{ background: '#fef2f2', color: '#e74c3c' }}>
                  <Icon icon="mdi:ambulance" width="22" height="22" />
                </div>
              </div>
              <div className="kpi-value">{orderStats.rate}%</div>
              <div className="kpi-subtext">
                <span className="kpi-badge up">{orderStats.takenCount} / {orderStats.total} Orders Taken</span>
                <span>{orderStats.pendingCount} Pending</span>
              </div>
            </div>

            <div className="admin-kpi-card">
              <div className="kpi-top">
                <span className="kpi-title">Auto-Match Accuracy</span>
                <div className="kpi-icon-wrap emerald">
                  <Icon icon="mdi:auto-fix" width="22" height="22" />
                </div>
              </div>
              <div className="kpi-value">96.4%</div>
              <div className="kpi-subtext">
                <span className="kpi-badge up">Avg 1.8s</span>
                <span>Algorithm v2.4 Active</span>
              </div>
            </div>

            <div className="admin-kpi-card">
              <div className="kpi-top">
                <span className="kpi-title">Fleet Readiness</span>
                <div className="kpi-icon-wrap amber">
                  <Icon icon="mdi:truck-fast" width="22" height="22" />
                </div>
              </div>
              <div className="kpi-value">84%</div>
              <div className="kpi-subtext">
                <span className="kpi-badge up">Available</span>
                <span>Kovilpatti &amp; South Block</span>
              </div>
            </div>
          </div>

          {/* Subsystem Health Grid */}
          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <h2>
                  <Icon icon="mdi:server-network" width="20" height="20" color="#3b82f6" />
                  Cluster Subsystems &amp; Node Health
                </h2>
                <p className="admin-card-desc">Real-time telemetry from core ResQNet daemons and external integration gateways</p>
              </div>
              <span className="node-status-badge online">All Systems Nominal</span>
            </div>

            <div className="node-health-grid">
              <div className="node-health-item">
                <div className="node-item-header">
                  <span className="node-name">
                    <Icon icon="mdi:database" width="16" height="16" color="#059669" />
                    MySQL Database
                  </span>
                  <span className="node-status-badge online">99.99%</span>
                </div>
                <div className="node-metric">Connection pool: 18 / 64 (8ms query latency)</div>
              </div>

              <div className="node-health-item">
                <div className="node-item-header">
                  <span className="node-name">
                    <Icon icon="mdi:lightning-bolt" width="16" height="16" color="#d97706" />
                    Auto-Match Worker
                  </span>
                  <span className="node-status-badge online">Running</span>
                </div>
                <div className="node-metric">Queue load: 2 jobs &bull; Thread count: 4</div>
              </div>

              <div className="node-health-item">
                <div className="node-item-header">
                  <span className="node-name">
                    <Icon icon="mdi:cellphone-wireless" width="16" height="16" color="#2563eb" />
                    SMS / Push Gateway
                  </span>
                  <span className="node-status-badge online">Active</span>
                </div>
                <div className="node-metric">Twilio API healthy &bull; Delivery rate: 99.2%</div>
              </div>

              <div className="node-health-item">
                <div className="node-item-header">
                  <span className="node-name">
                    <Icon icon="mdi:map-marker-radius" width="16" height="16" color="#7c3aed" />
                    Geospatial Engine
                  </span>
                  <span className="node-status-badge active">Sector Active</span>
                </div>
                <div className="node-metric">Kovilpatti GIS Polygon &bull; 15km perimeter</div>
              </div>
            </div>
          </div>

          {/* Activity Trend Visualization */}
          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <h2>
                  <Icon icon="mdi:chart-timeline-variant" width="20" height="20" color="#e74c3c" />
                  Incident Influx &amp; Dispatch Velocity (Today)
                </h2>
                <p className="admin-card-desc">Hourly emergency reports logged vs allocated responses across Kovilpatti sectors</p>
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                Peak Incident Influx: <strong style={{ color: '#dc2626' }}>16:00 (Flood alerts)</strong>
              </div>
            </div>

            <div className="activity-chart-container">
              <div className="chart-bars-wrap">
                {[
                  { time: '00:00', val: 2, height: '15%', peak: false },
                  { time: '03:00', val: 1, height: '10%', peak: false },
                  { time: '06:00', val: 4, height: '30%', peak: false },
                  { time: '09:00', val: 9, height: '65%', peak: false },
                  { time: '12:00', val: 7, height: '50%', peak: false },
                  { time: '15:00', val: 14, height: '100%', peak: true },
                  { time: '18:00', val: 11, height: '80%', peak: false },
                  { time: '21:00', val: 6, height: '42%', peak: false }
                ].map((item, idx) => (
                  <div key={idx} className="chart-bar-col">
                    <div className="chart-bar-fill-wrap">
                      <div
                        className={`chart-bar-fill ${item.peak ? 'peak' : 'normal'}`}
                        style={{ height: item.height }}
                      >
                        <span className="chart-bar-val">{item.val}</span>
                      </div>
                    </div>
                    <span className="chart-bar-label">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          TAB 2: USER DIRECTORY & ROLE-BASED ACCESS CONTROL (RBAC)
          ==================================================================== */}
      {activeTab === 'users' && (
        <div className="tab-pane-fade">
          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <h2>
                  <Icon icon="mdi:account-cog" width="20" height="20" color="#2563eb" />
                  User &amp; Credential Directory
                </h2>
                <p className="admin-card-desc">Manage system access, assign roles, inspect account activity, or modify credentials</p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="admin-btn admin-btn-outline" onClick={handleExportUsersCsv}>
                  <Icon icon="mdi:download" width="16" height="16" />
                  Export CSV
                </button>
                <button className="admin-btn admin-btn-primary" onClick={handleOpenAddUser}>
                  <Icon icon="mdi:account-plus" width="16" height="16" />
                  Add New User
                </button>
              </div>
            </div>

            {/* Filter Toolbar */}
            <div className="admin-toolbar">
              <div className="admin-search-wrap">
                <Icon icon="mdi:magnify" width="18" height="18" className="search-icon-inside" />
                <input
                  type="text"
                  className="admin-search-input"
                  placeholder="Search by name, username, email, phone, location..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>

              <div className="admin-filters-wrap">
                <select
                  className="admin-select"
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                >
                  <option value="ALL">All Roles</option>
                  <option value="ADMINISTRATOR">Administrators</option>
                  <option value="COORDINATOR">Coordinators</option>
                  <option value="VOLUNTEER">Volunteers</option>
                  <option value="RESOURCE_PROVIDER">Resource Providers</option>
                  <option value="CITIZEN">Citizens</option>
                </select>

                <select
                  className="admin-select"
                  value={userStatusFilter}
                  onChange={(e) => setUserStatusFilter(e.target.value)}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ACTIVE">Active Only</option>
                  <option value="SUSPENDED">Suspended Only</option>
                </select>
              </div>
            </div>

            {/* Users Data Table */}
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User / Identity</th>
                    <th>Role</th>
                    <th>Contact Details</th>
                    <th>Assigned Location</th>
                    <th>Account Status</th>
                    <th>Last Active</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                        No users match the search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(user => {
                      // Avatar background generator
                      const avatarColors = {
                        ADMINISTRATOR: '#dc2626',
                        COORDINATOR: '#4f46e5',
                        VOLUNTEER: '#059669',
                        RESOURCE_PROVIDER: '#d97706',
                        CITIZEN: '#475569'
                      };
                      const avatarBg = avatarColors[user.role] || '#475569';

                      return (
                        <tr key={user.userId}>
                          <td>
                            <div className="user-cell">
                              <div className="user-avatar-circle" style={{ backgroundColor: avatarBg }}>
                                {user.fullName.substring(0, 2).toUpperCase()}
                              </div>
                              <div className="user-names">
                                <span className="user-fullname">{user.fullName}</span>
                                <span className="user-username">@{user.username} &bull; {user.userId}</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className={`role-badge ${user.role}`}>
                              {user.role.replace('_', ' ')}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <span>{user.email}</span>
                              <span style={{ fontSize: '11.5px', color: '#64748b' }}>{user.phone}</span>
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Icon icon="mdi:map-marker" width="14" height="14" color="#64748b" />
                              <span>{user.location}</span>
                            </div>
                          </td>
                          <td>
                            <span className={`status-pill ${user.status}`}>
                              <span className="status-pill-dot"></span>
                              {user.status}
                            </span>
                          </td>
                          <td style={{ fontSize: '12px', color: '#64748b' }}>
                            {user.lastLogin}
                          </td>
                          <td>
                            <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                              <button
                                className="action-icon-btn"
                                title="Edit user details"
                                onClick={() => handleOpenEditUser(user)}
                              >
                                <Icon icon="mdi:pencil" width="15" height="15" />
                              </button>

                              <button
                                className="action-icon-btn"
                                title={user.status === 'ACTIVE' ? 'Suspend user' : 'Reactivate user'}
                                onClick={() => handleToggleUserStatus(user)}
                              >
                                <Icon
                                  icon={user.status === 'ACTIVE' ? 'mdi:account-lock' : 'mdi:account-check'}
                                  width="15"
                                  height="15"
                                  color={user.status === 'ACTIVE' ? '#d97706' : '#059669'}
                                />
                              </button>

                              <button
                                className="action-icon-btn"
                                title="Generate Password Reset Token"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setModalType('RESET_PWD');
                                }}
                              >
                                <Icon icon="mdi:key-change" width="15" height="15" />
                              </button>

                              <button
                                className="action-icon-btn danger"
                                title="Delete user"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setModalType('DELETE_USER');
                                }}
                              >
                                <Icon icon="mdi:trash-can-outline" width="15" height="15" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          TAB 3: MATCHING ENGINE & SYSTEM CONFIGURATION
          ==================================================================== */}
      {activeTab === 'config' && (
        <div className="tab-pane-fade">
          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <h2>
                  <Icon icon="mdi:tune-variant" width="20" height="20" color="#e74c3c" />
                  Automated Matching Engine &amp; Dispatch Thresholds
                </h2>
                <p className="admin-card-desc">Calibrate algorithmic heuristics, search radii, SLA escalation deadlines, and communication gateways</p>
              </div>
              <button
                className="admin-btn admin-btn-primary"
                onClick={() => {
                  logAudit('System Rules & Matcher Weights Updated', 'ALGORITHM', 'INFO', `Radius: ${config.searchRadiusKm}km, Urgency: ${config.urgencyWeight}%`);
                  addToast('Configuration calibrated and saved');
                }}
              >
                <Icon icon="mdi:content-save" width="16" height="16" />
                Save System Rules
              </button>
            </div>

            <div className="config-grid">
              {/* Box 1: Matching Weights */}
              <div className="config-section-card">
                <h3 className="config-section-title">
                  <Icon icon="mdi:scale-balance" width="18" height="18" color="#3b82f6" />
                  Algorithm Scoring Weights
                </h3>

                <div className="config-field">
                  <div className="config-field-row">
                    <span className="config-field-label">Urgency &amp; Severity Weight:</span>
                    <span className="config-slider-value">{config.urgencyWeight}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="80"
                    value={config.urgencyWeight}
                    className="config-slider"
                    onChange={(e) => setConfig({ ...config, urgencyWeight: Number(e.target.value) })}
                  />
                  <p className="config-field-desc">Prioritizes CRITICAL and HIGH life-safety emergencies first</p>
                </div>

                <div className="config-field">
                  <div className="config-field-row">
                    <span className="config-field-label">Proximity &amp; Distance Weight:</span>
                    <span className="config-slider-value">{config.proximityWeight}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="80"
                    value={config.proximityWeight}
                    className="config-slider"
                    onChange={(e) => setConfig({ ...config, proximityWeight: Number(e.target.value) })}
                  />
                  <p className="config-field-desc">Rewards closer emergency resources to minimize response minutes</p>
                </div>

                <div className="config-field">
                  <div className="config-field-row">
                    <span className="config-field-label">Volunteer Skill Match Weight:</span>
                    <span className="config-slider-value">{config.skillsWeight}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="80"
                    value={config.skillsWeight}
                    className="config-slider"
                    onChange={(e) => setConfig({ ...config, skillsWeight: Number(e.target.value) })}
                  />
                  <p className="config-field-desc">Matches certified medical, rescue, and driving competencies</p>
                </div>

                <div className="weights-progress-bar">
                  <div className="weights-segment" style={{ width: `${config.urgencyWeight}%`, backgroundColor: '#ef4444' }} />
                  <div className="weights-segment" style={{ width: `${config.proximityWeight}%`, backgroundColor: '#3b82f6' }} />
                  <div className="weights-segment" style={{ width: `${config.skillsWeight}%`, backgroundColor: '#10b981' }} />
                </div>
                <div className="weights-legend">
                  <span><span className="weights-legend-dot" style={{ backgroundColor: '#ef4444' }} />Urgency</span>
                  <span><span className="weights-legend-dot" style={{ backgroundColor: '#3b82f6' }} />Proximity</span>
                  <span><span className="weights-legend-dot" style={{ backgroundColor: '#10b981' }} />Skills</span>
                </div>
              </div>

              {/* Box 2: Dispatch Perimeter & Limits */}
              <div className="config-section-card">
                <h3 className="config-section-title">
                  <Icon icon="mdi:radar" width="18" height="18" color="#059669" />
                  Search Perimeter &amp; Dispatch Quotas
                </h3>

                <div className="config-field">
                  <div className="config-field-row">
                    <span className="config-field-label">Maximum Search Radius (km):</span>
                    <span className="config-slider-value">{config.searchRadiusKm} km</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="50"
                    value={config.searchRadiusKm}
                    className="config-slider"
                    onChange={(e) => setConfig({ ...config, searchRadiusKm: Number(e.target.value) })}
                  />
                  <p className="config-field-desc">Perimeter around reported incident coordinate for dispatch search</p>
                </div>

                <div className="config-field">
                  <div className="config-field-row">
                    <div>
                      <span className="config-field-label">Auto-Dispatch Engine Master:</span>
                      <p className="config-field-desc">Allows engine to suggest and pre-lock top candidate</p>
                    </div>
                    <label className="switch-wrap">
                      <input
                        type="checkbox"
                        checked={config.autoMatchingEnabled}
                        onChange={(e) => setConfig({ ...config, autoMatchingEnabled: e.target.checked })}
                      />
                      <span className="slider-switch"></span>
                    </label>
                  </div>
                </div>

                <div className="config-field">
                  <div className="config-field-row">
                    <div>
                      <span className="config-field-label">Critical Escalation SLA (Minutes):</span>
                      <p className="config-field-desc">Alerts coordinator if unresolved within period</p>
                    </div>
                    <input
                      type="number"
                      min="1"
                      max="30"
                      className="modal-input"
                      style={{ width: '80px', textAlign: 'center' }}
                      value={config.criticalEscalationMins}
                      onChange={(e) => setConfig({ ...config, criticalEscalationMins: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              {/* Box 3: Security & Gateways */}
              <div className="config-section-card">
                <h3 className="config-section-title">
                  <Icon icon="mdi:security" width="18" height="18" color="#7c3aed" />
                  Notification Gateways &amp; Maintenance
                </h3>

                <div className="config-field">
                  <div className="config-field-row">
                    <div>
                      <span className="config-field-label">SMS Alert Gateway (Twilio):</span>
                      <p className="config-field-desc">Dispatches SMS notifications to field volunteers</p>
                    </div>
                    <label className="switch-wrap">
                      <input
                        type="checkbox"
                        checked={config.smsGatewayEnabled}
                        onChange={(e) => setConfig({ ...config, smsGatewayEnabled: e.target.checked })}
                      />
                      <span className="slider-switch"></span>
                    </label>
                  </div>
                </div>

                <div className="config-field">
                  <div className="config-field-row">
                    <div>
                      <span className="config-field-label">Audible Siren on Critical Requests:</span>
                      <p className="config-field-desc">Triggers sound chime on incoming critical reports</p>
                    </div>
                    <label className="switch-wrap">
                      <input
                        type="checkbox"
                        checked={config.sirenAudioAlerts}
                        onChange={(e) => setConfig({ ...config, sirenAudioAlerts: e.target.checked })}
                      />
                      <span className="slider-switch"></span>
                    </label>
                  </div>
                </div>

                <div className="config-field">
                  <div className="config-field-row">
                    <div>
                      <span className="config-field-label">Maintenance Mode (System Lockout):</span>
                      <p className="config-field-desc">Restricts citizen access while preserving coordinator triage</p>
                    </div>
                    <label className="switch-wrap">
                      <input
                        type="checkbox"
                        checked={config.maintenanceMode}
                        onChange={(e) => {
                          const val = e.target.checked;
                          setConfig({ ...config, maintenanceMode: val });
                          logAudit(
                            val ? 'Maintenance Mode ACTIVATED' : 'Maintenance Mode DEACTIVATED',
                            'SECURITY',
                            val ? 'WARNING' : 'INFO',
                            'System lockdown toggle'
                          );
                          addToast(val ? 'Maintenance mode enabled' : 'Maintenance mode deactivated', val ? 'warn' : 'info');
                        }}
                      />
                      <span className="slider-switch"></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          TAB 4: INCIDENT FLEET COMMAND OVERRIDE
          ==================================================================== */}
      {activeTab === 'incidents' && (
        <div className="tab-pane-fade">
          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <h2>
                  <Icon icon="mdi:shield-alert" width="20" height="20" color="#dc2626" />
                  Incident Fleet Command &amp; Overrides
                </h2>
                <p className="admin-card-desc">Direct administrative intervention on active emergency lifecycles and assigned squads</p>
              </div>
              <button
                className="admin-btn admin-btn-outline"
                onClick={() => {
                  const cleaned = emergencies.filter(e => e.status !== 'RESOLVED');
                  setEmergencies(cleaned);
                  addToast('Archived resolved incidents from active queue');
                }}
              >
                <Icon icon="mdi:archive" width="16" height="16" />
                Archive Resolved Incidents
              </button>
            </div>

            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Req ID</th>
                    <th>Emergency Type</th>
                    <th>Reporter / Location</th>
                    <th>Priority (Override)</th>
                    <th>Current Status (Override)</th>
                    <th>Assigned Team</th>
                    <th>Risk Gauge</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {emergencies.map(e => (
                    <tr key={e.requestId}>
                      <td>
                        <strong>{e.requestId}</strong>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{e.timeElapsed}</div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: '#0f172a' }}>
                          {e.emergencyType.replace(/_/g, ' ')}
                        </span>
                        <div style={{ fontSize: '11.5px', color: '#64748b' }}>{e.peopleAffected} People affected</div>
                      </td>
                      <td>
                        <div>{e.citizenName} ({e.contact})</div>
                        <div style={{ fontSize: '11.5px', color: '#64748b' }}>{e.location}</div>
                      </td>
                      <td>
                        <select
                          className="admin-select"
                          style={{ padding: '4px 8px', fontSize: '12px' }}
                          value={e.priority}
                          onChange={(ev) => handleOverridePriority(e.requestId, ev.target.value)}
                        >
                          <option value="CRITICAL">CRITICAL</option>
                          <option value="HIGH">HIGH</option>
                          <option value="MEDIUM">MEDIUM</option>
                          <option value="LOW">LOW</option>
                        </select>
                      </td>
                      <td>
                        <select
                          className="admin-select"
                          style={{ padding: '4px 8px', fontSize: '12px' }}
                          value={e.status}
                          onChange={(ev) => handleOverrideStatus(e.requestId, ev.target.value)}
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="RESOURCE_ASSIGNED">RESOURCE ASSIGNED</option>
                          <option value="RESPONDING">RESPONDING</option>
                          <option value="ON_SITE">ON SITE</option>
                          <option value="RESOLVED">RESOLVED</option>
                        </select>
                      </td>
                      <td style={{ fontSize: '12px', color: '#475569' }}>
                        {e.assignedTeam}
                      </td>
                      <td>
                        <div className="risk-meter">
                          <div className="risk-bar">
                            <div
                              className="risk-bar-fill"
                              style={{
                                width: `${e.riskScore}%`,
                                backgroundColor: e.riskScore > 80 ? '#dc2626' : e.riskScore > 50 ? '#f59e0b' : '#10b981'
                              }}
                            />
                          </div>
                          <span style={{ fontSize: '11px', fontWeight: 700 }}>{e.riskScore}</span>
                        </div>
                      </td>
                      <td>
                        <div className="table-actions" style={{ justifyContent: 'flex-end' }}>
                          <button
                            className="admin-btn admin-btn-sm admin-btn-outline"
                            title="Force auto matching"
                            onClick={() => {
                              logAudit('Auto Match Engine Triggered', 'ALGORITHM', 'INFO', `Re-evaluating resources for ${e.requestId}`);
                              addToast(`Re-evaluating matching candidates for ${e.requestId}`);
                            }}
                          >
                            <Icon icon="mdi:auto-fix" width="14" height="14" />
                            Match
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          TAB 5: AUDIT TRAIL & SYSTEM LOGS
          ==================================================================== */}
      {activeTab === 'audit' && (
        <div className="tab-pane-fade">
          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <h2>
                  <Icon icon="mdi:shield-search" width="20" height="20" color="#4f46e5" />
                  System Security &amp; Audit Trail
                </h2>
                <p className="admin-card-desc">Immutable chronological event logs tracking administrative modifications and critical state transitions</p>
              </div>
              <button
                className="admin-btn admin-btn-outline"
                onClick={() => {
                  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
                  const link = document.createElement('a');
                  link.href = dataStr;
                  link.setAttribute('download', `resqnet_audit_trail_${Date.now()}.json`);
                  document.body.appendChild(link);
                  link.click();
                  link.remove();
                  addToast('Audit log JSON exported');
                }}
              >
                <Icon icon="mdi:download" width="16" height="16" />
                Export Audit JSON
              </button>
            </div>

            <div className="admin-toolbar">
              <div className="admin-search-wrap">
                <Icon icon="mdi:magnify" width="18" height="18" className="search-icon-inside" />
                <input
                  type="text"
                  className="admin-search-input"
                  placeholder="Filter logs by actor, action description, target IP or entity..."
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                />
              </div>

              <div className="admin-filters-wrap">
                <select
                  className="admin-select"
                  value={auditSeverityFilter}
                  onChange={(e) => setAuditSeverityFilter(e.target.value)}
                >
                  <option value="ALL">All Severities</option>
                  <option value="INFO">INFO Only</option>
                  <option value="WARNING">WARNING Only</option>
                  <option value="CRITICAL">CRITICAL Only</option>
                  <option value="SECURITY">SECURITY Only</option>
                </select>
              </div>
            </div>

            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Log ID / Timestamp</th>
                    <th>Actor</th>
                    <th>Category</th>
                    <th>Severity</th>
                    <th>Action Executed</th>
                    <th>Target / Impact</th>
                    <th>Result</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAuditLogs.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: '#64748b' }}>
                        No audit events matching criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredAuditLogs.map(log => (
                      <tr key={log.id}>
                        <td>
                          <strong>{log.id}</strong>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>{log.timestamp}</div>
                        </td>
                        <td>
                          <span style={{ fontWeight: 600 }}>{log.actor}</span>
                        </td>
                        <td>
                          <span style={{ fontSize: '11px', color: '#475569', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>
                            {log.category}
                          </span>
                        </td>
                        <td>
                          <span className={`audit-severity ${log.severity}`}>
                            {log.severity}
                          </span>
                        </td>
                        <td style={{ fontWeight: 500, color: '#0f172a' }}>
                          {log.action}
                        </td>
                        <td style={{ fontSize: '12px', color: '#64748b' }}>
                          {log.target}
                        </td>
                        <td>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: log.status === 'SUCCESS' || log.status === 'COMPLETED' ? '#059669' : '#dc2626' }}>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          TAB 6: AMBULANCE DRIVER ORDERS & INTAKE TRACKING
          ==================================================================== */}
      {activeTab === 'orders' && (
        <div className="tab-pane-fade">
          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <h2>
                  <Icon icon="mdi:ambulance" width="22" height="22" color="#e74c3c" />
                  Ambulance Orders Intake &amp; Driver Allocation Monitor
                </h2>
                <p className="admin-card-desc">
                  Real-time telemetry on citizen ambulance bookings, driver acceptance rates, and in-transit units
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <a
                  href="/driver"
                  target="_blank"
                  rel="noreferrer"
                  className="admin-btn admin-btn-outline"
                >
                  <Icon icon="mdi:open-in-new" width="16" height="16" />
                  Open Driver View
                </a>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="admin-kpi-grid" style={{ marginBottom: '20px' }}>
              <div className="admin-kpi-card">
                <div className="kpi-top">
                  <span className="kpi-title">Total User Orders</span>
                  <div className="kpi-icon-wrap blue">
                    <Icon icon="mdi:clipboard-list" width="22" height="22" />
                  </div>
                </div>
                <div className="kpi-value">{orderStats.total}</div>
                <div className="kpi-subtext">Citizen Ambulance Calls</div>
              </div>

              <div className="admin-kpi-card">
                <div className="kpi-top">
                  <span className="kpi-title">Orders Taken by Drivers</span>
                  <div className="kpi-icon-wrap emerald">
                    <Icon icon="mdi:steering" width="22" height="22" />
                  </div>
                </div>
                <div className="kpi-value">{orderStats.takenCount}</div>
                <div className="kpi-subtext">
                  <span className="kpi-badge up">{orderStats.rate}% Intake Rate</span>
                </div>
              </div>

              <div className="admin-kpi-card">
                <div className="kpi-top">
                  <span className="kpi-title">Currently En Route</span>
                  <div className="kpi-icon-wrap amber">
                    <Icon icon="mdi:ambulance" width="22" height="22" />
                  </div>
                </div>
                <div className="kpi-value">{orderStats.enRouteCount}</div>
                <div className="kpi-subtext">Active Dispatches on Road</div>
              </div>

              <div className="admin-kpi-card">
                <div className="kpi-top">
                  <span className="kpi-title">Awaiting Driver Take</span>
                  <div className="kpi-icon-wrap red">
                    <Icon icon="mdi:timer-sand" width="22" height="22" />
                  </div>
                </div>
                <div className="kpi-value">{orderStats.pendingCount}</div>
                <div className="kpi-subtext">
                  <span className={`kpi-badge ${orderStats.pendingCount > 0 ? 'warn' : 'up'}`}>
                    {orderStats.pendingCount > 0 ? 'Urgent Attention' : 'All Orders Assigned'}
                  </span>
                </div>
              </div>
            </div>

            {/* Toolbar */}
            <div className="admin-toolbar">
              <div className="admin-search-wrap">
                <Icon icon="mdi:magnify" width="18" height="18" className="search-icon-inside" />
                <input
                  type="text"
                  className="admin-search-input"
                  placeholder="Search by patient name, phone, driver name, vehicle, or pickup area..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                />
              </div>

              <div className="admin-filters-wrap">
                <select
                  className="admin-select"
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                >
                  <option value="ALL">All Order Statuses</option>
                  <option value="PENDING">Awaiting Driver (PENDING)</option>
                  <option value="TAKEN">Driver Accepted (TAKEN)</option>
                  <option value="EN_ROUTE">En Route (EN ROUTE)</option>
                  <option value="IN_TRANSIT">To Hospital (IN TRANSIT)</option>
                  <option value="COMPLETED">Completed Trips</option>
                </select>
              </div>
            </div>

            {/* Orders Intake Table */}
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID / Time</th>
                    <th>Patient Name &amp; Phone</th>
                    <th>Patient Age</th>
                    <th>Required Medical Equipment</th>
                    <th>Assigned Driver &amp; Ambulance</th>
                    <th>Intake Status</th>
                    <th>Destination Hospital</th>
                    <th style={{ textAlign: 'right' }}>Direct Calling</th>
                  </tr>
                </thead>
                <tbody>
                  {driverOrders
                    .filter(o => {
                      const matchesSearch =
                        o.orderId.toLowerCase().includes(orderSearch.toLowerCase()) ||
                        o.patientName.toLowerCase().includes(orderSearch.toLowerCase()) ||
                        o.contactNumber.includes(orderSearch) ||
                        o.pickupLocation.toLowerCase().includes(orderSearch.toLowerCase()) ||
                        (o.assignedDriver?.driverName || '').toLowerCase().includes(orderSearch.toLowerCase()) ||
                        (o.assignedDriver?.vehicleNumber || '').toLowerCase().includes(orderSearch.toLowerCase());
                      const matchesStatus = orderStatusFilter === 'ALL' || o.status === orderStatusFilter;
                      return matchesSearch && matchesStatus;
                    })
                    .map(o => (
                      <tr key={o.orderId}>
                        <td>
                          <strong>{o.orderId}</strong>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>{o.bookedAt}</div>
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{o.patientName}</div>
                          <div style={{ fontSize: '11.5px', color: '#64748b' }}>📍 {o.pickupLocation}</div>
                        </td>
                        <td>
                          <span style={{
                            background: '#fee2e2',
                            color: '#991b1b',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            fontWeight: 700,
                            fontSize: '11.5px',
                            whiteSpace: 'nowrap'
                          }}>
                            {o.patientAge} yrs ({o.ageCategory})
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '240px' }}>
                            {o.requirements?.map((req, i) => (
                              <span
                                key={i}
                                style={{
                                  fontSize: '10.5px',
                                  background: '#f1f5f9',
                                  color: '#334155',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  border: '1px solid #e2e8f0',
                                  whiteSpace: 'nowrap'
                                }}
                              >
                                {req}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td>
                          {o.assignedDriver ? (
                            <div>
                              <div style={{ fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Icon icon="mdi:steering" width="14" height="14" color="#059669" />
                                {o.assignedDriver.driverName}
                              </div>
                              <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                                Unit: <strong style={{ color: '#dc2626' }}>{o.assignedDriver.vehicleNumber}</strong>
                              </div>
                            </div>
                          ) : (
                            <span style={{
                              background: '#fee2e2',
                              color: '#dc2626',
                              padding: '3px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 700
                            }}>
                              🚨 Awaiting Nearby Driver
                            </span>
                          )}
                        </td>
                        <td>
                          <span className={`status-pill ${o.status === 'COMPLETED' ? 'ACTIVE' : o.status === 'PENDING' ? 'SUSPENDED' : 'ACTIVE'}`}
                            style={{
                              background: o.status === 'PENDING' ? '#fee2e2' : o.status === 'COMPLETED' ? '#ecfdf5' : '#eff6ff',
                              color: o.status === 'PENDING' ? '#dc2626' : o.status === 'COMPLETED' ? '#059669' : '#2563eb'
                            }}
                          >
                            <span className="status-pill-dot"></span>
                            {o.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td style={{ fontSize: '12px', color: '#475569' }}>
                          {o.destinationHospital}
                        </td>
                        <td>
                          <div className="table-actions" style={{ justifyContent: 'flex-end', gap: '6px' }}>
                            <a
                              href={`tel:${o.contactNumber}`}
                              className="admin-btn admin-btn-sm admin-btn-outline"
                              title="Call patient straightly"
                              style={{ padding: '4px 8px', fontSize: '11.5px' }}
                            >
                              <Icon icon="mdi:phone-in-talk" width="14" height="14" color="#059669" />
                              Patient
                            </a>
                            {o.assignedDriver && (
                              <a
                                href={`tel:${o.assignedDriver.phone}`}
                                className="admin-btn admin-btn-sm admin-btn-primary"
                                title="Call driver straightly"
                                style={{ padding: '4px 8px', fontSize: '11.5px' }}
                              >
                                <Icon icon="mdi:steering" width="14" height="14" />
                                Driver
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL: ADD NEW USER
          ==================================================================== */}
      {modalType === 'ADD_USER' && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h3>
                <Icon icon="mdi:account-plus" width="20" height="20" color="#e74c3c" />
                Enroll New System User
              </h3>
              <button className="admin-modal-close" onClick={() => setModalType(null)}>
                <Icon icon="mdi:close" width="20" height="20" />
              </button>
            </div>
            <form onSubmit={handleSaveAddUser}>
              <div className="admin-modal-body modal-form-grid">
                <div className="modal-form-full">
                  <label className="modal-input-label">Full Name *</label>
                  <input
                    type="text"
                    required
                    className="modal-input"
                    placeholder="e.g. Anandha Krishnan"
                    value={userFormData.fullName}
                    onChange={(e) => setUserFormData({ ...userFormData, fullName: e.target.value })}
                  />
                </div>

                <div>
                  <label className="modal-input-label">Username *</label>
                  <input
                    type="text"
                    required
                    className="modal-input"
                    placeholder="e.g. anandhk"
                    value={userFormData.username}
                    onChange={(e) => setUserFormData({ ...userFormData, username: e.target.value })}
                  />
                </div>

                <div>
                  <label className="modal-input-label">Email Address *</label>
                  <input
                    type="email"
                    required
                    className="modal-input"
                    placeholder="e.g. anandh@resqnet.com"
                    value={userFormData.email}
                    onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                  />
                </div>

                <div>
                  <label className="modal-input-label">Phone Contact *</label>
                  <input
                    type="tel"
                    required
                    className="modal-input"
                    placeholder="e.g. 9876543299"
                    value={userFormData.phone}
                    onChange={(e) => setUserFormData({ ...userFormData, phone: e.target.value })}
                  />
                </div>

                <div>
                  <label className="modal-input-label">Role Classification *</label>
                  <select
                    className="modal-input"
                    value={userFormData.role}
                    onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
                  >
                    <option value="ADMINISTRATOR">Administrator</option>
                    <option value="COORDINATOR">Emergency Coordinator</option>
                    <option value="VOLUNTEER">Field Volunteer</option>
                    <option value="RESOURCE_PROVIDER">Resource Provider</option>
                    <option value="CITIZEN">Citizen</option>
                  </select>
                </div>

                <div className="modal-form-full">
                  <label className="modal-input-label">Assigned Sector / Location</label>
                  <input
                    type="text"
                    className="modal-input"
                    placeholder="e.g. Kovilpatti East Sector"
                    value={userFormData.location}
                    onChange={(e) => setUserFormData({ ...userFormData, location: e.target.value })}
                  />
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-outline" onClick={() => setModalType(null)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-primary">
                  <Icon icon="mdi:check" width="16" height="16" />
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL: EDIT USER
          ==================================================================== */}
      {modalType === 'EDIT_USER' && selectedUser && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h3>
                <Icon icon="mdi:account-edit" width="20" height="20" color="#3b82f6" />
                Modify User Details: {selectedUser.fullName}
              </h3>
              <button className="admin-modal-close" onClick={() => setModalType(null)}>
                <Icon icon="mdi:close" width="20" height="20" />
              </button>
            </div>
            <form onSubmit={handleSaveEditUser}>
              <div className="admin-modal-body modal-form-grid">
                <div className="modal-form-full">
                  <label className="modal-input-label">Full Name</label>
                  <input
                    type="text"
                    required
                    className="modal-input"
                    value={userFormData.fullName}
                    onChange={(e) => setUserFormData({ ...userFormData, fullName: e.target.value })}
                  />
                </div>

                <div>
                  <label className="modal-input-label">Username</label>
                  <input
                    type="text"
                    disabled
                    style={{ background: '#f1f5f9' }}
                    className="modal-input"
                    value={userFormData.username}
                  />
                </div>

                <div>
                  <label className="modal-input-label">Role</label>
                  <select
                    className="modal-input"
                    value={userFormData.role}
                    onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
                  >
                    <option value="ADMINISTRATOR">Administrator</option>
                    <option value="COORDINATOR">Emergency Coordinator</option>
                    <option value="VOLUNTEER">Field Volunteer</option>
                    <option value="RESOURCE_PROVIDER">Resource Provider</option>
                    <option value="CITIZEN">Citizen</option>
                  </select>
                </div>

                <div>
                  <label className="modal-input-label">Phone</label>
                  <input
                    type="tel"
                    className="modal-input"
                    value={userFormData.phone}
                    onChange={(e) => setUserFormData({ ...userFormData, phone: e.target.value })}
                  />
                </div>

                <div>
                  <label className="modal-input-label">Status</label>
                  <select
                    className="modal-input"
                    value={userFormData.status}
                    onChange={(e) => setUserFormData({ ...userFormData, status: e.target.value })}
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                  </select>
                </div>

                <div className="modal-form-full">
                  <label className="modal-input-label">Assigned Sector</label>
                  <input
                    type="text"
                    className="modal-input"
                    value={userFormData.location}
                    onChange={(e) => setUserFormData({ ...userFormData, location: e.target.value })}
                  />
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-outline" onClick={() => setModalType(null)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-primary">
                  Update Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL: RESET PASSWORD
          ==================================================================== */}
      {modalType === 'RESET_PWD' && selectedUser && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h3>
                <Icon icon="mdi:key-change" width="20" height="20" color="#f59e0b" />
                Issue Temporary Password Token
              </h3>
              <button className="admin-modal-close" onClick={() => setModalType(null)}>
                <Icon icon="mdi:close" width="20" height="20" />
              </button>
            </div>
            <div className="admin-modal-body">
              <p style={{ margin: '0 0 16px', fontSize: '13.5px', color: '#475569' }}>
                A temporary credential token has been generated for <strong>{selectedUser.fullName}</strong> (<code>{selectedUser.email}</code>).
              </p>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px dashed #cbd5e1', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, marginBottom: '6px' }}>
                  Temporary Access Token (Valid 24h)
                </div>
                <div style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '2px', color: '#0f172a' }}>
                  RSQ-PASS-{Math.floor(100000 + Math.random() * 900000)}
                </div>
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn admin-btn-outline" onClick={() => setModalType(null)}>
                Dismiss
              </button>
              <button
                className="admin-btn admin-btn-primary"
                onClick={() => {
                  logAudit(`Password Reset Token Issued`, 'SECURITY', 'WARNING', `Target: ${selectedUser.username}`);
                  addToast(`Reset instructions dispatched to ${selectedUser.email}`);
                  setModalType(null);
                }}
              >
                Copy &amp; Notify User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL: DELETE USER CONFIRMATION
          ==================================================================== */}
      {modalType === 'DELETE_USER' && selectedUser && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h3 style={{ color: '#dc2626' }}>
                <Icon icon="mdi:alert-circle" width="20" height="20" color="#dc2626" />
                Confirm User Account Removal
              </h3>
              <button className="admin-modal-close" onClick={() => setModalType(null)}>
                <Icon icon="mdi:close" width="20" height="20" />
              </button>
            </div>
            <div className="admin-modal-body">
              <p style={{ margin: 0, fontSize: '14px', color: '#334155' }}>
                Are you sure you want to permanently delete user account <strong>{selectedUser.fullName}</strong> (<code>@{selectedUser.username}</code>)?
              </p>
              <p style={{ fontSize: '12.5px', color: '#dc2626', marginTop: '10px' }}>
                This action revokes all system authorizations and removes the account from resource dispatch pools.
              </p>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn admin-btn-outline" onClick={() => setModalType(null)}>
                Cancel
              </button>
              <button
                className="admin-btn"
                style={{ background: '#dc2626', color: 'white' }}
                onClick={handleDeleteUser}
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL: EMERGENCY BROADCAST
          ==================================================================== */}
      {modalType === 'BROADCAST' && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h3>
                <Icon icon="mdi:bullhorn" width="20" height="20" color="#f59e0b" />
                Dispatch Regional Emergency Broadcast
              </h3>
              <button className="admin-modal-close" onClick={() => setModalType(null)}>
                <Icon icon="mdi:close" width="20" height="20" />
              </button>
            </div>
            <form onSubmit={handleTriggerBroadcast}>
              <div className="admin-modal-body modal-form-grid">
                <div className="modal-form-full">
                  <label className="modal-input-label">Alert Headline / Title *</label>
                  <input
                    type="text"
                    required
                    className="modal-input"
                    value={broadcastFormData.title}
                    onChange={(e) => setBroadcastFormData({ ...broadcastFormData, title: e.target.value })}
                  />
                </div>

                <div>
                  <label className="modal-input-label">Target Audience</label>
                  <select
                    className="modal-input"
                    value={broadcastFormData.audience}
                    onChange={(e) => setBroadcastFormData({ ...broadcastFormData, audience: e.target.value })}
                  >
                    <option value="ALL_SUBSCRIBERS">All Registered Citizens &amp; Staff</option>
                    <option value="FIELD_VOLUNTEERS">Active Field Volunteers Only</option>
                    <option value="COORDINATORS">Emergency Coordinators Only</option>
                    <option value="CIVIL_DEFENSE">Public Sirens &amp; Media Channels</option>
                  </select>
                </div>

                <div>
                  <label className="modal-input-label">Severity Level</label>
                  <select
                    className="modal-input"
                    value={broadcastFormData.priority}
                    onChange={(e) => setBroadcastFormData({ ...broadcastFormData, priority: e.target.value })}
                  >
                    <option value="CRITICAL">CRITICAL (Red Siren)</option>
                    <option value="HIGH">HIGH (Orange Advisory)</option>
                    <option value="MEDIUM">MEDIUM (General Alert)</option>
                  </select>
                </div>

                <div className="modal-form-full">
                  <label className="modal-input-label">Broadcast Message Content *</label>
                  <textarea
                    required
                    className="modal-input modal-textarea"
                    rows="4"
                    value={broadcastFormData.message}
                    onChange={(e) => setBroadcastFormData({ ...broadcastFormData, message: e.target.value })}
                  />
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-outline" onClick={() => setModalType(null)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-broadcast">
                  <Icon icon="mdi:radio-tower" width="16" height="16" />
                  Dispatch Alert Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL: DATABASE BACKUP SNAPSHOT
          ==================================================================== */}
      {modalType === 'BACKUP' && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h3>
                <Icon icon="mdi:database-arrow-down" width="20" height="20" color="#059669" />
                ResQNet System Snapshot &amp; Backup
              </h3>
              <button className="admin-modal-close" onClick={() => setModalType(null)}>
                <Icon icon="mdi:close" width="20" height="20" />
              </button>
            </div>
            <div className="admin-modal-body">
              <p style={{ margin: '0 0 16px', fontSize: '13.5px', color: '#475569' }}>
                Creates a point-in-time cryptographic archive of users, emergency incidents, dispatch history, and algorithm configurations.
              </p>

              {backupRunning ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                    <span>Archiving MySQL Schema &amp; Audit Logs...</span>
                    <strong>{backupProgress}%</strong>
                  </div>
                  <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${backupProgress}%`, background: '#10b981', transition: 'width 0.3s' }} />
                  </div>
                </div>
              ) : backupProgress === 100 ? (
                <div style={{ background: '#ecfdf5', padding: '16px', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#065f46', fontWeight: 700 }}>
                    <Icon icon="mdi:check-circle" width="18" height="18" />
                    Snapshot Created Successfully
                  </div>
                  <div style={{ fontSize: '12px', color: '#047857', marginTop: '4px' }}>
                    Archive Size: <strong>4.82 MB</strong> &bull; Checksum: <code>SHA256:7a4f9...b2e</code>
                  </div>
                </div>
              ) : (
                <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12.5px', color: '#475569' }}>
                  Target Database: <strong>resqnet_db</strong> &bull; Total records: <strong>{users.length + emergencies.length + auditLogs.length}</strong>
                </div>
              )}
            </div>

            <div className="admin-modal-footer">
              <button className="admin-btn admin-btn-outline" onClick={() => setModalType(null)}>
                Close
              </button>
              {backupProgress === 100 ? (
                <button className="admin-btn admin-btn-primary" onClick={handleDownloadBackupFile}>
                  <Icon icon="mdi:download" width="16" height="16" />
                  Download Snapshot
                </button>
              ) : (
                <button
                  className="admin-btn admin-btn-primary"
                  disabled={backupRunning}
                  onClick={handleStartBackup}
                >
                  <Icon icon="mdi:play" width="16" height="16" />
                  Generate Snapshot
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------
          FLOATING TOAST STACK
          -------------------------------------------------------------------- */}
      <div className="admin-toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`admin-toast ${toast.type}`}>
            <Icon
              icon={
                toast.type === 'warn'
                  ? 'mdi:alert-circle'
                  : toast.type === 'info'
                  ? 'mdi:information'
                  : 'mdi:check-circle'
              }
              width="18"
              height="18"
            />
            <span style={{ flex: 1 }}>{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}
            >
              <Icon icon="mdi:close" width="14" height="14" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

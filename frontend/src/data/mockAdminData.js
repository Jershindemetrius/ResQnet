// Initial mock dataset for ResQNet Admin Console
// Synchronized with ResQNet Java Desktop schema and sample data

export const initialUsers = [
  {
    userId: 'USR-001',
    fullName: 'System Administrator',
    username: 'admin',
    email: 'admin@resqnet.com',
    phone: '9876543210',
    role: 'ADMINISTRATOR',
    location: 'Kovilpatti',
    status: 'ACTIVE',
    lastLogin: '2 mins ago',
    createdAt: '2026-01-10',
    badge: 'Super Admin'
  },
  {
    userId: 'USR-002',
    fullName: 'Arun Kumar (Chief Coordinator)',
    username: 'coordinator',
    email: 'coordinator@resqnet.com',
    phone: '9876543211',
    role: 'COORDINATOR',
    location: 'Kovilpatti Central',
    status: 'ACTIVE',
    lastLogin: 'Just now',
    createdAt: '2026-01-12',
    badge: 'Operations Lead'
  },
  {
    userId: 'USR-003',
    fullName: 'Dr. Lakshmi Sundaram',
    username: 'coord_lakshmi',
    email: 'lakshmi@resqnet.com',
    phone: '9876543220',
    role: 'COORDINATOR',
    location: 'South Block',
    status: 'ACTIVE',
    lastLogin: '4 hours ago',
    createdAt: '2026-01-20',
    badge: 'Medical Liaison'
  },
  {
    userId: 'USR-004',
    fullName: 'Priya Sharma',
    username: 'volunteer2',
    email: 'priya@gmail.com',
    phone: '9876543216',
    role: 'VOLUNTEER',
    location: 'South Block',
    status: 'ACTIVE',
    lastLogin: '15 mins ago',
    createdAt: '2026-02-04',
    badge: 'Rescue Operations'
  },
  {
    userId: 'USR-005',
    fullName: 'Suresh Babu',
    username: 'volunteer_suresh',
    email: 'suresh@gmail.com',
    phone: '9876543219',
    role: 'VOLUNTEER',
    location: 'North Sector',
    status: 'ACTIVE',
    lastLogin: '1 hour ago',
    createdAt: '2026-02-08',
    badge: 'First Aid'
  },
  {
    userId: 'USR-006',
    fullName: 'Karthik Raja',
    username: 'volunteer_karthik',
    email: 'karthik@gmail.com',
    phone: '9876543217',
    role: 'VOLUNTEER',
    location: 'Kovilpatti East',
    status: 'SUSPENDED',
    lastLogin: '3 days ago',
    createdAt: '2026-02-14',
    badge: 'Heavy Vehicle'
  },
  {
    userId: 'USR-007',
    fullName: 'Kovilpatti City Hospital',
    username: 'provider_hospital',
    email: 'hospital@kovilpatti.gov.in',
    phone: '9876543214',
    role: 'RESOURCE_PROVIDER',
    location: 'Kovilpatti Main',
    status: 'ACTIVE',
    lastLogin: '30 mins ago',
    createdAt: '2026-02-01',
    badge: 'Healthcare Partner'
  },
  {
    userId: 'USR-008',
    fullName: 'District Fire & Rescue Command',
    username: 'provider_fire',
    email: 'firerescue@tn.gov.in',
    phone: '9876543228',
    role: 'RESOURCE_PROVIDER',
    location: 'North Sector',
    status: 'ACTIVE',
    lastLogin: '1 hour ago',
    createdAt: '2026-02-03',
    badge: 'Emergency Fleet'
  },
  {
    userId: 'USR-009',
    fullName: 'Ravi Kumar',
    username: 'citizen2',
    email: 'ravi@gmail.com',
    phone: '9876543215',
    role: 'CITIZEN',
    location: 'North Sector',
    status: 'ACTIVE',
    lastLogin: 'Yesterday',
    createdAt: '2026-02-15',
    badge: 'Verified Citizen'
  },
  {
    userId: 'USR-010',
    fullName: 'Meena Devi',
    username: 'citizen_meena',
    email: 'meena@gmail.com',
    phone: '9876543218',
    role: 'CITIZEN',
    location: 'Kovilpatti',
    status: 'ACTIVE',
    lastLogin: '5 hours ago',
    createdAt: '2026-02-22',
    badge: 'Verified Citizen'
  }
];

export const initialEmergencies = [
  {
    requestId: 'ER102',
    citizenName: 'Citizen One',
    contact: '9876543212',
    emergencyType: 'MEDICAL_EMERGENCY',
    location: 'Kovilpatti - Near Main Bus Stand',
    peopleAffected: 2,
    description: 'Vehicle collision, multiple injured persons requiring trauma triage.',
    requiredResources: 'AMBULANCE, MEDICAL_KIT',
    priority: 'HIGH',
    status: 'PENDING',
    assignedTeam: 'Unassigned',
    timeElapsed: '14 mins ago',
    riskScore: 82
  },
  {
    requestId: 'ER103',
    citizenName: 'Ravi Kumar',
    contact: '9876543215',
    emergencyType: 'FIRE',
    location: 'North Sector - Building No 42',
    peopleAffected: 5,
    description: 'Commercial complex fire on 2nd floor, smoke inhalation hazard.',
    requiredResources: 'FIRE_TRUCK, RESCUE_EQUIPMENT',
    priority: 'CRITICAL',
    status: 'PENDING',
    assignedTeam: 'Unassigned',
    timeElapsed: '6 mins ago',
    riskScore: 98
  },
  {
    requestId: 'ER104',
    citizenName: 'Citizen One',
    contact: '9876543212',
    emergencyType: 'FLOOD',
    location: 'South Block - River Bank Area',
    peopleAffected: 10,
    description: 'Water level surging past embankment, 3 families trapped.',
    requiredResources: 'SHELTER_SPACE, FOOD, DRINKING_WATER',
    priority: 'HIGH',
    status: 'RESOURCE_ASSIGNED',
    assignedTeam: 'South Block Relief Team',
    timeElapsed: '42 mins ago',
    riskScore: 78
  },
  {
    requestId: 'ER105',
    citizenName: 'Highway Patrol',
    contact: '9876543230',
    emergencyType: 'ACCIDENT',
    location: 'Highway 7 - Kilometer 45',
    peopleAffected: 3,
    description: 'Cargo truck rollover blocking southbound lane.',
    requiredResources: 'AMBULANCE, HEAVY_TOW',
    priority: 'MEDIUM',
    status: 'RESPONDING',
    assignedTeam: 'Unit AMB-02 & Highway Vol',
    timeElapsed: '1h 15m ago',
    riskScore: 54
  },
  {
    requestId: 'ER106',
    citizenName: 'Ramesh Kumar',
    contact: '9876543231',
    emergencyType: 'FOOD_WATER_REQUIREMENT',
    location: 'Kovilpatti - East Slum Cluster',
    peopleAffected: 20,
    description: 'Clean drinking water shortage following main pipe breach.',
    requiredResources: 'FOOD, DRINKING_WATER',
    priority: 'LOW',
    status: 'RESOLVED',
    assignedTeam: 'Civil Supply Dept',
    timeElapsed: '3h 20m ago',
    riskScore: 28
  }
];

export const initialConfig = {
  autoMatchingEnabled: true,
  searchRadiusKm: 15,
  urgencyWeight: 40,
  proximityWeight: 35,
  skillsWeight: 25,
  criticalEscalationMins: 5,
  highResponseSlaMins: 15,
  smsGatewayEnabled: true,
  sirenAudioAlerts: true,
  citizenBroadcastEnabled: true,
  maintenanceMode: false,
  require2FAForStaff: true,
  maxConcurrentDispatchesPerVolunteer: 2,
  disasterThreatLevel: 'LEVEL_1_NORMAL'
};

export const initialAuditLogs = [
  {
    id: 'LOG-901',
    timestamp: '2026-10-13 20:58:14',
    actor: 'admin',
    category: 'AUTH',
    severity: 'INFO',
    action: 'Administrator Login Successful',
    target: 'Auth Subsystem (IP 192.168.1.104)',
    status: 'SUCCESS'
  },
  {
    id: 'LOG-902',
    timestamp: '2026-10-13 20:45:22',
    actor: 'system_daemon',
    category: 'ALGORITHM',
    severity: 'INFO',
    action: 'Auto-Matching Engine Evaluated ER103',
    target: 'Candidate Pool: 4 Resources, 2 Volunteers',
    status: 'SUCCESS'
  },
  {
    id: 'LOG-903',
    timestamp: '2026-10-13 20:22:11',
    actor: 'coordinator',
    category: 'EMERGENCY',
    severity: 'WARNING',
    action: 'Emergency ER104 Status Transition',
    target: 'Status changed PENDING -> RESOURCE_ASSIGNED',
    status: 'SUCCESS'
  },
  {
    id: 'LOG-904',
    timestamp: '2026-10-13 19:30:05',
    actor: 'admin',
    category: 'USER_MGMT',
    severity: 'WARNING',
    action: 'User Account Suspended',
    target: 'USR-006 (Karthik Raja) flagged for review',
    status: 'APPLIED'
  },
  {
    id: 'LOG-905',
    timestamp: '2026-10-13 18:14:50',
    actor: 'system_daemon',
    category: 'BACKUP',
    severity: 'INFO',
    action: 'Automated Snapshot Created',
    target: 'Snapshot: resqnet_backup_20261013.sql (4.2 MB)',
    status: 'COMPLETED'
  },
  {
    id: 'LOG-906',
    timestamp: '2026-10-13 17:02:19',
    actor: 'admin',
    category: 'SECURITY',
    severity: 'SECURITY',
    action: 'Failed Login Threshold Exceeded',
    target: 'IP 203.0.113.88 blocked by Rate Limiter',
    status: 'BLOCKED'
  }
];

export const threatLevels = {
  LEVEL_1_NORMAL: {
    label: 'Normal Operations',
    level: 'DEFCON 5',
    color: '#10b981',
    bg: '#ecfdf5',
    desc: 'All regional emergency systems nominal. Standard resource routing active.'
  },
  LEVEL_2_ADVISORY: {
    label: 'Weather / Resource Advisory',
    level: 'DEFCON 4',
    color: '#3b82f6',
    bg: '#eff6ff',
    desc: 'Elevated monitoring. Volunteers on passive standby.'
  },
  LEVEL_3_ELEVATED: {
    label: 'High Alert',
    level: 'DEFCON 3',
    color: '#f59e0b',
    bg: '#fffbeb',
    desc: 'Critical resource pre-positioning enabled. Accelerated coordinator triage.'
  },
  LEVEL_4_CRITICAL: {
    label: 'Severe Emergency Mode',
    level: 'DEFCON 2',
    color: '#f97316',
    bg: '#fff7ed',
    desc: 'Public warning sirens active. Auto-dispatch override enabled.'
  },
  LEVEL_5_DISASTER: {
    label: 'Catastrophic Disaster State',
    level: 'DEFCON 1',
    color: '#ef4444',
    bg: '#fef2f2',
    desc: 'All fleet mobilized. Civil defense integration activated across all zones.'
  }
};

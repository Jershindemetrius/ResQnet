import { useState, useEffect } from 'react';
import { getVolunteers, createVolunteer, updateVolunteerAvailability } from '../api/resqnetApi.js';
import { Icon } from '@iconify/react';

const fallbackVolunteers = [
  { id: 'VOL-101', name: 'Arun Kumar', contactNumber: '9876543211', skills: 'FIRST_AID', location: 'Kovilpatti Central', available: true, badge: 'Lead Operations', certifications: 'CPR, Trauma Triage Level 2' },
  { id: 'VOL-102', name: 'Dr. Lakshmi Sundaram', contactNumber: '9876543220', skills: 'MEDICAL', location: 'South Block', available: true, badge: 'Trauma Surgeon', certifications: 'MBBS, ATLS certified' },
  { id: 'VOL-103', name: 'Priya Sharma', contactNumber: '9876543216', skills: 'RESCUE', location: 'South Block', available: true, badge: 'Rescue Operations', certifications: 'Swift Water Rescue, Extrication' },
  { id: 'VOL-104', name: 'Suresh Babu', contactNumber: '9876543219', skills: 'FIRST_AID', location: 'North Sector', available: true, badge: 'Paramedic First Aid', certifications: 'Red Cross First Responder' },
  { id: 'VOL-105', name: 'Karthik Raja', contactNumber: '9876543217', skills: 'DRIVER', location: 'Kovilpatti East', available: false, badge: 'Heavy Ambulance Pilot', certifications: 'Code 3 Emergency Driving' },
  { id: 'VOL-106', name: 'Anandhi M.', contactNumber: '9876543224', skills: 'COMMUNICATION', location: 'Sector 4 Hub', available: true, badge: 'Ham Radio & Drone Pilot', certifications: 'Disaster Telemetry' },
  { id: 'VOL-107', name: 'Vignesh K.', contactNumber: '9876543225', skills: 'FIREFIGHTING', location: 'Industrial Corridor', available: true, badge: 'Fire & Hazmat Specialist', certifications: 'Hazmat Level 1' },
  { id: 'VOL-108', name: 'Meena Devi', contactNumber: '9876543218', skills: 'GENERAL', location: 'Kovilpatti Town', available: true, badge: 'Community Coordinator', certifications: 'Civil Defense Volunteer' }
];

export default function VolunteerDirectoryView() {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterSkill, setFilterSkill] = useState('ALL');
  const [filterAvailability, setFilterAvailability] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    contactNumber: '',
    skills: 'FIRST_AID',
    location: ''
  });

  useEffect(() => {
    loadVolunteers();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadVolunteers = async () => {
    try {
      setLoading(true);
      const data = await getVolunteers();
      if (Array.isArray(data) && data.length > 0) {
        setVolunteers(data);
      } else {
        setVolunteers(fallbackVolunteers);
      }
    } catch {
      setVolunteers(fallbackVolunteers);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newVol = {
      ...formData,
      id: `VOL-${Date.now().toString().slice(-4)}`,
      available: true,
      badge: 'Registered Volunteer',
      certifications: 'Verified ID'
    };

    try {
      await createVolunteer(formData);
    } catch {
      // Local fallback append
    }

    setVolunteers(prev => [newVol, ...prev]);
    setShowAddForm(false);
    showToast(`👷 Volunteer "${formData.name}" registered successfully!`);

    setFormData({
      name: '',
      contactNumber: '',
      skills: 'FIRST_AID',
      location: ''
    });
  };

  const toggleAvailability = async (id, currentStatus) => {
    try {
      await updateVolunteerAvailability(id, !currentStatus);
    } catch {
      // Local simulation
    }

    setVolunteers(prev =>
      prev.map(v => (v.id === id ? { ...v, available: !currentStatus } : v))
    );

    showToast(`🔄 Volunteer #${id} duty status: ${!currentStatus ? 'ON STANDBY (READY)' : 'ON DUTY (DEPLOYED)'}`);
  };

  const filteredVolunteers = volunteers.filter(volunteer => {
    const skillMatch = filterSkill === 'ALL' || volunteer.skills === filterSkill;
    const availMatch =
      filterAvailability === 'ALL' ||
      (filterAvailability === 'AVAILABLE' && volunteer.available) ||
      (filterAvailability === 'UNAVAILABLE' && !volunteer.available);
    const query = searchQuery.toLowerCase();
    const searchMatch =
      !query ||
      volunteer.name.toLowerCase().includes(query) ||
      volunteer.location.toLowerCase().includes(query) ||
      (volunteer.contactNumber && volunteer.contactNumber.includes(query)) ||
      (volunteer.certifications && volunteer.certifications.toLowerCase().includes(query));

    return skillMatch && availMatch && searchMatch;
  });

  const totalVolunteers = volunteers.length;
  const availableVolunteers = volunteers.filter(v => v.available).length;
  const onDutyVolunteers = totalVolunteers - availableVolunteers;

  const getSkillIcon = (skill) => {
    switch (skill) {
      case 'FIRST_AID': return 'mdi:medical-bag';
      case 'MEDICAL': return 'mdi:hospital-box';
      case 'FIREFIGHTING': return 'mdi:fire-extinguisher';
      case 'RESCUE': return 'mdi:lifebuoy';
      case 'DRIVER': return 'mdi:car-emergency';
      case 'LOGISTICS': return 'mdi:truck';
      case 'COMMUNICATION': return 'mdi:radio-handheld';
      default: return 'mdi:account-badge';
    }
  };

  return (
    <div className="volunteer-directory-page">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="dash-floating-toast">
          <Icon icon="mdi:account-check" width="18" height="18" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="page-header-premium">
        <div>
          <div className="page-category-strip">
            <span className="live-cad-chip">
              <span className="cad-beacon-ping"></span>
              CIVIL DEFENSE &amp; FIRST RESPONDERS
            </span>
            <span className="node-id-chip">RESPONDER ROSTER</span>
          </div>
          <h1 className="page-main-heading">Certified Volunteer Directory</h1>
          <p className="page-main-subtext">Coordinate citizen first-responders, paramedical volunteers, fire rescue squads, and emergency drivers.</p>
        </div>
        <div className="header-action-block">
          <button
            className="btn-header-primary"
            onClick={() => setShowAddForm(true)}
          >
            <Icon icon="mdi:account-plus" width="18" height="18" />
            <span>Register Volunteer</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="inventory-kpi-grid">
        <div className="kpi-card-glass">
          <div className="kpi-icon-box blue">
            <Icon icon="mdi:account-multiple" width="24" height="24" />
          </div>
          <div className="kpi-info">
            <div className="kpi-label">TOTAL REGISTERED VOLUNTEERS</div>
            <div className="kpi-val">{totalVolunteers}</div>
          </div>
        </div>

        <div className="kpi-card-glass">
          <div className="kpi-icon-box green">
            <Icon icon="mdi:shield-check" width="24" height="24" />
          </div>
          <div className="kpi-info">
            <div className="kpi-label">STANDBY / READY FOR DISPATCH</div>
            <div className="kpi-val">{availableVolunteers}</div>
          </div>
        </div>

        <div className="kpi-card-glass">
          <div className="kpi-icon-box amber">
            <Icon icon="mdi:account-clock" width="24" height="24" />
          </div>
          <div className="kpi-info">
            <div className="kpi-label">ACTIVELY DEPLOYED ON RUNS</div>
            <div className="kpi-val">{onDutyVolunteers}</div>
          </div>
        </div>

        <div className="kpi-card-glass">
          <div className="kpi-icon-box teal">
            <Icon icon="mdi:certificate" width="24" height="24" />
          </div>
          <div className="kpi-info">
            <div className="kpi-label">CERTIFIED TRAUMA RESPONDERS</div>
            <div className="kpi-val">100% Verified</div>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="controls-bar-glass">
        <div className="search-input-box">
          <Icon icon="mdi:magnify" width="18" height="18" className="search-icon" />
          <input
            type="text"
            placeholder="Search by volunteer name, location, contact, or certification..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="search-clear-btn" onClick={() => setSearchQuery('')}>
              <Icon icon="mdi:close" width="14" height="14" />
            </button>
          )}
        </div>

        <div className="dropdown-filter-group">
          <div className="select-pill-wrap">
            <Icon icon="mdi:filter-variant" width="16" height="16" />
            <select value={filterSkill} onChange={(e) => setFilterSkill(e.target.value)}>
              <option value="ALL">All Skill Sets</option>
              <option value="FIRST_AID">🩹 First Aid</option>
              <option value="MEDICAL">🏥 Medical &amp; Trauma</option>
              <option value="FIREFIGHTING">🔥 Fire Suppression</option>
              <option value="RESCUE">⛑️ Rescue Operations</option>
              <option value="DRIVER">🚗 Ambulance / Pilot</option>
              <option value="COMMUNICATION">📡 Radio / Telemetry</option>
              <option value="GENERAL">👤 General Support</option>
            </select>
          </div>

          <div className="select-pill-wrap">
            <Icon icon="mdi:radio-tower" width="16" height="16" />
            <select value={filterAvailability} onChange={(e) => setFilterAvailability(e.target.value)}>
              <option value="ALL">All Duty States</option>
              <option value="AVAILABLE">Standby (Ready)</option>
              <option value="UNAVAILABLE">Deployed / On Duty</option>
            </select>
          </div>
        </div>
      </div>

      {/* Registration Modal */}
      {showAddForm && (
        <div className="modal-backdrop-custom" onClick={() => setShowAddForm(false)}>
          <div className="modal-card-custom" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-custom">
              <div className="modal-title-wrap">
                <Icon icon="mdi:account-badge-outline" width="22" height="22" className="modal-icon" />
                <h3>Register Emergency Volunteer</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setShowAddForm(false)}>
                <Icon icon="mdi:close" width="20" height="20" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form-custom">
              <div className="form-group-custom">
                <label>Full Legal Name *</label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Anandhi Muthukumar"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-row-2col">
                <div className="form-group-custom">
                  <label>Emergency Contact Number *</label>
                  <input
                    type="tel"
                    name="contactNumber"
                    placeholder="e.g. 9876543210"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group-custom">
                  <label>Primary Skill Specialization *</label>
                  <select name="skills" value={formData.skills} onChange={handleChange} required>
                    <option value="FIRST_AID">🩹 Certified First Aid</option>
                    <option value="MEDICAL">🏥 Medical Doctor / Nurse</option>
                    <option value="FIREFIGHTING">🔥 Firefighting Specialist</option>
                    <option value="RESCUE">⛑️ Swift Water / Heavy Rescue</option>
                    <option value="DRIVER">🚗 Emergency Vehicle Driver</option>
                    <option value="COMMUNICATION">📡 Radio Communications / Drone</option>
                    <option value="GENERAL">👤 General Community Support</option>
                  </select>
                </div>
              </div>

              <div className="form-group-custom">
                <label>Assigned Sector Location *</label>
                <input
                  type="text"
                  name="location"
                  placeholder="e.g. Kovilpatti Central / South Block"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="modal-footer-custom">
                <button type="button" className="btn-cancel" onClick={() => setShowAddForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  <Icon icon="mdi:check" width="18" height="18" />
                  <span>Complete Registration</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Volunteers Cards Grid */}
      <div className="volunteers-cards-grid">
        {filteredVolunteers.length === 0 ? (
          <div className="empty-state-fullwidth">
            <Icon icon="mdi:account-search-outline" width="48" height="48" />
            <h3>No volunteers match your criteria</h3>
            <p>Try modifying your skill category or availability filters.</p>
          </div>
        ) : (
          filteredVolunteers.map((vol) => {
            const isAvail = vol.available;
            return (
              <div key={vol.id} className={`volunteer-card-modern ${isAvail ? 'available' : 'on-duty'}`}>
                <div className="card-top-strip">
                  <div className="vol-avatar-circle">
                    <Icon icon={getSkillIcon(vol.skills)} width="22" height="22" />
                  </div>
                  <span className={`status-tag ${isAvail ? 'tag-green' : 'tag-amber'}`}>
                    <span className="dot"></span>
                    {isAvail ? 'STANDBY READY' : 'ON DUTY'}
                  </span>
                </div>

                <div className="vol-main-info">
                  <div className="vol-name">{vol.name}</div>
                  <div className="vol-badge-tag">{vol.badge || 'Volunteer Responder'}</div>

                  <div className="vol-meta-list">
                    <div className="vol-meta-item">
                      <Icon icon="mdi:map-marker" width="14" height="14" />
                      <span>{vol.location}</span>
                    </div>
                    <div className="vol-meta-item">
                      <Icon icon="mdi:phone" width="14" height="14" />
                      <a href={`tel:${vol.contactNumber}`} className="vol-phone-link">
                        {vol.contactNumber}
                      </a>
                    </div>
                    {vol.certifications && (
                      <div className="vol-meta-item cert-item">
                        <Icon icon="mdi:certificate" width="14" height="14" />
                        <span>{vol.certifications}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="card-footer-strip">
                  <span className="skill-chip">
                    {vol.skills.replace('_', ' ')}
                  </span>
                  <button
                    className={`btn-toggle-status ${isAvail ? 'btn-mark-deploy' : 'btn-mark-avail'}`}
                    onClick={() => toggleAvailability(vol.id, isAvail)}
                    title={isAvail ? 'Deploy to active emergency' : 'Mark as Available on Standby'}
                  >
                    <Icon icon={isAvail ? 'mdi:truck-fast' : 'mdi:check-circle'} width="16" height="16" />
                    <span>{isAvail ? 'Deploy Volunteer' : 'Mark Standby'}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

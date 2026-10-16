import { useState, useEffect } from 'react';
import { getResources, createResource, updateResourceAvailability } from '../api/resqnetApi.js';
import { Icon } from '@iconify/react';

const fallbackResources = [
  { id: 'RES-101', type: 'AMBULANCE', location: 'Kovilpatti Central Depot', quantity: 1, provider: 'Kovilpatti City Hospital', available: true, callsign: 'ALS-101' },
  { id: 'RES-102', type: 'AMBULANCE', location: 'South Block Emergency Bay', quantity: 1, provider: 'Red Cross Emergency Wing', available: true, callsign: 'BLS-104' },
  { id: 'RES-103', type: 'FIRE_TRUCK', location: 'North Sector Station 2', quantity: 1, provider: 'District Fire & Rescue', available: false, callsign: 'T-02' },
  { id: 'RES-104', type: 'VEHICLE', location: 'Highway 7 Outpost', quantity: 2, provider: 'Highway Patrol Command', available: true, callsign: 'RIV-01' },
  { id: 'RES-105', type: 'MEDICAL_KIT', location: 'Kovilpatti GH Cath Lab', quantity: 12, provider: 'State Health Mission', available: true, callsign: 'O2-50L' },
  { id: 'RES-106', type: 'RESCUE_EQUIPMENT', location: 'River Bank Embankment Depot', quantity: 2, provider: 'State Disaster Response Force', available: false, callsign: 'BOAT-Z9' },
  { id: 'RES-107', type: 'SHELTER', location: 'Community Center East', quantity: 120, provider: 'Civil Defense Directorate', available: true, callsign: 'SH-01' },
  { id: 'RES-108', type: 'WATER', location: 'Central Supply Water Tanks', quantity: 5000, provider: 'Municipal Water Works', available: true, callsign: 'H2O-TANK' },
  { id: 'RES-109', type: 'FOOD', location: 'Relief Warehouse South', quantity: 800, provider: 'Civil Supplies Corporation', available: true, callsign: 'RATION-P1' }
];

export default function ResourceInventoryView() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [filterType, setFilterType] = useState('ALL');
  const [filterAvailability, setFilterAvailability] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  const [formData, setFormData] = useState({
    type: 'AMBULANCE',
    location: '',
    quantity: 1,
    provider: ''
  });

  useEffect(() => {
    loadResources();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadResources = async () => {
    try {
      setLoading(true);
      const data = await getResources();
      setResources(data);
    } catch {
      setResources(fallbackResources);
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
    const newRes = {
      ...formData,
      id: `RES-${Date.now().toString().slice(-4)}`,
      available: true
    };

    try {
      await createResource(formData);
    } catch {
      // Local fallback append
    }

    setResources(prev => [newRes, ...prev]);
    setShowAddForm(false);
    showToast(`📦 New resource "${formData.type}" added successfully!`);

    setFormData({
      type: 'AMBULANCE',
      location: '',
      quantity: 1,
      provider: ''
    });
  };

  const toggleAvailability = async (id, currentStatus) => {
    try {
      await updateResourceAvailability(id, !currentStatus);
    } catch {
      // Local simulation
    }

    setResources(prev =>
      prev.map(r => (r.id === id ? { ...r, available: !currentStatus } : r))
    );

    showToast(`🔄 Resource #${id} status changed to ${!currentStatus ? 'AVAILABLE' : 'IN USE'}`);
  };

  const filteredResources = resources.filter(res => {
    const typeMatch = filterType === 'ALL' || res.type === filterType;
    const availMatch =
      filterAvailability === 'ALL' ||
      (filterAvailability === 'AVAILABLE' && res.available) ||
      (filterAvailability === 'UNAVAILABLE' && !res.available);
    const query = searchQuery.toLowerCase();
    const searchMatch =
      !query ||
      (res.location && res.location.toLowerCase().includes(query)) ||
      (res.provider && res.provider.toLowerCase().includes(query)) ||
      (res.type && res.type.toLowerCase().includes(query)) ||
      (res.callsign && res.callsign.toLowerCase().includes(query));

    return typeMatch && availMatch && searchMatch;
  });

  const totalCount = resources.length;
  const availableCount = resources.filter(r => r.available).length;
  const inUseCount = totalCount - availableCount;

  const getResourceIcon = (type) => {
    switch (type) {
      case 'AMBULANCE': return 'mdi:ambulance';
      case 'FIRE_TRUCK': return 'mdi:fire-truck';
      case 'MEDICAL_KIT': return 'mdi:medical-bag';
      case 'FOOD': return 'mdi:food';
      case 'WATER': return 'mdi:water';
      case 'SHELTER': return 'mdi:home-group';
      case 'RESCUE_EQUIPMENT': return 'mdi:lifebuoy';
      case 'VEHICLE': return 'mdi:car-emergency';
      default: return 'mdi:package-variant';
    }
  };

  return (
    <div className="resource-inventory-page">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="dash-floating-toast">
          <Icon icon="mdi:package-check" width="18" height="18" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="page-header-premium">
        <div>
          <div className="page-category-strip">
            <span className="live-cad-chip">
              <span className="cad-beacon-ping"></span>
              FLEET &amp; INVENTORY TELEMATICS
            </span>
            <span className="node-id-chip">EQUIPMENT DIRECTORY</span>
          </div>
          <h1 className="page-main-heading">Regional Resource Inventory</h1>
          <p className="page-main-subtext">Monitor and dispatch medical equipment, emergency fleet vehicles, field triage units, and municipal supplies.</p>
        </div>
        <div className="header-action-block">
          <button
            className="btn-header-primary"
            onClick={() => setShowAddForm(true)}
          >
            <Icon icon="mdi:plus" width="18" height="18" />
            <span>Add New Resource</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="inventory-kpi-grid">
        <div className="kpi-card-glass">
          <div className="kpi-icon-box blue">
            <Icon icon="mdi:cube-outline" width="24" height="24" />
          </div>
          <div className="kpi-info">
            <div className="kpi-label">TOTAL REGISTERED ASSETS</div>
            <div className="kpi-val">{totalCount}</div>
          </div>
        </div>

        <div className="kpi-card-glass">
          <div className="kpi-icon-box green">
            <Icon icon="mdi:check-circle-outline" width="24" height="24" />
          </div>
          <div className="kpi-info">
            <div className="kpi-label">READY FOR DISPATCH</div>
            <div className="kpi-val">{availableCount}</div>
          </div>
        </div>

        <div className="kpi-card-glass">
          <div className="kpi-icon-box amber">
            <Icon icon="mdi:truck-fast" width="24" height="24" />
          </div>
          <div className="kpi-info">
            <div className="kpi-label">ACTIVELY DEPLOYED / IN USE</div>
            <div className="kpi-val">{inUseCount}</div>
          </div>
        </div>

        <div className="kpi-card-glass">
          <div className="kpi-icon-box teal">
            <Icon icon="mdi:shield-airplane" width="24" height="24" />
          </div>
          <div className="kpi-info">
            <div className="kpi-label">FLEET READINESS RATE</div>
            <div className="kpi-val">{totalCount > 0 ? `${Math.round((availableCount / totalCount) * 100)}%` : '100%'}</div>
          </div>
        </div>
      </div>

      {/* Controls & Filter Panel */}
      <div className="controls-bar-glass">
        <div className="search-input-box">
          <Icon icon="mdi:magnify" width="18" height="18" className="search-icon" />
          <input
            type="text"
            placeholder="Search by callsign, location, provider, or type..."
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
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="ALL">All Categories</option>
              <option value="AMBULANCE">🚑 Ambulance</option>
              <option value="FIRE_TRUCK">🚒 Fire Truck</option>
              <option value="MEDICAL_KIT">🏥 Medical Kit</option>
              <option value="FOOD">🍲 Food Supplies</option>
              <option value="WATER">💧 Water Tankers</option>
              <option value="SHELTER">🏠 Emergency Shelter</option>
              <option value="RESCUE_EQUIPMENT">⛑️ Rescue Gear</option>
              <option value="VEHICLE">🚗 Vehicles</option>
            </select>
          </div>

          <div className="select-pill-wrap">
            <Icon icon="mdi:radio-tower" width="16" height="16" />
            <select value={filterAvailability} onChange={(e) => setFilterAvailability(e.target.value)}>
              <option value="ALL">All Status</option>
              <option value="AVAILABLE">Available</option>
              <option value="UNAVAILABLE">Deployed / In Use</option>
            </select>
          </div>
        </div>
      </div>

      {/* Add Resource Modal / Drawer */}
      {showAddForm && (
        <div className="modal-backdrop-custom" onClick={() => setShowAddForm(false)}>
          <div className="modal-card-custom" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-custom">
              <div className="modal-title-wrap">
                <Icon icon="mdi:package-variant-closed-plus" width="22" height="22" className="modal-icon" />
                <h3>Add New Emergency Resource</h3>
              </div>
              <button className="modal-close-btn" onClick={() => setShowAddForm(false)}>
                <Icon icon="mdi:close" width="20" height="20" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form-custom">
              <div className="form-group-custom">
                <label>Resource Category *</label>
                <select name="type" value={formData.type} onChange={handleChange} required>
                  <option value="AMBULANCE">🚑 Advanced / Basic Ambulance</option>
                  <option value="FIRE_TRUCK">🚒 Fire Tender / Heavy Extinguisher</option>
                  <option value="MEDICAL_KIT">🏥 Trauma &amp; Oxygen Supply Kit</option>
                  <option value="FOOD">🍲 Dry Ration Food Packs</option>
                  <option value="WATER">💧 Potable Drinking Water Supply</option>
                  <option value="SHELTER">🏠 High-Capacity Emergency Shelter</option>
                  <option value="RESCUE_EQUIPMENT">⛑️ Inflatable Boat / Extrication Tool</option>
                  <option value="VEHICLE">🚗 Fast Response Utility Vehicle</option>
                </select>
              </div>

              <div className="form-row-2col">
                <div className="form-group-custom">
                  <label>Quantity Available *</label>
                  <input
                    type="number"
                    name="quantity"
                    min="1"
                    value={formData.quantity}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group-custom">
                  <label>Provider / Depository *</label>
                  <input
                    type="text"
                    name="provider"
                    placeholder="e.g. Kovilpatti City Hospital"
                    value={formData.provider}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group-custom">
                <label>Base Sector Location *</label>
                <input
                  type="text"
                  name="location"
                  placeholder="e.g. Central Fire Station / Sector 4"
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
                  <span>Register Resource</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resources Cards Grid */}
      <div className="resources-cards-grid">
        {filteredResources.length === 0 ? (
          <div className="empty-state-fullwidth">
            <Icon icon="mdi:archive-search-outline" width="48" height="48" />
            <h3>No resources found</h3>
            <p>Try adjusting your search query or category filters.</p>
          </div>
        ) : (
          filteredResources.map((res) => {
            const isAvail = res.available;
            return (
              <div key={res.id} className={`resource-card-modern ${isAvail ? 'available' : 'in-use'}`}>
                <div className="card-top-strip">
                  <div className="res-type-badge">
                    <Icon icon={getResourceIcon(res.type)} width="18" height="18" />
                    <span>{res.type.replace('_', ' ')}</span>
                  </div>
                  <span className={`status-tag ${isAvail ? 'tag-green' : 'tag-amber'}`}>
                    <span className="dot"></span>
                    {isAvail ? 'AVAILABLE' : 'IN USE'}
                  </span>
                </div>

                <div className="res-main-info">
                  <div className="res-name-title">
                    {res.callsign ? `${res.callsign} &bull; ` : ''}
                    {res.type}
                  </div>
                  <div className="res-location-row">
                    <Icon icon="mdi:map-marker" width="14" height="14" />
                    <span>{res.location || 'Kovilpatti Sector Depot'}</span>
                  </div>
                  <div className="res-provider-row">
                    <Icon icon="mdi:domain" width="14" height="14" />
                    <span>{res.provider || 'Civil Protection Department'}</span>
                  </div>
                </div>

                <div className="card-footer-strip">
                  <div className="quantity-badge">
                    <span className="qty-num">{res.quantity || 1}</span>
                    <span className="qty-label">units</span>
                  </div>
                  <button
                    className={`btn-toggle-status ${isAvail ? 'btn-mark-deploy' : 'btn-mark-avail'}`}
                    onClick={() => toggleAvailability(res.id, isAvail)}
                    title={isAvail ? 'Mark as Deployed' : 'Return to Available Fleet'}
                  >
                    <Icon icon={isAvail ? 'mdi:truck-fast' : 'mdi:check-circle'} width="16" height="16" />
                    <span>{isAvail ? 'Deploy Asset' : 'Mark Available'}</span>
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

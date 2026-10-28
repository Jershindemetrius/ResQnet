import { useCallback, useEffect, useState } from 'react';
import {
  Activity,
  Ambulance,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Clock3,
  RefreshCw,
  ShieldAlert,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { getAdminDashboard, getAdminEmergencies } from '../api/resqnetApi.js';
import './AdminDashboardView.css';

const formatStatus = (value) => value?.toLowerCase().replaceAll('_', ' ') ?? 'Unknown';

function AvailabilityCard({ label, available, total, icon: Icon, tone }) {
  const percentage = total > 0 ? Math.min(100, Math.round((available / total) * 100)) : 0;

  return (
    <article className={`admin-stat-card admin-stat-${tone} admin-availability-card`}>
      <span className="admin-stat-icon"><Icon size={20} aria-hidden="true" /></span>
      <span className="admin-stat-label">{label}</span>
      <strong>{available} <small>of {total}</small></strong>
      <span
        className="admin-availability-track"
        role="progressbar"
        aria-label={`${label} available`}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={Math.min(available, total)}
      >
        <span style={{ width: `${percentage}%` }} />
      </span>
    </article>
  );
}

export default function AdminDashboardView() {
  const [overview, setOverview] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [dashboard, recent] = await Promise.all([
        getAdminDashboard(),
        getAdminEmergencies({ limit: 8, offset: 0 }),
      ]);
      setOverview(dashboard);
      setIncidents(recent);
      setLastUpdated(new Date());
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to load operations data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const stats = overview ? [
    { label: 'Active incidents', value: overview.activeEmergencies ?? 0, icon: ShieldAlert, tone: 'red' },
    { label: 'Resolved today', value: overview.resolvedToday ?? 0, icon: CheckCircle2, tone: 'green' },
  ] : [];
  const priorities = overview ? [
    { label: 'Critical', value: overview.criticalCount ?? 0, tone: 'critical' },
    { label: 'High', value: overview.highCount ?? 0, tone: 'high' },
    { label: 'Medium', value: overview.mediumCount ?? 0, tone: 'medium' },
    { label: 'Low', value: overview.lowCount ?? 0, tone: 'low' },
  ] : [];
  const activeCount = overview?.activeEmergencies ?? 0;

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <div>
          <h1>Admin operations</h1>
        </div>
        <div className="admin-header-actions">
          {lastUpdated && (
            <span className="admin-last-updated"><Clock3 size={14} aria-hidden="true" /> Updated {lastUpdated.toLocaleTimeString()}</span>
          )}
          <button className="admin-refresh" type="button" onClick={refresh} disabled={loading}>
            <RefreshCw size={17} aria-hidden="true" className={loading ? 'admin-refresh-spinning' : ''} />
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </header>

      {error && (
        <div className="admin-error" role="alert">
          <div><strong>{overview ? 'Could not refresh operations data' : 'Could not load operations data'}</strong><p>{error}</p></div>
          <button type="button" onClick={refresh}>Try again</button>
        </div>
      )}

      {loading && !overview ? (
        <div className="admin-empty" role="status">Loading dashboard…</div>
      ) : overview ? (
        <>
          <section className="admin-stats-grid" aria-label="Live operations totals">
            {stats.map(({ label, value, icon: Icon, tone }) => (
              <article className={`admin-stat-card admin-stat-${tone}`} key={label}>
                <span className="admin-stat-icon"><Icon size={20} aria-hidden="true" /></span>
                <span className="admin-stat-label">{label}</span>
                <strong>{value}</strong>
              </article>
            ))}
            <AvailabilityCard
              label="Available resources"
              available={overview.availableResources ?? 0}
              total={overview.totalResources ?? 0}
              icon={Ambulance}
              tone="blue"
            />
            <AvailabilityCard
              label="Available volunteers"
              available={overview.availableVolunteers ?? 0}
              total={overview.totalVolunteers ?? 0}
              icon={Users}
              tone="green"
            />
          </section>

          <section className="admin-content-card admin-priority-card" aria-labelledby="admin-priority-heading">
            <div className="admin-card-heading">
              <div>
                <h2 id="admin-priority-heading"><Activity size={19} aria-hidden="true" /> Active incident priorities</h2>
              </div>
              <span className="admin-active-total">{activeCount} active</span>
            </div>
            <div className="admin-priority-breakdown">
              {priorities.map(({ label, value, tone }) => {
                const percentage = activeCount > 0 ? Math.min(100, (value / activeCount) * 100) : 0;
                return (
                  <div className="admin-priority-row" key={label}>
                    <span className={`admin-priority-label admin-priority-label-${tone}`}>{label}</span>
                    <span
                      className="admin-priority-track"
                      role="progressbar"
                      aria-label={`${label} priority incidents`}
                      aria-valuemin={0}
                      aria-valuemax={activeCount}
                      aria-valuenow={value}
                    >
                      <span style={{ width: `${percentage}%` }} />
                    </span>
                    <strong>{value}</strong>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="admin-content-card">
            <div className="admin-card-heading">
              <div>
                <h2><ClipboardList size={19} aria-hidden="true" /> Priority-ranked reports</h2>
              </div>
              <Link to="/emergencies" className="admin-text-link">Open incident center <ArrowRight size={16} /></Link>
            </div>
            {incidents.length === 0 ? (
              <div className="admin-empty">There are no incident records to display.</div>
            ) : (
              <div className="admin-table-scroll">
                <table className="admin-incidents-table">
                  <thead><tr><th>Report</th><th>Type</th><th>Location</th><th>Priority</th><th>Status</th></tr></thead>
                  <tbody>
                    {incidents.map((incident) => (
                      <tr key={incident.id}>
                        <td className="admin-incident-id">{incident.id}</td>
                        <td>{incident.type}</td>
                        <td>{incident.location}</td>
                        <td><span className={`admin-priority admin-priority-${incident.priority?.toLowerCase() ?? 'unknown'}`}>{incident.priority ?? 'Unknown'}</span></td>
                        <td><span className={`admin-status admin-status-${incident.status?.toLowerCase() ?? 'unknown'}`}>{formatStatus(incident.status)}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <nav className="admin-shortcuts" aria-label="Operations pages">
            <Link to="/emergencies"><ShieldAlert size={20} aria-hidden="true" /><span><strong>Incident center</strong></span><ArrowRight size={17} aria-hidden="true" /></Link>
            <Link to="/resources"><Ambulance size={20} aria-hidden="true" /><span><strong>Resource inventory</strong></span><ArrowRight size={17} aria-hidden="true" /></Link>
            <Link to="/volunteers"><Users size={20} aria-hidden="true" /><span><strong>Volunteer directory</strong></span><ArrowRight size={17} aria-hidden="true" /></Link>
          </nav>
        </>
      ) : !loading && !error ? (
        <div className="admin-empty" role="status">No operations data is available.</div>
      ) : null}
    </div>
  );
}

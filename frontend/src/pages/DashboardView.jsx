import StatCard from '../components/StatCard.jsx';

export default function DashboardView() {
  return (
    <section>
      <h1>Response dashboard</h1>
      <div className="stats">
        <StatCard label="Active emergencies" value="0" />
        <StatCard label="Available resources" value="0" />
        <StatCard label="On-duty volunteers" value="0" />
      </div>
    </section>
  );
}

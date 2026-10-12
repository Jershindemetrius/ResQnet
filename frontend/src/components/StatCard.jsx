export default function StatCard({ label, value }) {
  return (
    <section className="stat-card">
      <div>{label}</div>
      <p className="stat-value">{value}</p>
    </section>
  );
}

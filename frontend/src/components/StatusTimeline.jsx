export default function StatusTimeline({ status }) {
  const statuses = ['PENDING', 'RESOURCE_ASSIGNED', 'RESPONDING', 'ON_SITE', 'RESOLVED'];
  const currentIndex = statuses.indexOf(status);

  const getStatusLabel = (status) => {
    const labels = {
      PENDING: 'Pending',
      RESOURCE_ASSIGNED: 'Resource Assigned',
      RESPONDING: 'Responding',
      ON_SITE: 'On Site',
      RESOLVED: 'Resolved'
    };
    return labels[status] || status;
  };

  return (
    <div className="status-timeline">
      {statuses.map((s, index) => (
        <div
          key={s}
          className={`timeline-step ${index <= currentIndex ? 'active' : ''} ${s === status ? 'current' : ''}`}
        >
          <div className="timeline-marker">{index + 1}</div>
          <div className="timeline-label">{getStatusLabel(s)}</div>
        </div>
      ))}
    </div>
  );
}

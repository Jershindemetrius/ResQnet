export default function PriorityBadge({ priority }) {
  const getPriorityClass = (level) => {
    const classes = {
      CRITICAL: 'priority-critical',
      HIGH: 'priority-high',
      MEDIUM: 'priority-medium',
      LOW: 'priority-low'
    };
    return classes[level] || 'priority-medium';
  };

  return (
    <span className={`priority-badge ${getPriorityClass(priority)}`}>
      {priority}
    </span>
  );
}

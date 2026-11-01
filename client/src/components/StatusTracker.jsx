const steps = ['Placed', 'Processing', 'Shipped', 'Delivered'];

export default function StatusTracker({ status }) {
  if (status === 'Cancelled') {
    return <div className="status-cancelled">This order was cancelled</div>;
  }
  const current = steps.indexOf(status);
  return (
    <ol className="tracker">
      {steps.map((s, i) => (
        <li key={s} className={i <= current ? 'done' : ''}>
          <span className="dot" />
          {s}
        </li>
      ))}
    </ol>
  );
}

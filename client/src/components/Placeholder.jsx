export default function Placeholder() {
  return (
    <div className="placeholder">
      <div className="placeholder-ring" aria-hidden="true">
        <span className="placeholder-icon">✦</span>
      </div>
      <h3>Your canvas awaits</h3>
      <p>Describe your vision in the panel, then hit Generate.</p>
      <p className="placeholder-hint">Results appear here in seconds</p>
    </div>
  );
}

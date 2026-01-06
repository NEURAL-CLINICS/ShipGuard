export default function TopBar() {
  return (
    <header className="topbar">
      <div>
        <div className="eyebrow">Release window</div>
        <div className="title">ShipGuard Overview</div>
      </div>
      <div className="topbar-actions">
        <input className="search" placeholder="Search findings" />
        <button className="button primary" type="button">
          New scan
        </button>
      </div>
    </header>
  );
}

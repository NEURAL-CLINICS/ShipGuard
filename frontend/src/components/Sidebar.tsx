import { NavLink } from "react-router-dom";
import { sampleProjects } from "../lib/sampleData";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="logo">ShipGuard</div>
      <div className="sidebar-section">Workspace</div>
      <nav className="sidebar-nav">
        <NavLink to="/dashboard">Dashboard</NavLink>
        {sampleProjects.map((project) => (
          <NavLink key={project.id} to={`/projects/${project.id}`}>
            {project.name}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-section">Pre-release</div>
      <nav className="sidebar-nav">
        <NavLink to={`/projects/${sampleProjects[0].id}/checklist`}>Checklist</NavLink>
      </nav>
    </aside>
  );
}

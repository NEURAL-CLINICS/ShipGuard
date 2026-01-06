import { NavLink } from "react-router-dom";
import { useProjects } from "../lib/useProjects";

export default function Sidebar() {
  const { projects } = useProjects();
  return (
    <aside className="sidebar">
      <div className="logo">ShipGuard</div>
      <div className="sidebar-section">Workspace</div>
      <nav className="sidebar-nav">
        <NavLink to="/dashboard">Dashboard</NavLink>
        {projects.map((project) => (
          <NavLink key={project.id} to={`/projects/${project.id}`}>
            {project.name}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-section">Pre-release</div>
      <nav className="sidebar-nav">
        {projects[0] ? (
          <NavLink to={`/projects/${projects[0].id}/checklist`}>Checklist</NavLink>
        ) : null}
      </nav>
    </aside>
  );
}

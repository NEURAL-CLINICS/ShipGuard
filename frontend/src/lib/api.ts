const apiUrl = import.meta.env.VITE_API_URL;

function getAuthHeaders() {
  const token = localStorage.getItem("shipguard_token");
  if (!token) {
    return {};
  }
  return { Authorization: `Bearer ${token}` };
}

async function request(path: string) {
  if (!apiUrl) {
    return null;
  }
  const response = await fetch(`${apiUrl}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders()
    }
  });
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
}

export async function fetchProjects() {
  return request("/api/projects");
}

export async function fetchProject(projectId: string) {
  return request(`/api/projects/${projectId}`);
}

export async function fetchProjectScans(projectId: string) {
  return request(`/api/projects/${projectId}/scans`);
}

export async function fetchScanFindings(scanId: string) {
  return request(`/api/scans/${scanId}/findings`);
}

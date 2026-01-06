import { useEffect, useState } from "react";
import { fetchProjects } from "./api";
import { sampleProjects } from "./sampleData";
import type { Project } from "./sampleData";

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>(sampleProjects);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  type ApiProject = {
    id: string;
    name: string;
    repoUrl?: string;
  };

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const response = await fetchProjects();
        if (!response || !mounted) {
          return;
        }
        const apiProjects = (response.projects ?? []) as ApiProject[];
        const mapped = apiProjects.map((project) => ({
          id: project.id,
          name: project.name,
          repoUrl: project.repoUrl ?? "No repo connected",
          lastScan: "No scans yet",
          lastScanStatus: "queued",
          riskLevel: "low",
          findings: []
        }));
        if (mounted) {
          setProjects(mapped.length > 0 ? mapped : sampleProjects);
        }
      } catch (err) {
        if (mounted) {
          setError("Failed to load projects");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  return { projects, loading, error };
}

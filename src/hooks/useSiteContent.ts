import { useCallback, useEffect, useState } from "react";
import { getProjects, getServices } from "../api/client";
import {
  sortServices,
  toDisplayProject,
  toDisplayService,
  type DisplayProject,
  type DisplayService,
} from "../lib/siteContent";

type LoadState = "idle" | "loading" | "ready" | "error";

export function useSiteContent() {
  const [projects, setProjects] = useState<DisplayProject[]>([]);
  const [services, setServices] = useState<DisplayService[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("idle");

  const load = useCallback(async () => {
    setLoadState("loading");
    try {
      const [projectsRes, servicesRes] = await Promise.all([getProjects(), getServices()]);
      setProjects(projectsRes.projects.map(toDisplayProject));
      setServices(sortServices(servicesRes.services.map(toDisplayService)));
      setLoadState("ready");
    } catch {
      setLoadState("error");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return {
    projects,
    services,
    loading: loadState === "loading" || loadState === "idle",
    error: loadState === "error",
    retry: load,
  };
}

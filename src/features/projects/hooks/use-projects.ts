"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useServices } from "@/services/provider";
import type { CreateProjectInput, Project, ProjectQuery } from "@/types/studio";

export function useProjects(query: ProjectQuery) {
  const services = useServices();
  return useQuery({
    queryKey: ["projects", query],
    queryFn: ({ signal }) => services.projects.list(query, signal),
  });
}
export function useProject(id: string) {
  const services = useServices();
  return useQuery({
    queryKey: ["project", id],
    queryFn: ({ signal }) => services.projects.get(id, signal),
    retry: false,
  });
}
export function useCreateProject() {
  const services = useServices();
  const cache = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: (input: CreateProjectInput) => services.projects.create(input),
    onSuccess: (project) => {
      void cache.invalidateQueries({ queryKey: ["projects"] });
      router.push(`/editor/${project.id}`);
    },
  });
}
export function useProjectActions() {
  const services = useServices();
  const cache = useQueryClient();
  return useMutation({
    mutationFn: async (action: {
      id: string;
      type: "duplicate" | "delete" | "status" | "rename";
      status?: Project["status"];
      title?: string;
    }) => {
      switch (action.type) {
        case "duplicate":
          return services.projects.duplicate(action.id);
        case "delete":
          return services.projects.delete(action.id);
        case "status":
          return services.projects.update(action.id, { status: action.status });
        case "rename":
          return services.projects.update(action.id, { title: action.title });
      }
    },
    onSuccess: () => {
      void cache.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

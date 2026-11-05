import type { ComponentProps } from "react";

type ProjectModalClientType = typeof import("./ProjectModalClient").default;
export type ProjectData = ComponentProps<ProjectModalClientType>["projectData"];

export let ProjectModalClient: ProjectModalClientType | null = null;
const loaded = new Map<string, ProjectData>();
const requests = new Map<string, Promise<ProjectData>>();

export const loadProjectModalClient = () =>
  import("./ProjectModalClient").then(module => {
    ProjectModalClient = module.default;
  });

export const cachedProject = (locale: string, id: number) => loaded.get(`${locale}/${id}`) ?? null;

export const fetchProject = (locale: string, id: number) => {
  const key = `${locale}/${id}`;
  let request = requests.get(key);
  if (!request) {
    request = fetch(`/assets/projects/${key}`)
      .then(response => {
        if (!response.ok) throw new Error(`Project ${key} failed to load: ${response.status}`);
        return response.json() as Promise<ProjectData>;
      })
      .then(data => {
        loaded.set(key, data);
        return data;
      });
    request.catch(() => requests.delete(key));
    requests.set(key, request);
  }
  return request;
};

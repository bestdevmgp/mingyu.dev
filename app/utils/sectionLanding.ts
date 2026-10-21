export const NAV_SECTIONS = ["competencies", "skills", "career", "projects", "blog", "education"] as const;

export type NavSection = (typeof NAV_SECTIONS)[number];

export const TOC_QUERY = "(min-width: 80rem)";

const ACTIVE_LINE = 60;

export const sectionElements = (ids: readonly string[]) =>
  ids.map(id => document.getElementById(id)).filter(el => el !== null);

const landingTop = (section: HTMLElement) =>
  section.getBoundingClientRect().top - (parseFloat(getComputedStyle(section).scrollMarginTop) || 0);

const naturalLanding = (section: HTMLElement) => {
  const padding = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
  const end = document.documentElement.scrollHeight - window.innerHeight;
  return Math.min(Math.max(landingTop(section) + window.scrollY - padding, 0), end);
};

export const anchorsOf = (sections: HTMLElement[]) => {
  const anchors = sections.map(section => landingTop(section) + window.scrollY - ACTIVE_LINE);
  const end = document.documentElement.scrollHeight - window.innerHeight - 1;
  const reachable = anchors.filter(anchor => anchor <= end).length;
  const from = reachable ? anchors[reachable - 1] : 0;
  const missing = anchors.length - reachable;
  return anchors.map((anchor, i) => (i < reachable ? anchor : from + ((end - from) * (i - reachable + 1)) / missing));
};

export const landingOf = (sections: HTMLElement[], id: string) => {
  const index = sections.findIndex(section => section.id === id);
  const anchors = anchorsOf(sections);
  const natural = naturalLanding(sections[index]);
  return { natural, landing: natural < (anchors[index + 1] ?? Infinity) ? natural : anchors[index] };
};

const navigationType = () =>
  (performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined)?.type;

export default navigationType;

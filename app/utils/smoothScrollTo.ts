const smoothScrollTo = (top: number) => {
  if (window.__lenis) window.__lenis.scrollTo(top);
  else window.scrollTo({ top, behavior: "smooth" });
};

export default smoothScrollTo;

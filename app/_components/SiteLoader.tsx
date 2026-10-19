import { FLOWER_PATH, SPARKLE_PATH } from "./markPaths";

const SiteLoader = () => (
  <div className="site-loader">
    <svg
      className="site-loader-mark text-foreground/80"
      viewBox="0 0 161.045 161.045"
      fill="currentColor"
      aria-hidden="true"
    >
      <svg width="74.75" height="74.75" viewBox="0 0 16 16">
        <mask id="site-loader-logo">
          <rect width="16" height="16" fill="#fff" />
          <path className="site-loader-hole" d={SPARKLE_PATH} fill="#000" />
        </mask>
        <circle cx="8" cy="8" r="8" mask="url(#site-loader-logo)" />
      </svg>
      <svg x="86.295" width="74.75" height="74.75" viewBox="0 0 24 24">
        <path className="site-loader-funnel" d="M6 12L0 0H24L18 12L24 24H0L6 12Z" />
      </svg>
      <svg y="86.295" width="74.75" height="74.75" viewBox="0 0 24 24">
        <mask id="site-loader-stairs">
          <rect width="24" height="24" fill="#fff" />
          <path d="M9 -1H25V15H16.5V7.5H9V-1Z" fill="#000" />
          <rect className="site-loader-cover" x="-1" y="-1" width="26" height="26" fill="#fff" />
        </mask>
        <rect width="24" height="24" mask="url(#site-loader-stairs)" />
      </svg>
      <svg x="86.295" y="86.295" width="74.75" height="74.75" viewBox="0 0 24 24" overflow="visible">
        <path className="site-loader-flower" d={FLOWER_PATH} />
      </svg>
    </svg>
  </div>
);

export default SiteLoader;

const ScrollCue = () => {
  return (
    <div
      aria-hidden
      className="scroll-cue-wrap w-full h-8 flex items-center justify-center text-foreground/55 transition-opacity duration-500"
    >
      <div className="hero-rise hero-rise-4">
        <svg
          className="scroll-cue w-[26px] h-[14px]"
          viewBox="0 0 30 16"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.4}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 4l11 9 11-9" />
        </svg>
      </div>
    </div>
  );
};

export default ScrollCue;

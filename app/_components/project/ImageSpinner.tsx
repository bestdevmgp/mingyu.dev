import { SPARKLE_PATH } from "../markPaths";

const ImageSpinner = ({ label }: { label: string }) => (
  <div className="image-spinner-wrap absolute inset-0 flex items-center justify-center pointer-events-none">
    <svg
      className="image-spinner w-[35px] h-[35px] text-white"
      viewBox="0 0 16 16"
      fill="currentColor"
      role="status"
      aria-label={label}
    >
      <path d={SPARKLE_PATH} />
    </svg>
  </div>
);

export default ImageSpinner;

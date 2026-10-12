import SpinnerMark from "@/_components/SpinnerMark";

const ImageSpinner = ({ label }: { label: string }) => (
  <div className="image-spinner-wrap absolute inset-0 flex items-center justify-center pointer-events-none">
    <SpinnerMark className="image-spinner w-[35px] h-[35px] text-white" label={label} />
  </div>
);

export default ImageSpinner;

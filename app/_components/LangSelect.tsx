import { Globe } from "react-feather";

const LangSelect = () => {
  return (
    <div className="flex items-center gap-1">
      <Globe className="w-4 h-4 text-foreground opacity-45" strokeWidth={1.5} />
      <select className="text-xs font-semibold bg-transparent">
        <option>한국어</option>
        <option>영어</option>
      </select>
    </div>
  );
};

export default LangSelect;

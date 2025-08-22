import { Moon } from "react-feather";

import Switch from "./Switch";

const DarkModeSwitch = () => {
  return (
    <div className="flex items-center gap-1.5">
      <Moon className="w-4 h-4 text-black opacity-45" strokeWidth={1.5} />
      <Switch />
    </div>
  );
};

export default DarkModeSwitch;

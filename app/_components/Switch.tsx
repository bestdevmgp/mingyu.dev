"use client";

import { useState } from "react";

import cn from "classnames";

interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Switch = ({ onChange, defaultChecked }: SwitchProps) => {
  const [checked, setChecked] = useState(defaultChecked ?? false);

  return (
    <label className="relative inline-block align-middle">
      <input
        type="checkbox"
        className="border-0 w-[1px] h-[1px] m-[-1px] p-0 overflow-hidden absolute opacity-0"
        defaultChecked={defaultChecked}
        onChange={e => {
          onChange?.(e);
          setChecked(e.target.checked);
        }}
      />
      <span className={cn("inline-flex w-10 h-6 items-center rounded-full", checked ? "bg-blue" : "bg-gray-300")}>
        <div
          className={cn(
            "w-4 h-4 rounded-[50%] bg-white transition-transform",
            checked ? "translate-x-5" : "translate-x-1",
          )}
        />
      </span>
    </label>
  );
};

export default Switch;

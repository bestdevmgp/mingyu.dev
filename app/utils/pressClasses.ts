import cn from "classnames";

export const subtleBoxClasses = (pressed: boolean) =>
  cn(
    "isolate focus-visible:outline-none",
    "before:absolute before:-z-10 before:duration-200 before:ease-button focus-visible:before:outline-solid focus-visible:before:-outline-offset-1",
    pressed
      ? "before:bg-neutral-subtle-pressed"
      : "hover:before:bg-neutral-subtle-hovered mouse:active:before:bg-neutral-subtle-pressed",
  );

export const subtleFillClasses = (pressed: boolean) =>
  pressed ? "bg-neutral-subtle-pressed" : "hover:bg-neutral-subtle-hovered mouse:active:bg-neutral-subtle-pressed";

export const neutralFillClasses = (pressed: boolean) =>
  pressed ? "bg-neutral-pressed" : "bg-neutral hover:bg-neutral-hovered mouse:active:bg-neutral-pressed";

import { FC, PropsWithChildren } from "react";

interface SectionWatcherProps extends Omit<PropsWithChildren, "id"> {
  id: string;
}

const SectionWatcher: FC<SectionWatcherProps> = ({ id, children, ...props }) => (
  <section id={id} {...props}>
    {children}
  </section>
);

export default SectionWatcher;

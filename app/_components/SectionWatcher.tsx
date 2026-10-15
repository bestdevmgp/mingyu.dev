import { FC, PropsWithChildren } from "react";

interface SectionWatcherProps extends Omit<PropsWithChildren, "id"> {
  id: string;
}

const SectionWatcher: FC<SectionWatcherProps> = ({ id, children }) => <section id={id}>{children}</section>;

export default SectionWatcher;

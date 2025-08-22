export interface Project {
  title: string;
  subTitle: string;
  info: {
    period: string;
    member: string;
    skills: string[];
  };
  description: {
    title: string;
    items?: string[];
  }[];
  links?: {
    label: string;
    href: string;
  }[];
}

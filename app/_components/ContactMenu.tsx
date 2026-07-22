"use client";

import { useRef, useState } from "react";

import cn from "classnames";
import { AnimatePresence, motion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";

import { phoneDisplay, phoneHref } from "@/utils/phone";
import useOnClickOutside from "@/utils/useOnClickOutside";

type SvgProps = React.SVGProps<SVGSVGElement>;

const MailIcon = (props: SvgProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const PhoneIcon = (props: SvgProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const GitHubIcon = (props: SvgProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);

const LinkedInIcon = (props: SvgProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
  </svg>
);

interface ContactItem {
  id: string;
  label: string;
  value: string;
  href: string;
  external?: boolean;
  Icon: (props: SvgProps) => React.ReactElement;
}

const CONTACTS: ContactItem[] = [
  { id: "email", label: "Email", value: "me@mingyu.dev", href: "mailto:me@mingyu.dev", Icon: MailIcon },
  { id: "phone", label: "Phone", value: "010-3672-3858", href: "tel:01036723858", Icon: PhoneIcon },
  {
    id: "github",
    label: "GitHub",
    value: "github.com/bestdevmgp",
    href: "https://github.com/bestdevmgp",
    external: true,
    Icon: GitHubIcon,
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    value: "linkedin.com/in/min-gyu",
    href: "https://linkedin.com/in/min-gyu",
    external: true,
    Icon: LinkedInIcon,
  },
];

const ContactTriggerIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="10" r="4" />
    <path d="M18 20a6 6 0 0 0-12 0" />
  </svg>
);

const ContactRow = ({ contact, onClick }: { contact: ContactItem; onClick?: () => void }) => {
  const { label, value, href, external, Icon } = contact;
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      onClick={onClick}
      className="flex items-center gap-2.5 px-2.5 py-[7px] rounded-lg no-underline transition-colors hover:bg-foreground/5"
    >
      <Icon className="w-[18px] h-[18px] shrink-0 text-foreground/60" />
      <span className="flex flex-col min-w-0">
        <span className="text-[13px] font-medium leading-tight text-foreground">{label}</span>
        <span className="text-[11px] leading-tight text-foreground/50 truncate">{value}</span>
      </span>
    </a>
  );
};

interface ContactMenuProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "dropdown" | "inline";
}

const ContactMenu = ({ variant = "dropdown", className, ...props }: ContactMenuProps) => {
  const t = useTranslations("Header");
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOnClickOutside(ref, () => setIsOpen(false));

  const contacts = CONTACTS.map(contact =>
    contact.id === "phone" ? { ...contact, value: phoneDisplay(locale), href: phoneHref(locale) } : contact,
  );

  if (variant === "inline") {
    return (
      <div className={cn("flex items-center gap-2", className)} {...props}>
        <ContactTriggerIcon className="w-[18px] h-[18px] text-foreground/55 shrink-0" />
        <div className="flex items-center gap-0.5" role="group" aria-label={t("contact")}>
          {contacts.map(({ id, label, href, external }) => (
            <a
              key={id}
              href={href}
              target={external ? "_blank" : undefined}
              rel={external ? "noopener noreferrer" : undefined}
              className="px-1.5 py-1 rounded-md text-sm font-normal whitespace-nowrap no-underline
                text-foreground/55 hover:text-foreground transition-colors"
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative", className)} ref={ref} {...props}>
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        aria-label={t("contact")}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className={cn(
          "flex items-center transition-colors",
          isOpen ? "text-foreground" : "text-foreground/55 hover:text-foreground",
        )}
      >
        <ContactTriggerIcon className="w-[19px] h-[19px]" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            transition={{ type: "spring", bounce: 0, duration: 0.2 }}
            style={{ transformOrigin: "top right" }}
            className="absolute right-[-2px] top-full mt-2 w-[190px] p-1 rounded-xl flex flex-col
              bg-background border border-foreground/10 shadow-lg shadow-black/5 z-50"
          >
            {contacts.map(contact => (
              <ContactRow key={contact.id} contact={contact} onClick={() => setIsOpen(false)} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ContactMenu;

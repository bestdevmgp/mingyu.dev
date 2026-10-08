import cn from "classnames";
import Link from "next/link";

interface CTAContentProps {
  label: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

type CTALinkProps = CTAContentProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "prefix" | "href"> & {
    link: string;
    newTab?: boolean;
  };

type CTAButtonOnlyProps = CTAContentProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "prefix"> & {
    link?: undefined;
  };

type CTAButtonProps = CTALinkProps | CTAButtonOnlyProps;

const ctaClassName = (prefix: React.ReactNode, suffix: React.ReactNode, className?: string) =>
  cn(
    "py-2 min-w-36 bg-foreground/5 rounded-lg flex justify-center items-center gap-2 hover:bg-foreground/10 transition-colors",
    prefix ? "pl-[19px]" : "pl-5",
    suffix ? "pr-[19px]" : "pr-5",
    className,
  );

const CTAContent = ({ label, prefix, suffix }: CTAContentProps) => (
  <>
    {prefix && <span className="text-foreground opacity-60">{prefix}</span>}
    <span className="text-foreground/65 font-semibold text-base md:text-sm tracking-tight">{label}</span>
    {suffix && <span className="text-foreground opacity-60">{suffix}</span>}
  </>
);

const CTAButton = (props: CTAButtonProps) => {
  if (props.link !== undefined) {
    const { label, prefix, suffix, link, newTab = true, className, ...anchorProps } = props;
    const anchorClassName = cn(ctaClassName(prefix, suffix, className), "w-fit no-underline");
    const content = <CTAContent label={label} prefix={prefix} suffix={suffix} />;

    return newTab ? (
      <Link href={link} target="_blank" className={anchorClassName} {...anchorProps}>
        {content}
      </Link>
    ) : (
      <a href={link} className={anchorClassName} {...anchorProps}>
        {content}
      </a>
    );
  }

  const { label, prefix, suffix, className, ...buttonProps } = props;

  return (
    <button className={ctaClassName(prefix, suffix, className)} {...buttonProps}>
      <CTAContent label={label} prefix={prefix} suffix={suffix} />
    </button>
  );
};

export default CTAButton;

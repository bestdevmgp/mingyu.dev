import cn from "classnames";
import Link from "next/link";

interface CTAButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "prefix"> {
  label: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  link?: string;
}

const CTAButton = ({ label, prefix, suffix, link, className, ...props }: CTAButtonProps) => {
  const renderButton = () => (
    <button
      className={cn(
        "py-2 min-w-36 bg-foreground/5 rounded-lg flex justify-center items-center gap-2 hover:bg-foreground/10 transition-colors",
        prefix ? "pl-[19px]" : "pl-5",
        suffix ? "pr-[19px]" : "pr-5",
        className,
      )}
      {...props}
    >
      {prefix && <span className="text-foreground opacity-60">{prefix}</span>}
      <p className="text-foreground/65 font-semibold text-base md:text-sm tracking-tight">{label}</p>
      {suffix && <span className="text-foreground opacity-60">{suffix}</span>}
    </button>
  );

  return link ? (
    <Link href={link} target="_blank" className="no-underline">
      {renderButton()}
    </Link>
  ) : (
    renderButton()
  );
};

export default CTAButton;

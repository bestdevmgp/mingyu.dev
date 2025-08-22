import cn from "classnames";
import Link from "next/link";

interface CTAButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  suffix?: React.ReactNode;
  link?: string;
}

const CTAButton = ({ label, suffix, link, className, ...props }: CTAButtonProps) => {
  const renderButton = () => (
    <button
      className={cn(
        "px-7 py-2 min-w-40 bg-foreground/5 rounded-lg flex justify-center items-center gap-2 hover:bg-foreground/10 transition-colors",
        className,
      )}
      {...props}
    >
      {suffix && <span className="text-foreground opacity-60">{suffix}</span>}
      <p className="text-foreground/65 font-semibold text-base md:text-sm tracking-tight">{label}</p>
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

import { cn } from "@/lib/utils";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  container?: boolean;
  spacing?: "sm" | "md" | "lg" | "none";
}

const spacingMap = {
  sm: "py-8 md:py-12",
  md: "py-16 md:py-24",
  lg: "py-24 md:py-32",
  none: "py-0",
};

export function Section({
  children,
  className,
  container = true,
  spacing = "md",
  ...props
}: SectionProps) {
  return (
    <section 
      className={cn(spacingMap[spacing], className)} 
      {...props}
    >
      {container ? (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      ) : (
        children
      )}
    </section>
  );
}

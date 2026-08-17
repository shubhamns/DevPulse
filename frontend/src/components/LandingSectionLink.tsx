import type { MouseEvent, ReactNode } from "react";
import { scrollToLandingSection } from "@/lib/landing";

type LandingSectionLinkProps = {
  href: string;
  className?: string;
  children: ReactNode;
};

export function LandingSectionLink({ href, className, children }: LandingSectionLinkProps) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    scrollToLandingSection(href);
  }

  return (
    <a href={href} className={className} onClick={handleClick}>
      {children}
    </a>
  );
}

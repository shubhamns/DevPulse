import type { MouseEvent, ReactNode } from "react";

type LandingSectionLinkProps = {
  href: string;
  className?: string;
  children: ReactNode;
};

export function scrollToLandingSection(sectionId: string): void {
  const target = document.getElementById(sectionId.replace(/^#/, ""));

  if (!target) {
    return;
  }

  target.scrollIntoView({ behavior: "smooth", block: "start" });
}

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

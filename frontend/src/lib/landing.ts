export function scrollToLandingSection(sectionId: string): void {
  const target = document.getElementById(sectionId.replace(/^#/, ""));

  if (!target) {
    return;
  }

  target.scrollIntoView({ behavior: "smooth", block: "start" });
}

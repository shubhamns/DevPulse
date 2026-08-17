type IssueBodyInput = {
  issueId: string;
  title: string;
  errorName: string;
  errorMessage: string;
  stackTrace: string;
  occurrenceCount: number;
  affectedUserCount: number;
  environment: string;
  release: string;
  url: string;
  devpulseIssueUrl: string;
  analysis?: {
    rootCause: string;
    explanation: string;
    suggestedFix: string;
    confidence: number;
    testSuggestions: string[];
  } | null;
};

export function buildGitHubIssueBody(input: IssueBodyInput): string {
  const sections = [
    "## Summary",
    input.title,
    "",
    "## Error details",
    `- **Message:** ${input.errorMessage || input.title}`,
    `- **Type:** ${input.errorName || "Unknown"}`,
    `- **Occurrences:** ${input.occurrenceCount}`,
    `- **Affected users:** ${input.affectedUserCount}`,
    `- **Environment:** ${input.environment}`,
    `- **Release:** ${input.release || "Unknown"}`,
    `- **URL:** ${input.url || "N/A"}`,
  ];

  if (input.stackTrace) {
    sections.push("", "## Stack trace", "```", input.stackTrace, "```");
  }

  if (input.analysis) {
    sections.push(
      "",
      "## AI analysis",
      "_Recommendation from DevPulse AI — verify before applying._",
      "",
      "### Root cause",
      input.analysis.rootCause,
      "",
      "### Why it happened",
      input.analysis.explanation,
      "",
      "### Suggested fix",
      input.analysis.suggestedFix,
      "",
      `**Confidence:** ${input.analysis.confidence}%`,
    );

    if (input.analysis.testSuggestions.length > 0) {
      sections.push(
        "",
        "### Test suggestions",
        ...input.analysis.testSuggestions.map((suggestion) => `- ${suggestion}`),
      );
    }
  }

  sections.push("", "## DevPulse", `View in DevPulse: ${input.devpulseIssueUrl}`);

  return sections.join("\n");
}

export function buildGitHubIssueTitle(title: string, environment: string): string {
  const prefix = environment ? `[${environment}] ` : "";
  const normalized = title.trim() || "Production error";
  const maxLength = 120 - prefix.length;

  if (normalized.length <= maxLength) {
    return `${prefix}${normalized}`;
  }

  return `${prefix}${normalized.slice(0, maxLength - 3)}...`;
}

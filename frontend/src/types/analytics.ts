export type AnalyticsOverview = {
  cards: {
    totalIssues: number;
    criticalIssues: number;
    errorsToday: number;
    errorRate: number;
    affectedUsers: number;
    newIssues: number;
  };
  charts: {
    errorsOverTime: Array<{ date: string; count: number }>;
    issuesBySeverity: Array<{ severity: string; count: number }>;
    topFingerprints: Array<{ fingerprint: string; title: string; count: number }>;
    errorsByProject: Array<{ projectId: string; projectName: string; count: number }>;
    errorsByEnvironment: Array<{ environment: string; count: number }>;
  };
};

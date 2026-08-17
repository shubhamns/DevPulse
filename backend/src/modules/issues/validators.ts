import { z } from "zod";
import { issueSeverities, issueStatuses } from "../../models/Issue.js";

export const updateIssueSchema = z
  .object({
    status: z.enum(issueStatuses).optional(),
    severity: z.enum(issueSeverities).optional(),
  })
  .refine((value) => value.status !== undefined || value.severity !== undefined, {
    message: "At least one field is required",
  });

export type UpdateIssueInput = z.infer<typeof updateIssueSchema>;

export const issueListQuerySchema = z.object({
  projectId: z.string().optional(),
  severity: z.enum(issueSeverities).optional(),
  environment: z.string().optional(),
  status: z.enum(issueStatuses).optional(),
  search: z.string().optional(),
  fromDate: z.string().datetime().optional(),
  toDate: z.string().datetime().optional(),
});

export type IssueListQuery = z.infer<typeof issueListQuerySchema>;

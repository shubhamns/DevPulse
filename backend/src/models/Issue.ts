import { Schema, model, type InferSchemaType } from "mongoose";

export const issueStatuses = ["open", "resolved", "ignored"] as const;
export type IssueStatus = (typeof issueStatuses)[number];

export const issueSeverities = ["low", "medium", "high", "critical"] as const;
export type IssueSeverity = (typeof issueSeverities)[number];

const issueSchema = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    fingerprint: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: 4000,
    },
    severity: {
      type: String,
      enum: issueSeverities,
      default: "medium",
      index: true,
    },
    status: {
      type: String,
      enum: issueStatuses,
      default: "open",
      index: true,
    },
    occurrenceCount: {
      type: Number,
      default: 1,
      min: 1,
    },
    affectedUserCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    affectedUserIds: {
      type: [String],
      default: [],
    },
    environment: {
      type: String,
      required: true,
      maxlength: 64,
      index: true,
    },
    release: {
      type: String,
      default: "",
      maxlength: 64,
    },
    errorName: { type: String, maxlength: 256 },
    errorMessage: { type: String, maxlength: 4000 },
    stackTrace: { type: String, maxlength: 20000 },
    url: { type: String, maxlength: 2048 },
    githubIssueUrl: { type: String, default: "", maxlength: 2048 },
    githubIssueNumber: { type: Number, default: null, min: 1 },
    firstSeen: { type: Date, required: true, index: true },
    lastSeen: { type: Date, required: true, index: true },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

issueSchema.index({ projectId: 1, fingerprint: 1 }, { unique: true });
issueSchema.index({ organizationId: 1, status: 1, lastSeen: -1 });

export type IssueDocument = InferSchemaType<typeof issueSchema> & {
  _id: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const Issue = model("Issue", issueSchema);

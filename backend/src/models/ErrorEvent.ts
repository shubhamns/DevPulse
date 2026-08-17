import { Schema, model, type InferSchemaType } from "mongoose";

export const eventTypes = ["exception", "message", "test"] as const;
export type EventType = (typeof eventTypes)[number];

const breadcrumbSchema = new Schema(
  {
    timestamp: { type: String, required: true },
    category: { type: String, required: true },
    message: { type: String, required: true },
    level: {
      type: String,
      enum: ["debug", "info", "warning", "error"],
      required: true,
    },
    data: { type: Schema.Types.Mixed },
  },
  { _id: false },
);

const errorEventSchema = new Schema(
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
    apiKeyId: {
      type: Schema.Types.ObjectId,
      ref: "ApiKey",
      required: true,
      index: true,
    },
    issueId: {
      type: Schema.Types.ObjectId,
      ref: "Issue",
      index: true,
      default: null,
    },
    fingerprint: {
      type: String,
      index: true,
      default: null,
    },
    type: {
      type: String,
      enum: eventTypes,
      required: true,
      index: true,
    },
    message: {
      type: String,
      required: true,
      maxlength: 4000,
    },
    level: {
      type: String,
      default: "error",
      maxlength: 32,
    },
    errorName: { type: String, maxlength: 256 },
    errorMessage: { type: String, maxlength: 4000 },
    stackTrace: { type: String, maxlength: 20000 },
    environment: { type: String, required: true, maxlength: 64 },
    release: { type: String, default: "", maxlength: 64 },
    url: { type: String, maxlength: 2048 },
    browser: { type: String, maxlength: 120 },
    os: { type: String, maxlength: 120 },
    user: { type: Schema.Types.Mixed },
    context: { type: Schema.Types.Mixed },
    breadcrumbs: { type: [breadcrumbSchema], default: [] },
    sdkName: { type: String, required: true, maxlength: 120 },
    sdkVersion: { type: String, required: true, maxlength: 64 },
    clientTimestamp: { type: Date, required: true, index: true },
    receivedAt: { type: Date, required: true, default: Date.now, index: true },
  },
  {
    timestamps: false,
    versionKey: false,
  },
);

errorEventSchema.index({ projectId: 1, receivedAt: -1 });

export type ErrorEventDocument = InferSchemaType<typeof errorEventSchema> & {
  _id: Schema.Types.ObjectId;
};

export const ErrorEvent = model("ErrorEvent", errorEventSchema);

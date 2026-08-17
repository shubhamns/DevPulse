import { Schema, model, type InferSchemaType } from "mongoose";
import { issueSeverities } from "./Issue.js";

const aiAnalysisSchema = new Schema(
  {
    issueId: {
      type: Schema.Types.ObjectId,
      ref: "Issue",
      required: true,
      unique: true,
      index: true,
    },
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
    summary: { type: String, required: true, maxlength: 4000 },
    rootCause: { type: String, required: true, maxlength: 8000 },
    severity: { type: String, enum: issueSeverities, required: true },
    explanation: { type: String, required: true, maxlength: 12000 },
    suggestedFix: { type: String, required: true, maxlength: 12000 },
    confidence: { type: Number, required: true, min: 0, max: 100 },
    testSuggestions: { type: [String], default: [] },
    model: { type: String, required: true, maxlength: 120 },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export type AiAnalysisDocument = InferSchemaType<typeof aiAnalysisSchema> & {
  _id: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const AiAnalysis = model("AiAnalysis", aiAnalysisSchema);

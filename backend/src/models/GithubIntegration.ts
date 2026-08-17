import { Schema, model, type InferSchemaType } from "mongoose";

const githubIntegrationSchema = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      unique: true,
      index: true,
    },
    connectedByUserId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    githubUserId: { type: Number, required: true },
    githubLogin: { type: String, required: true, trim: true, maxlength: 120 },
    githubAvatarUrl: { type: String, default: "", maxlength: 2048 },
    accessTokenEncrypted: { type: String, required: true },
    selectedOwner: { type: String, default: "", trim: true, maxlength: 120 },
    selectedRepo: { type: String, default: "", trim: true, maxlength: 120 },
    scopes: { type: [String], default: [] },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export type GithubIntegrationDocument = InferSchemaType<typeof githubIntegrationSchema> & {
  _id: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const GithubIntegration = model("GithubIntegration", githubIntegrationSchema);

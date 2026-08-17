import { Schema, model, type InferSchemaType } from "mongoose";

const apiKeySchema = new Schema(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    keyHash: {
      type: String,
      required: true,
      unique: true,
    },
    keyPrefix: {
      type: String,
      required: true,
      trim: true,
    },
    lastFour: {
      type: String,
      required: true,
      trim: true,
      maxlength: 4,
    },
    label: {
      type: String,
      trim: true,
      default: "Default",
      maxlength: 120,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    revokedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

apiKeySchema.index({ projectId: 1, revokedAt: 1 });

export type ApiKeyDocument = InferSchemaType<typeof apiKeySchema> & {
  _id: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const ApiKey = model("ApiKey", apiKeySchema);

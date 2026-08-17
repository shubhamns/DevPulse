import { Schema, model, type InferSchemaType } from "mongoose";

const projectSchema = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    environment: {
      type: String,
      required: true,
      trim: true,
      default: "production",
      maxlength: 64,
    },
    release: {
      type: String,
      trim: true,
      default: "",
      maxlength: 64,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

projectSchema.index({ organizationId: 1, slug: 1 }, { unique: true });

export type ProjectDocument = InferSchemaType<typeof projectSchema> & {
  _id: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const Project = model("Project", projectSchema);

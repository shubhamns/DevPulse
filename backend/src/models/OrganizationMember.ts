import { Schema, model, type InferSchemaType } from "mongoose";

export const organizationRoles = ["owner", "admin", "member"] as const;
export type OrganizationRole = (typeof organizationRoles)[number];

const organizationMemberSchema = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: organizationRoles,
      required: true,
      default: "member",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

organizationMemberSchema.index({ organizationId: 1, userId: 1 }, { unique: true });

export type OrganizationMemberDocument = InferSchemaType<
  typeof organizationMemberSchema
> & {
  _id: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export const OrganizationMember = model(
  "OrganizationMember",
  organizationMemberSchema,
);

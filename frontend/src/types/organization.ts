export type Organization = {
  id: string;
  name: string;
  slug: string;
  role: "owner" | "admin" | "member";
  createdAt: string;
  updatedAt: string;
};

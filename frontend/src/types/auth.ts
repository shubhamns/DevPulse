export type User = {
  id: string;
  email: string;
  name: string;
};

export type OrganizationSummary = {
  id: string;
  name: string;
  slug: string;
  role: "owner" | "admin" | "member";
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: User;
};

export type MeResponse = {
  user: User;
  organizations: OrganizationSummary[];
};

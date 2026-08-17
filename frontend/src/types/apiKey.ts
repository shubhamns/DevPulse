export type ApiKey = {
  id: string;
  projectId: string;
  organizationId: string;
  label: string;
  keyPrefix: string;
  lastFour: string;
  maskedKey: string;
  revokedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ApiKeyWithSecret = ApiKey & {
  key: string;
};

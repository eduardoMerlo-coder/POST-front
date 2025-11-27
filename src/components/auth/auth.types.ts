export const RoleType = {
  ADMIN: "admin",
};

export type RoleType = (typeof RoleType)[keyof typeof RoleType];

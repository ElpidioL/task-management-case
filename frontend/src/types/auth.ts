export type User = {
  id: string;
  email: string;
  is_staff: boolean;
};

export type AuthMode = "login" | "register";

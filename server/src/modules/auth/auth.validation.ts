import { z } from "zod";

import { ROLE_OPTIONS } from "@vistaflow/shared";

const passwordSchema = z
  .string()
  .min(8)
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
    "Password must contain uppercase, lowercase, and a number",
  );

export const registerSchema = {
  body: z.object({
    name: z.string().min(2).max(60),
    email: z.email(),
    password: passwordSchema,
    role: z.enum(ROLE_OPTIONS),
  }),
};

export const loginSchema = {
  body: z.object({
    email: z.email(),
    password: z.string().min(1),
  }),
};

import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Zadej platnou e-mailovou adresu."),
  password: z.string().min(8, "Heslo musí mít alespoň 8 znaků."),
});

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Uživatelské jméno musí mít alespoň 3 znaky.")
    .max(20, "Uživatelské jméno může mít max. 20 znaků.")
    .regex(/^[a-zA-Z0-9_]+$/, "Povoleny jsou pouze písmena, čísla a podtržítko."),
  email: z.string().email("Zadej platnou e-mailovou adresu."),
  password: z.string().min(8, "Heslo musí mít alespoň 8 znaků."),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

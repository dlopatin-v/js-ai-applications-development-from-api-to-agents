import { z } from "zod";

export const addressSchema = z.object({
  country: z.string(),
  city: z.string(),
  street: z.string(),
  flat_house: z.string(),
});

export type Address = z.infer<typeof addressSchema>;

export const creditCardSchema = z.object({
  num: z.string(),
  cvv: z.string(),
  exp_date: z.string(),
});

export type CreditCard = z.infer<typeof creditCardSchema>;

export const userCreateSchema = z.object({
  name: z.string().describe("First name"),
  surname: z.string().describe("Last name"),
  email: z.string().email().describe("Email address"),
  about_me: z.string().optional().describe("Biography"),
  phone: z.string().optional().describe("Phone number"),
  date_of_birth: z.string().optional().describe("Date of birth (YYYY-MM-DD)"),
  address: addressSchema.optional().describe("Address"),
  gender: z.string().optional().describe("Gender"),
  company: z.string().optional().describe("Company name"),
  salary: z.number().optional().describe("Salary"),
  credit_card: creditCardSchema.optional().describe("Credit card"),
});

export type UserCreate = z.infer<typeof userCreateSchema>;

export const userUpdateSchema = userCreateSchema.extend({
  name: z.string().optional().describe("First name"),
  surname: z.string().optional().describe("Last name"),
  email: z.string().email().optional().describe("Email address"),
  about_me: z.string().optional().describe("Biography"),
});

export type UserUpdate = z.infer<typeof userUpdateSchema>;

export const userSearchSchema = z.object({
  name: z.string().optional().describe("First name (partial match)"),
  surname: z.string().optional().describe("Last name (partial match)"),
  email: z.string().optional().describe("Email (partial match)"),
  gender: z.string().optional().describe("Gender (male, female, other, prefer_not_to_say)"),
});

export type UserSearchRequest = z.infer<typeof userSearchSchema>;

export type UserInfo = UserCreate & { id: number };

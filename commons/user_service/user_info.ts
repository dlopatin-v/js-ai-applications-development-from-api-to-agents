export type Address = {
  country: string;
  city: string
  street: string;
  flat_house: string;
}

export type CreditCard = {
  num: string;
  cvv: string;
  exp_date: string;
}

export type UserCreate = {
  name: string;
  surname: string;
  email: string;
  about_me?: string;
  phone?: string;
  date_of_birth?: string;
  address?: Address;
  gender?: string;
  company?: string;
  salary?: number;
  credit_card?: CreditCard;
}

export type UserUpdate = UserCreate & {
  name?: string;
  surname?: string;
  email?: string;
  about_me?: string;
}

export type UserSearchRequest = Pick<UserUpdate, "name" | "surname" | "email" | "gender">;
import { FirebaseOptions } from "firebase/app";

export type Credentials = {
  emailAddress: string;
  password: string;
};

export type Data = {
  users: User[];
  total: number;
};

export type User = {
  [key: string]: string | number;
};

export interface IRankingBuilder {
  disableLog?: boolean;
  path: string;
  credentials?: Credentials;
}

export type SortBy = { value: string; type: "ASC" | "DESC" };

export interface IRankingBuilderConfig extends FirebaseOptions {}

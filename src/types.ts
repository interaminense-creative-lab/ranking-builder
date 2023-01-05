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
  createDate: number;
  id: string;
  name: string;
  score: number;
  time: string;
};

export interface IRankingBuilder {
  disableLog?: boolean;
  path: string;
  credentials?: Credentials;
}

export interface IRankingBuilderConfig extends FirebaseOptions {}

import { v4 as uuidv4, validate as uuidValidate } from "uuid";
import { FirebaseApp, FirebaseOptions, initializeApp } from "firebase/app";
import {
  Auth,
  getAuth,
  signInWithEmailAndPassword,
  signOut as signOutFirebase,
} from "firebase/auth";
import {
  child,
  Database,
  get,
  getDatabase,
  limitToLast,
  orderByChild,
  query,
  ref,
  remove,
  set,
  onValue,
} from "firebase/database";

export interface IRawUser {
  name: string;
  score: number;
  time: string;
}

export interface IUser {
  createDate: number;
  id: string;
  name: string;
  score: number;
  time: string;
}

export interface IRankingBuilder {
  disableLog?: boolean;
  emailAddress: string;
  password: string;
}

export interface IFirebaseConfig extends FirebaseOptions {}

export class RankingBuilder {
  app: FirebaseApp;
  auth: Auth;
  authenticated: boolean;
  database: Database;
  disableLog: boolean;

  constructor(
    { disableLog = false, emailAddress, password }: IRankingBuilder,
    config: IFirebaseConfig
  ) {
    this.app = initializeApp(config);
    this.auth = getAuth(this.app);
    this.database = getDatabase(this.app);
    this.authenticated = false;
    this.disableLog = disableLog;

    this.signIn(emailAddress, password);
  }

  async signIn(emailAddress: string, password: string) {
    try {
      await signInWithEmailAndPassword(this.auth, emailAddress, password);

      this.authenticated = true;
      this._log("user is authenticated.");
    } catch (error) {
      this.authenticated = false;
      this._log("user is not authenticated.");
    }
  }

  async signOut() {
    try {
      await signOutFirebase(this.auth);

      this._log("user is not authenticated anymore.");
      this.authenticated = false;
    } catch (error) {
      this._log("an error occured and the user is still authenticated.");
    }
  }

  private _isValidUserId(userId: string) {
    if (!uuidValidate(userId)) {
      this._log("userId is not valid.");

      return false;
    }

    return true;
  }

  private _isAuth() {
    if (!this.authenticated) {
      this._log("please, authenticate user.");
    }

    return this.authenticated;
  }

  async createUser(user: IRawUser) {
    if (!this._isAuth()) return;

    try {
      const userId = uuidv4();
      const createDate = Date.now();

      await set(ref(this.database, `users/${userId}`), {
        ...user,
        createDate,
        id: userId,
      });

      this._log("user created.", userId);

      return { ok: true };
    } catch (error) {
      if (!this._isAuth()) {
        this._log("an error occurred while creating the user.");
      }

      return null;
    }
  }

  async updateUser(userId: string, user: IUser) {
    if (!this._isAuth() || !this._isValidUserId(userId)) return;

    try {
      await set(ref(this.database, `users/${userId}`), user);

      this._log("user updated.", userId);

      return { ok: true };
    } catch (error) {
      if (!this._isAuth()) {
        this._log("an error occurred while updating the user.");
      }

      return null;
    }
  }

  async deleteUser(userId: string) {
    if (!this._isAuth() || !this._isValidUserId(userId)) return null;

    try {
      await remove(ref(this.database, `users/${userId}`));

      this._log("user deleted.", userId);

      return { ok: true };
    } catch (error) {
      if (!this._isAuth()) {
        this._log("an error occurred while updating the user.");
      }

      return null;
    }
  }

  async getUser(userId: string) {
    if (!this._isAuth() || !this._isValidUserId(userId)) return null;

    const snapshot = await get(child(ref(this.database), `users/${userId}`));

    if (snapshot.exists()) {
      const user: IUser = snapshot.val();

      this._log(user);

      return user;
    } else {
      if (!this._isAuth()) {
        this._log("an error occurred while getting user.");
      }

      return null;
    }
  }

  async listUsers(callback: (users: IUser[]) => void, top = 20) {
    try {
      const result = query(
        ref(this.database, "users"),
        orderByChild("score"),
        limitToLast(top)
      );

      return onValue(result, (snapshot) => {
        callback(
          Object.values(snapshot.val()).sort(
            (a: any, b: any) => b.score - a.score
          ) as IUser[]
        );
      });
    } catch (error) {
      if (!this._isAuth()) {
        this._log("an error occurred while listing users.");
      }

      return null;
    }
  }

  private _log(...params: any) {
    if (this.disableLog) {
      return;
    }

    console.log(`[Ranking Builder]`, ...params);
  }
}

import { v4 as uuidv4, validate as uuidValidate } from "uuid";
import { FirebaseApp, initializeApp } from "firebase/app";
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
  ref,
  remove,
  set,
} from "firebase/database";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGIN_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

interface IUser {
  name: string;
  score: number;
  time: string;
  ranking: number;
}

class RankingManager {
  app: FirebaseApp;
  auth: Auth;
  authenticated: boolean;
  database: Database;

  constructor(emailAddress: string, password: string) {
    this.app = initializeApp(firebaseConfig);
    this.auth = getAuth(this.app);
    this.database = getDatabase(this.app);
    this.authenticated = false;

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

  private isValidUserId(userId: string) {
    if (!uuidValidate(userId)) {
      this._log("userId is not valid.");

      return false;
    }

    return true;
  }

  private isAuth() {
    if (!this.authenticated) {
      this._log("please, authenticate user.");
    }

    return this.authenticated;
  }

  async createUser(user: IUser) {
    if (!this.isAuth()) return;

    try {
      const userId = uuidv4();

      await set(ref(this.database, `users/${userId}`), user);

      this._log("user created.", userId);
    } catch (error) {
      if (!this.isAuth()) {
        this._log("an error occurred while creating the user.");
      }
    }
  }

  async updateUser(userId: string, user: IUser) {
    if (!this.isAuth() || !this.isValidUserId(userId)) return;

    try {
      await set(ref(this.database, `users/${userId}`), user);

      this._log("user updated.", userId);
    } catch (error) {
      if (!this.isAuth()) {
        this._log("an error occurred while updating the user.");
      }
    }
  }

  async deleteUser(userId: string) {
    if (!this.isAuth() || !this.isValidUserId(userId)) return;

    try {
      await remove(ref(this.database, `users/${userId}`));

      this._log("user deleted.", userId);
    } catch (error) {
      if (!this.isAuth()) {
        this._log("an error occurred while updating the user.");
      }
    }
  }

  async getUser(userId: string) {
    if (!this.isAuth() || !this.isValidUserId(userId)) return;

    const snapshot = await get(child(ref(this.database), `users/${userId}`));

    if (snapshot.exists()) {
      this._log(snapshot.val());
    } else {
      if (!this.isAuth()) {
        this._log("an error occurred while getting user.");
      }
    }
  }

  async listUsers() {
    try {
      const snapshot = await get(child(ref(this.database), `users/`));

      if (snapshot.exists()) {
        this._log(snapshot.val());
      } else {
        this._log("an error occurred while getting users.");
      }
    } catch (error) {
      if (!this.isAuth()) {
        this._log("an error occurred while listing users.");
      }
    }
  }

  private _log(...params: any) {
    console.log(`[Ranking Builder]`, ...params);
  }
}

export default RankingManager;

import { v4 as uuidv4, validate as uuidValidate } from "uuid";
import { FirebaseApp, initializeApp } from "firebase/app";
import { Auth, getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { child, Database, get, getDatabase, ref, set } from "firebase/database";

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
  database: Database;
  signed: boolean;

  constructor(emailAddress: string, password: string) {
    this.app = initializeApp(firebaseConfig);
    this.auth = getAuth(this.app);
    this.database = getDatabase(this.app);
    this.signed = false;

    this.signIn(emailAddress, password);
  }

  async signIn(emailAddress: string, password: string) {
    try {
      await signInWithEmailAndPassword(this.auth, emailAddress, password);

      this._log("authenticated.");
      this.signed = true;
    } catch (error) {
      this.signed = false;
      this._log("not authenticated.");
    }
  }

  private isValidUserId(userId: string) {
    if (!uuidValidate(userId)) {
      this._log("userId is not valid.");

      return false;
    }

    return true;
  }

  private isSigned() {
    if (!this.signed) {
      this._log("please, authenticate.");
    }

    return this.signed;
  }

  createUser(user: IUser) {
    if (!this.isSigned()) return;

    const request = async () => {
      try {
        const id = uuidv4();

        await set(ref(this.database, "users/" + id), user);
        this._log("user created.", id);
      } catch (error) {
        this._log("an error occurred while creating the user.");
      }
    };

    request();
  }

  updateUser(userId: string, user: IUser) {
    if (!this.isSigned() || !this.isValidUserId(userId)) return;

    this._log("updateUser");
  }

  deleteUser(userId: string) {
    if (!this.isSigned() || !this.isValidUserId(userId)) return;

    this._log("deleteUser");
  }

  getUser(userId: string) {
    if (!this.isSigned() || !this.isValidUserId(userId)) return;

    const dbRef = ref(this.database);

    const request = async () => {
      const snapshot = await get(child(dbRef, `users/${userId}`));
      if (snapshot.exists()) {
        this._log(snapshot.val());
      } else {
        this._log("user does not exists.");
      }
    };

    request();
  }

  private _log(...params: any) {
    console.log(`[Ranking Builder]`, ...params);
  }
}

export default RankingManager;

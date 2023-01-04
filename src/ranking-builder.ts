import { v4 as uuidv4, validate as uuidValidate } from "uuid";
import { FirebaseApp, initializeApp } from "firebase/app";
import {
  Auth,
  browserSessionPersistence,
  getAuth,
  setPersistence,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut as _signOut,
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
import { MESSAGES } from "./constants";
import {
  IRankingBuilder,
  IRankingBuilderConfig,
  Credentials,
  RawUser,
  Data,
  User,
} from "./types";

export class RankingBuilder<T extends IRankingBuilder> {
  app: FirebaseApp;
  auth: Auth;
  database: Database;
  props: T;

  constructor(props: T, config: IRankingBuilderConfig) {
    this.app = initializeApp(config);
    this.auth = getAuth(this.app);
    this.database = getDatabase(this.app);
    this.props = props;

    this.signIn(this.props.credentials);
  }

  get _isAuth() {
    return !!this.auth.currentUser;
  }

  get isAnonymous() {
    return !this.auth.currentUser || this.auth.currentUser.isAnonymous;
  }

  async signIn(credentials?: Credentials) {
    await setPersistence(this.auth, browserSessionPersistence);

    try {
      if (!this.auth.currentUser) {
        if (credentials) {
          const { emailAddress, password } = credentials;

          await signInWithEmailAndPassword(this.auth, emailAddress, password);
        } else {
          await signInAnonymously(this.auth);
        }
      }

      this._log(MESSAGES.USER_IS_AUTH);
    } catch (error) {
      this._log(MESSAGES.USER_IS_NOT_AUTH);
    }
  }

  async signOut() {
    try {
      await _signOut(this.auth);

      this._log(MESSAGES.USER_IS_NOT_AUTH);
    } catch (error) {
      this._log(MESSAGES.USER_IS_NOT_AUTH_FAIL);
    }
  }

  private _error(message: string) {
    this._log(message);

    return Promise.resolve(null);
  }

  private _success(message: string) {
    this._log(message);

    return Promise.resolve();
  }

  async createUser(user: RawUser) {
    if (!this._isAuth) {
      return this._error(MESSAGES.PLEASE_AUTH_USER);
    }

    try {
      const userId = uuidv4();
      const createDate = Date.now();

      await set(ref(this.database, `${this.props.path}/${userId}`), {
        ...user,
        createDate,
        id: userId,
      });

      return this._success(MESSAGES.USER_CREATED);
    } catch (error) {
      if (!this._isAuth) {
        return this._error(MESSAGES.USER_CREATED_FAIL);
      }

      return this._error(MESSAGES.AN_ERROR_OCCURRED);
    }
  }

  async updateUser(userId: string, user: User) {
    if (!this._isAuth) {
      return this._error(MESSAGES.PLEASE_AUTH_USER);
    }

    if (!uuidValidate(userId)) {
      return this._error(MESSAGES.PLEASE_INSERT_CORRECT_USERID);
    }

    try {
      await set(ref(this.database, `${this.props.path}/${userId}`), user);

      return this._success(MESSAGES.USER_UPDATED);
    } catch (error) {
      return this._error(MESSAGES.AN_ERROR_OCCURRED);
    }
  }

  async deleteUser(userId: string) {
    if (!this._isAuth) {
      return this._error(MESSAGES.PLEASE_AUTH_USER);
    }

    if (!uuidValidate(userId)) {
      return this._error(MESSAGES.PLEASE_INSERT_CORRECT_USERID);
    }

    try {
      await remove(ref(this.database, `${this.props.path}/${userId}`));

      return this._success(MESSAGES.USER_DELETED);
    } catch (error) {
      return this._error(MESSAGES.AN_ERROR_OCCURRED);
    }
  }

  async getUser(userId: string) {
    if (!uuidValidate(userId)) {
      return this._error(MESSAGES.PLEASE_INSERT_CORRECT_USERID);
    }

    const snapshot = await get(
      child(ref(this.database), `${this.props.path}/${userId}`)
    );

    if (snapshot.exists()) {
      const user: User = snapshot.val();

      this._log(user);

      return user;
    } else {
      return this._error(MESSAGES.AN_ERROR_OCCURRED);
    }
  }

  async listData(callback: (data: Data) => void, topResults = 10) {
    try {
      const result = query(
        ref(this.database, this.props.path),
        orderByChild("score"),
        limitToLast(topResults)
      );

      return onValue(result, (snapshot) => {
        if (snapshot.exists()) {
          const users = Object.values(snapshot.val()) as User[];

          callback({
            total: users.length,
            users: users.sort((a: any, b: any) => b.score - a.score),
          });

          this._log(snapshot.val());
        } else {
          callback({
            total: 0,
            users: [],
          });
        }
      });
    } catch (error) {
      return this._error(MESSAGES.AN_ERROR_OCCURRED);
    }
  }

  private _log(...params: any) {
    if (this.props.disableLog) {
      return;
    }

    console.log(MESSAGES.PREFIX, ...params);
  }
}

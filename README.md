# Ranking Builder

Ranking Builder is an NPM package that allows you to manage game rankings using Firebase as the database. It was developed using TypeScript, Firebase, and Vite for development mode.

## Installation

To install Ranking Builder in your project, simply use the following command:

`npm install ranking-builder`

## Examples of use

Here's an example of how to use the library to add a new user to the ranking:

```javascript
import { RankingBuilder } from "ranking-builder";

const config = {
  apiKey: "YOUR_apiKey",
  authDomain: "YOUR_authDomain",
  databaseURL: "YOUR_databaseURL",
  projectId: "YOUR_projectId",
  storageBucket: "YOUR_storageBucket",
  messagingSenderId: "YOUR_messagingSenderId",
  appId: "YOUR_appId",
};

const rankingBuilder = new RankingBuilder(
  {
    disableLog: false,
    emailAddress: "your@email.com",
    password: "your_password",
  },
  config
);

rankingBuilder.createUser({
  name: "Player 1",
  score: 1000,
  time: "00:10:00",
});

rankingBuilder.signIn("your@email.com", "your_password");

rankingBuilder.signOut();

rankingBuilder.createUser({
  name: "Player 1",
  score: 1000,
  time: "00:10:00",
});

rankingBuilder.updateUser("a5d6e7f8-g9h0-i1j2-k3l4-m5n6o7p8q9r0", {
  name: "Player 2",
  score: 500,
  time: "00:05:00",
});

rankingBuilder.deleteUser("a5d6e7f8-g9h0-i1j2-k3l4-m5n6o7p8q9r0");

rankingBuilder.getUser("a5d6e7f8-g9h0-i1j2-k3l4-m5n6o7p8q9r0");

rankingBuilder.listUsers((users: IUser[]) => {
  console.log(users);
});
```

## RankingBuilderRenderer

`RankingBuilderRenderer` is a class that allows developers to easily render a table with the top users of their game or application. It works by receiving a rankingBuilder instance and a DOM node (e.g., a `div` element) as inputs, and it automatically generates a table with the top users based on the score. The table can be customized with additional features, such as the ability to delete or edit users. To learn more about RankingBuilderRenderer, check out the [RANKING_BUILDER_RENDERER_README.md](RANKING_BUILDER_RENDERER_README.md) file.

## How to get your firebase config?

1. Go to the Firebase console page: https://console.firebase.google.com/
2. Log in with your Google account.
3. Create a new project or select an existing one.
4. In the left menu, select the "Project Settings" option (gear icon).
5. In the "Project account settings" section, click on "Add a service account".
6. A JSON file with your Firebase account settings will be displayed.
7. Copy these settings and paste them into your application.

Your Firebase account settings are used to initialize the Firebase instance in your application. You will need to pass these settings as a parameter to the `RankingBuilder` class when instantiating it.

## API

| Method                                                          | Description                                                                                                                                                                  |
| --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `signIn(emailAddress: string, password: string)`                | Used to sign in with the user. It is optional on the first instance because when you instantiate the `RankingBuilder` class, you need to pass the user's email and password. |
| `signOut()`                                                     | Used to sign out the user, in case you need to sign in with another user.                                                                                                    |
| `createUser(user: IRawUser)`                                    | Used to add a new user to the database.                                                                                                                                      |
| `updateUser(userId: string, user: IRawUser)`                    | Used to update an existing user in the database.                                                                                                                             |
| `deleteUser(userId: string)`                                    | Used to delete a user from the database.                                                                                                                                     |
| `getUser(userId: string)`                                       | Used to get a specific user from the database.                                                                                                                               |
| `listUsers(callbackFn: (users: IUser[]) => void; top?: number)` | Used to get a list of all users from the database.                                                                                                                           |

## Dependencies and Prerequisites

Ranking Builder depends on the following libraries:

- uuid
- firebase

You must have a Firebase account in order to use Ranking Builder.

## Contributions

If you want to contribute to Ranking Builder, follow these steps:

- Fork the repository
- Create a new branch for your feature
- Commit your changes
- Push the branch and create a pull request

## License

Ranking Builder is licensed under the MIT License.

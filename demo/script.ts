import { RankingBuilder, RankingBuilderRenderer } from "..";

const getRndInteger = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

window.onload = () => {
  const app = document.querySelector("#app") as Node;
  const config = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGIN_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  };

  const rankingBuilder = new RankingBuilder(
    { emailAddress: "test@test.com", password: "123456" },
    config
  );

  const rankingBuilderRenderer = new RankingBuilderRenderer({
    app,
    rankingBuilder,
    top: 10,
  });

  app.appendChild(
    rankingBuilderRenderer.createNode(`<button id="addUser">add user</button>`)
  );

  const addUserButton = document.querySelector("#addUser") as Node;

  const addUserForm = () =>
    rankingBuilderRenderer.createNode(`
      <form id="addUserForm">
        <input name="name" type="text" />
        <button type="submit">add</button>
      </form>
    `);

  addUserButton.addEventListener("click", () => {
    app.appendChild(addUserForm());

    const addUserFormNode = document.querySelector(
      "#addUserForm"
    ) as HTMLFormElement;

    addUserFormNode.addEventListener("submit", async (event) => {
      event.preventDefault();

      const response = await rankingBuilder.createUser({
        // @ts-ignore
        name: event.target.name.value,
        score: getRndInteger(0, 100),
        time: "00:05:00",
      });

      if (response) {
        addUserFormNode.remove();
      }
    });
  });
};

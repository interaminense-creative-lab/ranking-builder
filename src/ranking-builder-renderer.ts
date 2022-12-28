import { IRankingBuilder, IUser, RankingBuilder } from "./ranking-builder";

interface IRankingBuilderRenderer {
  app: Node;
  rankingBuilder: RankingBuilder<IRankingBuilder>;
  top?: number;
}

export class RankingBuilderRenderer<T extends IRankingBuilderRenderer> {
  rankingBuilder: RankingBuilder<IRankingBuilder>;
  app: Node;
  top?: number;

  constructor({ app, rankingBuilder, top }: T) {
    this.app = app;
    this.rankingBuilder = rankingBuilder;
    this.top = top;
    this._render();
  }

  private _generateId(name: string) {
    const upperCaseName = name.charAt(0).toUpperCase() + name.slice(1);

    return `rankingBuilder${upperCaseName}`;
  }

  private _tableTMPL(users: IUser[]) {
    return `
      <table id="${this._generateId("table")}" border="1">
          <thead>
          <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Score</th>
              <th>Time</th>
              <th>Create Date</th>
              <th></th>
              <th></th>
          </tr>
          </thead>
          <tbody>
              ${users
                .map(({ id, name, score, time, createDate }) => {
                  return `
                  <tr id="tr_${id}">
                      <td>${id}</td>
                      <td>${name}</td>
                      <td>${score}</td>
                      <td>${time}</td>
                      <td>${this.getDate(createDate)}</td>
                      <td>
                          <button
                              data-id="${id}"
                              id="${this._generateId("editButton")}"
                          >
                              edit
                          </button>
                      </td>
                      <td>
                          <button
                              data-id="${id}"
                              id="${this._generateId("deleteButton")}"
                          >
                              delete
                          </button>
                      </td>
                  </tr>
                  `;
                })
                .join("")}
          </tbody>
      </table>
    `;
  }

  private _editUserInputTMPL() {
    return `
      <form id="${this._generateId("editUserInput")}">
        <input type="text" name="name" />
      </form>
    `;
  }

  private get _table() {
    return document.querySelector(
      `#${this._generateId("table")}`
    ) as HTMLTableElement | null;
  }

  private get _editUserInput() {
    return document.querySelector(
      `#${this._generateId("editUserInput")}`
    ) as HTMLFormElement | null;
  }

  private _listUsers(users: IUser[]) {
    this._table && this._table.remove();
    this.app.appendChild(this.createNode(this._tableTMPL(users)));

    if (this._table) {
      this._table.addEventListener("click", async (event) => {
        const target = event.target as HTMLButtonElement;
        const editButton = this._generateId("editButton");
        const deleteButton = this._generateId("deleteButton");
        const userId = target.dataset.id as string;

        if (target.id === editButton) {
          this._editUserInput && this._editUserInput.remove();

          const tdName = document.querySelectorAll(
            `#${this._generateId("table")} tr#tr_${userId} td`
          )[1];

          tdName.innerHTML = this._editUserInputTMPL();

          if (this._editUserInput) {
            this._editUserInput.addEventListener("submit", async (event) => {
              event.preventDefault();

              const user = (await this.rankingBuilder.getUser(userId)) as IUser;

              await this.rankingBuilder.updateUser(userId, {
                ...user,
                // @ts-ignore
                name: event.target.name.value,
              });
            });
          }

          return;
        }

        if (target.id === deleteButton) {
          await this.rankingBuilder.deleteUser(userId);

          return;
        }
      });
    }
  }

  // Method used to be rendered the first time in constructor
  // and should not be rendered anymore because of realtime
  // firebase database

  private async _render() {
    await this.rankingBuilder.listUsers(
      (users) => this._listUsers(users),
      this.top
    );
  }

  createNode(tmpl: string) {
    return new DOMParser().parseFromString(tmpl, "text/html").body
      .firstChild as Node;
  }

  getDate(timestamp: number) {
    const date = new Date(timestamp);

    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes();

    return day + ", " + month + ", " + year + ", " + hours + ":" + minutes;
  }
}

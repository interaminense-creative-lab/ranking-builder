import { RankingBuilder } from "./ranking-builder";
import { Data, SortBy, User } from "./types";

interface IRankingBuilderRenderer {
  app: Node;
  rankingBuilder: RankingBuilder;
  sortBy?: SortBy;
  title?: string;
  topResults?: number;
}

export class RankingBuilderRenderer {
  app: Node;
  rankingBuilder: RankingBuilder;
  sortBy?: SortBy;
  title?: string;
  topResults?: number;

  constructor({
    app,
    rankingBuilder,
    sortBy,
    title,
    topResults,
  }: IRankingBuilderRenderer) {
    this.app = app;
    this.rankingBuilder = rankingBuilder;
    this.sortBy = sortBy;
    this.title = title;
    this.topResults = topResults;
    this._render();
  }

  private _generateId(name: string) {
    const upperCaseName = name.charAt(0).toUpperCase() + name.slice(1);

    return `rankingBuilder${upperCaseName}`;
  }

  private _tableTMPL({ users }: Data) {
    if (!users.length) {
      return "";
    }

    return `
      <table class="ranking-builder-table" cellpadding="0" cellspacing="0" id="${this._generateId(
        "table"
      )}">
          ${this.title ? `<caption>${this.title}</caption>` : ""}
          <thead>
          <tr>
            <th class="align-left">ID</th>
            <th class="align-left">Name</th>
            <th>Score</th>
            <th>Time</th>
            <th>Create Date</th>
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
                    <td>${this.getDate(createDate as number)}</td>
                </tr>
                `;
              })
              .join("")}
          </tbody>
      </table>
    `;
  }

  private _tableUserAuthTMPL({ users }: Data) {
    if (!users.length) {
      return "";
    }

    return `
      <table class="ranking-builder-table" cellpadding="0" cellspacing="0" id="${this._generateId(
        "table"
      )}">
          ${this.title ? `<caption>${this.title}</caption>` : ""}
          <thead>
            <th class="align-left">ID</th>
            <th class="align-left">Name</th>
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
                  <td>${this.convertToTimeFormat(time as number)}</td>
                  <td>${this.getDate(createDate as number)}</td>
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

  private _listData(data: Data) {
    this._table && this._table.remove();

    const tmpl = this.rankingBuilder.isAnonymous
      ? this._tableTMPL(data)
      : this._tableUserAuthTMPL(data);

    this.app.appendChild(this.createNode(tmpl));

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

              const user = await this.rankingBuilder.getUser(userId);

              if (user) {
                await this.rankingBuilder.updateUser(userId, {
                  ...user,
                  // @ts-ignore
                  name: event.target.name.value,
                });
              }
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
    await this.rankingBuilder.listData((data) => this._listData(data), {
      topResults: this.topResults,
      sortBy: this.sortBy,
    });
  }

  createNode(tmpl: string) {
    return new DOMParser().parseFromString(tmpl, "text/html").body
      .firstChild as Node;
  }

  convertToTimeFormat(seconds: number) {
    let hours = Math.floor(seconds / 3600);
    let minutes = Math.floor((seconds % 3600) / 60);
    let remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  }

  getDate(timestamp: number) {
    const date = new Date(timestamp);

    return date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
}

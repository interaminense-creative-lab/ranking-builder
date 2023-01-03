# RankingBuilderRenderer

The `RankingBuilderRenderer` class is a class that helps render a table with the top users that the user defines. This table is rendered in vanilla javascript and will help the developer who doesn't want to create a table from scratch.

## How to use

To use the `RankingBuilderRenderer` class, just instantiate it passing the necessary parameters to the constructor. The necessary parameters are:

- `app`: a DOM element where the table will be rendered;
- `rankingBuilder`: an instance of the `RankingBuilder` class, which is the class responsible for managing the ranking data.

Example of use:

```javascript
import { RankingBuilder, RankingBuilderRenderer } from 'ranking-builder';

const app = document.querySelector("#app") as Node;

const config = {
    apiKey: 'YOUR_apiKey',
    authDomain: 'YOUR_authDomain',
    projectId: 'YOUR_projectId',
    storageBucket: 'YOUR_storageBucket',
    messagingSenderId: 'YOUR_messagingSenderId',
    appId: 'YOUR_appId',
    measurementId: 'YOUR_measurementId',
};

const rankingBuilder = new RankingBuilder(
    { emailAddress: "test@test.com", password: "123456" },
    config
);

const rankingBuilderRenderer = new RankingBuilderRenderer({
    app,
    rankingBuilder
});
```

## Optional parameters

In addition to the necessary parameters, the RankingBuilderRenderer class also has an optional parameter:

topResults: a number that defines the number of top users that will be shown in the table. The default value is 10.

## Example of use with the topResults parameter:

```javascript
const rankingBuilderRenderer = new RankingBuilderRenderer({
  app,
  rankingBuilder,
  topResults: 10,
});
```

## Example of use with the title parameter:

title: a string that defines the title that will be shown in the table.

```javascript
const rankingBuilderRenderer = new RankingBuilderRenderer({
  app,
  rankingBuilder,
  title: 'you can insert a title here'
  topResults: 10,
});
```

# Demo

To see a demonstration of `RankingBuilderRenderer`, simply follow these steps:

1. Clone this repository:

```
git clone https://github.com/YOUR_USERNAME/ranking-builder.git
```

2. Access the project folder:

```
cd ranking-builder
```

3. Install all dependencies

```
yarn install
```

4. Start server

```
yarn dev
```

5. Open your browser and access the following URL: http://127.0.0.1:5173/demo/index.html

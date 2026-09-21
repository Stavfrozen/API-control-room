# API Control Room

An interactive REST and HTTP learning game built with Node.js, Express, EJS, and vanilla JavaScript. Players construct real HTTP requests and examine the server's responses across nine missions.

## Features

- GET, POST, PATCH, and DELETE missions
- Route parameters, query parameters, and JSON request bodies
- HTTP status codes and error handling
- AJAX requests to two resources: Servers and Deployments
- Server-side mission validation
- Score and attempt tracking, mission navigation, and Restart Game
- HTTP quick guide and server-rendered API schema page
- Responsive interface

## Requirements

Node.js 18 or later.

## Installation

Clone or download the repository, open a terminal in the project directory, and run:

```bash
npm install
```

## Run

```bash
npm start
```

Open http://localhost:3000 to play. The server-rendered API schemas are at http://localhost:3000/schemas.

Run the Node.js server locally; GitHub Pages cannot host the Express API.

## Testing

```bash
npm test
```

The tests check the pages, ordinary API requests, all nine missions, incorrect requests, game data resets, and progress after navigation.

## How to play

For each mission, choose an HTTP method, enter an endpoint, and add any required query parameters or JSON body. Select **Send Request** to see the actual HTTP status and response. A correct request unlocks the next mission.

The final mission intentionally expects a `404 Not Found` response. The status badge remains red because HTTP returned an error, while the mission feedback turns green because the player solved the task.

## Progress and reset

Score, attempts, and completed missions are saved for the current browser tab. Opening **API Schemas** and returning to the game, or refreshing the page, restores that progress. Refreshing **does not reset the server's data**. Closing the tab may clear browser progress while leaving server data in place; select **Restart Game** to reset both.

Restart Game affects every client connected to the same server. Restarting the Node.js server resets its in-memory data and invalidates saved browser progress.

## API and mission validation

The API works without game headers, so it can be explored with a browser, curl, or an API client:

```bash
curl http://localhost:3000/api/servers
curl "http://localhost:3000/api/servers?region=eu-west&status=online"
curl http://localhost:3000/api/deployments/1
```

The game sends an `X-Stage-Id` header with each mission request. When that header is present, the server checks the method, endpoint, route and query parameters, request body, and actual response status against the mission requirements. The exact validation rules are stored on the server and are not exposed in the client-side JavaScript.

Servers and Deployments are stored in memory; deployments refer to servers through `serverId`. No database is used, and data does not persist across server restarts.

## Troubleshooting

`npm install` installs dependencies; it does not start the site. Run `npm start` afterward, then open http://localhost:3000.

If Windows PowerShell blocks `npm.ps1` because of its execution policy, use:

```powershell
npm.cmd install
npm.cmd start
```

The standard `npm` commands also work from Command Prompt, Git Bash, or another terminal.

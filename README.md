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

The test checks the pages, ordinary API requests, all nine missions, incorrect requests, and resetting the game data.

## How to play

For each mission, choose an HTTP method, enter an endpoint, and add any required query parameters or JSON body. Select **Send Request** to see the actual HTTP status and response. A correct request unlocks the next mission.

The final mission intentionally expects a `404 Not Found` response. The status badge remains red because HTTP returned an error, while the mission feedback turns green because the player solved the task.

## Progress and reset

Score, attempts, and completed missions are tracked in the browser. Refreshing the page starts the interface at Stage 1, but **does not reset the server's data**. If a previous attempt changed or deleted a resource, select **Restart Game** to reset both browser progress and the in-memory API data.

Restart Game affects every client connected to the same server. Restarting the Node.js server also resets its in-memory data.

## API and mission validation

The API works without game headers, so it can be explored with a browser, curl, or an API client:

```bash
curl http://localhost:3000/api/servers
curl "http://localhost:3000/api/servers?region=eu-west&status=online"
curl http://localhost:3000/api/deployments/1
```

The game sends an `X-Stage-Id` header with each mission request. When that header is present, the server checks the method, endpoint, route and query parameters, request body, and actual response status against the mission requirements. The exact validation rules are stored on the server and are not exposed in the client-side JavaScript.

Servers and Deployments are stored in memory; deployments refer to servers through `serverId`. No database is used, and data does not persist across server restarts.

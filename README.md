# API Control Room

API Control Room is an interactive REST and HTTP learning game built with Node.js, Express, EJS and Vanilla JavaScript.

The player completes a sequence of missions by constructing real HTTP requests and sending them to the server.

## Features

- 9 interactive REST API missions
- GET, POST, PATCH and DELETE requests
- Route Parameters
- Query Parameters
- JSON Request Bodies
- HTTP Status Codes
- Real client-server communication using AJAX
- Server-side solution validation
- Servers and Deployments resources
- Error handling
- Score and attempt tracking
- Previous mission navigation
- HTTP Quick Guide
- Server-side rendered schema page
- Responsive interface

## Technologies

- Node.js
- Express
- EJS
- Vanilla JavaScript
- CSS

## Installation

Clone or download the project.

Open a terminal inside the project directory and run:

```bash
npm install
```

Start the server:

```bash
npm start
```

Run the project checks with `npm test`.

Open http://localhost:3000 to play. The API schema page is at
http://localhost:3000/schemas.

## How to play

Read each mission, choose an HTTP method, enter the API endpoint and add any
required query parameters or JSON body. Select **Send Request** to see the
server response. A successful mission unlocks the next one. The final mission
expects a `404 Not Found` response.

## API

The API works without game headers, so you can also explore it with a browser,
curl or an API client. For example:

```bash
curl http://localhost:3000/api/servers
curl "http://localhost:3000/api/servers?region=eu-west&status=online"
curl http://localhost:3000/api/deployments/1
```

The game sends an `X-Stage-Id` header with its requests. When that header is
present, the server checks the request against the current mission before
running the API route. Resource data is stored in memory and resets when the
server restarts.

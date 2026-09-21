const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const app = require("../server");
const stages = require("../data/stageSolutions");

test("pages, API, and all game missions", async () => {
    const server = app.listen(0);
    await new Promise(resolve => server.once("listening", resolve));
    const base = `http://127.0.0.1:${server.address().port}`;

    try {
        let initialVersion;
        for (const path of ["/", "/schemas"]) {
            const response = await fetch(base + path);
            assert.equal(response.status, 200, path);
            if (path === "/") {
                initialVersion = (await response.text()).match(/data-game-version="([^"]+)"/)?.[1];
                assert.ok(initialVersion);
            }
        }

        const ordinary = await fetch(base + "/api/servers");
        assert.equal(ordinary.status, 200);
        assert.equal(ordinary.headers.get("X-Mission-Success"), null);

        const wrong = await fetch(base + "/api/servers/2", {
            headers: { "X-Stage-Id": "1" }
        });
        assert.equal(wrong.status, 400);
        assert.equal(wrong.headers.get("X-Mission-Success"), "false");

        for (const [id, stage] of Object.entries(stages)) {
            const path = Object.entries(stage.routeParams).reduce(
                (url, [key, value]) => url.replace(`:${key}`, encodeURIComponent(value)),
                stage.path
            );
            const query = new URLSearchParams(stage.queryParams);
            const response = await fetch(base + path + (query.size ? `?${query}` : ""), {
                method: stage.method,
                headers: {
                    "X-Stage-Id": id,
                    ...(stage.body === null ? {} : { "Content-Type": "application/json" })
                },
                ...(stage.body === null ? {} : { body: JSON.stringify(stage.body) })
            });
            assert.equal(response.status, stage.expectedStatus, `stage ${id} status`);
            assert.equal(response.headers.get("X-Mission-Success"), "true", `stage ${id} success`);
        }

        // Server 4 was deleted in stage 6. The same request must now fail the mission.
        const failedDelete = await fetch(base + "/api/servers/4", {
            method: "DELETE",
            headers: { "X-Stage-Id": "6" }
        });
        assert.equal(failedDelete.status, 404);
        assert.equal(failedDelete.headers.get("X-Mission-Success"), "false");

        const reset = await fetch(base + "/api/game/reset", { method: "POST" });
        assert.equal(reset.status, 200);
        assert.equal(reset.headers.get("X-Mission-Success"), null);
        const { gameVersion } = await reset.json();
        assert.notEqual(gameVersion, initialVersion);
        assert.match(await (await fetch(base + "/")).text(), new RegExp(gameVersion));

        const servers = await (await fetch(base + "/api/servers")).json();
        const deployments = await (await fetch(base + "/api/deployments")).json();
        assert.equal(servers.length, 4);
        assert.equal(servers.find(server => server.id === 4).name, "database-server-01");
        assert.equal(servers.find(server => server.id === 2).status, "online");
        assert.equal(deployments.length, 2);
        assert.equal(deployments.find(deployment => deployment.id === 1).restartCount, 0);

        const replayDelete = await fetch(base + "/api/servers/4", {
            method: "DELETE",
            headers: { "X-Stage-Id": "6" }
        });
        assert.equal(replayDelete.status, 200);
        assert.equal(replayDelete.headers.get("X-Mission-Success"), "true");
    } finally {
        server.close();
    }
});

test("game progress survives navigation and resets with server data", async () => {
    const saved = new Map();
    const sessionStorage = {
        getItem: key => saved.get(key) ?? null,
        setItem: (key, value) => saved.set(key, value)
    };

    function mount(gameVersion) {
        const elements = new Map();
        function element() {
            const classes = new Set(["hidden"]);
            return {
                value: "", textContent: "", className: "", style: {}, disabled: false,
                classList: {
                    add: name => classes.add(name),
                    remove: name => classes.delete(name),
                    toggle: (name, enabled) => enabled ? classes.add(name) : classes.delete(name),
                    contains: name => classes.has(name)
                },
                addEventListener(name, callback) { this[name] = callback; },
                replaceChildren() {},
                querySelector() { return this.label ||= { textContent: "" }; }
            };
        }
        const document = {
            body: { dataset: { gameVersion } },
            getElementById(id) {
                if (!elements.has(id)) elements.set(id, element());
                return elements.get(id);
            },
            createElement: element
        };
        const fetch = async url => url === "/api/game/reset"
            ? { ok: true, json: async () => ({ gameVersion: "reset-version" }) }
            : {
                ok: true, status: 200, statusText: "OK",
                headers: { get: () => "true" },
                text: async () => "[]"
            };
        vm.runInNewContext(
            fs.readFileSync(require.resolve("../public/js/game.js"), "utf8"),
            { document, sessionStorage, URLSearchParams, fetch, Math }
        );
        return id => elements.get(id);
    }

    const firstPage = mount("first-version");
    firstPage("endpointInput").value = "/api/servers";
    await firstPage("sendButton").click();
    firstPage("nextButton").click();
    assert.equal(firstPage("stageLabel").textContent, "Stage 2 / 9");

    const returnedPage = mount("first-version");
    assert.equal(returnedPage("stageLabel").textContent, "Stage 2 / 9");
    assert.equal(returnedPage("scoreValue").textContent, 100);
    assert.equal(returnedPage("attemptValue").textContent, 1);

    await returnedPage("restartButton").click();
    assert.equal(returnedPage("stageLabel").textContent, "Stage 1 / 9");
    assert.equal(returnedPage("scoreValue").textContent, 0);
    assert.equal(mount("reset-version")("stageLabel").textContent, "Stage 1 / 9");
    assert.equal(mount("new-server-version")("scoreValue").textContent, 0);
});

const test = require("node:test");
const assert = require("node:assert/strict");
const app = require("../server");
const stages = require("../data/stageSolutions");

test("pages, API, and all game missions", async () => {
    const server = app.listen(0);
    await new Promise(resolve => server.once("listening", resolve));
    const base = `http://127.0.0.1:${server.address().port}`;

    try {
        for (const path of ["/", "/schemas"]) {
            const response = await fetch(base + path);
            assert.equal(response.status, 200, path);
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
    } finally {
        server.close();
    }
});

const stageSolutions = require("../data/stageSolutions");

function objectsEqual(first, second) {
    const normalize = value => {
        if (!value || typeof value !== "object" || Array.isArray(value)) return value;
        return Object.fromEntries(Object.keys(value).sort().map(key => [key, normalize(value[key])]));
    };
    return JSON.stringify(normalize(first)) === JSON.stringify(normalize(second));
}

function validateStageRequest(req, res, next) {
    if (!req.path.startsWith("/api/")) return next();

    const header = req.get("X-Stage-Id");
    if (header === undefined) return next();

    const stageId = Number(header);
    const stage = Number.isInteger(stageId) && stageSolutions[stageId];
    if (!stage) {
        res.set("X-Mission-Success", "false");
        return res.status(400).json({ success: false, error: "Invalid stage identifier" });
    }

    const expectedPath = Object.entries(stage.routeParams).reduce(
        (path, [key, value]) => path.replace(`:${key}`, encodeURIComponent(value)),
        stage.path
    );
    const body = req.body === undefined || req.body === null ||
        (typeof req.body === "object" && !Array.isArray(req.body) && Object.keys(req.body).length === 0)
        ? null : req.body;
    const query = Object.fromEntries(
        Object.entries(req.query).map(([key, value]) => [key, String(value)])
    );
    const issues = [];
    if (req.method !== stage.method) issues.push("HTTP method");
    if (req.path !== expectedPath) issues.push("endpoint or route parameters");
    if (!objectsEqual(query, stage.queryParams)) issues.push("query parameters");
    if (!objectsEqual(body, stage.body)) issues.push("request body");

    if (issues.length) {
        res.set("X-Mission-Success", "false");
        return res.status(400).json({
            success: false,
            error: "The request does not match the requirements for this stage.",
            issues
        });
    }

    res.set("X-Stage-Id", String(stageId));
    const writeHead = res.writeHead;
    res.writeHead = function (statusCode, ...args) {
        this.setHeader("X-Mission-Success", String(statusCode === stage.expectedStatus));
        return writeHead.call(this, statusCode, ...args);
    };
    next();
}

module.exports = validateStageRequest;

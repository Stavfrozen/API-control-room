const express = require("express");
const { deployments, servers } = require("../data/store");
const router = express.Router();

router.get("/", (req, res) => {
    const { status, serverId } = req.query;
    const matches = deployments.filter(deployment =>
        (!status || deployment.status === status) &&
        (!serverId || deployment.serverId === parseInt(serverId))
    );
    res.status(200).json(matches);
});

router.get("/:id", (req, res) => {
    const deployment = deployments.find(item => item.id === parseInt(req.params.id));
    if (!deployment) return res.status(404).json({ error: "Deployment not found" });
    res.status(200).json(deployment);
});

router.post("/", (req, res) => {
    const { serverId, version, status } = req.body;
    if (!serverId || !version) {
        return res.status(400).json({ error: "serverId and version are required" });
    }
    if (!servers.some(server => server.id === parseInt(serverId))) {
        return res.status(404).json({ error: "Target server not found" });
    }
    const id = deployments.length ? Math.max(...deployments.map(item => item.id)) + 1 : 1;
    const deployment = {
        id, serverId: parseInt(serverId), version,
        status: status || "queued", restartCount: 0
    };
    deployments.push(deployment);
    res.status(201).json(deployment);
});

router.patch("/:id", (req, res) => {
    const deployment = deployments.find(item => item.id === parseInt(req.params.id));
    if (!deployment) return res.status(404).json({ error: "Deployment not found" });
    const { status, version } = req.body;
    const restart = req.query.restart === "true";
    if (status === undefined && version === undefined && !restart) {
        return res.status(400).json({ error: "No deployment changes were requested" });
    }
    if (status !== undefined) deployment.status = status;
    if (version !== undefined) deployment.version = version;
    if (restart) {
        deployment.restartCount++;
        deployment.lastRestart = new Date().toISOString();
    }
    res.status(200).json(deployment);
});

module.exports = router;

const express = require("express");
const { servers } = require("../data/store");
const router = express.Router();

router.get("/", (req, res) => {
    const { region, status } = req.query;
    const matches = servers.filter(server =>
        (!region || server.region === region) && (!status || server.status === status)
    );
    res.status(200).json(matches);
});

router.get("/:id", (req, res) => {
    const server = servers.find(item => item.id === parseInt(req.params.id));
    if (!server) return res.status(404).json({ error: "Server not found" });
    res.status(200).json(server);
});

router.post("/", (req, res) => {
    const { name, region, status, cpu } = req.body;
    if (!name || !region || !status) {
        return res.status(400).json({ error: "Name, region and status are required" });
    }
    const id = servers.length ? Math.max(...servers.map(server => server.id)) + 1 : 1;
    const server = { id, name, region, status, cpu: cpu ?? 0 };
    servers.push(server);
    res.status(201).json(server);
});

router.patch("/:id", (req, res) => {
    const server = servers.find(item => item.id === parseInt(req.params.id));
    if (!server) return res.status(404).json({ error: "Server not found" });
    const { name, region, status, cpu } = req.body;
    if ([name, region, status, cpu].every(value => value === undefined)) {
        return res.status(400).json({ error: "No fields were provided for update" });
    }
    if (name !== undefined) server.name = name;
    if (region !== undefined) server.region = region;
    if (status !== undefined) server.status = status;
    if (cpu !== undefined) server.cpu = cpu;
    res.status(200).json(server);
});

router.delete("/:id", (req, res) => {
    const index = servers.findIndex(server => server.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ error: "Server not found" });
    const [server] = servers.splice(index, 1);
    res.status(200).json({ message: "Server deleted successfully", server });
});

module.exports = router;

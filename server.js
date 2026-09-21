const express = require("express");
const path = require("path");
const validateStageRequest = require("./middleware/validateStageRequest");
const resourceSchemas = require("./data/resourceSchemas");
const { resetStore, getGameVersion } = require("./data/store");

const app = express();
const PORT = 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/api", (req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
});
app.use(validateStageRequest);
app.post("/api/game/reset", (req, res) => {
    resetStore();
    res.status(200).json({ message: "Game restarted", gameVersion: getGameVersion() });
});
app.use("/api/servers", require("./routes/servers"));
app.use("/api/deployments", require("./routes/deployments"));

app.get("/", (req, res) => {
    res.set("Cache-Control", "no-store");
    res.render("index", {
        appName: "API Control Room",
        totalStages: 9,
        gameVersion: getGameVersion()
    });
});
app.get("/schemas", (req, res) => res.render("schemas", {
    schemas: resourceSchemas,
    generatedAt: new Date()
}));

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`API Control Room is running on http://localhost:${PORT}`);
    });
}

module.exports = app;

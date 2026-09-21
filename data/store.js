const servers = [
    {
        id: 1,
        name: "api-server-01",
        region: "eu-west",
        status: "online",
        cpu: 34
    },
    {
        id: 2,
        name: "web-server-01",
        region: "us-east",
        status: "online",
        cpu: 61
    },
    {
        id: 3,
        name: "backup-server-01",
        region: "eu-west",
        status: "offline",
        cpu: 0
    },
    {
        id: 4,
        name: "database-server-01",
        region: "asia-east",
        status: "maintenance",
        cpu: 12
    }
];

const deployments = [
    {
        id: 1,
        serverId: 1,
        version: "2.4.0",
        status: "running",
        restartCount: 0
    },
    {
        id: 2,
        serverId: 2,
        version: "1.8.3",
        status: "completed",
        restartCount: 0
    }
];

module.exports = {
    servers,
    deployments
};
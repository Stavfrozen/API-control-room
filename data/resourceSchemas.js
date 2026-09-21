const resourceSchemas = [
    {
        name: "Servers",
        endpoint: "/api/servers",
        description:
            "Infrastructure servers managed by the API Control Room.",
        fields: [
            {
                name: "id",
                type: "Number",
                description: "Unique server identifier"
            },
            {
                name: "name",
                type: "String",
                description: "Server name"
            },
            {
                name: "region",
                type: "String",
                description: "Hosting region"
            },
            {
                name: "status",
                type: "String",
                description: "Current server status"
            },
            {
                name: "cpu",
                type: "Number",
                description: "Current CPU usage percentage"
            }
        ]
    },

    {
        name: "Deployments",
        endpoint: "/api/deployments",
        description:
            "Software deployments associated with infrastructure servers.",
        fields: [
            {
                name: "id",
                type: "Number",
                description: "Unique deployment identifier"
            },
            {
                name: "serverId",
                type: "Number",
                description: "ID of the target server"
            },
            {
                name: "version",
                type: "String",
                description: "Software version being deployed"
            },
            {
                name: "status",
                type: "String",
                description: "Current deployment status"
            },
            {
                name: "restartCount",
                type: "Number",
                description: "Number of deployment restarts"
            },
            {
                name: "lastRestart",
                type: "String | Optional",
                description: "Timestamp of the most recent restart"
            }
        ]
    }
];

module.exports = resourceSchemas;
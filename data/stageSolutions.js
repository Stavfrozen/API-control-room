const stageSolutions = {
    1: {
        method: "GET",
        expectedStatus: 200,
        path: "/api/servers",
        routeParams: {},
        queryParams: {},
        body: null
    },

    2: {
        method: "GET",
        expectedStatus: 200,
        path: "/api/servers/:id",
        routeParams: {
            id: "2"
        },
        queryParams: {},
        body: null
    },

    3: {
        method: "GET",
        expectedStatus: 200,
        path: "/api/servers",
        routeParams: {},
        queryParams: {
            region: "eu-west",
            status: "online"
        },
        body: null
    },

    4: {
        method: "POST",
        expectedStatus: 201,
        path: "/api/servers",
        routeParams: {},
        queryParams: {},
        body: {
            name: "edge-server-01",
            region: "us-central",
            status: "online",
            cpu: 18
        }
    },

    5: {
        method: "PATCH",
        expectedStatus: 200,
        path: "/api/servers/:id",
        routeParams: {
            id: "2"
        },
        queryParams: {},
        body: {
            status: "maintenance",
            cpu: 25
        }
    },

    6: {
        method: "DELETE",
        expectedStatus: 200,
        path: "/api/servers/:id",
        routeParams: {
            id: "4"
        },
        queryParams: {},
        body: null
    },

    7: {
        method: "POST",
        expectedStatus: 201,
        path: "/api/deployments",
        routeParams: {},
        queryParams: {},
        body: {
            serverId: 1,
            version: "2.5.0",
            status: "queued"
        }
    },

    8: {
        method: "PATCH",
        expectedStatus: 200,
        path: "/api/deployments/:id",
        routeParams: {
            id: "1"
        },
        queryParams: {
            restart: "true"
        },
        body: {
            status: "running"
        }
    },

    9: {
        method: "GET",
        expectedStatus: 404,
        path: "/api/deployments/:id",
        routeParams: {
            id: "999"
        },
        queryParams: {},
        body: null
    }
};

module.exports = stageSolutions;

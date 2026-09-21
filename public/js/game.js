const stages = [
    {
        title: "Run a full server scan",
        description: "Retrieve the complete list of servers currently connected to the control room.",
        hint: "This mission only requires the collection endpoint. No parameters or body are needed.",
        concepts: ["GET", "JSON"]
    },
    {
        title: "Inspect server #2",
        description: "Retrieve the information for server with ID 2.",
        hint: "The server ID belongs inside the URL path.",
        concepts: ["GET", "Route Parameter"]
    },
    {
        title: "Locate the active EU node",
        description: "Retrieve servers located in eu-west whose status is online.",
        hint: "Use two query parameters: region and status.",
        concepts: ["GET", "Query Parameters"], queryFields: 2
    },
    {
        title: "Register a new edge server",
        description: "Create edge-server-01 in us-central. Its status should be online and CPU usage should be 18.",
        hint: "Creation uses POST. Send the new resource fields as JSON.",
        concepts: ["POST", "Request Body", "201"], bodyEnabled: true
    },
    {
        title: "Move server #2 into maintenance",
        description: "Update server 2 so its status is maintenance and its CPU value is 25.",
        hint: "Combine the server ID in the route with a JSON body containing only the fields being changed.",
        concepts: ["PATCH", "Route Parameter", "Request Body"], bodyEnabled: true
    },
    {
        title: "Decommission server #4",
        description: "Remove server 4 from the infrastructure.",
        hint: "DELETE targets the resource using its ID in the route.",
        concepts: ["DELETE", "Route Parameter"]
    },
    {
        title: "Deploy version 2.5.0",
        description: "Create a queued deployment for server 1 using version 2.5.0.",
        hint: "Deployments are a different resource. Create one with a POST request and JSON body.",
        concepts: ["POST", "Second Resource", "Request Body"], bodyEnabled: true
    },
    {
        title: "Restart deployment #1",
        description: "Set deployment 1 to running and request a restart at the same time.",
        hint: "Use the deployment ID in the route, restart=true as a query parameter, and the new status in the JSON body.",
        concepts: ["PATCH", "Route Parameter", "Query Parameter", "Request Body"],
        queryFields: 1, bodyEnabled: true
    },
    {
        title: "Trigger a controlled failure",
        description: "Request deployment 999. It does not exist, so the correct server response should be 404 Not Found.",
        hint: "For this mission, receiving an error is the correct result.",
        concepts: ["GET", "404", "Error Handling"]
    }
];

const ids = [
    "stageLabel", "stageConcept", "progressBar", "missionTitle", "missionDescription",
    "missionHint", "conceptTags", "methodInput", "endpointInput", "queryKey1",
    "queryValue1", "queryKey2", "queryValue2", "bodyInput", "sendButton",
    "clearButton", "nextButton", "previousButton", "feedbackBox", "completedNotice",
    "statusBadge", "requestPreview", "responsePreview", "scoreValue", "attemptValue",
    "guideButton", "guideModal", "closeGuideButton", "restartButton", "completionScreen",
    "finalScore", "finalAttempts", "closeCompletionButton", "confettiContainer"
];
const ui = Object.fromEntries(ids.map(id => [id, document.getElementById(id)]));
const queryInputs = [
    [ui.queryKey1, ui.queryValue1],
    [ui.queryKey2, ui.queryValue2]
];
let currentStage = 0;
let totalScore = 0;
let totalAttempts = 0;
let busy = false;
const stageAttempts = Array(stages.length).fill(0);
const completedStages = new Set();

function updateStats() {
    ui.scoreValue.textContent = totalScore;
    ui.attemptValue.textContent = totalAttempts;
}

function clearRequest() {
    ui.methodInput.value = "GET";
    [ui.endpointInput, ui.bodyInput, ...queryInputs.flat()].forEach(input => input.value = "");
}

function resetOutput() {
    ui.feedbackBox.classList.add("hidden");
    ui.statusBadge.textContent = "WAITING";
    ui.statusBadge.className = "status-badge";
    ui.requestPreview.textContent = "No request sent yet.";
    ui.responsePreview.textContent = "Awaiting server response...";
}

function configureBuilder(stage) {
    const completed = completedStages.has(currentStage);
    ui.completedNotice.classList.toggle("hidden", !completed);
    [ui.methodInput, ui.endpointInput, ui.sendButton, ui.clearButton].forEach(input => {
        input.disabled = completed;
    });
    queryInputs.forEach(([key, value], index) => {
        key.disabled = value.disabled = completed || index >= (stage.queryFields || 0);
    });
    ui.bodyInput.disabled = completed || !stage.bodyEnabled;
    ui.bodyInput.placeholder = stage.bodyEnabled
        ? "Enter request body as JSON..."
        : "No request body required for this mission.";
}

function renderStage() {
    const stage = stages[currentStage];
    ui.stageLabel.textContent = `Stage ${currentStage + 1} / ${stages.length}`;
    ui.stageConcept.textContent = stage.concepts[0];
    ui.progressBar.style.width = `${(currentStage + 1) / stages.length * 100}%`;
    ui.missionTitle.textContent = stage.title;
    ui.missionDescription.textContent = stage.description;
    ui.missionHint.textContent = stage.hint;
    ui.conceptTags.replaceChildren(...stage.concepts.map(concept => {
        const tag = document.createElement("span");
        tag.textContent = concept;
        return tag;
    }));
    clearRequest();
    resetOutput();
    configureBuilder(stage);
    ui.nextButton.classList.toggle("hidden", !completedStages.has(currentStage) || currentStage === stages.length - 1);
    ui.previousButton.classList.toggle("hidden", currentStage === 0);
    updateStats();
}

function showFeedback(message, success) {
    ui.feedbackBox.textContent = message;
    ui.feedbackBox.className = `feedback-box ${success ? "success" : "error"}`;
}

function showCompletion() {
    ui.finalScore.textContent = `${totalScore} / ${stages.length * 100}`;
    ui.finalAttempts.textContent = totalAttempts;
    ui.confettiContainer.replaceChildren(...Array.from({ length: 90 }, () => {
        const piece = document.createElement("span");
        piece.className = "confetti-piece";
        piece.style.left = `${Math.random() * 100}%`;
        piece.style.animationDelay = `${Math.random() * 1.5}s`;
        piece.style.animationDuration = `${2.5 + Math.random() * 2}s`;
        piece.style.transform = `rotate(${Math.random() * 360}deg)`;
        return piece;
    }));
    ui.completionScreen.classList.remove("hidden");
}

async function sendRequest() {
    if (busy || completedStages.has(currentStage)) return;

    const path = ui.endpointInput.value.trim();
    if (!path) return showFeedback("Enter an API endpoint first.", false);

    const bodyText = ui.bodyInput.value.trim();
    let body = null;
    if (bodyText) {
        try {
            body = JSON.parse(bodyText);
        } catch {
            return showFeedback("The request body is not valid JSON.", false);
        }
    }

    const query = new URLSearchParams();
    queryInputs.forEach(([key, value]) => {
        if (key.value.trim()) query.set(key.value.trim(), value.value.trim());
    });
    const url = path + (query.size ? `?${query}` : "");
    const method = ui.methodInput.value;
    const headers = { "X-Stage-Id": String(currentStage + 1) };
    const options = { method, headers };
    if (body !== null && method !== "GET" && method !== "DELETE") {
        headers["Content-Type"] = "application/json";
        options.body = JSON.stringify(body);
    }

    totalAttempts++;
    stageAttempts[currentStage]++;
    updateStats();
    ui.requestPreview.textContent = `${method} ${url}\nStage-ID: ${currentStage + 1}` +
        (body === null ? "" : `\n\n${JSON.stringify(body, null, 2)}`);
    ui.sendButton.disabled = true;
    ui.restartButton.disabled = true;
    busy = true;
    const buttonText = ui.sendButton.querySelector("span");
    buttonText.textContent = "Sending...";

    try {
        const response = await fetch(url, options);
        const responseText = await response.text();
        let responseData;
        try { responseData = JSON.parse(responseText); }
        catch { responseData = responseText; }

        const missionSuccess = response.headers.get("X-Mission-Success") === "true";
        ui.statusBadge.textContent = `${response.status} ${response.statusText}`;
        ui.statusBadge.className = `status-badge status-${response.ok ? "success" : "error"}`;
        ui.responsePreview.textContent = typeof responseData === "string"
            ? responseData : JSON.stringify(responseData, null, 2);

        if (missionSuccess) {
            completedStages.add(currentStage);
            const points = Math.max(10, 110 - stageAttempts[currentStage] * 10);
            totalScore += points;
            updateStats();
            showFeedback(currentStage === stages.length - 1
                ? `Final request accepted. Control Room cleared. +${points} points`
                : `Request accepted. Mission complete. +${points} points`, true);
            configureBuilder(stages[currentStage]);
            if (currentStage === stages.length - 1) showCompletion();
            else ui.nextButton.classList.remove("hidden");
        } else {
            const issues = Array.isArray(responseData?.issues) && responseData.issues.length
                ? ` Check: ${responseData.issues.join(", ")}.` : "";
            showFeedback(`${responseData?.error || "The server rejected this solution."}${issues}`, false);
        }
    } catch {
        ui.statusBadge.textContent = "CONNECTION ERROR";
        ui.statusBadge.className = "status-badge status-error";
        ui.responsePreview.textContent = "Could not connect to the API server.";
        showFeedback("The request could not reach the server.", false);
    } finally {
        busy = false;
        ui.restartButton.disabled = false;
        if (!completedStages.has(currentStage)) ui.sendButton.disabled = false;
        buttonText.textContent = "Send Request";
    }
}

async function restartGame() {
    if (busy) return;
    busy = true;
    ui.restartButton.disabled = true;
    const sendWasDisabled = ui.sendButton.disabled;
    ui.sendButton.disabled = true;

    try {
        const response = await fetch("/api/game/reset", { method: "POST" });
        if (!response.ok) throw new Error("Reset failed");
        currentStage = 0;
        totalScore = 0;
        totalAttempts = 0;
        stageAttempts.fill(0);
        completedStages.clear();
        ui.completionScreen.classList.add("hidden");
        renderStage();
        showFeedback("Game restarted. All missions are ready to play again.", true);
    } catch {
        ui.sendButton.disabled = sendWasDisabled;
        showFeedback("Could not restart the game. Try again.", false);
    } finally {
        busy = false;
        ui.restartButton.disabled = false;
    }
}

ui.sendButton.addEventListener("click", sendRequest);
ui.restartButton.addEventListener("click", restartGame);
ui.clearButton.addEventListener("click", () => { clearRequest(); resetOutput(); });
ui.nextButton.addEventListener("click", () => {
    if (busy) return;
    if (currentStage < stages.length - 1) { currentStage++; renderStage(); }
});
ui.previousButton.addEventListener("click", () => {
    if (busy) return;
    if (currentStage > 0) { currentStage--; renderStage(); }
});
ui.guideButton.addEventListener("click", () => ui.guideModal.classList.remove("hidden"));
ui.closeGuideButton.addEventListener("click", () => ui.guideModal.classList.add("hidden"));
ui.guideModal.addEventListener("click", event => {
    if (event.target === ui.guideModal) ui.guideModal.classList.add("hidden");
});
ui.closeCompletionButton.addEventListener("click", () => ui.completionScreen.classList.add("hidden"));

renderStage();

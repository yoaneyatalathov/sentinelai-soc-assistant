
(function () {
    "use strict";

    let alerts = [];

    const elements = {
        totalAlerts: document.getElementById("total-alerts"),
        highAlerts: document.getElementById("high-alerts"),
        totalHosts: document.getElementById("total-hosts"),
        alertRows: document.getElementById("alert-rows"),
        selectedAlert: document.getElementById("selected-alert"),
        connectionStatus: document.getElementById("connection-status"),
        apiStatus: document.getElementById("api-status"),
        wazuhStatus: document.getElementById("wazuh-status"),
        sourceApiStatus: document.getElementById("source-api-status"),
        refreshButton: document.getElementById("refresh-button")
    };

    // Get nested values from alert objects
    function getField(alert, paths, fallback = "-") {
        for (const path of paths) {
            const value = path.split(".").reduce(
                (obj, key) => obj?.[key],
                alert
            );

            if (value !== undefined && value !== null && value !== "") {
                return value;
            }
        }

        return fallback;
    }

    // Determine alert severity from Wazuh rule level
    function getSeverity(level) {
        const value = Number(level);

        if (value >= 12) return "Critical";
        if (value >= 10) return "High";
        if (value >= 7) return "Medium";

        return "Low";
    }

    function getSeverityClass(severity) {
        return severity.toLowerCase();
    }

    // Format Wazuh timestamp into readable WIB format
    function formatTimestamp(timestamp) {
        if (!timestamp || timestamp === "-") {
            return "-";
        }

        const normalized = timestamp.replace(
            /([+-]\d{2})(\d{2})$/,
            "$1:$2"
        );

        const date = new Date(normalized);

        if (Number.isNaN(date.getTime())) {
            return timestamp;
        }

        return new Intl.DateTimeFormat("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
            timeZone: "Asia/Jakarta",
            timeZoneName: "short"
        }).format(date);
    }

    // Escape HTML to prevent HTML injection
    function escapeHTML(value) {
        return String(value).replace(/[&<>"']/g, (char) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]);
    }

    // Normalize Wazuh alert information
    function getAlertInfo(alert) {
        const ruleLevel = getField(alert, ["rule.level"], 0);

        return {
            timestamp: getField(alert, ["timestamp"]),
            ruleId: getField(alert, ["rule.id"]),
            description: getField(
                alert,
                ["rule.description"],
                "No description"
            ),
            level: Number(ruleLevel) || 0,
            severity: getSeverity(ruleLevel),
            agent: getField(alert, ["agent.name"], "Unknown"),
            agentId: getField(alert, ["agent.id"]),
            sourceIp: getField(alert, [
                "data.srcip",
                "data.src_ip",
                "srcip"
            ]),
            fullLocation: getField(alert, ["location"]),
            raw: alert
        };
    }

    // Render dashboard statistics
    function renderStats() {
        if (elements.totalAlerts) {
            elements.totalAlerts.textContent = alerts.length;
        }

        if (elements.highAlerts) {
            elements.highAlerts.textContent = alerts.filter((alert) => {
                const level = Number(
                    getField(alert, ["rule.level"], 0)
                );

                return level >= 10;
            }).length;
        }

        if (elements.totalHosts) {
            const hosts = new Set(
                alerts.map((alert) =>
                    getField(alert, ["agent.name"], "Unknown")
                ).filter((name) => name !== "Unknown")
            );

            elements.totalHosts.textContent = hosts.size;
        }
    }

    // Render security alert table
    function renderAlerts() {
        if (!elements.alertRows) return;

        if (alerts.length === 0) {
            elements.alertRows.innerHTML = `
                <tr>
                    <td colspan="4">No alerts found.</td>
                </tr>
            `;
            return;
        }

        elements.alertRows.innerHTML = alerts.map((alert, index) => {
            const info = getAlertInfo(alert);

            return `
                <tr data-alert-index="${index}" tabindex="0">
                    <td>
                        <span class="pill ${getSeverityClass(info.severity)}">
                            ${escapeHTML(info.severity)}
                        </span>
                    </td>

                    <td>${escapeHTML(info.description)}</td>

                    <td>${escapeHTML(info.agent)}</td>

                    <td>${escapeHTML(formatTimestamp(info.timestamp))}</td>
                </tr>
            `;
        }).join("");

        // Handle alert selection
        elements.alertRows.querySelectorAll("[data-alert-index]")
            .forEach((row) => {
                const selectAlert = () => {
                    const index = Number(row.dataset.alertIndex);
                    renderSelectedAlert(alerts[index]);
                };

                row.addEventListener("click", selectAlert);

                row.addEventListener("keydown", (event) => {
                    if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        selectAlert();
                    }
                });
            });
    }

    // Render selected alert details
    function renderSelectedAlert(alert) {
        if (!elements.selectedAlert || !alert) return;

        const info = getAlertInfo(alert);

        elements.selectedAlert.innerHTML = `
            <div class="alert-detail-row">
                <span class="alert-detail-label">Description</span>
                <span class="alert-detail-value">
                    ${escapeHTML(info.description)}
                </span>
            </div>

            <div class="alert-detail-row">
                <span class="alert-detail-label">Severity</span>
                <span class="alert-detail-value">
                    ${escapeHTML(info.severity)} (Level ${info.level})
                </span>
            </div>

            <div class="alert-detail-row">
                <span class="alert-detail-label">Rule ID</span>
                <span class="alert-detail-value">
                    ${escapeHTML(info.ruleId)}
                </span>
            </div>

            <div class="alert-detail-row">
                <span class="alert-detail-label">Timestamp</span>
                <span class="alert-detail-value">
                    ${escapeHTML(formatTimestamp(info.timestamp))}
                </span>
            </div>

            <div class="alert-detail-row">
                <span class="alert-detail-label">Agent</span>
                <span class="alert-detail-value">
                    ${escapeHTML(info.agent)}
                </span>
            </div>

            <div class="alert-detail-row">
                <span class="alert-detail-label">Agent ID</span>
                <span class="alert-detail-value">
                    ${escapeHTML(info.agentId)}
                </span>
            </div>

            <div class="alert-detail-row">
                <span class="alert-detail-label">Source IP</span>
                <span class="alert-detail-value">
                    ${escapeHTML(info.sourceIp)}
                </span>
            </div>

            <div class="alert-detail-row">
                <span class="alert-detail-label">Location</span>
                <span class="alert-detail-value">
                    ${escapeHTML(info.fullLocation)}
                </span>
            </div>
        `;
    }

    // Update connection status
    function setStatus(status, message) {
        if (elements.connectionStatus) {
            elements.connectionStatus.textContent = message;
        }

        if (elements.apiStatus) {
            elements.apiStatus.textContent = status;
        }

        if (elements.wazuhStatus) {
            elements.wazuhStatus.textContent = status;
        }

        if (elements.sourceApiStatus) {
            elements.sourceApiStatus.textContent = status;
        }
    }

    // Fetch and refresh dashboard data
    async function loadDashboard() {
        setStatus("Connecting", "Connecting to Wazuh API...");

        if (elements.refreshButton) {
            elements.refreshButton.disabled = true;
        }

        if (elements.alertRows) {
            elements.alertRows.innerHTML = `
                <tr>
                    <td colspan="4">Loading alerts...</td>
                </tr>
            `;
        }

        try {
            if (
                !window.SentinelAPI ||
                typeof window.SentinelAPI.fetchAlerts !== "function"
            ) {
                throw new Error(
                    "SentinelAPI.fetchAlerts() is unavailable."
                );
            }

            const data = await window.SentinelAPI.fetchAlerts();

            if (!Array.isArray(data)) {
                throw new Error("Invalid alert data format.");
            }

            alerts = data;

            renderStats();
            renderAlerts();

            if (alerts.length > 0) {
                renderSelectedAlert(alerts[0]);
            } else if (elements.selectedAlert) {
                elements.selectedAlert.textContent = "No alert selected.";
            }

            setStatus("Connected", "Wazuh API connected");

        } catch (error) {
            console.error("Failed to load alerts:", error);

            setStatus("Error", "Unable to connect to Wazuh API");

            if (elements.alertRows) {
                elements.alertRows.innerHTML = `
                    <tr>
                        <td colspan="4">
                            Failed to load alerts. Check the API and browser console.
                        </td>
                    </tr>
                `;
            }

        } finally {
            if (elements.refreshButton) {
                elements.refreshButton.disabled = false;
            }
        }
    }

    // Initialize dashboard
    function init() {
        if (elements.refreshButton) {
            elements.refreshButton.addEventListener(
                "click",
                loadDashboard
            );
        }

        loadDashboard();
    }

    window.SentinelDashboard = {
        loadDashboard
    };

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

})();

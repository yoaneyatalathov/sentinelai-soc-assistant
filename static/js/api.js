
const API_URL = "/api/alerts";

async function fetchAlerts() {
    const response = await fetch(API_URL, {
        method: "GET",
        headers: {
            "Accept": "application/json"
        },
        cache: "no-store"
    });

    if (!response.ok) {
        throw new Error(
            `Gagal mengambil alert: HTTP ${response.status}`
        );
    }

    const data = await response.json();

    // Mendukung respons berupa array langsung atau object berisi alerts.
    if (Array.isArray(data)) {
        return data;
    }

    if (data && Array.isArray(data.alerts)) {
        return data.alerts;
    }

    throw new Error(
        "Format respons API tidak sesuai. Array alert tidak ditemukan."
    );
}

// Agar dapat digunakan oleh app.js dan dashboard.js
window.SentinelAPI = {
    fetchAlerts
};

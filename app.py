
from pathlib import Path
import json

from flask import Flask, jsonify, render_template

app = Flask(__name__)

BASE_DIR = Path(__file__).resolve().parent
ALERTS_FILE = BASE_DIR / "data" / "demo_alerts.json"


def load_alerts():
    """Load alerts from the configured JSON file."""
    if not ALERTS_FILE.exists():
        return []

    try:
        with ALERTS_FILE.open("r", encoding="utf-8") as file:
            data = json.load(file)

        # Wazuh alerts may be stored as a JSON array
        # or as an object containing an "alerts" array.
        if isinstance(data, list):
            return data

        if isinstance(data, dict) and isinstance(data.get("alerts"), list):
            return data["alerts"]

        return []

    except (json.JSONDecodeError, OSError) as error:
        app.logger.error("Failed to read alerts: %s", error)
        return []


@app.route("/")
def index():
    return render_template("index.html")


@app.route("/api/alerts", methods=["GET"])
def get_alerts():
    alerts = load_alerts()

    return jsonify({
        "count": len(alerts),
        "alerts": alerts
    })


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "service": "SentinelAI SOC Assistant"
    })


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=False
    )


# SentinelAI SOC Assistant

A lightweight Security Operations Center (SOC) dashboard project designed to display and monitor security alerts from Wazuh.

The initial goal is simple: retrieve alert data through an API and present it in a clear dashboard for security monitoring and investigation.

## Project Goals

- Retrieve and display Wazuh security alerts.
- Show alert severity, rule ID, timestamp, and affected endpoint.
- Provide basic alert statistics.
- Display details of a selected alert.
- Establish a foundation for future SOC investigation and analysis features.

## Current Scope

The current version focuses on the dashboard and alert display.

AI-powered analysis, automated incident response, and advanced threat detection are not yet implemented.

**Important:** The current Flask backend reads JSON data from `data/demo_alerts.json`. This does not automatically retrieve live alerts from Wazuh. Live integration requires a configured data source.

## Technology Stack

- Python
- Flask
- HTML
- CSS
- JavaScript
- Wazuh (planned live alert source)

## Project Structure

```text
sentinelai-soc-assistant/
├── app.py
├── requirements.txt
├── render.yaml
├── README.md
├── .gitignore
├── data/
│   └── demo_alerts.json
├── templates/
│   └── index.html
└── static/
    ├── css/
    │   └── styles.css
    └── js/
        ├── app.js
        ├── api.js
        ├── analyzer.js
        └── dashboard.js
```

## Requirements

- Python 3.10 or later
- pip

## Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/sentinelai-soc-assistant.git
cd sentinelai-soc-assistant
```

Replace `YOUR_USERNAME` with your GitHub username.

### 2. Create a virtual environment

Windows:

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
```

Linux:

```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Start the application

```bash
python app.py
```

Open the following address in your browser:

http://127.0.0.1:5000

## API Endpoints

### GET `/api/alerts`

Returns alerts loaded from the configured JSON file.

Example response:

```json
{
  "count": 1,
  "alerts": [
    {
      "timestamp": "2026-10-25T09:11:18.385+0700",
      "rule": {
        "id": "61017",
        "level": 9,
        "description": "Example security event"
      },
      "agent": {
        "id": "001",
        "name": "WINDOWS-ENDPOINT"
      }
    }
  ]
}
```

The example above is illustrative. Actual responses depend on the contents of the configured JSON file.

### GET `/api/health`

Returns a basic application health status.

## Deployment

A `render.yaml` configuration is included for deployment on Render.

The current configuration deploys the Flask application, but it does not establish connectivity to a Wazuh instance running on a private local network.

For live Wazuh integration, a secure and reachable data source must be configured.

## Security Considerations

- Never commit passwords, API keys, tokens, or other secrets.
- Do not publish real security logs containing sensitive information.
- Use sanitized sample alerts for public demonstrations.
- Do not expose Wazuh management interfaces directly to the public internet.
- Configure authentication and access controls before using this dashboard with sensitive production data.

## Roadmap

- [x] Flask dashboard backend
- [x] Basic alert API endpoint
- [x] Dashboard alert rendering
- [ ] Validate end-to-end dashboard functionality
- [ ] Integrate live Wazuh alert data
- [ ] Add alert investigation and analysis features
- [ ] Evaluate AI-assisted alert triage

## Disclaimer

This project is intended for educational purposes and cybersecurity portfolio development. It is not a replacement for a production-grade SIEM or SOC platform.

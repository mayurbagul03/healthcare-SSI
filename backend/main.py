from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import requests
import json

app = FastAPI(title="Healthcare SSI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

DOCTOR_AGENT     = "http://localhost:8001"
UNIVERSITY_AGENT = "http://localhost:8003"
PATIENT_AGENT    = "http://localhost:8005"

# ─── HEALTH CHECK ─────────────────────────────────────────────
@app.get("/")
def health_check():
    return {"status": "Backend is running!"}

# ─── DOCTOR ENDPOINTS ─────────────────────────────────────────
@app.get("/doctor/did")
def get_doctor_did():
    try:
        res = requests.get(f"{DOCTOR_AGENT}/wallet/did/public", timeout=5)
        return res.json()
    except Exception as e:
        return {"error": str(e)}

@app.post("/doctor/create-invitation")
def doctor_create_invitation():
    try:
        res = requests.post(
            f"{DOCTOR_AGENT}/connections/create-invitation",
            params={"auto_accept": "true"},
            json={"alias": "Doctor-Invitation"},
            timeout=5
        )
        data = res.json()
        # Fix serviceEndpoint: replace host.docker.internal with localhost
        inv_str = json.dumps(data)
        inv_str = inv_str.replace("host.docker.internal", "localhost")
        return json.loads(inv_str)
    except Exception as e:
        return {"error": str(e)}

@app.get("/doctor/connections")
def doctor_connections():
    try:
        res = requests.get(f"{DOCTOR_AGENT}/connections", timeout=5)
        return res.json()
    except Exception as e:
        return {"error": str(e)}

@app.post("/doctor/accept-request/{connection_id}")
def doctor_accept_request(connection_id: str):
    try:
        res = requests.post(
            f"{DOCTOR_AGENT}/connections/{connection_id}/accept-request",
            timeout=5
        )
        return res.json()
    except Exception as e:
        return {"error": str(e)}

# ─── UNIVERSITY ENDPOINTS ──────────────────────────────────────
@app.get("/university/did")
def get_university_did():
    try:
        res = requests.get(f"{UNIVERSITY_AGENT}/wallet/did/public", timeout=5)
        return res.json()
    except Exception as e:
        return {"error": str(e)}

@app.get("/university/connections")
def university_connections():
    try:
        res = requests.get(f"{UNIVERSITY_AGENT}/connections", timeout=5)
        return res.json()
    except Exception as e:
        return {"error": str(e)}

@app.post("/university/receive-invitation")
def university_receive_invitation(invitation: dict):
    try:
        # Fix serviceEndpoint just in case
        inv_str = json.dumps(invitation)
        inv_str = inv_str.replace("host.docker.internal", "localhost")
        fixed_invitation = json.loads(inv_str)

        res = requests.post(
            f"{UNIVERSITY_AGENT}/connections/receive-invitation",
            params={"auto_accept": "true"},
            json=fixed_invitation,
            timeout=5
        )
        return res.json()
    except Exception as e:
        return {"error": str(e)}

@app.post("/university/accept-invitation/{connection_id}")
def university_accept_invitation(connection_id: str):
    try:
        res = requests.post(
            f"{UNIVERSITY_AGENT}/connections/{connection_id}/accept-invitation",
            timeout=5
        )
        return res.json()
    except Exception as e:
        return {"error": str(e)}

# ─── PATIENT ENDPOINTS ────────────────────────────────────────
@app.get("/patient/did")
def get_patient_did():
    try:
        res = requests.get(f"{PATIENT_AGENT}/wallet/did/public", timeout=5)
        return res.json()
    except Exception as e:
        return {"error": str(e)}

@app.get("/patient/connections")
def get_patient_connections():
    try:
        res = requests.get(f"{PATIENT_AGENT}/connections", timeout=5)
        return res.json()
    except Exception as e:
        return {"error": str(e)}

@app.post("/patient/receive-invitation")
def patient_receive_invitation(invitation: dict):
    try:
        # Fix serviceEndpoint just in case
        inv_str = json.dumps(invitation)
        inv_str = inv_str.replace("host.docker.internal", "localhost")
        fixed_invitation = json.loads(inv_str)

        res = requests.post(
            f"{PATIENT_AGENT}/connections/receive-invitation",
            params={"auto_accept": "true"},
            json=fixed_invitation,
            timeout=5
        )
        return res.json()
    except Exception as e:
        return {"error": str(e)}

@app.post("/patient/accept-invitation/{connection_id}")
def patient_accept_invitation(connection_id: str):
    try:
        res = requests.post(
            f"{PATIENT_AGENT}/connections/{connection_id}/accept-invitation",
            timeout=5
        )
        return res.json()
    except Exception as e:
        return {"error": str(e)}

# ─── CONNECTION STATUS CHECK ───────────────────────────────────
@app.get("/status/connections")
def all_connections_status():
    """Check all active connections across all agents"""
    result = {}
    for name, url in [("doctor", DOCTOR_AGENT), ("university", UNIVERSITY_AGENT), ("patient", PATIENT_AGENT)]:
        try:
            res = requests.get(f"{url}/connections", timeout=5)
            conns = res.json().get("results", [])
            result[name] = [
                {"id": c["connection_id"][:8], "state": c["state"], "with": c.get("their_label", "?")}
                for c in conns
            ]
        except Exception as e:
            result[name] = {"error": str(e)}
    return result

# ─── MANUAL ACCEPT ALL PENDING ────────────────────────────────
@app.post("/doctor/accept-all-pending")
def doctor_accept_all_pending():
    """Accept all pending connection requests on Doctor side"""
    try:
        res = requests.get(f"{DOCTOR_AGENT}/connections", timeout=5)
        conns = res.json().get("results", [])
        accepted = []
        for c in conns:
            if c["state"] == "request":
                r = requests.post(
                    f"{DOCTOR_AGENT}/connections/{c['connection_id']}/accept-request",
                    timeout=5
                )
                accepted.append({"id": c["connection_id"][:8], "result": r.json().get("state")})
        return {"accepted": accepted, "count": len(accepted)}
    except Exception as e:
        return {"error": str(e)}

@app.post("/university/accept-all-pending")
def university_accept_all_pending():
    """Accept all pending connection requests on University side"""
    try:
        res = requests.get(f"{UNIVERSITY_AGENT}/connections", timeout=5)
        conns = res.json().get("results", [])
        accepted = []
        for c in conns:
            if c["state"] == "request":
                r = requests.post(
                    f"{UNIVERSITY_AGENT}/connections/{c['connection_id']}/accept-request",
                    timeout=5
                )
                accepted.append({"id": c["connection_id"][:8], "result": r.json().get("state")})
        return {"accepted": accepted, "count": len(accepted)}
    except Exception as e:
        return {"error": str(e)}